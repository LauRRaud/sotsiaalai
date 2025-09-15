// components/backgrounds/LaserFlow.jsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./LaserFlow.css";

const VERT = `
precision highp float;
attribute vec3 position;
void main(){
  gl_Position = vec4(position, 1.0);
}
`;

const FRAG = `
precision highp float;
precision mediump int;

uniform float iTime;
uniform vec3  iResolution;

/* tala positsioneerimine */
uniform float uUsePx;
uniform float uBeamOffXPx;
uniform float uBeamOffYPx;
uniform float uBeamXFrac;
uniform float uBeamYFrac;

uniform float uWispDensity;
uniform float uFlowTime;
uniform float uFlowSpeed;
uniform float uVLenFactor;
uniform float uHLenFactor;
uniform float uWSpeed;
uniform float uWIntensity;
uniform float uFlowStrength;
uniform float uDecay;
uniform float uFalloffStart;
uniform vec3  uColor;
uniform float uFade;
uniform float uBaseLift;

/* dither tugevus (bandingu vastu) */
uniform float uDitherAmp;

/* WebGL1: palett eraldi uniformid */
uniform vec3  uWisp0;
uniform vec3  uWisp1;
uniform vec3  uWisp2;
uniform vec3  uWisp3;
uniform vec3  uWisp4;
uniform vec3  uWisp5;
uniform vec3  uWisp6;
uniform vec3  uWisp7;
uniform int   uWispCount;
uniform float uWispTint;

// --- konstandid ---
#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define EPS 1e-6
#define EDGE_SOFT (DT_LOCAL*4.0)
#define DT_LOCAL 0.0038
/* NB: int-konstant, et for-tsüklid kompileeruks WebGL1-s */
const int TAP_R = 6;

#define R_H 150.0
#define R_V 150.0
#define FLARE_HEIGHT 16.0
#define FLARE_AMOUNT 8.0
#define FLARE_EXP 2.0
#define TOP_FADE_START 0.1
#define TOP_FADE_EXP 1.0
#define FLOW_PERIOD 0.5
#define FLOW_SHARPNESS 1.5

// Wisps
#define W_BASE_X 1.5
#define W_LAYER_GAP 0.25
#define W_LANES 55
#define W_SIDE_DECAY 0.5
#define W_HALF 0.0095
#define W_AA   0.26
#define W_CELL 18.0
#define W_SEG_MIN 0.15
#define W_SEG_MAX 0.35
#define W_CURVE_AMOUNT 15.0
#define W_CURVE_RANGE (FLARE_HEIGHT - 3.0)

float g(float x){ return x<=0.00031308?12.92*x:1.055*pow(x,1.0/2.4)-0.055; }
float bs(vec2 p,vec2 q,float powr){
  float d=distance(p,q),f=powr*uFalloffStart,r=(f*f)/(d*d+EPS);
  return powr*min(1.0,r);
}
float bsa(vec2 p,vec2 q,float powr,vec2 s){
  vec2 d=p-q; float dd=(d.x*d.x)/(s.x*s.x)+(d.y*d.y)/(s.y*s.y),f=powr*uFalloffStart,r=(f*f)/(dd+EPS);
  return powr*min(1.0,r);
}
float tri01(float x){ float f=fract(x); return 1.0-abs(f*2.0-1.0); }
float tauWf(float t,float tmin,float tmax){ float a=smoothstep(tmin,tmin+EDGE_SOFT,t),b=1.0-smoothstep(tmax-EDGE_SOFT,tmax,t); return max(0.0,a*b); }
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+34.123); return fract(p.x*p.y); }
float flareY(float y){ float t=clamp(1.0-(clamp(y,0.0,FLARE_HEIGHT)/max(FLARE_HEIGHT,EPS)),0.0,1.0); return pow(t,FLARE_EXP); }
float rGate(float x,float l){ float a=smoothstep(0.0,W_AA,x),b=1.0-smoothstep(l,l+W_AA,x); return max(0.0,a*b); }

/* paletist toon */
vec3 getWispColor(int idx){
  if (uWispCount <= 0) return uColor;
  int i = idx;
  if (i < 0) i = 0;
  if (i >= uWispCount) i = uWispCount - 1;
  vec3 c = uColor;
  if (i == 0) c = uWisp0;
  else if (i == 1) c = uWisp1;
  else if (i == 2) c = uWisp2;
  else if (i == 3) c = uWisp3;
  else if (i == 4) c = uWisp4;
  else if (i == 5) c = uWisp5;
  else if (i == 6) c = uWisp6;
  else if (i == 7) c = uWisp7;
  return c;
}

/* Wisps (värviga) */
vec4 vWispsCol(vec2 uv,float topF){
  float y=uv.y, yf=(y+uFlowTime*uWSpeed)/W_CELL;

  float dRaw=clamp(uWispDensity,0.0,2.0),d=dRaw<=0.0?1.0:dRaw;
  float lanesF=floor(float(W_LANES)*min(d,1.0)+0.5);
  int lanes=int(max(1.0,lanesF));
  float sp=min(d,1.0),ep=max(d-1.0,0.0);

  float fm=flareY(max(y,0.0)),rm=clamp(1.0-(y/max(W_CURVE_RANGE,EPS)),0.0,1.0),cm=fm*rm;
  const float G = 0.05;
  float xS = 1.0 + (FLARE_AMOUNT * W_CURVE_AMOUNT * G) * cm;

  float baseN= smoothstep(5.0, 20.0, y);
  float baseBoost = mix(1.00, 1.10, baseN);

  float sPix=clamp(y/R_V,0.0,1.0);
  float bGain=pow(1.0 - sPix, 6.0);

  float sum=0.0;
  vec3 acc=vec3(0.0);

  for(int s=0;s<2;++s){
    float sgn=s==0?-1.0:1.0;
    for(int i=0;i<W_LANES;++i){
      if(i>=lanes) break;

      float off=W_BASE_X+float(i)*W_LAYER_GAP;
      float xc=sgn*(off*xS);

      float dx=abs(uv.x-xc);
      float lat=1.0-smoothstep(W_HALF,W_HALF+W_AA,dx);

      float amp=exp(-off*W_SIDE_DECAY) * mix(1.0, exp(-off*0.85), baseN) * baseBoost;

      float seed=h21(vec2(off,sgn*17.0));
      float yf2=yf+seed*7.0;
      float ci=floor(yf2);
      float fy=fract(yf2);
      fy += (h21(vec2(ci*1.7, off*9.1)) - 0.5) * 0.10;

      float seg=mix(W_SEG_MIN,W_SEG_MAX,h21(vec2(ci,off*2.3)));
      float spR=h21(vec2(ci,off+sgn*31.0));
      float seg1=rGate(fy,seg)*step(spR,sp);
      if(ep>0.0){
        float spR2=h21(vec2(ci*3.1+7.0,off*5.3+sgn*13.0));
        float f2=fract(fy+0.5);
        seg1+=rGate(f2,seg*0.9)*step(spR2,ep);
      }

      float contrib = amp*lat*seg1;
      sum += contrib;

      int idx = 0;
      if (uWispCount > 0) {
        float pick = h21(vec2(off*11.3 + float(i)*0.7, ci*3.1 + sgn*5.0));
        idx = int(floor(mod(pick*float(uWispCount), float(uWispCount))));
      }
      vec3 palCol = getWispColor(idx);
      vec3 wc = mix(uColor, palCol, clamp(uWispTint, 0.0, 1.0));

      acc += contrib * wc;
    }
  }

  float span=smoothstep(-3.0,0.0,y)*(1.0-smoothstep(R_V-6.0,R_V,y));
  acc *= uWIntensity*topF*bGain*span;
  float a = uWIntensity*sum*topF*bGain*span;

  return vec4(acc, a);
}

void mainImage(out vec4 fc,in vec2 frag){
  vec2 C=iResolution.xy*.5;
  float sc=512.0/iResolution.x*.4;
  vec2 uv=(frag-C)*sc;

  // nihke valik: px või fraktsioon
  vec2 offFrac = vec2(uBeamXFrac*iResolution.x*sc, uBeamYFrac*iResolution.y*sc);
  vec2 offPx   = vec2(uBeamOffXPx*sc,            uBeamOffYPx*sc);
  vec2 off     = mix(offFrac, offPx, clamp(uUsePx, 0.0, 1.0));

  vec2 uvc = uv - off;

  float a=0.0,b=0.0;
  float basePhase=1.5*PI+uDecay*.5; float tauMin=basePhase-uDecay; float tauMax=basePhase;

  // horisontaalne kaar (põhi/jalg)
  float cx=clamp(uvc.x/(R_H*uHLenFactor),-1.0,1.0),tH=clamp(TWO_PI-acos(cx),tauMin,tauMax);
  for(int k=-TAP_R;k<=TAP_R;++k){
    float tu=tH+float(k)*DT_LOCAL,wt=tauWf(tu,tauMin,tauMax); if(wt<=0.0) continue;
    float spd=max(abs(sin(tu)),0.02),u=clamp((basePhase-tu)/max(uDecay,EPS),0.0,1.0),env=pow(1.0-abs(u*2.0-1.0),0.8);
    vec2 p=vec2((R_H*uHLenFactor)*cos(tu), uBaseLift);
    a+=wt*bs(uvc,p,env*spd);
  }

  // vertikaalne kaar (juga)
  float yPix=uvc.y,cy=clamp(-yPix/(R_V*uVLenFactor),-1.0,1.0),tV=clamp(TWO_PI-acos(cy),tauMin,tauMax);
  for(int k=-TAP_R;k<=TAP_R;++k){
    float tu=tV+float(k)*DT_LOCAL,wt=tauWf(tu,tauMin,tauMax); if(wt<=0.0) continue;
    float yb=(-R_V)*cos(tu),s=clamp(yb/R_V,0.0,1.0),spd=max(abs(sin(tu)),0.02);

    float env=pow(1.0-s,0.6)*spd;
    float cap=1.0-smoothstep(TOP_FADE_START,1.0,s); cap=pow(cap,TOP_FADE_EXP); env*=cap;

    float ph=s/max(FLOW_PERIOD,EPS)+uFlowTime*uFlowSpeed;
    float fl=pow(tri01(ph),FLOW_SHARPNESS);

    float fs = uFlowStrength * (1.0 - smoothstep(0.82, 1.00, s));
    env *= mix(1.0 - fs, 1.0, fl);

    float yp=(-R_V*uVLenFactor)*cos(tu),m=pow(smoothstep(FLARE_HEIGHT,0.0,yp),FLARE_EXP),wx=1.0+FLARE_AMOUNT*m;
    vec2 sig=vec2(wx,1.0),p=vec2(0.0,yp);
    float mask=step(0.0,yp);
    b+=wt*bsa(uvc,p,mask*env,sig);
  }

  float sPix=clamp(yPix/R_V,0.0,1.0),topA=pow(1.0-smoothstep(TOP_FADE_START,1.0,sPix),TOP_FADE_EXP);
  float L=a+b*topA;

  // wisps – värviline summa
  vec4 wC = vWispsCol(vec2(uvc.x,yPix), topA);

  // dither skaleeritult
  float dith=(h21(frag)-0.5)*(uDitherAmp/255.0);

  float toneBeam = g(L);
  vec3 col = toneBeam * uColor + wC.rgb + dith;

  float alpha = clamp(g(L + wC.a*0.6) + dith*0.6, 0.0, 1.0);

  col*=uFade; alpha*=uFade;

  fc=vec4(col,alpha);
}

void main(){
  vec4 fc;
  mainImage(fc, gl_FragCoord.xy);
  gl_FragColor = fc;
}
`;

