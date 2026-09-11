/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useId, useCallback } from "react";

export interface FluidGlassCursorProps {
  accentColor?: string;
  size?: number;
  showCenterReticle?: boolean;
  effect?: "clear" | "regular";
}

/**
 * Apple iOS 26 Liquid Glass Cursor
 * Dynamic refractive lens with chromatic dispersion, inertia deformation,
 * and tactile spring compression.
 */
export function FluidGlassCursor({
  accentColor = "#ccff00",
  size = 64,
  showCenterReticle = true,
  effect = "clear",
}: FluidGlassCursorProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [svgSupported, setSvgSupported] = useState(false);

  const uniqueId = useId().replace(/:/g, "-");
  const filterId = `cursor-glass-filter-${uniqueId}`;

  const mousePos = useRef({ x: -200, y: -200 });
  const currentPos = useRef({ x: -200, y: -200 });
  const velocity = useRef({ x: 0, y: 0 });

  const cursorRef = useRef<HTMLDivElement>(null);
  const specRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement | null>(null);
  const redChannelRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const greenChannelRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const blueChannelRef = useRef<SVGFEDisplacementMapElement | null>(null);

  // Generate spherical lens displacement map
  const generateLensMap = useCallback(() => {
    const s = 128;
    const center = s / 2;
    const r = center - 4;
    const gradId = `lens-grad-${uniqueId}`;

    const svg = `
      <svg viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="${gradId}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#808080" />
            <stop offset="40%" stop-color="#907090" />
            <stop offset="75%" stop-color="#b050b0" />
            <stop offset="100%" stop-color="#ff00ff" />
          </radialGradient>
        </defs>
        <rect width="${s}" height="${s}" fill="#808080" />
        <circle cx="${center}" cy="${center}" r="${r}" fill="url(#${gradId})" />
      </svg>
    `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }, [uniqueId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    setMounted(true);

    // SVG filter support check
    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    if (!isWebkit && !isFirefox) {
      const div = document.createElement("div");
      div.style.backdropFilter = `url(#${filterId})`;
      setSvgSupported(div.style.backdropFilter !== "");
    }

    const onPointerMove = (e: PointerEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          "a, button, [role='button'], input, textarea, select, [data-interactive]"
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
      const angle = Math.atan2(dy, dx);
      // Subtle organic liquid elongation along motion direction
      const stretch = Math.min(0.24, speed * 0.004);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) rotate(${angle}rad) scale(${1 + stretch}, ${1 - stretch * 0.5})`;
      }

      // Specular highlight shifts counter to motion
      if (specRef.current) {
        const tiltX = Math.max(-10, Math.min(10, -dy * 0.25));
        const tiltY = Math.max(-10, Math.min(10, -dx * 0.25));
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
  }, [isVisible, filterId]);

  useEffect(() => {
    if (feImageRef.current) {
      feImageRef.current.setAttribute("href", generateLensMap());
    }
  }, [generateLensMap]);

  if (!mounted || !isVisible) return null;

  const currentSize = isClicking ? size * 0.86 : isHovered ? size * 1.32 : size;
  const isClear = effect === "clear";

  return (
    <div
      ref={cursorRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[9999] -translate-x-1/2 -translate-y-1/2 will-change-transform"
      style={{
        width: `${currentSize}px`,
        height: `${currentSize}px`,
        transition:
          "width 200ms cubic-bezier(0.34,1.56,0.64,1), height 200ms cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {/* ── SVG Refraction Filter for Liquid Glass Cursor ── */}
      <svg
        className="pointer-events-none absolute inset-0 -z-10 opacity-0"
        width="0"
        height="0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
            <feImage ref={feImageRef} preserveAspectRatio="none" result="map" />
            <feDisplacementMap
              ref={redChannelRef}
              in="SourceGraphic"
              in2="map"
              scale={isHovered ? "-38" : "-28"}
              xChannelSelector="R"
              yChannelSelector="B"
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />
            <feDisplacementMap
              ref={greenChannelRef}
              in="SourceGraphic"
              in2="map"
              scale={isHovered ? "-32" : "-22"}
              xChannelSelector="R"
              yChannelSelector="B"
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="green"
            />
            <feDisplacementMap
              ref={blueChannelRef}
              in="SourceGraphic"
              in2="map"
              scale={isHovered ? "-26" : "-16"}
              xChannelSelector="R"
              yChannelSelector="B"
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blue"
            />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur in="output" stdDeviation={isClear ? 0.3 : 0.6} />
          </filter>
        </defs>
      </svg>

      {/* ── Liquid Glass Droplet Orb ── */}
      <div
        className="relative h-full w-full rounded-full transition-all duration-200"
        style={{
          background: isClear
            ? "rgba(255, 255, 255, 0.04)"
            : "rgba(255, 255, 255, 0.09)",
          backdropFilter: svgSupported
            ? `url(#${filterId}) saturate(${isHovered ? 2.0 : 1.5}) brightness(1.15)`
            : `blur(${isHovered ? 14 : 10}px) saturate(2.0) brightness(1.2)`,
          WebkitBackdropFilter: svgSupported
            ? `url(#${filterId}) saturate(${isHovered ? 2.0 : 1.5}) brightness(1.15)`
            : `blur(${isHovered ? 14 : 10}px) saturate(2.0) brightness(1.2)`,
          boxShadow: isHovered
            ? "0 10px 32px rgba(0,0,0,0.5), inset 0 2px 1px rgba(255,255,255,0.95), inset 0 -1.5px 0 rgba(255,255,255,0.3), inset 0 0 16px rgba(255,255,255,0.12)"
            : "0 6px 20px rgba(0,0,0,0.4), inset 0 1.5px 0.5px rgba(255,255,255,0.85), inset 0 -1px 0 rgba(255,255,255,0.2), inset 0 0 12px rgba(255,255,255,0.08)",
          border: isHovered
            ? "1.2px solid rgba(255,255,255,0.48)"
            : "1px solid rgba(255,255,255,0.32)",
        }}
      >
        {/* ── Top Specular Light Shelf ── */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 22%, transparent 55%)",
            zIndex: 3,
          }}
        />

        {/* ── Meniscus Glint ── */}
        <div
          ref={specRef}
          className="pointer-events-none absolute rounded-full transition-transform duration-75 ease-out"
          style={{
            inset: "10%",
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.12) 32%, transparent 68%)",
            zIndex: 2,
          }}
        />

        {/* ── Bottom Prismatic Catch Light ── */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, transparent 65%, rgba(255,255,255,0.18) 100%)",
            zIndex: 1,
          }}
        />

        {/* ── Center Reticle ── */}
        {showCenterReticle && (
          <div
            className="absolute inset-0 grid place-items-center pointer-events-none"
            style={{ zIndex: 4 }}
          >
            <div
              className="absolute h-[1px] w-3 transition-all duration-150"
              style={{
                backgroundColor: isHovered ? accentColor : "rgba(255,255,255,0.55)",
                opacity: isHovered ? 0.95 : 0.45,
                boxShadow: isHovered ? `0 0 6px ${accentColor}` : "none",
              }}
            />
            <div
              className="absolute w-[1px] h-3 transition-all duration-150"
              style={{
                backgroundColor: isHovered ? accentColor : "rgba(255,255,255,0.55)",
                opacity: isHovered ? 0.95 : 0.45,
                boxShadow: isHovered ? `0 0 6px ${accentColor}` : "none",
              }}
            />
            <div
              className="h-1.5 w-1.5 rounded-full transition-all duration-150"
              style={{
                backgroundColor: accentColor,
                transform: isClicking ? "scale(0.65)" : isHovered ? "scale(1.4)" : "scale(1)",
                boxShadow: `0 0 8px ${accentColor}, 0 0 2px rgba(255,255,255,0.8)`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FluidGlassCursor;
