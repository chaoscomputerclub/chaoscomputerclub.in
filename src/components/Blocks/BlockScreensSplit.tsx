import BlurText from "@/components/Motion/BlurText";
import { Rise } from "@/components/Motion/MaskedLine";

const ROWS = [
  {
    n: "4.1",
    k: "Public by Default",
    v: "Every system, tool, benchmark suite, and research note we build is published in the open. Zero proprietary walls, zero closed silos, and zero commercial gatekeeping.",
  },
  {
    n: "4.2",
    k: "Upstream Contributions",
    v: "We do not merely consume open source; we actively contribute to upstream projects, language runtimes, libraries, and kernels. Engineering means giving back to the commons.",
  },
  {
    n: "4.3",
    k: "Pull Requests over Pedigree",
    v: "Whoever shows up with working code shapes the club. Contributions are audited strictly on architectural clarity, safety, and performance—never academic standing or seniority.",
  },
  {
    n: "4.4",
    k: "Fork, Inspect & Rebuild",
    v: "Every line of code is designed to be forked, audited, and adapted. Open source is not a marketing label for us—it is the foundational operating system of the club.",
  },
];

const CONTRIBUTION_CELLS = Array.from({ length: 84 }).map((_, i) => {
  // Deterministic commit activity pattern with occasional acid-lime highlights
  const activity = (i * 13 + 7) % 11;
  const isHigh = activity > 7;
  const isAccent = (i * 17) % 19 === 0 || i === 42 || i === 73;
  return { id: i, isHigh, isAccent, activity };
});

/** Block 04 — Open Source: typographic breakdown + open source contribution telemetry */
export function BlockScreensSplit() {
  return (
    <section id="opensource" data-id="codebase" className="border-b border-border px-4 py-20 md:px-6 md:py-28">
      {/* Anchor for backwards compatibility */}
      <span id="codebase" className="sr-only" aria-hidden="true" />

      <div className="flex items-baseline justify-between">
        <span className="kicker">(04 // Open Source)</span>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-index uppercase">INDEX 4.0</span>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-12 items-start">
        {/* Left Column: Philosophy & Contribution Tenets */}
        <div className="md:col-span-6">
          <BlurText
            text="100% Open Source."
            delay={45}
            animateBy="letters"
            direction="top"
            as="h2"
            className="text-3xl font-medium md:text-4xl leading-tight"
          />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Chaos Computer Club is built entirely on the open source philosophy. We believe software, infrastructure, and knowledge belong in the public square. From day one, every tool we write is public, and every member is encouraged to contribute to the global open source commons.
          </p>

          <ul className="mt-8 border-t border-border">
            {ROWS.map((r, i) => (
              <li key={r.n} className="grid grid-cols-[3.2rem_1fr] gap-4 border-b border-border py-5">
                <span className="font-mono text-[0.62rem] tracking-[0.16em] text-index">{r.n}</span>
                <span>
                  <span className="block font-display text-sm font-medium text-foreground">{r.k}</span>
                  <span className="mt-1 block text-xs md:text-sm text-muted-foreground leading-relaxed">{r.v}</span>
                  <span className="notes-only mt-1.5 block font-mono text-[0.52rem] text-accent tracking-wider">
                    [SOURCE_SPEC: TENET_{i + 1} · PUBLIC_DOMAIN · UNRESTRICTED]
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Open Source Contribution Activity & Telemetry Panel */}
        <Rise delay={0.15} className="md:col-span-6 md:col-start-7">
          <div
            data-spec-box
            className="rounded-none border border-border bg-surface/40 p-5 md:p-7 backdrop-blur-sm"
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-4 font-mono text-[0.6rem] tracking-wider uppercase text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-none bg-accent animate-pulse" />
                <span className="text-foreground font-semibold">GITHUB // REPOSITORIES</span>
              </div>
              <span className="text-accent text-[0.55rem]">[ PUBLIC COMMONS ]</span>
            </div>

            {/* Commit / Contribution Activity Heatmap */}
            <div className="mt-5">
              <div className="flex items-center justify-between font-mono text-[0.58rem] tracking-widest text-index uppercase mb-2.5">
                <span>CONTRIBUTION TELEMETRY</span>
                <span>7 × 12 ACTIVE MATRIX</span>
              </div>

              <div className="grid grid-cols-12 gap-1.5 p-3 border border-border/60 bg-background/60">
                {CONTRIBUTION_CELLS.map((c) => (
                  <div
                    key={c.id}
                    title={`Commit cell #${c.id + 1}`}
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

            {/* Open Source Metrics Spec Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border/80 pt-5">
              <div>
                <span className="block font-mono text-[0.52rem] tracking-widest text-index uppercase">REPOS</span>
                <span className="font-mono text-sm font-bold text-foreground">100%</span>
                <span className="block font-mono text-[0.5rem] text-muted-foreground uppercase">PUBLIC</span>
              </div>
              <div>
                <span className="block font-mono text-[0.52rem] tracking-widest text-index uppercase">LICENSES</span>
                <span className="font-mono text-sm font-bold text-accent">MIT / APACHE</span>
                <span className="block font-mono text-[0.5rem] text-muted-foreground uppercase">PERMISSIVE</span>
              </div>
              <div>
                <span className="block font-mono text-[0.52rem] tracking-widest text-index uppercase">PULL REQS</span>
                <span className="font-mono text-sm font-bold text-foreground">MERIT</span>
                <span className="block font-mono text-[0.5rem] text-muted-foreground uppercase">REVIEWED</span>
              </div>
              <div>
                <span className="block font-mono text-[0.52rem] tracking-widest text-index uppercase">ACCESS</span>
                <span className="font-mono text-sm font-bold text-foreground">OPEN</span>
                <span className="block font-mono text-[0.5rem] text-muted-foreground uppercase">TO ALL</span>
              </div>
            </div>

            {/* CTA action link */}
            <div className="mt-6 border-t border-border/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
              <span className="text-[0.62rem] text-muted-foreground">
                All source code is available on GitHub under open licenses.
              </span>
              <a
                href="https://github.com/santusht06/chaoscomputerclub.in"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-target shrink-0 inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[0.62rem] tracking-[0.14em] uppercase text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <span>Browse Code</span>
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </Rise>
      </div>
    </section>
  );
}

export default BlockScreensSplit;
