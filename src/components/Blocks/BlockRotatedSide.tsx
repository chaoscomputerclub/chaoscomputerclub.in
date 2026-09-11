import BlurText from "@/components/Motion/BlurText";
import { Rise } from "@/components/Motion/MaskedLine";

/** Block 03 — sideways card with industrial cutouts. */
export function BlockRotatedSide() {
  return (
    <section id="chaos" className="border-b border-border px-4 py-20 md:px-6 md:py-28">
      <div className="flex items-baseline justify-between">
        <span className="kicker">(03 // Chaos)</span>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-index">INDEX 3.0</span>
      </div>

      <div className="mt-10 grid items-stretch gap-10 md:grid-cols-12">
        <div
          data-spec-box
          className="tag-cut relative flex min-h-[22rem] items-center justify-center border border-border-strong bg-surface md:col-span-4"
          style={{ ["--cut" as string]: "26px" }}
        >
          <span className="absolute top-3 left-3 tag-cut bg-accent px-2 py-1 font-mono text-[0.55rem] tracking-[0.18em] text-accent-foreground uppercase">
            CHOS // SPEC
          </span>
          <h2 className="font-display text-2xl font-medium uppercase md:text-3xl [writing-mode:vertical-rl] [text-orientation:mixed]">
            Curiosity over certainty
          </h2>
        </div>

        <div className="md:col-span-7 md:col-start-6 md:self-center">
          <BlurText
            text="Controlled Chaos"
            delay={50}
            animateBy="letters"
            direction="top"
            as="h3"
            className="text-2xl font-medium md:text-3xl"
          />
          <Rise delay={0.1}>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Chaos represents controlled disruption of assumptions — not destruction for its own
              sake. It is the instinct to look at an existing system and ask: &ldquo;Why was it
              built this way?&rdquo; &ldquo;What happens if I change it?&rdquo; and &ldquo;What can
              I learn from the result?&rdquo;
            </p>
          </Rise>
        </div>
      </div>
    </section>
  );
}
