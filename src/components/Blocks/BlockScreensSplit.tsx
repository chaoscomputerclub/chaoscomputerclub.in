/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import BlurText from "@/components/Motion/BlurText";
import { Rise } from "@/components/Motion/MaskedLine";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ─── Elastic Mesh ─────────────────────────────────────────────────────── */

const MESH_COLS = 14;
const MESH_ROWS = 9;
const STIFFNESS = 0.035;
const DAMPING = 0.84;
const DRAG_PULL = 0.38;
const HOVER_PULL = 0.12;
const MOUSE_RADIUS = 95;

type MeshPt = { x: number; y: number; ox: number; oy: number; vx: number; vy: number };

function useElasticMesh(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  mouseRef: React.MutableRefObject<{ x: number; y: number; dragging: boolean }>
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let pts: MeshPt[] = [];

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      pts = [];
      for (let r = 0; r <= MESH_ROWS; r++) {
        for (let c = 0; c <= MESH_COLS; c++) {
          const x = (c / MESH_COLS) * canvas.width;
          const y = (r / MESH_ROWS) * canvas.height;
          pts.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
        }
      }
    };

    const tick = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const m = mouseRef.current;
      const mx = m.x * dpr;
      const my = m.y * dpr;
      const r = MOUSE_RADIUS * dpr;
      const pull = m.dragging ? DRAG_PULL : HOVER_PULL;

      for (const p of pts) {
        // Spring toward origin
        p.vx += (p.ox - p.x) * STIFFNESS;
        p.vy += (p.oy - p.y) * STIFFNESS;

        // Mouse influence
        const dmx = mx - p.x;
        const dmy = my - p.y;
        const dist = Math.sqrt(dmx * dmx + dmy * dmy);
        if (dist < r && dist > 0) {
          const force = ((r - dist) / r) * pull;
          p.vx += (dmx / dist) * force * 4;
          p.vy += (dmy / dist) * force * 4;
        }

        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;
      }

      const cols = MESH_COLS + 1;

      // Horizontal lines — warm off-white at very low opacity
      ctx.lineWidth = 0.75;
      for (let r2 = 0; r2 <= MESH_ROWS; r2++) {
        ctx.beginPath();
        for (let c = 0; c <= MESH_COLS; c++) {
          const p = pts[r2 * cols + c];
          if (c === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(234,234,234,0.10)";
        ctx.stroke();
      }

      // Vertical lines — tiny hint of acid-lime
      ctx.lineWidth = 0.65;
      for (let c = 0; c <= MESH_COLS; c++) {
        ctx.beginPath();
        for (let r2 = 0; r2 <= MESH_ROWS; r2++) {
          const p = pts[r2 * cols + c];
          if (r2 === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(204,255,0,0.045)";
        ctx.stroke();
      }

      raf = requestAnimationFrame(tick);
    };

    init();
    tick();

    const ro = new ResizeObserver(init);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

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

/* ─── Component ─────────────────────────────────────────────────────────── */

/** Block 04 — Open Source: Built to be shared. */
export function BlockScreensSplit() {
  const meshCanvasRef = useRef<HTMLCanvasElement>(null);
  const meshMouseRef = useRef({ x: -9999, y: -9999, dragging: false });

  useElasticMesh(meshCanvasRef, meshMouseRef);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    meshMouseRef.current.x = e.clientX - rect.left;
    meshMouseRef.current.y = e.clientY - rect.top;
  }, []);

  const onDown = useCallback(() => { meshMouseRef.current.dragging = true; }, []);
  const onUp = useCallback(() => { meshMouseRef.current.dragging = false; }, []);
  const onLeave = useCallback(() => {
    meshMouseRef.current.x = -9999;
    meshMouseRef.current.y = -9999;
    meshMouseRef.current.dragging = false;
  }, []);

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

        {/* Right ── Contribution Telemetry Panel with elastic mesh background */}
        <Rise delay={0.15} className="md:col-span-6 md:col-start-7">
          <div
            data-spec-box
            className="tag-cut relative border border-border bg-surface/50 backdrop-blur-sm cursor-crosshair select-none"
            style={{ ["--cut" as string]: "26px" }}
            onMouseMove={onMove}
            onMouseDown={onDown}
            onMouseUp={onUp}
            onMouseLeave={onLeave}
          >
            {/* ── Elastic mesh canvas — sits at z-0 behind all content ── */}
            <canvas
              ref={meshCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              aria-hidden="true"
            />

            {/* ── All panel content layered above the mesh ── */}
            <div className="relative z-10 p-5 md:p-6">

              {/* Industrial corner chip */}
              <span className="absolute top-3 left-3 tag-cut bg-accent px-2 py-0.5 font-mono text-[0.52rem] tracking-[0.16em] text-accent-foreground uppercase z-20">
                CHOS // COMMONS
              </span>

              {/* Panel header */}
              <div className="mt-7 border-b border-border/80 pb-4">
                <div className="flex items-center justify-between font-mono text-[0.6rem] tracking-wider uppercase">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 bg-accent animate-pulse" />
                    <span className="text-foreground font-semibold">
                      CONTRIBUTION TELEMETRY
                    </span>
                  </div>
                  <span className="text-accent text-[0.52rem]">[ LIVING COMMONS ]</span>
                </div>
                {/* Telemetry stats row */}
                <div className="mt-2.5 flex items-center gap-5 font-mono text-[0.54rem] text-muted-foreground tracking-widest uppercase">
                  <span>
                    <span className="text-accent font-semibold">247</span> commits
                  </span>
                  <span className="opacity-30">·</span>
                  <span>
                    <span className="text-foreground">14</span> contributors
                  </span>
                  <span className="opacity-30">·</span>
                  <span>
                    <span className="text-accent font-semibold">∞</span> streak
                  </span>
                </div>
              </div>

              {/* Heatmap */}
              <div className="mt-5">
                <div className="flex items-center justify-between font-mono text-[0.56rem] tracking-widest text-index uppercase mb-2">
                  <span>PEER ACTIVITY MATRIX</span>
                  <span>7 × 12 COMMIT GRAPH</span>
                </div>

                <div className="grid grid-cols-12 gap-[3px] p-3 border border-border/50 bg-background/60">
                  {CONTRIBUTION_CELLS.map((c) => (
                    <div
                      key={c.id}
                      title={`Cell #${c.id + 1}`}
                      className={`aspect-square transition-all duration-150 ${
                        c.isAccent
                          ? "bg-accent hover:scale-110 shadow-[0_0_5px_rgba(204,255,0,0.5)]"
                          : c.isHigh
                          ? "bg-foreground/65 hover:bg-foreground hover:scale-110"
                          : c.activity > 3
                          ? "bg-foreground/22 hover:bg-foreground/45"
                          : "bg-border/25 hover:bg-border/60"
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-between font-mono text-[0.5rem] text-index">
                  <span>LESS</span>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 bg-border/25" />
                    <span className="h-2 w-2 bg-foreground/22" />
                    <span className="h-2 w-2 bg-foreground/65" />
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
                      className="group grid grid-cols-[2rem_4.5rem_1fr] items-start gap-2 border-b border-border/40 py-3 hover:bg-surface/50 transition-colors"
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
                <span className="text-muted-foreground text-[0.52rem] tracking-wider uppercase">
                  drag to distort · all artifacts open
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
            </div>
          </div>
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
