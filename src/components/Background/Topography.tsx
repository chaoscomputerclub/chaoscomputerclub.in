/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import "./Topography.css";

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
};

const colorModeToFloat = (mode: string): number => {
  if (mode === "uniform") return 1.0;
  if (mode === "alternating") return 2.0;
  return 0.0;
};

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
uniform float uMorphAmount;
uniform float uBands;
uniform float uThickness;
uniform float uScale;
uniform float uPixelSize;
uniform float uGlow;
uniform float uColorMode;
uniform float uContrast;
uniform float uBrightness;
uniform float uFillBands;
uniform float uOpacity;
uniform float uLightMode;
uniform vec3 uLow;
uniform vec3 uMid;
uniform vec3 uHigh;
uniform vec2 uMouse;
uniform float uMouseEnabled;
uniform float uMouseRadius;
uniform float uMouseStrength;
uniform float uMouseActive;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec4 uCtrlA;
uniform vec4 uCtrlB;
uniform vec4 uCtrlC;
uniform vec4 uCtrlD;
out vec4 fragColor;

float bez(float t, vec4 c) {
  float w = 6.2831853 * t;
  return 0.5 * (c.x * sin(w) + c.y * cos(w) + c.z * sin(2.0 * w) + c.w * cos(2.0 * w));
}

float field(vec2 uv) {
  vec2 a = vec2(bez(uv.x, uCtrlA), bez(uv.x, uCtrlB));
  vec2 b = vec2(bez(uv.y, uCtrlC), bez(uv.y, uCtrlD));
  return distance(a, b);
}

vec3 elevationColor(float e) {
  vec3 c = mix(uLow, uMid, smoothstep(0.0, 0.5, e));
  c = mix(c, uHigh, smoothstep(0.5, 1.0, e));
  return c;
}

