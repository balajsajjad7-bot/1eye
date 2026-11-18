package main

// 1EYE Cloud — connect free cloud storage (Google Drive, or any WebDAV service such as
// Koofr, InfiniCLOUD or Nextcloud) and use it as extra storage that works even when this
// PC is off. Account secrets stay on the host in 1EYE_Data/data.json (0600) and are never
// sent to devices. Google access uses the drive.file scope: 1EYE only sees files it created.

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"encoding/xml"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

// Set at build time with -ldflags "-X main.googleClientID=… -X main.googleClientSecret=…".
// For installed apps Google treats the client secret as public; the host can also use their own.
var googleClientID, googleClientSecret string

type cloudAcct struct {
	ID      string `json:"id"`
	Kind    string `json:"kind"` // gdrive | webdav
	Name    string `json:"name"`
	Email   string `json:"email,omitempty"`
	Refresh string `json:"refresh,omitempty"`
	Folder  string `json:"folder,omitempty"` // gdrive folder id
	URL     string `json:"url,omitempty"`    // webdav folder URL
	User    string `json:"user,omitempty"`
	Pass    string `json:"pass,omitempty"`

	access string
	expiry time.Time
}

type cloudConf struct {
	Accounts     []*cloudAcct `json:"accounts"`
	Auto         string       `json:"auto"` // account id that new files are backed up to
	AllowDevices bool         `json:"allowDevices"`
	GClientID    string       `json:"gClientId,omitempty"`
	GSecret      string       `json:"gSecret,omitempty"`
}

type cloudFile struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Size   int64  `json:"size"`
	MTime  int64  `json:"mtime"`
	Public string `json:"public,omitempty"`
}

type cloudJob struct {
	ID   string  `json:"id"`
	Acct string  `json:"acct"`
	Name string  `json:"name"`
	Pct  float64 `json:"pct"`
	Dir  string  `json:"dir"` // up | down
	Err  string  `json:"err,omitempty"`
	Done bool    `json:"done"`
	at   time.Time
}

var (
	cloud     cloudConf
	cloudMu   sync.Mutex // guards tokens and caches (cloud config itself is under mu)
	cloudJobs = map[string]*cloudJob{}
	cloudList = map[string]cloudCache{}
	oauthWait = map[string]string{} // state -> PKCE verifier
	cloudHTTP = &http.Client{Timeout: 0, Transport: &http.Transport{Proxy: http.ProxyFromEnvironment, DialContext: dialCtx2, ResponseHeaderTimeout: 60 * time.Second}}
)

type cloudCache struct {
	files      []cloudFile
	used, cap_ int64
	err        string
	at         time.Time
}

func dialCtx2(ctx context.Context, nw, addr string) (net.Conn, error) { return dialCtx(ctx, addr) }

func gClient() (id, secret string) {
	if cloud.GClientID != "" {
		return cloud.GClientID, cloud.GSecret
	}
	return googleClientID, googleClientSecret
}

func findAcct(id string) *cloudAcct {
	for _, a := range cloud.Accounts {
		if a.ID == id {
			return a
		}
	}
	return nil
}

func cloudAllowed(host bool) bool { return host || cloud.AllowDevices }

// cloudPublicState goes into /api/sync (mu held). No secrets.
func cloudPublicState(host bool) map[string]any {
	accts := []map[string]any{}
	cloudMu.Lock()
	for _, a := range cloud.Accounts {
		c := cloudList[a.ID]
		accts = append(accts, map[string]any{"id": a.ID, "kind": a.Kind, "name": a.Name, "email": a.Email,
			"used": c.used, "cap": c.cap_, "count": len(c.files), "err": c.err, "share": a.Kind == "gdrive"})
	}
	jobs := []*cloudJob{}
	for id, j := range cloudJobs {
		if j.Done && time.Since(j.at) > 8*time.Second {
			delete(cloudJobs, id)
			continue
		}
		jobs = append(jobs, j)
	}
	cloudMu.Unlock()
	sort.Slice(jobs, func(a, b int) bool { return jobs[a].at.Before(jobs[b].at) })
	st := map[string]any{"available": cloudAllowed(host), "accounts": accts, "jobs": jobs, "auto": cloud.Auto}
	if !cloudAllowed(host) {
		st["accounts"] = []any{}
	}
	if host {
		id, _ := gClient()
		st["googleReady"] = id != ""
		st["googleOwn"] = cloud.GClientID != ""
		st["allowDevices"] = cloud.AllowDevices
	}
	return st
}

