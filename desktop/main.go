// 1EYE — Telepathic Data Transfer
// Files, chat and links between your devices. Same Wi-Fi or anywhere. One file, nothing to install.
package main

import (
	"archive/tar"
	"archive/zip"
	"compress/gzip"
	"context"
	"crypto/rand"
	"crypto/subtle"
	"embed"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"math/big"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"sort"
	"strings"
	"sync"
	"time"

	qrcode "github.com/skip2/go-qrcode"
)

const version = "1.8"

//go:embed web/*
var webFS embed.FS

// ---------------------------------------------------------------- types

type Device struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Via      string `json:"via"`
	IP       string `json:"ip"`
	Agent    string `json:"agent"`
	Joined   int64  `json:"joined"`
	LastSeen int64  `json:"lastSeen"`
	token    string
}

type Msg struct {
	ID   string `json:"id"`
	From string `json:"from"` // device id ("host" for this PC)
	Name string `json:"name"`
	Text string `json:"text"`
	TS   int64  `json:"ts"`
}

type Link struct {
	ID   string `json:"id"`
	URL  string `json:"url"`
	Note string `json:"note"`
	Name string `json:"name"`
	TS   int64  `json:"ts"`
}

type FileInfo struct {
	Name  string `json:"name"`
	Size  int64  `json:"size"`
	MTime int64  `json:"mtime"`
	Kind  string `json:"kind"`
}

type savedDev struct {
	Token string `json:"token"`
	Device
}

type saved struct {
	Chat    []Msg      `json:"chat"`
	Links   []Link     `json:"links"`
	Devices []savedDev `json:"devices"`
	Pin     string     `json:"pin"`
	Perm    permConf   `json:"permanent"`
	Host    string     `json:"hostName,omitempty"`
	AI      aiConf     `json:"ai"`
	Cloud   cloudConf  `json:"cloud"`
}

// ---------------------------------------------------------------- state

var (
	appDir, sharedDir, dataDir, binDir string
	port                               int
	hostName                           string

	mu            sync.Mutex
	pin           string
	devices       = map[string]*Device{} // token -> device
	chat          []Msg
	links         []Link
	logs          []string
	fails         = map[string][2]int64{}
	files         []FileInfo
	filesSig      string
	publicURL     string
	tunStatus     string
	savedHostName string
	tunStop       func()
	// internet-wide wrong-PIN counter (per-IP limits can be dodged through relays)
	publicFails, publicFailStart, publicLockUntil int64
	tunID                                         int
	pubPort                                       int
	wantOn                                        bool
	provider                                      string
	tunBusy                                       bool

	ver     int64 = 1
	changed       = make(chan struct{})
)

// bump must be called with mu held
func bump() {
	ver++
	close(changed)
	changed = make(chan struct{})
}

func rid() string { b := make([]byte, 8); rand.Read(b); return hex.EncodeToString(b) }
func now() int64  { return time.Now().UnixMilli() }

func newPin() string {
	n, _ := rand.Int(rand.Reader, big.NewInt(1000000))
	return fmt.Sprintf("%06d", n.Int64())
}

func logf(f string, a ...any) {
	mu.Lock()
	defer mu.Unlock()
	logs = append(logs, time.Now().Format("15:04:05  ")+fmt.Sprintf(f, a...))
	if len(logs) > 300 {
		logs = logs[len(logs)-300:]
	}
	bump()
}

func save() { // mu held
	var ds []savedDev
	for t, d := range devices {
		ds = append(ds, savedDev{t, *d})
	}
	b, _ := json.MarshalIndent(saved{chat, links, ds, pin, perm, savedHostName, ai, cloud}, "", " ")
	tmp := filepath.Join(dataDir, "data.json.tmp")
	if os.WriteFile(tmp, b, 0600) == nil {
		os.Rename(tmp, filepath.Join(dataDir, "data.json"))
	}
}

func load() {
	b, err := os.ReadFile(filepath.Join(dataDir, "data.json"))
	if err != nil {
		return
	}
	var s saved
	if json.Unmarshal(b, &s) == nil {
		chat, links = s.Chat, s.Links
		for _, d := range s.Devices {
			dd := d.Device
			dd.token = d.Token
			devices[d.Token] = &dd
		}
		if len(s.Pin) == 6 {
			pin = s.Pin
		}
		perm = s.Perm
		ai = s.AI
		cloud = s.Cloud
		savedHostName = s.Host
	}
}

