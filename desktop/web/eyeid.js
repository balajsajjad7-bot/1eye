/* 1EYE — Eye ID. Face sign-in that runs on the device: the camera image never leaves the browser.
   face-api (MIT, github.com/vladmandic/face-api) finds the face, checks for a real blink and turns
   the face into 128 numbers. Only those numbers are sent to the host. */
window.EyeID = (() => {
  let ready = null;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const load = src => new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => no(new Error("load")); document.head.appendChild(s); });
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const ear = p => (dist(p[1], p[5]) + dist(p[2], p[4])) / (2 * dist(p[0], p[3]));
  const openness = pts => (ear(pts.slice(36, 42)) + ear(pts.slice(42, 48))) / 2;

  const available = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.isSecureContext);

  function init() {
    if (!ready) ready = (async () => {
      if (!window.faceapi) await load("/assets/vendor/face-api.js");
      const u = "/assets/vendor/models", n = faceapi.nets;
      await Promise.all([n.tinyFaceDetector.loadFromUri(u), n.faceLandmark68TinyNet.loadFromUri(u), n.faceRecognitionNet.loadFromUri(u)]);
    })().catch(e => { ready = null; throw e; });
    return ready;
  }

  // a full-screen scanner: round mirrored camera, a progress ring and one line of guidance
  function ui(title) {
    const el = document.createElement("div");
    el.className = "eidov";
    el.innerHTML = `<div class="eidbox"><div class="eidlbl">${title}</div>
      <div class="eidcam"><video playsinline muted></video><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" class="eidtrack"/><circle cx="50" cy="50" r="48" class="eidring" pathLength="100"/></svg></div>
      <div class="eidmsg">Starting the camera…</div><div class="eidsub">Your camera image stays on this device.</div>
      <button class="btn sm eidx" type="button">Cancel</button></div>`;
    document.body.appendChild(el);
    const video = el.querySelector("video"), msg = el.querySelector(".eidmsg"), ring = el.querySelector(".eidring");
    let stream = null, cancelled = false;
    const api = {
      video,
      say(t, state) { msg.textContent = t; el.dataset.state = state || ""; },
      progress(k) { ring.style.strokeDashoffset = String(100 - Math.max(0, Math.min(1, k)) * 100); },
      async open() {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 360 } }, audio: false });
        video.srcObject = stream; await video.play().catch(() => {});
        for (let i = 0; i < 40 && !video.videoWidth; i++) await sleep(50);
      },
      get cancelled() { return cancelled; },
      close() { cancelled = true; if (stream) stream.getTracks().forEach(t => t.stop()); el.classList.add("out"); setTimeout(() => el.remove(), 300); },
    };
    el.querySelector(".eidx").onclick = () => api.close();
    api.progress(0);
    return api;
  }

  /* Watch the camera until we have `shots` good descriptors of one face.
     With blink:true the person must open, close and reopen their eyes first (a photo can't blink). */
  async function scan(s, { shots = 3, blink = true, timeout = 25000 } = {}) {
    const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
    const t0 = Date.now(), out = [];
    let stage = blink ? 0 : 3; // 0 want open, 1 want closed, 2 want reopened, 3 collecting
    while (!s.cancelled) {
      if (Date.now() - t0 > timeout) throw new Error("timeout");
      const all = await faceapi.detectAllFaces(s.video, opts).withFaceLandmarks(true).withFaceDescriptors();
      if (s.cancelled) break;
      if (!all.length) { s.say("Look straight at the camera"); await sleep(60); continue; }
      if (all.length > 1) { s.say("Only one face in view, please", "warn"); await sleep(60); continue; }
      const f = all[0], W = s.video.videoWidth || 480;
      if (f.detection.box.width < W * 0.22) { s.say("Come a little closer"); continue; }
      const k = openness(f.landmarks.positions);
      if (stage === 0) { if (k > 0.26) { stage = 1; } s.say("Hold still…"); s.progress(.12); continue; }
      if (stage === 1) { s.say("Now blink slowly", "blink"); if (k < 0.2) { stage = 2; s.progress(.3); } continue; }
      if (stage === 2) { if (k > 0.25) { stage = 3; s.progress(.4); } continue; }
      if (k < 0.23) continue; // wait for open eyes
      out.push(Array.from(f.descriptor));
      s.progress(.4 + .6 * out.length / shots);
      s.say(shots > 1 ? `Got it. Hold still… ${out.length}/${shots}` : "Got it", "ok");
      if (out.length >= shots) return out;
      await sleep(shots > 3 ? 320 : 120);
    }
    throw new Error("cancelled");
  }

  const mean = ds => ds[0].map((_, i) => ds.reduce((a, d) => a + d[i], 0) / ds.length);
  const why = e => e && e.name === "NotAllowedError" ? "Camera permission was blocked." : e && e.name === "NotFoundError" ? "No camera found on this device." :
    e && e.message === "timeout" ? "Couldn't get a clear look. Try again in better light." : e && e.message === "load" ? "Couldn't load Eye ID. Refresh and try again." : "Eye ID stopped.";

  /* Sign in: blink check, three scans averaged into one descriptor, sent to the host. */
  async function signIn(name) {
    const s = ui("Eye ID");
    try {
      await init(); await s.open();
      const d = mean(await scan(s, { shots: 3, blink: true }));
      s.say("Checking…");
      const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ face: d, name }) }).then(r => r.json()).catch(() => ({ ok: false, err: "Host unreachable" }));
      if (r.ok) { s.say("Welcome back", "ok"); s.progress(1); await sleep(450); s.close(); return { ok: true }; }
      s.say(r.err || "Face not recognised", "warn"); await sleep(1600); s.close(); return { ok: false, err: r.err };
    } catch (e) {
      if (!s.cancelled) { s.say(why(e), "warn"); await sleep(1800); s.close(); }
      return { ok: false, err: s.cancelled ? "" : why(e) };
    }
  }

  /* Enrol (host only): blink check, then five scans a moment apart. */
  async function enrol() {
    const s = ui("Set up Eye ID");
    try {
      await init(); await s.open();
      const ds = await scan(s, { shots: 5, blink: true, timeout: 40000 });
      s.say("Saving…");
      const r = await fetch("/host/eyeid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ descs: ds }) }).then(r => r.json()).catch(() => ({ ok: false, err: "Host unreachable" }));
      s.say(r.ok ? "Eye ID is ready" : (r.err || "Couldn't save"), r.ok ? "ok" : "warn"); s.progress(r.ok ? 1 : 0);
      await sleep(r.ok ? 900 : 2200); s.close(); return r;
    } catch (e) {
      if (!s.cancelled) { s.say(why(e), "warn"); await sleep(1800); s.close(); }
      return { ok: false, err: s.cancelled ? "" : why(e) };
    }
  }

  return { available, init, signIn, enrol };
})();
