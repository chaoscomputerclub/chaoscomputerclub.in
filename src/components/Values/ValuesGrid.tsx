import { motion } from "framer-motion";
import { MaskedLine } from "@/components/Motion/MaskedLine";

const EASE = [0.16, 1, 0.3, 1] as const;

const VALUES = [
  {
    t: "Curiosity over Certainty",
    d: "You don't need all the answers. You need the audacity to ask the question.",
  },
  {
    t: "Practice over Performance",
    d: "A certificate proves attendance. A solved constraint proves persistence.",
  },
  {
    t: "Competition without Hostility",
    d: "Someone else's victory is not your defeat. It is your next target.",
  },
  { t: "Building over Talking", d: "Don't explain your philosophy. Show the terminal output." },
  {
    t: "Failure without Embarrassment",
    d: "A broken system that yields understanding is a successful experiment.",
  },
  {
    t: "Sharing over Gatekeeping",
    d: "Knowledge is valueless when hoarded. Real mastery is teaching someone who started today.",
  },
  {
    t: "Merit over Labels",
    d: "Your CGPA, semester, or title means nothing here. Show what you can build.",
  },
];

/** Section 05 — symmetric 7-cell value matrix; every cell identical. */
export function ValuesGrid() {
  return (
    <section id="values" className="border-b border-border px-4 py-20 md:px-6 md:py-28">
      <div className="flex items-baseline justify-between">
        <span className="kicker">(05 // The matrix)</span>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-index">INDEX 5.0</span>
      </div>

      <MaskedLine as="h2" className="mt-6 max-w-2xl text-3xl font-medium md:text-4xl">
        Seven commitments, equal weight.
      </MaskedLine>

      <ul className="mt-12 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((v, i) => (
          <motion.li
            key={v.t}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-6%" }}
            transition={{ duration: 0.7, ease: EASE, delay: (i % 4) * 0.06 }}
            data-spec-box
            className="group flex h-full min-h-[13rem] flex-col justify-between bg-background p-6 transition-colors duration-200 hover:bg-bone hover:text-bone-foreground"
          >
            <span className="font-mono text-[0.55rem] tracking-[0.18em] text-index group-hover:text-bone-foreground/50">
              [{String(i + 1).padStart(2, "0")}]
            </span>
            <span>
              <h3 className="font-display text-base leading-tight font-medium">{v.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground group-hover:text-bone-foreground/70">
                {v.d}
              </p>
            </span>
          </motion.li>
        ))}
        <li aria-hidden className="hidden min-h-[13rem] items-end bg-background p-6 lg:flex">
          <span className="font-mono text-[0.55rem] tracking-[0.18em] text-index">
            [ 08 // RESERVED FOR YOURS ]
          </span>
        </li>
      </ul>
    </section>
  );
}