// ---------------------------------------------------------------- Google Drive

func (a *cloudAcct) token() (string, error) {
	cloudMu.Lock()
	if a.access != "" && time.Until(a.expiry) > time.Minute {
		t := a.access
		cloudMu.Unlock()
		return t, nil
	}
	cloudMu.Unlock()
	mu.Lock()
	id, secret := gClient()
	refresh := a.Refresh
	mu.Unlock()
	form := url.Values{"client_id": {id}, "client_secret": {secret}, "refresh_token": {refresh}, "grant_type": {"refresh_token"}}
	var tok struct {
		Access  string `json:"access_token"`
		Expires int    `json:"expires_in"`
		Err     string `json:"error"`
		Desc    string `json:"error_description"`
	}
	if err := postForm(gAuthBase+"/token", form, &tok); err != nil {
		return "", err
	}
	if tok.Access == "" {
		if tok.Err == "invalid_grant" {
			return "", errors.New("Google sign-in expired — remove and reconnect this Drive")
		}
		return "", fmt.Errorf("Google: %s %s", tok.Err, tok.Desc)
	}
	cloudMu.Lock()
	a.access, a.expiry = tok.Access, time.Now().Add(time.Duration(tok.Expires)*time.Second)
	cloudMu.Unlock()
	return tok.Access, nil
}

func postForm(u string, form url.Values, out any) error {
	resp, err := cloudHTTP.Post(u, "application/x-www-form-urlencoded", strings.NewReader(form.Encode()))
	if err != nil {
		return fmt.Errorf("can't reach Google: %v", err)
	}
	defer resp.Body.Close()
	return json.NewDecoder(io.LimitReader(resp.Body, 1<<20)).Decode(out)
}

func (a *cloudAcct) gdo(method, u string, body io.Reader, ctype string, size int64, hdr http.Header) (*http.Response, error) {
	t, err := a.token()
	if err != nil {
		return nil, err
	}
	req, _ := http.NewRequest(method, u, body)
	req.Header.Set("Authorization", "Bearer "+t)
	if ctype != "" {
		req.Header.Set("Content-Type", ctype)
	}
	if size >= 0 && body != nil {
		req.ContentLength = size
	}
	for k, v := range hdr {
		req.Header[k] = v
	}
	resp, err := cloudHTTP.Do(req)
	if err != nil {
		return nil, fmt.Errorf("can't reach Google Drive: %v", err)
	}
	if resp.StatusCode >= 300 {
		b, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		resp.Body.Close()
		var e struct {
			Error struct{ Message string } `json:"error"`
		}
		json.Unmarshal(b, &e)
		if e.Error.Message == "" {
			e.Error.Message = resp.Status
		}
		return nil, fmt.Errorf("Google Drive: %s", e.Error.Message)
	}
	return resp, nil
}