func lanIP() string {
	// prefer a private address on a Wi-Fi / hotspot / ethernet interface
	if ifs, err := net.Interfaces(); err == nil {
		best, bestScore := "", -1
		for _, in := range ifs {
			if in.Flags&net.FlagUp == 0 || in.Flags&net.FlagLoopback != 0 {
				continue
			}
			addrs, _ := in.Addrs()
			for _, a := range addrs {
				ipn, ok := a.(*net.IPNet)
				if !ok || ipn.IP.To4() == nil || !ipn.IP.IsPrivate() {
					continue
				}
				n := strings.ToLower(in.Name)
				score := 1
				switch {
				case strings.HasPrefix(n, "wlan"), strings.HasPrefix(n, "wi-fi"), strings.HasPrefix(n, "wifi"), strings.HasPrefix(n, "en"), strings.HasPrefix(n, "eth"), strings.HasPrefix(n, "ethernet"):
					score = 3
				case strings.HasPrefix(n, "ap"), strings.HasPrefix(n, "swlan"), strings.HasPrefix(n, "softap"):
					score = 2
				case strings.Contains(n, "vmnet"), strings.Contains(n, "virtualbox"), strings.Contains(n, "vethernet"), strings.HasPrefix(n, "docker"), strings.HasPrefix(n, "br-"), strings.HasPrefix(n, "tun"), strings.HasPrefix(n, "rmnet"):
					score = 0
				}
				if score > bestScore {
					best, bestScore = ipn.IP.String(), score
				}
			}
		}
		if best != "" && bestScore > 0 {
			return best
		}
	}
	c, err := net.Dial("udp", "10.255.255.255:1")
	if err != nil {
		return "127.0.0.1"
	}
	defer c.Close()
	return c.LocalAddr().(*net.UDPAddr).IP.String()
}

var badChars = regexp.MustCompile(`[<>:"|?*\x00-\x1f/\\]`)

func safeName(s string) string {
	s = filepath.Base(strings.ReplaceAll(s, "\\", "/"))
	s = strings.Trim(badChars.ReplaceAllString(s, ""), " .")
	if len(s) > 200 {
		ext := filepath.Ext(s)
		s = s[:200-len(ext)] + ext
	}
	if s == "" {
		s = fmt.Sprintf("file_%d", time.Now().Unix())
	}
	return s
}

func uniquePath(name string) string {
	p := filepath.Join(sharedDir, name)
	ext := filepath.Ext(name)
	root := strings.TrimSuffix(name, ext)
	for i := 1; ; i++ {
		if _, err := os.Stat(p); os.IsNotExist(err) {
			return p
		}
		p = filepath.Join(sharedDir, fmt.Sprintf("%s (%d)%s", root, i, ext))
	}
}

func kindOf(name string) string {
	switch strings.ToLower(filepath.Ext(name)) {
	case ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".heic", ".avif":
		return "image"
	case ".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v", ".3gp":
		return "video"
	case ".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac", ".opus":
		return "audio"
	case ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".md", ".csv", ".rtf", ".odt":
		return "doc"
	case ".zip", ".rar", ".7z", ".tar", ".gz":
		return "archive"
	case ".apk", ".exe", ".msi", ".dmg", ".ipa":
		return "app"
	}
	return "other"
}

func scanFiles() {
	ents, _ := os.ReadDir(sharedDir)
	var out []FileInfo
	var sig strings.Builder
	for _, e := range ents {
		if e.IsDir() || strings.HasSuffix(e.Name(), ".part") || strings.HasPrefix(e.Name(), ".") {
			continue
		}
		i, err := e.Info()
		if err != nil {
			continue
		}
		out = append(out, FileInfo{e.Name(), i.Size(), i.ModTime().UnixMilli(), kindOf(e.Name())})
		fmt.Fprintf(&sig, "%s|%d|%d;", e.Name(), i.Size(), i.ModTime().UnixNano())
	}
	sort.Slice(out, func(a, b int) bool { return out[a].MTime > out[b].MTime })
	if out == nil {
		out = []FileInfo{}
	}
	mu.Lock()
	if sig.String() != filesSig {
		filesSig, files = sig.String(), out
		bump()
	}
	mu.Unlock()
}

// ---------------------------------------------------------------- auth

type ctxKey int

const publicKey ctxKey = 1

// isPublic: request arrived through the internet tunnel entry point (never trusted as host)
func isPublic(r *http.Request) bool { v, _ := r.Context().Value(publicKey).(bool); return v }

func viaNet(r *http.Request) bool { return isPublic(r) || r.Header.Get("Cf-Connecting-Ip") != "" }

func viaStr(r *http.Request) string {
	if viaNet(r) {
		return "internet"
	}
	return "wifi"
}

func clientIP(r *http.Request) string {
	if ip := r.Header.Get("Cf-Connecting-Ip"); ip != "" {
		return ip
	}
	if isPublic(r) {
		if f := r.Header.Get("X-Forwarded-For"); f != "" {
			return strings.TrimSpace(strings.Split(f, ",")[0])
		}
		if f := r.Header.Get("X-Real-Ip"); f != "" {
			return f
		}
		return "internet"
	}
	h, _, _ := net.SplitHostPort(r.RemoteAddr)
	return h
}

// Control panel only on this PC itself: not via Wi-Fi, not via the tunnel.
func isHost(r *http.Request) bool {
	if isPublic(r) {
		return false
	}
	// DNS-rebinding guard: host powers only for requests addressed to a loopback name
	hn := r.Host
	if h, _, err := net.SplitHostPort(r.Host); err == nil {
		hn = h
	}
	if hn != "127.0.0.1" && hn != "localhost" && hn != "::1" && hn != "[::1]" {
		return false
	}
	if viaNet(r) || r.Header.Get("X-Forwarded-For") != "" {
		return false
	}
	h, _, _ := net.SplitHostPort(r.RemoteAddr)
	return h == "127.0.0.1" || h == "::1"
}

