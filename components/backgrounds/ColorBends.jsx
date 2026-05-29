import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import "./ColorBends.css";

const MAX_COLORS = 8;

function normalizeColorInput(value) {
  return typeof value === "string" ? value.trim() : "";
}

function colorToVec3(hex) {
  const clean = normalizeColorInput(hex).replace(/^#/, "");
  if (!clean) return new THREE.Vector3(0, 0, 0);

  const expanded =
    clean.length === 3
      ? clean
          .split("")
          .map(channel => channel + channel)
          .join("")
      : clean;
  if (expanded.length < 6) return new THREE.Vector3(0, 0, 0);

  const value =
    expanded.length === 6
      ? [
          Number.parseInt(expanded.slice(0, 2), 16),
          Number.parseInt(expanded.slice(2, 4), 16),
          Number.parseInt(expanded.slice(4, 6), 16)
        ]
      : [0, 0, 0];
  if (value.some(channel => Number.isNaN(channel))) {
    return new THREE.Vector3(0, 0, 0);
  }

  return new THREE.Vector3(value[0] / 255, value[1] / 255, value[2] / 255);
}

function applyColorUniforms(material, colors) {
  const palette = (Array.isArray(colors) ? colors : [])
    .map(normalizeColorInput)
    .filter(Boolean)
    .slice(0, MAX_COLORS)
    .map(colorToVec3);
  for (let index = 0; index < MAX_COLORS; index++) {
    const colorVector = material.uniforms.uColors.value[index];
    if (index < palette.length) {
      colorVector.copy(palette[index]);
    } else {
      colorVector.set(0, 0, 0);
    }
  }

  material.uniforms.uColorCount.value = palette.length;
}

function isLikelyLowSpecDevice() {
  if (typeof navigator === "undefined") return false;

  const cores = navigator.hardwareConcurrency || 8;
  const memory = typeof navigator.deviceMemory === "number" ? navigator.deviceMemory : 8;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  return cores <= 4 || memory <= 4 || !!connection?.saveData;
}

function resolveRenderDpr(width, height, maxDpr) {
  const area = Math.max(1, width * height);
  const deviceDpr = window.devicePixelRatio || 1;
  const lowSpec = isLikelyLowSpecDevice();
  let cap = lowSpec ? 1 : 1.75;

  if (area >= 2560 * 1440) {
    cap = Math.min(cap, 1);
  } else if (area >= 1920 * 1080) {
    cap = Math.min(cap, lowSpec ? 1 : 1.2);
  } else if (area >= 1600 * 900) {
    cap = Math.min(cap, lowSpec ? 1 : 1.35);
  } else if (area >= 1280 * 720) {
    cap = Math.min(cap, lowSpec ? 1 : 1.5);
  }

  return Math.min(deviceDpr, maxDpr, cap);
}

const frag = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform float uPhase;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uScrollOffset;
uniform float uNoise;
varying vec2 vUv;

float resolveMonoChannel(vec2 baseQ, float t, float channelOffset) {
  vec2 s = baseQ;
  s -= 0.01 * (channelOffset + 1.0);
  vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
  float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + channelOffset) / 4.0);
  float kBelow = clamp(uWarpStrength, 0.0, 1.0);
  float kMix = pow(kBelow, 0.3);
  float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
  vec2 disp = (r - s) * kBelow;
  vec2 warped = s + disp * gain;
  float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + channelOffset) / 4.0);
  float m = mix(m0, m1, kMix);
  return 1.0 - exp(-6.0 / exp(6.0 * m));
}

