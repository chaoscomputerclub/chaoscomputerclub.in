import { useState } from "react";
import { motion } from "framer-motion";
import { Topography } from "@/components/Background/Topography";
import { ShapeBlur } from "@/components/Hero/ShapeBlur";

const EASE = [0.16, 1, 0.3, 1] as const;

/** 5x7 modular matrices — each glyph is assembled from geometric blocks. */
const GLYPHS: Record<string, string[]> = {
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
};

const WORD = "CHAOS";
const U = 10; // unit size
const GAP = 1;

function Glyph({ char, offset, index }: { char: string; offset: number; index: number }) {
  const rows = GLYPHS[char]!;
  const cells: { x: number; y: number; i: number }[] = [];
  rows.forEach((row, y) =>
    row.split("").forEach((v, x) => {
      if (v === "1") cells.push({ x, y, i: cells.length });
    }),
  );

  return (
    <g transform={`translate(${offset} 0)`}>
      {cells.map((c, i) => {
        const chamfer = (c.x + c.y + index) % 4 === 0;
        const px = c.x * (U + GAP);
        const py = c.y * (U + GAP);
        const points = chamfer
          ? `${px},${py} ${px + U - 3},${py} ${px + U},${py + 3} ${px + U},${py + U} ${px},${py + U}`
          : `${px},${py} ${px + U},${py} ${px + U},${py + U} ${px},${py + U}`;
        return (
          <motion.polygon
            key={`${c.x}-${c.y}`}
            points={points}
            fill="currentColor"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.35 + (index * 8 + i) * 0.012 }}
          />
        );
      })}
    </g>
  );
}

export function HeroModular() {
  const [isHovered, setIsHovered] = useState(false);
  const glyphW = 5 * (U + GAP);
  const letterGap = U * 1.4;
  const totalW = WORD.length * glyphW + (WORD.length - 1) * letterGap;
  const totalH = 7 * (U + GAP);

  return (
    <section
      id="top"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

      {/* Hero content: Pure "CHAOS" geometric matrix with React Bits ShapeBlur on hover */}
      <div className="relative z-10 w-full px-4 pt-16 md:px-8 md:pt-20">
        <div data-spec-box className="relative mx-auto max-w-6xl" aria-label="Chaos" role="img">
          {/* Exact React Bits ShapeBlur layer */}
          <div
            className={`pointer-events-none absolute -inset-6 sm:-inset-10 md:-inset-14 z-20 transition-opacity duration-500 ease-out ${
              isHovered ? "opacity-90" : "opacity-0"
            }`}
            style={{ mixBlendMode: "screen" }}
          >
            <ShapeBlur
              variation={0}
              shapeSize={1.15}
              roundness={0.45}
              borderSize={0.05}
              circleSize={0.28}
              circleEdge={0.8}
            />
          </div>

          <svg
            viewBox={`0 0 ${totalW} ${totalH}`}
            className="relative z-10 w-full text-foreground drop-shadow-[0_0_50px_rgba(204,255,0,0.22)]"
            preserveAspectRatio="xMidYMid meet"
          >
            {WORD.split("").map((c, i) => (
              <Glyph key={i} char={c} index={i} offset={i * (glyphW + letterGap)} />
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}

export default HeroModular;
