package main

// 1EYE AI — an assistant powered by Groq (OpenAI-compatible API).
// The API key lives only on the host (1EYE_Data/data.json, 0600) and is never sent to any device.

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"
	"unicode/utf8"
)

type aiConf struct {
	Key          string `json:"key"`
	Model        string `json:"model"`
	AllowDevices bool   `json:"allowDevices"`
	InChat       bool   `json:"inChat"`
}

var (
	ai       aiConf
	aiLimMu  sync.Mutex
	aiCalls  = map[string][]int64{} // device id -> recent call times
	aiBusy   bool
	groqBase = func() string {
		if b := os.Getenv("ONEEYE_GROQ_BASE"); b != "" {
			return strings.TrimRight(b, "/")
		}
		return "https://api.groq.com/openai/v1"
	}()
)

const defaultModel = "openai/gpt-oss-120b"

var aiModels = []map[string]string{
	{"id": "openai/gpt-oss-120b", "name": "GPT-OSS 120B · smartest"},
	{"id": "openai/gpt-oss-20b", "name": "GPT-OSS 20B · fastest"},
}

func aiModel() string {
	if strings.TrimSpace(ai.Model) != "" {
		return strings.TrimSpace(ai.Model)
	}
	return defaultModel
}

func keyHint(k string) string {
	if len(k) < 10 {
		return ""
	}
	return k[:4] + "…" + k[len(k)-4:]
}

// state for sync (mu held by caller)
func aiPublicState(host bool) map[string]any {
	st := map[string]any{"available": ai.Key != "" && (host || ai.AllowDevices), "inChat": ai.Key != "" && ai.InChat}
	if host {
		st["configured"] = ai.Key != ""
		st["model"] = aiModel()
		st["models"] = aiModels
		st["allowDevices"] = ai.AllowDevices
		st["keyHint"] = keyHint(ai.Key)
	}
	return st
}

// ---------------------------------------------------------------- Groq call

type chatMsg struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

func groqChat(msgs []chatMsg, maxTokens int) (string, error) {
	mu.Lock()
	key, model := ai.Key, aiModel()
	mu.Unlock()
	if key == "" {
		return "", fmt.Errorf("AI is not set up yet — add a Groq key in Control → AI")
	}
	body := map[string]any{"model": model, "messages": msgs, "temperature": 0.6, "max_completion_tokens": maxTokens}
	if strings.Contains(model, "gpt-oss") {
		body["reasoning_effort"] = "low"
		body["include_reasoning"] = false
	}
	try := func(b map[string]any) (int, []byte, error) {
		buf, _ := json.Marshal(b)
		req, _ := http.NewRequest("POST", groqBase+"/chat/completions", bytes.NewReader(buf))
		req.Header.Set("Authorization", "Bearer "+key)
		req.Header.Set("Content-Type", "application/json")
		resp, err := (&http.Client{Timeout: 90 * time.Second}).Do(req)
		if err != nil {
			return 0, nil, err
		}
		defer resp.Body.Close()
		out, _ := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
		return resp.StatusCode, out, nil
	}
	code, out, err := try(body)
	if err == nil && code == 400 && (bytes.Contains(out, []byte("reasoning")) || bytes.Contains(out, []byte("include_reasoning"))) {
		delete(body, "reasoning_effort")
		delete(body, "include_reasoning")
		code, out, err = try(body)
	}
	if err != nil {
		return "", fmt.Errorf("can't reach Groq (%v) — check your internet", err)
	}
	var r struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
		Error struct {
			Message string `json:"message"`
		} `json:"error"`
	}
	json.Unmarshal(out, &r)
	switch {
	case code == 401:
		return "", fmt.Errorf("Groq rejected the key — check it in Control → AI")
	case code == 429:
		return "", fmt.Errorf("Groq's rate limit was hit — wait a minute and try again")
	case code == 404:
		return "", fmt.Errorf("model %q isn't available on your Groq account — pick another in Control → AI", model)
	case code >= 400:
		m := r.Error.Message
		if m == "" {
			m = fmt.Sprintf("HTTP %d", code)
		}
		return "", fmt.Errorf("Groq error: %s", m)
	}
	if len(r.Choices) == 0 || strings.TrimSpace(r.Choices[0].Message.Content) == "" {
		return "", fmt.Errorf("Groq sent an empty answer — try again")
	}
	return strings.TrimSpace(r.Choices[0].Message.Content), nil
}

// ---------------------------------------------------------------- context

var textExt = map[string]bool{".txt": true, ".md": true, ".csv": true, ".json": true, ".log": true, ".xml": true, ".yml": true,
	".yaml": true, ".ini": true, ".html": true, ".htm": true, ".css": true, ".js": true, ".ts": true, ".py": true, ".go": true,
	".java": true, ".c": true, ".cpp": true, ".h": true, ".sql": true, ".sh": true, ".bat": true, ".ps1": true, ".srt": true, ".vtt": true}

