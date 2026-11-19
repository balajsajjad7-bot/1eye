/* 1EYE — a real-time macro human eye. One WebGL fragment shader, no libraries, no images.
   Iris fibres, collarette, crypts, limbal ring, pupillary ruff, sclera with veins and a wet cornea.
   It looks at your cursor, the pupil breathes and reacts, and it stops drawing when off-screen. */
window.Iris = (() => {
  const VS = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
  const FS = `precision highp float;
uniform vec2 R;uniform float T;uniform vec2 G;uniform float P;uniform float B;uniform float Z;
float h3(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+1.),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n3(p);p=p*2.02+vec3(3.1,1.7,5.3);a*=.5;}return v;}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*R)/min(R.x,R.y)*2.;      /* -1..1 across the short side */
  uv/=Z;                                                /* zoom: iris radius = 1 at Z */
  float t=T;
  /* cornea: the iris sits behind a curved lens, so it shifts more than the reflections */
  vec2 q=uv-G*.16;
  float r=length(q),a=atan(q.y,q.x);
  vec3 ca=vec3(cos(a),sin(a),0.);
  float pr=P;                                           /* pupil radius */
  /* iris stretches as the pupil changes size: map radius into a pupil-independent space */
  float s=clamp((r-pr)/(1.-pr),0.,1.);
  /* fibres: long in the radial direction, thin around */
  float fib=fbm(vec3(ca.xy*26.,s*2.2))*.65+fbm(vec3(ca.xy*60.,s*5.+1.))*.35;
  float strands=pow(abs(sin(a*70.+fbm(vec3(ca.xy*8.,s*3.))*14.)),8.)*.22;
  /* collarette: wavy ring that splits the pupillary and ciliary zones */
  float cr=.30+.07*fbm(vec3(ca.xy*5.,1.3))+.035*(fbm(vec3(ca.xy*16.,2.7))-.5);
  float inner=1.-smoothstep(cr-.06,cr+.07+.08*fbm(vec3(ca.xy*20.,5.)),s);
  float coll=exp(-pow((s-cr)/.025,2.));
  /* crypts: dark lacunae just outside the collarette */
  float cry=smoothstep(.62,.78,fbm(vec3(ca.xy*7.,s*6.+7.)))*smoothstep(cr,cr+.08,s)*(1.-smoothstep(.7,.9,s));
  /* furrows: concentric contraction folds near the rim */
  float fur=smoothstep(.55,1.,s)*pow(abs(sin(s*42.+fbm(vec3(ca.xy*4.,2.))*6.)),14.)*.5;
  /* colour: amber-gold heart, green-teal outer iris, grey-blue rim */
  vec3 amber=vec3(.34,.2,.09),gold=vec3(.6,.44,.24),teal=vec3(.20,.31,.29),jade=vec3(.52,.62,.52),rim=vec3(.08,.11,.13);
  vec3 hz=mix(mix(teal,jade,fib),mix(amber,gold,fib),inner);
  hz=mix(hz,mix(gold,jade,.6),smoothstep(.55,.8,fbm(vec3(ca.xy*6.,s*3.+11.)))*.35*(1.-inner));
  vec3 c=hz;
  c=mix(c,rim,smoothstep(.72,1.,s)*.75);
  float mott=fbm(vec3(ca.xy*13.,s*1.7+3.));
  c*=(.38+.9*fib+strands*.7)*(.75+.5*mott);
  c*=.85+.3*smoothstep(.0,.25,s);
  c*=.7+.6*smoothstep(-.7,.9,dot(q,normalize(vec2(.55,-.6))));   /* light through the cornea lands opposite the reflection */
  c+=gold*coll*.22;
  c*=1.-cry*.55;
  c*=1.-fur;
  /* limbal ring: dark edge where iris meets sclera */
  float lim=smoothstep(.86,1.,r);
  c*=1.-lim*.85;
  /* pupil + pupillary ruff */
  float pe=pr*(1.+.035*fbm(vec3(ca.xy*9.,t*.1)));
  float pup=1.-smoothstep(pe-.012,pe+.006,r);
  float ruff=exp(-pow((r-pe-.02)/.018,2.));
  c=mix(c,vec3(.17,.08,.03),ruff*.8);
  c=mix(c,vec3(.006,.005,.008),pup);
  /* sclera with veins, darkening into shadow at the edges */
  vec2 su=uv-G*.04;float sr=length(su);
  float ve=1.-smoothstep(0.,.035,abs(fbm(vec3(su*3.2,4.))-.5));
  float ve2=1.-smoothstep(0.,.02,abs(fbm(vec3(su*6.5,9.))-.5));
  float ve0=1.-smoothstep(0.,.018,abs(fbm(vec3(su*3.2,4.))-.5));float ve1=1.-smoothstep(0.,.012,abs(fbm(vec3(su*6.5,9.))-.5));
  vec3 scl=vec3(.66,.61,.6)*(.9+.1*fbm(vec3(su*5.,2.)));
  scl=mix(scl,vec3(.62,.2,.18),(ve0*.4+ve1*.22)*smoothstep(1.05,1.8,sr));
  scl*=1.-.6*smoothstep(1.,1.7,sr);
  scl*=1.-smoothstep(1.2,2.,sr);                      /* falls off into black, like a macro shot */
  float out_=smoothstep(.985,1.01,r);
  vec3 col=mix(c,scl,out_);
  /* upper lid shadow and cornea shading */
  float lid=.86-.12*uv.x*uv.x+.03*sin(uv.x*3.);                      /* upper eyelid line */
  col*=1.-.55*smoothstep(lid-.5,lid,uv.y);
  col*=1.-smoothstep(lid-.02,lid+.06,uv.y)*.92;
  col*=1.-.25*smoothstep(-.4,-1.3,uv.y);
  col*=.8+.3*smoothstep(1.4,0.,length(uv+vec2(.25,-.2)));
  /* wet cornea reflections: a window and a soft ring of sky */
  vec2 w=uv-vec2(-.36,.38)+G*.04;w.x+=w.y*w.y*.6;
  float win=smoothstep(.045,0.,max(abs(w.x)-.1,abs(w.y)-.065)-.03);
  win*=.6+.4*smoothstep(.004,.012,abs(w.x))*smoothstep(.004,.012,abs(w.y));
  win*=.42;   /* window frame cross */
  float dot_=exp(-dot(uv-vec2(.3,-.28),uv-vec2(.3,-.28))*900.);
  float arc=exp(-pow((length(uv-vec2(0.,.1))-.86)/.03,2.))*smoothstep(-.2,.6,-uv.y)*.18;
  float cornea=1.-smoothstep(1.,1.05,r);
  col+=vec3(.95,.97,1.)*(win*.85+dot_*.9)*cornea+vec3(.6,.75,.85)*arc*cornea;
  col+=vec3(1.)*B*.06*cornea;                            /* blink/flash */
  /* film grain + vignette */
  col+=(h3(vec3(gl_FragCoord.xy,t*60.))-.5)*.035;
  col*=1.-smoothstep(.6,1.6,length((gl_FragCoord.xy-.5*R)/R*vec2(R.x/R.y,1.))*.9);
  vec2 fn=(gl_FragCoord.xy-.5*R)/(.5*min(R.x,R.y));
  col=mix(vec3(.0196),col,1.-smoothstep(.8,.995,length(fn)));   /* melt into the page colour before the canvas edge */
  gl_FragColor=vec4(pow(max(col,0.),vec3(.95)),1.);
}`;

  function make(canvas, opts = {}) {
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "high-performance", preserveDrawingBuffer: !!opts.snapshot });
    if (!gl) { canvas.classList.add("noeye"); return null; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; };
    const pg = gl.createProgram();
    try { gl.attachShader(pg, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pg); }
    catch (e) { console.warn(e); canvas.classList.add("noeye"); return null; }
    gl.useProgram(pg);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const al = gl.getAttribLocation(pg, "a"); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
    const U = {}; for (const k of ["R", "T", "G", "P", "B", "Z"]) U[k] = gl.getUniformLocation(pg, k);

    let scale = opts.scale || (matchMedia("(max-width: 760px)").matches ? 0.6 : 0.75);
    let gx = 0, gy = 0, tx = 0, ty = 0, pupil = 0.3, pT = 0.3, blink = 0, zoom = opts.zoom || 0.8;
    let visible = true, raf = 0, last = performance.now(), slow = 0, saccade = 0, excite = 0;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function size() {
      const d = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect();
      canvas.width = Math.max(64, Math.round(r.width * d * scale)); canvas.height = Math.max(64, Math.round(r.height * d * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function draw(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (dt > 0.034 && ++slow > 40 && scale > 0.45) { scale -= 0.15; slow = 0; size(); } else if (dt < 0.03) slow = Math.max(0, slow - 1);
      // micro-saccades when idle; the pupil breathes (hippus) and reacts to excitement
      if ((saccade -= dt) < 0) { saccade = 1.5 + Math.random() * 3; if (!opts.follow || Math.random() < .35) { tx += (Math.random() - .5) * .12; ty += (Math.random() - .5) * .08; } }
      gx += (tx - gx) * Math.min(1, dt * 9); gy += (ty - gy) * Math.min(1, dt * 9);
      excite = Math.max(0, excite - dt * .6);
      const target = pT + Math.sin(now / 1000 * .9) * .012 - excite * .1;
      pupil += (target - pupil) * Math.min(1, dt * 3);
      blink = Math.max(0, blink - dt * 3);
      gl.uniform2f(U.R, canvas.width, canvas.height); gl.uniform1f(U.T, now / 1000);
      gl.uniform2f(U.G, gx, gy); gl.uniform1f(U.P, Math.max(.14, Math.min(.46, pupil))); gl.uniform1f(U.B, blink); gl.uniform1f(U.Z, zoom);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function loop(now) { raf = requestAnimationFrame(loop); draw(now); }
    function start() { if (!raf && visible && !document.hidden && !still) { last = performance.now(); raf = requestAnimationFrame(loop); } }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    size(); draw(performance.now());
    if (window.ResizeObserver) new ResizeObserver(() => { size(); draw(performance.now()); }).observe(canvas);
    else addEventListener("resize", () => { size(); draw(performance.now()); });
    if (opts.follow) addEventListener("pointermove", e => {
      const r = canvas.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / Math.max(innerWidth, 1), dy = (e.clientY - cy) / Math.max(innerHeight, 1);
      tx = Math.max(-.7, Math.min(.7, dx * 2)); ty = Math.max(-.6, Math.min(.6, -dy * 2));
      const d = Math.hypot(e.clientX - cx, e.clientY - cy) / Math.max(r.width, 1);
      pT = .22 + Math.min(.16, d * .1);                 // closer cursor = brighter light = smaller pupil
    }, { passive: true });
    new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? start() : stop(); }).observe(canvas);
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
    start();
    return {
      excite(k = 1) { excite = Math.min(1.5, excite + k); blink = 1; },
      dilate(v) { pT = v; },
      zoom(v) { zoom = v; },
      snapshot() { draw(performance.now()); return canvas.toDataURL("image/png"); },
    };
  }
  return { make };
})();
