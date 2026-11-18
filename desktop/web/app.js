/* 1EYE — app */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const I = (d, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const ICON = {
  cloud: I('<path d="M7 18a5 5 0 0 1-.6-9.96A6.5 6.5 0 0 1 19 9.5a4.25 4.25 0 0 1-.75 8.5Z"/>'),
  cloudup: I('<path d="M7 18a5 5 0 0 1-.6-9.96A6.5 6.5 0 0 1 19 9.5a4.25 4.25 0 0 1-.75 8.5"/><path d="M12 20v-8"/><path d="m9 15 3-3 3 3"/>'),
  clouddown: I('<path d="M7 18a5 5 0 0 1-.6-9.96A6.5 6.5 0 0 1 19 9.5a4.25 4.25 0 0 1-.75 8.5"/><path d="M12 12v8"/><path d="m9 17 3 3 3-3"/>'),
  share: I('<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>'),
  refresh: I('<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3v5h5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 21v-5h-5"/>'),
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
  ai: I('<path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8Z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z"/>'),
  settings: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'),
};

// ---------- preferences (per device)
const PREF = (() => { const d = { theme: "void", motion: matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "full", sound: true, notify: false }; try { return Object.assign(d, JSON.parse(localStorage.getItem("1eye-prefs") || "{}")); } catch { return d; } })();
function savePrefs() { try { localStorage.setItem("1eye-prefs", JSON.stringify(PREF)); localStorage.setItem("1eye-theme", PREF.theme); } catch (_) {} }
function applyPrefs() { document.documentElement.dataset.theme = PREF.theme; Eye.theme(PREF.theme); Eye.motion(PREF.motion); const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(); }

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
  if (!PREF.sound) return;
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
      if (PREF.notify && document.hidden && "Notification" in window && Notification.permission === "granted") { try { new Notification(m.name, { body: m.text.slice(0, 140), icon: "/assets/logo.svg", tag: "1eye-chat" }); } catch (_) {} }
      if (page !== "chat") toast(m.text.slice(0, 90), m.name);
    }
    const pf = new Set((prev.files || []).map(f => f.name));
    const nf = (S.files || []).filter(f => !pf.has(f.name));
    if (nf.length && !uploads.size) { Eye.flow(1.4); Eye.pulse(0.5); toast(nf.length === 1 ? `Arrived: ${nf[0].name}` : `${nf.length} files arrived`); }
  }
  for (const j of (S.cloud || {}).jobs || []) if (j.done && !cloudSeenJobs.has(j.id)) {
    cloudSeenJobs.add(j.id);
    if (!firstSync) { toast(j.err ? `${j.name}: ${j.err}` : j.dir === "up" ? `Saved to cloud: ${j.name}` : `Brought into 1EYE: ${j.name}`); if (page === "cloud") loadCloud(false); }
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
  const items = [["transfer", "Transfer"], ["chat", "Chat"], ["links", "Links"]];
  items.push(["ai", "AI"], ["cloud", "Cloud"]);
  items.push(["devices", "Devices"]);
  if (host) items.push(["control", "Control"]);
  items.push(["settings", "Settings"], ["about", "About"]);
  const onlineCount = (S.devices || []).filter(d => d.online).length;
  $("#side").innerHTML = `
    <div class="brand">${LOGO}<div><b class="gtext">1EYE</b><small>Telepathic Data Transfer</small></div></div>
    ${items.map(([k, n]) => `<a class="nav ${page === k ? "on" : ""}" href="#${k}">${ICON[k === "links" ? "link" : k]}<span>${n}</span>${k === "chat" && u ? `<span class="badge">${u}</span>` : ""}${k === "devices" ? `<span class="badge" style="background:rgba(var(--fg-rgb),.08);color:var(--muted)">${onlineCount}</span>` : ""}</a>`).join("")}
    <div class="sp"></div>
    <div class="me glass"><div class="ava" style="${avaStyle(S.me.name)}">${initials(S.me.name)}</div>
      <div style="min-width:0"><b>${esc(S.me.name)}</b><span class="pill ${host ? "host" : location.hostname.endsWith("trycloudflare.com") ? "internet" : "wifi"}">${host ? "Host" : location.hostname.endsWith("trycloudflare.com") ? "Internet" : "Wi-Fi"}</span></div>
      ${host ? "" : `<button class="btn icon sm" style="margin-left:auto" title="Disconnect" onclick="logout()">${ICON.logout}</button>`}</div>
    <div class="credit">v${esc(S.version || "")} · crafted by <a href="#about">Balaj</a></div>`;
}
async function logout() { if (confirm("Disconnect this device?")) { await api("/api/logout"); location.reload(); } }

// ---------- router
addEventListener("hashchange", () => { page = (location.hash || "#transfer").slice(1); selMode = false; sel.clear(); renderSide(); renderPage(); $("#main").scrollTop = 0; });

