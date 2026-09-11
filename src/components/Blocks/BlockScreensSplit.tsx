import BlurText from "@/components/Motion/BlurText";
import { Rise } from "@/components/Motion/MaskedLine";

const PRINCIPLES = [
  {
    n: "4.1",
    k: "Strangers Building Together",
    v: "Thousands of developers across different continents and timezones, who have never met and never will, voluntarily maintaining the operating systems, compilers, and cryptographic primitives that power human civilization. No corporate mandate—just unselfish craft.",
  },
  {
    n: "4.2",
    k: "The Greatest Apprenticeship",
    v: "In closed software, you only see the surface. In open source, the architecture of the world is an open book. You learn to write real software by reading how the masters solve concurrency, allocate memory, and handle catastrophic failure.",
  },
  {
    n: "4.3",
    k: "The Patch is the Equalizer",
    v: "An open compiler does not care about your age, your university, or your title. It cares about correctness, memory safety, and algorithmic clarity. If the patch is sound and the tests pass, it merges. Merit over pedigree, always.",
  },
  {
    n: "4.4",
    k: "Returning to the Commons",
    v: "Everything we create at Chaos Computer Club rests on the shoulders of the open source movement. We honor that gift not with words, but with contributions: publishing our code, submitting upstream patches, and leaving the door unlocked for the next generation.",
  },
];

const GIT_PATCH_LINES = [
  { type: "meta", text: "commit 9b4d18 · upstream/core-runtime" },
  { type: "meta", text: "Author: peer@chaoscomputerclub.in" },
  { type: "meta", text: "Date:   03:42:19 UTC · 14 timezones away" },
  { type: "blank", text: "" },
  { type: "meta", text: "    fix(concurrency): eliminate lock contention in peer dispatch" },
  { type: "blank", text: "" },
  { type: "diff-del", text: "-   // closed architecture: opaque binary execution" },
  { type: "diff-del", text: "-   acquire_exclusive_mutex_or_fail(&system_lock);" },
  { type: "diff-add", text: "+   // open architecture: lock-free ring buffer across peers" },
  { type: "diff-add", text: "+   pub fn dispatch_unbounded<T: Send>(packet: T) -> Result<(), Chaos> {" },
  { type: "diff-add", text: "+       peer_commons.broadcast_transparent(packet)" },
  { type: "diff-add", text: "+   }" },
  { type: "blank", text: "" },
  { type: "review", text: ">> Reviewed by upstream maintainer:" },
  { type: "review-quote", text: "\"Elegant patch. Zero regression. Tested across 1,024 nodes. Merged into main.\"" },
];