// returns device (nil for host) and ok
func who(r *http.Request) (*Device, bool) {
	if isHost(r) {
		return nil, true
	}
	c, err := r.Cookie("eye")
	if err != nil {
		return nil, false
	}
	mu.Lock()
	defer mu.Unlock()
	d := devices[c.Value]
	if d == nil {
		return nil, false
	}
	d.LastSeen = now()
	return d, true
}

func whoName(d *Device) (string, string) {
	if d == nil {
		return "host", hostName
	}
	return d.ID, d.Name
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	json.NewEncoder(w).Encode(v)
}

func readJSON(r *http.Request, v any) error {
	return json.NewDecoder(io.LimitReader(r.Body, 200000)).Decode(v)
}

func guessDevice(ua string) string {
	u := strings.ToLower(ua)
	switch {
	case strings.Contains(u, "iphone"):
		return "iPhone"
	case strings.Contains(u, "ipad"):
		return "iPad"
	case strings.Contains(u, "android"):
		return "Android"
	case strings.Contains(u, "windows"):
		return "Windows PC"
	case strings.Contains(u, "mac os"):
		return "Mac"
	case strings.Contains(u, "linux"):
		return "Linux"
	}
	return "Device"
}

// ---------------------------------------------------------------- tunnel

func cfBinary() string {
	name := "cloudflared"
	if runtime.GOOS == "windows" {
		name += ".exe"
	}
	p := filepath.Join(binDir, name)
	if _, err := os.Stat(p); err == nil {
		return p
	}
	if p, err := exec.LookPath("cloudflared"); err == nil {
		return p
	}
	return ""
}

func setStatus(s string) { mu.Lock(); tunStatus = s; bump(); mu.Unlock() }

func downloadCF() (string, error) {
	arch := "amd64"
	if runtime.GOARCH == "arm64" {
		arch = "arm64"
	}
	base := "https://github.com/cloudflare/cloudflared/releases/latest/download/"
	var u, name string
	switch runtime.GOOS {
	case "windows":
		u, name = base+"cloudflared-windows-"+arch+".exe", "cloudflared.exe"
	case "linux":
		u, name = base+"cloudflared-linux-"+arch, "cloudflared"
	case "darwin":
		u, name = base+"cloudflared-darwin-"+arch+".tgz", "cloudflared"
	default:
		return "", fmt.Errorf("Cloudflare tunnel isn't available on %s", runtime.GOOS)
	}
	os.MkdirAll(binDir, 0755)
	dest := filepath.Join(binDir, name)
	dl := &http.Client{Timeout: 6 * time.Minute}
	resp, err := dl.Get(u)
	if err != nil {
		return "", fmt.Errorf("can't reach GitHub to download the tunnel (%v). Put cloudflared.exe in %s manually", err, binDir)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return "", fmt.Errorf("download failed (%d)", resp.StatusCode)
	}
	f, err := os.Create(dest + ".part")
	if err != nil {
		return "", err
	}
	total, done, last := resp.ContentLength, int64(0), int64(-1)
	buf := make([]byte, 1<<20)
	for {
		n, rerr := resp.Body.Read(buf)
		if n > 0 {
			f.Write(buf[:n])
			done += int64(n)
			if total > 0 && done*100/total != last {
				last = done * 100 / total
				setStatus(fmt.Sprintf("Downloading tunnel (one time)… %d%%", last))
			}
		}
		if rerr == io.EOF {
			break
		}
		if rerr != nil {
			f.Close()
			return "", rerr
		}
	}
	f.Close()
	if strings.HasSuffix(u, ".tgz") { // macOS ships cloudflared inside a .tgz
		if err := untarOne(dest+".part", dest); err != nil {
			return "", err
		}
		os.Remove(dest + ".part")
	} else if err := os.Rename(dest+".part", dest); err != nil {
		return "", err
	}
	os.Chmod(dest, 0755)
	return dest, nil
}

var tunRe = regexp.MustCompile(`https://[a-z0-9-]+\.trycloudflare\.com`)

// resolver that skips the ISP's DNS (some ISPs fail on fresh trycloudflare names)
var cfDNS = &net.Resolver{PreferGo: true, Dial: func(ctx context.Context, _, _ string) (net.Conn, error) {
	d := net.Dialer{Timeout: 4 * time.Second}
	return d.DialContext(ctx, "udp", "1.1.1.1:53")
}}

