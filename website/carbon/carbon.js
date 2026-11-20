/* 1EYE Carbon — chat with Carbon (Qwen2.5 1.5B abliterated) running on 1EYE's cloud engine.
   Chats live only in this browser (localStorage); the engine stores nothing. */
(() => {
  const API = window.CARBON_API || "https://REPLACE-carbon.hf.space";
  const $ = s => document.querySelector(s);
  const log = $("#log"), form = $("#ask"), box = $("#q"), send = $("#send"), stat = $("#cstat");
  const KEY = "1eye-carbon-chat";
  let msgs = [], busy = false, ctl = null;
  try { msgs = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (_) { msgs = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(msgs.slice(-40))); } catch (_) {} };
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Markdown, then strip anything active: the model's text is never trusted as HTML
  function md(text) {
    let html = window.marked ? marked.parse(text, { breaks: true }) : "<p>" + esc(text).replace(/\n/g, "<br>") + "</p>";
    const d = new DOMParser().parseFromString("<div>" + html + "</div>", "text/html");
    d.querySelectorAll("script,style,iframe,object,embed,form,input,button,link,meta,img,video,audio,svg").forEach(e => e.remove());
    d.querySelectorAll("*").forEach(e => [...e.attributes].forEach(a => { if (/^on/i.test(a.name) || (a.name === "href" && !/^https?:/i.test(a.value))) e.removeAttribute(a.name); }));
    d.querySelectorAll("a").forEach(a => { a.target = "_blank"; a.rel = "noopener noreferrer nofollow"; });
    return d.body.firstChild.innerHTML;
  }
  function bubble(role, text) {
    const el = document.createElement("div");
    el.className = "msg " + role;
    el.innerHTML = `<span class="who mono">${role === "user" ? "You" : "Carbon"}</span><div class="txt"></div>`;
    el.querySelector(".txt").innerHTML = role === "user" ? "<p>" + esc(text).replace(/\n/g, "<br>") + "</p>" : md(text);
    log.appendChild(el); log.scrollTop = log.scrollHeight;
    return el.querySelector(".txt");
  }
  function render() { log.innerHTML = ""; if (!msgs.length) intro(); msgs.forEach(m => bubble(m.role, m.content)); }
  function intro() {
    const el = document.createElement("div"); el.className = "intro";
    el.innerHTML = `<b>Ask Carbon anything.</b><span class="muted">An open, uncensored 1.5B model on 1EYE's engine. Your chat stays in this browser.</span>
      <div class="sugs">${["Explain how AirDrop works, simply", "Write a Python script that renames photos by date", "Roast my startup idea: an app that rates kebabs", "What should I learn first to build an OS?"].map(s => `<button type="button" class="chip">${esc(s)}</button>`).join("")}</div>`;
    el.querySelectorAll(".chip").forEach(b => b.onclick = () => { box.value = b.textContent; form.requestSubmit(); });
    log.appendChild(el);
  }
  const setBusy = b => { busy = b; send.textContent = b ? "Stop" : "Send"; send.classList.toggle("stop", b); };

  async function ask(text) {
    msgs.push({ role: "user", content: text }); save();
    if (log.querySelector(".intro")) log.innerHTML = "";
    bubble("user", text);
    const out = bubble("assistant", ""); out.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
    if (window.EYE && EYE.excite) EYE.excite();
    setBusy(true); stat.textContent = "Thinking…";
    let acc = "", tps = 0;
    ctl = new AbortController();
    try {
      const r = await fetch(API + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: msgs }), signal: ctl.signal });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || (r.status === 503 ? "Carbon is waking up. Try again in a minute." : "Carbon didn't answer (" + r.status + ").")); }
      const rd = r.body.getReader(), dec = new TextDecoder(); let buf = "";
      for (;;) {
        const { value, done } = await rd.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        let i; while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i); buf = buf.slice(i + 1); if (!line) continue;
          const d = JSON.parse(line);
          if (d.error) throw new Error(d.error);
          if (d.t) { acc += d.t; out.innerHTML = md(acc); log.scrollTop = log.scrollHeight; stat.textContent = "Writing…"; }
          if (d.done) tps = d.tps;
        }
      }
      stat.textContent = tps ? `${tps} tokens/s · Qwen2.5 1.5B` : "";
    } catch (e) {
      if (e.name === "AbortError") stat.textContent = "Stopped.";
      else { stat.textContent = ""; if (!acc) out.innerHTML = `<p class="err">${esc(e.message || "Couldn't reach Carbon.")}</p>`; }
    }
    if (acc) msgs.push({ role: "assistant", content: acc }); else msgs.pop();
    save(); setBusy(false); ctl = null; box.focus();
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (busy) { ctl && ctl.abort(); return; }
    const t = box.value.trim(); if (!t) return;
    box.value = ""; box.style.height = ""; ask(t);
  });
  box.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  box.addEventListener("input", () => { box.style.height = "auto"; box.style.height = Math.min(box.scrollHeight, 200) + "px"; });
  $("#cnew").onclick = () => { if (busy) return; msgs = []; save(); render(); box.focus(); };
  render();
  // wake the engine early (free Spaces sleep after a while without visitors)
  fetch(API + "/api/health").then(r => r.json()).then(d => { stat.textContent = d.ok ? "Online" : "Waking up…"; }).catch(() => { stat.textContent = "Waking up…"; });
})();
