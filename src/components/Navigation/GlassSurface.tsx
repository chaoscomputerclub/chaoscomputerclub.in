/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef, useId, useCallback } from "react";
import "./GlassSurface.css";

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: "R" | "G" | "B" | "A";
  yChannel?: "R" | "G" | "B" | "A";
  mixBlendMode?: "difference" | "screen" | "multiply" | "overlay" | "color-dodge";
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function GlassSurface({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  borderWidth = 0.25,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0.5,
  backgroundOpacity = 0.08,
  saturation = 1.4,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = "R",
  yChannel = "G",
  mixBlendMode = "difference",
  interactive = true,
  className = "",
  style = {},
}: GlassSurfaceProps) {
  const uniqueId = useId().replace(/:/g, "-");
  const filterId = `glass-filter-${uniqueId}`;
  const redGradId = `red-grad-${uniqueId}`;
  const blueGradId = `blue-grad-${uniqueId}`;
  const pointerGradId = `pointer-grad-${uniqueId}`;

  const [svgSupported, setSvgSupported] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const feImageRef = useRef<SVGFEImageElement | null>(null);
  const redChannelRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const greenChannelRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const blueChannelRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement | null>(null);

  // Interactive pointer physics state
  const pointerRef = useRef({
    targetX: 50,
    targetY: 50,
    currentX: 50,
    currentY: 50,
    targetActive: 0,
    currentActive: 0,
    rafId: 0,
    isAnimating: false,
  });

  const generateDisplacementMap = useCallback(
    (posX = 50, posY = 50, activeFactor = 0) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const actualWidth = Math.max(10, Math.floor(rect?.width || 400));
      const actualHeight = Math.max(10, Math.floor(rect?.height || 80));

      // Optical curvature: ensure the gradient spans nicely across the navbar height
      const edgeFactor = Math.max(0.2, borderWidth);
      const edgeSize = Math.max(8, Math.min(actualWidth * 0.12, actualHeight * edgeFactor * 0.5));

      // Dynamic liquid lens ripple centered at pointer location
      const pointerRipple =
        activeFactor > 0.01
          ? `
          <radialGradient id="${pointerGradId}" cx="${posX.toFixed(1)}%" cy="${posY.toFixed(1)}%" r="35%" fx="${posX.toFixed(1)}%" fy="${posY.toFixed(1)}%">
            <stop offset="0%" stop-color="#ff3366" stop-opacity="${(activeFactor * 0.85).toFixed(2)}" />
            <stop offset="35%" stop-color="#33ddff" stop-opacity="${(activeFactor * 0.6).toFixed(2)}" />
            <stop offset="70%" stop-color="#808080" stop-opacity="${(activeFactor * 0.25).toFixed(2)}" />
            <stop offset="100%" stop-color="#808080" stop-opacity="0" />
          </radialGradient>
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${pointerGradId})" style="mix-blend-mode: overlay;" />
        `
          : "";

      const svgContent = `
        <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
              <stop offset="100%" stop-color="#ff0000"/>
            </linearGradient>
            <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
              <stop offset="100%" stop-color="#0000ff"/>
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="#000000" />
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
          <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
          <rect x="${edgeSize.toFixed(1)}" y="${edgeSize.toFixed(1)}" width="${(actualWidth - edgeSize * 2).toFixed(1)}" height="${(actualHeight - edgeSize * 2).toFixed(1)}" rx="${Math.max(0, borderRadius - edgeSize)}" fill="hsl(0, 0%, ${brightness}%)" fill-opacity="${opacity}" style="filter:blur(${blur}px)" />
          ${pointerRipple}
        </svg>
      `;

      return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
    },
    [borderRadius, borderWidth, brightness, opacity, blur, mixBlendMode, redGradId, blueGradId, pointerGradId]
  );

  const updateDisplacementMap = useCallback(
    (posX = 50, posY = 50, activeFactor = 0) => {
      if (!feImageRef.current) return;
      feImageRef.current.setAttribute("href", generateDisplacementMap(posX, posY, activeFactor));
    },
    [generateDisplacementMap]
  );

  // Smooth animation frame loop for pointer interaction
  const animatePointer = useCallback(() => {
    const p = pointerRef.current;
    p.currentX += (p.targetX - p.currentX) * 0.16;
    p.currentY += (p.targetY - p.currentY) * 0.16;
    p.currentActive += (p.targetActive - p.currentActive) * 0.14;

    const el = containerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const px = (p.currentX / 100) * rect.width;
      const py = (p.currentY / 100) * rect.height;

      el.style.setProperty("--mouse-x", `${px.toFixed(1)}px`);
      el.style.setProperty("--mouse-y", `${py.toFixed(1)}px`);
      el.style.setProperty("--mouse-intensity", p.currentActive.toFixed(3));
    }

    // Chromatic dispersion flair on active liquid hover
    const chromaticBoost = p.currentActive * 12;
    if (redChannelRef.current) {
      redChannelRef.current.setAttribute(
        "scale",
        (distortionScale + redOffset - chromaticBoost * 0.5).toFixed(1)
      );
    }
    if (blueChannelRef.current) {
      blueChannelRef.current.setAttribute(
        "scale",
        (distortionScale + blueOffset + chromaticBoost).toFixed(1)
      );
    }

    updateDisplacementMap(p.currentX, p.currentY, p.currentActive);

    // Stop RAF when motion settles to save CPU / RAM
    const isMoving =
      Math.abs(p.targetX - p.currentX) > 0.05 ||
      Math.abs(p.targetY - p.currentY) > 0.05 ||
      Math.abs(p.targetActive - p.currentActive) > 0.005 ||
      p.currentActive > 0.008;

    if (isMoving) {
      p.rafId = requestAnimationFrame(animatePointer);
    } else {
      p.isAnimating = false;
    }
  }, [distortionScale, redOffset, blueOffset, updateDisplacementMap]);

  const startAnimation = useCallback(() => {
    const p = pointerRef.current;
    if (!p.isAnimating) {
      p.isAnimating = true;
      p.rafId = requestAnimationFrame(animatePointer);
    }
  }, [animatePointer]);

  // Pointer event handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const p = pointerRef.current;
    p.targetX = Math.max(0, Math.min(100, x));
    p.targetY = Math.max(0, Math.min(100, y));
    p.targetActive = 1;

    startAnimation();
  };

  const handlePointerEnter = () => {
    if (!interactive) return;
    pointerRef.current.targetActive = 1;
    startAnimation();
  };

  const handlePointerLeave = () => {
    if (!interactive) return;
    pointerRef.current.targetActive = 0;
    startAnimation();
  };

  // Base filter setup
  useEffect(() => {
    updateDisplacementMap();
    [
      { ref: redChannelRef, offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef, offset: blueOffset },
    ].forEach(({ ref, offset }) => {
      if (ref.current) {
        ref.current.setAttribute("scale", (distortionScale + offset).toString());
        ref.current.setAttribute("xChannelSelector", xChannel);
        ref.current.setAttribute("yChannelSelector", yChannel);
      }
    });

    gaussianBlurRef.current?.setAttribute("stdDeviation", displace.toString());
  }, [
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode,
  ]);

  // ResizeObserver to adapt SVG displacement map to dimensions
  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(() => updateDisplacementMap(), 0);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (pointerRef.current.rafId) {
        cancelAnimationFrame(pointerRef.current.rafId);
      }
    };
  }, [updateDisplacementMap]);

  useEffect(() => {
    setTimeout(() => updateDisplacementMap(), 0);
  }, [width, height, updateDisplacementMap]);

  useEffect(() => {
    setSvgSupported(supportsSVGFilters());
  }, []);

  const supportsSVGFilters = () => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return false;
    }

    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);

    if (isWebkit || isFirefox) {
      return false;
    }

    const div = document.createElement("div");
    div.style.backdropFilter = `url(#${filterId})`;
    return div.style.backdropFilter !== "";
  };

  const containerStyle: React.CSSProperties & Record<string, unknown> = {
    ...style,
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    "--glass-frost": backgroundOpacity,
    "--glass-saturation": saturation,
    "--filter-id": `url(#${filterId})`,
    "--mouse-x": "50%",
    "--mouse-y": "50%",
    "--mouse-intensity": "0",
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`glass-surface ${svgSupported ? "glass-surface--svg" : "glass-surface--fallback"} ${interactive ? "glass-surface--interactive" : ""} ${className}`}
      style={containerStyle}
    >
      <svg className="glass-surface__filter" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feImage
              ref={feImageRef}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              ref={redChannelRef}
              in="SourceGraphic"
              in2="map"
              id="redchannel"
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values={`1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0`}
              result="red"
            />
            <feDisplacementMap
              ref={greenChannelRef}
              in="SourceGraphic"
              in2="map"
              id="greenchannel"
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values={`0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0`}
              result="green"
            />
            <feDisplacementMap
              ref={blueChannelRef}
              in="SourceGraphic"
              in2="map"
              id="bluechannel"
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values={`0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0`}
              result="blue"
            />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation={displace} />
          </filter>
        </defs>
      </svg>
      <div className="glass-surface__content">{children}</div>
    </div>
  );
}

export default GlassSurface;