func (a *cloudAcct) gjson(method, u string, in, out any) error {
	var body io.Reader
	ct := ""
	sz := int64(-1)
	if in != nil {
		b, _ := json.Marshal(in)
		body, ct, sz = bytes.NewReader(b), "application/json", int64(len(b))
	}
	resp, err := a.gdo(method, u, body, ct, sz, nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if out == nil {
		return nil
	}
	return json.NewDecoder(resp.Body).Decode(out)
}

var gBase, gAuthBase = func() (string, string) { // overridable for tests
	if b := os.Getenv("ONEEYE_GOOGLE_BASE"); b != "" {
		return b, b
	}
	return "https://www.googleapis.com", "https://oauth2.googleapis.com"
}()

var gAPI = gBase + "/drive/v3"

func (a *cloudAcct) gFolder() (string, error) {
	if a.Folder != "" {
		return a.Folder, nil
	}
	q := url.QueryEscape("name='1EYE' and mimeType='application/vnd.google-apps.folder' and trashed=false")
	var l struct{ Files []struct{ ID string } }
	if err := a.gjson("GET", gAPI+"/files?fields=files(id)&q="+q, nil, &l); err != nil {
		return "", err
	}
	if len(l.Files) > 0 {
		a.Folder = l.Files[0].ID
	} else {
		var f struct{ ID string }
		if err := a.gjson("POST", gAPI+"/files?fields=id", map[string]any{"name": "1EYE", "mimeType": "application/vnd.google-apps.folder"}, &f); err != nil {
			return "", err
		}
		a.Folder = f.ID
	}
	mu.Lock()
	save()
	mu.Unlock()
	return a.Folder, nil
}

// ---------------------------------------------------------------- provider operations

func (a *cloudAcct) list() ([]cloudFile, int64, int64, error) {
	out := []cloudFile{}
	if a.Kind == "gdrive" {
		folder, err := a.gFolder()
		if err != nil {
			return nil, 0, 0, err
		}
		q := url.QueryEscape("'" + folder + "' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'")
		tok := ""
		for {
			var l struct {
				Files []struct {
					ID, Name, Size, ModifiedTime string
					Permissions                  []struct{ Type string }
				}
				NextPageToken string
			}
			u := gAPI + "/files?pageSize=1000&orderBy=modifiedTime desc&fields=nextPageToken,files(id,name,size,modifiedTime,permissions(type))&q=" + q
			if tok != "" {
				u += "&pageToken=" + url.QueryEscape(tok)
			}
			if err := a.gjson("GET", strings.ReplaceAll(u, " ", "%20"), nil, &l); err != nil {
				return nil, 0, 0, err
			}
			for _, f := range l.Files {
				var sz int64
				fmt.Sscan(f.Size, &sz)
				t, _ := time.Parse(time.RFC3339, f.ModifiedTime)
				cf := cloudFile{ID: f.ID, Name: f.Name, Size: sz, MTime: t.UnixMilli()}
				for _, p := range f.Permissions {
					if p.Type == "anyone" {
						cf.Public = "https://drive.google.com/file/d/" + f.ID + "/view"
					}
				}
				out = append(out, cf)
			}
			if tok = l.NextPageToken; tok == "" {
				break
			}
		}
		var ab struct {
			StorageQuota struct{ Limit, Usage string } `json:"storageQuota"`
		}
		var used, cp int64
		if a.gjson("GET", gAPI+"/about?fields=storageQuota", nil, &ab) == nil {
			fmt.Sscan(ab.StorageQuota.Usage, &used)
			fmt.Sscan(ab.StorageQuota.Limit, &cp)
		}
		return out, used, cp, nil
	}
	// WebDAV
	body := `<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:getcontentlength/><d:getlastmodified/><d:resourcetype/><d:quota-used-bytes/><d:quota-available-bytes/></d:prop></d:propfind>`
	resp, err := a.dav("PROPFIND", a.davURL(""), strings.NewReader(body), int64(len(body)), http.Header{"Depth": {"1"}, "Content-Type": {"application/xml"}})
	if err != nil {
		return nil, 0, 0, err
	}
	defer resp.Body.Close()
	var ms struct {
		R []struct {
			Href string `xml:"href"`
			P    []struct {
				Prop struct {
					Len   int64  `xml:"getcontentlength"`
					Mod   string `xml:"getlastmodified"`
					Used  int64  `xml:"quota-used-bytes"`
					Avail int64  `xml:"quota-available-bytes"`
					RT    struct {
						Coll *struct{} `xml:"collection"`
					} `xml:"resourcetype"`
				} `xml:"prop"`
			} `xml:"propstat"`
		} `xml:"response"`
	}
	if err := xml.NewDecoder(io.LimitReader(resp.Body, 16<<20)).Decode(&ms); err != nil {
		return nil, 0, 0, fmt.Errorf("unexpected reply from the WebDAV server")
	}
	var used, cp int64
	for _, r := range ms.R {
		if len(r.P) == 0 {
			continue
		}
		p := r.P[0].Prop
		if p.RT.Coll != nil {
			if p.Used > 0 || p.Avail > 0 {
				used, cp = p.Used, p.Used+p.Avail
			}
			continue
		}
		h, _ := url.PathUnescape(strings.TrimRight(r.Href, "/"))
		name := path.Base(h)
		t, _ := http.ParseTime(p.Mod)
		out = append(out, cloudFile{ID: name, Name: name, Size: p.Len, MTime: t.UnixMilli()})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].MTime > out[j].MTime })
	return out, used, cp, nil
}

