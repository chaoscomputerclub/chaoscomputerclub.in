import { MaskedLine, Rise } from "@/components/Motion/MaskedLine";

const ROWS = [
  { n: "4.1", k: "Repository", v: "Every experiment is committed, reviewed, and kept." },
  { n: "4.2", k: "Peers", v: "Whoever shows up is the club. Merit decides the rest." },
  { n: "4.3", k: "Teaching", v: "Mastery is explaining it to someone who started today." },
];

/** Block 04 — asymmetric split: typographic column + wireframe screens. */
export function BlockScreensSplit() {
  return (
    <section id="codebase" className="border-b border-border px-4 py-20 md:px-6 md:py-28">
      <div className="flex items-baseline justify-between">
        <span className="kicker">(The record)</span>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-index">INDEX 4.0</span>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <MaskedLine as="h2" className="text-3xl font-medium md:text-4xl">
            The Codebase
          </MaskedLine>
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
