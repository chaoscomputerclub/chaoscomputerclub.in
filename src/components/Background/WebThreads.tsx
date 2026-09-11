import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import "./WebThreads.css";

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const FAN_MODE: Record<string, number> = { center: 0, left: 1, right: 2 };

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uThreadCount;
uniform float uFrequency;
uniform float uSpread;
uniform float uTaper;
uniform float uPosition;
uniform float uFanMode;
uniform float uGlow;
uniform float uFalloff;
uniform float uThickness;
uniform float uBrightness;
uniform float uOpacity;
uniform float uMirror;
uniform float uShimmer;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uBackgroundColor;
uniform bool uLightMode;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uEnableMouse;
uniform float uMouseActive;
out vec4 fragColor;

#define TAU 6.28318530718
#define MAX_THREADS 10

float glow(float x, float str, float dist) {
  return dist / pow(max(x, 1e-4), str);
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  float n = max(uThreadCount, 1.0);
  float pinchX = uFanMode < 0.5 ? 0.5 : (uFanMode < 1.5 ? 0.0 : 1.0);
  if (uEnableMouse > 0.5) {
    pinchX = mix(pinchX, uMouse.x, clamp(uMouseStrength, 0.0, 1.0) * uMouseActive);
  }
  float spreadDx = uSpread * abs(uv.x - pinchX);
  float baseT = iTime * uSpeed;
  float tauOverN = TAU / n;
  float mirror = uMirror > 0.5 ? sign(pinchX - uv.x) : 1.0;
  bool doShimmer = uShimmer > 0.5;
  float shimmerT = iTime * 1.7;
  float invThickness = 1.0 / max(uThickness, 0.01);
  float xFreq = uv.x * uFrequency;
  float yOff = uv.y - uPosition;
  float ciScale = n > 1.0 ? 1.0 / (n - 1.0) : 0.0;
  vec3 col = vec3(0.0);
  float gsum = 0.0;
  for (int idx = 0; idx < MAX_THREADS; idx++) {
    float i = float(idx);
    if (i >= n) break;
    float amplitude = spreadDx * (1.0 + i * uTaper);
    float shimmer = doShimmer ? sin(shimmerT + i * 1.3) * 0.35 : 0.0;
    float phase = (baseT + i * tauOverN) * mirror + shimmer;
    float sdf = abs(yOff + sin(xFreq + phase) * amplitude) * invThickness;
    float g = glow(sdf, uFalloff, uGlow);
    float ci = i * ciScale;
    vec3 threadCol = mix(uColor1, uColor2, ci);
    col += g * threadCol;
    gsum += g;
  }
  float coreAmt = smoothstep(0.5, 2.2, gsum);
  col = mix(col, uColor3 * gsum, coreAmt * 0.5);
  float bright = uBrightness;
  if (uEnableMouse > 0.5) {
    vec2 md = uv - uMouse;
    float d2 = dot(md, md);
    bright += clamp(uMouseStrength, 0.0, 1.0) * uMouseActive * exp(-d2 * 6.0) * 0.6;
  }
  col *= bright;
  float alpha = clamp(gsum, 0.0, 1.0) * uOpacity;
  vec3 outRgb = col * alpha;
  if (uGrain > 0.5) {
    float gv = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453) - 0.5) * uGrainIntensity;
    outRgb = clamp(outRgb + gv, 0.0, 1.0);
    alpha = clamp(alpha + gv, 0.0, 1.0);
  }
  if (uLightMode) {
    vec3 mapped = vec3(1.0) - exp(-max(col, vec3(0.0)) * 1.3);
    float rawEnergy = clamp(max(mapped.r, max(mapped.g, mapped.b)) * uOpacity, 0.0, 1.0);
    float coverage = smoothstep(0.18, 0.72, rawEnergy);
    coverage *= coverage;
    vec3 hue = mapped / max(max(mapped.r, max(mapped.g, mapped.b)), 1e-4);
    vec3 chroma = pow(clamp(hue, 0.0, 1.0), vec3(0.78));
    vec3 pigment = mix(chroma, vec3(0.08), 0.12);
    vec3 ink = mix(vec3(0.9), pigment, 0.82 + coverage * 0.18);
    fragColor = vec4(mix(uBackgroundColor, ink, coverage), 1.0);
  } else {
    fragColor = vec4(outRgb, alpha);
  }
}
`;

interface UniformValue<T> {
  value: T;
}

type UniformMap = Record<
  string,
  UniformValue<Float32Array> | UniformValue<number> | UniformValue<boolean> | undefined
>;

interface WebThreadsContext {
  renderer: Renderer;
  program: Program;
  mesh: Mesh;
}

const ctxMap = new WeakMap<HTMLElement, WebThreadsContext>();

export interface WebThreadsProps {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  threadCount?: number;
  frequency?: number;
  spread?: number;
  taper?: number;
  position?: number;
  fanMode?: "center" | "left" | "right";
  glow?: number;
  falloff?: number;
  thickness?: number;
  brightness?: number;
  opacity?: number;
  mirror?: boolean;
  shimmer?: boolean;
  grain?: boolean;
  grainIntensity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  backgroundColor?: string;
  lightMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function WebThreads({
  color1 = "#5227FF",
  color2 = "#FF9FFC",
  color3 = "#FFFFFF",
  speed = 0.2,
  threadCount = 6,
  frequency = 5.0,
  spread = 0.18,
  taper = 1.0,
  position = 0.5,
  fanMode = "center",
  glow = 0.02,
  falloff = 0.6,
  thickness = 1.1,
  brightness = 0.6,
  opacity = 1.0,
  mirror = true,
  shimmer = false,
  grain = true,
  grainIntensity = 0.05,
  mouseInteraction = true,
  mouseStrength = 0.3,
  backgroundColor = "#FFFFFF",
  lightMode = false,
  className = "",
  style,
}: WebThreadsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ enabled: mouseInteraction, strength: mouseStrength });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
    } catch (e) {
      console.warn("WebThreads WebGL 2 initialization failed:", e);
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: speed },
        uThreadCount: { value: Math.round(threadCount) },
        uFrequency: { value: frequency },
        uSpread: { value: spread },
        uTaper: { value: taper },
        uPosition: { value: position },
        uFanMode: { value: FAN_MODE[fanMode] ?? 0 },
        uGlow: { value: glow },
        uFalloff: { value: falloff },
        uThickness: { value: thickness },
        uBrightness: { value: brightness },
        uOpacity: { value: opacity },
        uMirror: { value: mirror ? 1.0 : 0.0 },
        uShimmer: { value: shimmer ? 1.0 : 0.0 },
        uGrain: { value: grain ? 1.0 : 0.0 },
        uGrainIntensity: { value: grainIntensity },
        uColor1: { value: new Float32Array(hexToRgb(color1)) },
        uColor2: { value: new Float32Array(hexToRgb(color2)) },
        uColor3: { value: new Float32Array(hexToRgb(color3)) },
        uBackgroundColor: { value: new Float32Array(hexToRgb(backgroundColor)) },
        uLightMode: { value: lightMode },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseStrength: { value: mouseStrength },
        uEnableMouse: { value: mouseInteraction ? 1.0 : 0.0 },
        uMouseActive: { value: 0 },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    ctxMap.set(container, { renderer, program, mesh });

    const uniformsMap = program.uniforms as unknown as UniformMap;

    const setSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h);
      const res = uniformsMap["iResolution"]?.value;
      if (res instanceof Float32Array) {
        res[0] = gl.drawingBufferWidth;
        res[1] = gl.drawingBufferHeight;
      }
      renderer.render({ scene: mesh });
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    const currentMouse: [number, number] = [0.5, 0.5];
    const targetMouse: [number, number] = [0.5, 0.5];
    let currentActive = 0;
    let targetActive = 0;

    const onPointerMove = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const inside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (inside) {
        targetMouse[0] = (clientX - rect.left) / rect.width;
        targetMouse[1] = 1.0 - (clientY - rect.top) / rect.height;
        targetActive = 1;
      } else {
        targetActive = 0;
      }
    };

    const onCanvasMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse[0] = (e.clientX - rect.left) / rect.width;
      targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
      targetActive = 1;
    };

    const onWindowMouseMove = (e: MouseEvent) => {
      onPointerMove(e.clientX, e.clientY);
    };

    const onMouseEnter = () => {
      targetActive = 1;
    };

    const onMouseLeave = () => {
      targetActive = 0;
    };

    canvas.addEventListener("mousemove", onCanvasMouseMove);
    canvas.addEventListener("mouseenter", onMouseEnter);
    canvas.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mousemove", onWindowMouseMove, { passive: true });

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    const loop = (t: number) => {
      const timeUniform = uniformsMap["iTime"];
      if (timeUniform && typeof timeUniform.value === "number") {
        timeUniform.value = (t - t0) * 0.001;
      }

      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
      currentActive += 0.05 * (targetActive - currentActive);

      const mouseUniform = uniformsMap["uMouse"]?.value;
      if (mouseUniform instanceof Float32Array) {
        mouseUniform[0] = currentMouse[0];
        mouseUniform[1] = currentMouse[1];
      }

      const activeUniform = uniformsMap["uMouseActive"];
      if (activeUniform) {
        activeUniform.value = currentActive;
      }

      const enableUniform = uniformsMap["uEnableMouse"];
      if (enableUniform) {
        enableUniform.value = mouseRef.current.enabled ? 1.0 : 0.0;
      }

      const strengthUniform = uniformsMap["uMouseStrength"];
      if (strengthUniform) {
        strengthUniform.value = mouseRef.current.strength;
      }

      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };

    const tryStart = () => {
      if (isVisible && isPageVisible && raf === 0) {
        raf = requestAnimationFrame(loop);
      }
    };

    const tryStop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        isVisible = entry.isIntersecting;
        if (isVisible) {
          tryStart();
        } else {
          tryStop();
        }
      },
      { threshold: 0 },
    );
    io.observe(container);

    const onVisibility = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) {
        tryStart();
      } else {
        tryStop();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    tryStart();

    return () => {
      tryStop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("mousemove", onWindowMouseMove);
      canvas.removeEventListener("mousemove", onCanvasMouseMove);
      canvas.removeEventListener("mouseenter", onMouseEnter);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      ctxMap.delete(container);
      try {
        if (canvas.parentNode === container) {
          container.removeChild(canvas);
        }
      } catch {
        // Canvas removal cleanup
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = ctxMap.get(container);
    if (!ctx) return;
    const { program, renderer, mesh } = ctx;
    const u = program.uniforms as unknown as UniformMap;

    const uSpeed = u["uSpeed"];
    if (uSpeed) uSpeed.value = speed;
    const uThreadCount = u["uThreadCount"];
    if (uThreadCount) uThreadCount.value = Math.round(threadCount);
    const uFrequency = u["uFrequency"];
    if (uFrequency) uFrequency.value = frequency;
    const uSpread = u["uSpread"];
    if (uSpread) uSpread.value = spread;
    const uTaper = u["uTaper"];
    if (uTaper) uTaper.value = taper;
    const uPosition = u["uPosition"];
    if (uPosition) uPosition.value = position;
    const uFanMode = u["uFanMode"];
    if (uFanMode) uFanMode.value = FAN_MODE[fanMode] ?? 0;
    const uGlow = u["uGlow"];
    if (uGlow) uGlow.value = glow;
    const uFalloff = u["uFalloff"];
    if (uFalloff) uFalloff.value = falloff;
    const uThickness = u["uThickness"];
    if (uThickness) uThickness.value = thickness;
    const uBrightness = u["uBrightness"];
    if (uBrightness) uBrightness.value = brightness;
    const uOpacity = u["uOpacity"];
    if (uOpacity) uOpacity.value = opacity;
    const uMirror = u["uMirror"];
    if (uMirror) uMirror.value = mirror ? 1.0 : 0.0;
    const uShimmer = u["uShimmer"];
    if (uShimmer) uShimmer.value = shimmer ? 1.0 : 0.0;
    const uGrain = u["uGrain"];
    if (uGrain) uGrain.value = grain ? 1.0 : 0.0;
    const uGrainIntensity = u["uGrainIntensity"];
    if (uGrainIntensity) uGrainIntensity.value = grainIntensity;

    const c1 = u["uColor1"]?.value;
    if (c1 instanceof Float32Array) {
      const rgb1 = hexToRgb(color1);
      c1[0] = rgb1[0];
      c1[1] = rgb1[1];
      c1[2] = rgb1[2];
    }

    const c2 = u["uColor2"]?.value;
    if (c2 instanceof Float32Array) {
      const rgb2 = hexToRgb(color2);
      c2[0] = rgb2[0];
      c2[1] = rgb2[1];
      c2[2] = rgb2[2];
    }

    const c3 = u["uColor3"]?.value;
    if (c3 instanceof Float32Array) {
      const rgb3 = hexToRgb(color3);
      c3[0] = rgb3[0];
      c3[1] = rgb3[1];
      c3[2] = rgb3[2];
    }

    const bg = u["uBackgroundColor"]?.value;
    if (bg instanceof Float32Array) {
      const rgbBg = hexToRgb(backgroundColor);
      bg[0] = rgbBg[0];
      bg[1] = rgbBg[1];
      bg[2] = rgbBg[2];
    }

    const uLightMode = u["uLightMode"];
    if (uLightMode) uLightMode.value = lightMode;
    const uMouseStrength = u["uMouseStrength"];
    if (uMouseStrength) uMouseStrength.value = mouseStrength;
    const uEnableMouse = u["uEnableMouse"];
    if (uEnableMouse) uEnableMouse.value = mouseInteraction ? 1.0 : 0.0;
    mouseRef.current.enabled = mouseInteraction;
    mouseRef.current.strength = mouseStrength;

    renderer.render({ scene: mesh });
  }, [
    color1,
    color2,
    color3,
    speed,
    threadCount,
    frequency,
    spread,
    taper,
    position,
    fanMode,
    glow,
    falloff,
    thickness,
    brightness,
    opacity,
    mirror,
    shimmer,
    grain,
    grainIntensity,
    mouseInteraction,
    mouseStrength,
    backgroundColor,
    lightMode,
  ]);

  return (
    <div ref={containerRef} style={style} className={`web-threads-container ${className}`.trim()} />
  );
}

export default WebThreads;
