/* 1EYE — the eye watches you back. Opt-in camera tracking that runs entirely on this device:
   the video never leaves the browser. Face detection: face-api (MIT) with the tiny detector
   and 68-point landmarks, loaded only after you press the button. It follows your face,
   blinks when you blink, and its pupil reacts to how close you are. */
(() => {
  const btn = document.getElementById("cam");
  if (!btn) return;
  const note = document.getElementById("camnote"), vid = document.getElementById("camv"), ro = document.getElementById("ro-gaze"), mode = document.querySelector(".ro4");
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext) { btn.hidden = true; if (note) note.hidden = true; return; }
  let stream = null, running = false, lost = 0, closed = false;
  const say = t => { if (note) note.textContent = t; };
  const load = src => new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const ear = p => (d(p[1], p[5]) + d(p[2], p[4])) / (2 * d(p[0], p[3]));   // eye aspect ratio

  async function start() {
    btn.disabled = true; btn.textContent = "[ Waking up… ]";
    try {
      if (!window.faceapi) await load("/vendor/face-api.js?v=1");
      await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri("/vendor/models"), faceapi.nets.faceLandmark68TinyNet.loadFromUri("/vendor/models")]);
      say("Allow the camera to let the eye see you.");
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 } }, audio: false });
    } catch (e) {
      btn.disabled = false; btn.textContent = "[ Let it see you ]";
      say(e && e.name === "NotAllowedError" ? "Camera blocked. The eye goes back to your cursor." : "No camera found. The eye goes back to your cursor.");
      return;
    }
    vid.srcObject = stream; vid.hidden = false; await vid.play().catch(() => {});
    running = true; btn.disabled = false; btn.textContent = "[ ● Stop watching ]"; btn.classList.add("on");
    say("Tracking on this device only. Nothing is uploaded.");
    if (mode) mode.textContent = "[ Live · Cam ]";
    loop();
  }
  function stop() {
    running = false; if (stream) stream.getTracks().forEach(t => t.stop()); stream = null;
    vid.hidden = true; btn.textContent = "[ Let it see you ]"; btn.classList.remove("on");
    say("Camera off."); if (mode) mode.textContent = "[ Live · WebGL ]";
  }
  const opts = () => new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 });
  async function loop() {
    if (!running) return;
    if (!document.hidden && vid.readyState >= 2) {
      try {
        const r = await faceapi.detectSingleFace(vid, opts()).withFaceLandmarks(true);
        const E = window.EYE;
        if (r && E) {
          if (lost >= 12) say("Tracking on this device only. Nothing is uploaded.");
          lost = 0;
          const b = r.detection.box, W = vid.videoWidth, H = vid.videoHeight;
          const nx = (b.x + b.width / 2) / W * 2 - 1, ny = (b.y + b.height * .42) / H * 2 - 1;
          // the camera sees you mirrored: your left is its right
          E.track(-nx * 1.6, -ny * 1.5);
          if (E.dilate) E.dilate(.1 + Math.min(.1, b.width / W * .16));
          const pts = r.landmarks.positions, k = (ear(pts.slice(36, 42)) + ear(pts.slice(42, 48))) / 2;
          if (k < .2 && !closed) { closed = true; E.blink && E.blink(); } else if (k > .25) closed = false;
          if (ro) ro.textContent = "Face " + (-nx >= 0 ? "+" : "") + (-nx).toFixed(2) + " / " + (-ny >= 0 ? "+" : "") + (-ny).toFixed(2);
        } else if (++lost === 12) say("Lost you. Come back into view.");
      } catch (e) { console.warn(e); }
    }
    setTimeout(() => requestAnimationFrame(loop), 60);
  }
  btn.addEventListener("click", () => running ? stop() : start());
  addEventListener("pagehide", stop);
})();