func isTextFile(name string) bool { return textExt[strings.ToLower(filepath.Ext(name))] }

func clip(s string, n int) string {
	if len(s) <= n {
		return s
	}
	s = s[:n]
	for !utf8.ValidString(s) && len(s) > 0 {
		s = s[:len(s)-1]
	}
	return s + "\n…[cut]"
}

func systemPrompt(user string) string {
	return "You are 1EYE AI, the assistant built into 1EYE — Telepathic Data Transfer, an app that moves files, chat messages and links " +
		"between a person's own phone and PC (Wi-Fi or anywhere). You were added by its maker, Balaj. You are talking with " + user + ". " +
		"Be concise, warm and practical. Use short paragraphs and simple Markdown (bold, lists, `code`). " +
		"When given files, chat history or links as context, answer from them and say when something isn't in them. " +
		"You cannot move, open or delete files yourself; tell the user which button in 1EYE does it. Today is " + time.Now().Format("Mon 2 Jan 2006") + "."
}

func buildContext(withChat, withLinks, withFiles bool, attach []string) string {
	var b strings.Builder
	mu.Lock()
	ch := append([]Msg{}, chat...)
	ls := append([]Link{}, links...)
	fs := append([]FileInfo{}, files...)
	mu.Unlock()
	if withFiles {
		b.WriteString("## Shared files (newest first)\n")
		for i, f := range fs {
			if i == 40 {
				fmt.Fprintf(&b, "…and %d more\n", len(fs)-40)
				break
			}
			fmt.Fprintf(&b, "- %s (%s, %s)\n", f.Name, f.Kind, humanBytes(f.Size))
		}
		b.WriteString("\n")
	}
	if withChat {
		b.WriteString("## Recent chat between the devices\n")
		if len(ch) > 30 {
			ch = ch[len(ch)-30:]
		}
		for _, m := range ch {
			fmt.Fprintf(&b, "[%s] %s: %s\n", time.UnixMilli(m.TS).Format("Jan 2 15:04"), m.Name, clip(m.Text, 600))
		}
		b.WriteString("\n")
	}
	if withLinks {
		b.WriteString("## Saved links\n")
		if len(ls) > 30 {
			ls = ls[len(ls)-30:]
		}
		for _, l := range ls {
			fmt.Fprintf(&b, "- %s %s\n", l.URL, l.Note)
		}
		b.WriteString("\n")
	}
	budget := 14000
	for _, name := range attach {
		name = safeName(name)
		if !isTextFile(name) {
			fmt.Fprintf(&b, "## File %s\n(Only text files can be read; this one was skipped.)\n\n", name)
			continue
		}
		raw, err := os.ReadFile(filepath.Join(sharedDir, name))
		if err != nil {
			continue
		}
		if !utf8.Valid(raw) {
			raw = bytes.ToValidUTF8(raw, []byte("?"))
		}
		t := clip(string(raw), budget)
		budget -= len(t)
		fmt.Fprintf(&b, "## File %s\n```\n%s\n```\n\n", name, t)
		if budget < 500 {
			break
		}
	}
	return b.String()
}

func humanBytes(n int64) string {
	f := float64(n)
	for _, u := range []string{"B", "KB", "MB", "GB"} {
		if f < 1024 {
			if u == "B" {
				return fmt.Sprintf("%.0f B", f)
			}
			return fmt.Sprintf("%.1f %s", f, u)
		}
		f /= 1024
	}
	return fmt.Sprintf("%.1f TB", f)
}

// 20 requests per device per minute
func aiAllowed(id string) bool {
	aiLimMu.Lock()
	defer aiLimMu.Unlock()
	now := time.Now().Unix()
	var keep []int64
	for _, t := range aiCalls[id] {
		if now-t < 60 {
			keep = append(keep, t)
		}
	}
	if len(keep) >= 20 {
		aiCalls[id] = keep
		return false
	}
	aiCalls[id] = append(keep, now)
	return true
}

// ---------------------------------------------------------------- handlers

