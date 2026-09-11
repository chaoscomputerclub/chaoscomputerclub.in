import BlurText from "@/components/Motion/BlurText";
import { Rise } from "@/components/Motion/MaskedLine";

const CONTRIBUTION_CELLS = Array.from({ length: 84 }).map((_, i) => {
  // Deterministic commit activity pattern with occasional acid-lime highlights
  const activity = (i * 13 + 7) % 11;
  const isHigh = activity > 7;
  const isAccent = (i * 17) % 19 === 0 || i === 42 || i === 73;
  return { id: i, isHigh, isAccent, activity };
});

const CYCLE_STEPS = [
  {
    step: "01",
    label: "Learn",
    desc: "Read how the masters architect real systems. Study source code like classical literature before writing a single line.",
  },
  {
    step: "02",
    label: "Build",
    desc: "Solve real, intractable engineering problems. Ship working prototypes, benchmarks, and tools under the pressure of the clock.",
  },
  {
    step: "03",
    label: "Contribute",
    desc: "Fix the bug, patch the memory leak, and submit the pull request upstream. Pay the debt forward to the global commons.",
  },
  {
    step: "04",
    label: "Share",
    desc: "Leave the door unlocked. Publish code, write clear documentation, and mentor the peer who started today.",
  },
];

const PILLARS = [
  {
    idx: "01",
    tag: "SOURCE AS LITERATURE",
    title: "Reading Before Writing",
    body: "Most students are taught to write toy programs in isolation. Real engineering begins by reading how massive distributed systems actually survive in the wild: studying SQLite for crash-safety, Redis for single-threaded event loops, and Linux for memory paging. The greatest computer science curriculum already exists on GitHub.",
  },
  {
    idx: "02",
    tag: "RADICAL MERITOCRACY",
    title: "The Patch is the Great Equalizer",
    body: "An open compiler does not care what university you attended, how old you are, or what title is on your resume. It only cares about correctness, memory safety, and whether the test suite passes. In open source, your reputation is built on the elegance of your diff and the humility of your peer reviews.",
  },
  {
    idx: "03",
    tag: "THE LIVING COMMONS",
    title: "Software as a Public Trust",
    body: "The internet was not gifted to us by a monopoly. It was built by volunteers who wrote RFCs, compilers, and kernels, and chose to leave the door unlocked behind them. We operate with that exact conviction: every line written in CCC belongs to humanity, open for inspection, fork, and contribution forever.",
  },
];