void main() {
  float t = uPhase + (uTime * uSpeed);
  vec2 p = vUv * 2.0 - 1.0;
  p.y += uScrollOffset;
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
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float m = mix(m0, m1, kMix);
      float w = 1.0 - exp(-6.0 / exp(6.0 * m));
      sumCol += uColors[i] * w;
      cover = max(cover, w);
    }
    col = clamp(sumCol, 0.0, 1.0);
    a = uTransparent > 0 ? cover : 1.0;
  } else {
    col.r = resolveMonoChannel(q, t, 0.0);
    col.g = resolveMonoChannel(q, t, 1.0);
    col.b = resolveMonoChannel(q, t, 2.0);
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
  className = "",
  style,
  rotation = 45,
  speed = 0.2,
  phase = 0,
  colors = [],
  transparent = true,
  autoRotate = 0,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 1,
  parallax = 0.5,
  scrollParallax = 0,
  scrollParallaxMax = 0.55,
  scrollContainerSelector = "",
  noise = 0.1,
  maxDpr = 2,
  powerPreference = "high-performance",
  paused = false
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const rafRef = useRef(null);
  const materialRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const cleanupPointerRef = useRef(() => {});
  const renderStillRef = useRef(() => {});
  const syncPlaybackRef = useRef(() => {});
  const rotationRef = useRef(rotation);
  const autoRotateRef = useRef(autoRotate);
  const speedRef = useRef(speed);
  const phaseRef = useRef(phase);
  const scaleRef = useRef(scale);
  const frequencyRef = useRef(frequency);
  const warpStrengthRef = useRef(warpStrength);
  const noiseRef = useRef(noise);
  const pointerTargetRef = useRef(new THREE.Vector2(0, 0));
  const pointerCurrentRef = useRef(new THREE.Vector2(0, 0));
  const animationEnabledRef = useRef(true);
  const visibleRef = useRef(true);
  const pausedRef = useRef(paused);
  const interactiveRef = useRef(false);
  const elapsedRef = useRef(0);
  const colorsRef = useRef(colors);
  const renderFailedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    renderFailedRef.current = false;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    sceneRef.current = scene;
    cameraRef.current = camera;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const uColorsArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0));
    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uCanvas: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uSpeed: { value: speedRef.current },
        uPhase: { value: phaseRef.current },
        uRot: { value: new THREE.Vector2(1, 0) },
        uColorCount: { value: 0 },
        uColors: { value: uColorsArray },
        uTransparent: { value: transparent ? 1 : 0 },
        uScale: { value: scaleRef.current },
        uFrequency: { value: frequencyRef.current },
        uWarpStrength: { value: warpStrengthRef.current },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: mouseInfluence },
        uParallax: { value: parallax },
        uScrollOffset: { value: 0 },
        uNoise: { value: noiseRef.current }
      },
      premultipliedAlpha: true,
      transparent: true
    });
    materialRef.current = material;
    applyColorUniforms(material, colorsRef.current);

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference,
      alpha: true
    });
    rendererRef.current = renderer;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, transparent ? 0 : 1);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const disableRenderer = error => {
      if (renderFailedRef.current) return;
      renderFailedRef.current = true;
      rendererRef.current = null;
      materialRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      console.warn("ColorBends disabled after a WebGL renderer failure.", error);
      try {
        geometry.dispose();
      } catch {}
      try {
        material.dispose();
      } catch {}
      try {
        renderer.dispose();
      } catch {}
      try {
        renderer.forceContextLoss();
      } catch {}
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };

    try {
      renderer.compile(scene, camera);
    } catch (error) {
      disableRenderer(error);
      return () => {};
    }

    const updatePlaybackMode = () => {
      const motionActive = speedRef.current !== 0 || autoRotateRef.current !== 0;
      animationEnabledRef.current = motionActive || interactiveRef.current;
    };

    const updateRotation = elapsed => {
      const deg = (rotationRef.current % 360) + autoRotateRef.current * elapsed;
      const rad = (deg * Math.PI) / 180;
      material.uniforms.uRot.value.set(Math.cos(rad), Math.sin(rad));
    };

    const renderFrame = elapsed => {
      if (renderFailedRef.current) return;
      elapsedRef.current = elapsed;
      material.uniforms.uTime.value = elapsed;
      updateRotation(elapsed);

      if (interactiveRef.current) {
        pointerCurrentRef.current.lerp(pointerTargetRef.current, 0.12);
        material.uniforms.uPointer.value.copy(pointerCurrentRef.current);
      }

      try {
        renderer.render(scene, camera);
      } catch (error) {
        disableRenderer(error);
      }
    };

    renderStillRef.current = () => {
      if (document.hidden || renderFailedRef.current) return;
      renderFrame(elapsedRef.current);
    };

    const handleResize = () => {
      if (renderFailedRef.current) return;
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setPixelRatio(resolveRenderDpr(width, height, maxDpr));
      renderer.setSize(width, height, false);
      material.uniforms.uCanvas.value.set(width, height);
      renderStillRef.current();
    };

    handleResize();

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(handleResize);
      observer.observe(container);
      resizeObserverRef.current = observer;
    } else {
      window.addEventListener("resize", handleResize);
    }

    let lastTime = 0;
    let elapsed = 0;
    const loop = now => {
      if (pausedRef.current || !visibleRef.current) {
        rafRef.current = null;
        lastTime = 0;
        return;
      }
      const last = lastTime || now;
      const dt = Math.max(0, (now - last) / 1000);
      lastTime = now;

      if (speedRef.current !== 0 || autoRotateRef.current !== 0) {
        elapsed += dt;
      }

      renderFrame(elapsed);
      rafRef.current = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTime = 0;
    };

    const startLoop = () => {
      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(loop);
    };

    syncPlaybackRef.current = () => {
      updatePlaybackMode();

      if (pausedRef.current) {
        stopLoop();
      } else if (animationEnabledRef.current && visibleRef.current) {
        startLoop();
      } else {
        stopLoop();
        renderStillRef.current();
      }
    };

    const pointerEnabled = mouseInfluence !== 0 || parallax !== 0;
    interactiveRef.current = pointerEnabled;
    if (pointerEnabled) {
      let rect = container.getBoundingClientRect();
      const refreshRect = () => {
        rect = container.getBoundingClientRect();
      };

      const onPointerMove = event => {
        const x = (event.clientX - rect.left) / (rect.width || 1) * 2 - 1;
        const y = -((event.clientY - rect.top) / (rect.height || 1) * 2 - 1);
        pointerTargetRef.current.set(x, y);
        syncPlaybackRef.current();
      };

      const pointerResizeObserver = new ResizeObserver(refreshRect);
      pointerResizeObserver.observe(container);
      container.addEventListener("pointermove", onPointerMove, { passive: true });

      cleanupPointerRef.current = () => {
        pointerResizeObserver.disconnect();
        container.removeEventListener("pointermove", onPointerMove);
      };
    } else {
      cleanupPointerRef.current = () => {};
      pointerTargetRef.current.set(0, 0);
      pointerCurrentRef.current.set(0, 0);
      material.uniforms.uPointer.value.set(0, 0);
    }

    const onVisibilityChange = () => {
      visibleRef.current = !document.hidden;
      syncPlaybackRef.current();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    updatePlaybackMode();
    syncPlaybackRef.current();

    return () => {
      renderFailedRef.current = true;
      rendererRef.current = null;
      materialRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      cleanupPointerRef.current();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      } else {
        window.removeEventListener("resize", handleResize);
      }
      try {
        geometry.dispose();
      } catch {}
      try {
        material.dispose();
      } catch {}
      try {
        renderer.dispose();
      } catch {}
      try {
        renderer.forceContextLoss();
      } catch {}
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [maxDpr, mouseInfluence, parallax, powerPreference, transparent]);

  useEffect(() => {
    pausedRef.current = paused;
    syncPlaybackRef.current();
  }, [paused]);

  useEffect(() => {
    const material = materialRef.current;
    const container = containerRef.current;
    if (!material || !container || typeof window === "undefined") return;

    const strength = Number(scrollParallax) || 0;
    const maxOffset = Math.max(0, Number(scrollParallaxMax) || 0);
    const uniform = material.uniforms.uScrollOffset;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

    if (strength === 0 || maxOffset === 0) {
      uniform.value = 0;
      if (rafRef.current == null) renderStillRef.current();
      return;
    }

    let raf = 0;
    let scrollEl = null;
    const getScrollEl = () => {
      if (!scrollContainerSelector) return null;
      const found = document.querySelector(scrollContainerSelector);
      return found instanceof HTMLElement ? found : null;
    };
    const readScrollY = () => {
      scrollEl = getScrollEl();
      const scrollElIsScrollable =
        scrollEl && scrollEl.scrollHeight > scrollEl.clientHeight + 1;
      if (scrollElIsScrollable) {
        return scrollEl.scrollTop;
      }
      return (
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body?.scrollTop ||
        0
      );
    };
    const update = () => {
      raf = 0;
      const height = window.innerHeight || container.clientHeight || 1;
      uniform.value = clamp((readScrollY() / height) * strength, -maxOffset, maxOffset);
      if (rafRef.current == null) renderStillRef.current();
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    scrollEl = getScrollEl();
    if (scrollEl) {
      scrollEl.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", onScroll);
    window.visualViewport?.addEventListener("resize", onScroll);

    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.visualViewport?.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [scrollParallax, scrollParallaxMax, scrollContainerSelector]);

  useLayoutEffect(() => {
    const material = materialRef.current;
    const renderer = rendererRef.current;
    if (!material) return;

    rotationRef.current = rotation;
    autoRotateRef.current = autoRotate;
    speedRef.current = speed;
    phaseRef.current = phase;
    scaleRef.current = scale;
    frequencyRef.current = frequency;
    warpStrengthRef.current = warpStrength;
    noiseRef.current = noise;

    material.uniforms.uSpeed.value = speed;
    material.uniforms.uPhase.value = phase;
    material.uniforms.uScale.value = scale;
    material.uniforms.uFrequency.value = frequency;
    material.uniforms.uWarpStrength.value = warpStrength;
    material.uniforms.uMouseInfluence.value = mouseInfluence;
    material.uniforms.uParallax.value = parallax;
    material.uniforms.uNoise.value = noise;
    material.uniforms.uTransparent.value = transparent ? 1 : 0;

    colorsRef.current = colors;
    applyColorUniforms(material, colors);

    if (renderer) {
      renderer.setClearColor(0x000000, transparent ? 0 : 1);
    }

    syncPlaybackRef.current();
  }, [
    rotation,
    autoRotate,
    speed,
    phase,
    scale,
    frequency,
    warpStrength,
    mouseInfluence,
    parallax,
    noise,
    colors,
    transparent
  ]);

  return (
    <div
      ref={containerRef}
      className={`color-bends-container ${typeof className === "string" ? className : ""}`.trim()}
      style={style}
    />
  );
}
