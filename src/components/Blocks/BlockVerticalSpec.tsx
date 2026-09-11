/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

import { motion } from "framer-motion";
import BlurText from "@/components/Motion/BlurText";

const EASE = [0.16, 1, 0.3, 1] as const;

const SPECS = [
  {
    n: "1.1",
    k: "Constraints",
    v: "Classroom builds for marks. The Forge builds under real clock pressure.",
  },
  {
    n: "1.2",
    k: "Systems",
    v: "Studying algorithms without competing is reading sheet music without playing.",
  },
  {
    n: "1.3",
    k: "Failure mode",
    v: "In school, failure is a grade. In Chaos, failure is diagnostic telemetry.",
  },
  {
    n: "1.4",
    k: "Destination",
    v: "You graduate knowing syntax, or you graduate knowing capability.",
  },
];

/** Block 01 — vertical spec card. */
export function BlockVerticalSpec() {
  return (
    <section id="gap" className="border-b border-border px-4 py-20 md:px-6 md:py-28">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <span className="kicker">(01 // The gap)</span>
          <BlurText
            text="Theory vs Reality"
            delay={50}
            animateBy="letters"
            direction="top"
            as="h2"
            className="mt-6 text-3xl font-medium md:text-4xl"
          />
          <p className="mt-6 font-mono text-[0.6rem] tracking-[0.2em] text-index">
            INDEX 1.0 <span className="notes-only">· w: 335px · h: 426px</span>
          </p>
        </div>

        <div data-spec-box className="md:col-span-7 md:col-start-6">
          <ul className="border-t border-border">
            {SPECS.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }}
                className="group grid grid-cols-[3rem_1fr] items-start gap-4 border-b border-border py-6 transition-colors duration-200 hover:bg-surface md:grid-cols-[3rem_10rem_1fr]"
              >
                <span className="font-mono text-[0.6rem] tracking-[0.16em] text-index">{s.n}</span>
                <span className="font-display text-base text-foreground transition-colors duration-200 group-hover:text-accent">
                  {s.k}
                </span>
                <span className="col-span-2 text-sm text-muted-foreground md:col-span-1">
                  {s.v}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
