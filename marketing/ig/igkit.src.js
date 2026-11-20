/* 1EYE Instagram kit — builds a post (1080×1350 JPEG) or a reel (1080×1920 MP4) entirely in the page,
   with the live noir eye, then hands it to Instagram's own upload field. Needs window.Noir (noir.js) and
   its own tiny MP4 writer. Reels are encoded frame by frame with WebCodecs, so
   they come out smooth even when the tab is in the background. */
window.IGKit = (() => {
  const INK = "#f1f0eb", MUTED = "#8d8c86", DIM = "#55544f", ACC = "#c9f27a", RED = "#e0483c", BG = "#050505";
  const SANS = '"Segoe UI Variable Display","Segoe UI","Helvetica Neue",Arial,sans-serif';
  const MONO = '"Cascadia Mono","JetBrains Mono",Consolas,"SFMono-Regular",monospace';

  function eye(w, h, zoom) {
    const c = document.createElement("canvas");
    let T = 2000 + Math.random() * 5000;
    const E = Noir.make(c, { clock: () => T, width: w, height: h, scale: 1, zoom, snapshot: true });
    return { c, step(dt) { T += dt * 1000; E.tick(dt, T); }, look(x, y) { E.look(x, y); }, blink() { E.blink && E.blink(); } };
  }
  function grid(g, W, H) {
    g.fillStyle = "rgba(241,240,235,.10)";
    for (let y = 60; y < H; y += 120) for (let x = 60; x < W; x += 120) { g.fillRect(x - 6, y, 13, 1); g.fillRect(x, y - 6, 1, 13); }
  }
  function spaced(g, text, x, y, gap) { for (const ch of text) { g.fillText(ch, x, y); x += g.measureText(ch).width + gap; } return x; }
  function corners(g, x, y, w, h, n) {
    g.strokeStyle = "rgba(241,240,235,.35)"; g.lineWidth = 2;
    for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
      g.beginPath(); g.moveTo(cx, cy + sy * n); g.lineTo(cx, cy); g.lineTo(cx + sx * n, cy); g.stroke();
    }
  }
  function lines(g, arr, x, y, size, lh) {
    // arr: strings; a line starting with "~" is muted
    g.font = `700 ${size}px ${SANS}`; if ("letterSpacing" in g) g.letterSpacing = `${-size * .035}px`;
    arr.forEach((t, i) => { const m = t[0] === "~"; g.fillStyle = m ? MUTED : INK; g.fillText(m ? t.slice(1) : t, x, y + i * lh); });
    if ("letterSpacing" in g) g.letterSpacing = "0px";
  }
  function fitSize(g, arr, max, size) {
    for (; size > 40; size -= 2) { g.font = `700 ${size}px ${SANS}`; if (arr.every(t => g.measureText(t.replace(/^~/, "")).width <= max)) break; }
    return size;
  }

  /* POST: label, headline lines, the eye in a viewfinder, footer. */
  async function post({ label = "1EYE / OPEN SOURCE LAB", title = ["One eye.", "~Open source."], body = "", index = "", cta = "1eye.dpdns.org" } = {}) {
    const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"); g.fillStyle = BG; g.fillRect(0, 0, W, H); grid(g, W, H);
    g.font = `500 22px ${MONO}`; g.fillStyle = ACC; g.textBaseline = "alphabetic";
    g.fillRect(72, 92, 40, 2); g.fillStyle = INK; spaced(g, label.toUpperCase(), 128, 100, 3);
    const size = fitSize(g, title, W - 144, 118);
    lines(g, title, 68, 150 + size, size, size * 1.02);
    const top = 150 + size * title.length * 1.02 + 30;
    const ew = W - 120, eh = Math.min(560, H - top - 210);
    const e = eye(ew, eh, .78); for (let i = 0; i < 50; i++) e.step(1 / 30);
    g.drawImage(e.c, 60, top, ew, eh); corners(g, 60, top, ew, eh, 34);
    g.font = `500 18px ${MONO}`; g.fillStyle = MUTED;
    spaced(g, "[ MACRO 1:1 ]", 84, top + 34, 2); spaced(g, "[ LIVE · NOIR ]", W - 270, top + eh - 18, 2);
    if (body) { g.font = `400 30px ${SANS}`; g.fillStyle = MUTED; wrap(g, body, 68, top + eh + 62, W - 140, 40); }
    g.fillStyle = "rgba(241,240,235,.18)"; g.fillRect(68, H - 112, W - 136, 1);
    g.font = `800 34px ${SANS}`; g.fillStyle = INK; spaced(g, "1EYE", 68, H - 58, 3);
    g.font = `500 22px ${MONO}`; g.fillStyle = MUTED; spaced(g, cta, 188, H - 61, 1);
    if (index) { g.fillStyle = ACC; spaced(g, `[ ${index} ]`, W - 210, H - 61, 2); }
    const blob = await new Promise(r => c.toBlob(r, "image/jpeg", .94));
    return new File([blob], "1eye-post.jpg", { type: "image/jpeg" });
  }
  function wrap(g, text, x, y, max, lh) {
    let line = "", n = 0;
    for (const w of text.split(" ")) { const t = line ? line + " " + w : w; if (g.measureText(t).width > max && line) { g.fillText(line, x, y + n++ * lh); line = w; } else line = t; }
    if (line) g.fillText(line, x, y + n * lh);
  }

  /* minimal MP4 writer: one H.264 track, all samples in one chunk, moov before mdat */
  function mp4(samples, avcC, W, H, fps) {
    const TS = fps * 1000, N = samples.length, dur = N * 1000;
    const u32 = n => [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255], u16 = n => [n >> 8 & 255, n & 255];
    const str = s => [...s].map(ch => ch.charCodeAt(0));
    const box = (t, ...parts) => { const body = parts.flat(Infinity); return [...u32(body.length + 8), ...str(t), ...body]; };
    const full = (t, v, f, ...p) => box(t, [v, ...u32(f).slice(1)], ...p);
    const matrix = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x40, 0, 0, 0];
    const keys = samples.map((s, i) => s.key ? i + 1 : 0).filter(Boolean);
    const total = samples.reduce((a, s) => a + s.data.length, 0);
    const moov = off => box("moov",
      full("mvhd", 0, 0, u32(0), u32(0), u32(TS), u32(dur), u32(0x10000), u16(0x100), new Array(10).fill(0), matrix, new Array(24).fill(0), u32(2)),
      box("trak",
        full("tkhd", 0, 3, u32(0), u32(0), u32(1), u32(0), u32(dur), new Array(8).fill(0), u16(0), u16(0), u16(0), u16(0), matrix, u32(W << 16), u32(H << 16)),
        box("mdia",
          full("mdhd", 0, 0, u32(0), u32(0), u32(TS), u32(dur), u16(0x55c4), u16(0)),
          full("hdlr", 0, 0, u32(0), str("vide"), new Array(12).fill(0), str("1EYE\0")),
          box("minf",
            full("vmhd", 0, 1, new Array(8).fill(0)),
            box("dinf", full("dref", 0, 0, u32(1), full("url ", 0, 1))),
            box("stbl",
              full("stsd", 0, 0, u32(1), box("avc1", new Array(6).fill(0), u16(1), new Array(16).fill(0), u16(W), u16(H), u32(0x480000), u32(0x480000), u32(0), u16(1), new Array(32).fill(0), u16(0x18), u16(0xffff), box("avcC", [...avcC]))),
              full("stts", 0, 0, u32(1), u32(N), u32(1000)),
              full("stss", 0, 0, u32(keys.length), keys.map(u32)),
              full("stsc", 0, 0, u32(1), u32(1), u32(N), u32(1)),
              full("stsz", 0, 0, u32(0), u32(N), samples.map(s => u32(s.data.length))),
              full("stco", 0, 0, u32(1), u32(off)))))));
    const ftyp = box("ftyp", str("isom"), u32(512), str("isomiso2avc1mp41"));
    const head = ftyp.length + moov(0).length + 8;
    const out = new Uint8Array(head + total);
    out.set(ftyp, 0); out.set(moov(head), ftyp.length);
    out.set([...u32(total + 8), ...str("mdat")], head - 8);
    let o = head; for (const s of samples) { out.set(s.data, o); o += s.data.length; }
    return out;
  }

  /* REEL: the eye fills the frame, darting and blinking; captions appear in sequence.
     beats: [{t:"Stop emailing", at:0.2}, {t:"~files to yourself.", at:1.2}, ...]; seconds: length */
  async function reel({ beats = [], seconds = 8, label = "1EYE", cta = "1eye.dpdns.org", fps = 30 } = {}) {
    const W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d");
    const e = eye(W, 1150, .62);
    const samples = []; let avcC = null, err = null;
    const enc = new VideoEncoder({
      output: (ch, meta) => { if (meta && meta.decoderConfig && meta.decoderConfig.description) avcC = new Uint8Array(meta.decoderConfig.description); const d = new Uint8Array(ch.byteLength); ch.copyTo(d); samples.push({ data: d, key: ch.type === "key" }); },
      error: x => err = x });
    enc.configure({ codec: "avc1.42E028", width: W, height: H, bitrate: 7_000_000, framerate: fps, latencyMode: "quality", avc: { format: "avc" } });
    const frames = Math.round(seconds * fps), ease = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
    for (let f = 0; f < frames; f++) {
      const t = f / fps;
      e.step(1 / fps);
      g.fillStyle = BG; g.fillRect(0, 0, W, H); grid(g, W, H);
      g.drawImage(e.c, 0, 470);
      g.font = `500 26px ${MONO}`; g.fillStyle = ACC; g.fillRect(72, 132, 44, 2); g.fillStyle = INK; spaced(g, label.toUpperCase(), 134, 141, 4);
      let y = 300;
      const size = fitSize(g, beats.map(b => b.t), W - 144, 104);
      for (const b of beats) {
        const k = ease((t - b.at) / .45); if (k <= 0) { y += size * 1.05; continue; }
        g.globalAlpha = k; g.save(); g.translate(0, (1 - k) * 40);
        lines(g, [b.t], 68, y, size, size); g.restore(); g.globalAlpha = 1; y += size * 1.05;
      }
      const k = ease((t - (seconds - 2.4)) / .5);
      if (k > 0) {
        g.globalAlpha = k;
        g.font = `800 64px ${SANS}`; g.fillStyle = INK; spaced(g, "1EYE", 68, H - 250, 4);
        g.font = `500 34px ${MONO}`; g.fillStyle = ACC; spaced(g, cta, 70, H - 190, 2);
        g.font = `500 26px ${MONO}`; g.fillStyle = MUTED; spaced(g, "FREE · OPEN SOURCE · LINK IN BIO", 70, H - 140, 3);
        g.globalAlpha = 1;
      }
      const vf = new VideoFrame(c, { timestamp: Math.round(f * 1e6 / fps), duration: Math.round(1e6 / fps) });
      enc.encode(vf, { keyFrame: f % (fps * 2) === 0 }); vf.close();
      if (enc.encodeQueueSize > 8) await new Promise(r => setTimeout(r, 5));
      if (err) throw err;
    }
    await enc.flush(); if (!avcC) throw new Error("encoder gave no avcC");
    return new File([mp4(samples, avcC, W, H, fps)], "1eye-reel.mp4", { type: "video/mp4" });
  }

  /* Hand the file to Instagram's create-post upload field (the one that also takes video). */
  function attach(file) {
    const inputs = [...document.querySelectorAll("input[type=file]")];
    const inp = inputs.find(i => /video\/mp4/.test(i.accept || "")) || inputs[inputs.length - 1];
    if (!inp) return "no upload field: open Create first";
    const dt = new DataTransfer(); dt.items.add(file); inp.files = dt.files;
    inp.dispatchEvent(new Event("change", { bubbles: true }));
    return "attached " + file.name + " (" + Math.round(file.size / 1024) + " KB)";
  }
  return { post, reel, attach };
})();
