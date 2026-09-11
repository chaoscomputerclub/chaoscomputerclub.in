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
      className="grain relative flex h-screen min-h-[100dvh] w-full items-center justify-center overflow-hidden border-b border-border"
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

      {/* Hero content: Pure "CHAOS" interactive text with cinematic optical blur on hover */}
      <div className="relative z-20 w-full px-4 pt-16 md:px-8 md:pt-20">
        <div
          data-spec-box
          className="cursor-target mx-auto max-w-6xl relative cursor-crosshair"
          aria-label="Chaos"
          role="img"
          onPointerEnter={() => setIsHovered(true)}
        >
          {mounted ? (
            <ParticleText
              text="CHAOS"
              colors={["#ffffff", "#ffffff", "#ffffff", "#e8e8e8", "#CCFF00"]}
              particleSize={2.2}
              particleGap={2}
              friction={0.78}
              ease={0.06}
              mouseControls={{ enabled: true, radius: 170, strength: 5.5 }}
              className="w-full aspect-[331/77] drop-shadow-[0_0_50px_rgba(204,255,0,0.22)]"
              modular
            />
          ) : (
            <svg
              viewBox={`0 0 ${totalW} ${totalH}`}
              className="w-full text-foreground drop-shadow-[0_0_50px_rgba(204,255,0,0.22)]"
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
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroModular;
