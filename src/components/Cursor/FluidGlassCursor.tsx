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

  // Position references for 60-120fps RAF interpolation
  const mousePos = useRef({ x: -200, y: -200 });
  const currentPos = useRef({ x: -200, y: -200 });
  const velocity = useRef({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const specRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on client and pointer-fine devices (desktop/mouse)
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

    // High performance RAF loop for fluid glass inertia and tilt
    let rafId: number;
    const renderLoop = () => {
      const ease = 0.18;
      const dx = mousePos.current.x - currentPos.current.x;
      const dy = mousePos.current.y - currentPos.current.y;

      velocity.current.x = dx;
      velocity.current.y = dy;

      currentPos.current.x += dx * ease;
      currentPos.current.y += dy * ease;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;
      }

      // Tilt the specular glass reflection based on velocity
      if (specRef.current) {
        const tiltX = Math.max(-25, Math.min(25, dy * 0.4));
        const tiltY = Math.max(-25, Math.min(25, -dx * 0.4));
        specRef.current.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
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
      className="pointer-events-none fixed top-0 left-0 z-50 -translate-x-1/2 -translate-y-1/2 will-change-transform"
      style={{
        width: `${currentSize}px`,
        height: `${currentSize}px`,
        transition:
          "width 200ms cubic-bezier(0.16,1,0.3,1), height 200ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* 3D Glass Lens Body with Refraction, Caustics, and Chromatic Aberration Rim */}
      <div
        ref={lensRef}
        className="relative h-full w-full rounded-full"
        style={{
          // Optical magnification & contrast of DOM elements underneath
          backdropFilter: isHovered
            ? "contrast(1.3) brightness(1.15) saturate(1.2)"
            : "contrast(1.18) brightness(1.08) saturate(1.1)",
          WebkitBackdropFilter: isHovered
            ? "contrast(1.3) brightness(1.15) saturate(1.2)"
            : "contrast(1.18) brightness(1.08) saturate(1.1)",

          // Multilayer chromatic glass border: acid-lime fresnel edge + chromatic dispersion
          boxShadow: isHovered
            ? `0 0 28px rgba(204,255,0,0.3), inset 0 0 16px rgba(255,255,255,0.25), inset 0 0 32px rgba(204,255,0,0.15)`
            : `0 0 18px rgba(204,255,0,0.14), inset 0 0 12px rgba(255,255,255,0.15), inset 0 0 22px rgba(204,255,0,0.08)`,

          border: isHovered
            ? `1.5px solid rgba(204,255,0,0.65)`
            : `1px solid rgba(255,255,255,0.25)`,

          background: isHovered
            ? "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), rgba(204,255,0,0.08) 45%, rgba(0,0,0,0.02) 80%)"
            : "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.12), rgba(204,255,0,0.04) 50%, rgba(0,0,0,0.01) 85%)",
        }}
      >
        {/* Specular 3D highlight crescent that responds to tilt */}
        <div
          ref={specRef}
          className="absolute inset-1 rounded-full pointer-events-none transition-transform duration-75 ease-out"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 25%, transparent 60%)",
          }}
        />

        {/* Optical center focal crosshairs / precision telemetry dot */}
        {showCenterReticle && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            {/* Fine horizontal & vertical hair crosshairs */}
            <div
              className="absolute h-[1px] w-3 transition-opacity duration-150"
              style={{
                backgroundColor: isHovered ? accentColor : "rgba(255,255,255,0.45)",
                opacity: isHovered ? 0.9 : 0.4,
              }}
            />
            <div
              className="absolute w-[1px] h-3 transition-opacity duration-150"
              style={{
                backgroundColor: isHovered ? accentColor : "rgba(255,255,255,0.45)",
                opacity: isHovered ? 0.9 : 0.4,
              }}
            />
            {/* Core focal bead */}
            <div
              className="h-1.5 w-1.5 rounded-full transition-all duration-150"
              style={{
                backgroundColor: accentColor,
                transform: isClicking ? "scale(0.7)" : isHovered ? "scale(1.4)" : "scale(1)",
                boxShadow: `0 0 8px ${accentColor}`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FluidGlassCursor;
