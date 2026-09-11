import BlurText from "@/components/Motion/BlurText";
import ScrollStack, { ScrollStackItem } from "./ScrollStack";

interface Commitment {
  index: string;
  code: string;
  title: string;
  description: string;
  keyword: string;
  bg: string;
  text: string;
  accent: string;
  subtle: string;
  border: string;
}

/*
 * Palette design intent:
 * — Card 01: warm parchment (#F2EDE4) — intentionally close to section bg (#EDE8DF)
 *   so the first card *eases in* rather than jumping. The subtle border makes it
 *   legible against the warm white section background.
 * — Cards 02–07: dark/high-contrast slabs that give the dramatic overwrite feel.
 *   No rainbow — instead: charcoal, ink, slate, void, and two warm darks.
 *   Each accent is restrained (one colour per card, used sparingly).
 */
const COMMITMENTS: Commitment[] = [
  {
    index: "01",
    code: "CURIOSITY",
    title: "Curiosity over Certainty",
    description:
      "You don't need all the answers. You need the audacity to ask the question. Dogma is comfortable; inquiry is generative.",
    keyword: "EXPLORATION · AUDACITY",
    bg: "#F2EDE4",        // warm parchment — blends with section, card boundary is gentle
    text: "#1a1814",
    accent: "#8B7355",    // muted tan — understated on light bg
    subtle: "#7c7467",
    border: "#DDD8CE",
  },
  {
    index: "02",
    code: "PRACTICE",
    title: "Practice over Performance",
    description:
      "A certificate proves attendance. A solved constraint proves persistence. True capability is forged in unglamorous reps.",
    keyword: "EXECUTION · BENCHMARK",
    bg: "#111110",        // near-black warm void
    text: "#E8E4DC",
    accent: "#CCFF00",    // acid lime on near-black — classic
    subtle: "#6b6860",
    border: "#1e1e1c",
  },
  {
    index: "03",
    code: "COMPETE",
    title: "Competition without Hostility",
    description:
      "Someone else's victory is not your defeat. It is your next target. We elevate standards collectively by competing fiercely.",
    keyword: "ARENA · RIVALRY",
    bg: "#1C1917",        // dark warm charcoal
    text: "#F5F0E8",
    accent: "#E5784A",    // warm terracotta
    subtle: "#8a7d72",
    border: "#2a2523",
  },
  {
    index: "04",
    code: "BUILD",
    title: "Building over Talking",
    description:
      "Don't explain your philosophy. Show the terminal output. Code that runs in production answers every philosophical debate.",
    keyword: "ARTIFACT · DELIVERY",
    bg: "#0D0D0D",        // pure ink black
    text: "#F0EDE8",
    accent: "#C9B99A",    // warm sand/cream accent
    subtle: "#5a5752",
    border: "#1a1a1a",
  },
  {
    index: "05",
    code: "FAIL",
    title: "Failure without Embarrassment",
    description:
      "A broken system that yields understanding is a successful experiment. Hide nothing; diagnose cleanly; iterate immediately.",
    keyword: "POSTMORTEM · ITERATE",
    bg: "#141210",        // deep warm dark
    text: "#EDE8E0",
    accent: "#A89070",    // muted ochre
    subtle: "#6b6358",
    border: "#201e1b",
  },
  {
    index: "06",
    code: "SHARE",
    title: "Sharing over Gatekeeping",
    description:
      "Knowledge should move. Experiments should be shareable, tools reusable, and improvements returned to the collective. Real mastery is teaching someone who started today.",
    keyword: "TRANSMISSION · COMMONS",
    bg: "#0F0F10",        // cool near-black
    text: "#DDD8D0",
    accent: "#8899BB",    // muted slate-blue
    subtle: "#60605c",
    border: "#1c1c1e",
  },
  {
    index: "07",
    code: "MERIT",
    title: "Merit over Labels",
    description:
      "Your CGPA, semester, or title means nothing here. Show what you can build. Here, the work speaks louder than pedigree.",
    keyword: "PROOF · SOVEREIGN",
    bg: "#18120A",        // deep warm brown-black
    text: "#F0E8DC",
    accent: "#D4A96A",    // antique gold
    subtle: "#7a6a58",
    border: "#261d12",
  },
];

/**
 * Section 05 — The Matrix
 * 80vw cards with overwrite effect (each card slides cleanly over the previous one,
 * no cascading borders, no book-spine offset, no extra dead scroll space).
 * Header is left-aligned (consistent with the rest of the site).
 */
