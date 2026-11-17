package main

// Permanent link: a named Cloudflare Tunnel (from the user's own Cloudflare account)
// that keeps https://<their domain> pointed at this 1EYE. Desktop only.

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"
)

type permConf struct {
	Token string `json:"token"`
	Host  string `json:"host"`
}

var (
	perm       permConf
	permMu     sync.Mutex
	permStatus = "off"
	permErr    string
	permCancel context.CancelFunc
	tokenRe    = regexp.MustCompile(`eyJ[A-Za-z0-9_\-=+/]{40,}`)
	hostRe     = regexp.MustCompile(`^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$`)
)

func permState() map[string]any {
	mu.Lock()
	h, has := perm.Host, perm.Token != ""
	mu.Unlock()
	permMu.Lock()
	defer permMu.Unlock()
	return map[string]any{"host": h, "configured": has, "status": permStatus, "error": permErr,
		"available": !onAndroid(), "url": map[bool]string{true: "https://" + h, false: ""}[h != ""]}
}

func setPerm(status, err string) {
	permMu.Lock()
	permStatus, permErr = status, err
	permMu.Unlock()
	mu.Lock()
	bump()
	mu.Unlock()
}

func handlePermanent(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Token, Host string
		Clear       bool
	}
	readJSON(r, &in)
	if in.Clear {
		stopPermanent()
		mu.Lock()
		perm = permConf{}
		save()
		bump()
		mu.Unlock()
		setPerm("off", "")
		logf("PERMANENT  link removed")
		writeJSON(w, map[string]any{"ok": true})
		return
	}
	tok := tokenRe.FindString(in.Token)
	host := strings.ToLower(strings.TrimSpace(in.Host))
	host = strings.TrimPrefix(strings.TrimPrefix(host, "https://"), "http://")
	host = strings.TrimRight(host, "/")
	if tok == "" {
		writeJSON(w, map[string]any{"ok": false, "err": "That doesn't look like a Cloudflare tunnel token (it starts with eyJ…)"})
		return
	}
	if !hostRe.MatchString(host) {
		writeJSON(w, map[string]any{"ok": false, "err": "Enter the address, e.g. eye.yourdomain.com"})
		return
	}
	mu.Lock()
	perm = permConf{tok, host}
	save()
	mu.Unlock()
	logf("PERMANENT  set to https://%s", host)
	stopPermanent()
	go startPermanent()
	writeJSON(w, map[string]any{"ok": true})
}

func stopPermanent() {
	permMu.Lock()
	c := permCancel
	permCancel = nil
	permMu.Unlock()
	if c != nil {
		c()
	}
}

func startPermanent() {
	if onAndroid() {
		return
	}
	mu.Lock()
	conf := perm
	mu.Unlock()
	if conf.Token == "" {
		return
	}
	ctx, cancel := context.WithCancel(context.Background())
	permMu.Lock()
	if permCancel != nil {
		permMu.Unlock()
		cancel()
		return
	}
	permCancel = cancel
	permMu.Unlock()

	backoff := 5 * time.Second
	for ctx.Err() == nil {
		exe := cfBinary()
		if exe == "" {
			setPerm("starting", "Downloading Cloudflare tunnel (one time)…")
			var err error
			if exe, err = downloadCF(); err != nil {
				setPerm("error", err.Error())
				sleepCtx(ctx, 30*time.Second)
				continue
			}
		}
		setPerm("starting", "")
		lf, _ := os.OpenFile(filepath.Join(dataDir, "permanent.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0600)
		connected := false
		var last string
		w := &lineWriter{line: func(l string) {
			if lf != nil {
				fmt.Fprintln(lf, l)
			}
			if strings.Contains(l, "Registered tunnel connection") {
				if !connected {
					logf("PERMANENT  online at https://%s", conf.Host)
				}
				connected = true
				setPerm("online", "")
			} else if errRe.MatchString(l) && !strings.Contains(l, " INF ") {
				last = l
				if i := strings.Index(last, "ERR"); i >= 0 {
					last = strings.TrimSpace(last[i+3:])
				}
				if len(last) > 160 {
					last = last[:160] + "…"
				}
				if !connected {
					setPerm("starting", last)
				}
			}
		}}
		err := execStarter(exe, "tunnel", "--no-autoupdate", "--protocol", "http2", "--edge-ip-version", "auto", "run", "--token", conf.Token)(ctx, w)
		if lf != nil {
			lf.Close()
		}
		if ctx.Err() != nil {
			break
		}
		msg := last
		if msg == "" && err != nil {
			msg = err.Error()
		}
		if connected {
			logf("PERMANENT  dropped — reconnecting")
			backoff = 5 * time.Second
		}
		setPerm("error", "Reconnecting… "+msg)
		sleepCtx(ctx, backoff)
		if backoff < time.Minute {
			backoff *= 2
		}
	}
	setPerm("off", "")
}

func sleepCtx(ctx context.Context, d time.Duration) {
	select {
	case <-ctx.Done():
	case <-time.After(d):
	}
}

var _ = exec.Command
