import React, { useRef, useEffect, useCallback, FC } from "react";

export interface MouseControls {
  enabled?: boolean;
  radius?: number;
  strength?: number;
}

export interface ParticleTextProps {
  text?: string;
  className?: string;
  colors?: string[];
  particleSize?: number;
  particleGap?: number;
  mouseControls?: MouseControls;
  backgroundColor?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  friction?: number;
  ease?: number;
  autoFit?: boolean;
  modular?: boolean;
}

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

/** 5x7 modular matrices — each glyph is assembled from geometric computer pixel blocks */
const GLYPHS: Record<string, string[]> = {
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
};

export const ParticleText: FC<ParticleTextProps> = ({
  text = "CHAOS",
  className = "",
  colors = ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#CCFF00"],
  particleSize = 2.4,
  particleGap = 0.6,
  mouseControls = { enabled: true, radius: 160, strength: 5.5 },
  backgroundColor = "transparent",
  fontFamily = "modular",
  fontSize = 200,
  fontWeight = "bold",
  friction = 0.8,
  ease = 0.07,
  autoFit = true,
  modular,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; isActive: boolean }>({
    x: -9999,
    y: -9999,
    isActive: false,
  });
  const rafRef = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const dprRef = useRef<number>(1);
  const calculatedFontSizeRef = useRef<number>(fontSize);

  // Auto-fit binary search for standard typography
  const calculateFontSize = useCallback(
    (ctx: CanvasRenderingContext2D, str: string, width: number, height: number): number => {
      const dpr = dprRef.current;
      const padding = 20 * dpr;
      const availW = Math.max(10, width - 2 * padding);
      const availH = Math.max(10, height - 2 * padding);
      let minSize = 10 * dpr;
      let maxSize = fontSize * dpr;
      let bestSize = minSize;

      while (minSize <= maxSize) {
        const mid = Math.floor((minSize + maxSize) / 2);
        ctx.font = `${fontWeight} ${mid}px ${fontFamily}`;
        const measured = ctx.measureText(str).width;
        if (measured <= availW && mid <= availH) {
          bestSize = mid;
          minSize = mid + 1;
        } else {
          maxSize = mid - 1;
        }
      }
      return bestSize / dpr;
    },
    [fontSize, fontWeight, fontFamily]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const useModular = modular !== undefined ? modular : fontFamily === "modular" || text === "CHAOS";

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;

      const clientW = container.clientWidth || 300;
      const clientH = container.clientHeight || 100;

      canvas.width = Math.floor(clientW * dpr);
      canvas.height = Math.floor(clientH * dpr);
      canvas.style.width = `${clientW}px`;
      canvas.style.height = `${clientH}px`;

      const offscreen = document.createElement("canvas");
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!offCtx) return;

      offCtx.clearRect(0, 0, offscreen.width, offscreen.height);

      if (useModular && text.toUpperCase() === "CHAOS") {
        // Exact original 5x7 modular computer pixel matrix font
        const U = 10;
        const GAP = 1;
        const WORD = "CHAOS";
        const glyphW = 5 * (U + GAP);
        const letterGap = U * 1.4;
        const totalW = WORD.length * glyphW + (WORD.length - 1) * letterGap; // 331
        const totalH = 7 * (U + GAP); // 77

        // Exact 100% scale without artificial padding so font size matches original SVG exactly
        const scale = Math.min(canvas.width / totalW, canvas.height / totalH);

        const renderedW = totalW * scale;
        const renderedH = totalH * scale;
        const startX = (canvas.width - renderedW) / 2;
        const startY = (canvas.height - renderedH) / 2;

        const uScaled = U * scale;
        const gapScaled = GAP * scale;
        const glyphWScaled = 5 * (uScaled + gapScaled);
        const letterGapScaled = uScaled * 1.4;

        offCtx.fillStyle = "#ffffff";

        WORD.split("").forEach((char, charIdx) => {
          const rows = GLYPHS[char] || [];
          const offset = startX + charIdx * (glyphWScaled + letterGapScaled);

          rows.forEach((row, y) => {
            row.split("").forEach((val, x) => {
              if (val !== "1") return;
              const chamfer = (x + y + charIdx) % 4 === 0;
              const px = offset + x * (uScaled + gapScaled);
              const py = startY + y * (uScaled + gapScaled);

              if (chamfer) {
                const cut = 3 * scale;
                offCtx.beginPath();
                offCtx.moveTo(px, py);
                offCtx.lineTo(px + uScaled - cut, py);
                offCtx.lineTo(px + uScaled, py + cut);
                offCtx.lineTo(px + uScaled, py + uScaled);
                offCtx.lineTo(px, py + uScaled);
                offCtx.closePath();
                offCtx.fill();
              } else {
                offCtx.fillRect(px, py, uScaled, uScaled);
              }
            });
          });
        });
      } else {
        // Standard typography rendering
        let finalSize = fontSize;
        if (autoFit) {
          finalSize = calculateFontSize(offCtx, text, canvas.width, canvas.height);
        }
        calculatedFontSizeRef.current = finalSize;
        const scaledSize = finalSize * dpr;

        offCtx.font = `${fontWeight} ${scaledSize}px ${fontFamily}`;
        offCtx.textAlign = "center";
        offCtx.textBaseline = "middle";
        offCtx.fillStyle = "#ffffff";
        offCtx.fillText(text, canvas.width / 2, canvas.height / 2);
      }

      // Sample pixels into crisp computer pixel particles
      const imgData = offCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      const particles: Particle[] = [];
      const step = Math.max(1, Math.floor((particleSize + particleGap) * dpr));

      for (let row = 0; row < canvas.height; row += step) {
        for (let col = 0; col < canvas.width; col += step) {
          const alphaIdx = (row * canvas.width + col) * 4 + 3;
          const alpha = imgData[alphaIdx] ?? 0;
          if (alpha > 120) {
            const pickedColor = colors[Math.floor(Math.random() * colors.length)] || "#ffffff";
            // No initial blast — starts completely settled at rest, animates only on hover
            particles.push({
              x: col,
              y: row,
              originX: col,
              originY: row,
              vx: 0,
              vy: 0,
              color: pickedColor,
              size: particleSize * dpr,
            });
          }
        }
      }
      particlesRef.current = particles;
    };

    init();

    // High performance animation render loop
    const animate = () => {
      const dpr = dprRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (backgroundColor && backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const { radius = 160, strength = 5.5, enabled = true } = mouseControls;
      const mouseRadius = radius * dpr;

      for (const p of particles) {
        const dx = p.originX - p.x;
        const dy = p.originY - p.y;
        let repelX = 0;
        let repelY = 0;

        if (enabled && mouse.isActive) {
          const mx = mouse.x * dpr - p.x;
          const my = mouse.y * dpr - p.y;
          const distSq = mx * mx + my * my;
          const radiusSq = mouseRadius * mouseRadius;

          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const force = (mouseRadius - dist) / mouseRadius;
            const angle = Math.atan2(my, mx);
            repelX = -Math.cos(angle) * force * strength * 5.5;
            repelY = -Math.sin(angle) * force * strength * 5.5;
          }
        }

        p.vx += dx * ease + repelX;
        p.vy += dy * ease + repelY;
        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;

        // Settle smoothly when very close to origin and stopped
        if (!mouse.isActive && Math.abs(p.vx) < 0.005 && Math.abs(dx) < 0.05) {
          p.x = p.originX;
          p.y = p.originY;
          p.vx = 0;
          p.vy = 0;
        }

        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    const ro = new ResizeObserver(() => {
      init();
    });
    ro.observe(container);
    resizeObserverRef.current = ro;

    const handlePointerMove = (evt: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in evt ? evt.touches[0]?.clientX ?? 0 : evt.clientX;
      const clientY = "touches" in evt ? evt.touches[0]?.clientY ?? 0 : evt.clientY;

      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        mouseRef.current.x = clientX - rect.left;
        mouseRef.current.y = clientY - rect.top;
        mouseRef.current.isActive = true;
      } else {
        mouseRef.current.isActive = false;
      }
    };

    const handlePointerLeave = () => {
      mouseRef.current.isActive = false;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave);
    window.addEventListener("touchend", handlePointerLeave);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("touchend", handlePointerLeave);
    };
  }, [
    text,
    colors,
    particleSize,
    particleGap,
    mouseControls,
    backgroundColor,
    fontFamily,
    fontSize,
    fontWeight,
    friction,
    ease,
    autoFit,
    modular,
    calculateFontSize,
  ]);

  return (
    <div
      ref={containerRef}
      className={`particle-text-container relative w-full h-full overflow-hidden select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="particle-text-canvas block w-full h-full pointer-events-none"
      />
    </div>
  );
};

ParticleText.displayName = "ParticleText";

export default ParticleText;
