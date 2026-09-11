import { motion, type Transition, type Easing } from "framer-motion";
import { useEffect, useRef, useState, useMemo, createElement } from "react";

export type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: Easing | Easing[];
  onAnimationComplete?: () => void;
  stepDuration?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
};

const buildKeyframes = (
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Record<string, Array<string | number>> => {
  const keys = new Set<string>([...Object.keys(from), ...steps.flatMap((s) => Object.keys(s))]);

  const keyframes: Record<string, Array<string | number>> = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k] ?? 0, ...steps.map((s) => s[k] ?? 0)];
  });
  return keyframes;
};

export function BlurText({
  text = "",
  delay = 50,
  className = "",
  animateBy = "letters",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = [0.16, 1, 0.3, 1],
  onAnimationComplete,
  stepDuration = 0.35,
  as = "p",
}: BlurTextProps) {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setInView(true);
          observer.unobserve(containerRef.current as Element);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === "top"
        ? { filter: "blur(12px)", opacity: 0, y: -25 }
        : { filter: "blur(12px)", opacity: 0, y: 25 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: "blur(5px)",
        opacity: 0.6,
        y: direction === "top" ? 3 : -3,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1)
  );

  const words = text.split(" ");
  const totalUnits =
    animateBy === "words"
      ? words.length
      : text.split("").length;

  let globalIndex = 0;

  const renderContent = () => {
    if (animateBy === "words") {
      return words.map((word, wIdx) => {
        const idx = wIdx;
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
        const spanTransition: Transition = {
          duration: totalDuration,
          times,
          delay: (idx * delay) / 1000,
          ease: easing,
        };

        const isLast = idx === totalUnits - 1;
        const completeProps = onAnimationComplete && isLast ? { onAnimationComplete } : {};

        return (
          <span key={wIdx} className="inline-block whitespace-nowrap">
            <motion.span
              initial={fromSnapshot}
              animate={inView ? animateKeyframes : fromSnapshot}
              transition={spanTransition}
              {...completeProps}
              style={{
                display: "inline-block",
                willChange: "transform, filter, opacity",
              }}
            >
              {word}
            </motion.span>
            {wIdx < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        );
      });
    }

    // animateBy === "letters"
    return words.map((word, wIdx) => {
      const letters = word.split("");
      return (
        <span key={wIdx} className="inline-block whitespace-nowrap">
          {letters.map((char, cIdx) => {
            const idx = globalIndex++;
            const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);
            const spanTransition: Transition = {
              duration: totalDuration,
              times,
              delay: (idx * delay) / 1000,
              ease: easing,
            };

            const isLast = idx === totalUnits - 1;
            const completeProps = onAnimationComplete && isLast ? { onAnimationComplete } : {};

            return (
              <motion.span
                key={cIdx}
                initial={fromSnapshot}
                animate={inView ? animateKeyframes : fromSnapshot}
                transition={spanTransition}
                {...completeProps}
                style={{
                  display: "inline-block",
                  willChange: "transform, filter, opacity",
                }}
              >
                {char}
              </motion.span>
            );
          })}
          {wIdx < words.length - 1 && (() => {
            globalIndex++; // space counting
            return <span className="inline-block">&nbsp;</span>;
          })()}
        </span>
      );
    });
  };

  return createElement(
    as,
    {
      ref: containerRef,
      className: `blur-text ${className} flex flex-wrap`,
      "aria-label": text,
    },
    <span aria-hidden="true" className="flex flex-wrap">
      {renderContent()}
    </span>
  );
}

export default BlurText;