function renderPage(soft) {
  const main = $("#main");
  const fn = { transfer: pTransfer, chat: pChat, links: pLinks, ai: pAI, cloud: pCloud, devices: pDevices, control: pControl, settings: pSettings, about: pAbout }[page] || pTransfer;
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
  const key = list.map(f => f.name + f.mtime).join("|") + selMode + [...sel].join("/") + cloudAccts().length;
  if (box.dataset.key === key) return;
  box.dataset.key = key;
  box.innerHTML = list.map(f => {
    const ext = (f.name.split(".").pop() || "").slice(0, 5).toUpperCase();
    const u = "/f/" + encodeURIComponent(f.name);
    const th = f.kind === "image" ? `<img loading="lazy" src="${u}?view=1" alt="">` : `<span class="big" style="color:hsl(${hue(f.kind) % 360} 80% 75%)">${ICON[f.kind] || ICON.other}</span>`;
    return `<div class="fc ${sel.has(f.name) ? "sel" : ""}" data-n="${esc(f.name)}">
      <div class="thumb">${th}<span class="ext">${esc(ext)}</span></div><span class="tick"></span>
      <div class="acts"><a class="btn icon sm" href="${u}" title="Download" onclick="event.stopPropagation()">${ICON.down}</a>${cloudAccts().length ? `<button class="btn icon sm" title="Save to cloud" data-cl>${ICON.cloudup}</button>` : ""}<button class="btn icon sm danger" title="Delete" data-del>${ICON.trash}</button></div>
      <div class="info"><div class="nm" title="${esc(f.name)}">${esc(f.name)}</div><div class="mt">${size(f.size)} · ${ago(f.mtime)}</div></div></div>`;
  }).join("");
  $$(".fc", box).forEach(el => {
    const n = el.dataset.n;
    el.onclick = e => {
      if (e.target.closest("[data-cl]")) { e.stopPropagation(); pickCloud(e.target.closest("[data-cl]"), a => cloudOp({ op: "save", acct: a.id, file: n }, `Saving to ${a.name}…`)); return; }
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
      <div class="composer"><textarea class="input" id="ct" rows="1" placeholder="${(S.ai || {}).inChat ? "Think it. Send it.  Start with @eye to ask 1EYE AI" : "Think it. Send it.  (Enter to send · Shift+Enter for new line)"}"></textarea>
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
    const mine = m.from === S.me.id, cont = prev && prev.from === m.from && m.ts - prev.ts < 120000, bot = m.from === "ai";
    if (!cont) html += `<div class="who ${mine ? "mine" : ""}">${mine ? "You" : esc(m.name)} · ${clock(m.ts)}</div>`;
    html += `<div class="m ${mine ? "mine" : ""} ${cont ? "cont" : ""} ${bot ? "bot" : ""}">${bot ? `<div class="ava botava">${LOGO}</div>` : `<div class="ava" style="${avaStyle(m.name)}">${initials(m.name)}</div>`}
      <div class="bub">${bot ? md(m.text) : linkify(m.text)}<button class="btn icon sm cp" title="Copy" data-c="${esc(m.id)}">${ICON.copy}</button></div></div>`;
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
          <div class="glass card" id="aicard"></div>
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
  drawAICard();
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
    <div class="quote glass">“I built 1EYE because I needed it myself: one eye across every device I own, and nothing in between.”
      <small>— <b class="gtext">Balaj</b>, creator of 1EYE</small></div>
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


// ======================================================= MARKDOWN (safe subset, escapes first)
function md(src) {
  const blocks = String(src || "").split(/```/);
  return blocks.map((b, i) => {
    if (i % 2) return `<pre class="code">${esc(b.replace(/^[a-z0-9]*\n/i, ""))}</pre>`;
    let h = esc(b);
    h = h.replace(/`([^`\n]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>")
      .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?]|$)/g, "$1<i>$2</i>")
      .replace(/^#{1,4}\s+(.+)$/gm, "<b class=\"mdh\">$1</b>")
      .replace(/(https?:\/\/[^\s<]+)/g, m => `<a href="${m}" target="_blank" rel="noopener">${m}</a>`);
    const lines = h.split("\n"); let out = "", list = null;
    for (const ln of lines) {
      const ul = ln.match(/^\s*[-*•]\s+(.*)/), ol = ln.match(/^\s*\d+[.)]\s+(.*)/);
      const kind = ul ? "ul" : ol ? "ol" : null;
      if (kind !== list) { if (list) out += `</${list}>`; if (kind) out += `<${kind}>`; list = kind; }
      if (kind) out += `<li>${(ul || ol)[1]}</li>`; else out += ln.trim() ? `<p>${ln}</p>` : "";
    }
    if (list) out += `</${list}>`;
    return out;
  }).join("");
}

// ======================================================= AI
let aiThread = (() => { try { return JSON.parse(localStorage.getItem("1eye-ai") || "[]"); } catch { return []; } })();
const aiCtx = { chat: false, links: false, files: true, attach: [] };
let aiWaiting = false;
function saveThread() { try { localStorage.setItem("1eye-ai", JSON.stringify(aiThread.slice(-40))); } catch (_) {} }
function pAI(main, soft) {
  const A = S.ai || {};
  if (!soft) {
    main.innerHTML = `<div class="page" style="padding-bottom:20px">
      <div class="head"><div><div class="label">Assistant · powered by Groq</div><h1>1EYE AI</h1></div><div class="sp"></div>
        <span class="pill" id="aimodel"></span><button class="btn sm" id="aiclear">${ICON.trash} New chat</button></div>
      <div class="chatwrap glass"><div class="msgs" id="aimsgs"></div>
        <div class="ctxbar" id="ctxbar"></div>
        <div class="composer"><textarea class="input" id="ai-t" rows="1" placeholder="Ask anything — about your files, your chat, or the world"></textarea>
        <button class="btn glow" id="ai-s" style="height:46px;width:52px;padding:0">${ICON.send}</button></div></div></div>`;
    Eye.anchor(null, 0.3);
    const ta = $("#ai-t");
    ta.oninput = () => { ta.style.height = "auto"; ta.style.height = Math.min(160, ta.scrollHeight) + "px"; };
    ta.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); askAI(); } };
    $("#ai-s").onclick = () => askAI();
    $("#aiclear").onclick = () => { aiThread = []; saveThread(); drawAI(true); };
    setTimeout(() => ta.focus(), 50);
  }
  $("#aimodel").textContent = A.model ? A.model.replace(/^openai\//, "") : (A.available ? "Groq" : "Off");
  drawCtx();
  drawAI(!soft);
}
function drawCtx() {
  const bar = $("#ctxbar"); if (!bar) return;
  const texts = (S.files || []).filter(f => /\.(txt|md|csv|json|log|xml|ya?ml|ini|html?|css|js|ts|py|go|java|c|cpp|h|sql|sh|bat|ps1|srt|vtt)$/i.test(f.name));
  const key = JSON.stringify([aiCtx, texts.map(f => f.name)]);
  if (bar.dataset.k === key) return; bar.dataset.k = key;
  bar.innerHTML = `<span class="label" style="margin-right:4px">Context</span>
    ${[["files", "File list"], ["chat", "Chat"], ["links", "Links"]].map(([k, n]) => `<div class="chip ${aiCtx[k] ? "on" : ""}" data-k="${k}">${n}</div>`).join("")}
    ${texts.length ? `<select class="input sel" id="attach"><option value="">Attach a text file…</option>${texts.slice(0, 50).map(f => `<option ${aiCtx.attach.includes(f.name) ? "disabled" : ""} value="${esc(f.name)}">${esc(f.name)}</option>`).join("")}</select>` : ""}
    ${aiCtx.attach.map(n => `<span class="chip on" data-rm="${esc(n)}">${ICON.doc.replace("<svg", '<svg width="13" height="13"')} ${esc(n)} ✕</span>`).join("")}`;
  $$("[data-k]", bar).forEach(c => c.onclick = () => { aiCtx[c.dataset.k] = !aiCtx[c.dataset.k]; drawCtx(); });
  $$("[data-rm]", bar).forEach(c => c.onclick = () => { aiCtx.attach = aiCtx.attach.filter(x => x !== c.dataset.rm); drawCtx(); });
  const sel = $("#attach"); if (sel) sel.onchange = () => { if (sel.value && aiCtx.attach.length < 3) aiCtx.attach.push(sel.value); drawCtx(); };
}
function drawAI(scroll) {
  const box = $("#aimsgs"); if (!box) return;
  const A = S.ai || {};
  if (!A.available) {
    box.innerHTML = `<div class="empty" style="margin:auto;max-width:420px">${ICON.ai}<div><b style="color:var(--ink)">1EYE AI is off</b><br>${S.me.host ? `Add a free Groq key in <a href="#control" style="color:var(--v)">Control → AI</a> to switch it on.` : "The host hasn't shared AI with other devices."}</div></div>`;
    return;
  }
  if (!aiThread.length) {
    const ideas = ["Summarize what we chatted about today", "Which files did I share most recently?", "Write a WhatsApp message announcing 1EYE to my friends", "Explain how Anywhere mode keeps my files private"];
    box.innerHTML = `<div class="aiempty"><div class="botava big">${LOGO}</div><h3>Ask 1EYE AI</h3><p class="muted">It can read your file list, chat and links when you switch them on below, plus up to 3 text files.</p>
      <div class="ideas">${ideas.map(t => `<button class="idea glass" data-q="${esc(t)}">${esc(t)}</button>`).join("")}</div></div>`;
    $$("[data-q]", box).forEach(b => b.onclick = () => { if (/chatted/.test(b.dataset.q)) aiCtx.chat = true; if (/files/.test(b.dataset.q)) aiCtx.files = true; drawCtx(); askAI(b.dataset.q); });
    return;
  }
  box.innerHTML = aiThread.map(m => m.role === "user"
    ? `<div class="m mine"><div class="ava" style="${avaStyle(S.me.name)}">${initials(S.me.name)}</div><div class="bub">${esc(m.content)}</div></div>`
    : `<div class="m bot"><div class="ava botava">${LOGO}</div><div class="bub ${m.err ? "err" : ""}">${m.err ? esc(m.content) : md(m.content)}<button class="btn icon sm cp" title="Copy" data-i="${aiThread.indexOf(m)}">${ICON.copy}</button></div></div>`).join("")
    + (aiWaiting ? `<div class="m bot"><div class="ava botava">${LOGO}</div><div class="bub typing"><i></i><i></i><i></i></div></div>` : "");
  $$("[data-i]", box).forEach(b => b.onclick = () => copy(aiThread[+b.dataset.i].content));
  if (scroll !== false) box.scrollTop = box.scrollHeight;
}
async function askAI(q) {
  const ta = $("#ai-t"); const text = (q || (ta && ta.value) || "").trim();
  if (!text || aiWaiting) return;
  if (ta) { ta.value = ""; ta.style.height = "auto"; }
  aiThread.push({ role: "user", content: text }); aiWaiting = true; drawAI(); Eye.flow(1.2);
  const msgs = aiThread.filter(m => !m.err).map(m => ({ role: m.role, content: m.content }));
  const r = await api("/api/ai", { messages: msgs, chat: aiCtx.chat, links: aiCtx.links, files: aiCtx.files, attach: aiCtx.attach }).catch(() => ({ ok: false, err: "Couldn't reach the host" }));
  aiWaiting = false;
  aiThread.push(r.ok ? { role: "assistant", content: r.reply } : { role: "assistant", content: r.err || "Something went wrong", err: true });
  saveThread(); Eye.pulse(r.ok ? 0.8 : 0.2);
  if (page === "ai") drawAI();
}
function drawAICard() {
  const card = $("#aicard"); if (!card) return;
  const A = S.ai || {};
  const key = JSON.stringify([A.configured, A.model, A.allowDevices, A.inChat, A.keyHint]);
  if (card.dataset.k === key) return; card.dataset.k = key;
  const known = (A.models || []).some(m => m.id === A.model);
  const opts = (A.models || []).map(m => `<option value="${esc(m.id)}" ${m.id === A.model ? "selected" : ""}>${esc(m.name)}</option>`).join("") + `<option value="__custom" ${A.configured && !known ? "selected" : ""}>Custom model ID…</option>`;
  card.innerHTML = `<h3>${ICON.ai.replace("<svg", '<svg width="16" height="16"')} 1EYE AI <span class="pill ${A.configured ? "host" : ""}" style="margin-left:auto">${A.configured ? "On" : "Off"}</span></h3>
    ${A.configured ? `<div class="muted" style="font-size:12.5px;margin-bottom:10px">Groq key ${esc(A.keyHint || "")} · stored only on this PC</div>` : `<div class="muted" style="font-size:12.5px;margin-bottom:10px">Paste a free key from <b style="color:var(--ink)">console.groq.com/keys</b>. It stays on this PC and is never sent to other devices.</div>
      <input class="input" id="aikey" type="password" placeholder="gsk_…" autocomplete="off" style="margin-bottom:8px">`}
    <select class="input" id="aimodelsel" style="margin-bottom:8px">${opts}</select>
    <input class="input" id="aicustom" placeholder="e.g. qwen/qwen3.6-27b" style="margin-bottom:8px;${A.configured && !known ? "" : "display:none"}" value="${A.configured && !known ? esc(A.model) : ""}">
    ${A.configured ? `<label class="tog"><input type="checkbox" id="aidev" ${A.allowDevices ? "checked" : ""}><span></span>Let signed-in devices use AI</label>
      <label class="tog"><input type="checkbox" id="aichat" ${A.inChat ? "checked" : ""}><span></span>Answer “@eye …” in Chat</label>` : ""}
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
      ${A.configured ? `<button class="btn sm" id="aitest">Test</button><button class="btn sm" id="aisave">Save model</button><button class="btn sm danger" id="airm">Remove key</button>` : `<button class="btn glow" id="aiadd" style="width:100%">Save &amp; test</button>`}</div>
    <div class="muted" id="aimsg" style="font-size:12.5px;margin-top:8px;min-height:16px"></div>`;
  const msg = t => $("#aimsg").textContent = t;
  const modelVal = () => $("#aimodelsel").value === "__custom" ? $("#aicustom").value.trim() : $("#aimodelsel").value;
  $("#aimodelsel").onchange = () => { $("#aicustom").style.display = $("#aimodelsel").value === "__custom" ? "" : "none"; };
  if ($("#aiadd")) $("#aiadd").onclick = async () => { const k = $("#aikey").value.trim(); if (!k) return msg("Paste your Groq key first"); msg("Testing…"); const r = await api("/host/ai", { key: k, model: modelVal(), test: true }); msg(r.ok ? "Connected ✓ — " + r.reply : r.err); if (!r.ok) api("/host/ai", { clear: true }); else toast("1EYE AI is on"); };
  if ($("#aitest")) $("#aitest").onclick = async () => { msg("Testing…"); const r = await api("/host/ai", { test: true }); msg(r.ok ? "Connected ✓ — " + r.reply : r.err); };
  if ($("#aisave")) $("#aisave").onclick = async () => { await api("/host/ai", { model: modelVal() }); msg("Model saved"); };
  if ($("#airm")) $("#airm").onclick = async () => { if (confirm("Remove the Groq key and switch AI off?")) await api("/host/ai", { clear: true }); };
  if ($("#aidev")) $("#aidev").onchange = e => api("/host/ai", { allowDevices: e.target.checked });
  if ($("#aichat")) $("#aichat").onchange = e => api("/host/ai", { inChat: e.target.checked });
}

// ======================================================= SETTINGS
function pSettings(main, soft) {
  if (soft) return;
  const T = THEMES;
  main.innerHTML = `<div class="page">
    <div class="head"><div><div class="label">This device</div><h1>Settings</h1><p>Saved on this device only.</p></div></div>
    <div class="glass card"><h3>Theme</h3><div class="themes">${Object.entries(T).map(([id, t]) => `
      <button class="theme ${PREF.theme === id ? "on" : ""}" data-t="${id}" style="--a:rgb(${t.v});--b:rgb(${t.c});--bgc:${t.light ? "#eceef4" : "#07070a"}">
        <span class="sw"><i></i></span><b>${t.name}</b><small>${t.light ? "Light" : "Dark"}</small></button>`).join("")}</div></div>
    <div class="grid2" style="margin-top:16px">
      <div class="glass card"><h3>Motion</h3><div class="seg" id="mot">${[["full", "Full 3D"], ["reduced", "Calm"], ["off", "Still"]].map(([k, n]) => `<div data-m="${k}" class="${PREF.motion === k ? "on" : ""}">${n}</div>`).join("")}</div>
        <div class="muted" style="font-size:12.5px">Calm and Still use less battery.</div></div>
      <div class="glass card"><h3>Alerts</h3>
        <label class="tog"><input type="checkbox" id="snd" ${PREF.sound ? "checked" : ""}><span></span>Sound for new messages</label>
        <label class="tog"><input type="checkbox" id="ntf" ${PREF.notify ? "checked" : ""}><span></span>Desktop notifications</label>
        <div class="muted" id="ntfmsg" style="font-size:12px;margin-top:6px"></div></div>
    </div>
    <div class="glass card" style="margin-top:16px"><h3>Device name</h3><div style="display:flex;gap:8px"><input class="input" id="dn" maxlength="30" value="${esc(S.me.name || "")}"><button class="btn" id="dns">Save</button></div></div>
  </div>`;
  Eye.anchor(null, 0.45);
  $$("[data-t]").forEach(b => b.onclick = () => { PREF.theme = b.dataset.t; savePrefs(); applyPrefs(); $$("[data-t]").forEach(x => x.classList.toggle("on", x === b)); Eye.pulse(0.8); });
  $$("[data-m]").forEach(b => b.onclick = () => { PREF.motion = b.dataset.m; savePrefs(); applyPrefs(); $$("[data-m]").forEach(x => x.classList.toggle("on", x === b)); });
  $("#snd").onchange = e => { PREF.sound = e.target.checked; savePrefs(); if (PREF.sound) chime(); };
  $("#ntf").onchange = async e => {
    if (!e.target.checked) { PREF.notify = false; savePrefs(); return; }
    if (!("Notification" in window) || !isSecureContext) { e.target.checked = false; $("#ntfmsg").textContent = "Your browser only allows notifications over HTTPS — use the Anywhere or domain link."; return; }
    const p = await Notification.requestPermission(); PREF.notify = p === "granted"; e.target.checked = PREF.notify; savePrefs();
    $("#ntfmsg").textContent = PREF.notify ? "You'll be notified when this tab is in the background." : "Permission was blocked in the browser.";
  };
  $("#dns").onclick = async () => { const r = await api("/api/rename", { name: $("#dn").value }); toast(r.ok ? "Renamed" : r.err); };
}

// ---------- boot
Eye.init($("#space"));
applyPrefs();
sync();

// ======================================================= CLOUD
let cloudLists = {}, cloudLoading = false, cloudSeenJobs = new Set(), cloudAdd = "";
const DAV = {
  koofr: { name: "Koofr", url: "https://app.koofr.net/dav/Koofr", note: "10 GB free. Use your Koofr email and an app password from Koofr → Preferences → Password → App passwords." },
  infini: { name: "InfiniCLOUD", url: "https://", note: "20 GB free. Turn on Apps Connection in InfiniCLOUD → My Page, then copy the WebDAV URL, ID and app password it shows." },
  nextcloud: { name: "Nextcloud", url: "https://your-server/remote.php/dav/files/USERNAME", note: "Any Nextcloud: use an app password from Settings → Security." },
  custom: { name: "", url: "https://", note: "Any WebDAV storage. Paste the folder address, username and password." },
};
function cloudAccts() { const C = S.cloud || {}; return C.available ? (C.accounts || []) : []; }
async function cloudOp(body, msg) {
  if (msg) toast(msg);
  const r = await api("/api/cloud", body);
  if (!r.ok) toast(r.err || "Cloud action failed");
  return r;
}
function pickCloud(btn, fn) {
  const A = cloudAccts();
  if (A.length === 1) return fn(A[0]);
  $(".cmenu")?.remove();
  const m = document.createElement("div"); m.className = "cmenu glass";
  m.innerHTML = `<div class="label" style="padding:6px 10px">Save to</div>` + A.map((a, i) => `<button data-i="${i}">${ICON.cloud} ${esc(a.name)}<small>${esc(a.email || "")}</small></button>`).join("");
  document.body.append(m);
  const r = btn.getBoundingClientRect();
  m.style.left = Math.min(innerWidth - 240, r.left) + "px"; m.style.top = (r.bottom + 6) + "px";
  m.onclick = e => { const b = e.target.closest("[data-i]"); if (b) { fn(A[+b.dataset.i]); m.remove(); } };
  setTimeout(() => addEventListener("click", function off(e) { if (!m.contains(e.target)) { m.remove(); removeEventListener("click", off); } }), 0);
}
async function loadCloud(force) {
  if (cloudLoading) return; cloudLoading = true;
  const r = await fetch("/api/cloud" + (force ? "?refresh=1" : ""), { cache: "no-store" }).then(r => r.json()).catch(() => ({}));
  cloudLoading = false;
  if (r.ok) cloudLists = r.lists || {};
  if (page === "cloud") drawCloud();
}
function pCloud(main, soft) {
  const C = S.cloud || {};
  if (!soft) {
    main.innerHTML = `<div class="page">
      <div class="head"><div><div class="label">Free storage · Google Drive &amp; WebDAV</div><h1>Cloud</h1><p>Keep copies in your own free cloud. Files there stay reachable even when this ${(S.host || {}).platform === "android" ? "phone" : "PC"} is off.</p></div><div class="sp"></div>
        <button class="btn sm" id="crf">${ICON.refresh} Refresh</button></div>
      <div id="cjobs" class="queue" style="margin:0 0 16px"></div>
      <div id="caccts" style="display:grid;gap:16px"></div>
      ${S.me.host ? `<div class="glass card" id="cadd" style="margin-top:16px"></div>` : ""}</div>`;
    Eye.anchor(null, 0.3);
    $("#crf").onclick = () => { toast("Refreshing…"); loadCloud(true); };
    loadCloud(false);
  }
  drawCloud();
}
function drawCloud() {
  const C = S.cloud || {}, host = S.me.host;
  const jb = $("#cjobs"); if (!jb) return;
  jb.innerHTML = (C.jobs || []).filter(j => !j.done || j.err).map(j => `<div class="qi glass"><div class="ic">${j.dir === "up" ? ICON.cloudup : ICON.clouddown}</div>
    <div style="min-width:0"><div class="nm">${esc(j.name)}</div><div class="sub" style="${j.err ? "color:var(--bad)" : ""}">${j.err ? esc(j.err) : (j.dir === "up" ? "Uploading to cloud · " : "Bringing into 1EYE · ") + Math.round(j.pct * 100) + "%"}</div><div class="prog"><i style="width:${Math.round(j.pct * 100)}%"></i></div></div><span></span></div>`).join("");
  const box = $("#caccts");
  if (!C.available) { box.innerHTML = `<div class="empty">${ICON.cloud}<div><b style="color:var(--ink)">Cloud is off for this device</b><br>The host hasn't shared cloud storage with other devices.</div></div>`; return; }
  const A = C.accounts || [];
  if (!A.length) box.innerHTML = `<div class="empty">${ICON.cloud}<div><b style="color:var(--ink)">No cloud connected yet</b><br>${host ? "Connect Google Drive or a free WebDAV service below." : "The host hasn't connected any cloud storage."}</div></div>`;
  else {
    const key = JSON.stringify([A, cloudLists, C.auto, host]);
    if (box.dataset.k !== key) {
      box.dataset.k = key;
      box.innerHTML = A.map(a => {
        const L = cloudLists[a.id], files = (L && L.files) || [];
        const pct = a.cap ? Math.min(100, a.used / a.cap * 100) : 0;
        return `<div class="glass card cacct" data-a="${esc(a.id)}">
          <div class="chead"><div class="cico ${a.kind}">${a.kind === "gdrive" ? GDRIVE : ICON.cloud}</div>
            <div style="min-width:0;flex:1"><b>${esc(a.name)}</b><div class="muted" style="font-size:12.5px">${esc(a.email || (a.kind === "webdav" ? "WebDAV" : ""))} · ${files.length} file${files.length === 1 ? "" : "s"} in “1EYE”${a.cap ? ` · ${size(a.used)} of ${size(a.cap)} used` : ""}</div>
            ${a.cap ? `<div class="prog" style="max-width:320px"><i style="width:${pct}%"></i></div>` : ""}</div>
            ${host ? `<label class="tog" title="Copy every new file here automatically"><input type="checkbox" data-auto ${C.auto === a.id ? "checked" : ""}><span></span>Auto-backup</label>
            <button class="btn icon sm danger" title="Disconnect" data-rm>${ICON.x}</button>` : ""}</div>
          ${a.err || (L && L.err) ? `<div class="cerr">${esc(a.err || L.err)}</div>` : ""}
          ${!L ? `<div class="muted" style="padding:14px 4px">Loading…</div>` : !files.length ? `<div class="muted" style="padding:14px 4px">Empty. Use the ${ICON.cloudup.replace("<svg", '<svg width="14" height="14" style="vertical-align:-2px"')} button on any file in Transfer to save it here.</div>` :
          `<div class="clist">${files.map(f => `<div class="crow" data-id="${esc(f.id)}">
            <span class="ck" style="color:hsl(${hue(f.name.split(".").pop()) % 360} 80% 75%)">${ICON.other}</span>
            <div style="min-width:0;flex:1"><div class="nm" title="${esc(f.name)}">${esc(f.name)}</div><div class="mt">${size(f.size)} · ${ago(f.mtime)}${f.public ? ` · <span style="color:var(--v)">public link on</span>` : ""}</div></div>
            <a class="btn icon sm" title="Download" href="/cloud/f/${encodeURIComponent(a.id)}/${encodeURIComponent(f.id)}">${ICON.down}</a>
            <button class="btn icon sm" title="Bring into 1EYE (share with all devices)" data-op="fetch">${ICON.clouddown}</button>
            ${a.share ? `<button class="btn icon sm ${f.public ? "primary" : ""}" title="${f.public ? "Copy public link (works when this PC is off)" : "Create public link"}" data-op="share">${ICON.share}</button>` : ""}
            <button class="btn icon sm danger" title="Delete from cloud" data-op="delete">${ICON.trash}</button></div>`).join("")}</div>`}
        </div>`;
      }).join("");
      $$(".cacct", box).forEach(card => {
        const a = A.find(x => x.id === card.dataset.a);
        const auto = $("[data-auto]", card); if (auto) auto.onchange = () => api("/host/cloud", { op: "auto", id: a.id, on: auto.checked }).then(() => toast(auto.checked ? `New files will be saved to ${a.name}` : "Auto-backup off"));
        const rm = $("[data-rm]", card); if (rm) rm.onclick = () => confirm(`Disconnect ${a.name}? Files already in the cloud stay there.`) && api("/host/cloud", { op: "remove", id: a.id });
        $$("[data-op]", card).forEach(b => b.onclick = async () => {
          const id = b.closest(".crow").dataset.id, f = (cloudLists[a.id].files || []).find(x => x.id === id), op = b.dataset.op;
          if (op === "fetch") cloudOp({ op, acct: a.id, id }, `Bringing ${f.name} into 1EYE…`);
          if (op === "delete" && confirm(`Delete "${f.name}" from ${a.name}?${a.kind === "gdrive" ? " (It goes to your Drive trash.)" : ""}`)) { await cloudOp({ op, acct: a.id, id }); loadCloud(true); }
          if (op === "share") {
            if (f.public) { copy(f.public); return; }
            if (!confirm(`Make a public link for "${f.name}"? Anyone with the link can download it, even when this PC is off.`)) return;
            const r = await cloudOp({ op, acct: a.id, id, on: true }); if (r.ok) { copy(r.link); loadCloud(true); }
          }
        });
      });
    }
  }
  if (host) drawCloudAdd();
}
const GDRIVE = `<svg viewBox="0 0 24 24" width="22" height="22"><path fill="#0f9d58" d="M8 3h8l7 12h-8z"/><path fill="#f4b400" d="M8 3 1 15l4 6 7-12z"/><path fill="#4285f4" d="M5 21h14l4-6H9z"/></svg>`;
function drawCloudAdd() {
  const box = $("#cadd"); if (!box) return;
  const C = S.cloud || {};
  const key = JSON.stringify([cloudAdd, C.googleReady, C.googleOwn, C.allowDevices]);
  if (box.dataset.k === key) return; box.dataset.k = key;
  const P = DAV[cloudAdd];
  box.innerHTML = `<h3>${ICON.plus.replace("<svg", '<svg width="16" height="16"')} Add free storage</h3>
    <div class="cprov">
      <button class="prov" id="pg">${GDRIVE}<b>Google Drive</b><small>15 GB free</small></button>
      <button class="prov ${cloudAdd === "koofr" ? "on" : ""}" data-p="koofr">${ICON.cloud}<b>Koofr</b><small>10 GB free</small></button>
      <button class="prov ${cloudAdd === "infini" ? "on" : ""}" data-p="infini">${ICON.cloud}<b>InfiniCLOUD</b><small>20 GB free</small></button>
      <button class="prov ${cloudAdd === "nextcloud" ? "on" : ""}" data-p="nextcloud">${ICON.cloud}<b>Nextcloud</b><small>your server</small></button>
      <button class="prov ${cloudAdd === "custom" ? "on" : ""}" data-p="custom">${ICON.cloud}<b>Other WebDAV</b><small>any service</small></button>
    </div>
    ${cloudAdd === "google" ? `<div class="cform">
        <p class="muted" style="margin:0 0 10px;font-size:13px">Google Drive needs a free Google app ID, made once in Google Cloud Console: create a project, enable the <b style="color:var(--ink)">Google Drive API</b>, set up the consent screen, then <b style="color:var(--ink)">Credentials → Create OAuth client ID → Desktop app</b>. Paste its ID and secret here. They stay on this PC.</p>
        <input class="input" id="gid" placeholder="Client ID (….apps.googleusercontent.com)" autocomplete="off">
        <input class="input" id="gsec" type="password" placeholder="Client secret" autocomplete="off">
        <div style="display:flex;gap:8px"><button class="btn primary" id="gsave">Save and connect</button>${C.googleOwn ? `<button class="btn" id="gclear">Remove my Google app</button>` : ""}</div></div>` : ""}
    ${P ? `<div class="cform"><p class="muted" style="margin:0 0 10px;font-size:13px">${esc(P.note)}</p>
        <input class="input" id="dn" placeholder="Name (e.g. ${esc(P.name || "My storage")})" value="${esc(P.name)}">
        <input class="input" id="du" placeholder="WebDAV address" value="${esc(P.url)}">
        <input class="input" id="dus" placeholder="Username or email" autocomplete="off">
        <input class="input" id="dpw" type="password" placeholder="App password" autocomplete="new-password">
        <button class="btn primary" id="dgo">Connect</button></div>` : ""}
    <label class="tog" style="margin-top:6px"><input type="checkbox" id="cdev" ${C.allowDevices ? "checked" : ""}><span></span>Let signed-in devices use the cloud (save, download, links)</label>`;
  const startG = () => { const u = "/cloud/google/start"; if ((S.host || {}).platform === "android") location.href = u; else window.open(u, "_blank"); toast("Finish signing in to Google in the new tab"); };
  $("#pg").onclick = () => { if (C.googleReady && cloudAdd !== "google") startG(); else { cloudAdd = cloudAdd === "google" ? "" : "google"; box.dataset.k = ""; drawCloudAdd(); } };
  $$("[data-p]", box).forEach(b => b.onclick = () => { cloudAdd = cloudAdd === b.dataset.p ? "" : b.dataset.p; box.dataset.k = ""; drawCloudAdd(); });
  if ($("#gsave")) $("#gsave").onclick = async () => { const id = $("#gid").value.trim(), sec = $("#gsec").value.trim(); if (!id.endsWith(".apps.googleusercontent.com")) return toast("That doesn't look like a Google client ID"); await api("/host/cloud", { op: "googleApp", clientId: id, secret: sec }); cloudAdd = ""; startG(); };
  if ($("#gclear")) $("#gclear").onclick = () => api("/host/cloud", { op: "googleApp", clientId: "", secret: "" });
  if ($("#dgo")) $("#dgo").onclick = async () => {
    const b = $("#dgo"); b.disabled = true; b.textContent = "Connecting…";
    const r = await api("/host/cloud", { op: "webdav", name: $("#dn").value, url: $("#du").value, user: $("#dus").value, pass: $("#dpw").value });
    b.disabled = false; b.textContent = "Connect";
    if (r.ok) { toast("Connected"); cloudAdd = ""; box.dataset.k = ""; loadCloud(true); } else toast(r.err || "Couldn't connect");
  };
  $("#cdev").onchange = e => api("/host/cloud", { op: "allowDevices", on: e.target.checked });
}
