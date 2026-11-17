package main

// Internet tunnels: Cloudflare quick tunnel (desktop, external binary) and built-in SSH
// reverse tunnels (localhost.run, Pinggy) that need no external program — so they also
// work on Android.

import (
	"context"
	"fmt"
	"io"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/ssh"
)

var errRe = regexp.MustCompile(`(?i)\b(ERR|error|failed|refused|timeout|timed out|denied|429|too many|closed by|unreachable|rejected)\b`)

var (
	reLHR    = regexp.MustCompile(`https://[a-z0-9-]+\.(lhr\.life|localhost\.run)`)
	rePinggy = regexp.MustCompile(`https://[a-z0-9.-]+\.(pinggy\.link|pinggy\.online|pinggy\.io)`)
	ansiRe   = regexp.MustCompile(`\x1b\[[0-9;?]*[a-zA-Z]|\x1b\][^\x07]*\x07`)
)

type tunnelSpec struct {
	name    string
	start   func(ctx context.Context, out io.Writer) error
	re      *regexp.Regexp
	urlWait time.Duration
}

func stillWanted() bool { mu.Lock(); defer mu.Unlock(); return wantOn }

// ---- external program (cloudflared)
func execStarter(exe string, args ...string) func(context.Context, io.Writer) error {
	return func(ctx context.Context, out io.Writer) error {
		cmd := exec.CommandContext(ctx, exe, args...)
		hideWindow(cmd)
		cmd.Stdout, cmd.Stderr = out, out
		if err := cmd.Start(); err != nil {
			return fmt.Errorf("could not start (%v) — antivirus may be blocking it", err)
		}
		return cmd.Wait()
	}
}

// ---- built-in SSH reverse tunnel
func dialCtx(ctx context.Context, addr string) (net.Conn, error) {
	host, port, _ := net.SplitHostPort(addr)
	ips, err := net.DefaultResolver.LookupHost(ctx, host)
	if err != nil || len(ips) == 0 {
		if ips, err = cfDNS.LookupHost(ctx, host); err != nil || len(ips) == 0 {
			return nil, fmt.Errorf("can't resolve %s: %v", host, err)
		}
	}
	d := net.Dialer{Timeout: 15 * time.Second, KeepAlive: 20 * time.Second}
	var last error
	for _, ip := range ips {
		c, err := d.DialContext(ctx, "tcp", net.JoinHostPort(ip, port))
		if err == nil {
			return c, nil
		}
		last = err
	}
	return nil, last
}

func sshStarter(addr, user, bind string) func(context.Context, io.Writer) error {
	return func(ctx context.Context, out io.Writer) error {
		fmt.Fprintf(out, "connecting to %s as %s\n", addr, user)
		raw, err := dialCtx(ctx, addr)
		if err != nil {
			return err
		}
		empty := ssh.KeyboardInteractive(func(_, _ string, qs []string, _ []bool) ([]string, error) {
			return make([]string, len(qs)), nil
		})
		cfg := &ssh.ClientConfig{
			User:            user,
			Auth:            []ssh.AuthMethod{empty, ssh.Password("")},
			HostKeyCallback: ssh.InsecureIgnoreHostKey(), // public tunnel relays; our data is still PIN-protected
			Timeout:         20 * time.Second,
		}
		raw.SetDeadline(time.Now().Add(25 * time.Second))
		c, chans, reqs, err := ssh.NewClientConn(raw, addr, cfg)
		if err != nil {
			raw.Close()
			return fmt.Errorf("ssh handshake failed: %v", err)
		}
		raw.SetDeadline(time.Time{})
		client := ssh.NewClient(c, chans, reqs)
		defer client.Close()
		go func() { <-ctx.Done(); client.Close() }()

		// request the remote forward ourselves and accept every forwarded channel
		// (relays don't always echo back the exact bind address)
		bh, bp, _ := net.SplitHostPort(bind)
		var port uint32
		fmt.Sscan(bp, &port)
		incoming := client.HandleChannelOpen("forwarded-tcpip")
		ok, _, err := client.SendRequest("tcpip-forward", true, ssh.Marshal(&struct {
			Addr string
			Port uint32
		}{bh, port}))
		if err != nil || !ok {
			return fmt.Errorf("remote forward rejected by %s", addr)
		}
		local := fmt.Sprintf("127.0.0.1:%d", pubPort)
		go func() {
			for nc := range incoming {
				ch, rq, err := nc.Accept()
				if err != nil {
					continue
				}
				go ssh.DiscardRequests(rq)
				go func(ch ssh.Channel) {
					lc, err := net.DialTimeout("tcp", local, 5*time.Second)
					if err != nil {
						ch.Close()
						return
					}
					go func() { io.Copy(lc, ch); lc.Close() }()
					io.Copy(ch, lc)
					ch.Close()
				}(ch)
			}
		}()

		sess, err := client.NewSession()
		if err != nil {
			return fmt.Errorf("session: %v", err)
		}
		sess.Stdout, sess.Stderr = out, out
		sess.RequestPty("xterm", 40, 160, ssh.TerminalModes{ssh.ECHO: 0})
		if err := sess.Shell(); err != nil {
			fmt.Fprintf(out, "shell: %v\n", err)
		}
		// keepalive
		go func() {
			t := time.NewTicker(20 * time.Second)
			defer t.Stop()
			for {
				select {
				case <-ctx.Done():
					return
				case <-t.C:
					if _, _, err := client.SendRequest("keepalive@openssh.com", true, nil); err != nil {
						client.Close()
						return
					}
				}
			}
		}()
		err = client.Wait()
		if ctx.Err() != nil {
			return nil
		}
		if err != nil {
			return fmt.Errorf("connection closed: %v", err)
		}
		return fmt.Errorf("connection closed")
	}
}

