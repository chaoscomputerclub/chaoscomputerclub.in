import BlurText from "@/components/Motion/BlurText";
import { Rise } from "@/components/Motion/MaskedLine";

const ROWS = [
  {
    n: "4.1",
    k: "Knowledge Flow",
    v: "Knowledge should move. Experiments should be shareable, tools reusable, and discoveries passed forward.",
  },
  {
    n: "4.2",
    k: "Participation",
    v: "Whoever shows up is the club. The work speaks louder than pedigree.",
  },
  {
    n: "4.3",
    k: "Open Artifacts",
    v: "Real mastery is teaching someone who started today so the community learns from every failure.",
  },
];

/** Block 04 — asymmetric split: typographic column + wireframe screens. */
export function BlockScreensSplit() {
  return (
    <section id="codebase" className="border-b border-border px-4 py-20 md:px-6 md:py-28">
      <div className="flex items-baseline justify-between">
        <span className="kicker">(04 // The codebase)</span>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-index">INDEX 4.0</span>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <BlurText
            text="How We Work"
            delay={50}
            animateBy="letters"
            direction="top"
            as="h2"
            className="text-3xl font-medium md:text-4xl"
          />
          <ul className="mt-8 border-t border-border">
            {ROWS.map((r, i) => (
              <li key={r.n} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-border py-5">
                <span className="font-mono text-[0.6rem] tracking-[0.16em] text-index">{r.n}</span>
                <span>
                  <span className="block font-display text-sm">{r.k}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{r.v}</span>
                  <span className="notes-only mt-1 block font-mono text-[0.55rem] text-accent">
                    [ROW: {i + 1} · Y-OFFSET: {i * 84}px]
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Rise delay={0.1} className="md:col-span-6 md:col-start-7">
          <div data-spec-box className="grid grid-cols-6 grid-rows-4 gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square border border-border transition-colors duration-200 hover:border-accent hover:bg-accent/10"
                style={{ opacity: 0.35 + ((i * 7) % 10) / 15 }}
              />
            ))}
          </div>
          <p className="mt-4 font-mono text-[0.55rem] tracking-[0.2em] text-index">
            MODULE MAP · 6 × 4 · UNIT 1FR
          </p>
        </Rise>
      </div>
    </section>
  );
}
