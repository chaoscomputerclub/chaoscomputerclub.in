import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Masked line reveal: text climbs into an overflow-hidden wrapper. */
export function MaskedLine({
  children,
  delay = 0,
  className,
  as = "span",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
}) {
  const Tag = motion[as as "span"];
  return (
    <Tag
      className={cn("line", className)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.05 }}
    >
      <motion.span
        className="line__in"
        variants={{ hidden: { y: "110%" }, shown: { y: "0%" } }}
        transition={{ duration: 0.9, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </Tag>
  );
}

/** Fade+rise reveal for non-text blocks, matching the site easing. */
export function Rise({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