/** Block 04 — The Open Source Commons: Soul, Philosophy & Global Collaboration */
export function BlockScreensSplit() {
  return (
    <section id="opensource" data-id="codebase" className="border-b border-border px-4 py-20 md:px-6 md:py-28">
      {/* Anchor for legacy link navigation */}
      <span id="codebase" className="sr-only" aria-hidden="true" />

      <div className="flex items-baseline justify-between">
        <span className="kicker">(04 // Open source)</span>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-index uppercase">INDEX 4.0</span>
      </div>

      <div className="mt-10 grid gap-12 md:grid-cols-12 items-start">
        {/* Left Column: The Philosophy & Humanity of Open Source */}
        <div className="md:col-span-6">
          <BlurText
            text="The Shared Commons."
            delay={45}
            animateBy="letters"
            direction="top"
            as="h2"
            className="text-3xl font-medium md:text-4xl leading-tight"
          />
          <p className="mt-5 text-sm md:text-base leading-relaxed text-muted-foreground font-sans">
            Open source is not a license or a marketing badge. It is the quietest, most audacious human experiment in history: millions of builders worldwide choosing to solve hard problems in public, so that no one ever has to solve them alone again.
          </p>

          <ul className="mt-8 border-t border-border">
            {PRINCIPLES.map((r, i) => (
              <li key={r.n} className="grid grid-cols-[3.2rem_1fr] gap-4 border-b border-border py-6">
                <span className="font-mono text-[0.62rem] tracking-[0.16em] text-index pt-0.5">{r.n}</span>
                <span>
                  <span className="block font-display text-sm font-semibold text-foreground tracking-tight">{r.k}</span>
                  <span className="mt-1.5 block text-xs md:text-sm text-muted-foreground leading-relaxed font-sans">{r.v}</span>
                  <span className="notes-only mt-2 block font-mono text-[0.52rem] text-accent tracking-widest uppercase">
                    [COMMONS_TENET: 0{i + 1} · ZERO_GATEKEEPING · UNRESTRICTED]
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: The Living Artifact of Collaboration */}
        <Rise delay={0.15} className="md:col-span-6 md:col-start-7">
          <div
            data-spec-box
            className="rounded-none border border-border bg-surface/40 p-5 md:p-6 backdrop-blur-md"
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-3 font-mono text-[0.62rem] tracking-wider uppercase">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-none bg-accent" />
                <span className="text-foreground font-semibold">THE LIVING DIFF</span>
              </div>
              <span className="text-index font-mono text-[0.55rem]">UPSTREAM // COLLABORATION</span>
            </div>

            {/* Code / Git Patch Anatomy */}
            <div className="mt-4 overflow-x-auto rounded-none border border-border/70 bg-background/90 p-4 font-mono text-[0.68rem] leading-relaxed">
              {GIT_PATCH_LINES.map((l, idx) => {
                if (l.type === "blank") return <div key={idx} className="h-2" />;
                if (l.type === "meta") {
                  return (
                    <div key={idx} className="text-muted-foreground/80 select-none">
                      {l.text}
                    </div>
                  );
                }
                if (l.type === "diff-del") {
                  return (
                    <div key={idx} className="text-red-400/80 bg-red-950/20 px-1 font-mono">
                      {l.text}
                    </div>
                  );
                }
                if (l.type === "diff-add") {
                  return (
                    <div key={idx} className="text-accent bg-accent/10 px-1 font-mono font-medium">
                      {l.text}
                    </div>
                  );
                }
                if (l.type === "review") {
                  return (
                    <div key={idx} className="text-foreground font-semibold mt-1">
                      {l.text}
                    </div>
                  );
                }
                if (l.type === "review-quote") {
                  return (
                    <div key={idx} className="italic text-bone/90 pl-3 border-l border-accent/60 mt-1">
                      {l.text}
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Philosophy Reflections Strip */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/80 pt-4 font-mono text-[0.64rem]">
              <div className="border border-border/50 bg-background/50 p-3">
                <span className="text-index block text-[0.52rem] tracking-widest uppercase">LINUS LAW</span>
                <p className="mt-1 text-muted-foreground leading-normal font-sans italic text-xs">
                  &ldquo;Given enough eyeballs, all bugs are shallow.&rdquo;
                </p>
                <span className="mt-2 block text-foreground font-mono text-[0.55rem]">
                  — The power of transparent peer review
                </span>
              </div>
              <div className="border border-border/50 bg-background/50 p-3">
                <span className="text-index block text-[0.52rem] tracking-widest uppercase">OUR COMMITMENT</span>
                <p className="mt-1 text-muted-foreground leading-normal font-sans text-xs">
                  Every tool, benchmark, and line written in Chaos Computer Club is open for inspection, fork, and contribution.
                </p>
                <span className="mt-2 block text-accent font-mono text-[0.55rem]">
                  — Public by default. Forever.
                </span>
              </div>
            </div>

            {/* Quiet Footer Note */}
            <div className="mt-5 border-t border-border/80 pt-4 flex items-center justify-between text-xs font-mono">
              <span className="text-[0.62rem] text-muted-foreground tracking-wide">
                Build software that outlives you.
              </span>
              <a
                href="https://github.com/santusht06/chaoscomputerclub.in"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-target inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-[0.62rem] tracking-[0.14em] uppercase text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <span>[ View Repositories → ]</span>
              </a>
            </div>
          </div>
        </Rise>
      </div>
    </section>
  );
}

export default BlockScreensSplit;