// line splitter that strips terminal escape codes
type lineWriter struct {
	mu   sync.Mutex
	buf  []byte
	line func(string)
}

func (w *lineWriter) Write(p []byte) (int, error) {
	w.mu.Lock()
	defer w.mu.Unlock()
	w.buf = append(w.buf, p...)
	for {
		i := strings.IndexAny(string(w.buf), "\r\n")
		if i < 0 {
			if len(w.buf) > 8192 {
				w.line(string(w.buf))
				w.buf = w.buf[:0]
			}
			return len(p), nil
		}
		l := strings.TrimSpace(ansiRe.ReplaceAllString(string(w.buf[:i]), ""))
		w.buf = w.buf[i+1:]
		if l != "" {
			w.line(l)
		}
	}
}

func goOnline() {
	mu.Lock()
	if tunBusy || tunStop != nil {
		mu.Unlock()
		return
	}
	tunBusy, wantOn = true, true
	bump()
	mu.Unlock()
	defer func() { mu.Lock(); tunBusy = false; bump(); mu.Unlock() }()

	local := fmt.Sprintf("127.0.0.1:%d", pubPort)
	var specs []tunnelSpec
	var problems []string

	// Cloudflare: desktop only (Android won't run downloaded programs)
	if !onAndroid() {
		cf := cfBinary()
		if cf == "" {
			setStatus("Downloading Cloudflare tunnel (one time, ~20 MB)…")
			var err error
			if cf, err = downloadCF(); err != nil {
				problems = append(problems, "Cloudflare: "+err.Error())
				logf("TUNNEL  cloudflare download: %v", err)
				cf = ""
			}
		}
		if cf != "" {
			specs = append(specs, tunnelSpec{"Cloudflare", execStarter(cf, "tunnel", "--no-autoupdate", "--protocol", "http2",
				"--edge-ip-version", "auto", "--url", "http://"+local), tunRe, 40 * time.Second})
		}
	}
	specs = append(specs,
		tunnelSpec{"localhost.run", sshStarter("localhost.run:22", "nokey", "localhost:80"), reLHR, 30 * time.Second},
		tunnelSpec{"localhost.run (443)", sshStarter("ssh.localhost.run:443", "nokey", "localhost:80"), reLHR, 30 * time.Second},
		tunnelSpec{"Pinggy", sshStarter("a.pinggy.io:443", "free", "localhost:0"), rePinggy, 30 * time.Second},
	)

	for _, sp := range specs {
		if !stillWanted() {
			return
		}
		res, why := runTunnel(sp)
		switch res {
		case "cancelled":
			return
		case "closed":
			setStatus("Offline — the " + sp.name + " link closed. Press Go online to reconnect.")
			mu.Lock()
			wantOn = false
			mu.Unlock()
			return
		}
		problems = append(problems, sp.name+": "+why)
		logf("TUNNEL  %s failed: %s", sp.name, why)
	}
	mu.Lock()
	wantOn = false
	mu.Unlock()
	setStatus("Could not go online with any provider. Your network may be blocking tunnels — try a VPN or a phone hotspot. Details: " +
		filepath.Join(dataDir, "tunnel.log") + " · " + strings.Join(problems, " | "))
}