func (a *cloudAcct) davURL(name string) string {
	base := strings.TrimRight(a.URL, "/") + "/1EYE/"
	if name == "" {
		return base
	}
	return base + url.PathEscape(name)
}

func (a *cloudAcct) dav(method, u string, body io.Reader, size int64, hdr http.Header) (*http.Response, error) {
	req, err := http.NewRequest(method, u, body)
	if err != nil {
		return nil, err
	}
	req.SetBasicAuth(a.User, a.Pass)
	if body != nil && size >= 0 {
		req.ContentLength = size
	}
	for k, v := range hdr {
		req.Header[k] = v
	}
	resp, err := cloudHTTP.Do(req)
	if err != nil {
		return nil, fmt.Errorf("can't reach %s: %v", req.URL.Host, err)
	}
	if resp.StatusCode == 404 && method == "PROPFIND" && strings.HasSuffix(u, "/1EYE/") {
		resp.Body.Close()
		if r2, err := a.dav("MKCOL", u, nil, -1, nil); err == nil {
			r2.Body.Close()
			return a.dav(method, u, nil, -1, hdr)
		}
	}
	if resp.StatusCode >= 300 {
		resp.Body.Close()
		switch resp.StatusCode {
		case 401, 403:
			return nil, errors.New("the server rejected the username or password (some services need an app password)")
		}
		return nil, fmt.Errorf("%s: %s", req.URL.Host, resp.Status)
	}
	return resp, nil
}

func (a *cloudAcct) upload(name string, r io.Reader, size int64) error {
	if a.Kind == "gdrive" {
		folder, err := a.gFolder()
		if err != nil {
			return err
		}
		meta, _ := json.Marshal(map[string]any{"name": name, "parents": []string{folder}})
		resp, err := a.gdo("POST", gBase+"/upload/drive/v3/files?uploadType=resumable&fields=id",
			bytes.NewReader(meta), "application/json; charset=UTF-8", int64(len(meta)), http.Header{"X-Upload-Content-Length": {fmt.Sprint(size)}})
		if err != nil {
			return err
		}
		loc := resp.Header.Get("Location")
		resp.Body.Close()
		if loc == "" {
			return errors.New("Google Drive didn't accept the upload")
		}
		resp, err = a.gdo("PUT", loc, r, "application/octet-stream", size, nil)
		if err != nil {
			return err
		}
		resp.Body.Close()
		return nil
	}
	if _, err := a.dav("PROPFIND", a.davURL(""), nil, -1, http.Header{"Depth": {"0"}}); err != nil { // makes sure 1EYE/ exists
		return err
	}
	resp, err := a.dav("PUT", a.davURL(name), r, size, http.Header{"Content-Type": {"application/octet-stream"}})
	if err != nil {
		return err
	}
	resp.Body.Close()
	return nil
}

func (a *cloudAcct) open(id, rng string) (*http.Response, error) {
	h := http.Header{}
	if rng != "" {
		h.Set("Range", rng)
	}
	if a.Kind == "gdrive" {
		return a.gdo("GET", gAPI+"/files/"+url.PathEscape(id)+"?alt=media", nil, "", -1, h)
	}
	return a.dav("GET", a.davURL(id), nil, -1, h)
}

func (a *cloudAcct) remove(id string) error {
	if a.Kind == "gdrive" { // to the Drive trash, so it can be restored
		return a.gjson("PATCH", gAPI+"/files/"+url.PathEscape(id), map[string]any{"trashed": true}, nil)
	}
	resp, err := a.dav("DELETE", a.davURL(id), nil, -1, nil)
	if err == nil {
		resp.Body.Close()
	}
	return err
}

