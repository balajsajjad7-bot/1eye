/* 1EYE Shift — convert files in the browser. Nothing is uploaded: every conversion runs on this device.
   Libraries load only when a format needs them (pdf-lib, pdf.js, heic2any, SheetJS, js-yaml, mammoth,
   marked, fflate, ffmpeg.wasm). */
(() => {
  const $ = s => document.querySelector(s);
  const V = "/shift/vendor/";
  const FF_CORE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/";
  const loaded = {};
  const script = src => loaded[src] || (loaded[src] = new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => no(new Error("Couldn't load " + src)); document.head.appendChild(s); }));
  const ext = n => (n.split(".").pop() || "").toLowerCase();
  const base = n => n.replace(/\.[^.]+$/, "");
  const human = b => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";

  /* ---------- what can become what ---------- */
  const KIND = {
    image: ["jpg", "jpeg", "png", "webp", "gif", "bmp", "avif", "svg", "ico", "heic", "heif", "tif", "tiff", "jfif"],
    pdf: ["pdf"],
    video: ["mp4", "mov", "webm", "mkv", "avi", "m4v", "3gp", "wmv", "flv", "mpeg", "mpg", "ts"],
    audio: ["mp3", "wav", "ogg", "m4a", "aac", "flac", "opus", "wma", "amr", "aiff"],
    data: ["csv", "tsv", "json", "xlsx", "xls", "ods", "yaml", "yml"],
    doc: ["docx", "md", "markdown", "txt", "html", "htm"],
  };
  const TARGETS = {
    image: ["jpg", "png", "webp", "pdf", "ico"],
    pdf: ["png", "jpg", "txt", "pdf+"],
    video: ["mp4", "webm", "gif", "mp3", "wav", "m4a"],
    audio: ["mp3", "wav", "m4a", "ogg", "flac"],
    data: ["csv", "json", "xlsx", "yaml", "tsv", "html"],
    doc: ["pdf", "html", "txt", "md"],
  };
  const LABEL = { "pdf+": "Merge PDFs", md: "Markdown", txt: "Text", html: "HTML" };
  const kindOf = f => { const e = ext(f.name); for (const k in KIND) if (KIND[k].includes(e)) return k; if (f.type.startsWith("image/")) return "image"; if (f.type.startsWith("video/")) return "video"; if (f.type.startsWith("audio/")) return "audio"; return null; };
  const docTargets = e => e === "docx" ? ["html", "txt", "md", "pdf"] : e === "md" || e === "markdown" ? ["html", "pdf", "txt"] : e === "txt" ? ["pdf", "html", "md"] : ["txt", "md", "pdf"];

  /* ---------- state + UI ---------- */
  let files = [], target = null;
  const drop = $("#drop"), pick = $("#pick"), list = $("#queue"), chips = $("#targets"), go = $("#go"), out = $("#results"), opts = $("#opts");

  function setFiles(fl) {
    files = [...fl].filter(f => kindOf(f));
    const skipped = fl.length - files.length;
    list.innerHTML = files.map(f => `<li><span class="nm">${esc(f.name)}</span><span class="mono">${human(f.size)}</span></li>`).join("") +
      (skipped ? `<li class="muted">${skipped} file${skipped > 1 ? "s" : ""} in a format Shift can't read yet</li>` : "");
    drop.classList.toggle("has", files.length > 0);
    const kinds = [...new Set(files.map(kindOf))];
    let t = [];
    if (kinds.length === 1) t = kinds[0] === "doc" ? docTargets(ext(files[0].name)) : TARGETS[kinds[0]].filter(x => x !== "pdf+" || files.length > 1);
    else if (kinds.every(k => k === "image" || k === "pdf")) t = ["pdf"];
    chips.innerHTML = t.length ? t.map(x => `<button type="button" class="chip" data-t="${x}">${LABEL[x] || x.toUpperCase()}</button>`).join("") : files.length ? `<span class="muted">Mixed files: pick files of one kind (images can be combined into a PDF).</span>` : "";
    target = null; go.disabled = true; opts.innerHTML = "";
    chips.querySelectorAll(".chip").forEach(b => b.onclick = () => { chips.querySelectorAll(".chip").forEach(x => x.classList.remove("on")); b.classList.add("on"); target = b.dataset.t; go.disabled = false; options(); });
    $("#step2").classList.toggle("dim", !files.length);
  }
  function options() {
    const k = kindOf(files[0]);
    let h = "";
    if (["jpg", "webp"].includes(target) && (k === "image" || k === "pdf")) h += `<label>Quality <input type="range" id="q" min="40" max="100" value="88"><span id="qv">88</span></label>`;
    if (k === "image" && target !== "ico") h += `<label>Max width <select id="mw"><option value="0">Original</option><option>3840</option><option>1920</option><option>1280</option><option>800</option></select></label>`;
    if (k === "image" && target === "pdf" && files.length > 1) h += `<label><input type="checkbox" id="one" checked> One PDF for all images</label>`;
    if (k === "video" && target === "gif") h += `<label>GIF width <select id="gw"><option>480</option><option>320</option><option>720</option></select></label>`;
    if (k === "pdf" && (target === "png" || target === "jpg")) h += `<label>Sharpness <select id="sc"><option value="2">High</option><option value="1.5">Medium</option><option value="3">Print</option></select></label>`;
    opts.innerHTML = h;
    const q = $("#q"); if (q) q.oninput = () => $("#qv").textContent = q.value;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  ["dragenter", "dragover"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", ev => setFiles(ev.dataTransfer.files));
  pick.addEventListener("change", () => setFiles(pick.files));
  drop.addEventListener("click", e => { if (e.target === drop || e.target.closest(".dz-in")) pick.click(); });
  addEventListener("paste", e => { if (e.clipboardData && e.clipboardData.files.length) setFiles(e.clipboardData.files); });

  /* ---------- results ---------- */
  const made = [];
  function result(name, blob) {
    made.push({ name, blob });
    const url = URL.createObjectURL(blob), li = document.createElement("li");
    li.innerHTML = `<span class="nm">${esc(name)}</span><span class="mono">${human(blob.size)}</span><a class="btn sm" href="${url}" download="${esc(name)}">Download</a>`;
    out.appendChild(li); $("#zipall").hidden = made.length < 2;
    if (window.EYE && EYE.excite) EYE.excite();
  }
  function status(t, k) { const s = $("#status"); s.textContent = t; s.dataset.k = k || ""; }
  $("#zipall").onclick = async () => {
    await script(V + "fflate.js");
    const z = {}; for (const m of made) z[uniq(z, m.name)] = new Uint8Array(await m.blob.arrayBuffer());
    result("1eye-shift.zip", new Blob([fflate.zipSync(z, { level: 0 })], { type: "application/zip" }));
  };
  const uniq = (o, n) => { if (!o[n]) return n; let i = 2; while (o[base(n) + "-" + i + "." + ext(n)]) i++; return base(n) + "-" + i + "." + ext(n); };

  go.onclick = async () => {
    go.disabled = true; out.innerHTML = ""; made.length = 0; $("#zipall").hidden = true;
    const t0 = performance.now();
    try {
      const k = kindOf(files[0]);
      if ((k === "image" || k === "pdf") && target === "pdf" && (files.length > 1 && ($("#one") ? $("#one").checked : true))) await imagesToPdf(files);
      else if (target === "pdf+") await mergePdf(files);
      else for (let i = 0; i < files.length; i++) { status(`Converting ${i + 1} of ${files.length}: ${files[i].name}`); await convert(files[i], kindOf(files[i])); }
      status(`Done in ${((performance.now() - t0) / 1000).toFixed(1)} s. Nothing left your device.`, "ok");
    } catch (e) { console.error(e); status("Couldn't convert: " + (e && e.message || e), "bad"); }
    go.disabled = false;
  };

  async function convert(f, k) {
    if (k === "image") return image(f);
    if (k === "pdf") return pdf(f);
    if (k === "video" || k === "audio") return media(f);
    if (k === "data") return data(f);
    if (k === "doc") return doc(f);
  }

  /* ---------- images ---------- */
  async function decode(f) {
    const e = ext(f.name);
    if (e === "heic" || e === "heif") { await script(V + "heic2any.min.js"); f = await heic2any({ blob: f, toType: "image/png" }); }
    if (e === "svg" || e === "ico" || e === "tif" || e === "tiff") return await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error("This browser can't read " + e.toUpperCase())); i.src = URL.createObjectURL(f); });
    return await createImageBitmap(f);
  }
  function canvasFrom(img, maxW, flat) {
    let w = img.width || img.naturalWidth, h = img.height || img.naturalHeight;
    if (maxW && w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
    const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d");
    if (flat) { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); }
    g.drawImage(img, 0, 0, w, h); return c;
  }
  const blobOf = (c, type, q) => new Promise((ok, no) => c.toBlob(b => b ? ok(b) : no(new Error("Encoding failed")), type, q));
  async function image(f) {
    const img = await decode(f), q = ($("#q") ? +$("#q").value : 88) / 100, mw = $("#mw") ? +$("#mw").value : 0;
    if (target === "pdf") return imagesToPdf([f]);
    if (target === "ico") return result(base(f.name) + ".ico", await ico(img));
    const c = canvasFrom(img, mw, target === "jpg");
    result(base(f.name) + "." + target, await blobOf(c, target === "jpg" ? "image/jpeg" : "image/" + target, q));
  }
  async function ico(img) {
    const sizes = [16, 32, 48, 64, 128, 256], pngs = [];
    for (const s of sizes) { const c = document.createElement("canvas"); c.width = c.height = s; const g = c.getContext("2d"); const w = img.width || img.naturalWidth, h = img.height || img.naturalHeight, k = Math.min(s / w, s / h); g.drawImage(img, (s - w * k) / 2, (s - h * k) / 2, w * k, h * k); pngs.push(new Uint8Array(await (await blobOf(c, "image/png")).arrayBuffer())); }
    const head = 6 + 16 * sizes.length, total = head + pngs.reduce((a, p) => a + p.length, 0), b = new Uint8Array(total), d = new DataView(b.buffer);
    d.setUint16(2, 1, true); d.setUint16(4, sizes.length, true);
    let off = head; sizes.forEach((s, i) => { const e = 6 + 16 * i; b[e] = s & 255; b[e + 1] = s & 255; d.setUint16(e + 4, 1, true); d.setUint16(e + 6, 32, true); d.setUint32(e + 8, pngs[i].length, true); d.setUint32(e + 12, off, true); b.set(pngs[i], off); off += pngs[i].length; });
    return new Blob([b], { type: "image/x-icon" });
  }
  async function imagesToPdf(list) {
    await script(V + "pdf-lib.min.js");
    const doc = await PDFLib.PDFDocument.create(), q = ($("#q") ? +$("#q").value : 90) / 100;
    for (const f of list) {
      if (kindOf(f) === "pdf") { const src = await PDFLib.PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true }); (await doc.copyPages(src, src.getPageIndices())).forEach(p => doc.addPage(p)); continue; }
      status("Adding " + f.name);
      const c = canvasFrom(await decode(f), 0, true), jpg = await doc.embedJpg(await (await blobOf(c, "image/jpeg", q)).arrayBuffer());
      doc.addPage([c.width, c.height]).drawImage(jpg, { x: 0, y: 0, width: c.width, height: c.height });
    }
    result((list.length > 1 ? "1eye-shift" : base(list[0].name)) + ".pdf", new Blob([await doc.save()], { type: "application/pdf" }));
  }

  /* ---------- PDF ---------- */
  let pdfjs = null;
  async function pdfLib() { if (!pdfjs) { pdfjs = await import(V + "pdfjs/pdf.min.mjs"); pdfjs.GlobalWorkerOptions.workerSrc = V + "pdfjs/pdf.worker.min.mjs"; } return pdfjs; }
  async function pdf(f) {
    const lib = await pdfLib(), doc = await lib.getDocument({ data: await f.arrayBuffer() }).promise;
    if (target === "txt") {
      let text = ""; for (let i = 1; i <= doc.numPages; i++) { const tc = await (await doc.getPage(i)).getTextContent(); text += tc.items.map(t => t.str + (t.hasEOL ? "\n" : "")).join("") + "\n\n"; }
      return result(base(f.name) + ".txt", new Blob([text], { type: "text/plain" }));
    }
    const sc = $("#sc") ? +$("#sc").value : 2, q = ($("#q") ? +$("#q").value : 90) / 100;
    for (let i = 1; i <= doc.numPages; i++) {
      status(`Page ${i} of ${doc.numPages}`);
      const page = await doc.getPage(i), vp = page.getViewport({ scale: sc }), c = document.createElement("canvas"); c.width = vp.width; c.height = vp.height;
      const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: g, viewport: vp }).promise;
      result(`${base(f.name)}-p${String(i).padStart(2, "0")}.${target}`, await blobOf(c, target === "jpg" ? "image/jpeg" : "image/png", q));
    }
  }
  async function mergePdf(list) { return imagesToPdf(list); }

  /* ---------- audio / video (ffmpeg.wasm, loaded on first use) ---------- */
  let ff = null;
  async function ffmpeg() {
    if (ff) return ff;
    status("Loading the video engine (about 31 MB, once)…");
    await script(V + "ffmpeg/ffmpeg.js");
    const blobURL = async (u, type) => { const r = await fetch(u); if (!r.ok) throw new Error("Couldn't download the video engine"); return URL.createObjectURL(new Blob([await r.arrayBuffer()], { type })); };
    const f = new FFmpegWASM.FFmpeg();
    f.on("progress", ({ progress }) => { if (progress > 0 && progress <= 1) status(`Converting… ${Math.round(progress * 100)}%`); });
    await f.load({ coreURL: await blobURL(FF_CORE + "ffmpeg-core.js", "text/javascript"), wasmURL: await blobURL(FF_CORE + "ffmpeg-core.wasm", "application/wasm") });
    return ff = f;
  }
  const ARGS = {
    mp4: ["-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart"],
    webm: ["-c:v", "libvpx", "-b:v", "2M", "-deadline", "realtime", "-cpu-used", "8", "-c:a", "libvorbis"],
    mp3: ["-vn", "-c:a", "libmp3lame", "-q:a", "2"], wav: ["-vn", "-c:a", "pcm_s16le"], m4a: ["-vn", "-c:a", "aac", "-b:a", "192k"],
    ogg: ["-vn", "-c:a", "libvorbis", "-q:a", "5"], flac: ["-vn", "-c:a", "flac"],
  };
  async function media(f) {
    if (f.size > 1.5e9) throw new Error("Over 1.5 GB is too big to convert in a browser tab");
    const F = await ffmpeg(), inName = "in." + ext(f.name), outName = "out." + target;
    await F.writeFile(inName, new Uint8Array(await f.arrayBuffer()));
    const args = target === "gif"
      ? ["-i", inName, "-vf", `fps=12,scale=${$("#gw") ? $("#gw").value : 480}:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse`, "-loop", "0", outName]
      : ["-i", inName, ...ARGS[target], outName];
    const code = await F.exec(args);
    if (code !== 0) throw new Error("ffmpeg couldn't convert this file");
    const data = await F.readFile(outName); await F.deleteFile(inName); await F.deleteFile(outName);
    const mime = { mp4: "video/mp4", webm: "video/webm", gif: "image/gif", mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4", ogg: "audio/ogg", flac: "audio/flac" }[target];
    result(base(f.name) + "." + target, new Blob([data.buffer], { type: mime }));
  }

  /* ---------- data ---------- */
  async function rows(f) {
    const e = ext(f.name);
    if (e === "json") { const j = JSON.parse(await f.text()); return Array.isArray(j) ? j : j && typeof j === "object" ? (Object.values(j).find(Array.isArray) || [j]) : [{ value: j }]; }
    if (e === "yaml" || e === "yml") { const y = await import(V + "js-yaml.mjs"); const j = y.load(await f.text()); return Array.isArray(j) ? j : [j]; }
    await script(V + "xlsx.full.min.js");
    const wb = XLSX.read(e === "csv" || e === "tsv" ? await f.text() : await f.arrayBuffer(), { type: e === "csv" || e === "tsv" ? "string" : "array", FS: e === "tsv" ? "\t" : undefined });
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
  }
  async function data(f) {
    const r = await rows(f), n = base(f.name);
    if (target === "json") return result(n + ".json", new Blob([JSON.stringify(r, null, 2)], { type: "application/json" }));
    if (target === "yaml") { const y = await import(V + "js-yaml.mjs"); return result(n + ".yaml", new Blob([y.dump(r)], { type: "text/yaml" })); }
    await script(V + "xlsx.full.min.js");
    const ws = XLSX.utils.json_to_sheet(r.map(o => o && typeof o === "object" ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v && typeof v === "object" ? JSON.stringify(v) : v])) : { value: o }));
    if (target === "csv") return result(n + ".csv", new Blob([XLSX.utils.sheet_to_csv(ws)], { type: "text/csv" }));
    if (target === "tsv") return result(n + ".tsv", new Blob([XLSX.utils.sheet_to_csv(ws, { FS: "\t" })], { type: "text/tab-separated-values" }));
    if (target === "html") return result(n + ".html", new Blob([XLSX.utils.sheet_to_html(ws)], { type: "text/html" }));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    result(n + ".xlsx", new Blob([XLSX.write(wb, { type: "array", bookType: "xlsx" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  }

  /* ---------- documents ---------- */
  async function doc(f) {
    const e = ext(f.name), n = base(f.name);
    let html = null, text = null, md = null;
    if (e === "docx") {
      await script(V + "mammoth.browser.min.js");
      const buf = await f.arrayBuffer();
      if (target === "md") md = (await mammoth.convertToMarkdown({ arrayBuffer: buf })).value;
      else if (target === "txt") text = (await mammoth.extractRawText({ arrayBuffer: buf })).value;
      else html = (await mammoth.convertToHtml({ arrayBuffer: buf })).value;
    } else if (e === "md" || e === "markdown") { md = await f.text(); if (target !== "md") { await script(V + "marked.umd.js"); html = marked.parse(md); } }
    else if (e === "txt") { text = await f.text(); html = "<pre>" + esc(text) + "</pre>"; md = text; }
    else { html = await f.text(); }
    if (target === "html") return result(n + ".html", new Blob([page(n, html)], { type: "text/html" }));
    if (target === "md") return result(n + ".md", new Blob([md != null ? md : htmlToText(html)], { type: "text/markdown" }));
    if (target === "txt") return result(n + ".txt", new Blob([text != null ? text : htmlToText(html)], { type: "text/plain" }));
    if (target === "pdf") return result(n + ".pdf", await textPdf(text != null && !html ? text : htmlToText(html), n));
  }
  const page = (t, body) => `<!doctype html><meta charset="utf-8"><title>${esc(t)}</title><style>body{font:16px/1.6 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px}</style>${body}`;
  function htmlToText(h) { const d = document.createElement("div"); d.innerHTML = h; d.querySelectorAll("p,div,br,li,h1,h2,h3,h4,h5,h6,tr").forEach(el => el.append("\n")); return d.textContent.replace(/\n{3,}/g, "\n\n").trim(); }
  async function textPdf(text, title) {
    await script(V + "pdf-lib.min.js");
    const doc = await PDFLib.PDFDocument.create(), font = await doc.embedFont(PDFLib.StandardFonts.Helvetica), size = 11, lh = 15, W = 595, H = 842, M = 56;
    const clean = text.replace(/[^\x09\x0A\x0D\x20-\x7E -ÿ]/g, "?");
    let pg = doc.addPage([W, H]), y = H - M;
    for (const para of clean.split("\n")) {
      let line = "";
      for (const w of para.split(" ")) { const t = line ? line + " " + w : w; if (font.widthOfTextAtSize(t, size) > W - 2 * M && line) { if (y < M) { pg = doc.addPage([W, H]); y = H - M; } pg.drawText(line, { x: M, y, size, font }); y -= lh; line = w; } else line = t; }
      if (y < M) { pg = doc.addPage([W, H]); y = H - M; } pg.drawText(line, { x: M, y, size, font }); y -= lh;
    }
    doc.setTitle(title); return new Blob([await doc.save()], { type: "application/pdf" });
  }
})();
