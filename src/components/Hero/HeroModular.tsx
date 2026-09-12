/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

import { useState, useEffect } from "react";
import { Topography } from "@/components/Background/Topography";
import { ParticleText } from "@/components/ParticleText";

/** 5x7 modular matrices for SSR fallback */
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

export function HeroModular() {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const glyphW = 5 * (U + GAP);
  const letterGap = U * 1.4;
  const totalW = WORD.length * glyphW + (WORD.length - 1) * letterGap;
  const totalH = 7 * (U + GAP);

  return (
    <section
      id="top"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onPointerMove={() => {
        if (!isHovered) setIsHovered(true);
      }}
      className="grain relative flex h-screen min-h-[100dvh] w-full overflow-hidden border-b border-border"
    >
      {/* Topography Interactive Background - Full Screen */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Topography
          lowColor="#ffffff"
          midColor="#CCFF00"
          highColor="#ffffff"
          speed={0.35}
          morphAmount={1.2}
          morphSpeed={0.05}
          bands={3}
          thickness={0.01}
          scale={2}
          pixelSize={1}
          glow={0.15}
          colorMode="alternating"
          contrast={3}
          brightness={1.1}
          fillBands={false}
          opacity={1}
          grain
          grainIntensity={0.05}
          mouseInteraction
          mouseRadius={0.3}
          mouseStrength={0.4}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/80" />
      </div>

      {/* CHAOS particle canvas — fills the full hero section so scattered particles never clip */}
      <div
        data-spec-box
        className="cursor-target absolute inset-0 z-20 cursor-crosshair"
        aria-label="Chaos"
        role="img"
        onPointerEnter={() => setIsHovered(true)}
      >
        {mounted ? (
          <ParticleText
            text="CHAOS"
            colors={["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#CCFF00"]}
            particleSize={2.4}
            particleGap={0.6}
            friction={0.8}
            ease={0.07}
            mouseControls={{ enabled: true, radius: 160, strength: 5.5 }}
            className="h-full w-full drop-shadow-[0_0_50px_rgba(204,255,0,0.22)]"
            modular
            textMaxWidthPx={1152}
          />
        ) : (
          /* SSR fallback — centers the SVG glyph in the full viewport */
          <div className="flex h-full w-full items-center justify-center px-4 pt-20 md:px-8 md:pt-24">
            <svg
              viewBox={`0 0 ${totalW} ${totalH}`}
              className="w-full max-w-5xl text-foreground drop-shadow-[0_0_50px_rgba(204,255,0,0.22)]"
              preserveAspectRatio="xMidYMid meet"
            >
              {WORD.split("").map((c, charIdx) => {
                const rows = GLYPHS[c] || [];
                const offset = charIdx * (glyphW + letterGap);
                return (
                  <g key={charIdx} transform={`translate(${offset} 0)`}>
                    {rows.flatMap((row, y) =>
                      row.split("").map((v, x) => {
                        if (v !== "1") return null;
                        const chamfer = (x + y + charIdx) % 4 === 0;
                        const px = x * (U + GAP);
                        const py = y * (U + GAP);
                        const points = chamfer
                          ? `${px},${py} ${px + U - 3},${py} ${px + U},${py + 3} ${px + U},${py + U} ${px},${py + U}`
                          : `${px},${py} ${px + U},${py} ${px + U},${py + U} ${px},${py + U}`;
                        return (
                          <polygon
                            key={`${x}-${y}`}
                            points={points}
                            fill="currentColor"
                          />
                        );
                      })
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroModular;
