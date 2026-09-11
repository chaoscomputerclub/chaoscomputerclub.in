import { useEffect, useRef, useState } from "react";

export interface FluidGlassCursorProps {
  accentColor?: string;
  size?: number;
  showCenterReticle?: boolean;
}

export function FluidGlassCursor({
  accentColor = "#ccff00",
  size = 68,
  showCenterReticle = true,
}: FluidGlassCursorProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const mousePos = useRef({ x: -200, y: -200 });
  const currentPos = useRef({ x: -200, y: -200 });
  const velocity = useRef({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const specRef = useRef<HTMLDivElement>(null);

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

      // Tilt specular highlight based on movement direction
      if (specRef.current) {
        const tiltX = Math.max(-18, Math.min(18, dy * 0.35));
        const tiltY = Math.max(-18, Math.min(18, -dx * 0.35));
        specRef.current.style.transform = `translate3d(${tiltY * 0.6}px, ${tiltX * 0.6}px, 0)`;
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

  const currentSize = isClicking ? size * 0.87 : isHovered ? size * 1.3 : size;

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[9999] -translate-x-1/2 -translate-y-1/2 will-change-transform"
      style={{
        width: `${currentSize}px`,
        height: `${currentSize}px`,
        transition:
          "width 220ms cubic-bezier(0.16,1,0.3,1), height 220ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* ── Apple Liquid Glass Sphere ── */}
      <div
        className="relative h-full w-full rounded-full"
        style={{
          /* The same ultra-transparent tint Apple uses */
          background: "rgba(255, 255, 255, 0.07)",

          /* Heavy blur + boosted saturation to catch ambient color */
          backdropFilter: isHovered
            ? "blur(32px) saturate(2.8) brightness(1.25) contrast(0.86)"
            : "blur(28px) saturate(2.4) brightness(1.2) contrast(0.9)",
          WebkitBackdropFilter: isHovered
            ? "blur(32px) saturate(2.8) brightness(1.25) contrast(0.86)"
            : "blur(28px) saturate(2.4) brightness(1.2) contrast(0.9)",

          /* Outer depth shadow + specular top beam (the Apple signature) */
          boxShadow: isHovered
            ? [
                "0 2px 12px rgba(0,0,0,0.35)",
                "0 8px 32px -4px rgba(0,0,0,0.42)",
                "0 20px 60px -10px rgba(0,0,0,0.5)",
                "inset 0 -1px 1px rgba(0,0,0,0.22)",
                "inset 0 1px 8px rgba(255,255,255,0.14)",
                `inset 0 2px 0 rgba(255,255,255,0.88)`,
              ].join(", ")
            : [
                "0 2px 8px rgba(0,0,0,0.28)",
                "0 6px 24px -4px rgba(0,0,0,0.36)",
                "0 16px 48px -8px rgba(0,0,0,0.42)",
                "inset 0 -1px 1px rgba(0,0,0,0.18)",
                "inset 0 1px 6px rgba(255,255,255,0.1)",
                "inset 0 1.5px 0 rgba(255,255,255,0.72)",
              ].join(", "),

          /* Clean single-pixel frosted border */
          border: isHovered
            ? "1px solid rgba(255,255,255,0.35)"
            : "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {/* ── Apple-style top specular shine stripe ── */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.18) 16%, rgba(255,255,255,0.05) 36%, transparent 55%)",
            zIndex: 3,
          }}
        />

        {/* ── Diffuse meniscus highlight — shifts with velocity ── */}
        <div
          ref={specRef}
          className="pointer-events-none absolute rounded-full transition-transform duration-75 ease-out"
          style={{
            inset: "8%",
            background:
              "radial-gradient(circle at 35% 28%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 30%, transparent 65%)",
            zIndex: 2,
          }}
        />

        {/* ── Bottom catch light ── */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, transparent 55%, rgba(255,255,255,0.04) 80%, rgba(255,255,255,0.1) 100%)",
            zIndex: 1,
          }}
        />

        {/* ── Telemetry crosshairs + focal bead ── */}
        {showCenterReticle && (
          <div
            className="absolute inset-0 grid place-items-center pointer-events-none"
            style={{ zIndex: 4 }}
          >
            <div
              className="absolute h-[1px] w-3 transition-all duration-150"
              style={{
                backgroundColor: isHovered ? accentColor : "rgba(255,255,255,0.5)",
                opacity: isHovered ? 0.95 : 0.45,
                boxShadow: isHovered ? `0 0 4px ${accentColor}` : "none",
              }}
            />
            <div
              className="absolute w-[1px] h-3 transition-all duration-150"
              style={{
                backgroundColor: isHovered ? accentColor : "rgba(255,255,255,0.5)",
                opacity: isHovered ? 0.95 : 0.45,
                boxShadow: isHovered ? `0 0 4px ${accentColor}` : "none",
              }}
            />
            <div
              className="h-1.5 w-1.5 rounded-full transition-all duration-150"
              style={{
                backgroundColor: accentColor,
                transform: isClicking ? "scale(0.65)" : isHovered ? "scale(1.4)" : "scale(1)",
                boxShadow: `0 0 8px ${accentColor}, 0 0 2px rgba(255,255,255,0.6)`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FluidGlassCursor;