func reachable(u string) bool {
	tr := &http.Transport{DialContext: func(ctx context.Context, nw, addr string) (net.Conn, error) {
		host, p, _ := net.SplitHostPort(addr)
		ips, err := cfDNS.LookupHost(ctx, host)
		if err != nil || len(ips) == 0 {
			ips, err = net.DefaultResolver.LookupHost(ctx, host)
			if err != nil || len(ips) == 0 {
				return nil, fmt.Errorf("dns: %v", err)
			}
		}
		return (&net.Dialer{Timeout: 6 * time.Second}).DialContext(ctx, nw, net.JoinHostPort(ips[0], p))
	}}
	c := &http.Client{Timeout: 8 * time.Second, Transport: tr}
	resp, err := c.Get(u + "/ping")
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(io.LimitReader(resp.Body, 16))
	return strings.HasPrefix(string(b), "1eye")
}

// ---------------------------------------------------------------- pages

func serveWeb(w http.ResponseWriter, name, ctype string) {
	b, err := webFS.ReadFile("web/" + name)
	if err != nil {
		w.WriteHeader(404)
		return
	}
	w.Header().Set("Content-Type", ctype)
	w.Header().Set("Cache-Control", "no-cache")
	w.Write(b)
}

func handleRoot(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	if _, ok := who(r); !ok {
		serveWeb(w, "login.html", "text/html; charset=utf-8")
		return
	}
	serveWeb(w, "app.html", "text/html; charset=utf-8")
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(405)
		return
	}
	var in struct{ Pin, Name string }
	if readJSON(r, &in) != nil {
		w.WriteHeader(400)
		return
	}
	ip := clientIP(r)
	mu.Lock()
	f := fails[ip]
	mu.Unlock()
	if f[1] > time.Now().Unix() {
		writeJSON(w, map[string]any{"ok": false, "err": fmt.Sprintf("Too many attempts. Try again in %ds.", f[1]-time.Now().Unix())})
		return
	}
	if viaNet(r) {
		mu.Lock()
		locked := publicLockUntil > time.Now().Unix()
		wait := publicLockUntil - time.Now().Unix()
		mu.Unlock()
		if locked {
			writeJSON(w, map[string]any{"ok": false, "err": fmt.Sprintf("Internet sign-ins are paused for %ds after too many wrong PINs.", wait)})
			return
		}
	}
	mu.Lock()
	ok := subtle.ConstantTimeCompare([]byte(strings.TrimSpace(in.Pin)), []byte(pin)) == 1
	mu.Unlock()
	if !ok {
		f[0]++
		if f[0] >= 5 {
			f[1] = time.Now().Add(5 * time.Minute).Unix()
			logf("BLOCKED  %s for 5 min (wrong PIN ×5)", ip)
		}
		mu.Lock()
		if viaNet(r) {
			nowS := time.Now().Unix()
			if nowS-publicFailStart > 600 {
				publicFailStart, publicFails = nowS, 0
			}
			publicFails++
			if publicFails >= 20 {
				publicLockUntil, publicFails = nowS+600, 0
				go logf("LOCKED  internet sign-ins for 10 min (20 wrong PINs)")
			}
		}
		fails[ip] = f
		mu.Unlock()
		time.Sleep(time.Second)
		writeJSON(w, map[string]any{"ok": false, "err": "Wrong PIN"})
		return
	}
	name := strings.TrimSpace(in.Name)
	if len([]rune(name)) > 30 {
		name = string([]rune(name)[:30])
	}
	if name == "" {
		name = guessDevice(r.UserAgent())
	}
	tok := rid() + rid()
	d := &Device{ID: rid(), Name: name, Via: viaStr(r), IP: ip, Agent: guessDevice(r.UserAgent()), Joined: now(), LastSeen: now(), token: tok}
	mu.Lock()
	delete(fails, ip)
	devices[tok] = d
	save()
	bump()
	mu.Unlock()
	logf("JOINED  %s via %s (%s)", name, d.Via, ip)
	http.SetCookie(w, &http.Cookie{Name: "eye", Value: tok, Path: "/", HttpOnly: true, MaxAge: 2592000, SameSite: http.SameSiteLaxMode,
		Secure: isPublic(r) || r.TLS != nil || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https")})
	writeJSON(w, map[string]any{"ok": true})
}

func handleLogout(w http.ResponseWriter, r *http.Request) {
	if c, err := r.Cookie("eye"); err == nil {
		mu.Lock()
		if d := devices[c.Value]; d != nil {
			delete(devices, c.Value)
			save()
			bump()
			mu.Unlock()
			logf("LEFT  %s", d.Name)
		} else {
			mu.Unlock()
		}
	}
	http.SetCookie(w, &http.Cookie{Name: "eye", Value: "", Path: "/", MaxAge: -1})
	writeJSON(w, map[string]any{"ok": true})
}

// long-poll: returns immediately if client is behind, else waits for a change (max 25s)
func handleSync(w http.ResponseWriter, r *http.Request) {
	d, ok := who(r)
	if !ok {
		w.WriteHeader(401)
		return
	}
	var have int64
	fmt.Sscan(r.URL.Query().Get("v"), &have)
	mu.Lock()
	ch := changed
	cur := ver
	mu.Unlock()
	if have == cur {
		select {
		case <-ch:
		case <-time.After(25 * time.Second):
		case <-r.Context().Done():
			return
		}
	}
	host := d == nil
	ps := permState()
	mu.Lock()
	// a kicked device disappears from the map
	if !host {
		if c, _ := r.Cookie("eye"); c == nil || devices[c.Value] == nil {
			mu.Unlock()
			w.WriteHeader(401)
			return
		}
	}
	if chat == nil {
		chat = []Msg{}
	}
	if links == nil {
		links = []Link{}
	}
	myID, myName := whoName(d)
	devs := []map[string]any{{"id": "host", "name": hostName, "via": "host", "agent": "Host PC", "online": true}}
	for _, x := range devices {
		devs = append(devs, map[string]any{"id": x.ID, "name": x.Name, "via": x.Via, "agent": x.Agent, "ip": x.IP,
			"joined": x.Joined, "online": now()-x.LastSeen < 40000})
	}
	sort.SliceStable(devs[1:], func(a, b int) bool { return devs[1+a]["joined"].(int64) < devs[1+b]["joined"].(int64) })
	out := map[string]any{
		"v": ver, "me": map[string]any{"id": myID, "name": myName, "host": host}, "hostName": hostName,
		"chat": chat, "links": links, "files": files, "devices": devs, "version": version, "ai": aiPublicState(host), "cloud": cloudPublicState(host),
	}
	if host {
		l := logs
		if len(l) > 120 {
			l = l[len(l)-120:]
		}
		out["host"] = map[string]any{
			"wifi": fmt.Sprintf("http://%s:%d", lanIP(), port), "public": publicURL, "online": tunStop != nil || wantOn,
			"busy": tunBusy, "status": tunStatus, "provider": provider, "platform": platformName(), "perm": ps, "pubPort": pubPort, "pin": pin, "log": l, "folder": sharedDir,
		}
	}
	mu.Unlock()
	writeJSON(w, out)
}

var urlRe = regexp.MustCompile(`(?i)\b(https?://[^\s<>"']+|www\.[^\s<>"']+)`)

func addLink(u, note, name string) bool { // mu held
	u = strings.TrimRight(strings.TrimSpace(u), ".,);!?")
	if u == "" {
		return false
	}
	if !strings.HasPrefix(strings.ToLower(u), "http") {
		u = "https://" + u
	}
	for _, l := range links {
		if l.URL == u {
			return false
		}
	}
	links = append(links, Link{rid(), u, note, name, now()})
	if len(links) > 500 {
		links = links[len(links)-500:]
	}
	return true
}

func handleChat(w http.ResponseWriter, r *http.Request) {
	d, ok := who(r)
	if !ok || r.Method != "POST" {
		w.WriteHeader(401)
		return
	}
	var in struct{ Text string }
	readJSON(r, &in)
	t := strings.TrimSpace(in.Text)
	if t == "" || len(t) > 20000 {
		w.WriteHeader(400)
		return
	}
	id, name := whoName(d)
	mu.Lock()
	msg := Msg{rid(), id, name, t, now()}
	chat = append(chat, msg)
	if len(chat) > 1000 {
		chat = chat[len(chat)-1000:]
	}
	for _, u := range urlRe.FindAllString(t, -1) {
		addLink(u, "from chat", name)
	}
	save()
	bump()
	mu.Unlock()
	go maybeChatAI(msg)
	writeJSON(w, map[string]any{"ok": true})
}

func handleChatClear(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	chat = nil
	save()
	bump()
	mu.Unlock()
	logf("CHAT  cleared")
	writeJSON(w, map[string]any{"ok": true})
}

func handleLink(w http.ResponseWriter, r *http.Request) {
	d, ok := who(r)
	if !ok || r.Method != "POST" {
		w.WriteHeader(401)
		return
	}
	var in struct{ URL, Note, Del string }
	readJSON(r, &in)
	_, name := whoName(d)
	mu.Lock()
	if in.Del != "" {
		for i, l := range links {
			if l.ID == in.Del {
				links = append(links[:i], links[i+1:]...)
				break
			}
		}
	} else if !addLink(in.URL, strings.TrimSpace(in.Note), name) {
		mu.Unlock()
		writeJSON(w, map[string]any{"ok": false, "err": "Already saved"})
		return
	}
	save()
	bump()
	mu.Unlock()
	writeJSON(w, map[string]any{"ok": true})
}

func handleUpload(w http.ResponseWriter, r *http.Request) {
	d, ok := who(r)
	if !ok || r.Method != "PUT" {
		w.WriteHeader(401)
		return
	}
	name := safeName(r.URL.Query().Get("name"))
	dest := uniquePath(name)
	tmp := dest + ".part"
	f, err := os.Create(tmp)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	n, err := io.Copy(f, r.Body)
	f.Close()
	if err != nil || (r.ContentLength > 0 && n != r.ContentLength) {
		os.Remove(tmp)
		w.WriteHeader(500)
		return
	}
	os.Rename(tmp, dest)
	_, from := whoName(d)
	logf("RECEIVED  %s  ← %s", filepath.Base(dest), from)
	autoBackup(filepath.Base(dest))
	scanFiles()
	writeJSON(w, map[string]any{"ok": true})
}

func handleFile(w http.ResponseWriter, r *http.Request) {
	d, ok := who(r)
	if !ok {
		w.WriteHeader(401)
		return
	}
	name := safeName(strings.TrimPrefix(r.URL.Path, "/f/"))
	p := filepath.Join(sharedDir, name)
	if st, err := os.Stat(p); err != nil || st.IsDir() {
		http.NotFound(w, r)
		return
	}
	if r.URL.Query().Get("view") == "" {
		w.Header().Set("Content-Disposition", "attachment; filename*=UTF-8''"+url.PathEscape(name))
		if r.Header.Get("Range") == "" {
			_, n := whoName(d)
			logf("SENT  %s  → %s", name, n)
		}
	}
	w.Header().Set("X-Content-Type-Options", "nosniff")
	switch strings.ToLower(filepath.Ext(name)) {
	case ".svg", ".html", ".htm", ".xhtml", ".xml", ".xht", ".mht", ".mhtml", ".shtml":
		w.Header().Set("Content-Security-Policy", "sandbox")
	}
	http.ServeFile(w, r, p)
}

func handleDelete(w http.ResponseWriter, r *http.Request) {
	d, ok := who(r)
	if !ok || r.Method != "POST" {
		w.WriteHeader(401)
		return
	}
	name := safeName(strings.TrimPrefix(r.URL.Path, "/del/"))
	if os.Remove(filepath.Join(sharedDir, name)) == nil {
		_, n := whoName(d)
		logf("DELETED  %s  by %s", name, n)
		scanFiles()
	}
	writeJSON(w, map[string]any{"ok": true})
}

func handleZip(w http.ResponseWriter, r *http.Request) {
	d, ok := who(r)
	if !ok {
		w.WriteHeader(401)
		return
	}
	var want map[string]bool
	if q := r.URL.Query().Get("only"); q != "" {
		want = map[string]bool{}
		for _, n := range strings.Split(q, "/") {
			want[safeName(n)] = true
		}
	}
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="1EYE_%s.zip"`, time.Now().Format("2006-01-02_1504")))
	zw := zip.NewWriter(w)
	mu.Lock()
	list := append([]FileInfo{}, files...)
	mu.Unlock()
	cnt := 0
	for _, f := range list {
		if want != nil && !want[f.Name] {
			continue
		}
		src, err := os.Open(filepath.Join(sharedDir, f.Name))
		if err != nil {
			continue
		}
		hdr := &zip.FileHeader{Name: f.Name, Method: zip.Store, Modified: time.UnixMilli(f.MTime)}
		if dst, err := zw.CreateHeader(hdr); err == nil {
			io.Copy(dst, src)
			cnt++
		}
		src.Close()
	}
	zw.Close()
	_, n := whoName(d)
	logf("SENT  %d files as zip  → %s", cnt, n)
}

// ---- host only

func hostOnly(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !isHost(r) {
			http.NotFound(w, r)
			return
		}
		h(w, r)
	}
}

func handleQR(w http.ResponseWriter, r *http.Request) {
	u := r.URL.Query().Get("u")
	if u == "" {
		http.NotFound(w, r)
		return
	}
	q, err := qrcode.New(u, qrcode.Medium)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	q.DisableBorder = true
	bits := q.Bitmap()
	n := len(bits)
	var b strings.Builder
	fmt.Fprintf(&b, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" shape-rendering="crispEdges"><path fill="#0b0914" d="`, n, n)
	for y, row := range bits {
		for x, on := range row {
			if on {
				fmt.Fprintf(&b, "M%d %dh1v1h-1z", x, y)
			}
		}
	}
	b.WriteString(`"/></svg>`)
	w.Header().Set("Content-Type", "image/svg+xml")
	io.WriteString(w, b.String())
}

