/* 1EYE — app */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const I = (d, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const ICON = {
  transfer: I('<path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 15v3a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3"/>'),
  chat: I('<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z"/>'),
  link: I('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  devices: I('<rect x="2" y="4" width="14" height="10" rx="2"/><path d="M6 18h6"/><rect x="17" y="8" width="5" height="12" rx="1.5"/>'),
  control: I('<path d="M12 2 2 20h20Z"/><path d="M8.5 13.5c2-2 5-2 7 0-2 2-5 2-7 0Z"/><circle cx="12" cy="13.5" r=".8"/>'),
  about: I('<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.6" r=".6" fill="currentColor"/>'),
  down: I('<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>'),
  trash: I('<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4h6v3"/>'),
  eye: I('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
  copy: I('<rect x="8" y="8" width="13" height="13" rx="2.5"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>'),
  open: I('<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"/>'),
  send: I('<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/>'),
  search: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  x: I('<path d="M18 6 6 18M6 6l12 12"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  zip: I('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M10 9h1M10 12h1M10 15h1"/>'),
  check: I('<path d="m5 12 5 5L20 7"/>'),
  folder: I('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>'),
  power: I('<path d="M12 3v8"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0"/>'),
  key: I('<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9.2-9.2M17 6l3 3M15 8l2 2"/>'),
  globe: I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  wifi: I('<path d="M2 8.5a15 15 0 0 1 20 0"/><path d="M5 12a10 10 0 0 1 14 0"/><path d="M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r=".8" fill="currentColor"/>'),
  phone: I('<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>'),
  pc: I('<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>'),
  img: I('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>'),
  video: I('<rect x="2" y="5" width="15" height="14" rx="3"/><path d="m17 10 5-3v10l-5-3Z"/>'),
  audio: I('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
  doc: I('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>'),
  archive: I('<rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4"/>'),
  app: I('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 12h6M12 9v6"/>'),
  other: I('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/>'),
  select: I('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>'),
  logout: I('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>'),
  edit: I('<path d="M4 20h4L19 9l-4-4L4 16Z"/>'),
};

// ---------- state
let S = { v: 0, me: {}, chat: [], links: [], files: [], devices: [] };
let page = (location.hash || "#transfer").slice(1);
let seenChat = +localStorage.getItem("1eye-seen") || 0;
let filter = "all", query = "", selMode = false, sel = new Set(), linkQ = "", accessMode = "wifi";
const uploads = new Map();
let firstSync = true;

// ---------- helpers
function hue(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
function avaStyle(s) { const h = hue(s); return `background:linear-gradient(135deg,hsl(${h} 90% 78%),hsl(${(h + 50) % 360} 85% 62%))`; }
function initials(n) { return esc(String(n || "?").trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase()); }
function size(n) { const u = ["B", "KB", "MB", "GB", "TB"]; let i = 0; while (n >= 1024 && i < 4) { n /= 1024; i++; } return (i ? n.toFixed(n < 10 ? 1 : 0) : n) + " " + u[i]; }
function ago(ms) { const s = (Date.now() - ms) / 1000; if (s < 45) return "just now"; if (s < 3600) return Math.round(s / 60) + "m ago"; if (s < 86400) return Math.round(s / 3600) + "h ago"; return new Date(ms).toLocaleDateString(); }
function clock(ms) { return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function domain(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } }
function linkify(t) { return esc(t).replace(/(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi, m => `<a href="${m.startsWith("http") ? m : "https://" + m}" target="_blank" rel="noopener">${m}</a>`); }
function copy(v) {
  if (navigator.clipboard && isSecureContext) navigator.clipboard.writeText(v);
  else { const a = document.createElement("textarea"); a.value = v; document.body.append(a); a.select(); document.execCommand("copy"); a.remove(); }
  toast("Copied to clipboard");
}
async function api(path, body, method = "POST") {
  const r = await fetch(path, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (r.status === 401) location.reload();
  return r.json().catch(() => ({}));
}
function toast(text, who) {
  const el = document.createElement("div");
  el.className = "toast glass";
  el.innerHTML = (who ? `<div class="ava" style="${avaStyle(who)}">${initials(who)}</div>` : `<span style="color:var(--v)">${ICON.check.replace("<svg", '<svg width="18" height="18"')}</span>`) + `<div style="min-width:0"><div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${who ? `<b>${esc(who)}</b><br><span class="muted">` + esc(text) + "</span>" : esc(text)}</div></div>`;
  $("#toasts").append(el);
  setTimeout(() => { el.style.transition = ".3s"; el.style.opacity = 0; el.style.transform = "translateY(8px)"; setTimeout(() => el.remove(), 300); }, 3200);
}
let actx;
function chime() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
    o.type = "sine"; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(1320, t + .12);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + .02); g.gain.exponentialRampToValueAtTime(0.0001, t + .35);
    o.connect(g).connect(actx.destination); o.start(t); o.stop(t + .4);
  } catch (_) {}
}

// ---------- sync (long-poll)
async function sync() {
  for (;;) {
    try {
      const r = await fetch("/api/sync?v=" + S.v, { cache: "no-store" });
      if (r.status === 401) { location.reload(); return; }
      const n = await r.json();
      const prev = S;
      S = n;
      onUpdate(prev);
    } catch (e) { await new Promise(r => setTimeout(r, 2000)); }
  }
}

function onUpdate(prev) {
  // new chat from others
  if (!firstSync) {
    const lastPrev = prev.chat?.length ? prev.chat[prev.chat.length - 1].ts : 0;
    for (const m of S.chat || []) if (m.ts > lastPrev && m.from !== S.me.id) {
      chime(); Eye.pulse(0.6);
      if (page !== "chat") toast(m.text.slice(0, 90), m.name);
    }
    const pf = new Set((prev.files || []).map(f => f.name));
    const nf = (S.files || []).filter(f => !pf.has(f.name));
    if (nf.length && !uploads.size) { Eye.flow(1.4); Eye.pulse(0.5); toast(nf.length === 1 ? `Arrived: ${nf[0].name}` : `${nf.length} files arrived`); }
  }
  firstSync = false;
  if (page === "chat" && (S.chat || []).length) markSeen();
  renderSide();
  renderPage(true);
}
function markSeen() { const l = S.chat[S.chat.length - 1]; if (l && l.ts > seenChat) { seenChat = l.ts; try { localStorage.setItem("1eye-seen", seenChat) } catch (_) {} } }
function unread() { return (S.chat || []).filter(m => m.ts > seenChat && m.from !== S.me.id).length; }

// ---------- sidebar
function renderSide() {
  const host = S.me.host, u = unread();
  const items = [["transfer", "Transfer"], ["chat", "Chat"], ["links", "Links"], ["devices", "Devices"]];
  if (host) items.push(["control", "Control"]);
  items.push(["about", "About"]);
  const onlineCount = (S.devices || []).filter(d => d.online).length;
  $("#side").innerHTML = `
    <div class="brand">${LOGO}<div><b class="gtext">1EYE</b><small>Telepathic Data Transfer</small></div></div>
    ${items.map(([k, n]) => `<a class="nav ${page === k ? "on" : ""}" href="#${k}">${ICON[k === "links" ? "link" : k]}<span>${n}</span>${k === "chat" && u ? `<span class="badge">${u}</span>` : ""}${k === "devices" ? `<span class="badge" style="background:rgba(255,255,255,.08);color:var(--muted)">${onlineCount}</span>` : ""}</a>`).join("")}
    <div class="sp"></div>
    <div class="me glass"><div class="ava" style="${avaStyle(S.me.name)}">${initials(S.me.name)}</div>
      <div style="min-width:0"><b>${esc(S.me.name)}</b><span class="pill ${host ? "host" : location.hostname.endsWith("trycloudflare.com") ? "internet" : "wifi"}">${host ? "Host" : location.hostname.endsWith("trycloudflare.com") ? "Internet" : "Wi-Fi"}</span></div>
      ${host ? "" : `<button class="btn icon sm" style="margin-left:auto" title="Disconnect" onclick="logout()">${ICON.logout}</button>`}</div>
    <div class="credit">v${esc(S.version || "")} · crafted by <a href="#about">Balaj</a>, mid-J.</div>`;
}
async function logout() { if (confirm("Disconnect this device?")) { await api("/api/logout"); location.reload(); } }

// ---------- router
addEventListener("hashchange", () => { page = (location.hash || "#transfer").slice(1); selMode = false; sel.clear(); renderSide(); renderPage(); $("#main").scrollTop = 0; });

function renderPage(soft) {
  const main = $("#main");
  const fn = { transfer: pTransfer, chat: pChat, links: pLinks, devices: pDevices, control: pControl, about: pAbout }[page] || pTransfer;
  if (page === "control" && !S.me.host) { location.hash = "#transfer"; return; }
  // soft re-render: keep inputs/focus where possible
  if (soft && main.dataset.page === page) { fn(main, true); return; }
  main.dataset.page = page;
  main.innerHTML = "";
  fn(main, false);
}

// ======================================================= TRANSFER
function pTransfer(main, soft) {
  if (!soft) {
    main.innerHTML = `<div class="page">
      <div class="hero" id="hero" data-spin>
        <div class="eyeslot" id="eyeslot"></div>
        <div class="stats" id="stats"></div>
        <h2>Drop anything.<br><span class="gtext">It just arrives.</span></h2>
        <p>Files travel straight to every device connected to this eye. No cloud, no cables, no apps.</p>
        <div class="row"><button class="btn primary" id="choose">${ICON.plus} Choose files</button><span class="muted" style="font-size:12.5px">or drag &amp; drop · paste with Ctrl+V</span></div>
      </div>
      <div class="queue" id="queue"></div>
      <div class="toolbar">
        <div id="chips" style="display:flex;gap:8px;flex-wrap:wrap"></div><div class="sp"></div>
        <div class="search">${ICON.search}<input class="input" id="fq" placeholder="Search files" value="${esc(query)}"></div>
        <button class="btn sm" id="selbtn">${ICON.select} Select</button>
        <a class="btn sm" id="zipall" href="/zip">${ICON.zip} All as .zip</a>
      </div>
      <div id="selbar"></div>
      <div class="files" id="files"></div>
    </div>`;
    Eye.anchor($("#eyeslot"), 1);
    $("#choose").onclick = e => { e.stopPropagation(); $("#pick").click(); };
    $("#hero").onclick = e => { if (e.target.closest("button")) return; };
    $("#fq").oninput = e => { query = e.target.value; drawFiles(); };
    $("#selbtn").onclick = () => { selMode = !selMode; sel.clear(); drawFiles(); };
  }
  const F = S.files || [];
  const total = F.reduce((a, f) => a + f.size, 0), online = (S.devices || []).filter(d => d.online).length;
  $("#stats").innerHTML = `<div class="stat glass"><b>${F.length}</b>files</div><div class="stat glass"><b>${size(total)}</b>shared</div><div class="stat glass"><span class="dot on" style="display:inline-block;margin-right:6px"></span><b>${online}</b>device${online === 1 ? "" : "s"} linked</div>`;
  const kinds = [["all", "All"], ["image", "Images"], ["video", "Videos"], ["audio", "Audio"], ["doc", "Docs"], ["other", "Other"]];
  const cnt = k => k === "all" ? F.length : F.filter(f => k === "other" ? !["image", "video", "audio", "doc"].includes(f.kind) : f.kind === k).length;
  $("#chips").innerHTML = kinds.map(([k, n]) => `<div class="chip ${filter === k ? "on" : ""}" data-k="${k}">${n} <span style="opacity:.6">${cnt(k)}</span></div>`).join("");
  $$("#chips .chip").forEach(c => c.onclick = () => { filter = c.dataset.k; pTransfer(main, true); });
  $("#zipall").style.display = F.length ? "" : "none";
  drawFiles();
  drawQueue();
}

function visibleFiles() {
  return (S.files || []).filter(f => {
    if (filter !== "all") { if (filter === "other") { if (["image", "video", "audio", "doc"].includes(f.kind)) return false; } else if (f.kind !== filter) return false; }
    return !query || f.name.toLowerCase().includes(query.toLowerCase());
  });
}

function drawFiles() {
  const box = $("#files"); if (!box) return;
  const list = visibleFiles();
  box.classList.toggle("selmode", selMode);
  $("#selbtn").classList.toggle("primary", selMode);
  $("#selbtn").innerHTML = selMode ? `${ICON.x} Cancel` : `${ICON.select} Select`;
  $("#selbar").innerHTML = selMode ? `<div class="glass" style="display:flex;gap:10px;align-items:center;padding:10px 14px;border-radius:14px;margin-bottom:14px">
    <b>${sel.size}</b><span class="muted">selected</span><div style="flex:1"></div>
    <button class="btn sm" onclick="selAll()">Select all</button>
    <a class="btn sm primary ${sel.size ? "" : "disabled"}" ${sel.size ? `href="/zip?only=${encodeURIComponent([...sel].join("/"))}"` : ""}>${ICON.zip} Download</a>
    <button class="btn sm danger" ${sel.size ? "" : "disabled"} onclick="delSel()">${ICON.trash} Delete</button></div>` : "";
  if (!list.length) {
    box.innerHTML = `<div class="empty" style="grid-column:1/-1">${ICON.eye}<div>${(S.files || []).length ? "Nothing matches." : "Nothing shared yet. The eye is waiting."}</div></div>`;
    return;
  }
  const key = list.map(f => f.name + f.mtime).join("|") + selMode + [...sel].join("/");
  if (box.dataset.key === key) return;
  box.dataset.key = key;
  box.innerHTML = list.map(f => {
    const ext = (f.name.split(".").pop() || "").slice(0, 5).toUpperCase();
    const u = "/f/" + encodeURIComponent(f.name);
    const th = f.kind === "image" ? `<img loading="lazy" src="${u}?view=1" alt="">` : `<span class="big" style="color:hsl(${hue(f.kind) % 360} 80% 75%)">${ICON[f.kind] || ICON.other}</span>`;
    return `<div class="fc ${sel.has(f.name) ? "sel" : ""}" data-n="${esc(f.name)}">
      <div class="thumb">${th}<span class="ext">${esc(ext)}</span></div><span class="tick"></span>
      <div class="acts"><a class="btn icon sm" href="${u}" title="Download" onclick="event.stopPropagation()">${ICON.down}</a><button class="btn icon sm danger" title="Delete" data-del>${ICON.trash}</button></div>
      <div class="info"><div class="nm" title="${esc(f.name)}">${esc(f.name)}</div><div class="mt">${size(f.size)} · ${ago(f.mtime)}</div></div></div>`;
  }).join("");
  $$(".fc", box).forEach(el => {
    const n = el.dataset.n;
    el.onclick = e => {
      if (e.target.closest("[data-del]")) { e.stopPropagation(); if (confirm(`Delete "${n}" for everyone?`)) fetch("/del/" + encodeURIComponent(n), { method: "POST" }); return; }
      if (selMode) { sel.has(n) ? sel.delete(n) : sel.add(n); drawFiles(); return; }
      preview((S.files || []).find(f => f.name === n));
    };
  });
}
function selAll() { visibleFiles().forEach(f => sel.add(f.name)); drawFiles(); }
async function delSel() { if (!confirm(`Delete ${sel.size} files for everyone?`)) return; for (const n of sel) await fetch("/del/" + encodeURIComponent(n), { method: "POST" }); sel.clear(); selMode = false; }

// ---------- preview
async function preview(f) {
  if (!f) return;
  const u = "/f/" + encodeURIComponent(f.name), v = u + "?view=1";
  let body = `<div class="empty">${ICON[f.kind] || ICON.other}<div>No preview for this type.</div><a class="btn primary" style="margin-top:14px" href="${u}">${ICON.down} Download</a></div>`;
  const ext = f.name.split(".").pop().toLowerCase();
  if (f.kind === "image") body = `<img src="${v}">`;
  else if (f.kind === "video") body = `<video src="${v}" controls autoplay playsinline></video>`;
  else if (f.kind === "audio") body = `<div style="padding:50px;width:100%;text-align:center"><div style="width:90px;height:90px;margin:0 auto 20px;color:var(--v)">${ICON.audio}</div><audio src="${v}" controls autoplay style="width:min(520px,90%)"></audio></div>`;
  else if (ext === "pdf") body = `<iframe src="${v}"></iframe>`;
  else if (["txt", "md", "csv", "json", "log", "js", "py", "go", "css", "xml", "yml", "yaml", "ini"].includes(ext) && f.size < 2e6) {
    const t = await fetch(v).then(r => r.text()).catch(() => "");
    body = `<pre>${esc(t)}</pre>`;
  }
  const m = document.createElement("div");
  m.className = "modal";
  m.innerHTML = `<div class="box glass"><div class="bar"><b>${esc(f.name)}</b><span class="muted" style="font-size:12px">${size(f.size)}</span>
    <a class="btn sm primary" href="${u}">${ICON.down} Download</a><button class="btn icon sm" data-x>${ICON.x}</button></div><div class="view">${body}</div></div>`;
  m.onclick = e => { if (e.target === m || e.target.closest("[data-x]")) m.remove(); };
  document.body.append(m);
  const esc_ = e => { if (e.key === "Escape") { m.remove(); removeEventListener("keydown", esc_); } };
  addEventListener("keydown", esc_);
}

// ---------- uploads
$("#pick").onchange = e => { [...e.target.files].forEach(upload); e.target.value = ""; };
function upload(file) {
  const id = Math.random().toString(36).slice(2);
  const x = new XMLHttpRequest();
  const u = { id, name: file.name, size: file.size, sent: 0, t0: performance.now(), speed: 0, x, state: "up" };
  uploads.set(id, u);
  x.open("PUT", "/upload?name=" + encodeURIComponent(file.name));
  let last = { t: performance.now(), b: 0 };
  x.upload.onprogress = e => {
    u.sent = e.loaded; const t = performance.now();
    if (t - last.t > 400) { u.speed = (e.loaded - last.b) / ((t - last.t) / 1000); last = { t, b: e.loaded }; }
    Eye.flow(0.6); drawQueue();
  };
  x.onload = () => { u.state = x.status === 200 ? "done" : "fail"; if (u.state === "done") Eye.pulse(0.9); drawQueue(); setTimeout(() => { uploads.delete(id); drawQueue(); }, 2500); };
  x.onerror = x.onabort = () => { u.state = "fail"; drawQueue(); setTimeout(() => { uploads.delete(id); drawQueue(); }, 3000); };
  x.send(file);
  if (page !== "transfer") location.hash = "#transfer";
  drawQueue();
}
function drawQueue() {
  const q = $("#queue"); if (!q) return;
  q.innerHTML = [...uploads.values()].map(u => {
    const pct = u.size ? Math.round(u.sent / u.size * 100) : 100;
    const eta = u.speed > 0 ? Math.max(0, Math.round((u.size - u.sent) / u.speed)) : 0;
    const sub = u.state === "done" ? "Delivered ✓" : u.state === "fail" ? "Failed" : `${pct}% · ${size(u.speed)}/s · ${eta}s left · ${size(u.size)}`;
    return `<div class="qi glass"><div class="ic">${u.state === "done" ? ICON.check : ICON.transfer}</div>
      <div style="min-width:0"><div class="nm">${esc(u.name)}</div><div class="sub" style="${u.state === "fail" ? "color:var(--bad)" : ""}">${sub}</div><div class="prog"><i style="width:${u.state === "done" ? 100 : pct}%"></i></div></div>
      ${u.state === "up" ? `<button class="btn icon sm" onclick="cancelUp('${u.id}')" title="Cancel">${ICON.x}</button>` : "<span></span>"}</div>`;
  }).join("");
}
function cancelUp(id) { uploads.get(id)?.x.abort(); }

// drag & drop anywhere
let dragN = 0;
addEventListener("dragenter", e => { if (!e.dataTransfer?.types?.includes("Files")) return; e.preventDefault(); dragN++; $("#hero")?.classList.add("over"); Eye.pulse(0.2); });
addEventListener("dragover", e => { if (e.dataTransfer?.types?.includes("Files")) e.preventDefault(); });
addEventListener("dragleave", () => { if (--dragN <= 0) { dragN = 0; $("#hero")?.classList.remove("over"); } });
addEventListener("drop", e => { if (!e.dataTransfer?.files?.length) return; e.preventDefault(); dragN = 0; $("#hero")?.classList.remove("over"); [...e.dataTransfer.files].forEach(upload); });
addEventListener("paste", e => {
  if (e.target.closest?.("input,textarea")) return;
  const fs = [...(e.clipboardData?.files || [])];
  if (fs.length) { e.preventDefault(); fs.forEach(f => upload(new File([f], f.name && f.name !== "image.png" ? f.name : `pasted_${Date.now()}.png`, { type: f.type }))); }
});

// ======================================================= CHAT
function pChat(main, soft) {
  if (!soft) {
    main.innerHTML = `<div class="page" style="padding-bottom:20px">
      <div class="head"><div><div class="label">Channel · all devices</div><h1>Chat</h1></div><div class="sp"></div>
      ${S.me.host ? `<button class="btn sm danger" onclick="if(confirm('Clear the whole chat for everyone?'))api('/host/chatclear')">${ICON.trash} Clear</button>` : ""}</div>
      <div class="chatwrap glass"><div class="msgs" id="msgs"></div>
      <div class="composer"><textarea class="input" id="ct" rows="1" placeholder="Think it. Send it.  (Enter to send · Shift+Enter for new line)"></textarea>
      <button class="btn glow" id="cs" style="height:46px;width:52px;padding:0">${ICON.send}</button></div></div></div>`;
    Eye.anchor(null, 0.3);
    const ta = $("#ct");
    ta.oninput = () => { ta.style.height = "auto"; ta.style.height = Math.min(160, ta.scrollHeight) + "px"; };
    ta.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendChat(); } };
    $("#cs").onclick = sendChat;
    setTimeout(() => ta.focus(), 50);
    markSeen(); renderSide();
  }
  const box = $("#msgs");
  const key = (S.chat || []).length + ":" + ((S.chat || []).slice(-1)[0]?.id || "");
  if (box.dataset.key === key) return;
  const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80 || !box.dataset.key;
  box.dataset.key = key;
  if (!(S.chat || []).length) { box.innerHTML = `<div class="empty" style="margin:auto">${ICON.chat}<div>No messages yet.<br><span class="dim">Links you send are saved to Links automatically.</span></div></div>`; return; }
  let html = "", prev = null, prevDay = "";
  for (const m of S.chat) {
    const day = new Date(m.ts).toDateString();
    if (day !== prevDay) { html += `<div class="daysep">${day === new Date().toDateString() ? "Today" : new Date(m.ts).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</div>`; prevDay = day; prev = null; }
    const mine = m.from === S.me.id, cont = prev && prev.from === m.from && m.ts - prev.ts < 120000;
    if (!cont) html += `<div class="who ${mine ? "mine" : ""}">${mine ? "You" : esc(m.name)} · ${clock(m.ts)}</div>`;
    html += `<div class="m ${mine ? "mine" : ""} ${cont ? "cont" : ""}"><div class="ava" style="${avaStyle(m.name)}">${initials(m.name)}</div>
      <div class="bub">${linkify(m.text)}<button class="btn icon sm cp" title="Copy" data-c="${esc(m.id)}">${ICON.copy}</button></div></div>`;
    prev = m;
  }
  box.innerHTML = html;
  $$("[data-c]", box).forEach(b => b.onclick = () => copy((S.chat.find(m => m.id === b.dataset.c) || {}).text || ""));
  if (atBottom) box.scrollTop = box.scrollHeight;
}
async function sendChat() {
  const ta = $("#ct"), t = ta.value.trim(); if (!t) return;
  ta.value = ""; ta.style.height = "auto";
  Eye.flow(0.8); Eye.pulse(0.4);
  await api("/api/chat", { text: t });
}

// ======================================================= LINKS
function pLinks(main, soft) {
  if (!soft) {
    main.innerHTML = `<div class="page">
      <div class="head"><div><div class="label">Saved across devices</div><h1>Links</h1><p>Drop a link here and open it on any device. Links sent in chat land here too.</p></div></div>
      <div class="glass card" style="display:grid;grid-template-columns:1.4fr 1fr auto;gap:10px;align-items:center" id="lform">
        <input class="input" id="lu" placeholder="https://…" inputmode="url"><input class="input" id="ln" placeholder="Note (optional)">
        <button class="btn glow" id="la" style="height:42px">${ICON.plus} Save</button></div>
      <div class="toolbar"><div class="label" id="lc"></div><div class="sp"></div><div class="search">${ICON.search}<input class="input" id="lq" placeholder="Search links" value="${esc(linkQ)}"></div></div>
      <div class="links" id="links"></div></div>`;
    Eye.anchor(null, 0.3);
    if (innerWidth < 860) $("#lform").style.gridTemplateColumns = "1fr";
    const add = async () => {
      const u = $("#lu").value.trim(); if (!u) return $("#lu").focus();
      const r = await api("/api/link", { url: u, note: $("#ln").value });
      if (r.ok) { $("#lu").value = $("#ln").value = ""; Eye.pulse(0.5); toast("Link saved"); } else toast(r.err || "Could not save");
    };
    $("#la").onclick = add; $("#lu").onkeydown = $("#ln").onkeydown = e => e.key === "Enter" && add();
    $("#lq").oninput = e => { linkQ = e.target.value; drawLinks(); };
  }
  drawLinks();
}
function drawLinks() {
  const L = [...(S.links || [])].reverse().filter(l => !linkQ || (l.url + l.note + l.name).toLowerCase().includes(linkQ.toLowerCase()));
  $("#lc").textContent = `${(S.links || []).length} links`;
  const box = $("#links");
  const key = L.map(l => l.id).join();
  if (box.dataset.key === key) return; box.dataset.key = key;
  box.innerHTML = L.length ? L.map(l => {
    const d = domain(l.url);
    return `<div class="lk glass"><div class="fav" style="${avaStyle(d)}">${esc(d[0] || "?").toUpperCase()}</div>
      <div><div class="dom">${esc(d)}</div><div class="url">${esc(l.url)}</div>${l.note ? `<div class="nt">${esc(l.note)}</div>` : ""}<div class="mt">${esc(l.name)} · ${ago(l.ts)}</div></div>
      <div class="acts"><a class="btn sm primary" href="${esc(l.url)}" target="_blank" rel="noopener">${ICON.open} Open</a>
      <button class="btn icon sm" title="Copy" data-cp="${esc(l.url)}">${ICON.copy}</button>
      <button class="btn icon sm danger" title="Delete" data-dl="${esc(l.id)}">${ICON.trash}</button></div></div>`;
  }).join("") : `<div class="empty">${ICON.link}<div>${(S.links || []).length ? "No matches." : "No links yet."}</div></div>`;
  $$("[data-cp]", box).forEach(b => b.onclick = () => copy(b.dataset.cp));
  $$("[data-dl]", box).forEach(b => b.onclick = () => api("/api/link", { del: b.dataset.dl }));
}

// ======================================================= DEVICES
function pDevices(main, soft) {
  if (!soft) {
    main.innerHTML = `<div class="page"><div class="head"><div><div class="label">Linked minds</div><h1>Devices</h1><p>Everything signed in to this eye right now.</p></div></div><div class="links" id="devs"></div></div>`;
    Eye.anchor(null, 0.3);
  }
  const host = S.me.host;
  $("#devs").innerHTML = (S.devices || []).map(d => {
    const ic = d.via === "host" ? ICON.pc : /iPhone|Android|iPad/.test(d.agent) ? ICON.phone : ICON.pc;
    const you = d.id === S.me.id;
    return `<div class="dev glass"><div class="ic">${ic}</div>
      <div style="min-width:0"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b>${esc(d.name)}</b>${you ? `<span class="pill">You</span>` : ""}
      <span class="pill ${d.via}">${d.via === "host" ? "Host" : d.via === "internet" ? "Internet" : "Wi-Fi"}</span></div>
      <div class="muted" style="font-size:12px;margin-top:3px;display:flex;gap:8px;align-items:center"><span class="dot ${d.online ? "on" : ""}"></span>${d.online ? "Online" : "Idle"} · ${esc(d.agent)}${d.joined ? " · joined " + ago(d.joined) : ""}${host && d.ip ? " · " + esc(d.ip) : ""}</div></div>
      ${host && d.via !== "host" ? `<button class="btn sm danger" data-kick="${esc(d.id)}">Kick</button>` : "<span></span>"}</div>`;
  }).join("");
  $$("[data-kick]").forEach(b => b.onclick = () => confirm("Disconnect this device?") && api("/host/kick", { id: b.dataset.kick }));
}

// ======================================================= CONTROL (host)
function pControl(main, soft) {
  const h = S.host || {};
  if (!soft) {
    main.innerHTML = `<div class="page">
      <div class="head"><div><div class="label">Host only · this PC</div><h1>Control</h1><p>Let devices in, go global, and watch everything that moves.</p></div><div class="sp"></div>
        ${(S.host || {}).platform === "android" ? "" : `<button class="btn sm" onclick="api('/host/folder')">${ICON.folder} Open folder</button>`}
        <button class="btn sm danger" onclick="quit()">${ICON.power} Shut down</button></div>
      <div class="grid2">
        <div class="glass card">
          <div class="seg"><div id="sw">${ICON.wifi.replace("<svg", '<svg width="14" height="14" style="vertical-align:-2px;margin-right:6px"')}Same Wi-Fi</div><div id="sn">${ICON.globe.replace("<svg", '<svg width="14" height="14" style="vertical-align:-2px;margin-right:6px"')}Anywhere</div>${(h.perm || {}).available ? `<div id="sd">${ICON.link.replace("<svg", '<svg width="14" height="14" style="vertical-align:-2px;margin-right:6px"')}My domain</div>` : ""}</div>
          <div class="qrbox"><div class="scan"></div><div id="qr" style="width:100%;height:100%;display:grid;place-items:center"></div></div>
          <div class="linkline" id="ll" title="Click to copy"></div>
          <div class="muted" id="hs" style="font-size:12.5px;margin-top:10px;min-height:18px"></div>
          <div id="onl" style="margin-top:12px"></div>
        </div>
        <div style="display:grid;gap:16px;align-content:start">
          <div class="glass card"><h3>${ICON.key.replace("<svg", '<svg width="16" height="16"')} Access PIN</h3>
            <div class="pinbig gtext" id="pin"></div>
            <div style="display:flex;gap:8px;justify-content:center"><button class="btn sm" onclick="copy(S.host.pin)">${ICON.copy} Copy</button>
            <button class="btn sm" onclick="confirm('New PIN? Every device will be signed out.')&&api('/host/pin')">New PIN</button></div></div>
          <div class="glass card"><h3>${ICON.edit.replace("<svg", '<svg width="16" height="16"')} Host name</h3>
            <div style="display:flex;gap:8px"><input class="input" id="hn" maxlength="30"><button class="btn" onclick="api('/host/rename',{name:$('#hn').value}).then(()=>toast('Renamed'))">Save</button></div></div>
          <div class="glass card"><h3>Shared folder</h3><div class="linkline" style="margin:0;cursor:default" id="fd"></div></div>
        </div>
      </div>
      <div class="glass card" style="margin-top:16px"><h3>Activity</h3><div class="log" id="log"></div></div></div>`;
    Eye.anchor(null, 0.3);
    $("#sw").onclick = () => { accessMode = "wifi"; pControl(main, true); };
    $("#sn").onclick = () => { accessMode = "net"; pControl(main, true); };
    if ($("#sd")) $("#sd").onclick = () => { accessMode = "domain"; pControl(main, true); };
    $("#ll").onclick = () => { const u = curUrl(); u && copy(u); };
    $("#hn").value = S.hostName || "";
    $("#fd").textContent = h.folder || "";
  }
  $("#sw").classList.toggle("on", accessMode === "wifi");
  $("#sn").classList.toggle("on", accessMode === "net");
  if ($("#sd")) $("#sd").classList.toggle("on", accessMode === "domain");
  const u = curUrl();
  const q = $("#qr");
  if (q.dataset.u !== (u || "")) {
    q.dataset.u = u || "";
    q.innerHTML = u ? `<img src="/host/qr?u=${encodeURIComponent(u)}" alt="QR">` : `<div class="ph">${ICON.globe.replace("<svg", '<svg width="40" height="40" style="opacity:.5;margin-bottom:8px"')}<br>Not online yet</div>`;
  }
  $("#ll").textContent = u || "—";
  $("#ll").style.display = u ? "" : "none";
  const P = h.perm || {};
  $("#hs").textContent = accessMode === "wifi" ? "Scan with any phone on the same Wi-Fi, then enter the PIN."
    : accessMode === "domain" ? (!P.configured ? "Your own address that never changes. Set it up once below." : P.status === "online" ? "Online at your domain — works from anywhere, always the same link." : (P.error || (P.status === "starting" ? "Connecting your domain…" : "Your domain is offline.")))
    : (h.status || "Get a secure https link that works from mobile data or any network.");
  const ob = $("#onl");
  if (accessMode === "domain") {
    const key = "d:" + P.configured + P.status;
    if (ob.dataset.k !== key && ob.dataset.k !== "form") {
      ob.dataset.k = key;
      ob.innerHTML = P.configured
        ? `<div style="display:flex;gap:8px;align-items:center"><span class="pill ${P.status === "online" ? "host" : ""}"><span class="dot ${P.status === "online" ? "on" : ""}"></span>${P.status === "online" ? "Online" : P.status === "starting" ? "Connecting" : "Offline"}</span>
           <div style="flex:1"></div><button class="btn sm" onclick="permForm()">Change</button><button class="btn sm danger" onclick="confirm('Remove your domain link?')&&api('/host/permanent',{clear:true})">Remove</button></div>`
        : permFormHTML();
    }
  } else if (accessMode === "net") {
    ob.dataset.k = "";
    const label = h.online ? (h.public ? "Go offline" : "Connecting… (tap to cancel)") : (h.busy ? "Preparing…" : "Go online");
    const cls = h.online ? "btn danger" : "btn glow";
    const html = `<button class="${cls}" style="width:100%;height:44px" ${h.busy && !h.online ? "disabled" : ""} onclick="api('/host/online')">${ICON.globe} ${label}</button>`;
    if (ob.innerHTML !== html) ob.innerHTML = html;
  } else { ob.innerHTML = ""; ob.dataset.k = ""; }
  $("#pin").textContent = h.pin || "";
  const lg = $("#log"), txt = (h.log || []).slice().reverse().map(l => esc(l).replace(/^(\S+)(\s+)(\S+)/, '<span class="dim">$1</span>$2<span class="k">$3</span>')).join("\n");
  if (lg.dataset.k !== txt) { lg.dataset.k = txt; lg.innerHTML = txt; }
}
function curUrl() { const h = S.host || {}; return accessMode === "wifi" ? h.wifi : accessMode === "domain" ? ((h.perm || {}).configured ? h.perm.url : "") : h.public; }
function permFormHTML() {
  const h = S.host || {}, P = h.perm || {};
  return `<div style="display:grid;gap:8px">
    <input class="input" id="ph" placeholder="eye.yourdomain.com" value="${esc(P.host || "")}">
    <input class="input" id="pt" placeholder="Paste the Cloudflare tunnel token (eyJ…)">
    <div class="muted" style="font-size:11.5px">In Cloudflare → Tunnels, set the public hostname's service to <b style="color:var(--ink)">http://localhost:${h.pubPort || 7778}</b></div>
    <button class="btn glow" onclick="savePerm()">${ICON.link} Connect my domain</button></div>`;
}
function permForm() { const ob = $("#onl"); ob.dataset.k = "form"; ob.innerHTML = permFormHTML(); }
async function savePerm() {
  const r = await api("/host/permanent", { host: $("#ph").value, token: $("#pt").value });
  if (r.ok) { toast("Domain saved — connecting…"); $("#onl").dataset.k = ""; } else toast(r.err || "Could not save");
}
async function quit() {
  if (!confirm("Shut down 1EYE? All devices will disconnect.")) return;
  await api("/host/quit");
  document.body.innerHTML = `<canvas id="space"></canvas><div class="vignette"></div><div class="gate"><div class="gatecard glass"><div class="logo">${LOGO}</div><h1 class="gtext">1EYE</h1><div class="tag">The eye is closed</div><p class="muted">Double-click 1EYE again to reopen it.</p></div></div>`;
}

// ======================================================= ABOUT
function pAbout(main, soft) {
  if (soft) return;
  main.innerHTML = `<div class="page"><div class="about">
    <div class="logo">${LOGO}</div><h1 class="gtext">1EYE</h1><div class="tag">Telepathic Data Transfer · v${esc(S.version)}</div>
    <div class="quote glass">“Made by <b class="gtext">Balaj</b>. Rolled one, lit it, and somewhere around the middle of that J decided he needed this service for himself. Why? idk. Lame.”
      <small>— the author, probably still holding it</small></div>
    <div class="feat">
      <div class="glass"><b>Files, any size</b>Drag, drop, paste. Streams straight to disk with live speed.</div>
      <div class="glass"><b>Chat</b>A private channel between your devices. Links get saved automatically.</div>
      <div class="glass"><b>Links</b>One shelf for every URL you want on another screen.</div>
      <div class="glass"><b>Wi-Fi or anywhere</b>Local by default. One click for a secure global link.</div>
      <div class="glass"><b>PIN-locked</b>6 digits, rate-limited, kick any device instantly.</div>
      <div class="glass"><b>Zero install</b>One file. No cloud account. Your PC is the server.</div>
    </div></div></div>`;
  Eye.anchor(null, 0.3);
}

// ---------- boot
Eye.init($("#space"));
sync();
