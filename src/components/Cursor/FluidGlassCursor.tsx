import { useEffect, useRef, useState, useId } from "react";

export interface FluidGlassCursorProps {
  accentColor?: string;
  size?: number;
  showCenterReticle?: boolean;
}

export function FluidGlassCursor({
  accentColor = "#ccff00",
  size = 76,
  showCenterReticle = true,
}: FluidGlassCursorProps) {
  const uniqueId = useId().replace(/:/g, "-");
  const filterId = `cursor-fluid-lens-${uniqueId}`;

  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);

  // Position and physics references for 60-120fps RAF interpolation
  const mousePos = useRef({ x: -200, y: -200 });
  const currentPos = useRef({ x: -200, y: -200 });
  const velocity = useRef({ x: 0, y: 0 });
  const stretchRef = useRef(0);
  const angleRef = useRef(0);

  const cursorRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const specRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);

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

    const onPointerDown = () => {
      setIsClicking(true);
      setRippleActive(true);
      setTimeout(() => setRippleActive(false), 500);
    };

    const onPointerUp = () => setIsClicking(false);

    const onPointerLeave = () => {
      setIsVisible(false);
      setIsHovered(false);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    document.addEventListener("mouseleave", onPointerLeave);

    // High performance RAF loop with fluid droplet inertia, elongation, and specular tilt
    let rafId: number;
    const renderLoop = () => {
      const ease = 0.16;
      const dx = mousePos.current.x - currentPos.current.x;
      const dy = mousePos.current.y - currentPos.current.y;

      velocity.current.x = dx;
      velocity.current.y = dy;

      currentPos.current.x += dx * ease;
      currentPos.current.y += dy * ease;

      const speed = Math.hypot(dx, dy);
      const targetStretch = Math.min(0.32, speed * 0.007);
      stretchRef.current += (targetStretch - stretchRef.current) * 0.15;

      if (speed > 0.5) {
        const targetAngle = Math.atan2(dy, dx);
        // Smooth angular interpolation
        let angleDiff = targetAngle - angleRef.current;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        angleRef.current += angleDiff * 0.2;
      }

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;
      }

      // Fluid droplet elongation along movement vector
      if (lensRef.current) {
        const currentStretch = stretchRef.current;
        const scaleX = 1 + currentStretch;
        const scaleY = 1 - currentStretch * 0.6;
        lensRef.current.style.transform = `rotate(${angleRef.current}rad) scale(${scaleX}, ${scaleY})`;
      }

      // Keep reticle upright and stabilized
      if (reticleRef.current) {
        reticleRef.current.style.transform = `rotate(${-angleRef.current}rad)`;
      }

      // 3D specular highlight shift
      if (specRef.current) {
        const tiltX = Math.max(-20, Math.min(20, dy * 0.35));
        const tiltY = Math.max(-20, Math.min(20, -dx * 0.35));
        specRef.current.style.transform = `translate3d(${tiltY * 0.5}px, ${tiltX * 0.5}px, 0) scale(${1 - stretchRef.current * 0.2})`;
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

  const currentSize = isClicking ? size * 0.86 : isHovered ? size * 1.38 : size;

  return (
    <>
      {/* SVG Spherical Lens Displacement & Chromatic Aberration Filter */}
      <svg
        className="pointer-events-none fixed top-0 left-0 h-0 w-0 opacity-0"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <radialGradient id={`lens-disp-grad-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#808080" stopOpacity="1" />
            <stop offset="65%" stopColor="#909090" stopOpacity="1" />
            <stop offset="90%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="1" />
          </radialGradient>
          <filter
            id={filterId}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="2"
              result="microNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="microNoise"
              scale="6"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
          </filter>
        </defs>
      </svg>

      <div
        ref={cursorRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-50 -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{
          width: `${currentSize}px`,
          height: `${currentSize}px`,
          transition:
            "width 220ms cubic-bezier(0.16,1,0.3,1), height 220ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Dynamic Liquid Glass Droplet Lens Body */}
        <div
          ref={lensRef}
          className="relative h-full w-full rounded-full will-change-transform"
          style={{
            // Optical Loupe Magnification & Contrast
            backdropFilter: isHovered
              ? `url(#${filterId}) blur(0.5px) contrast(1.35) brightness(1.22) saturate(1.8)`
              : `url(#${filterId}) blur(0.5px) contrast(1.22) brightness(1.12) saturate(1.5)`,
            WebkitBackdropFilter: isHovered
              ? "blur(0.5px) contrast(1.35) brightness(1.22) saturate(1.8)"
              : "blur(0.5px) contrast(1.22) brightness(1.12) saturate(1.5)",

            // Multi-tier Chromatic Aberration Rim & Caustic Glow
            boxShadow: isHovered
              ? `0 0 34px rgba(204,255,0,0.38), 0 0 16px rgba(0,240,255,0.25), inset 0 0 16px rgba(255,255,255,0.45), inset 0 0 36px rgba(204,255,0,0.18)`
              : `0 0 22px rgba(204,255,0,0.18), 0 0 10px rgba(0,240,255,0.12), inset 0 0 12px rgba(255,255,255,0.35), inset 0 0 24px rgba(204,255,0,0.08)`,

            border: isHovered
              ? "1.5px solid rgba(204,255,0,0.85)"
              : "1.5px solid rgba(255,255,255,0.4)",

            background: isHovered
              ? "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.22), rgba(204,255,0,0.1) 45%, rgba(0,0,0,0.02) 80%)"
              : "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.16), rgba(204,255,0,0.05) 50%, rgba(0,0,0,0.01) 85%)",
          }}
        >
          {/* Prismatic Rainbow Rim Fringe (True Dispersion Effect) */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              padding: "1px",
              background:
                "conic-gradient(from 45deg, rgba(255,80,80,0.5), rgba(204,255,0,0.6), rgba(0,240,255,0.6), rgba(255,80,200,0.5), rgba(255,80,80,0.5))",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              opacity: isHovered ? 0.9 : 0.6,
            }}
          />

          {/* 3D Curved Meniscus Specular Highlight that Tilts with Inertia */}
          <div
            ref={specRef}
            className="pointer-events-none absolute inset-1.5 rounded-full transition-transform duration-75 ease-out"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 28%, transparent 60%)",
            }}
          />

          {/* Liquid Caustic Shockwave Ripple on Click */}
          {rippleActive && (
            <div
              className="pointer-events-none absolute inset-0 animate-ping rounded-full border border-accent/80"
              style={{ animationDuration: "500ms" }}
            />
          )}

          {/* Optical Telemetry Crosshairs & Precision Focal Bead */}
          {showCenterReticle && (
            <div
              ref={reticleRef}
              className="pointer-events-none absolute inset-0 grid place-items-center"
            >
              {/* Fine Crosshairs */}
              <div
                className="absolute h-[1px] w-3.5 transition-all duration-150"
                style={{
                  backgroundColor: isHovered ? accentColor : "rgba(255,255,255,0.65)",
                  opacity: isHovered ? 1 : 0.5,
                  boxShadow: isHovered ? `0 0 6px ${accentColor}` : "none",
                }}
              />
              <div
                className="absolute h-3.5 w-[1px] transition-all duration-150"
                style={{
                  backgroundColor: isHovered ? accentColor : "rgba(255,255,255,0.65)",
                  opacity: isHovered ? 1 : 0.5,
                  boxShadow: isHovered ? `0 0 6px ${accentColor}` : "none",
                }}
              />
              {/* Focal Optical Bead */}
              <div
                className="h-1.5 w-1.5 rounded-full transition-all duration-150"
                style={{
                  backgroundColor: accentColor,
                  transform: isClicking ? "scale(0.65)" : isHovered ? "scale(1.45)" : "scale(1)",
                  boxShadow: `0 0 10px ${accentColor}`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default FluidGlassCursor;
