/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef, useId, useCallback } from "react";
import "./GlassSurface.css";

export type LiquidGlassEffect = "regular" | "clear" | "none";

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
  effect?: LiquidGlassEffect;
  tintColor?: string;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onPress?: () => void;
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
  backgroundOpacity,
  saturation,
  distortionScale,
  redOffset,
  greenOffset,
  blueOffset,
  xChannel = "R",
  yChannel = "G",
  mixBlendMode = "difference",
  interactive = true,
  effect = "regular",
  tintColor,
  animated = true,
  className = "",
  style = {},
  onPress,
}: GlassSurfaceProps) {
  // Preset calibration based on Apple iOS 26 UIGlassEffect (clear vs regular)
  const isClear = effect === "clear";
  const isNone = effect === "none";

  const effectiveBgOpacity = backgroundOpacity ?? (isClear ? 0.03 : 0.08);
  const effectiveSaturation = saturation ?? (isClear ? 1.6 : 1.4);
  const effectiveDistortionScale = distortionScale ?? (isClear ? -210 : -180);
  const effectiveRedOffset = redOffset ?? (isClear ? -8 : -4);
  const effectiveGreenOffset = greenOffset ?? (isClear ? 12 : 8);
  const effectiveBlueOffset = blueOffset ?? (isClear ? 24 : 18);
  const effectiveDisplace = displace ?? (isClear ? 0.35 : 0.55);

  const uniqueId = useId().replace(/:/g, "-");
  const filterId = `glass-filter-${uniqueId}`;
  const redGradId = `red-grad-${uniqueId}`;
  const blueGradId = `blue-grad-${uniqueId}`;
  const pointerGradId = `pointer-grad-${uniqueId}`;

  const [svgSupported, setSvgSupported] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

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
    isDown: false,
  });

  const generateDisplacementMap = useCallback(
    (posX = 50, posY = 50, activeFactor = 0) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const actualWidth = Math.max(10, Math.floor(rect?.width || 400));
      const actualHeight = Math.max(10, Math.floor(rect?.height || 80));

      // Optical curvature: ensure the gradient spans nicely across the glass height
      const edgeFactor = Math.max(0.2, borderWidth);
      const edgeSize = Math.max(8, Math.min(actualWidth * 0.12, actualHeight * edgeFactor * 0.5));

      // Dynamic liquid lens ripple centered at pointer location
      const pointerRipple =
        activeFactor > 0.01
          ? `
          <radialGradient id="${pointerGradId}" cx="${posX.toFixed(1)}%" cy="${posY.toFixed(1)}%" r="${isClear ? "40%" : "34%"}" fx="${posX.toFixed(1)}%" fy="${posY.toFixed(1)}%">
            <stop offset="0%" stop-color="#ff3366" stop-opacity="${(activeFactor * (isClear ? 0.95 : 0.85)).toFixed(2)}" />
            <stop offset="35%" stop-color="#33ddff" stop-opacity="${(activeFactor * (isClear ? 0.7 : 0.6)).toFixed(2)}" />
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
    [borderRadius, borderWidth, brightness, opacity, blur, mixBlendMode, isClear, redGradId, blueGradId, pointerGradId]
  );

  const updateDisplacementMap = useCallback(
    (posX = 50, posY = 50, activeFactor = 0) => {
      if (!feImageRef.current || isNone) return;
      feImageRef.current.setAttribute("href", generateDisplacementMap(posX, posY, activeFactor));
    },
    [generateDisplacementMap, isNone]
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
    const chromaticBoost = p.currentActive * (isClear ? 16 : 10);
    if (redChannelRef.current) {
      redChannelRef.current.setAttribute(
        "scale",
        (effectiveDistortionScale + effectiveRedOffset - chromaticBoost * 0.5).toFixed(1)
      );
    }
    if (blueChannelRef.current) {
      blueChannelRef.current.setAttribute(
        "scale",
        (effectiveDistortionScale + effectiveBlueOffset + chromaticBoost).toFixed(1)
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
  }, [effectiveDistortionScale, effectiveRedOffset, effectiveBlueOffset, isClear, updateDisplacementMap]);

  const startAnimation = useCallback(() => {
    if (!animated) return;
    const p = pointerRef.current;
    if (!p.isAnimating) {
      p.isAnimating = true;
      p.rafId = requestAnimationFrame(animatePointer);
    }
  }, [animated, animatePointer]);

  // Pointer event handlers with tactile press support
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const p = pointerRef.current;
    p.targetX = Math.max(0, Math.min(100, x));
    p.targetY = Math.max(0, Math.min(100, y));
    p.targetActive = p.isDown ? 1.35 : 1;

    startAnimation();
  };

  const handlePointerEnter = () => {
    if (!interactive) return;
    pointerRef.current.targetActive = 1;
    startAnimation();
  };

  const handlePointerLeave = () => {
    if (!interactive) return;
    pointerRef.current.isDown = false;
    pointerRef.current.targetActive = 0;
    setIsPressed(false);
    startAnimation();
  };

  const handlePointerDown = () => {
    if (!interactive) return;
    pointerRef.current.isDown = true;
    pointerRef.current.targetActive = 1.35;
    setIsPressed(true);
    startAnimation();
    onPress?.();
  };

  const handlePointerUp = () => {
    if (!interactive) return;
    pointerRef.current.isDown = false;
    pointerRef.current.targetActive = 1;
    setIsPressed(false);
    startAnimation();
  };

  // Base filter setup
  useEffect(() => {
    if (isNone) return;
    updateDisplacementMap();
    [
      { ref: redChannelRef, offset: effectiveRedOffset },
      { ref: greenChannelRef, offset: effectiveGreenOffset },
      { ref: blueChannelRef, offset: effectiveBlueOffset },
    ].forEach(({ ref, offset }) => {
      if (ref.current) {
        ref.current.setAttribute("scale", (effectiveDistortionScale + offset).toString());
        ref.current.setAttribute("xChannelSelector", xChannel);
        ref.current.setAttribute("yChannelSelector", yChannel);
      }
    });

    gaussianBlurRef.current?.setAttribute("stdDeviation", effectiveDisplace.toString());
  }, [
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    effectiveDisplace,
    effectiveDistortionScale,
    effectiveRedOffset,
    effectiveGreenOffset,
    effectiveBlueOffset,
    xChannel,
    yChannel,
    mixBlendMode,
    isNone,
  ]);

  // ResizeObserver to adapt SVG displacement map to dimensions
  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined" || isNone) return;

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
  }, [updateDisplacementMap, isNone]);

  useEffect(() => {
    if (!isNone) {
      setTimeout(() => updateDisplacementMap(), 0);
    }
  }, [width, height, updateDisplacementMap, isNone]);

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

  const effectClass = isNone
    ? "glass-surface--effect-none"
    : isClear
      ? "glass-surface--effect-clear"
      : "glass-surface--effect-regular";

  const containerStyle: React.CSSProperties & Record<string, unknown> = {
    ...style,
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    "--glass-frost": effectiveBgOpacity,
    "--glass-saturation": effectiveSaturation,
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
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`glass-surface ${svgSupported ? "glass-surface--svg" : "glass-surface--fallback"} ${effectClass} ${interactive ? "glass-surface--interactive" : ""} ${isPressed ? "glass-surface--pressed" : ""} ${className}`}
      style={containerStyle}
    >
      {!isNone && (
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
              <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation={effectiveDisplace} />
            </filter>
          </defs>
        </svg>
      )}

      {/* Tint Color Overlay Layer */}
      {tintColor && (
        <div
          className="glass-surface__tint"
          style={{ backgroundColor: tintColor }}
          aria-hidden="true"
        />
      )}

      <div className="glass-surface__content">{children}</div>
    </div>
  );
}

export default GlassSurface;
