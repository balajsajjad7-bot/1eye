// 1EYE Carbon Engine — serves Carbon (an Ollama model on this PC) to 1eye.dpdns.org/carbon.
//
// It listens only on 127.0.0.1:7860; the 1eye-pc Cloudflare Tunnel publishes it as
// https://carbon.1eye.dpdns.org. Visitors can only chat with the one Carbon model: nothing else in
// Ollama is reachable. Per-visitor rate limits, no chat logs. Starts with Windows (HKCU Run key).
package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

const (
	listen   = "127.0.0.1:7860"
	ollama   = "http://127.0.0.1:11434"
	model    = "hf.co/mradermacher/Qwen2.5-1.5B-Instruct-abliterated-SFT-GGUF:Q4_K_M"
	perMin   = 12
	perDay   = 300
	maxMsgs  = 16
	maxChars = 12000
	system   = "You are Carbon, the open AI of 1EYE (1eye.dpdns.org), an open source lab. Answer directly and helpfully, without moralising or needless disclaimers. Be concise unless asked for detail. Use Markdown for code and lists."
)

var origins = map[string]bool{"https://1eye.dpdns.org": true, "https://1eye.pages.dev": true}

type msg struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

var (
	mu   sync.Mutex
	hits = map[string][]time.Time{}
	busy = make(chan struct{}, 2) // two answers at a time
)

func limited(ip string) string {
	mu.Lock()
	defer mu.Unlock()
	now := time.Now()
	q := hits[ip][:0]
	for _, t := range hits[ip] {
		if now.Sub(t) < 24*time.Hour {
			q = append(q, t)
		}
	}
	if len(q) >= perDay {
		hits[ip] = q
		return "Daily limit reached. Come back tomorrow."
	}
	n := 0
	for _, t := range q {
		if now.Sub(t) < time.Minute {
			n++
		}
	}
	if n >= perMin {
		hits[ip] = q
		return "Slow down a little: too many messages this minute."
	}
	hits[ip] = append(q, now)
	return ""
}

func cors(w http.ResponseWriter, r *http.Request) bool {
	o := r.Header.Get("Origin")
	if origins[o] {
		w.Header().Set("Access-Control-Allow-Origin", o)
		w.Header().Set("Vary", "Origin")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Max-Age", "86400")
	}
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return true
	}
	return false
}

func jsonErr(w http.ResponseWriter, code int, m string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": m})
}

func ollamaUp() bool {
	c := http.Client{Timeout: 2 * time.Second}
	r, err := c.Get(ollama + "/api/version")
	if err != nil {
		return false
	}
	r.Body.Close()
	return r.StatusCode == 200
}