void main() {
  vec2 res = iResolution.xy;
  vec2 uv = gl_FragCoord.xy / res;
  vec2 suv = (uv - 0.5) / max(uScale, 0.001) + 0.5;
  vec2 sampleUv = suv;
  if (uPixelSize > 1.0) {
    vec2 px = res / uPixelSize;
    sampleUv = (floor(suv * px) + 0.5) / px;
  }
  float fv = field(sampleUv);
  if (uMouseEnabled > 0.5) {
    vec2 d = uv - uMouse;
    d.x *= res.x / max(res.y, 1.0);
    float r = max(uMouseRadius, 0.001);
    float bump = exp(-dot(d, d) / (r * r)) * uMouseStrength * uMouseActive;
    fv += bump;
  }
  float f = fv * uBands;
  float frac = fract(f);
  float lineDist = min(frac, 1.0 - frac);
  float aa = fwidth(f) + 0.0001;
  float mask = 1.0 - smoothstep(uThickness - aa, uThickness + aa, lineDist);
  float glowR = uThickness + uGlow * 0.5 + aa;
  float glow = (1.0 - smoothstep(uThickness, glowR, lineDist)) * step(0.0001, uGlow);
  float elev = clamp(fv / (uMorphAmount * 2.5 + 0.001), 0.0, 1.0);
  vec3 lineCol;
  if (uColorMode < 0.5) {
    lineCol = elevationColor(elev);
  } else if (uColorMode < 1.5) {
    lineCol = uMid;
  } else {
    float parity = mod(floor(f), 2.0);
    lineCol = mix(uMid, uHigh, parity);
  }
  float coverage = clamp(mask + glow * 0.55, 0.0, 1.0);
  coverage = pow(coverage, max(uContrast, 0.001));
  vec3 outColor = lineCol;
  float outAlpha = coverage;
  if (uFillBands > 0.5) {
    vec3 fillCol = elevationColor(elev);
    float fillA = 0.1 * elev;
    outColor = mix(fillCol, lineCol, coverage);
    outAlpha = clamp(coverage + fillA, 0.0, 1.0);
  }
  if (uGrain > 0.5) {
    float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + iTime) * 43758.5453);
    outAlpha += (g - 0.5) * uGrainIntensity;
  }
  outColor *= uBrightness;
  outColor = clamp(outColor, 0.0, 1.0);
  float a = clamp(outAlpha, 0.0, 1.0) * uOpacity;
  if (uLightMode > 0.5) {
    float peak = max(outColor.r, max(outColor.g, outColor.b));
    vec3 chroma = pow(clamp(outColor / max(peak, 0.0001), 0.0, 1.0), vec3(1.18));
    fragColor = vec4(mix(vec3(1.0), chroma, a * 0.94), 1.0);
  } else {
    fragColor = vec4(outColor * a, a);
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

interface TopographyContext {
  renderer: Renderer;
  program: Program;
  mesh: Mesh;
}

const ctxMap = new WeakMap<HTMLElement, TopographyContext>();

const CTRL_INDICES = [
  [1, -2, 3, -4],
  [9, -8, 7, -6],
  [5, 2, 5, -5],
  [-1, -3, 8, 9],
];

export interface TopographyProps {
  lowColor?: string;
  midColor?: string;
  highColor?: string;
  speed?: number;
  morphAmount?: number;
  morphSpeed?: number;
  bands?: number;
  thickness?: number;
  scale?: number;
  pixelSize?: number;
  glow?: number;
  colorMode?: "elevation" | "uniform" | "alternating";
  contrast?: number;
  brightness?: number;
  fillBands?: boolean;
  opacity?: number;
  grain?: boolean;
  grainIntensity?: number;
  mouseInteraction?: boolean;
  mouseRadius?: number;
  mouseStrength?: number;
  lightMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Topography({
  lowColor = "#ffffff",
  midColor = "#CCFF00",
  highColor = "#ffffff",
  speed = 0.35,
  morphAmount = 1.2,
  morphSpeed = 0.05,
  bands = 3.0,
  thickness = 0.01,
  scale = 2.0,
  pixelSize = 1.0,
  glow = 0.15,
  colorMode = "alternating",
  contrast = 3.0,
  brightness = 1.1,
  fillBands = false,
  opacity = 1.0,
  grain = true,
  grainIntensity = 0.05,
  mouseInteraction = true,
  mouseRadius = 0.3,
  mouseStrength = 0.4,
  lightMode = false,
  className = "",
  style,
}: TopographyProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

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
      console.warn("Topography WebGL 2 initialization failed:", e);
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
        uMorphAmount: { value: morphAmount },
        uMorphSpeed: { value: morphSpeed },
        uBands: { value: bands },
        uThickness: { value: thickness },
        uScale: { value: scale },
        uPixelSize: { value: pixelSize },
        uGlow: { value: glow },
        uColorMode: { value: colorModeToFloat(colorMode) },
        uContrast: { value: contrast },
        uBrightness: { value: brightness },
        uFillBands: { value: fillBands ? 1.0 : 0.0 },
        uOpacity: { value: opacity },
        uLightMode: { value: lightMode ? 1.0 : 0.0 },
        uGrain: { value: grain ? 1.0 : 0.0 },
        uGrainIntensity: { value: grainIntensity },
        uLow: { value: new Float32Array(hexToRgb(lowColor)) },
        uMid: { value: new Float32Array(hexToRgb(midColor)) },
        uHigh: { value: new Float32Array(hexToRgb(highColor)) },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseEnabled: { value: mouseInteraction ? 1.0 : 0.0 },
        uMouseRadius: { value: mouseRadius },
        uMouseStrength: { value: mouseStrength },
        uMouseActive: { value: 0.0 },
        uCtrlA: { value: new Float32Array([0, 0, 0, 0]) },
        uCtrlB: { value: new Float32Array([0, 0, 0, 0]) },
        uCtrlC: { value: new Float32Array([0, 0, 0, 0]) },
        uCtrlD: { value: new Float32Array([0, 0, 0, 0]) },
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
    let mouseActive = 0;
    let mouseActiveTarget = 0;

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
        mouseActiveTarget = 1;
      } else {
        mouseActiveTarget = 0;
      }
    };

    const onCanvasMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse[0] = (e.clientX - rect.left) / rect.width;
      targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
      mouseActiveTarget = 1;
    };

    const onWindowMouseMove = (e: MouseEvent) => {
      onPointerMove(e.clientX, e.clientY);
    };

    const onMouseLeave = () => {
      mouseActiveTarget = 0;
    };

    canvas.addEventListener("mousemove", onCanvasMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mousemove", onWindowMouseMove, { passive: true });

    const ctrlArrays = [
      (uniformsMap["uCtrlA"]?.value as Float32Array) ?? new Float32Array(4),
      (uniformsMap["uCtrlB"]?.value as Float32Array) ?? new Float32Array(4),
      (uniformsMap["uCtrlC"]?.value as Float32Array) ?? new Float32Array(4),
      (uniformsMap["uCtrlD"]?.value as Float32Array) ?? new Float32Array(4),
    ];

    let raf = 0;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const t0 = performance.now();

    const loop = (t: number) => {
      const time = (t - t0) * 0.001;
      const timeUniform = uniformsMap["iTime"];
      if (timeUniform && typeof timeUniform.value === "number") {
        timeUniform.value = time;
      }

      const ma = (uniformsMap["uMorphAmount"]?.value as number) ?? 1.2;
      const sp = (uniformsMap["uSpeed"]?.value as number) ?? 0.35;
      const msp = (uniformsMap["uMorphSpeed"]?.value as number) ?? 0.05;

      for (let g = 0; g < 4; g++) {
        const arr = ctrlArrays[g];
        const idx = CTRL_INDICES[g];
        if (arr && idx) {
          for (let j = 0; j < 4; j++) {
            const i = idx[j] ?? 0;
            arr[j] = ma * Math.sin(time * sp * Math.sin(i * msp) + i);
          }
        }
      }

      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);

      const mouseUniform = uniformsMap["uMouse"]?.value;
      if (mouseUniform instanceof Float32Array) {
        mouseUniform[0] = currentMouse[0];
        mouseUniform[1] = currentMouse[1];
      }

      mouseActive += 0.05 * (mouseActiveTarget - mouseActive);
      const mouseActiveUniform = uniformsMap["uMouseActive"];
      if (mouseActiveUniform) {
        mouseActiveUniform.value = mouseActive;
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
      canvas.removeEventListener("mouseleave", onMouseLeave);
      ctxMap.delete(container);
      try {
        if (canvas.parentNode === container) {
          container.removeChild(canvas);
        }
      } catch {
        // Cleanup canvas
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
    const uMorphAmount = u["uMorphAmount"];
    if (uMorphAmount) uMorphAmount.value = morphAmount;
    const uMorphSpeed = u["uMorphSpeed"];
    if (uMorphSpeed) uMorphSpeed.value = morphSpeed;
    const uBands = u["uBands"];
    if (uBands) uBands.value = bands;
    const uThickness = u["uThickness"];
    if (uThickness) uThickness.value = thickness;
    const uScale = u["uScale"];
    if (uScale) uScale.value = scale;
    const uPixelSize = u["uPixelSize"];
    if (uPixelSize) uPixelSize.value = pixelSize;
    const uGlow = u["uGlow"];
    if (uGlow) uGlow.value = glow;
    const uColorMode = u["uColorMode"];
    if (uColorMode) uColorMode.value = colorModeToFloat(colorMode);
    const uContrast = u["uContrast"];
    if (uContrast) uContrast.value = contrast;
    const uBrightness = u["uBrightness"];
    if (uBrightness) uBrightness.value = brightness;
    const uFillBands = u["uFillBands"];
    if (uFillBands) uFillBands.value = fillBands ? 1.0 : 0.0;
    const uOpacity = u["uOpacity"];
    if (uOpacity) uOpacity.value = opacity;
    const uLightMode = u["uLightMode"];
    if (uLightMode) uLightMode.value = lightMode ? 1.0 : 0.0;
    const uGrain = u["uGrain"];
    if (uGrain) uGrain.value = grain ? 1.0 : 0.0;
    const uGrainIntensity = u["uGrainIntensity"];
    if (uGrainIntensity) uGrainIntensity.value = grainIntensity;

    const low = u["uLow"]?.value;
    if (low instanceof Float32Array) {
      const rgb = hexToRgb(lowColor);
      low[0] = rgb[0];
      low[1] = rgb[1];
      low[2] = rgb[2];
    }

    const mid = u["uMid"]?.value;
    if (mid instanceof Float32Array) {
      const rgb = hexToRgb(midColor);
      mid[0] = rgb[0];
      mid[1] = rgb[1];
      mid[2] = rgb[2];
    }

    const high = u["uHigh"]?.value;
    if (high instanceof Float32Array) {
      const rgb = hexToRgb(highColor);
      high[0] = rgb[0];
      high[1] = rgb[1];
      high[2] = rgb[2];
    }

    const uMouseEnabled = u["uMouseEnabled"];
    if (uMouseEnabled) uMouseEnabled.value = mouseInteraction ? 1.0 : 0.0;
    const uMouseRadius = u["uMouseRadius"];
    if (uMouseRadius) uMouseRadius.value = mouseRadius;
    const uMouseStrength = u["uMouseStrength"];
    if (uMouseStrength) uMouseStrength.value = mouseStrength;

    renderer.render({ scene: mesh });
  }, [
    lowColor,
    midColor,
    highColor,
    speed,
    morphAmount,
    morphSpeed,
    bands,
    thickness,
    scale,
    pixelSize,
    glow,
    colorMode,
    contrast,
    brightness,
    fillBands,
    opacity,
    grain,
    grainIntensity,
    mouseInteraction,
    mouseRadius,
    mouseStrength,
    lightMode,
  ]);

  return (
    <div ref={containerRef} style={style} className={`topography-container ${className}`.trim()} />
  );
}

export default Topography;
