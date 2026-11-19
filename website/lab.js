/* 1EYE lab — page behaviour shared by every page. Defensive: every block checks its elements exist. */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ---- loader: count to 100 once per session ----
  const ld = $(".loader");
  if (ld) {
    const n = ld.querySelector(".count"), bar = ld.querySelector(".bar i");
    let seen = false; try { seen = sessionStorage.getItem("1eye-seen") === "1"; sessionStorage.setItem("1eye-seen", "1"); } catch (e) {}
    if (seen || still) ld.classList.add("done");
    else {
      const t0 = performance.now(), dur = 1300;
      const step = now => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3), v = Math.round(e * 100);
        n.textContent = String(v).padStart(3, "0"); bar.style.width = v + "%";
        if (k < 1) requestAnimationFrame(step); else setTimeout(() => ld.classList.add("done"), 180);
      };
      requestAnimationFrame(step);
    }
  }

  // ---- mobile menu ----
  const sheet = $(".sheet");
  $$("[data-menu]").forEach(b => b.addEventListener("click", () => { sheet.classList.toggle("open"); document.body.style.overflow = sheet.classList.contains("open") ? "hidden" : ""; }));
  $$(".sheet a").forEach(a => a.addEventListener("click", () => { sheet.classList.remove("open"); document.body.style.overflow = ""; }));

  // ---- scramble text on hover (labels, nav) ----
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/[]_-";
  const scramble = el => {
    if (el._s) return; const orig = el.dataset.t || (el.dataset.t = el.textContent); let f = 0; el._s = 1;
    const tick = () => {
      el.textContent = orig.split("").map((c, i) => c === " " || i < f / 2 ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]).join("");
      if (++f / 2 < orig.length) requestAnimationFrame(tick); else { el.textContent = orig; el._s = 0; }
    };
    tick();
  };
  if (fine && !still) $$(".nav a, [data-scramble]").forEach(el => el.addEventListener("mouseenter", () => scramble(el)));

  // ---- reveal on scroll ----
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  $$("[data-r]").forEach(el => io.observe(el));

  // ---- grid crosses brighten near the cursor (desktop only, drawn only while the mouse moves) ----
  const gfx = $("#gridfx");
  if (gfx && fine && !still) {
    const g = gfx.getContext("2d"); let mx = -999, my = -999, dirty = false, dpr = 1, fade = 0;
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); gfx.width = innerWidth * dpr; gfx.height = innerHeight * dpr; };
    size(); addEventListener("resize", size);
    addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; fade = 1; if (!dirty) { dirty = true; requestAnimationFrame(draw); } }, { passive: true });
    function draw() {
      dirty = false; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, innerWidth, innerHeight);
      const S = 66, ox = (innerWidth / 2) % S, R = 190;
      g.strokeStyle = "#f1f0eb"; g.lineWidth = 1;
      for (let x = ox - S + 33; x < innerWidth + S; x += S) for (let y = 33; y < innerHeight + S; y += S) {
        const d = Math.hypot(x - mx, y - my); if (d > R) continue;
        const k = (1 - d / R) * fade; g.globalAlpha = k * .75; const L = 4 + k * 5;
        g.beginPath(); g.moveTo(x - L, y); g.lineTo(x + L, y); g.moveTo(x, y - L); g.lineTo(x, y + L); g.stroke();
        if (k > .45) { g.globalAlpha = (k - .45) * .9; g.strokeRect(x - 13, y - 13, 26, 26); }
      }
      fade *= .97; if (fade > .02) { dirty = true; requestAnimationFrame(draw); }
    }
  }

  // ---- the eye ----
  const eyeC = $("#eye");
  if (eyeC && window.Iris) {
    const E = Iris.make(eyeC, { follow: true, zoom: +(eyeC.dataset.zoom || .8) });
    window.EYE = E;
    const ro = $("#ro-pupil"), rg = $("#ro-gaze");
    if (E && (ro || rg)) {
      let px = 0, py = 0;
      addEventListener("pointermove", e => { px = (e.clientX / innerWidth * 2 - 1); py = -(e.clientY / innerHeight * 2 - 1); }, { passive: true });
      setInterval(() => {
        if (ro) ro.textContent = "Pupil " + (2.6 + Math.random() * .3 + Math.max(0, .3 - Math.abs(px) * .2)).toFixed(1) + " mm";
        if (rg) rg.textContent = "Gaze " + (px >= 0 ? "+" : "") + px.toFixed(2) + " / " + (py >= 0 ? "+" : "") + py.toFixed(2);
      }, 260);
    }
    eyeC.addEventListener("click", () => E && E.excite(1));
  }

  // ---- project row previews follow the cursor ----
  const pv = $(".preview");
  if (pv && fine) {
    let x = 0, y = 0, cx = 0, cy = 0, on = false;
    addEventListener("pointermove", e => { x = e.clientX; y = e.clientY; }, { passive: true });
    $$("[data-preview]").forEach(r => {
      r.addEventListener("mouseenter", () => { pv.style.backgroundImage = `url(${r.dataset.preview})`; pv.classList.add("on"); on = true; });
      r.addEventListener("mouseleave", () => { pv.classList.remove("on"); on = false; });
    });
    const loop = () => { cx += (x - cx) * .14; cy += (y - cy) * .14; pv.style.left = cx + "px"; pv.style.top = cy + "px"; requestAnimationFrame(loop); };
    loop();
  }

  // ---- downloads: recommend this device, copy commands, feedback ----
  const UA = navigator.userAgent;
  const pick = /Android/i.test(UA) ? "apk" : /iPhone|iPad/i.test(UA) ? null : /Macintosh|Mac OS X/i.test(UA) ? "mac" : /Linux|X11/i.test(UA) ? "linux" : "win";
  $$(".dl[data-os]").forEach(d => d.classList.toggle("primary", d.dataset.os === pick));
  $$("a.dl[download]").forEach(a => a.addEventListener("click", () => {
    const b = a.querySelector("b"); if (!b) return; const t = b.textContent;
    a.classList.add("got"); b.textContent = "Received ✓"; if (window.EYE) EYE.excite(1);
    setTimeout(() => { a.classList.remove("got"); b.textContent = t; }, 2600);
  }));
  $$("[data-copy]").forEach(c => c.addEventListener("click", () => {
    if (!navigator.clipboard) return; const t = c.textContent;
    navigator.clipboard.writeText(t).then(() => { c.textContent = "Copied. Paste it into Terminal."; setTimeout(() => c.textContent = t, 1800); });
  }));

  // ---- small things ----
  $$("[data-year]").forEach(e => e.textContent = new Date().getFullYear());
  const oe = $("#openeye");
  if (oe) { const host = location.hostname.replace(/^www\./, ""); if (/^[\d.]+$|localhost|pages\.dev$/.test(host)) oe.closest("[data-hide-local]")?.remove(); else oe.href = "https://eye." + host; }
  const SITE = "https://1eye.dpdns.org", MSG = "1EYE: AirDrop for Windows, Android, Mac and Linux. Free and open source:", enc = encodeURIComponent;
  const set = (id, url) => { const a = document.getElementById(id); if (a) a.href = url; };
  set("sh-wa", "https://wa.me/?text=" + enc(MSG + " " + SITE)); set("sh-x", "https://x.com/intent/post?text=" + enc(MSG) + "&url=" + enc(SITE));
  set("sh-rd", "https://www.reddit.com/submit?url=" + enc(SITE) + "&title=" + enc("1EYE: AirDrop for Windows and Android, open source"));
  // paste a Lemon Squeezy / Gumroad link here to switch on the support block
  const SUPPORT_URL = ""; const sp = $("#support"); if (sp && SUPPORT_URL) { sp.hidden = false; set("supportbtn", SUPPORT_URL); }
})();