func (a *cloudAcct) share(id string, on bool) (string, error) {
	if a.Kind != "gdrive" {
		return "", errors.New("public links are only available for Google Drive")
	}
	if !on {
		return "", a.gjson("DELETE", gAPI+"/files/"+url.PathEscape(id)+"/permissions/anyoneWithLink", nil, nil)
	}
	if err := a.gjson("POST", gAPI+"/files/"+url.PathEscape(id)+"/permissions", map[string]any{"role": "reader", "type": "anyone"}, nil); err != nil {
		return "", err
	}
	return "https://drive.google.com/file/d/" + id + "/view", nil
}

// ---------------------------------------------------------------- listing cache + jobs

func refreshAcct(a *cloudAcct) {
	files, used, cp, err := a.list()
	cloudMu.Lock()
	c := cloudCache{files: files, used: used, cap_: cp, at: time.Now()}
	if err != nil {
		c = cloudList[a.ID]
		c.err, c.at = err.Error(), time.Now()
	}
	cloudList[a.ID] = c
	cloudMu.Unlock()
	mu.Lock()
	bump()
	mu.Unlock()
}

type progReader struct {
	r     io.Reader
	n, of int64
	job   *cloudJob
	last  time.Time
}

func (p *progReader) Read(b []byte) (int, error) {
	n, err := p.r.Read(b)
	p.n += int64(n)
	if time.Since(p.last) > 400*time.Millisecond && p.of > 0 {
		p.last = time.Now()
		cloudMu.Lock()
		p.job.Pct = float64(p.n) / float64(p.of)
		cloudMu.Unlock()
		mu.Lock()
		bump()
		mu.Unlock()
	}
	return n, err
}

func newJob(acct, name, dir string) *cloudJob {
	j := &cloudJob{ID: rid(), Acct: acct, Name: name, Dir: dir, at: time.Now()}
	cloudMu.Lock()
	cloudJobs[j.ID] = j
	cloudMu.Unlock()
	return j
}

func endJob(j *cloudJob, err error) {
	cloudMu.Lock()
	j.Done, j.Pct, j.at = true, 1, time.Now()
	if err != nil {
		j.Err = err.Error()
	}
	cloudMu.Unlock()
	mu.Lock()
	bump()
	mu.Unlock()
}

func saveToCloud(a *cloudAcct, name string) {
	j := newJob(a.ID, name, "up")
	f, err := os.Open(filepath.Join(sharedDir, name))
	if err != nil {
		endJob(j, err)
		return
	}
	defer f.Close()
	st, _ := f.Stat()
	err = a.upload(name, &progReader{r: f, of: st.Size(), job: j}, st.Size())
	endJob(j, err)
	if err != nil {
		logf("CLOUD  %s → %s failed: %v", name, a.Name, err)
	} else {
		logf("CLOUD  %s → %s", name, a.Name)
	}
	refreshAcct(a)
}

func fetchFromCloud(a *cloudAcct, f cloudFile) {
	j := newJob(a.ID, f.Name, "down")
	resp, err := a.open(f.ID, "")
	if err != nil {
		endJob(j, err)
		return
	}
	defer resp.Body.Close()
	dest := uniquePath(safeName(f.Name))
	tmp := dest + ".part"
	out, err := os.Create(tmp)
	if err != nil {
		endJob(j, err)
		return
	}
	_, err = io.Copy(out, &progReader{r: resp.Body, of: f.Size, job: j})
	out.Close()
	if err != nil {
		os.Remove(tmp)
		endJob(j, err)
		return
	}
	os.Rename(tmp, dest)
	endJob(j, nil)
	logf("CLOUD  %s ← %s", filepath.Base(dest), a.Name)
	scanFiles()
}

// autoBackup is called after a file arrives.
func autoBackup(name string) {
	mu.Lock()
	a := findAcct(cloud.Auto)
	mu.Unlock()
	if a != nil {
		go saveToCloud(a, name)
	}
}

