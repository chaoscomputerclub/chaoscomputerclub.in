/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */


import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import BlurText from "./BlurText";
import BorderGlow from "./BorderGlow";

const EASE = [0.16, 1, 0.3, 1] as const;

const STATS = [
  { value: "2026", label: "ESTABLISHED" },
  { value: "OPEN", label: "BY DEFAULT" },
  { value: "NONE", label: "PREREQUISITE" },
  { value: "PEER", label: "DRIVEN" },
];

/** Animated circular embrace text orbiting the logo */
function EmbraceRing() {
  const text = "CHAOS COMPUTER CLUB · EXPLORE · BUILD · COMPETE · FAIL · LEARN · SHARE · REPEAT · ";
  const radius = 155;
  const cx = 200;
  const cy = 200;

  return (
    <motion.svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      animate={{ rotate: 360 }}
      transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: "center" }}
    >
      <defs>
        <path
          id="embrace-circle"
          d={`M ${cx - radius} ${cy} a ${radius} ${radius} 0 1 1 ${radius * 2} 0 a ${radius} ${radius} 0 1 1 ${-radius * 2} 0`}
        />
      </defs>
      <text
        style={{
          fontSize: "9px",
          letterSpacing: "0.22em",
          fill: "rgba(204, 255, 0, 0.55)",
          fontFamily: "JetBrains Mono, monospace",
          textTransform: "uppercase",
        }}
      >
        <textPath href="#embrace-circle" startOffset="0%">
          {text}
        </textPath>
      </text>
    </motion.svg>
  );
}

/** Outer decorative ring */
function DecorRing({ size, duration }: { size: number; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full border border-accent/[0.08]"
      style={{ width: size, height: size, top: "50%", left: "50%", x: "-50%", y: "-50%" }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    />
  );
}

/** Center logo orb — BorderGlow border-only effect, logo centered */
function LogoOrb() {
  return (
    <BorderGlow
      edgeSensitivity={23}
      glowColor="40 80 80"
      backgroundColor="transparent"
      borderRadius="50%"
      glowRadius={57}
      glowIntensity={1.9}
      coneSpread={15}
      animated
      colors={["#c084fc", "#f472b6", "#38bdf8"]}
      fillOpacity={0}
      className="rounded-full"
      containerClassName="flex items-center justify-center w-full h-full absolute inset-0"
      style={{ width: "clamp(260px, 32vw, 360px)", height: "clamp(260px, 32vw, 360px)" }}
    >
      {/* Outer decorative scanning rings */}
      <DecorRing size={360} duration={60} />
      <DecorRing size={320} duration={42} />

      {/* Embrace / orbital text ring */}
      <EmbraceRing />

      {/* Inner accent ring */}
      <div
        className="absolute rounded-full border border-accent/10 pointer-events-none"
        style={{ width: "65%", height: "65%", zIndex: 5 }}
      />

      {/* Subtle crosshair lines */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ zIndex: 6 }}>
        <div
          className="absolute w-full h-px"
          style={{ background: "linear-gradient(to right, transparent, rgba(204,255,0,0.08), transparent)" }}
        />
        <div
          className="absolute w-px h-full"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(204,255,0,0.08), transparent)" }}
        />
      </div>

      {/* LOGO — centered, unobstructed, draggable */}
      <motion.img
        src="/logo.png"
        alt="Chaos Computer Club Logo"
        width={200}
        height={200}
        className="relative z-20 select-none cursor-grab active:cursor-grabbing"
        style={{ width: "52%", height: "52%", objectFit: "contain", opacity: 1 }}
        initial={{ opacity: 1, scale: 1 }}
        drag
        dragConstraints={{ top: -20, bottom: 20, left: -20, right: 20 }}
        dragElastic={0.25}
      />
    </BorderGlow>
  );
}

