/*
  Installed from https://reactbits.dev/default/
*/
import { useEffect, useRef } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";
import "./Particles.css";
// sinu varasem palett
const defaultColors = ["#cfd6e3", "#aeb6c2", "#232323", "#2e2e2e", "#E6B4A5", "#B86C57"];
// rgb/rgba/#hex -> [r,g,b] (0..1)
const parseColor = (c) => {
  if (!c) return [1, 1, 1];
  const s = String(c).trim();
  if (s.startsWith("#")) {
    let hex = s.replace(/^#/, "");
    if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
    const int = parseInt(hex, 16);
    return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
  }
  const m = s.match(/^rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (m) return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255];
  return [1, 1, 1];
};
const vertex = /* glsl */`
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  uniform mat4 modelMatrix, viewMatrix, projectionMatrix;
  uniform float uTime, uSpread, uBaseSize, uSizeRandomness;
  varying vec4 vRandom;
  varying vec3 vColor;
  void main() {
    vRandom = random;
    vColor = color;
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.2831 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.2831 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.2831 * random.y) * mix(0.1, 1.5, random.z);
    vec4 mvPos = viewMatrix * mPos;
    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;
const fragment = /* glsl */`
  precision highp float;
  uniform float uTime, uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    if (uAlphaParticles < 0.5) {
      if (d > 0.5) discard;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.2831), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.2831), circle);
    }
  }
`;
const Particles = ({
  particleCount = 75,
  particleSpread = 22,
  speed = 0.035,
  particleColors = ["#cfd6e3","#aeb6c2","#232323","#2e2e2e","#E6B4A5","#B86C57"],
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles,              // vaikimisi = true
  particleBaseSize = 1100,
  sizeRandomness = 0.3,
  cameraDistance = 15,
  disableRotation = false,
  className = "",
}) => {
  const containerRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // --- mobiilituvastus: EI muuda desktopi ---
    const isMobile =
      (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 768px)").matches) ||
      (typeof document !== "undefined" && document.body?.getAttribute("data-layout") === "mobile");
    // --- rakenda mobiilile kerged overrides; desktop jääb muutmata ---
    const cfg = {
      count: isMobile ? Math.max(40, Math.round(particleCount * 0.75)) : particleCount,
      spread: isMobile ? particleSpread * 0.95 : particleSpread,
      baseSize: isMobile ? Math.round(particleBaseSize * 0.86) : particleBaseSize,
      randomness: isMobile ? Math.min(0.28, sizeRandomness) : sizeRandomness,
      dprMax: isMobile ? 1.5 : 2,
      speed: isMobile ? Math.min(speed, 0.035) : speed, // säilita pehme liikumine
      hover: isMobile ? false : moveParticlesOnHover,    // mobiilis hover mõttetu
    };
    // vali palett: prop või fallback
    const palette = Array.isArray(particleColors) && particleColors.length
      ? particleColors
      : defaultColors;
    const renderer = new Renderer({ depth: false, alpha: true, antialias: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);
    // kvaliteet: mobiilis piirame DPR natuke, et FPS püsiks; desktop 2x
    renderer.dpr = Math.min(window.devicePixelRatio || 1, cfg.dprMax);
    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);
    const resize = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener("resize", resize, { passive: true });
    resize();
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    if (cfg.hover) container.addEventListener("mousemove", handleMouseMove);
    // --- atribuudid ---
    const count = cfg.count;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x, y, z, len;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      const picked = palette[Math.floor(Math.random() * palette.length)];
      const col = parseColor(picked);
      colors.set(col, i * 3);
    }
    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: cfg.spread },
        uBaseSize: { value: cfg.baseSize },
        uSizeRandomness: { value: cfg.randomness },
        uAlphaParticles: { value: (typeof alphaParticles === "boolean" ? alphaParticles : true) ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    });
    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    let raf, last = performance.now(), elapsed = 0;
    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      const dt = t - last; last = t;
      elapsed += dt * cfg.speed;
      program.uniforms.uTime.value = elapsed * 0.001;
      if (cfg.hover) {
        particles.position.x = -mouse.x * 1; // factor hoitakse 1, et liikumine pehme jääks
        particles.position.y = -mouse.y * 1;
      } else {
        particles.position.x = 0;
        particles.position.y = 0;
      }
      if (!disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * cfg.speed;
      }
      renderer.render({ scene: particles, camera });
    };
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("resize", resize);
      if (cfg.hover) container.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(raf);
      try { container.contains(gl.canvas) && container.removeChild(gl.canvas); } catch {}
    };
  }, [
    particleCount, particleSpread, speed,
    moveParticlesOnHover, particleHoverFactor,
    alphaParticles, particleBaseSize, sizeRandomness,
    cameraDistance, disableRotation, particleColors
  ]);
  return (
    <div
      ref={containerRef}
      className={`particles-container${className ? " " + className : ""}`}
    />
  );
};
export default Particles;