func handleAction(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(405)
		return
	}
	switch strings.TrimPrefix(r.URL.Path, "/host/") {
	case "online":
		mu.Lock()
		on := tunStop != nil || wantOn
		mu.Unlock()
		if on {
			goOffline()
		} else {
			go goOnline()
		}
	case "pin":
		mu.Lock()
		pin = newPin()
		devices = map[string]*Device{}
		save()
		bump()
		mu.Unlock()
		logf("NEW PIN  all devices signed out")
	case "kick":
		var in struct{ ID string }
		readJSON(r, &in)
		mu.Lock()
		var gone string
		for t, d := range devices {
			if d.ID == in.ID {
				gone = d.Name
				delete(devices, t)
			}
		}
		save()
		bump()
		mu.Unlock()
		if gone != "" {
			logf("KICKED  %s", gone)
		}
	case "rename":
		var in struct{ Name string }
		readJSON(r, &in)
		if n := strings.TrimSpace(in.Name); n != "" && len([]rune(n)) <= 30 {
			mu.Lock()
			hostName, savedHostName = n, n
			save()
			bump()
			mu.Unlock()
		}
	case "ai":
		handleHostAI(w, r)
		return
	case "cloud":
		handleHostCloud(w, r)
		return
	case "permanent":
		handlePermanent(w, r)
		return
	case "chatclear":
		handleChatClear(w, r)
		return
	case "folder":
		if !onAndroid() {
			openPath(sharedDir)
		}
	case "quit":
		logf("SHUTDOWN")
		writeJSON(w, map[string]any{"ok": true})
		go func() { time.Sleep(300 * time.Millisecond); goOffline(); os.Exit(0) }()
		return
	}
	writeJSON(w, map[string]any{"ok": true})
}

