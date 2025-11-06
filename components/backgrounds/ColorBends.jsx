/*
  ColorBends – pausitav ajajoon (no-jump), 24fps, adaptive DPR, visibility pause.
  Drop-in asendus.
*/
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './ColorBends.css';

const MAX_COLORS = 8;

const frag = `
#ifdef GL_ES
precision mediump float;
#endif

#define MAX_COLORS ${MAX_COLORS}

uniform vec2  uCanvas;
uniform float uTime;           // pausitav ajajoon sekundites
uniform float uSpeed;
uniform vec2  uRot;
uniform int   uColorCount;
uniform vec3  uColors[MAX_COLORS];
uniform int   uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2  uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;

varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;

  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);

  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;

  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

  vec3 col = vec3(0.0);
  float a = 1.0;

  if (uColorCount > 0) {
    vec2 s = q;
    vec3 sumCol = vec3(0.0);
    float cover = 0.0;

    for (int i = 0; i < MAX_COLORS; ++i) {
      if (i >= uColorCount) break;
      s -= 0.01;
      vec2 base = s * uFrequency;
      vec2 r = sin(1.5 * base.yx + 2.0 * cos(base));

      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix   = pow(kBelow, 0.3);
      float gain   = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2  disp   = (r - s) * kBelow;
      vec2  warped = s + disp * gain;

      float shared = 5.0 * warped.y * uFrequency - 3.0 * t + float(i);
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float m1 = length(warped + sin(shared) / 4.0);
      float m  = mix(m0, m1, kMix);

      float w = 1.0 - exp(-6.0 / exp(6.0 * m));
      sumCol += uColors[i] * w;
      cover   = max(cover, w);
    }
    col = clamp(sumCol, 0.0, 1.0);
    a = uTransparent > 0 ? cover : 1.0;
  } else {
    vec2 s = q;
    for (int k = 0; k < 3; ++k) {
      s -= 0.01;
      vec2 base = s * uFrequency;
      vec2 r = sin(1.5 * base.yx + 2.0 * cos(base));

      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix   = pow(kBelow, 0.3);
      float gain   = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2  disp   = (r - s) * kBelow;
      vec2  warped = s + disp * gain;

      float shared = 5.0 * warped.y * uFrequency - 3.0 * t + float(k);
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float m1 = length(warped + sin(shared) / 4.0);
      float m  = mix(m0, m1, kMix);

      col[k] = 1.0 - exp(-6.0 / exp(6.0 * m));
    }
    a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
  }

  if (uNoise > 0.0001) {
    float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
  }

  vec3 rgb = (uTransparent > 0) ? col * a : col;
  gl_FragColor = vec4(rgb, a);
}
`;

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export default function ColorBends({
  className,
  style,
  rotation = -58,
  speed = 0.15,
  colors = ['#b17c7c'],
  transparent = true,
  autoRotate = 0,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 0,
  parallax = 0,
  noise = 0,
}) {
  const containerRef      = useRef(null);
  const rendererRef       = useRef(null);
  const rafRef            = useRef(null);
  const materialRef       = useRef(null);
  const resizeObserverRef = useRef(null);

  const rotationRef   = useRef(rotation);
  const autoRotateRef = useRef(autoRotate);

  const pointerTargetRef  = useRef(new THREE.Vector2(0, 0));
  const pointerCurrentRef = useRef(new THREE.Vector2(0, 0));
  const pointerSmoothRef  = useRef(8);

  useEffect(() => {
    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uColorsArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0));

    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uCanvas:         { value: new THREE.Vector2(1, 1) },
        uTime:           { value: 0 },                  // ← pausitav ajajoon
        uSpeed:          { value: speed },
        uRot:            { value: new THREE.Vector2(1, 0) },
        uColorCount:     { value: 0 },
        uColors:         { value: uColorsArray },
        uTransparent:    { value: transparent ? 1 : 0 },
        uScale:          { value: scale },
        uFrequency:      { value: frequency },
        uWarpStrength:   { value: warpStrength },
        uPointer:        { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: mouseInfluence },
        uParallax:       { value: parallax },
        uNoise:          { value: noise }
      },
      transparent: !!transparent,
      premultipliedAlpha: !!transparent
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      alpha: !!transparent
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.setClearColor(0x000000, transparent ? 0 : 1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Adaptive DPR ---
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
    let renderScale = prefersReduced ? 0.8 : 1.0;
    const baseDpr = Math.min(window.devicePixelRatio || 1, 2);
    const applyDpr = () => renderer.setPixelRatio(Math.min(baseDpr * renderScale, 2));
    applyDpr();

    // --- Resize ---
    const handleResize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setSize(w, h, false);
      material.uniforms.uCanvas.value.set(w, h);
    };
    handleResize();
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(handleResize);
      ro.observe(container);
      resizeObserverRef.current = ro;
    } else {
      window.addEventListener('resize', handleResize);
    }

    // --- Pausitav loop (no-jump) ---
    let tabHidden = document.hidden;
    let isVisible = true;

    let timeline = 0;          // sekundid (jookseb ainult loopi ajal)
    let lastTs = null;         // rAF timestamp ms

    const fps = 24;
    const step = 1 / fps;
    let acc = 0;

    // DPR auto-skaala mõõdik
    let msAccum = 0, frameCount = 0;
    const targetMs = 1000 / 50;

    function loop(ts) {
      // ts on rAF timestamp millisekundites
      if (lastTs == null) lastTs = ts;
      const dt = Math.max(0, (ts - lastTs) / 1000); // sekundites
      lastTs = ts;

      // ajajoont kasvatame ainult siis, kui loop töötab
      timeline += dt;
      material.uniforms.uTime.value = timeline;

      acc += dt;

      // pöörang
      const deg = (rotationRef.current % 360) + autoRotateRef.current * timeline;
      const rad = (deg * Math.PI) / 180;
      material.uniforms.uRot.value.set(Math.cos(rad), Math.sin(rad));

      // pointer lerp
      const cur = pointerCurrentRef.current;
      const tgt = pointerTargetRef.current;
      const amt = Math.min(1, dt * pointerSmoothRef.current);
      cur.lerp(tgt, amt);
      material.uniforms.uPointer.value.copy(cur);

      if (!tabHidden && isVisible && acc >= step) {
        renderer.render(scene, camera);
        acc -= step;
      }

      // DPR kohandus ~0.5s kaupa
      msAccum += dt * 1000; frameCount++;
      if (msAccum > 500) {
        const avg = msAccum / frameCount;
        if (avg > targetMs * 1.15 && renderScale > 0.6) {
          renderScale = Math.max(0.6, renderScale * 0.9);
          applyDpr();
        } else if (avg < targetMs * 0.9 && renderScale < 1.0) {
          renderScale = Math.min(1.0, renderScale * 1.1);
          applyDpr();
        }
        msAccum = 0; frameCount = 0;
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (rafRef.current != null) return;
      // ÄRA nulli timeline’i — nii ei teki hüpet algusesse
      acc = 0; msAccum = 0; frameCount = 0;
      lastTs = null; // et esimene dt ei teeks hüpet
      pointerCurrentRef.current.copy(pointerTargetRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }

    function stopLoop() {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // jätame timeline’i puutumata (paus)
      lastTs = null;
    }

    // Visibility & Intersection
    const onVis = () => {
      tabHidden = document.hidden;
      if (tabHidden) stopLoop(); else if (isVisible) startLoop();
    };
    document.addEventListener('visibilitychange', onVis);

    const onPageHide = () => { stopLoop(); };
    const onPageShow = () => { tabHidden = document.hidden; if (!tabHidden && isVisible) startLoop(); };
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);

    const io = new IntersectionObserver(([e]) => {
      isVisible = !!e.isIntersecting;
      if (!isVisible) stopLoop(); else if (!tabHidden) startLoop();
    }, { root: null, rootMargin: '200px' });
    io.observe(container);

    if (!document.hidden) startLoop();

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      io.disconnect();
      stopLoop();

      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      else window.removeEventListener('resize', handleResize);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement?.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [frequency, mouseInfluence, noise, parallax, scale, speed, transparent, warpStrength]);

  // props → uniforms
  useEffect(() => {
    const material = materialRef.current;
    const renderer = rendererRef.current;
    if (!material) return;

    rotationRef.current   = rotation;
    autoRotateRef.current = autoRotate;

    material.uniforms.uSpeed.value          = speed;
    material.uniforms.uScale.value          = scale;
    material.uniforms.uFrequency.value      = frequency;
    material.uniforms.uWarpStrength.value   = warpStrength;
    material.uniforms.uMouseInfluence.value = mouseInfluence;
    material.uniforms.uParallax.value       = parallax;
    material.uniforms.uNoise.value          = noise;

    const toVec3 = (hex) => {
      const h = hex.replace('#','').trim();
      const v = h.length === 3
        ? [parseInt(h[0]+h[0],16), parseInt(h[1]+h[1],16), parseInt(h[2]+h[2],16)]
        : [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
      return new THREE.Vector3(v[0]/255, v[1]/255, v[2]/255);
    };

    const arr = (colors || []).filter(Boolean).slice(0, MAX_COLORS).map(toVec3);
    for (let i = 0; i < MAX_COLORS; i++) {
      const vec = material.uniforms.uColors.value[i];
      if (i < arr.length) vec.copy(arr[i]); else vec.set(0,0,0);
    }
    material.uniforms.uColorCount.value  = arr.length;
    material.uniforms.uTransparent.value = transparent ? 1 : 0;

    if (renderer) renderer.setClearColor(0x000000, transparent ? 0 : 1);
  }, [rotation, autoRotate, speed, scale, frequency, warpStrength, mouseInfluence, parallax, noise, colors, transparent]);

  // pointer throttle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let last = 0;
    let rect = container.getBoundingClientRect();
    const updateRect = () => { rect = container.getBoundingClientRect(); };
    const ro = new ResizeObserver(updateRect);
    ro.observe(container);

    const handlePointerMove = (e) => {
      const now = performance.now();
      if (now - last < 16) return;
      last = now;
      const x = ((e.clientX - rect.left) / (rect.width  || 1)) * 2 - 1;
      const y = -(((e.clientY - rect.top)  / (rect.height || 1)) * 2 - 1);
      pointerTargetRef.current.set(x, y);
    };
    container.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      ro.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return <div ref={containerRef} className={`color-bends-container ${className || ''}`} style={style} />;
}
