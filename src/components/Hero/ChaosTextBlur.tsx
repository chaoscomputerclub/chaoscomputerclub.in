/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/** 5x7 modular matrices for "CHAOS" */
const GLYPHS: Record<string, string[]> = {
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
};

const WORD = "CHAOS";
const U = 10;
const GAP = 1;

/**
 * Draws the high-res pixel-perfect modular "CHAOS" word onto an offscreen canvas
 */
function createChaosTextureCanvas(): { canvas: HTMLCanvasElement; totalW: number; totalH: number } {
  const canvas = document.createElement("canvas");
  const scale = 8; // 8x resolution for Retina crispness
  const uScaled = U * scale;
  const gapScaled = GAP * scale;
  const glyphW = 5 * (uScaled + gapScaled);
  const letterGap = uScaled * 1.4;
  const totalW = WORD.length * glyphW + (WORD.length - 1) * letterGap;
  const totalH = 7 * (uScaled + gapScaled);

  canvas.width = Math.ceil(totalW);
  canvas.height = Math.ceil(totalH);

  const ctx = canvas.getContext("2d");
  if (!ctx) return { canvas, totalW, totalH };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";

  WORD.split("").forEach((char, charIdx) => {
    const rows = GLYPHS[char] || [];
    const offset = charIdx * (glyphW + letterGap);

    rows.forEach((row, y) => {
      row.split("").forEach((val, x) => {
        if (val !== "1") return;
        const chamfer = (x + y + charIdx) % 4 === 0;
        const px = offset + x * (uScaled + gapScaled);
        const py = y * (uScaled + gapScaled);

        if (chamfer) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + uScaled - 3 * scale, py);
          ctx.lineTo(px + uScaled, py + 3 * scale);
          ctx.lineTo(px + uScaled, py + uScaled);
          ctx.lineTo(px, py + uScaled);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(px, py, uScaled, uScaled);
        }
      });
    });
  });

  return { canvas, totalW, totalH };
}

const vertexShader = /* glsl */ `
varying vec2 v_uv;
void main() {
  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
varying vec2 v_uv;

uniform sampler2D u_text;
uniform vec2      u_mouse;        // cursor in UV [0..1, 0..1]
uniform float     u_aspect;       // width / height
uniform float     u_hover;        // 0..1 smooth strength
uniform vec3      u_color;        // text base colour (#ffffff)
uniform vec3      u_accent;       // acid-lime (#CCFF00)

// ── Tuneable constants ─────────────────────────────────────────────────────
#define PIXEL_SIZE    0.018        // mosaic cell height in UV units
#define MAX_SCATTER   0.30         // maximum outward travel in UV
#define FIELD_RADIUS  0.55         // cursor influence radius
#define FIELD_EDGE    0.28         // falloff softness band

// ── Fast deterministic hash ────────────────────────────────────────────────
vec2 hash2(vec2 p) {
  p = vec2(
    fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453),
    fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453)
  );
  return p * 2.0 - 1.0;
}

void main() {
  // ── 1. Aspect-correct pixel grid ──────────────────────────────────────
  vec2 cellSize   = vec2(PIXEL_SIZE / u_aspect, PIXEL_SIZE);
  vec2 cellCoord  = floor(v_uv / cellSize);
  vec2 cellCenter = (cellCoord + 0.5) * cellSize;

  // ── 2. Per-cell variance ───────────────────────────────────────────────
  vec2 rand = hash2(cellCoord);

  // ── 3. Aspect-corrected distance to cursor ─────────────────────────────
  vec2 mouseUV = vec2(u_mouse.x, 1.0 - u_mouse.y);
  vec2 delta   = (cellCenter - mouseUV) * vec2(u_aspect, 1.0);
  float dist   = length(delta);

  // ── 4. Smooth cubic falloff field ─────────────────────────────────────
  float raw     = 1.0 - smoothstep(FIELD_RADIUS - FIELD_EDGE, FIELD_RADIUS + FIELD_EDGE, dist);
  float falloff = raw * raw * (3.0 - 2.0 * raw);
  float strength = falloff * u_hover;

  // ── 5. Scatter direction: outward + per-cell angular jitter ───────────
  vec2 outward = length(delta) > 0.001
    ? normalize(delta / vec2(u_aspect, 1.0))
    : normalize(rand);

  float rotAngle = rand.x * 0.30;          // organic ±17° deviation
  float rc = cos(rotAngle), rs = sin(rotAngle);
  vec2 scatterDir = vec2(outward.x * rc - outward.y * rs,
                         outward.x * rs + outward.y * rc);

  float scatterAmt = strength * MAX_SCATTER * (1.0 + rand.y * 0.22);

  // ── 6. Inverse-map: find where this fragment's colour originated ───────
  //   Pixels scatter AWAY from cursor, so the source is *behind* the scatter dir.
  vec2 srcCenter = clamp(
    cellCenter - scatterDir * scatterAmt,
    vec2(0.002), vec2(0.998)
  );

  // ── 7. Crisp pixelated sample (solid colour blocks, no sub-pixel blending) ──
  vec4 pix = texture2D(u_text, srcCenter);

  // ── 8. Travel fade: far-scattered pixels dissolve at their edges ────────
  float travelNorm = clamp(scatterAmt / MAX_SCATTER, 0.0, 1.0);
  float fadePower  = travelNorm * travelNorm;           // ease-in fade
  pix.a *= 1.0 - fadePower * 0.65;

  // ── 9. Acid-lime corona ring at the scatter boundary ───────────────────
  //   Peaks at mid-strength then fades as pixels disperse fully.
  float corona  = smoothstep(0.0, 0.45, strength) * (1.0 - smoothstep(0.45, 1.0, strength));
  vec3  accentG = u_accent * corona * 1.4 * pix.a;
  vec3  baseRgb = pix.rgb * u_color;
  vec3  finalRgb = baseRgb + accentG;

  // ── 10. Below threshold: sharp crisp unmodified text ───────────────────
  if (strength < 0.002) {
    vec4 orig = texture2D(u_text, cellCenter);
    gl_FragColor = vec4(orig.rgb * u_color, orig.a);
    return;
  }

  gl_FragColor = vec4(finalRgb, clamp(pix.a, 0.0, 1.0));
}
`;

