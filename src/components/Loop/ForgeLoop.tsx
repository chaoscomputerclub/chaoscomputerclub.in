import { useState } from "react";
import BlurText from "@/components/Motion/BlurText";
import { TelemetryClock } from "@/components/Hero/TelemetryClock";
import { cn } from "@/lib/utils";

const STAGES = [
  { k: "Explore", d: "Ask why the system was built this way." },
  { k: "Build", d: "Make the thing badly, first." },
  { k: "Compete", d: "Put it against a clock and a better opponent." },
  { k: "Fail", d: "Watch it break at scale." },
  { k: "Learn", d: "Find the exact reason it broke." },
  { k: "Share", d: "Turn individual insight into community knowledge." },
  { k: "Repeat", d: "The cycle is the community." },
];

/** Section 06 — sequential cycle explorer beside the live telemetry dial. */
export function ForgeLoop() {
  const [active, setActive] = useState(0);

  return (
    <section id="telemetry" className="border-b border-border px-4 py-20 md:px-6 md:py-28">
      <div className="flex items-baseline justify-between">
        <span className="kicker">(06 // Telemetry)</span>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-index">INDEX 6.0</span>
      </div>

      <div className="mt-10 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <BlurText
            text="The Forge Loop"
            delay={45}
            animateBy="letters"
            direction="top"
            as="h2"
            className="text-3xl font-medium md:text-4xl"
          />
          <ol className="mt-8 border-t border-border">
            {STAGES.map((s, i) => (
              <li key={s.k}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  aria-current={i === active}
                  className={cn(
                    "flex w-full items-baseline gap-4 border-b border-border py-4 text-left transition-colors duration-200",
                    i === active ? "text-accent" : "text-foreground hover:text-accent",
                  )}
                >
                  <span className="font-mono text-[0.55rem] tracking-[0.16em] text-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-lg uppercase">{s.k}</span>
                  <span
                    className={cn(
                      "ml-auto text-right text-xs text-muted-foreground transition-opacity duration-200",
                      i === active ? "opacity-100" : "opacity-0",
                    )}
                  >
                    {s.d}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="md:col-span-5 md:col-start-8">
          <div data-spec-box className="border border-border bg-surface p-6">
            <TelemetryClock />
          </div>
          <p className="mt-8 max-w-sm font-display text-lg">
            You don&apos;t need to be the best programmer in the room. You just need the courage to
            enter it.
          </p>
        </div>
      </div>
    </section>
  );
}