// ---------------------------------------------------------------- main

func main() {
	fixDNS()
	exe, _ := os.Executable()
	appDir = filepath.Dir(exe)
	if strings.Contains(appDir, "go-build") {
		appDir, _ = os.Getwd()
	}
	for i, a := range os.Args[1:] {
		if a == "--dir" && i+2 < len(os.Args) {
			appDir = os.Args[i+2]
		}
	}
	sharedDir = filepath.Join(appDir, "1EYE_Shared")
	dataDir = filepath.Join(appDir, "1EYE_Data")
	binDir = filepath.Join(dataDir, "bin")
	os.MkdirAll(sharedDir, 0755)
	os.MkdirAll(dataDir, 0700)
	pin = newPin()
	load()
	hostName, _ = os.Hostname()
	for i, a := range os.Args[1:] {
		if a == "--name" && i+2 < len(os.Args) && os.Args[i+2] != "" {
			hostName = os.Args[i+2]
		}
	}
	if savedHostName != "" {
		hostName = savedHostName
	}
	if hostName == "" || hostName == "localhost" {
		hostName = "Host PC"
	}

	ports := []int{7777, 8080, 8090, 9000}
	cl := http.Client{Timeout: 700 * time.Millisecond}
	for _, p := range ports {
		if resp, err := cl.Get(fmt.Sprintf("http://127.0.0.1:%d/ping", p)); err == nil {
			b, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			if strings.HasPrefix(string(b), "1eye") {
				// An older 1EYE is already running: ask it to shut down and take over,
				// so opening a new version actually runs the new version.
				running := strings.TrimSpace(strings.TrimPrefix(string(b), "1eye"))
				if !olderVersion(running, version) || !replaceRunning(p) {
					openURL(fmt.Sprintf("http://127.0.0.1:%d/", p))
					return
				}
				break
			}
		}
	}
	var ln net.Listener
	var err error
	for _, p := range append(ports, 0) {
		if ln, err = net.Listen("tcp", fmt.Sprintf("0.0.0.0:%d", p)); err == nil {
			break
		}
	}
	if err != nil {
		fmt.Println("Could not open a port:", err)
		os.Exit(1)
	}
	port = ln.Addr().(*net.TCPAddr).Port

	cleanParts()
	scanFiles()
	go func() {
		for range time.Tick(2 * time.Second) {
			scanFiles()
		}
	}()

	static, _ := fs.Sub(webFS, "web")
	mux := http.NewServeMux()
	mux.HandleFunc("/", handleRoot)
	assets := http.StripPrefix("/assets/", http.FileServer(http.FS(static)))
	mux.Handle("/assets/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-cache") // always load the current version after an update
		assets.ServeHTTP(w, r)
	}))
	mux.HandleFunc("/ping", func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, "1eye "+version) })
	mux.HandleFunc("/api/login", handleLogin)
	mux.HandleFunc("/api/logout", handleLogout)
	mux.HandleFunc("/api/rename", handleSelfRename)
	mux.HandleFunc("/api/ai", handleAI)
	mux.HandleFunc("/api/cloud", handleCloud)
	mux.HandleFunc("/cloud/f/", handleCloudFile)
	mux.HandleFunc("/cloud/google/start", hostOnly(handleGoogleStart))
	mux.HandleFunc("/oauth/google", hostOnly(handleGoogleCallback))
	mux.HandleFunc("/api/sync", handleSync)
	mux.HandleFunc("/api/chat", handleChat)
	mux.HandleFunc("/api/link", handleLink)
	mux.HandleFunc("/upload", handleUpload)
	mux.HandleFunc("/f/", handleFile)
	mux.HandleFunc("/del/", handleDelete)
	mux.HandleFunc("/zip", handleZip)
	mux.HandleFunc("/host/qr", hostOnly(handleQR))
	mux.HandleFunc("/host/", hostOnly(handleAction))

	wifi := fmt.Sprintf("http://%s:%d", lanIP(), port)
	logf("AWAKE  1EYE v%s on %s", version, wifi)
	fmt.Printf("\n  1EYE — Telepathic Data Transfer\n  Wi-Fi link: %s\n  PIN: %s\n  Panel: http://127.0.0.1:%d\n\n", wifi, pin, port)

	headless := false
	for _, a := range os.Args[1:] {
		if a == "--headless" {
			headless = true
		}
		if a == "--online" {
			go goOnline()
		}
	}
	if onAndroid() {
		headless = true
	}
	if !headless {
		go func() { time.Sleep(400 * time.Millisecond); openURL(fmt.Sprintf("http://127.0.0.1:%d/", port)) }()
	}
	// separate loopback-only entry point for tunnels: everything arriving here is "internet"
	pl, err := net.Listen("tcp", "127.0.0.1:7778") // fixed, so a permanent tunnel can point at it
	if err != nil {
		pl, err = net.Listen("tcp", "127.0.0.1:0")
	}
	if err == nil {
		pubPort = pl.Addr().(*net.TCPAddr).Port
		pub := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			guard(mux).ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), publicKey, true)))
		})
		go (&http.Server{Handler: pub, ReadHeaderTimeout: 20 * time.Second}).Serve(pl)
	}
	go startPermanent()
	srv := &http.Server{Handler: guard(mux), ReadHeaderTimeout: 20 * time.Second}
	srv.Serve(ln)
}

