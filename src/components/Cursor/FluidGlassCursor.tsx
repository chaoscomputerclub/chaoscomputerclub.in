import { useEffect, useRef, useState } from "react";

export interface FluidGlassCursorProps {
  accentColor?: string;
  size?: number;
  showCenterReticle?: boolean;
}

export function FluidGlassCursor({
  accentColor = "#ccff00",
  size = 72,
  showCenterReticle = true,
}: FluidGlassCursorProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const mousePos = useRef({ x: -200, y: -200 });
  const currentPos = useRef({ x: -200, y: -200 });
  const velocity = useRef({ x: 0, y: 0 });
  const rainbowAngle = useRef(0);

  const cursorRef = useRef<HTMLDivElement>(null);
  const dropletRef = useRef<HTMLDivElement>(null);
  const specRef = useRef<HTMLDivElement>(null);
  const redLayerRef = useRef<HTMLDivElement>(null);
  const blueLayerRef = useRef<HTMLDivElement>(null);
  const rainbowRimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    setMounted(true);

    const onPointerMove = (e: PointerEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          "a, button, [role='button'], input, textarea, select, [data-interactive]",
        );
        setIsHovered(!!interactive);
      }
    };

    const onPointerDown = () => setIsClicking(true);
    const onPointerUp = () => setIsClicking(false);
    const onPointerLeave = () => {
      setIsVisible(false);
      setIsHovered(false);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    document.addEventListener("mouseleave", onPointerLeave);

    let rafId: number;
    const renderLoop = () => {
      const ease = 0.2;
      const dx = mousePos.current.x - currentPos.current.x;
      const dy = mousePos.current.y - currentPos.current.y;

      velocity.current.x = dx;
      velocity.current.y = dy;

      currentPos.current.x += dx * ease;
      currentPos.current.y += dy * ease;

      const speed = Math.hypot(dx, dy);

      // Rotate rainbow angle based on movement and continuous shimmer
      rainbowAngle.current = (rainbowAngle.current + 1.2 + speed * 0.4) % 360;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;
      }

      // Fluid droplet elongation along velocity vector
      if (dropletRef.current) {
        if (speed > 1) {
          const moveAngle = Math.atan2(dy, dx) * (180 / Math.PI);
          const stretchX = Math.min(1 + speed * 0.0035, 1.25);
          const stretchY = Math.max(1 - speed * 0.0025, 0.82);
          dropletRef.current.style.transform = `rotate(${moveAngle}deg) scale(${stretchX}, ${stretchY}) rotate(${-moveAngle}deg)`;
        } else {
          dropletRef.current.style.transform = "scale(1, 1)";
        }
      }

      // Dynamic rainbow rim rotation
      if (rainbowRimRef.current) {
        rainbowRimRef.current.style.setProperty("--rim-angle", `${rainbowAngle.current.toFixed(1)}deg`);
      }

      // Dynamic chromatic aberration: Red and Blue channels separate proportionally to velocity
      const dispFactor = Math.min(speed * 0.22, 10);
      const moveRad = Math.atan2(dy, dx);
      const dispX = Math.cos(moveRad) * dispFactor;
      const dispY = Math.sin(moveRad) * dispFactor;

      if (redLayerRef.current) {
        redLayerRef.current.style.transform = `translate3d(${-dispX}px, ${-dispY}px, 0)`;
      }
      if (blueLayerRef.current) {
        blueLayerRef.current.style.transform = `translate3d(${dispX}px, ${dispY}px, 0)`;
      }

      // Specular meniscus highlight tilts opposite to motion
      if (specRef.current) {
        const tiltX = Math.max(-14, Math.min(14, dy * 0.28));
        const tiltY = Math.max(-14, Math.min(14, -dx * 0.28));
        specRef.current.style.transform = `translate3d(${tiltY}px, ${tiltX}px, 0)`;
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [isVisible]);

  if (!mounted || !isVisible) return null;

  const currentSize = isClicking ? size * 0.88 : isHovered ? size * 1.35 : size;

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[9999] -translate-x-1/2 -translate-y-1/2 will-change-transform"
      style={{
        width: `${currentSize}px`,
        height: `${currentSize}px`,
        transition:
          "width 240ms cubic-bezier(0.16,1,0.3,1), height 240ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* ── Refraction Transparent Rainbow Glass Droplet ── */}
      <div
        ref={dropletRef}
        className="relative h-full w-full rounded-full transition-transform duration-75 ease-out"
        style={{
          /* Ultra-transparent liquid clarity */
          background: "rgba(255, 255, 255, 0.04)",

          /* Optical lens refraction: high clarity blur + boosted saturation */
          backdropFilter: isHovered
            ? "blur(14px) saturate(2.8) brightness(1.24) contrast(1.08)"
            : "blur(10px) saturate(2.4) brightness(1.18) contrast(1.04)",
          WebkitBackdropFilter: isHovered
            ? "blur(14px) saturate(2.8) brightness(1.24) contrast(1.08)"
            : "blur(10px) saturate(2.4) brightness(1.18) contrast(1.04)",

          /* Glass depth shadow + rainbow dispersion corona */
          boxShadow: isHovered
            ? [
                "0 4px 20px rgba(0,0,0,0.45)",
                "0 12px 36px -4px rgba(0,0,0,0.52)",
                "0 0 28px rgba(0, 240, 255, 0.35)",
                "0 0 45px rgba(255, 0, 140, 0.25)",
                "inset 0 2px 0 rgba(255,255,255,0.92)",
                "inset 0 -2px 0 rgba(0,220,255,0.4)",
                "inset 0 0 14px rgba(0,0,0,0.22)",
              ].join(", ")
            : [
                "0 2px 12px rgba(0,0,0,0.35)",
                "0 8px 24px -4px rgba(0,0,0,0.4)",
                "0 0 20px rgba(0, 240, 255, 0.25)",
                "0 0 35px rgba(255, 0, 140, 0.18)",
                "inset 0 1.5px 0 rgba(255,255,255,0.85)",
                "inset 0 -1.5px 0 rgba(0,220,255,0.3)",
                "inset 0 0 10px rgba(0,0,0,0.18)",
              ].join(", "),
        }}
      >
        {/* ── Prismatic Rainbow Refraction Rim (Masked Conic Gradient) ── */}
        <div
          ref={rainbowRimRef}
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            padding: "1.6px",
            background:
              "conic-gradient(from var(--rim-angle, 0deg), #ff0055 0deg, #ff7700 45deg, #ffee00 90deg, #00ff77 150deg, #00ddff 210deg, #7700ff 270deg, #ff00aa 330deg, #ff0055 360deg)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            filter: "drop-shadow(0 0 4px rgba(0, 240, 255, 0.6))",
            zIndex: 6,
          }}
        />

        {/* ── Velocity-Reactive Chromatic Aberration Dispersion Layers ── */}
        {/* Red Spectral Dispersion */}
        <div
          ref={redLayerRef}
          className="pointer-events-none absolute inset-0 rounded-full will-change-transform"
          style={{
            background:
              "radial-gradient(circle at 45% 45%, rgba(255, 10, 90, 0.38) 0%, rgba(255, 60, 0, 0.18) 45%, transparent 70%)",
            mixBlendMode: "screen",
            zIndex: 2,
          }}
        />

        {/* Cyan / Green Spectral Dispersion */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(0, 255, 160, 0.28) 0%, rgba(0, 210, 255, 0.18) 50%, transparent 72%)",
            mixBlendMode: "screen",
            zIndex: 2,
          }}
        />

        {/* Blue / Violet Spectral Dispersion */}
        <div
          ref={blueLayerRef}
          className="pointer-events-none absolute inset-0 rounded-full will-change-transform"
          style={{
            background:
              "radial-gradient(circle at 55% 55%, rgba(40, 120, 255, 0.38) 0%, rgba(160, 0, 255, 0.2) 48%, transparent 70%)",
            mixBlendMode: "screen",
            zIndex: 2,
          }}
        />

        {/* ── Top Specular Light Shelf (Glass Glare) ── */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.18) 20%, rgba(255,255,255,0.03) 42%, transparent 62%)",
            zIndex: 5,
          }}
        />

        {/* ── Dynamic Meniscus Rainbow Caustic Highlight ── */}
        <div
          ref={specRef}
          className="pointer-events-none absolute rounded-full transition-transform duration-75 ease-out"
          style={{
            inset: "10%",
            background:
              "radial-gradient(circle at 35% 28%, rgba(255,255,255,0.65) 0%, rgba(0,255,200,0.22) 28%, rgba(255,0,160,0.16) 52%, transparent 70%)",
            zIndex: 4,
          }}
        />

        {/* ── Bottom Catch Light Rim ── */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, transparent 58%, rgba(0,220,255,0.08) 82%, rgba(255,255,255,0.22) 100%)",
            zIndex: 3,
          }}
        />

        {/* ── Telemetry Focal Reticle ── */}
        {showCenterReticle && (
          <div
            className="absolute inset-0 grid place-items-center pointer-events-none"
            style={{ zIndex: 7 }}
          >
            {/* Horizontal Reticle Hair */}
            <div
              className="absolute h-[1px] w-3.5 transition-all duration-150"
              style={{
                backgroundColor: isHovered ? "#00f0ff" : "rgba(255,255,255,0.6)",
                opacity: isHovered ? 1 : 0.5,
                boxShadow: isHovered ? "0 0 6px #00f0ff" : "none",
              }}
            />
            {/* Vertical Reticle Hair */}
            <div
              className="absolute w-[1px] h-3.5 transition-all duration-150"
              style={{
                backgroundColor: isHovered ? "#00f0ff" : "rgba(255,255,255,0.6)",
                opacity: isHovered ? 1 : 0.5,
                boxShadow: isHovered ? "0 0 6px #00f0ff" : "none",
              }}
            />
            {/* Focal Bead */}
            <div
              className="h-1.5 w-1.5 rounded-full transition-all duration-150"
              style={{
                background: isHovered
                  ? "linear-gradient(135deg, #ff0077, #00f0ff)"
                  : accentColor,
                transform: isClicking ? "scale(0.6)" : isHovered ? "scale(1.4)" : "scale(1)",
                boxShadow: `0 0 8px ${isHovered ? "#00f0ff" : accentColor}, 0 0 3px rgba(255,255,255,0.8)`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FluidGlassCursor;