// runTunnel returns "closed" (was online then ended), "cancelled", or "failed" + reason.
func runTunnel(sp tunnelSpec) (string, string) {
	setStatus("Connecting via " + sp.name + "…")
	logPath := filepath.Join(dataDir, "tunnel.log")
	lf, _ := os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0600)
	if lf != nil {
		defer lf.Close()
		fmt.Fprintf(lf, "\n==== %s  %s ====\n", time.Now().Format(time.RFC3339), sp.name)
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	mu.Lock()
	tunID++
	id := tunID
	tunStop, provider = cancel, sp.name
	bump()
	mu.Unlock()
	mine := func() bool { mu.Lock(); defer mu.Unlock(); return tunID == id && tunStop != nil }

	var lmu sync.Mutex
	var lastErr string
	gotURL := make(chan string, 1)
	online := make(chan bool, 1)
	sent := false

	w := &lineWriter{line: func(line string) {
		if lf != nil {
			fmt.Fprintln(lf, line)
		}
		if !sent {
			for _, m := range sp.re.FindAllString(line, -1) {
				if strings.HasPrefix(m, "https://api.") || strings.HasPrefix(m, "https://admin.") || strings.HasPrefix(m, "https://dashboard.") {
					continue
				}
				sent = true
				gotURL <- m
				break
			}
		}
		if errRe.MatchString(line) && !strings.Contains(line, " INF ") {
			e := line
			if i := strings.Index(e, "ERR"); i >= 0 {
				e = strings.TrimSpace(e[i+3:])
			}
			if len(e) > 140 {
				e = e[:140] + "…"
			}
			lmu.Lock()
			lastErr = e
			lmu.Unlock()
			mu.Lock()
			if publicURL == "" && tunID == id {
				tunStatus = sp.name + ": " + e
				bump()
			}
			mu.Unlock()
		}
	}}

	go func() {
		var u string
		select {
		case u = <-gotURL:
		case <-ctx.Done():
			return
		case <-time.After(sp.urlWait):
			lmu.Lock()
			if lastErr == "" {
				lastErr = fmt.Sprintf("no link after %ds", int(sp.urlWait.Seconds()))
			}
			lmu.Unlock()
			cancel()
			return
		}
		setStatus("Link created via " + sp.name + " — checking it works worldwide…")
		for i := 0; i < 25; i++ {
			if !mine() {
				return
			}
			if reachable(u) {
				mu.Lock()
				if tunID == id {
					publicURL, tunStatus = u, "Online via "+sp.name+" — reachable from any network"
					bump()
				}
				mu.Unlock()
				logf("ONLINE  %s (%s)", u, sp.name)
				online <- true
				return
			}
			time.Sleep(2 * time.Second)
		}
		mu.Lock()
		if tunID == id && tunStop != nil {
			publicURL = u
			tunStatus = "Link is up via " + sp.name + ", but this device couldn't confirm it. Test it on another phone using mobile data."
			bump()
		}
		mu.Unlock()
		logf("ONLINE?  %s (%s, unverified)", u, sp.name)
		online <- true
	}()

	err := sp.start(ctx, w)
	w.Write([]byte("\n"))
	if err != nil {
		w.line("ERR " + err.Error())
	}

	mu.Lock()
	still := tunID == id
	if still {
		tunStop, publicURL, provider = nil, "", ""
	}
	want := wantOn
	bump()
	mu.Unlock()
	wasOnline := false
	select {
	case <-online:
		wasOnline = true
	default:
	}
	if !still || !want {
		return "cancelled", ""
	}
	if wasOnline {
		logf("OFFLINE  %s tunnel closed", sp.name)
		return "closed", ""
	}
	lmu.Lock()
	defer lmu.Unlock()
	if lastErr == "" {
		lastErr = "exited without a link"
	}
	return "failed", lastErr
}

func goOffline() {
	mu.Lock()
	stop := tunStop
	tunStop, publicURL, tunStatus, wantOn = nil, "", "Offline", false
	tunID++
	bump()
	mu.Unlock()
	if stop != nil {
		stop()
		logf("OFFLINE  internet link closed")
	}
}

// Android / minimal systems have no /etc/resolv.conf: use public DNS directly.
func fixDNS() {
	if _, err := os.Stat("/etc/resolv.conf"); err == nil && !onAndroid() {
		return
	}
	if runtime.GOOS == "windows" || runtime.GOOS == "darwin" {
		return
	}
	servers := []string{"1.1.1.1:53", "8.8.8.8:53", "9.9.9.9:53"}
	net.DefaultResolver = &net.Resolver{PreferGo: true, Dial: func(ctx context.Context, nw, _ string) (net.Conn, error) {
		d := net.Dialer{Timeout: 4 * time.Second}
		var last error
		for _, s := range servers {
			c, err := d.DialContext(ctx, nw, s)
			if err == nil {
				return c, nil
			}
			last = err
		}
		return nil, last
	}}
}

func onAndroid() bool { return runtime.GOOS == "android" || os.Getenv("ANDROID_ROOT") != "" }

func platformName() string {
	if onAndroid() {
		return "android"
	}
	return runtime.GOOS
}