// guard blocks cross-site requests that change state (CSRF): another website open in the
// host's browser must not be able to drive 1EYE's controls.
func guard(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			if sfs := r.Header.Get("Sec-Fetch-Site"); sfs == "cross-site" || sfs == "same-site" {
				http.Error(w, "cross-site request blocked", http.StatusForbidden)
				return
			}
			if o := r.Header.Get("Origin"); o != "" && o != "null" {
				if u, err := url.Parse(o); err != nil || !strings.EqualFold(u.Host, r.Host) {
					http.Error(w, "cross-origin request blocked", http.StatusForbidden)
					return
				}
			} else if o == "null" {
				http.Error(w, "cross-origin request blocked", http.StatusForbidden)
				return
			}
		}
		hd := w.Header()
		hd.Set("X-Frame-Options", "SAMEORIGIN") // DENY broke the in-app PDF preview
		hd.Set("X-Content-Type-Options", "nosniff")
		hd.Set("Referrer-Policy", "no-referrer")
		hd.Set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")
		if !strings.HasPrefix(r.URL.Path, "/f/") {
			hd.Set("Content-Security-Policy", "default-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'")
		}
		h.ServeHTTP(w, r)
	})
}

// a signed-in device renames itself
func handleSelfRename(w http.ResponseWriter, r *http.Request) {
	d, ok := who(r)
	if !ok || r.Method != "POST" {
		w.WriteHeader(401)
		return
	}
	var in struct{ Name string }
	readJSON(r, &in)
	n := strings.TrimSpace(in.Name)
	if n == "" || len([]rune(n)) > 30 {
		writeJSON(w, map[string]any{"ok": false, "err": "1–30 characters"})
		return
	}
	mu.Lock()
	if d == nil {
		hostName, savedHostName = n, n
	} else {
		d.Name = n
	}
	save()
	bump()
	mu.Unlock()
	writeJSON(w, map[string]any{"ok": true})
}

