import { MaskedLine, Rise } from "@/components/Motion/MaskedLine";

const STEPS = ["Explore", "Build", "Compete", "Fail", "Learn", "Share", "Repeat"];

/** Block 02 — horizontal billboard card with an embedded kinetic reel. */
export function BlockHorizontalReel() {
  const tape = [...STEPS, ...STEPS, ...STEPS, ...STEPS];

  return (
    <section id="forge" className="border-b border-border px-4 py-20 md:px-6 md:py-28">
      <div className="flex items-baseline justify-between">
        <span className="kicker">(The cycle)</span>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-index">INDEX 2.0</span>
      </div>

      <div
        data-spec-box
        className="chamfer mt-8 border border-border bg-bone text-bone-foreground"
        style={{ ["--cut" as string]: "40px" }}
      >
        <div className="grid gap-8 p-6 md:grid-cols-12 md:p-10">
          <MaskedLine as="h2" className="text-3xl font-medium md:col-span-6 md:text-4xl">
            Non-Linear Momentum
          </MaskedLine>
          <Rise delay={0.1} className="md:col-span-5 md:col-start-8">
            <p className="text-sm text-bone-foreground/70">
              Ideas are cheap until they meet reality. Write the code. Run the experiment. Break the
              machine.
            </p>
          </Rise>
        </div>

        <div className="overflow-hidden border-t border-black/10 py-5">
          <div className="reel__track">
            {tape.map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-6 pr-6 font-display text-xl whitespace-nowrap uppercase md:text-2xl"
              >
                {s}
                <span aria-hidden className="text-black/30">
                  ➔
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
