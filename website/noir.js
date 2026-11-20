/* 1EYE — "noir" eye. An original, real-time black-and-white close-up of a human eye.
   One WebGL fragment shader, no images, no footage: almond lids, wet lower rim, lashes,
   a glossy near-black iris with studio catchlights, film grain, flicker and scratches.
   It darts around like a nervous glance, blinks, and follows your cursor. */
window.Noir = (() => {
  const VS = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
  const FS = `precision highp float;
uniform vec2 R;uniform float T;uniform vec2 G;uniform float P;uniform float B;uniform float Z;uniform float F;
float h1(float n){return fract(sin(n)*43758.5453);}
float h3(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+1.),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n3(p);p=p*2.03+vec3(3.1,1.7,5.3);a*=.5;}return v;}
/* lid curves: x in -1..1 across the opening */
float upper(float x,float open){float k=clamp(1.-x*x,0.,1.);return mix(-.05,.50*pow(k,.62)+.04*x,open)+.02*x;}
float lower(float x){float k=clamp(1.-x*x,0.,1.);return -.30*pow(k,.78)-.03*x-.02;}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*R)/min(R.x,R.y)*2.;
  uv/=Z;
  float t=T;
  float W=1.02;                                   /* half width of the eye opening */
  float x=uv.x/W;
  float open=1.-B;
  float yu=upper(x,open), yl=lower(x);
  float inside=smoothstep(1.,.97,abs(x))*smoothstep(yl-.012,yl+.014,uv.y)*smoothstep(yu+.014,yu-.016,uv.y);
  /* ---------- eyeball ---------- */
  vec2 c=vec2(G.x*.56,G.y*.26-.03);               /* iris centre follows the gaze */
  vec2 q=uv-c;
  q.x*=1.+abs(G.x)*.22;                           /* foreshortening as it turns */
  float ri=.47, r=length(q);
  /* sclera: soft grey ball lit from above-left, darker toward the corners and under the upper lid */
  float ball=1.-smoothstep(.2,1.25,length(uv*vec2(.85,1.25)+vec2(.08,-.05)));
  float sc=.40+.36*ball;
  sc+=.06*(fbm(vec3(uv*6.,1.))-.5)+.03*(fbm(vec3(uv*28.,3.))-.5);
  float topShadow=smoothstep(.0,.24,yu-uv.y);     /* the upper lid casts a shadow on the ball */
  sc*=mix(.28,1.,topShadow);
  sc*=mix(.75,1.,smoothstep(0.,.08,uv.y-yl));
  sc*=1.-smoothstep(.5,1.,abs(x))*.7;
  /* faint veins */
  float vn=pow(1.-abs(fbm(vec3(uv*vec2(5.,9.),7.))*2.-1.),26.)*smoothstep(.45,.95,abs(x));
  sc-=vn*.08;
  vec3 col=vec3(sc);
  /* iris: almost black, with a dim radial grain and a slightly lighter limbal edge */
  float a=atan(q.y,q.x);
  float fib=fbm(vec3(cos(a)*18.,sin(a)*18.,r*9.));
  float ir=.018+.03*fib*smoothstep(.12,ri,r)+.022*exp(-pow((r-ri*.9)/.05,2.));
  float pu=smoothstep(P+.01,P-.01,r);             /* pupil, barely visible */
  ir=mix(ir,.012,pu);
  float iris=smoothstep(ri+.022,ri-.022,r);
  float ring=exp(-pow((r-ri)/.022,2.))*.08;       /* soft dark-grey halo where iris meets sclera */
  col=mix(col-ring,vec3(ir),iris);
  /* corneal bulge shading: iris a touch brighter at the bottom where it catches bounce light */
  col+=iris*.05*smoothstep(.0,-.45,q.y)*smoothstep(ri,.1,r);
  /* catchlights on the wet cornea (move with the iris) */
  vec2 l1=q-vec2(-.12,.135),l2=q-vec2(-.045,.125),l3=q-vec2(.165,.035);
  float cat=exp(-dot(l1,l1)*1500.)*1.2+exp(-dot(l2,l2)*2600.)*.9+exp(-dot(l3,l3)*1800.)*.8;
  cat+=exp(-dot(l1,l1)*120.)*.08;
  col+=cat*smoothstep(ri+.06,ri-.02,r);
  /* caruncle: the fleshy bump in the inner corner */
  vec2 cu=uv-vec2(W*.98,.02);
  float car=exp(-dot(cu*vec2(1.,1.4),cu*vec2(1.,1.4))*90.);
  col=mix(col,vec3(.36),car*.7);
  col*=inside;
  /* ---------- lids and skin ---------- */
  float skin=.035+.05*fbm(vec3(uv*3.,2.))+.025*(n3(vec3(uv*90.,1.))-.5);
  /* upper lid: a dark crease above, skin catching light on the fold */
  float above=uv.y-yu;
  float fold=exp(-pow((above-.16-.03*(1.-x*x))/.05,2.))*smoothstep(1.2,.3,abs(x));
  float upSkin=skin+.05*smoothstep(.04,.12,above)*smoothstep(.4,.12,above)*(1.-x*x)+.04*fold;
  upSkin*=smoothstep(1.35,.6,abs(x))*smoothstep(.9,.15,above);
  /* lower lid: a bright wet waterline, the lid margin, then skin falling into shadow */
  float below=yl-uv.y;
  float water=exp(-pow((below-.014)/.011,2.))*.55*(1.-smoothstep(.8,1.02,abs(x)));
  float margin=smoothstep(.01,.035,below)*smoothstep(.1,.045,below)*.36*(1.-x*x*.5)*smoothstep(1.08,.7,abs(x));
  float loSkin=skin+.07*exp(-pow((below-.15)/.07,2.))*(1.-x*x)+margin;
  loSkin*=smoothstep(1.35,.6,abs(x))*smoothstep(.75,.12,below);
  float skinMask=1.-inside;
  col+=skinMask*(uv.y>yu?upSkin:loSkin)+water*skinMask;
  /* upper lid edge: a heavy, soft dark line of lashes */
  float lidEdge=exp(-pow((above-.01)/.028,2.))*smoothstep(1.05,.6,abs(x));
  float strands=n3(vec3(x*140.,above*14.,3.));
  col=mix(col,vec3(.008),clamp(lidEdge*(.75+.35*strands),0.,1.));
  /* lower lashes: a few short bright spikes hanging off the rim */
  float lx2=x*26.+.3;float lj=floor(lx2);float lg=fract(lx2)-.5;
  float ll2=.035+.05*h1(lj*3.1);
  float bend=below-.08;
  float lashL=smoothstep(.09,.0,abs(lg-bend*3.*(.4+x)))*step(.08,below)*step(below,.08+ll2)*step(abs(x),.85)*step(.5,h1(lj*7.3));
  col+=lashL*.22*(1.-bend/ll2);
  /* ---------- film ---------- */
  col*=F;                                          /* exposure flicker */
  float gr=h3(vec3(gl_FragCoord.xy,floor(t*24.)));
  col+=(gr-.5)*.07;
  /* scratches: thin diagonal hairlines that come and go */
  float sf=floor(t*12.);
  for(int i=0;i<3;i++){
    float fi=float(i);
    float on=step(.55,h1(sf*1.3+fi*17.));
    float xp=h1(sf*.7+fi*5.)*2.-1.;
    float d=abs((uv.x-xp)-(uv.y)*(.25+.2*h1(fi*9.)));
    col+=on*smoothstep(.004,.0,d)*smoothstep(-1.,.0,-uv.y)*.12*(.5+.5*h1(floor(uv.y*20.)+sf));
  }
  float dust=step(.9985,h3(vec3(floor(gl_FragCoord.xy/2.),floor(t*12.))));
  col+=dust*.25;
  /* vignette, then melt into the page colour before the canvas edge */
  col*=1.-smoothstep(.5,1.25,length(uv*vec2(.8,1.25)));
  vec2 fn=(gl_FragCoord.xy-.5*R)/(.5*R);
  float edge=(1.-smoothstep(.7,.98,abs(fn.x)))*(1.-smoothstep(.7,.98,abs(fn.y)));
  col=mix(vec3(0.),col,edge*edge);
  float o=pow(max(col.r,0.),.95);
  gl_FragColor=vec4(vec3(.0196+o*(1.-.0196)),1.);   /* never darker than the page */
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
    const U = {}; for (const k of ["R", "T", "G", "P", "B", "Z", "F"]) U[k] = gl.getUniformLocation(pg, k);

    let scale = opts.scale || (matchMedia("(max-width: 760px)").matches ? 0.7 : 0.85);
    let gx = 0, gy = 0, tx = 0, ty = 0, pupil = .16, blink = 0, blinkT = -1, nextBlink = 2.5, zoom = opts.zoom || 0.8;
    let visible = true, raf = 0, last = performance.now(), slow = 0, dart = .6, lastPointer = -1e9, flick = 1;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // a scripted clock lets the same eye be rendered frame-by-frame into a video
    const clock = opts.clock || (() => performance.now());

    function size() {
      const d = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect();
      canvas.width = Math.max(64, Math.round((opts.width || r.width * d) * scale)); canvas.height = Math.max(64, Math.round((opts.height || r.height * d) * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function step(dt, now) {
      // nervous glances: snap to a new spot every so often unless the cursor moved recently
      if ((dart -= dt) < 0) {
        dart = .35 + Math.random() * 1.4;
        if (now - lastPointer > 2500) {
          const k = Math.random();
          tx = k < .2 ? 0 : (Math.random() * 2 - 1) * .95;
          ty = (Math.random() * 2 - 1) * (k < .2 ? .2 : .9);
        }
      }
      gx += (tx - gx) * Math.min(1, dt * 22); gy += (ty - gy) * Math.min(1, dt * 22);
      // blinks: quick close, slower open
      if ((nextBlink -= dt) < 0) { blinkT = 0; nextBlink = 2.5 + Math.random() * 4.5; }
      if (blinkT >= 0) { blinkT += dt; const c = .07, o = .16; blink = blinkT < c ? blinkT / c : Math.max(0, 1 - (blinkT - c) / o); if (blinkT > c + o) blinkT = -1; }
      flick += ((.93 + Math.random() * .1) - flick) * .5;
    }
    function render(now) {
      gl.uniform2f(U.R, canvas.width, canvas.height); gl.uniform1f(U.T, now / 1000);
      gl.uniform2f(U.G, gx, gy); gl.uniform1f(U.P, pupil); gl.uniform1f(U.B, blink); gl.uniform1f(U.Z, zoom); gl.uniform1f(U.F, flick);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!opts.clock && dt > 0.034 && ++slow > 40 && scale > 0.5) { scale -= 0.15; slow = 0; size(); } else if (dt < 0.03) slow = Math.max(0, slow - 1);
      step(dt, now); render(now);
    }
    function loop() { raf = requestAnimationFrame(loop); frame(clock()); }
    function start() { if (!opts.clock && !raf && visible && !document.hidden && !still) { last = clock(); raf = requestAnimationFrame(loop); } }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    size(); render(clock());
    if (!opts.width && window.ResizeObserver) new ResizeObserver(() => { size(); render(clock()); }).observe(canvas);
    if (opts.follow) addEventListener("pointermove", e => {
      const r = canvas.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      tx = Math.max(-.95, Math.min(.95, (e.clientX - cx) / Math.max(innerWidth * .4, 1)));
      ty = Math.max(-.9, Math.min(.9, -(e.clientY - cy) / Math.max(innerHeight * .4, 1)));
      lastPointer = clock();
    }, { passive: true });
    if (!opts.clock) {
      new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? start() : stop(); }).observe(canvas);
      document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
      start();
    }
    return {
      excite() { blinkT = 0; },
      dilate(v) { pupil = v; },
      zoom(v) { zoom = v; },
      look(x, y) { tx = x; ty = y; },
      tick(dtSec, now) { step(dtSec, now); render(now); },
      snapshot() { render(clock()); return canvas.toDataURL("image/png"); },
    };
  }
  return { make };
})();
