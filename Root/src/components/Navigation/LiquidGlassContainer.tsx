/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

import React, { useId } from "react";

export interface LiquidGlassContainerProps {
  children?: React.ReactNode;
  spacing?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * LiquidGlassContainer (inspired by Apple iOS 26 UIGlassContainerEffect / @callstack/liquid-glass)
 * Allows child glass surfaces and droplets to fluidly merge like molten glass or mercury.
 */
export function LiquidGlassContainer({
  children,
  spacing = 20,
  className = "",
  style = {},
}: LiquidGlassContainerProps) {
  const uniqueId = useId().replace(/:/g, "-");
  const filterId = `liquid-metaball-filter-${uniqueId}`;

  // Standardize spacing to blur & contrast threshold
  const blurAmount = Math.max(4, Math.min(24, spacing * 0.5));
  const contrast = 22;
  const threshold = 10;

  return (
    <div
      className={`liquid-glass-container relative flex items-center ${className}`}
      style={{
        filter: `url(#${filterId})`,
        ...style,
      }}
    >
      <svg
        className="absolute inset-0 pointer-events-none opacity-0 -z-10"
        width="0"
        height="0"
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blurAmount} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values={`1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 ${contrast} -${threshold}`}
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      {children}
    </div>
  );
}

export default LiquidGlassContainer;