func cachedFile(a *cloudAcct, id string) (cloudFile, bool) {
	cloudMu.Lock()
	defer cloudMu.Unlock()
	for _, f := range cloudList[a.ID].files {
		if f.ID == id {
			return f, true
		}
	}
	return cloudFile{}, false
}

// ---------------------------------------------------------------- HTTP

// /api/cloud  (GET: listing; POST: actions) — any signed-in device if allowed
func handleCloud(w http.ResponseWriter, r *http.Request) {
	d, ok := who(r)
	if !ok {
		w.WriteHeader(401)
		return
	}
	host := d == nil
	mu.Lock()
	allowed := cloudAllowed(host)
	mu.Unlock()
	if !allowed {
		writeJSON(w, map[string]any{"ok": false, "err": "The host hasn't shared cloud storage with other devices."})
		return
	}
	if r.Method == "GET" {
		mu.Lock()
		accts := append([]*cloudAcct(nil), cloud.Accounts...)
		mu.Unlock()
		force := r.URL.Query().Get("refresh") == "1"
		var wg sync.WaitGroup
		for _, a := range accts {
			cloudMu.Lock()
			c, had := cloudList[a.ID]
			cloudMu.Unlock()
			if force || !had || time.Since(c.at) > 45*time.Second {
				wg.Add(1)
				go func(a *cloudAcct) { defer wg.Done(); refreshAcct(a) }(a)
			}
		}
		wg.Wait()
		out := map[string]any{}
		cloudMu.Lock()
		for _, a := range accts {
			c := cloudList[a.ID]
			fs := c.files
			if fs == nil {
				fs = []cloudFile{}
			}
			out[a.ID] = map[string]any{"files": fs, "err": c.err}
		}
		cloudMu.Unlock()
		writeJSON(w, map[string]any{"ok": true, "lists": out})
		return
	}
	if r.Method != "POST" {
		w.WriteHeader(405)
		return
	}
	var in struct {
		Op, Acct, ID, File string
		On                 bool
	}
	readJSON(r, &in)
	mu.Lock()
	a := findAcct(in.Acct)
	mu.Unlock()
	if a == nil {
		writeJSON(w, map[string]any{"ok": false, "err": "That cloud account isn't connected any more."})
		return
	}
	switch in.Op {
	case "save":
		name := filepath.Base(in.File)
		if _, err := os.Stat(filepath.Join(sharedDir, name)); err != nil || name == "." || name == "/" {
			writeJSON(w, map[string]any{"ok": false, "err": "File not found"})
			return
		}
		go saveToCloud(a, name)
	case "fetch":
		f, ok := cachedFile(a, in.ID)
		if !ok {
			writeJSON(w, map[string]any{"ok": false, "err": "File not found in the cloud"})
			return
		}
		go fetchFromCloud(a, f)
	case "delete":
		if err := a.remove(in.ID); err != nil {
			writeJSON(w, map[string]any{"ok": false, "err": err.Error()})
			return
		}
		logf("CLOUD  deleted a file from %s", a.Name)
		go refreshAcct(a)
	case "share":
		link, err := a.share(in.ID, in.On)
		if err != nil {
			writeJSON(w, map[string]any{"ok": false, "err": err.Error()})
			return
		}
		go refreshAcct(a)
		writeJSON(w, map[string]any{"ok": true, "link": link})
		return
	default:
		w.WriteHeader(400)
		return
	}
	writeJSON(w, map[string]any{"ok": true})
}