/** Section 00 — About Us */
export function AboutUs() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden border-b border-border bg-background px-4 py-24 md:px-6 md:py-32"
    >
      {/* Section label row */}
      <div className="relative z-10 flex items-baseline justify-between">
        <span className="kicker">(00 // About us)</span>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-index uppercase">INDEX 0.0</span>
      </div>

      {/* Main content grid */}
      <div className="relative z-10 mt-16 md:mt-24 grid gap-16 md:grid-cols-12 items-center">

        {/* ── Left column: mission copy ── */}
        <div className="md:col-span-4 md:col-start-1">
          <BlurText
            text="Engineering at the edge of comfort."
            delay={45}
            animateBy="letters"
            direction="top"
            as="h2"
            className="text-3xl font-medium md:text-4xl leading-tight text-foreground"
          />
          <motion.p
            className="mt-6 text-sm leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
          >
            There is a difference between knowing and knowing how. Between reading about systems and watching one break. Between solving a problem and solving it when the clock is running. Chaos Computer Club lives in that space.
          </motion.p>
          <motion.p
            className="mt-4 text-sm leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
          >
            A community built around curiosity, competition, experimentation, and the simple act of making things work. We compete, we fail, we iterate — and we share what we learn.
          </motion.p>
          <motion.p
            className="mt-4 font-mono text-xs leading-relaxed text-accent"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
          >
            No gatekeeping. No minimum CGPA. Just you, a terminal, and a problem worth solving.
          </motion.p>

          {/* CTA */}
          <motion.a
            href="#manifesto"
            className="cursor-target mt-8 inline-flex items-center gap-2 border border-border px-5 py-2.5 font-mono text-xs tracking-[0.16em] uppercase text-foreground transition-colors hover:border-accent hover:text-accent"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, ease: EASE, delay: 0.7 }}
          >
            <span>Enter the network</span>
            <span aria-hidden>→</span>
          </motion.a>
        </div>

        {/* ── Centre column: logo orb with hover-only glow ── */}
        <div className="md:col-span-4 flex items-center justify-center">
          <LogoOrb />
        </div>

        {/* ── Right column: conceptual signals & metadata spec ── */}
        <div className="md:col-span-4 md:col-start-9">
          <dl className="grid grid-cols-2 gap-6 sm:gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                className="flex flex-col gap-1 border-t border-border pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: EASE, delay: 0.4 + i * 0.12 }}
              >
                <dt className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {s.value}
                </dt>
                <dd className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-index">
                  {s.label}
                </dd>
              </motion.div>
            ))}
          </dl>

          {/* Terminal-style metadata block */}
          <motion.div
            className="mt-8 border border-border bg-surface/40 p-4 font-mono text-[0.6rem] leading-relaxed"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, ease: EASE, delay: 0.8 }}
          >
            <div className="grid grid-cols-[6.5rem_1fr] gap-y-1.5 text-index">
              <span>TYPE</span>
              <span className="text-foreground font-medium">TECHNICAL COLLECTIVE</span>
              <span>PROTOCOL</span>
              <span className="text-foreground font-medium">PARTICIPATION</span>
              <span>ACCESS</span>
              <span className="text-foreground font-medium">OPEN BY DEFAULT</span>
              <span>PREREQUISITE</span>
              <span className="text-foreground font-medium">NONE</span>
            </div>
          </motion.div>

          {/* Manifesto pull-quote */}
          <motion.blockquote
            className="mt-8 border-l-2 border-accent/40 pl-4 font-mono text-xs leading-relaxed tracking-wide text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: EASE, delay: 0.95 }}
          >
            "We don't think computer science belongs exclusively inside classrooms."
          </motion.blockquote>
        </div>

      </div>

      {/* Bottom separator strip */}
      <motion.div
        className="relative z-10 mt-20 flex items-center gap-4 border-t border-border pt-6"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: EASE, delay: 1.1 }}
      >
        <span className="font-mono text-[0.52rem] tracking-[0.22em] uppercase text-index">EST. 2026</span>
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-[0.52rem] tracking-[0.22em] uppercase text-index">CHAOS COMPUTER CLUB</span>
        <div className="flex-1 h-px bg-border" />
        <span className="font-mono text-[0.52rem] tracking-[0.22em] uppercase text-accent">ACTIVE</span>
      </motion.div>
    </section>
  );
}

export default AboutUs;
