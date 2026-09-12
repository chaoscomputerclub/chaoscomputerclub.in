/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import BlurText from "@/components/Motion/BlurText";
import { Rise } from "@/components/Motion/MaskedLine";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ─── Data ──────────────────────────────────────────────────────────────── */

const AXIOMS = [
  {
    n: "4.1",
    k: "Learn",
    v: "Read how master engineers handle race conditions, cache lines, and catastrophic faults. The world's greatest CS curriculum lives on GitHub.",
  },
  {
    n: "4.2",
    k: "Build",
    v: "Stand on the shoulders of the global commons. Solve real engineering problems; ship working prototypes under clock pressure.",
  },
  {
    n: "4.3",
    k: "Contribute",
    v: "Find the memory leak. Patch the broken invariant. Submit the pull request upstream. Pay the debt forward to humanity.",
  },
  {
    n: "4.4",
    k: "Share",
    v: "Leave the door unlocked. Publish code, write clear docs, and mentor the peer who started today.",
  },
];

const PILLARS = [
  {
    idx: "01",
    tag: "SOURCE AS LITERATURE",
    title: "Reading Before Writing",
    body: "Most students write toy programs in isolation. Real engineering begins by reading how massive distributed systems survive in the wild: studying SQLite for crash-safety, Redis for single-threaded event loops, Linux for memory paging. The greatest CS curriculum already exists on GitHub.",
  },
  {
    idx: "02",
    tag: "RADICAL MERITOCRACY",
    title: "The Patch is the Equaliser",
    body: "An open compiler does not care what university you attended, how old you are, or what title is on your résumé. It only cares about correctness and whether the test suite passes. Your reputation in open source is built on the elegance of your diff and the humility of your peer reviews.",
  },
  {
    idx: "03",
    tag: "THE LIVING COMMONS",
    title: "Software as a Public Trust",
    body: "The internet was not gifted to us by a monopoly. It was built by volunteers who wrote RFCs, compilers, and kernels, and chose to leave the door unlocked. We operate with that exact conviction: every line written in CCC belongs to humanity, open for inspection, fork, and contribution — forever.",
  },
];

const CONTRIBUTION_CELLS = Array.from({ length: 84 }).map((_, i) => {
  const activity = (i * 13 + 7) % 11;
  const isHigh = activity > 7;
  const isAccent = (i * 17) % 19 === 0 || i === 42 || i === 73;
  return { id: i, isHigh, isAccent, activity };
});

/* ─── Interactive Fluid Mesh Telemetry Card ─────────────────────────────── */

function InteractiveTelemetryCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);

  // Normalized cursor coordinates (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Soft elastic jelly physics (low damping = organic fluid wobble)
  const springConfig = { stiffness: 160, damping: 14, mass: 0.75 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Fluid 3D tilt
  const rotateX = useTransform(springY, [-0.5, 0.5], [8.5, -8.5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8.5, 8.5]);

  // Organic fluid shear & elastic skew
  const skewX = useTransform(springX, [-0.5, 0.5], [-2.4, 2.4]);
  const skewY = useTransform(springY, [-0.5, 0.5], [-2.4, 2.4]);

  // Magnetic spring pull
  const translateX = useTransform(springX, [-0.5, 0.5], [-7, 7]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-7, 7]);

  // Dynamic ambient specular lighting
  const [glare, setGlare] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [wavePhase, setWavePhase] = useState(0);

  // Kinetic energy from cursor velocity
  const energyRef = useRef(0);
  const targetEnergyRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0, time: 0 });

  // Continuous fluid mesh wave loop
  useEffect(() => {
    let animId = 0;
    let phase = 0;

    const loop = () => {
      // Viscous damping of fluid wave energy
      energyRef.current += (targetEnergyRef.current - energyRef.current) * 0.08;
      targetEnergyRef.current *= 0.95;

      const energy = energyRef.current;
      phase += 0.032 + energy * 0.003;

      // Update fluid wave phase state for matrix cell ripple animation
      if (Math.round(phase * 8) % 3 === 0) {
        setWavePhase(phase);
      }

      // Smoothly shifting frequency (creates breathing, undulating fluid currents)
      const fx = 0.012 + Math.sin(phase * 0.65) * 0.0035;
      const fy = 0.016 + Math.cos(phase * 0.85) * 0.004;

      // Ambient liquid breathing ripple + mouse kinetic wave ripple
      const ambientScale = 3.5 + Math.sin(phase * 1.3) * 1.8;
      const waveScale = ambientScale + energy * 0.45;

      if (turbRef.current) {
        turbRef.current.setAttribute("baseFrequency", `${fx.toFixed(5)} ${fy.toFixed(5)}`);
      }
      if (dispRef.current) {
        dispRef.current.setAttribute("scale", waveScale.toFixed(2));
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    mouseX.set(px - 0.5);
    mouseY.set(py - 0.5);
    setGlare({ x: px * 100, y: py * 100, opacity: 1 });

    // Calculate cursor velocity to inject fluid momentum
    const now = performance.now();
    const dt = Math.max(now - lastPosRef.current.time, 16);
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy) / dt;

    lastPosRef.current = { x: e.clientX, y: e.clientY, time: now };
    targetEnergyRef.current = Math.min(targetEnergyRef.current + speed * 14, 38);
  };

  const handlePointerDown = () => {
    // Inject energetic fluid wave pulse on click / drag
    targetEnergyRef.current = 34;
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setGlare((g) => ({ ...g, opacity: 0 }));
  };

  return (
    <div style={{ perspective: 1200 }} className="relative w-full">
      {/* ── Hidden SVG Fluid Mesh Displacement Filter ──────────────────── */}
      <svg
        className="pointer-events-none absolute -top-[9999px] -left-[9999px] h-0 w-0 opacity-0 overflow-hidden"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="fluid-mesh-filter"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={turbRef}
              type="fractalNoise"
              baseFrequency="0.014 0.018"
              numOctaves="2"
              result="noise"
              seed="3"
            />
            <feDisplacementMap
              ref={dispRef}
              in="SourceGraphic"
              in2="noise"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* ── Fluid Mesh Container ────────────────────────────────────────── */}
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX,
          rotateY,
          skewX,
          skewY,
          x: translateX,
          y: translateY,
          transformStyle: "preserve-3d",
          filter: "url(#fluid-mesh-filter)",
          ["--cut" as string]: "26px",
        }}
        whileHover={{ scale: 1.014 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        data-spec-box
        className="tag-cut relative border border-border bg-surface/50 p-5 md:p-6 backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(204,255,0,0.08)] select-auto"
      >
        {/* Dynamic fluid specular light sheen */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-10"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(500px circle at ${glare.x}% ${glare.y}%, rgba(204,255,0,0.09), transparent 65%),
                         radial-gradient(700px circle at ${100 - glare.x}% ${100 - glare.y}%, rgba(255,255,255,0.02), transparent 60%)`,
          }}
        />

        {/* Industrial corner chip */}
        <span className="absolute top-3 left-3 tag-cut bg-accent px-2 py-0.5 font-mono text-[0.52rem] tracking-[0.16em] text-accent-foreground uppercase z-20">
          CHOS // COMMONS
        </span>

        {/* Panel header */}
        <div className="mt-7 flex items-center justify-between border-b border-border/80 pb-4 font-mono text-[0.6rem] tracking-wider uppercase text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 bg-accent animate-pulse" />
            <span className="text-foreground font-semibold">
              CONTRIBUTION TELEMETRY
            </span>
          </div>
          <span className="text-accent text-[0.52rem]">[ LIVING COMMONS ]</span>
        </div>

        {/* Heatmap Matrix with Fluid Wave Ripple */}
        <div className="mt-5">
          <div className="flex items-center justify-between font-mono text-[0.56rem] tracking-widest text-index uppercase mb-2">
            <span>PEER ACTIVITY MATRIX</span>
            <span>7 × 12 COMMIT GRAPH</span>
          </div>

          <div className="grid grid-cols-12 gap-1 p-3 border border-border/50 bg-background/50">
            {CONTRIBUTION_CELLS.map((c) => {
              const col = c.id % 12;
              const row = Math.floor(c.id / 12);
              // Fluid wave ripple across grid coordinates
              const waveVal = Math.sin(wavePhase * 2 - (col * 0.35 + row * 0.55)) * 0.12;

              return (
                <div
                  key={c.id}
                  title={`Cell #${c.id + 1}`}
                  style={{
                    transform: `scale(${1 + waveVal * 0.5})`,
                  }}
                  className={`aspect-square transition-all duration-200 cursor-pointer ${
                    c.isAccent
                      ? "bg-accent hover:scale-125 shadow-[0_0_6px_rgba(204,255,0,0.45)]"
                      : c.isHigh
                      ? "bg-foreground/70 hover:bg-foreground hover:scale-125"
                      : c.activity > 3
                      ? "bg-foreground/25 hover:bg-foreground/50"
                      : "bg-border/30 hover:bg-border/70"
                  }`}
                />
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between font-mono text-[0.5rem] text-index">
            <span>LESS</span>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 bg-border/30" />
              <span className="h-2 w-2 bg-foreground/25" />
              <span className="h-2 w-2 bg-foreground/70" />
              <span className="h-2 w-2 bg-accent" />
            </div>
            <span>MORE</span>
          </div>
        </div>

        {/* Protocol list */}
        <div className="mt-6 border-t border-border/70 pt-5">
          <div className="font-mono text-[0.56rem] tracking-widest text-index uppercase mb-3">
            COMMONS PROTOCOL
          </div>
          <ul className="border-t border-border/50">
            {[
              { step: "01", label: "Learn", desc: "Study source code like classical literature." },
              { step: "02", label: "Build", desc: "Ship under real clock pressure." },
              { step: "03", label: "Contribute", desc: "Fix the bug. Submit the patch upstream." },
              { step: "04", label: "Share", desc: "Leave the door unlocked for whoever comes next." },
            ].map((s) => (
              <li
                key={s.step}
                className="group grid grid-cols-[2rem_4.5rem_1fr] items-start gap-2 border-b border-border/40 py-3 hover:bg-surface/60 transition-colors"
              >
                <span className="font-mono text-[0.58rem] text-accent font-semibold pt-px">
                  {s.step}
                </span>
                <span className="font-mono text-xs font-semibold uppercase text-foreground group-hover:text-accent transition-colors">
                  {s.label}
                </span>
                <span className="text-[0.7rem] text-muted-foreground leading-relaxed">
                  {s.desc}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-5 border-t border-border/70 pt-4 flex items-center justify-between gap-3 font-mono text-[0.58rem]">
          <span className="text-muted-foreground">
            All artifacts open by default.
          </span>
          <a
            href="https://github.com/chaoscomputerclub/chaoscomputerclub.in"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-target shrink-0 inline-flex items-center gap-1.5 border border-border px-3 py-1.5 tracking-[0.12em] uppercase text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            [ GitHub → ]
          </a>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */

/** Block 04 — Open Source: Built to be shared. */
export function BlockScreensSplit() {
  return (
    <section
      id="opensource"
      data-id="codebase"
      className="border-b border-border px-4 py-20 md:px-6 md:py-28"
    >
      {/* Legacy anchor */}
      <span id="codebase" className="sr-only" aria-hidden="true" />

      {/* ── Section Header ──────────────────────────────────────────────── */}
      <div className="flex items-baseline justify-between">
        <span className="kicker">(04 // OPEN SOURCE)</span>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-index uppercase">
          INDEX 4.0
        </span>
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────────── */}
      <div className="mt-10 grid gap-12 md:grid-cols-12 items-start">

        {/* Left ── Philosophy & Spec List */}
        <div className="md:col-span-5">
          <BlurText
            text="Built to be shared."
            delay={45}
            animateBy="letters"
            direction="top"
            as="h2"
            className="text-3xl font-medium md:text-4xl leading-tight tracking-tight"
          />

          <Rise delay={0.08}>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Every OS kernel, web server, and cryptographic library that
              preserves human privacy exists because developers chose to share
              their craft with strangers across the world.
            </p>
          </Rise>

          {/* Axiom spec list — mirrors BlockVerticalSpec pattern */}
          <ul className="mt-8 border-t border-border">
            {AXIOMS.map((a, i) => (
              <motion.li
                key={a.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.65, ease: EASE, delay: i * 0.07 }}
                className="group grid grid-cols-[2.6rem_5rem_1fr] items-start gap-3 border-b border-border py-5 transition-colors duration-200 hover:bg-surface"
              >
                <span className="font-mono text-[0.6rem] tracking-[0.16em] text-index pt-px">
                  {a.n}
                </span>
                <span className="font-display text-sm text-foreground transition-colors duration-200 group-hover:text-accent uppercase tracking-wide">
                  {a.k}
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {a.v}
                </span>
              </motion.li>
            ))}
          </ul>

          {/* Terminal manifesto callout */}
          <Rise delay={0.35}>
            <div
              data-spec-box
              className="tag-cut relative mt-8 border border-border-strong bg-surface p-5"
              style={{ ["--cut" as string]: "18px" }}
            >
              <span className="absolute top-2.5 left-2.5 tag-cut bg-accent px-2 py-0.5 font-mono text-[0.52rem] tracking-[0.16em] text-accent-foreground uppercase">
                MANIFESTO
              </span>
              <p className="mt-5 font-mono text-sm font-semibold text-foreground leading-snug">
                The code is open.
                <br />
                So are we.
              </p>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                We learn from what others built, contribute what we discover, and
                leave something better for whoever comes next. That&apos;s the cycle.
              </p>
              {/* Cycle pill breadcrumbs */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5 font-mono text-[0.65rem]">
                {(["Learn", "Build", "Contribute", "Share"] as const).map((s, i, arr) => (
                  <span key={s} className="contents">
                    <span
                      className={`border px-2 py-0.5 ${
                        s === "Contribute"
                          ? "border-accent/60 bg-accent/10 text-accent font-semibold"
                          : "border-border/80 bg-background/60 text-foreground"
                      }`}
                    >
                      {s}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="text-accent text-[0.6rem]">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </Rise>
        </div>

        {/* Right ── Contribution Telemetry Panel (Exact Original UI with 3D Fluid Mesh Animation) */}
        <Rise delay={0.15} className="md:col-span-6 md:col-start-7">
          <InteractiveTelemetryCard />
        </Rise>
      </div>

      {/* ── Ethics Pillars ─────────────────────────────────────────────── */}
      <div className="mt-20 border-t border-border pt-12">
        <div className="flex items-center justify-between font-mono text-[0.58rem] tracking-[0.2em] text-index uppercase mb-8">
          <span>ETHICS OF THE CRAFT</span>
          <span>HOW WE PRACTICE OPEN SOURCE</span>
        </div>

        <ul className="border-t border-border">
          {PILLARS.map((p, i) => (
            <motion.li
              key={p.idx}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-6%" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
              className="group grid grid-cols-1 gap-4 border-b border-border py-8 transition-colors duration-200 hover:bg-surface md:grid-cols-[3rem_14rem_1fr]"
            >
              <span className="font-mono text-[0.6rem] tracking-[0.16em] text-index pt-px">
                [{p.idx}]
              </span>
              <div>
                <div className="font-mono text-[0.52rem] tracking-wider text-accent uppercase mb-2">
                  {p.tag}
                </div>
                <h3 className="font-display text-base font-semibold text-foreground group-hover:text-accent transition-colors duration-200">
                  {p.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.body}
              </p>
            </motion.li>
          ))}
        </ul>

        {/* Bottom stamp */}
        <div className="mt-8 flex items-center gap-4 font-mono text-[0.56rem] tracking-widest text-index uppercase">
          <span className="inline-block h-px flex-1 bg-border/60" />
          <span>CCC // UNRESTRICTED // OPEN SOURCE</span>
          <span className="inline-block h-px flex-1 bg-border/60" />
        </div>
      </div>
    </section>
  );
}

export default BlockScreensSplit;