// /cloud/f/<acct>/<id> — stream a cloud file through the host
func handleCloudFile(w http.ResponseWriter, r *http.Request) {
	d, ok := who(r)
	if !ok {
		w.WriteHeader(401)
		return
	}
	mu.Lock()
	allowed := cloudAllowed(d == nil)
	parts := strings.SplitN(strings.TrimPrefix(r.URL.Path, "/cloud/f/"), "/", 2)
	var a *cloudAcct
	if len(parts) == 2 {
		a = findAcct(parts[0])
	}
	mu.Unlock()
	if !allowed || a == nil {
		http.NotFound(w, r)
		return
	}
	f, ok := cachedFile(a, parts[1])
	if !ok {
		http.NotFound(w, r)
		return
	}
	resp, err := a.open(f.ID, r.Header.Get("Range"))
	if err != nil {
		http.Error(w, err.Error(), 502)
		return
	}
	defer resp.Body.Close()
	for _, k := range []string{"Content-Length", "Content-Range", "Accept-Ranges"} {
		if v := resp.Header.Get(k); v != "" {
			w.Header().Set(k, v)
		}
	}
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", "attachment; filename*=UTF-8''"+url.PathEscape(f.Name))
	w.Header().Set("Content-Security-Policy", "sandbox")
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

// /host/cloud — account management (host only)
func handleHostCloud(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Op, ID, Name, URL, User, Pass, ClientID, Secret string
		On                                              bool
	}
	readJSON(r, &in)
	fail := func(s string) { writeJSON(w, map[string]any{"ok": false, "err": s}) }
	switch in.Op {
	case "webdav":
		u := strings.TrimSpace(in.URL)
		pu, err := url.Parse(u)
		if err != nil || (pu.Scheme != "https" && os.Getenv("ONEEYE_GOOGLE_BASE") == "") || pu.Host == "" {
			fail("Enter the full https:// WebDAV address from your provider.")
			return
		}
		a := &cloudAcct{ID: rid(), Kind: "webdav", URL: u, User: strings.TrimSpace(in.User), Pass: in.Pass, Name: strings.TrimSpace(in.Name)}
		if a.Name == "" {
			a.Name = pu.Host
		}
		if _, _, _, err := a.list(); err != nil {
			fail("Couldn't connect: " + err.Error())
			return
		}
		mu.Lock()
		cloud.Accounts = append(cloud.Accounts, a)
		save()
		mu.Unlock()
		logf("CLOUD  connected %s", a.Name)
		go refreshAcct(a)
	case "remove":
		mu.Lock()
		for i, a := range cloud.Accounts {
			if a.ID == in.ID {
				cloud.Accounts = append(cloud.Accounts[:i], cloud.Accounts[i+1:]...)
				if cloud.Auto == a.ID {
					cloud.Auto = ""
				}
				logf("CLOUD  disconnected %s", a.Name)
				if a.Kind == "gdrive" && a.Refresh != "" {
					go cloudHTTP.Post(gAuthBase+"/revoke", "application/x-www-form-urlencoded", strings.NewReader("token="+url.QueryEscape(a.Refresh)))
				}
				break
			}
		}
		save()
		bump()
		mu.Unlock()
	case "auto":
		mu.Lock()
		if in.On && findAcct(in.ID) != nil {
			cloud.Auto = in.ID
		} else if !in.On && cloud.Auto == in.ID {
			cloud.Auto = ""
		}
		save()
		bump()
		mu.Unlock()
	case "allowDevices":
		mu.Lock()
		cloud.AllowDevices = in.On
		save()
		bump()
		mu.Unlock()
	case "googleApp":
		mu.Lock()
		cloud.GClientID, cloud.GSecret = strings.TrimSpace(in.ClientID), strings.TrimSpace(in.Secret)
		save()
		bump()
		mu.Unlock()
	default:
		w.WriteHeader(400)
		return
	}
	writeJSON(w, map[string]any{"ok": true})
}

func pkce() (verifier, challenge string) {
	b := make([]byte, 32)
	rand.Read(b)
	verifier = base64.RawURLEncoding.EncodeToString(b)
	s := sha256.Sum256([]byte(verifier))
	return verifier, base64.RawURLEncoding.EncodeToString(s[:])
}

func redirectURI(r *http.Request) string {
	return fmt.Sprintf("http://127.0.0.1:%d/oauth/google", port)
}

