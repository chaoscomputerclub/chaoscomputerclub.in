/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

import { useEffect, useRef } from "react";
import BlurText from "@/components/Motion/BlurText";
import { Rise } from "@/components/Motion/MaskedLine";

const STEPS = ["Explore", "Build", "Compete", "Fail", "Learn", "Share", "Repeat"];

function ReelSet({
  isPrimary,
  setRef,
}: {
  isPrimary?: boolean;
  setRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={setRef as any}
      className="flex shrink-0 items-center"
      aria-hidden={!isPrimary}
    >
      {STEPS.map((s, i) => (
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
  );
}

/** Block 02 — horizontal billboard card with a kinetic scroll-driven reel.
 *  On scroll down -> moves left.
 *  On scroll up -> moves right.
 */
export function BlockHorizontalReel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const singleSetRef = useRef<HTMLDivElement>(null);
  const singleSetWidthRef = useRef<number>(1000);

  useEffect(() => {
    const updateWidth = () => {
      if (singleSetRef.current) {
        singleSetWidthRef.current = singleSetRef.current.offsetWidth || 1000;
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth, { passive: true });

    let isVisible = true;
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && trackRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible = entry.isIntersecting;
          });
        },
        { rootMargin: "300px 0px" }
      );
      observer.observe(trackRef.current);
    }

    let animId: number;
    let currentPos = window.scrollY * 0.75;
    let targetPos = window.scrollY * 0.75;

    const onScroll = () => {
      targetPos = window.scrollY * 0.75;
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      if (isVisible) {
        // Smooth lerp for fluid momentum
        currentPos += (targetPos - currentPos) * 0.12;

        const singleWidth = singleSetWidthRef.current || 1000;
        // Modulo wrap so currentPos maps seamlessly between 0 and singleWidth
        const rawOffset = ((currentPos % singleWidth) + singleWidth) % singleWidth;

        if (trackRef.current) {
          // On scroll down: currentPos increases -> rawOffset increases -> -rawOffset moves LEFT
          // On scroll up: currentPos decreases -> rawOffset decreases -> -rawOffset moves RIGHT
          trackRef.current.style.transform = `translate3d(${-rawOffset.toFixed(2)}px, 0, 0)`;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateWidth);
      observer?.disconnect();
    };
  }, []);

  return (
    <section id="forge" className="border-b border-border px-4 py-20 md:px-6 md:py-28">
      <div className="flex items-baseline justify-between">
        <span className="kicker">(02 // The forge)</span>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-index">INDEX 2.0</span>
      </div>

      <div
        data-spec-box
        className="chamfer mt-8 border border-border bg-bone text-bone-foreground"
        style={{ ["--cut" as string]: "40px" }}
      >
        <div className="grid gap-8 p-6 md:grid-cols-12 md:p-10">
          <BlurText
            text="Non-Linear Momentum"
            delay={45}
            animateBy="letters"
            direction="top"
            as="h2"
            className="text-3xl font-medium md:col-span-6 md:text-4xl"
          />
          <Rise delay={0.1} className="md:col-span-5 md:col-start-8">
            <p className="text-sm text-bone-foreground/70">
              Ideas are cheap until they meet reality. Write the code. Run the experiment. Make it actually work under pressure.
            </p>
          </Rise>
        </div>

        <div className="overflow-hidden border-t border-black/10 py-5 select-none">
          <div
            ref={trackRef}
            className="reel__track flex w-max will-change-transform"
          >
            <ReelSet isPrimary setRef={singleSetRef} />
            <ReelSet />
            <ReelSet />
            <ReelSet />
            <ReelSet />
            <ReelSet />
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlockHorizontalReel;