export function ValuesGrid() {
  return (
    <section
      id="values"
      className="relative border-b border-border overflow-hidden"
      style={{ background: "#EDE8DF" }}
    >
      {/* ── Header ── left-aligned, consistent with other sections ── */}
      <div className="px-4 py-20 md:px-6 md:py-28">
        <div className="flex items-baseline justify-between">
          <span className="kicker" style={{ color: "rgba(0, 0, 0, 0.6)" }}>(05 // The matrix)</span>
          <span
            className="font-mono text-[0.6rem] tracking-[0.2em] uppercase"
            style={{ color: "rgba(0, 0, 0, 0.45)" }}
          >
            INDEX 5.0
          </span>
        </div>

        <BlurText
          text="Seven commitments, equal weight."
          delay={40}
          animateBy="letters"
          direction="top"
          as="h2"
          className="mt-6 text-3xl font-medium md:text-4xl text-black"
        />

        <p
          className="mt-4 font-mono text-xs uppercase tracking-wider"
          style={{ color: "rgba(0, 0, 0, 0.65)" }}
        >
          Scroll to unpack the architectural tenets of Chaos Computer Club.
        </p>
      </div>

      {/* ── ScrollStack — 80vw cards, clean overwrite effect ── */}
      <div className="w-full pb-20">
        <ScrollStack
          useWindowScroll={true}
          overwriteEffect={true}
          itemDistance={0}
          stackPosition="10%"
          className="w-full"
        >
          {COMMITMENTS.map((c) => (
            <ScrollStackItem key={c.code} itemClassName="w-[80vw] mx-auto">
              {/* Outer card shell — dimensions live here, NOT on the inner content div */}
              <div
                className="cursor-target group relative w-full overflow-hidden"
                style={{
                  backgroundColor: c.bg,
                  border: `1px solid ${c.border}`,
                  height: "72vh",
                  maxHeight: "680px",
                  minHeight: "480px",
                  boxShadow:
                    c.index === "01"
                      ? "0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)"
                      : "0 -12px 36px -4px rgba(0, 0, 0, 0.5), 0 20px 40px -10px rgba(0, 0, 0, 0.6)",
                }}
              >
                {/* Giant background watermark number */}
                <span
                  className="pointer-events-none absolute right-0 bottom-0 select-none font-mono font-black leading-none translate-x-[8%] translate-y-[12%]"
                  style={{
                    fontSize: "clamp(8rem, 20vw, 22rem)",
                    color: c.text,
                    opacity: 0.05,
                    lineHeight: 1,
                  }}
                >
                  {c.index}
                </span>

                {/* Card inner layout — flex col, full height */}
                <div className="relative z-10 flex flex-col justify-between h-full p-8 md:p-14">

                  {/* Top: keyword + counter */}
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="font-mono text-[0.58rem] font-semibold tracking-[0.22em] uppercase"
                      style={{ color: c.accent }}
                    >
                      {c.keyword}
                    </span>
                    <span
                      className="font-mono text-[0.52rem] tracking-[0.18em] uppercase"
                      style={{ color: c.subtle }}
                    >
                      {c.index} / 07
                    </span>
                  </div>

                  {/* Bottom: title + description side-by-side */}
                  <div className="md:grid md:grid-cols-12 md:gap-12 items-end">

                    {/* Left — code kicker + headline */}
                    <div className="md:col-span-7">
                      <div
                        className="font-mono text-[0.58rem] tracking-[0.2em] uppercase mb-4 flex items-center gap-1.5"
                        style={{ color: c.accent }}
                      >
                        <span>▶</span>
                        <span>{c.code}</span>
                      </div>
                      <h3
                        className="font-display tracking-tight leading-[1.04]"
                        style={{
                          color: c.text,
                          fontSize: "clamp(2rem, 4.8vw, 4.8rem)",
                          fontWeight: 700,
                        }}
                      >
                        {c.title}
                      </h3>
                    </div>

                    {/* Right — description */}
                    <div className="md:col-span-5 mt-6 md:mt-0">
                      <p
                        className="text-sm md:text-base leading-relaxed font-sans"
                        style={{ color: c.subtle }}
                      >
                        {c.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer strip */}
                  <div
                    className="pt-4 flex items-center justify-between font-mono text-[0.48rem] tracking-[0.2em] uppercase"
                    style={{
                      borderTop: `1px solid ${c.border}`,
                      color: c.subtle,
                    }}
                  >
                    <span>CHAOS COMPUTER CLUB · TENET {c.index}</span>
                    <span style={{ color: c.accent }}>ACTIVE</span>
                  </div>

                </div>
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </section>
  );
}

export default ValuesGrid;