/** Block 04 — Open Source: Built to be shared */
export function BlockScreensSplit() {
  return (
    <section id="opensource" data-id="codebase" className="border-b border-border px-4 py-20 md:px-6 md:py-28">
      {/* Anchor for legacy link navigation */}
      <span id="codebase" className="sr-only" aria-hidden="true" />

      {/* Section Header */}
      <div className="flex items-baseline justify-between">
        <span className="kicker">(04 // OPEN SOURCE)</span>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-index uppercase">INDEX 4.0</span>
      </div>

      {/* Main Narrative Split */}
      <div className="mt-10 grid gap-12 md:grid-cols-12 items-start">
        {/* Left Column: Philosophy & Manifesto */}
        <div className="md:col-span-6">
          <BlurText
            text="Built to be shared."
            delay={45}
            animateBy="letters"
            direction="top"
            as="h2"
            className="text-3xl font-medium md:text-4xl lg:text-5xl leading-tight text-foreground tracking-tight"
          />

          <p className="mt-6 text-base md:text-lg leading-relaxed text-foreground/90 font-sans">
            The world runs on software built by people who chose to leave the door open.
          </p>

          <p className="mt-3 text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">
            Every operating system kernel, every web server, and every cryptographic library that preserves human privacy exists because developers decided to share their craft with strangers across the world.
          </p>

          {/* Three Core Axioms */}
          <div className="mt-6 border-l-2 border-accent/70 pl-4 py-1 space-y-3 font-mono text-sm sm:text-base text-foreground">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-accent text-xs">→</span>
                <span className="font-semibold text-foreground">We learn from it.</span>
              </div>
              <p className="mt-1 pl-4 text-xs font-sans text-muted-foreground leading-relaxed">
                We read how master engineers solve race conditions, manage cache lines, and handle catastrophic faults.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-accent text-xs">→</span>
                <span className="font-semibold text-foreground">We build on it.</span>
              </div>
              <p className="mt-1 pl-4 text-xs font-sans text-muted-foreground leading-relaxed">
                We stand on the shoulders of the global commons to build tools, architectures, and systems at the edge of comfort.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-accent text-xs">→</span>
                <span className="font-semibold text-accent">We contribute back.</span>
              </div>
              <p className="mt-1 pl-4 text-xs font-sans text-muted-foreground leading-relaxed">
                When we find a memory leak, a broken invariant, or an unoptimized hot path, we submit the patch upstream.
              </p>
            </div>
          </div>

          <p className="mt-7 text-sm md:text-base leading-relaxed text-muted-foreground font-sans">
            Chaos Computer Club exists to turn users into contributors — and contributors into community.
          </p>

          {/* Imperative Strip */}
          <div className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-none border border-border bg-surface/40 px-3.5 py-2 font-mono text-xs tracking-wider text-foreground">
            <span className="text-accent">USE IT.</span>
            <span className="opacity-30">/</span>
            <span className="text-foreground">UNDERSTAND IT.</span>
            <span className="opacity-30">/</span>
            <span className="text-foreground">IMPROVE IT.</span>
            <span className="opacity-30">/</span>
            <span className="text-accent font-semibold">SHARE IT.</span>
          </div>

          {/* The Cycle Definition */}
          <div className="mt-10 border-t border-border pt-7">
            <div className="font-mono text-xs font-semibold text-foreground tracking-wide uppercase">
              The code is open. So are we.
            </div>
            <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">
              We learn from what others built, contribute what we discover, and leave something better for whoever comes next. That&apos;s the cycle.
            </p>

            {/* Cycle Flow Breadcrumbs */}
            <div className="mt-5 flex flex-wrap items-center gap-2 font-mono text-xs text-foreground">
              <span className="border border-border/80 bg-surface/60 px-2.5 py-1">Learn</span>
              <span className="text-accent text-xs">→</span>
              <span className="border border-border/80 bg-surface/60 px-2.5 py-1">Build</span>
              <span className="text-accent text-xs">→</span>
              <span className="border border-accent/50 bg-accent/10 px-2.5 py-1 text-accent font-semibold">Contribute</span>
              <span className="text-accent text-xs">→</span>
              <span className="border border-border/80 bg-surface/60 px-2.5 py-1">Share</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Component (Contribution Heatmap & Protocol) */}
        <Rise delay={0.15} className="md:col-span-6 md:col-start-7">
          <div
            data-spec-box
            className="rounded-none border border-border bg-surface/40 p-5 md:p-7 backdrop-blur-md"
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-4 font-mono text-[0.62rem] tracking-wider uppercase text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-none bg-accent animate-pulse" />
                <span className="text-foreground font-semibold">GITHUB // CONTRIBUTION TELEMETRY</span>
              </div>
              <span className="text-accent text-[0.55rem]">[ LIVING COMMONS ]</span>
            </div>

            {/* Commit / Contribution Activity Heatmap Matrix */}
            <div className="mt-5">
              <div className="flex items-center justify-between font-mono text-[0.58rem] tracking-widest text-index uppercase mb-2.5">
                <span>PEER ACTIVITY MATRIX</span>
                <span>7 × 12 COMMIT GRAPH</span>
              </div>

              <div className="grid grid-cols-12 gap-1.5 p-3 border border-border/60 bg-background/60">
                {CONTRIBUTION_CELLS.map((c) => (
                  <div
                    key={c.id}
                    title={`Contribution cell #${c.id + 1}`}
                    className={`aspect-square transition-all duration-200 cursor-pointer ${
                      c.isAccent
                        ? "bg-accent hover:scale-110 shadow-[0_0_8px_rgba(204,255,0,0.5)]"
                        : c.isHigh
                        ? "bg-foreground/75 hover:bg-foreground hover:scale-110"
                        : c.activity > 3
                        ? "bg-foreground/30 hover:bg-foreground/60"
                        : "bg-border/40 hover:bg-border"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-2.5 flex items-center justify-between font-mono text-[0.52rem] text-index">
                <span>LESS ACTIVITY</span>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 bg-border/40" />
                  <span className="h-2 w-2 bg-foreground/30" />
                  <span className="h-2 w-2 bg-foreground/75" />
                  <span className="h-2 w-2 bg-accent" />
                </div>
                <span>MORE ACTIVITY</span>
              </div>
            </div>

            {/* The Cycle Step Details */}
            <div className="mt-6 border-t border-border/80 pt-5 space-y-3.5">
              <div className="font-mono text-[0.58rem] tracking-widest text-index uppercase mb-1">
                COMMONS PROTOCOL
              </div>
              {CYCLE_STEPS.map((s) => (
                <div key={s.step} className="grid grid-cols-[2.4rem_1fr] gap-3 items-start border-b border-border/40 pb-3">
                  <span className="font-mono text-xs text-accent font-semibold pt-0.5">{s.step}</span>
                  <div>
                    <span className="font-mono text-xs font-semibold uppercase text-foreground">{s.label}</span>
                    <p className="text-muted-foreground font-sans text-xs leading-relaxed mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Footer Action */}
            <div className="mt-6 border-t border-border/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
              <span className="text-[0.62rem] text-muted-foreground">
                All artifacts and tools are open by default.
              </span>
              <a
                href="https://github.com/santusht06/chaoscomputerclub.in"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-target shrink-0 inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[0.62rem] tracking-[0.14em] uppercase text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <span>[ Browse GitHub → ]</span>
              </a>
            </div>
          </div>
        </Rise>
      </div>

      {/* Deep-Dive Textual Pillars: The Reality & Craft of the Commons */}
      <div className="mt-16 md:mt-24 border-t border-border pt-12">
        <div className="flex items-center justify-between font-mono text-[0.6rem] tracking-[0.2em] text-index uppercase mb-8">
          <span>ETHICS OF THE CRAFT</span>
          <span>HOW WE PRACTICE OPEN SOURCE</span>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.idx}
              className="border border-border/70 bg-surface/30 p-6 flex flex-col justify-between transition-colors hover:border-accent/40"
            >
              <div>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-accent text-xs font-semibold">[{p.idx}]</span>
                  <span className="text-[0.55rem] tracking-wider text-index uppercase">{p.tag}</span>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-foreground tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-3 text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">
                  {p.body}
                </p>
              </div>

              <div className="mt-6 border-t border-border/40 pt-3 font-mono text-[0.52rem] text-accent tracking-widest uppercase">
                CCC_PRACTICE // UNRESTRICTED
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BlockScreensSplit;