// leftovers of interrupted uploads
func cleanParts() {
	ents, _ := os.ReadDir(sharedDir)
	for _, e := range ents {
		if strings.HasSuffix(e.Name(), ".part") {
			os.Remove(filepath.Join(sharedDir, e.Name()))
		}
	}
}

// olderVersion reports whether a running copy (empty = before v1.7, which didn't report it) is older than ours.
func olderVersion(running, mine string) bool {
	if running == "" {
		return true
	}
	parse := func(v string) (a, b int) { fmt.Sscanf(v, "%d.%d", &a, &b); return }
	ra, rb := parse(running)
	ma, mb := parse(mine)
	return ra < ma || (ra == ma && rb < mb)
}

// replaceRunning asks the copy on port p to shut down and waits for it to go.
func replaceRunning(p int) bool {
	cl := http.Client{Timeout: 2 * time.Second}
	req, _ := http.NewRequest("POST", fmt.Sprintf("http://127.0.0.1:%d/host/quit", p), nil)
	resp, err := cl.Do(req)
	if err != nil {
		return false
	}
	resp.Body.Close()
	if resp.StatusCode != 200 {
		return false
	}
	for i := 0; i < 40; i++ {
		time.Sleep(250 * time.Millisecond)
		if r, err := cl.Get(fmt.Sprintf("http://127.0.0.1:%d/ping", p)); err != nil {
			time.Sleep(500 * time.Millisecond)
			return true
		} else {
			r.Body.Close()
		}
	}
	return false
}

// untarOne extracts the first regular file of a .tgz into dest.
func untarOne(src, dest string) error {
	f, err := os.Open(src)
	if err != nil {
		return err
	}
	defer f.Close()
	gz, err := gzip.NewReader(f)
	if err != nil {
		return err
	}
	tr := tar.NewReader(gz)
	for {
		h, err := tr.Next()
		if err != nil {
			return fmt.Errorf("tunnel download was damaged: %v", err)
		}
		if h.Typeflag == tar.TypeReg {
			out, err := os.Create(dest)
			if err != nil {
				return err
			}
			_, err = io.Copy(out, tr)
			out.Close()
			return err
		}
	}
}
