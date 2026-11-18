/* 1EYE — logo + interactive 3D particle engine (no libraries) */
const LOGO = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none">
<defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2d9ff"/><stop offset=".5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#67e8f9"/></linearGradient>
<radialGradient id="ir" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#c4b5fd"/><stop offset="1" stop-color="#7c5cff"/></radialGradient></defs>
<g stroke="url(#lg)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
<path d="M50 5 L72.6 46 H27.4 Z"/>
<path d="M24.6 52 H75.4 L95 88 H5 Z"/>
<path d="M14.5 70 H85.5 M30 52 V70 M50 70 V88 M70 52 V70" stroke-width="1.2" opacity=".45"/>
<path d="M36.5 33 Q50 21.5 63.5 33 Q50 44.5 36.5 33 Z" stroke-width="2.2"/>
</g>
<circle cx="50" cy="33" r="5.4" fill="url(#ir)"/><circle cx="50" cy="33" r="2.3" fill="#07060c"/><circle cx="51.8" cy="31.3" r="1" fill="#fff"/>
</svg>`;

const Eye = (() => {
  let cv, ctx, W = 0, H = 0, dpr = 1, raf = 0, t0 = performance.now();
  const P = [], STARS = [], DUST = [], FLOW = [], SAMPLE = [];
  let drop = 0, fx = null, fxc = null, eyeXY = [0, 0];
  const V = [167, 139, 250], C = [103, 232, 249], WH = [236, 233, 255];
  let rotY = 0, rotX = -0.12, velY = 0.0022, tRX = -0.12, mx = 0, my = 0, smx = 0, smy = 0;
  let drag = null, pulse = 0, flowing = 0, blink = 1, nextBlink = 3000;
  let cx = 0.5, cy = 0.45, sc = 1, inten = 1; // live
  let tcx = 0.5, tcy = 0.45, tsc = 1, tin = 1; // targets
  let anchorEl = null, anchorInt = 1;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

  function build() {
    const apex = [0, 1.25, 0], B = [[-1.15, -1, -1.15], [1.15, -1, -1.15], [1.15, -1, 1.15], [-1.15, -1, 1.15]];
    const CUT0 = 0.12, CUT1 = 0.3; // gap between capstone and body
    const at = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
    const add = (p, kind, bright) => P.push({ o: p, kind, b: bright, j: Math.random() * 6.28, r: rnd(0.6, 1) });
    // lateral edges
    for (const c of B) for (let i = 0; i <= 90; i++) {
      const k = i / 90, p = at(apex, c, k);
      if (p[1] > CUT0 && p[1] < CUT1) continue;
      add(p, p[1] >= CUT1 ? "cap" : "body", 1);
    }
    // base edges
    for (let e = 0; e < 4; e++) for (let i = 0; i <= 70; i++) add(at(B[e], B[(e + 1) % 4], i / 70), "body", 0.9);
    // cut rings (top of body / bottom of cap)
    for (const y of [CUT0, CUT1]) {
      const k = (1.25 - y) / 2.25;
      const Q = B.map(c => at(apex, c, k));
      for (let e = 0; e < 4; e++) for (let i = 0; i < 40; i++) add(at(Q[e], Q[(e + 1) % 4], i / 40), y === CUT1 ? "cap" : "body", 0.85);
    }
    // brick courses on faces
    for (const y of [-0.62, -0.25]) {
      const k = (1.25 - y) / 2.25, Q = B.map(c => at(apex, c, k));
      for (let e = 0; e < 4; e++) for (let i = 0; i < 34; i++) add(at(Q[e], Q[(e + 1) % 4], i / 34), "body", 0.35);
    }
    // face dust
    for (let n = 0; n < 900; n++) {
      const f = n % 4, a = B[f], b = B[(f + 1) % 4];
      let u = Math.random(), v = Math.random(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
      const p = [apex[0] + u * (a[0] - apex[0]) + v * (b[0] - apex[0]), apex[1] + u * (a[1] - apex[1]) + v * (b[1] - apex[1]), apex[2] + u * (a[2] - apex[2]) + v * (b[2] - apex[2])];
      if (p[1] > CUT0 && p[1] < CUT1) continue;
      add(p, p[1] >= CUT1 ? "cap" : "body", 0.18);
    }
    for (let i = 0; i < 520; i++) {
      const th = Math.random() * 6.28, ph = Math.acos(rnd(-1, 1)), r = rnd(6, 14);
      STARS.push({ o: [r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], b: rnd(0.15, 0.7), tw: Math.random() * 6.28 });
    }
    // orbit rings: a few tilted bands of particles spinning around the pyramid
    const RINGS = [[2.15, 0.18, 0.0, 520], [2.75, -0.32, 1.2, 420], [3.4, 0.5, 2.3, 360], [1.75, -0.08, 0.6, 260]];
    for (const [R, tilt, rot, n] of RINGS) for (let i = 0; i < n; i++)
      DUST.push({ a: Math.random() * 6.28, r: R + rnd(-0.22, 0.22), y: rnd(-0.08, 0.08), tilt, rot, s: rnd(0.12, 0.4) * (R < 2.5 ? 1.25 : 0.8), b: rnd(0.2, 0.95) });
    // wide swirl that fills the page
    for (let i = 0; i < 700; i++) DUST.push({ a: Math.random() * 6.28, r: rnd(3.6, 9), y: rnd(-2.6, 2.6), tilt: 0, rot: 0, s: rnd(0.03, 0.12), b: rnd(0.08, 0.45), far: 1 });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  }

  function proj(x, y, z, S, ox, oy) {
    // rotate Y then X
    const cy_ = Math.cos(rotY), sy = Math.sin(rotY), cx_ = Math.cos(rotX), sx = Math.sin(rotX);
    let X = x * cy_ + z * sy, Z = -x * sy + z * cy_;
    let Y = y * cx_ - Z * sx; Z = y * sx + Z * cx_;
    const d = 5.2, f = d / (d - Z);
    return [ox + X * S * f, oy - Y * S * f, f, Z];
  }

  function updateAnchor() {
    if (anchorEl && document.body.contains(anchorEl)) {
      const r = anchorEl.getBoundingClientRect(), R = cv.getBoundingClientRect();
      const base = 0.21 * Math.min(W, H);
      tsc = Math.max(0.3, Math.min(1.5, r.height * 0.92 / (2.75 * base)));
      tcx = (r.left + r.width / 2 - R.left) / W;
      tcy = (r.top + r.height / 2 - R.top + 0.32 * base * tsc) / H;
      tin = anchorInt;
      if (r.bottom < 0 || r.top > H) tin = 0.35;
    }
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(50, now - t0); t0 = now;
    const t = now / 1000;
    updateAnchor();
    cx = lerp(cx, tcx, 0.06); cy = lerp(cy, tcy, 0.06); sc = lerp(sc, tsc, 0.06); inten = lerp(inten, tin, 0.05);
    smx = lerp(smx, mx, 0.06); smy = lerp(smy, my, 0.06);
    if (!drag) { rotY += velY * dt * 0.06 + (smx * 0.0009); velY = lerp(velY, 0.0022, 0.02); }
    rotX = lerp(rotX, tRX + smy * 0.18, 0.05);
    pulse *= 0.94; flowing = Math.max(0, flowing - dt / 1000);
    nextBlink -= dt; if (nextBlink < 0) { blink = 0; nextBlink = rnd(3500, 8000); }
    blink = lerp(blink, 1, 0.12);

    const w = cv.width, h = cv.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    const S = Math.min(w, h) * 0.21 * sc, ox = cx * w, oy = cy * h;
    const I = inten;

    // stars (slow parallax)
    for (const s of STARS) {
      const [X, Y, f, Z] = proj(s.o[0], s.o[1], s.o[2], S * 0.5, ox + smx * 30 * dpr, oy + smy * 20 * dpr);
      if (f <= 0 || Z > 4.5) continue;
      const a = s.b * (0.55 + 0.45 * Math.sin(t * 1.3 + s.tw)) * (0.6 + 0.4 * I);
      ctx.fillStyle = `rgba(200,195,255,${a * 0.6})`;
      const z = dpr * 1.1;
      ctx.fillRect(X, Y, z, z);
    }

    // aura behind capstone
    const capLift = 0.18 + Math.sin(t * 1.1) * 0.05 + pulse * 0.25;
    const ec = proj(0, 0.72 + capLift, 0, S, ox, oy);
    let g = ctx.createRadialGradient(ec[0], ec[1], 0, ec[0], ec[1], S * 1.6);
    g.addColorStop(0, `rgba(139,92,246,${0.32 * I + pulse * 0.3})`); g.addColorStop(0.4, `rgba(103,232,249,${0.06 * I})`); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

    // pyramid particles
    SAMPLE.length = 0;
    for (const p of P) {
      let [x, y, z] = p.o;
      if (p.kind === "cap") y += capLift;
      if (pulse > 0.01) { const k = pulse * 0.35 * p.r; x += x * k + Math.sin(p.j + t * 4) * k * 0.4; z += z * k; y += Math.cos(p.j) * k * 0.3; }
      const shimmer = 0.75 + 0.25 * Math.sin(t * 2.2 + p.j);
      const [X, Y, f] = proj(x, y, z, S, ox, oy);
      const depth = Math.max(0.25, Math.min(1.4, (f - 0.75) * 1.6));
      const col = mix(V, C, Math.max(0, Math.min(1, (y + 1) / 2.6)));
      const a = p.b * shimmer * depth * (0.45 + 0.55 * I);
      ctx.fillStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${a})`;
      const z2 = (p.b > 0.5 ? 1.7 : 1.2) * dpr * f;
      ctx.fillRect(X - z2 / 2, Y - z2 / 2, z2, z2);
      if (p.b > 0.5 && (p.j * 100 | 0) % 3 === 0) SAMPLE.push([X / dpr, Y / dpr]);
    }

    // orbit dust
    for (const d of DUST) {
      d.a += d.s * dt / 1000 * (1 + flowing * 2 + drop * 3);
      let x = Math.cos(d.a) * d.r, y = d.y - 0.25 + Math.sin(d.a * 3) * 0.05, z = Math.sin(d.a) * d.r;
      if (d.tilt) { const c = Math.cos(d.tilt), s_ = Math.sin(d.tilt), cr = Math.cos(d.rot), sr = Math.sin(d.rot); const y2 = y * c - z * s_, z2 = y * s_ + z * c; y = y2; z = z2; const x2 = x * cr - z * sr; z = x * sr + z * cr; x = x2; }
      const [X, Y, f] = proj(x, y, z, S, ox, oy);
      if (f <= 0) continue;
      const col = mix(V, C, (Math.sin(d.a) + 1) / 2);
      ctx.fillStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${Math.min(1, d.b * (d.far ? 0.75 : 1.25) * (0.45 + 0.55 * I) * Math.max(0.3, f - 0.35))})`;
      const zz = (d.far ? 1.3 : 1.8) * dpr * f; ctx.fillRect(X, Y, zz, zz);
    }

    // telepathic flow: particles rising into the eye
    if (flowing > 0 && FLOW.length < 260) for (let i = 0; i < 6; i++) FLOW.push({ x: rnd(-3, 3), y: -2.4, z: rnd(-1.5, 1.5), k: 0, s: rnd(0.5, 1.1) });
    for (let i = FLOW.length - 1; i >= 0; i--) {
      const q = FLOW[i]; q.k += q.s * dt / 1000 * 0.8;
      const e = q.k * q.k * (3 - 2 * q.k);
      const x = lerp(q.x, 0, e), y = lerp(q.y, 0.72 + capLift, e), z = lerp(q.z, 0.3, e);
      const [X, Y, f] = proj(x, y, z, S, ox, oy);
      ctx.fillStyle = `rgba(190,240,255,${(1 - q.k) * 0.9})`;
      const zz = 1.8 * dpr * f; ctx.fillRect(X, Y, zz, zz);
      if (q.k >= 1) FLOW.splice(i, 1);
    }

    // the eye (billboard, watches the cursor)
    const ER = S * 0.34 * ec[2], EX = ec[0], EY = ec[1];
    eyeXY = [EX / dpr, EY / dpr];
    drop = Math.max(0, drop - dt / 1000);
    const open = Math.max(0.04, blink);
    const lookX = smx * ER * 0.32, lookY = smy * ER * 0.18;
    ctx.globalCompositeOperation = "lighter";
    g = ctx.createRadialGradient(EX, EY, 0, EX, EY, ER * 1.8);
    g.addColorStop(0, `rgba(230,220,255,${0.22 * I + pulse * 0.4})`); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(EX, EY, ER * 1.8, 0, 6.29); ctx.fill();
    // almond outline in particles
    for (let i = 0; i < 140; i++) {
      const u = i / 140 * 2 - 1, top = i % 2 ? 1 : -1;
      const ex = EX + u * ER, ey = EY + top * (1 - u * u) * ER * 0.55 * open;
      ctx.fillStyle = `rgba(236,233,255,${(0.55 + 0.35 * Math.sin(t * 3 + i)) * (0.5 + 0.5 * I)})`;
      const z = 1.6 * dpr; ctx.fillRect(ex - z / 2, ey - z / 2, z, z);
    }
    // iris
    ctx.save(); ctx.beginPath();
    ctx.moveTo(EX - ER, EY); ctx.quadraticCurveTo(EX, EY - ER * 1.1 * open, EX + ER, EY); ctx.quadraticCurveTo(EX, EY + ER * 1.1 * open, EX - ER, EY); ctx.clip();
    const IX = EX + lookX, IY = EY + lookY, IR = ER * 0.42;
    for (let i = 0; i < 120; i++) {
      const a = i / 120 * 6.283 + t * 0.4, rr = IR * (0.55 + 0.45 * ((i * 7) % 10) / 10);
      const col = mix(V, C, (Math.sin(a * 2 + t) + 1) / 2);
      ctx.fillStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${0.85 * (0.3 + 0.7 * I)})`;
      ctx.fillRect(IX + Math.cos(a) * rr, IY + Math.sin(a) * rr, 1.4 * dpr, 1.4 * dpr);
    }
    g = ctx.createRadialGradient(IX, IY, 0, IX, IY, IR);
    g.addColorStop(0, "rgba(255,255,255,0.0)"); g.addColorStop(0.5, `rgba(167,139,250,${0.35 + pulse * 0.4})`); g.addColorStop(1, "rgba(103,232,249,0.08)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(IX, IY, IR, 0, 6.29); ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(4,3,10,${0.95 * Math.min(1, I * 1.4)})`; ctx.beginPath(); ctx.arc(IX, IY, IR * (0.38 - pulse * 0.12), 0, 6.29); ctx.fill();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = `rgba(255,255,255,${0.9 * I})`; ctx.beginPath(); ctx.arc(IX + IR * 0.22, IY - IR * 0.22, IR * 0.1, 0, 6.29); ctx.fill();
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }

  function onMove(e) {
    const p = e.touches ? e.touches[0] : e;
    mx = (p.clientX / innerWidth) * 2 - 1; my = (p.clientY / innerHeight) * 2 - 1;
    if (drag) { const dx = p.clientX - drag.x; rotY += dx * 0.006; velY = dx * 0.0015; drag.x = p.clientX; }
  }

  // ---- AirDrop: the pyramid's particles stream into the button that was pressed
  let AD = [], RIPPLES = [], adRaf = 0, adT = 0;
  function fxSize() { const d = Math.min(devicePixelRatio || 1, 2); fx.width = innerWidth * d; fx.height = innerHeight * d; fxc.setTransform(d, 0, 0, d, 0, 0); }
  function airdrop(el, done) {
    if (!fx) {
      fx = document.createElement("canvas");
      fx.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50";
      document.body.append(fx); fxc = fx.getContext("2d"); fxSize(); addEventListener("resize", fxSize);
    }
    const r = el.getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2;
    const src = SAMPLE.length ? SAMPLE : [eyeXY];
    pulse = Math.min(1.4, pulse + 1.2); drop = 2.2; blink = 0;
    RIPPLES.push({ x: eyeXY[0], y: eyeXY[1], t: 0, d: 0 });
    const n = Math.min(900, Math.max(420, src.length));
    for (let i = 0; i < n; i++) {
      const [sx, sy] = src[(Math.random() * src.length) | 0];
      const mx_ = (sx + tx) / 2 + rnd(-260, 260), my_ = Math.min(sy, ty) - rnd(40, 260);
      AD.push({ sx: sx + rnd(-6, 6), sy: sy + rnd(-6, 6), mx: mx_, my: my_, tx: tx + rnd(-r.width * 0.32, r.width * 0.32), ty: ty + rnd(-r.height * 0.25, r.height * 0.25),
        k: -rnd(0, 0.55), s: rnd(0.75, 1.25), c: Math.random(), z: rnd(1, 2.4) });
    }
    adT = 0;
    let rip = false;
    const tick = now => {
      adRaf = requestAnimationFrame(tick);
      const dt = 1 / 60; adT += dt;
      fxc.clearRect(0, 0, innerWidth, innerHeight);
      fxc.globalCompositeOperation = "lighter";
      let alive = 0, arrived = 0;
      for (const q of AD) {
        q.k += dt * 0.9 * q.s;
        if (q.k < 0) { alive++; continue; }
        const k = Math.min(1, q.k), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        const x = (1 - e) * (1 - e) * q.sx + 2 * (1 - e) * e * q.mx + e * e * q.tx;
        const y = (1 - e) * (1 - e) * q.sy + 2 * (1 - e) * e * q.my + e * e * q.ty;
        const col = mix(V, C, q.c), a = k < 1 ? 0.9 : Math.max(0, 1 - (q.k - 1) * 4);
        fxc.fillStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${a})`;
        fxc.fillRect(x - q.z / 2, y - q.z / 2, q.z, q.z);
        if (k < 1) { // short trail
          const e2 = Math.max(0, e - 0.04), x2 = (1 - e2) * (1 - e2) * q.sx + 2 * (1 - e2) * e2 * q.mx + e2 * e2 * q.tx, y2 = (1 - e2) * (1 - e2) * q.sy + 2 * (1 - e2) * e2 * q.my + e2 * e2 * q.ty;
          fxc.strokeStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${a * 0.35})`; fxc.lineWidth = q.z * 0.6; fxc.beginPath(); fxc.moveTo(x2, y2); fxc.lineTo(x, y); fxc.stroke();
        } else arrived++;
        if (q.k < 1.25) alive++;
      }
      if (!rip && arrived > AD.length * 0.35) { rip = true; RIPPLES.push({ x: tx, y: ty, t: 0, d: 1 }); done && done(); }
      // AirDrop rings
      for (const R of RIPPLES) {
        R.t += dt;
        for (let i = 0; i < 3; i++) {
          const tt = R.t - i * 0.16; if (tt < 0) continue;
          const rad = 16 + tt * (R.d ? 260 : 340), a = Math.max(0, 0.55 - tt * 0.5);
          if (a <= 0) continue;
          const g = fxc.createRadialGradient(R.x, R.y, rad * 0.86, R.x, R.y, rad);
          g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.7, `rgba(103,232,249,${a * 0.35})`); g.addColorStop(1, `rgba(167,139,250,${a})`);
          fxc.strokeStyle = g; fxc.lineWidth = 2; fxc.beginPath(); fxc.arc(R.x, R.y, rad, 0, 6.29); fxc.stroke();
        }
      }
      RIPPLES = RIPPLES.filter(R => R.t < 1.6);
      if (!alive && !RIPPLES.length) { cancelAnimationFrame(adRaf); adRaf = 0; AD = []; fxc.clearRect(0, 0, innerWidth, innerHeight); }
      AD = AD.filter(q => q.k < 1.3);
    };
    if (!adRaf) adRaf = requestAnimationFrame(tick);
  }

  return {
    airdrop,
    init(canvas) {
      cv = canvas; ctx = cv.getContext("2d");
      build(); resize();
      addEventListener("resize", resize);
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("pointerdown", e => { if (e.target === cv || e.target.closest?.("[data-spin]")) drag = { x: e.clientX }; });
      addEventListener("pointerup", () => drag = null);
      document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(raf); else { t0 = performance.now(); raf = requestAnimationFrame(frame); } });
      raf = requestAnimationFrame(frame);
    },
    anchor(el, intensity = 1) { anchorEl = el; anchorInt = intensity; if (!el) { tcx = innerWidth > 860 ? 0.66 : 0.5; tcy = 0.66; tsc = innerWidth > 860 ? 1.6 : 1.1; } tin = intensity; },
    place(x, y, s, i = 1) { anchorEl = null; tcx = x; tcy = y; tsc = s; tin = i; },
    pulse(k = 1) { pulse = Math.min(1.4, pulse + k); },
    flow(sec = 1.5) { flowing = Math.max(flowing, sec); },
    blink() { blink = 0; },
  };
})();