export interface ChaosTextBlurProps {
  className?: string;
  isHovered?: boolean;
  color?: string;
  accentColor?: string;
}

export function ChaosTextBlur({
  className = "",
  isHovered = false,
  color = "#ffffff",
  accentColor = "#CCFF00",
}: ChaosTextBlurProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const hoverRef = useRef(0);
  const targetHoverRef = useRef(0);

  useEffect(() => {
    targetHoverRef.current = isHovered ? 1.0 : 0.0;
  }, [isHovered]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let active = true;
    let animationFrameId: number;
    let lastTime = performance.now() * 0.001;

    // Normalized mouse coordinates (0..1, 0..1)
    const vMouse = new THREE.Vector2(0.5, 0.5);
    const vMouseDamp = new THREE.Vector2(0.5, 0.5);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Create high-res text texture
    const { canvas: textCanvas } = createChaosTextureCanvas();
    const textTexture = new THREE.CanvasTexture(textCanvas);
    textTexture.minFilter = THREE.LinearFilter;
    textTexture.magFilter = THREE.LinearFilter;
    textTexture.generateMipmaps = true;

    const geo = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_text: { value: textTexture },
        u_mouse: { value: vMouseDamp },
        u_aspect: { value: 1.0 },
        u_hover: { value: 0.0 },
        u_color: { value: new THREE.Color(color) },
        u_accent: { value: new THREE.Color(accentColor) },
      },
      transparent: true,
      blending: THREE.NormalBlending,
    });
    materialRef.current = material;

    const quad = new THREE.Mesh(geo, material);
    scene.add(quad);

    const onPointerMove = (e: MouseEvent | PointerEvent) => {
      if (!mount) return;
      const rect = mount.getBoundingClientRect();
      const w = rect.width || 1;
      const h = rect.height || 1;
      // Clamp normalized coordinates with margin for smooth approach
      const nx = (e.clientX - rect.left) / w;
      const ny = (e.clientY - rect.top) / h;
      vMouse.set(nx, ny);
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const resize = () => {
      if (!active || !mount) return;
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      renderer.setSize(w, h);
      renderer.setPixelRatio(dpr);

      material.uniforms["u_aspect"]!.value = w / h;
    };

    resize();
    window.addEventListener("resize", resize);

    const ro = new ResizeObserver(() => {
      if (!active) return;
      resize();
    });
    ro.observe(mount);

    const update = () => {
      if (!active) return;
      const now = performance.now() * 0.001;
      const dt = Math.min(now - lastTime, 0.1);
      lastTime = now;

      // Silky inertia damping for mouse coordinates
      vMouseDamp.x = THREE.MathUtils.damp(vMouseDamp.x, vMouse.x, 10, dt);
      vMouseDamp.y = THREE.MathUtils.damp(vMouseDamp.y, vMouse.y, 10, dt);

      // Smooth damp hover factor
      hoverRef.current = THREE.MathUtils.damp(hoverRef.current, targetHoverRef.current, 5, dt);
      material.uniforms["u_hover"]!.value = hoverRef.current;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      ro.disconnect();
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("pointermove", onPointerMove);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      geo.dispose();
      textTexture.dispose();
      material.dispose();
      materialRef.current = null;
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);



  return (
    <div
      ref={mountRef}
      className={`w-full aspect-[331/77] select-none ${className}`}
      style={{ width: "100%", height: "auto" }}
    />
  );
}

export default ChaosTextBlur;
