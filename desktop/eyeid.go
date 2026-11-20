package main

// Eye ID — sign in by face instead of typing the PIN.
//
// The host enrols once from Control: the browser on the host computer turns a few camera
// frames into 128-number face descriptors (face-api, on-device) and only those numbers are
// stored here, in data.json. No photo is ever saved or sent anywhere.
//
// To sign in, a device runs the same model on its own camera after a blink check and sends
// one descriptor. The host compares it with the enrolled ones and lets it in on a close match.
// Wrong faces count as wrong PINs, so the same lock-outs apply. The PIN always keeps working.
//
// Honest limits: this is a webcam face match, not Apple Face ID (no depth sensor). A good photo
// or video of the owner could fool it, so the strict threshold, the blink check and the lock-outs
// are there to make that harder, and the host can switch Eye ID off at any time.

import (
	"math"
	"net/http"
)

const (
	eyeIDThreshold = 0.42 // Euclidean distance; face-api's usual 0.6 is too loose for a password
	eyeIDMaxShots  = 8
)

var eyeIDs [][]float32 // enrolled descriptors (mu)

func validDesc(d []float64) bool {
	if len(d) != 128 {
		return false
	}
	var n float64
	for _, v := range d {
		if math.IsNaN(v) || math.IsInf(v, 0) || math.Abs(v) > 2 {
			return false
		}
		n += v * v
	}
	return n > 0.1
}

// eyeIDDistance returns the closest distance to an enrolled face (mu held).
func eyeIDDistance(d []float64) float64 {
	best := math.Inf(1)
	for _, e := range eyeIDs {
		var s float64
		for i := range e {
			x := float64(e[i]) - d[i]
			s += x * x
		}
		if s = math.Sqrt(s); s < best {
			best = s
		}
	}
	return best
}

// GET /api/eyeid — tells the sign-in page whether to offer Eye ID.
func handleEyeIDStatus(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	on := len(eyeIDs) > 0
	mu.Unlock()
	writeJSON(w, map[string]any{"on": on})
}

// POST /host/eyeid {descs:[[128]...]} enrols; {clear:true} removes Eye ID.
func handleHostEyeID(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Descs [][]float64
		Clear bool
	}
	if readJSON(r, &in) != nil {
		writeJSON(w, map[string]any{"ok": false, "err": "Bad request"})
		return
	}
	if in.Clear {
		mu.Lock()
		eyeIDs = nil
		save()
		bump()
		mu.Unlock()
		logf("EYE ID  removed")
		writeJSON(w, map[string]any{"ok": true})
		return
	}
	if len(in.Descs) < 3 || len(in.Descs) > eyeIDMaxShots {
		writeJSON(w, map[string]any{"ok": false, "err": "Need 3 to 8 face scans"})
		return
	}
	var out [][]float32
	for _, d := range in.Descs {
		if !validDesc(d) {
			writeJSON(w, map[string]any{"ok": false, "err": "A scan was unreadable. Try again in better light."})
			return
		}
		f := make([]float32, 128)
		for i, v := range d {
			f[i] = float32(v)
		}
		out = append(out, f)
	}
	// every scan must agree with the others, otherwise two people (or a bad frame) were enrolled
	for i := range out {
		for j := i + 1; j < len(out); j++ {
			var s float64
			for k := range out[i] {
				x := float64(out[i][k] - out[j][k])
				s += x * x
			}
			if math.Sqrt(s) > 0.5 {
				writeJSON(w, map[string]any{"ok": false, "err": "The scans don't match each other. Keep only your face in view and try again."})
				return
			}
		}
	}
	mu.Lock()
	eyeIDs = out
	save()
	bump()
	mu.Unlock()
	logf("EYE ID  enrolled (%d scans)", len(out))
	writeJSON(w, map[string]any{"ok": true})
}
