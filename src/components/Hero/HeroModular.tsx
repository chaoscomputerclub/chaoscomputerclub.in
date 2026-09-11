import { motion } from "framer-motion";
import { Topography } from "@/components/Background/Topography";

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
  const glyphW = 5 * (U + GAP);
  const letterGap = U * 1.4;
  const totalW = WORD.length * glyphW + (WORD.length - 1) * letterGap;
  const totalH = 7 * (U + GAP);

  return (
    <section
      id="top"
      className="grain relative flex min-h-[75vh] items-center justify-center overflow-hidden border-b border-border py-24 md:min-h-[85vh] md:py-32"
    >
      {/* Topography Interactive Background */}
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80" />
      </div>

      {/* Hero content: Pure "CHAOS" geometric matrix */}
      <div className="relative z-10 w-full px-4 md:px-8">
        <div data-spec-box className="mx-auto max-w-6xl" aria-label="Chaos" role="img">
          <svg
            viewBox={`0 0 ${totalW} ${totalH}`}
            className="w-full text-foreground drop-shadow-[0_0_40px_rgba(204,255,0,0.18)]"
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