func handleAI(w http.ResponseWriter, r *http.Request) {
	d, ok := who(r)
	if !ok || r.Method != "POST" {
		w.WriteHeader(401)
		return
	}
	host := d == nil
	mu.Lock()
	allowed := ai.Key != "" && (host || ai.AllowDevices)
	mu.Unlock()
	if !allowed {
		writeJSON(w, map[string]any{"ok": false, "err": "1EYE AI is off on this host"})
		return
	}
	id, name := whoName(d)
	if !aiAllowed(id) {
		writeJSON(w, map[string]any{"ok": false, "err": "Slow down — 20 AI requests a minute per device"})
		return
	}
	var in struct {
		Messages []chatMsg `json:"messages"`
		Chat     bool      `json:"chat"`
		Links    bool      `json:"links"`
		Files    bool      `json:"files"`
		Attach   []string  `json:"attach"`
	}
	if json.NewDecoder(io.LimitReader(r.Body, 300000)).Decode(&in) != nil || len(in.Messages) == 0 {
		w.WriteHeader(400)
		return
	}
	// keep the last turns, user/assistant only, clipped
	var conv []chatMsg
	start := 0
	if len(in.Messages) > 16 {
		start = len(in.Messages) - 16
	}
	for _, m := range in.Messages[start:] {
		if m.Role != "user" && m.Role != "assistant" {
			continue
		}
		conv = append(conv, chatMsg{m.Role, clip(m.Content, 6000)})
	}
	if len(in.Attach) > 3 {
		in.Attach = in.Attach[:3]
	}
	sys := systemPrompt(name)
	if ctx := buildContext(in.Chat, in.Links, in.Files, in.Attach); ctx != "" {
		sys += "\n\n# Context from this 1EYE\n" + ctx
	}
	reply, err := groqChat(append([]chatMsg{{"system", sys}}, conv...), 1500)
	if err != nil {
		writeJSON(w, map[string]any{"ok": false, "err": err.Error()})
		return
	}
	writeJSON(w, map[string]any{"ok": true, "reply": reply, "model": aiModel()})
}

var mentionRe = regexp.MustCompile(`(?i)^\s*@(eye|ai|1eye)\b[:,]?\s*`)

// called after a chat message is stored: "@eye question" gets an answer in the channel
func maybeChatAI(m Msg) {
	if !mentionRe.MatchString(m.Text) {
		return
	}
	mu.Lock()
	on := ai.Key != "" && ai.InChat
	if !on || aiBusy {
		mu.Unlock()
		return
	}
	aiBusy = true
	hist := append([]Msg{}, chat...)
	mu.Unlock()
	defer func() { mu.Lock(); aiBusy = false; mu.Unlock() }()
	if !aiAllowed("chat:" + m.From) {
		return
	}
	if len(hist) > 15 {
		hist = hist[len(hist)-15:]
	}
	var conv []chatMsg
	for _, h := range hist {
		role := "user"
		txt := h.Name + ": " + h.Text
		if h.From == "ai" {
			role, txt = "assistant", h.Text
		}
		conv = append(conv, chatMsg{role, clip(txt, 1500)})
	}
	sys := systemPrompt("the people in this 1EYE chat channel") + " Reply to the latest message that mentions you. Keep it under 120 words."
	reply, err := groqChat(append([]chatMsg{{"system", sys}}, conv...), 700)
	if err != nil {
		reply = "⚠ " + err.Error()
	}
	mu.Lock()
	chat = append(chat, Msg{rid(), "ai", "1EYE AI", reply, now()})
	save()
	bump()
	mu.Unlock()
}

func handleHostAI(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Key          *string `json:"key"`
		Model        *string `json:"model"`
		AllowDevices *bool   `json:"allowDevices"`
		InChat       *bool   `json:"inChat"`
		Clear        bool    `json:"clear"`
		Test         bool    `json:"test"`
	}
	readJSON(r, &in)
	mu.Lock()
	if in.Clear {
		ai = aiConf{}
	}
	if in.Key != nil {
		k := strings.TrimSpace(*in.Key)
		if k != "" {
			ai.Key = k
			if ai.Model == "" {
				ai.Model = defaultModel
			}
			if in.InChat == nil && !ai.InChat {
				ai.InChat = true
			}
		}
	}
	if in.Model != nil {
		ai.Model = strings.TrimSpace(*in.Model)
	}
	if in.AllowDevices != nil {
		ai.AllowDevices = *in.AllowDevices
	}
	if in.InChat != nil {
		ai.InChat = *in.InChat
	}
	save()
	bump()
	mu.Unlock()
	if in.Clear {
		logf("AI  key removed")
	} else if in.Key != nil {
		logf("AI  key saved (%s)", aiModel())
	}
	if in.Test {
		reply, err := groqChat([]chatMsg{{"system", "Reply with exactly: 1EYE AI online."}, {"user", "ping"}}, 40)
		if err != nil {
			writeJSON(w, map[string]any{"ok": false, "err": err.Error()})
			return
		}
		writeJSON(w, map[string]any{"ok": true, "reply": reply})
		return
	}
	writeJSON(w, map[string]any{"ok": true})
}

var _ = sort.Strings
