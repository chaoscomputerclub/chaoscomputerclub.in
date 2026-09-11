/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Cinematic entry: a descending wireframe filmstrip of the club's modular
 * blocks, then the curtain lifts to hand off to the hero.
 */
export function CurtainPreloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => setDone(true), 2000);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (done) document.body.style.overflow = "";
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] overflow-hidden bg-background"
          aria-hidden
          exit={{ y: "-100%" }}
          transition={{ duration: 1, ease: EASE }}
        >
          <div className="absolute inset-0 grid place-items-center">
            <motion.div
              className="flex w-[62vw] max-w-[520px] flex-col gap-3"
              initial={{ y: "-46%", scale: 0.82 }}
              animate={{ y: "0%", scale: 1 }}
              transition={{ duration: 1.8, ease: EASE }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="tag-cut flex h-14 items-end justify-between border border-border-strong px-3 pb-2"
                  style={{ ["--cut" as string]: "12px", opacity: 0.25 + i * 0.18 }}
                >
                  <span className="font-mono text-[0.55rem] tracking-[0.2em] text-index">
                    MOD_{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[0.55rem] tracking-[0.2em] text-index">
                    {760 + i * 40}px
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
          <div className="absolute inset-x-0 bottom-6 flex items-center justify-between px-6">
            <span className="font-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground">
              CHAOS COMPUTER CLUB
            </span>
            <span className="font-mono text-[0.6rem] tracking-[0.25em] text-accent">
              COMPILING…
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