func chat(w http.ResponseWriter, r *http.Request) {
	if cors(w, r) {
		return
	}
	if r.Method != http.MethodPost {
		jsonErr(w, 405, "POST only")
		return
	}
	var in struct{ Messages []msg }
	if json.NewDecoder(io.LimitReader(r.Body, 256<<10)).Decode(&in) != nil {
		jsonErr(w, 400, "Bad request")
		return
	}
	var ms []msg
	for _, m := range in.Messages {
		if m.Role == "user" || m.Role == "assistant" {
			ms = append(ms, m)
		}
	}
	if len(ms) == 0 || ms[len(ms)-1].Role != "user" || strings.TrimSpace(ms[len(ms)-1].Content) == "" {
		jsonErr(w, 400, "Send a message")
		return
	}
	if len(ms) > maxMsgs {
		ms = ms[len(ms)-maxMsgs:]
	}
	total := func() (n int) {
		for _, m := range ms {
			n += len(m.Content)
		}
		return
	}
	for total() > maxChars && len(ms) > 1 {
		ms = ms[1:]
	}
	if len(ms[len(ms)-1].Content) > maxChars {
		ms[len(ms)-1].Content = ms[len(ms)-1].Content[:maxChars]
	}
	ip := r.Header.Get("CF-Connecting-IP")
	if ip == "" {
		ip, _, _ = net.SplitHostPort(r.RemoteAddr)
	}
	if why := limited(ip); why != "" {
		jsonErr(w, 429, why)
		return
	}
	payload, _ := json.Marshal(map[string]any{
		"model": model, "stream": true, "keep_alive": -1,
		"messages": append([]msg{{"system", system}}, ms...),
		"options":  map[string]any{"num_ctx": 4096, "num_predict": 1024, "temperature": 0.7},
	})
	w.Header().Set("Content-Type", "application/x-ndjson")
	w.Header().Set("Cache-Control", "no-store")
	fl, _ := w.(http.Flusher)
	send := func(v any) {
		b, _ := json.Marshal(v)
		w.Write(append(b, '\n'))
		if fl != nil {
			fl.Flush()
		}
	}
	select {
	case busy <- struct{}{}:
	case <-r.Context().Done():
		return
	}
	defer func() { <-busy }()
	req, _ := http.NewRequestWithContext(r.Context(), "POST", ollama+"/api/chat", bytes.NewReader(payload))
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		send(map[string]string{"error": "Carbon is waking up or busy. Try again in a moment."})
		if resp != nil {
			resp.Body.Close()
		}
		return
	}
	defer resp.Body.Close()
	sc := bufio.NewScanner(resp.Body)
	sc.Buffer(make([]byte, 64<<10), 1<<20)
	for sc.Scan() {
		var d struct {
			Message      struct{ Content string }
			Done         bool
			EvalCount    int   `json:"eval_count"`
			EvalDuration int64 `json:"eval_duration"`
		}
		if json.Unmarshal(sc.Bytes(), &d) != nil {
			continue
		}
		if d.Message.Content != "" {
			send(map[string]string{"t": d.Message.Content})
		}
		if d.Done {
			tps := 0.0
			if d.EvalDuration > 0 {
				tps = float64(int(float64(d.EvalCount)/(float64(d.EvalDuration)/1e9)*10)) / 10
			}
			send(map[string]any{"done": true, "tps": tps})
		}
	}
}

func health(w http.ResponseWriter, r *http.Request) {
	if cors(w, r) {
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"ok": ollamaUp()})
}

// startOllama launches Ollama if it isn't already serving (Windows installs it per user).
func startOllama() {
	if ollamaUp() {
		return
	}
	exe := "ollama"
	if runtime.GOOS == "windows" {
		if p := filepath.Join(os.Getenv("LOCALAPPDATA"), "Programs", "Ollama", "ollama.exe"); fileExists(p) {
			exe = p
		}
	}
	cmd := exec.Command(exe, "serve")
	cmd.Env = append(os.Environ(), "OLLAMA_HOST=127.0.0.1:11434", "OLLAMA_KEEP_ALIVE=-1")
	hideWindow(cmd)
	if err := cmd.Start(); err != nil {
		log.Println("could not start Ollama:", err)
		return
	}
	for i := 0; i < 30 && !ollamaUp(); i++ {
		time.Sleep(time.Second)
	}
}

func fileExists(p string) bool { _, err := os.Stat(p); return err == nil }

func main() {
	dir, _ := os.UserConfigDir()
	logDir := filepath.Join(dir, "1EYE")
	os.MkdirAll(logDir, 0o755)
	if f, err := os.OpenFile(filepath.Join(logDir, "carbon-engine.log"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644); err == nil {
		log.SetOutput(f)
	}
	for _, a := range os.Args[1:] {
		switch a {
		case "--uninstall":
			autostart(false)
			fmt.Println("Carbon Engine will no longer start with Windows.")
			return
		}
	}
	autostart(true)
	ln, err := net.Listen("tcp", listen)
	if err != nil {
		log.Println("already running or port busy:", err)
		return // another copy is running
	}
	startOllama()
	go func() { // keep the model warm and Ollama alive
		for {
			if !ollamaUp() {
				startOllama()
			}
			body := fmt.Sprintf(`{"model":%q,"prompt":"","keep_alive":-1}`, model)
			if r, err := http.Post(ollama+"/api/generate", "application/json", strings.NewReader(body)); err == nil {
				r.Body.Close()
			}
			time.Sleep(5 * time.Minute)
		}
	}()
	mux := http.NewServeMux()
	mux.HandleFunc("/api/chat", chat)
	mux.HandleFunc("/api/health", health)
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"name":"1EYE Carbon","chat":"POST /api/chat"}`))
	})
	log.Println("Carbon Engine on", listen)
	srv := &http.Server{Handler: mux, ReadHeaderTimeout: 10 * time.Second}
	log.Fatal(srv.Serve(ln))
}