// /cloud/google/start (host only) → Google sign-in
func handleGoogleStart(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	id, _ := gClient()
	mu.Unlock()
	if id == "" {
		http.Error(w, "Google Drive isn't set up in this build. Add your own Google app in Control → Cloud.", 400)
		return
	}
	state := rid() + rid()
	v, ch := pkce()
	cloudMu.Lock()
	oauthWait[state] = v
	cloudMu.Unlock()
	q := url.Values{"client_id": {id}, "redirect_uri": {redirectURI(r)}, "response_type": {"code"},
		"scope": {"https://www.googleapis.com/auth/drive.file openid email"}, "access_type": {"offline"}, "prompt": {"consent"},
		"state": {state}, "code_challenge": {ch}, "code_challenge_method": {"S256"}}
	http.Redirect(w, r, "https://accounts.google.com/o/oauth2/v2/auth?"+q.Encode(), http.StatusFound)
}

// /oauth/google — Google sends the browser back here
func handleGoogleCallback(w http.ResponseWriter, r *http.Request) {
	page := func(title, msg string) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		fmt.Fprintf(w, `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>1EYE</title>
<body style="margin:0;display:grid;place-items:center;min-height:100vh;background:#07060b;color:#e9e7f2;font:15px system-ui,sans-serif;text-align:center">
<div style="padding:30px;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(255,255,255,.04);max-width:420px"><h2 style="margin:0 0 8px">%s</h2><p style="color:#b9b6cc">%s</p>
<a href="/#control" style="color:#a995ff">Back to 1EYE</a></div></body>`, title, msg)
	}
	q := r.URL.Query()
	cloudMu.Lock()
	v, ok := oauthWait[q.Get("state")]
	delete(oauthWait, q.Get("state"))
	cloudMu.Unlock()
	if !ok {
		page("Link expired", "Start again from Control → Cloud in 1EYE.")
		return
	}
	if e := q.Get("error"); e != "" {
		page("Not connected", "Google said: "+htmlEsc(e))
		return
	}
	mu.Lock()
	id, secret := gClient()
	mu.Unlock()
	var tok struct {
		Access  string `json:"access_token"`
		Refresh string `json:"refresh_token"`
		Expires int    `json:"expires_in"`
		IDTok   string `json:"id_token"`
		Err     string `json:"error"`
		Desc    string `json:"error_description"`
	}
	form := url.Values{"code": {q.Get("code")}, "client_id": {id}, "client_secret": {secret}, "redirect_uri": {redirectURI(r)},
		"grant_type": {"authorization_code"}, "code_verifier": {v}}
	if err := postForm(gAuthBase+"/token", form, &tok); err != nil || tok.Refresh == "" {
		msg := tok.Desc
		if err != nil {
			msg = err.Error()
		}
		page("Not connected", "Google didn't give 1EYE access. "+htmlEsc(msg))
		return
	}
	email := ""
	if p := strings.Split(tok.IDTok, "."); len(p) == 3 {
		if b, err := base64.RawURLEncoding.DecodeString(p[1]); err == nil {
			var c struct{ Email string }
			json.Unmarshal(b, &c)
			email = c.Email
		}
	}
	a := &cloudAcct{ID: rid(), Kind: "gdrive", Name: "Google Drive", Email: email, Refresh: tok.Refresh,
		access: tok.Access, expiry: time.Now().Add(time.Duration(tok.Expires) * time.Second)}
	mu.Lock()
	for i, x := range cloud.Accounts { // reconnecting the same Google account replaces it
		if x.Kind == "gdrive" && x.Email == email && email != "" {
			a.ID, a.Folder = x.ID, x.Folder
			cloud.Accounts[i] = a
			a = nil
			break
		}
	}
	if a != nil {
		cloud.Accounts = append(cloud.Accounts, a)
	} else {
		a = findAcct(func() string {
			for _, x := range cloud.Accounts {
				if x.Email == email && x.Kind == "gdrive" {
					return x.ID
				}
			}
			return ""
		}())
	}
	save()
	bump()
	mu.Unlock()
	logf("CLOUD  connected Google Drive %s", email)
	go refreshAcct(a)
	page("Google Drive connected", "1EYE can now save files to a “1EYE” folder in "+htmlEsc(email)+". You can close this tab.")
}

func htmlEsc(s string) string {
	return strings.NewReplacer("&", "&amp;", "<", "&lt;", ">", "&gt;", `"`, "&quot;").Replace(s)
}
