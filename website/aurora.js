/* 1EYE — aurora sky behind the pyramid. One WebGL fragment shader, no libraries.
   Night: curtains of light over a frozen horizon, twinkling stars, snow catching the glow.
   Day: a clear winter sky with a low sun, drifting high clouds and bright snow.
   The curtains lean toward the cursor; double-click for a substorm. */
const Aurora = (() => {
  let gl, cv, prog, u = {}, raf = 0, t0 = performance.now();
  let mx = 0.5, my = 0.6, smx = 0.5, smy = 0.6, storm = 0, day = 0, dayT = 0, scale = 0.5;

  const VS = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
  const FS = `precision highp float;
uniform vec2 R;uniform float T;uniform vec2 M;uniform float S;uniform float D;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
vec3 curtains(vec2 p,float t){
  vec3 col=vec3(0.);
  float lean=(M.x-.5)*.9;
  for(int i=0;i<4;i++){
    float fi=float(i);
    float x=p.x*(1.05+fi*.32)+lean*(p.y-.35)+fi*3.7;
    vec2 q=vec2(x*.8,t*.025+fi*1.9);
    float w=fbm(q+1.6*fbm(q*1.8+vec2(t*.04,-t*.03)));          /* domain warp: folding fabric */
    float base=.50+fi*.055+.13*sin(x*1.1+t*.09+fi*2.)+(w-.5)*.42;
    float d=p.y-base;
    float edge=smoothstep(-.035,.0,d);                           /* crisp lower hem */
    float tail=exp(-max(d,0.)*(3.2+fi*.9));                      /* long fading top */
    float rays=.45+.55*pow(fbm(vec2(x*9.,t*.18+fi*7.)),1.6);     /* vertical striations */
    float fold=.6+.4*sin(x*6.+w*9.+t*.3);
    float k=edge*tail*rays*fold*(1.-fi*.17);
    vec3 c=mix(vec3(.18,1.,.58),vec3(.42,.95,.85),smoothstep(.0,.08,d));
    c=mix(c,vec3(.58,.36,1.),smoothstep(.08,.3,d));
    c=mix(c,vec3(1.,.32,.62),smoothstep(.26,.55,d)*.55);
    col+=c*k;
  }
  return col;
}
void main(){
  vec2 fc=gl_FragCoord.xy,uv=fc/R;float ar=R.x/R.y;
  vec2 p=vec2((uv.x-.5)*ar,uv.y);
  float t=T*(1.+S*2.5);
  float horizon=.17+.025*sin(p.x*1.7)+.012*sin(p.x*5.3+1.);
  bool ground=uv.y<horizon;

  /* ---------- night ---------- */
  vec3 sky=mix(vec3(.035,.05,.11),vec3(.006,.008,.03),smoothstep(.1,1.,uv.y));
  sky+=vec3(.02,.06,.07)*exp(-abs(uv.y-horizon)*9.);           /* airglow near the horizon */
  vec2 cell=floor(fc/3.);float r=h(cell);
  float star=step(.9965,r)*(.45+.55*sin(T*(.6+r*3.)+r*60.));
  star*=smoothstep(horizon,horizon+.06,uv.y);
  vec3 aur=curtains(p,t);
  float near=exp(-length((uv-M)*vec2(ar,1.))*3.5);                /* brighter where the cursor is */
  aur*=(1.+near*1.1)*(1.+S*1.6);
  vec3 night=sky+vec3(star)*vec3(.85,.9,1.)+aur*.95;
  if(ground){
    float depth=(horizon-uv.y)/horizon;
    vec3 refl=curtains(vec2(p.x,horizon+(horizon-uv.y)*1.6),t);    /* snow catches the light */
    vec3 snow=mix(vec3(.05,.07,.12),vec3(.015,.02,.04),depth);
    snow+=refl*(.32-.22*depth)*(1.+S);
    snow+=vec3(.6,.8,1.)*step(.9985,h(floor(fc/2.)))*(.3+.3*sin(T*2.+fc.x));  /* ice sparkle */
    night=snow;
  }

  /* ---------- day ---------- */
  vec3 dsky=mix(vec3(.99,.93,.86),vec3(.42,.64,.96),pow(clamp((uv.y-horizon)/(1.-horizon),0.,1.),.6));
  vec2 sun=vec2(.32*ar,.74);float sd=length(p-sun);
  dsky+=vec3(1.,.86,.62)*(exp(-sd*7.)*.55+exp(-sd*30.)*.6);
  float cl=fbm(vec2(p.x*1.3+T*.012,p.y*4.5));cl=smoothstep(.52,.85,cl)*smoothstep(horizon,.5,uv.y);
  dsky=mix(dsky,vec3(1.),cl*.55);
  dsky+=curtains(p,t)*.07*vec3(.5,.7,1.);                         /* the faintest daylight trace */
  dsky+=vec3(.15,.25,.35)*near*.12;
  if(ground){
    float depth=(horizon-uv.y)/horizon;
    dsky=mix(vec3(.93,.95,.99),vec3(.78,.84,.94),depth);
    dsky+=vec3(1.)*step(.998,h(floor(fc/2.)))*.25;
  }

  vec3 col=mix(night,dsky,D);
  col=mix(col,1.-exp(-col*1.25),1.-D);                             /* soft tone map at night */
  col+=(h(fc+T)-.5)/255.;                                          /* dither: no banding */
  gl_FragColor=vec4(col,1.);
}`;

  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s); return s; }
  function resize() {
    const d = Math.min(devicePixelRatio || 1, 2);
    scale = innerWidth * d > 1600 ? 0.5 : 0.75;                   /* render under native resolution, upscale smoothly */
    cv.width = Math.round(innerWidth * d * scale); cv.height = Math.round(innerHeight * d * scale);
    gl && gl.viewport(0, 0, cv.width, cv.height);
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
    smx += (mx - smx) * 0.04; smy += (my - smy) * 0.04;
    storm = Math.max(0, storm - dt * 0.35);
    day += (dayT - day) * Math.min(1, dt * 2.2);
    gl.uniform2f(u.R, cv.width, cv.height); gl.uniform1f(u.T, now / 1000);
    gl.uniform2f(u.M, smx, smy); gl.uniform1f(u.S, storm); gl.uniform1f(u.D, day);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  return {
    init(canvas, isDay) {
      cv = canvas; dayT = day = isDay ? 1 : 0;
      gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
      if (!gl) { cv.classList.add("nogl"); return false; }
      try {
        prog = gl.createProgram();
        gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
        gl.linkProgram(prog); gl.useProgram(prog);
      } catch (e) { console.warn("aurora", e); cv.classList.add("nogl"); return false; }
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const a = gl.getAttribLocation(prog, "a"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      for (const k of ["R", "T", "M", "S", "D"]) u[k] = gl.getUniformLocation(prog, k);
      resize(); addEventListener("resize", resize);
      addEventListener("pointermove", e => { mx = e.clientX / innerWidth; my = 1 - e.clientY / innerHeight; }, { passive: true });
      addEventListener("dblclick", () => { storm = 1; });
      document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(raf); else { t0 = performance.now(); raf = requestAnimationFrame(frame); } });
      raf = requestAnimationFrame(frame);
      return true;
    },
    day(on) { dayT = on ? 1 : 0; },
    storm(k = 1) { storm = Math.max(storm, k); },
  };
})();