export const LaserFlow = ({
  className,
  style,

  /* px offset (võidab frac) */
  beamOffsetXPx,
  beamOffsetYPx,
  horizontalBeamOffset = 0,
  verticalBeamOffset   = 0,

  /* basic props */
  wispDensity = 1,
  dpr,
  flowSpeed            = 0.35,
  verticalSizing       = 2.0,
  horizontalSizing     = 0.5,
  wispSpeed            = 15.0,
  wispIntensity        = 5.0,
  flowStrength         = 0.25,
  decay                = 1.1,
  falloffStart         = 1.2,
  color                = "#22129a",
  baseLift             = 0.0,

  /* wispi värvid */
  wispColors = [],
  wispTint   = 1.0,

  /* bandingu dither */
  ditherAmp           = 0.0,   // 0..0.2

  /* max FPS throttle */
  maxFps              = 30,
}) => {
  const mountRef     = useRef(null);
  const hasFadedRef  = useRef(false);

  useEffect(() => {
    const mount = mountRef.current;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "low-power",
      premultipliedAlpha: false,
      stencil: false,
      depth: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width  = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
        3
      )
    );

    const uniforms = {
      iTime:        { value: 0 },
      iResolution:  { value: new THREE.Vector3(1, 1, 1) },

      uUsePx:       { value: (Number.isFinite(beamOffsetXPx) && Number.isFinite(beamOffsetYPx)) ? 1 : 0 },
      uBeamOffXPx:  { value: beamOffsetXPx ?? 0 },
      uBeamOffYPx:  { value: beamOffsetYPx ?? 0 },
      uBeamXFrac:   { value: horizontalBeamOffset },
      uBeamYFrac:   { value: verticalBeamOffset },

      uWispDensity: { value: wispDensity },
      uFlowTime:    { value: 0 },

      uFlowSpeed:   { value: flowSpeed },
      uVLenFactor:  { value: verticalSizing },
      uHLenFactor:  { value: horizontalSizing },

      uWSpeed:      { value: wispSpeed },
      uWIntensity:  { value: wispIntensity },
      uFlowStrength:{ value: flowStrength },

      uDecay:       { value: decay },
      uFalloffStart:{ value: falloffStart },

      uColor:       { value: new THREE.Vector3(1, 1, 1) },
      uFade:        { value: hasFadedRef.current ? 1 : 0 },

      uBaseLift:    { value: baseLift },
      uDitherAmp:   { value: ditherAmp },

      // palett
      uWisp0: { value: new THREE.Vector3(1,1,1) },
      uWisp1: { value: new THREE.Vector3(1,1,1) },
      uWisp2: { value: new THREE.Vector3(1,1,1) },
      uWisp3: { value: new THREE.Vector3(1,1,1) },
      uWisp4: { value: new THREE.Vector3(1,1,1) },
      uWisp5: { value: new THREE.Vector3(1,1,1) },
      uWisp6: { value: new THREE.Vector3(1,1,1) },
      uWisp7: { value: new THREE.Vector3(1,1,1) },
      uWispCount: { value: 0 },
      uWispTint:  { value: wispTint },
    };

    const material = new THREE.RawShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending,
      toneMapped: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // HEX -> Vector3
    const hexToV3 = (hex) => {
      let c = (hex || "#ffffff").trim();
      if (c[0] === "#") c = c.slice(1);
      if (c.length === 3) c = c.split("").map(x => x + x).join("");
      let n = parseInt(c, 16);
      if (Number.isNaN(n)) n = 0xffffff;
      return new THREE.Vector3(((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255);
    };

    // Seadista kuni 8 värvi
    {
      const maxPal = 8;
      const src = Array.isArray(wispColors) ? wispColors.slice(0, maxPal) : [];
      const names = ["uWisp0","uWisp1","uWisp2","uWisp3","uWisp4","uWisp5","uWisp6","uWisp7"];
      for (let i = 0; i < maxPal; i++) {
        const v3 = src[i] ? hexToV3(src[i]) : new THREE.Vector3(1,1,1);
        uniforms[names[i]].value.copy(v3);
      }
      uniforms.uWispCount.value = src.length;
      uniforms.uWispTint.value  = wispTint;
    }

    // DPI / suurus
    const setSize = () => {
      const { clientWidth: w, clientHeight: h } = mount;
      const deviceDpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
      const pixelRatio = Math.min(dpr ?? deviceDpr, 1.5);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(w, h, false);
      uniforms.iResolution.value.set(w * pixelRatio, h * pixelRatio, pixelRatio);
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(mount);

    // Anim loop + FPS throttle
    const clock = new THREE.Clock();
    let prevTime = 0;
    let flowTime = 0;
    let fade     = hasFadedRef.current ? 1 : 0;

    let raf = 0;
    let lastNow = performance.now();
    const minFrameMs = maxFps && maxFps > 0 ? (1000 / maxFps) : 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);

      const now = performance.now();
      if (minFrameMs > 0 && (now - lastNow) < minFrameMs) return;
      const frameDtMs = now - lastNow;
      lastNow = now;

      const t  = clock.getElapsedTime();
      const dt = Math.max(0, t - prevTime);
      prevTime = t;

      // värv HEX → vec3
      {
        let c = (color || "#ffffff").trim();
        if (c[0] === "#") c = c.slice(1);
        if (c.length === 3) c = c.split("").map((x) => x + x).join("");
        let n = parseInt(c, 16);
        if (Number.isNaN(n)) n = 0xffffff;
        const r = ((n >> 16) & 255) / 255;
        const g = ((n >> 8) & 255) / 255;
        const b = (n & 255) / 255;
        uniforms.uColor.value.set(r, g, b);
      }

      // live propide uuendus
      uniforms.uUsePx.value      = (Number.isFinite(beamOffsetXPx) && Number.isFinite(beamOffsetYPx)) ? 1 : 0;
      uniforms.uBeamOffXPx.value = beamOffsetXPx ?? 0;
      uniforms.uBeamOffYPx.value = beamOffsetYPx ?? 0;
      uniforms.uBeamXFrac.value  = horizontalBeamOffset;
      uniforms.uBeamYFrac.value  = verticalBeamOffset;

      uniforms.uWispDensity.value  = wispDensity;
      uniforms.uFlowSpeed.value    = flowSpeed;
      uniforms.uVLenFactor.value   = verticalSizing;
      uniforms.uHLenFactor.value   = horizontalSizing;
      uniforms.uWSpeed.value       = wispSpeed;
      uniforms.uWIntensity.value   = wispIntensity;
      uniforms.uFlowStrength.value = flowStrength;
      uniforms.uDecay.value        = decay;
      uniforms.uFalloffStart.value = falloffStart;
      uniforms.uBaseLift.value     = baseLift;
      uniforms.uDitherAmp.value    = ditherAmp;

      const cdt = Math.min(0.05, Math.max(0.001, dt || frameDtMs / 1000));
      flowTime += cdt;
      uniforms.uFlowTime.value = flowTime;
      uniforms.iTime.value     = t;

      if (!hasFadedRef.current) {
        const fadeDur = 1.0;
        fade = Math.min(1, fade + cdt / fadeDur);
        uniforms.uFade.value = fade;
        if (fade >= 1) hasFadedRef.current = true;
      } else if (uniforms.uFade.value !== 1) {
        uniforms.uFade.value = 1;
      }

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);

    const onVis = () => {
      if (document.visibilityState !== "visible") {
        cancelAnimationFrame(raf);
      } else {
        lastNow = performance.now();
        prevTime = clock.getElapsedTime();
        raf = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    beamOffsetXPx, beamOffsetYPx, horizontalBeamOffset, verticalBeamOffset,
    wispDensity, dpr, flowSpeed, verticalSizing, horizontalSizing,
    wispSpeed, wispIntensity, flowStrength, decay, falloffStart,
    color, baseLift, ditherAmp, maxFps, wispColors, wispTint,
  ]);

  return (
    <div
      ref={mountRef}
      className={`laser-flow-container ${className ?? ""}`}
      style={style}
    />
  );
};

export default LaserFlow;
