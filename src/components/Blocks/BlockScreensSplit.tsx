/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
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

/* ─── Elastic Telemetry Canvas ──────────────────────────────────────────── */

const MESH_COLS = 12;
const MESH_ROWS = 8;
const SPRING_K  = 0.028;
const DAMPING   = 0.86;
const PULL_DRAG = 0.48;
const PULL_HOVER = 0.14;
const R_FACTOR  = 0.18; // fraction of min(w,h)

type MPt = { x: number; y: number; ox: number; oy: number; vx: number; vy: number };

/** Full-canvas elastic mesh that renders ALL content + the spring grid together. */
function ElasticTelemetryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Store mutable state in a ref to avoid triggering re-renders
  const S = useRef({
    pts: [] as MPt[],
    dpr: 1,
    mouse: { x: -9999, y: -9999, dragging: false },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = S.current;

    /* Bilinear mesh displacement at normalised (nx, ny) ∈ [0,1] */
    const disp = (nx: number, ny: number): [number, number] => {
      if (!s.pts.length) return [0, 0];
      const gx = Math.max(0, Math.min(nx * MESH_COLS, MESH_COLS));
      const gy = Math.max(0, Math.min(ny * MESH_ROWS, MESH_ROWS));
      const c0 = Math.min(Math.floor(gx), MESH_COLS - 1);
      const c1 = Math.min(c0 + 1, MESH_COLS);
      const r0 = Math.min(Math.floor(gy), MESH_ROWS - 1);
      const r1 = Math.min(r0 + 1, MESH_ROWS);
      const tx = gx - c0, ty = gy - r0;
      const W = MESH_COLS + 1;
      const p00 = s.pts[r0*W+c0], p10 = s.pts[r0*W+c1];
      const p01 = s.pts[r1*W+c0], p11 = s.pts[r1*W+c1];
      const bi = (a: number, b: number, c: number, d: number) =>
        (a*(1-tx) + b*tx)*(1-ty) + (c*(1-tx) + d*tx)*ty;
      return [
        bi(p00.x-p00.ox, p10.x-p10.ox, p01.x-p01.ox, p11.x-p11.ox),
        bi(p00.y-p00.oy, p10.y-p10.oy, p01.y-p01.oy, p11.y-p11.oy),
      ];
    };

    /** Warp a CSS-pixel point through the current mesh displacement */
    const w = (px: number, py: number, cw: number, ch: number): [number, number] => {
      const [dx, dy] = disp(px/cw, py/ch);
      return [px+dx, py+dy];
    };

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      const cw = rect.width, ch = rect.height;
      if (cw < 1 || ch < 1) return;
      const dpr = Math.min(window.devicePixelRatio||1, 2);
      canvas.width  = Math.floor(cw * dpr);
      canvas.height = Math.floor(ch * dpr);
      s.dpr = dpr;
      s.pts = [];
      for (let r = 0; r <= MESH_ROWS; r++) {
        for (let c = 0; c <= MESH_COLS; c++) {
          const ox = (c/MESH_COLS)*cw, oy = (r/MESH_ROWS)*ch;
          s.pts.push({ x: ox, y: oy, ox, oy, vx: 0, vy: 0 });
        }
      }
    };

    const draw = (cw: number, ch: number) => {
      ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);

      // Dark background
      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(0, 0, cw, ch);

      if (!s.pts.length) return;

      const pad  = cw * 0.065;
      const padT = ch * 0.06;

      /* ─ HEADER ───────────────────────────────────────────────────── */
      ctx.textAlign = "left";

      const [dotX, dotY] = w(pad, padT + 14, cw, ch);
      ctx.font = "700 9px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "#ccff00";
      ctx.fillText("■", dotX, dotY);

      const [hdX, hdY] = w(pad + 14, padT + 14, cw, ch);
      ctx.fillStyle = "#eaeaea";
      ctx.fillText("CONTRIBUTION TELEMETRY", hdX, hdY);

      const [lcX, lcY] = w(cw - pad - 92, padT + 14, cw, ch);
      ctx.font = "500 7.5px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "#ccff00";
      ctx.fillText("[ LIVING COMMONS ]", lcX, lcY);

      // Stats row
      const [sX, sY] = w(pad, padT + 29, cw, ch);
      ctx.font = "400 7.5px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "rgba(234,234,234,0.36)";
      ctx.fillText("247 COMMITS  ·  14 CONTRIBUTORS  ·  ∞ STREAK", sX, sY);

      // Divider
      const [d0x, d0y] = w(pad, padT + 38, cw, ch);
      const [d1x, d1y] = w(cw-pad, padT + 38, cw, ch);
      ctx.beginPath(); ctx.moveTo(d0x, d0y); ctx.lineTo(d1x, d1y);
      ctx.strokeStyle = "rgba(234,234,234,0.10)"; ctx.lineWidth = 0.5; ctx.stroke();

      /* ─ HEATMAP ──────────────────────────────────────────────────── */
      const hmY = padT + 52;
      const [hmLx, hmLy] = w(pad, hmY, cw, ch);
      ctx.font = "500 7px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "rgba(234,234,234,0.26)";
      ctx.fillText("PEER ACTIVITY MATRIX", hmLx, hmLy);

      const [hmRx, hmRy] = w(cw - pad - 86, hmY, cw, ch);
      ctx.fillText("7 × 12 COMMIT GRAPH", hmRx, hmRy);

      const hmLeft = pad, hmTop = hmY + 9;
      const hmW = cw - pad*2, hmH = ch * 0.295;
      const HCOLS = 12, HROWS = 7;
      const cellW = hmW/HCOLS, cellH = hmH/HROWS;

      CONTRIBUTION_CELLS.forEach((cell, i) => {
        const col = i % HCOLS, row = Math.floor(i / HCOLS);
        const x0 = hmLeft + col*cellW + 1.5;
        const y0 = hmTop  + row*cellH + 1.5;
        const x1 = x0 + cellW - 3;
        const y1 = y0 + cellH - 3;

        const [tlx,tly] = w(x0, y0, cw, ch);
        const [trx,try_] = w(x1, y0, cw, ch);
        const [brx,bry] = w(x1, y1, cw, ch);
        const [blx,bly] = w(x0, y1, cw, ch);

        if (cell.isAccent)        ctx.fillStyle = "#ccff00";
        else if (cell.isHigh)     ctx.fillStyle = "rgba(234,234,234,0.60)";
        else if (cell.activity>3) ctx.fillStyle = "rgba(234,234,234,0.18)";
        else                      ctx.fillStyle = "rgba(234,234,234,0.06)";

        ctx.beginPath();
        ctx.moveTo(tlx,tly); ctx.lineTo(trx,try_);
        ctx.lineTo(brx,bry); ctx.lineTo(blx,bly);
        ctx.closePath(); ctx.fill();
      });

      // Legend
      const legY = hmTop + hmH + 9;
      const [legLx, legLy] = w(pad, legY, cw, ch);
      ctx.font = "400 6.5px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "rgba(234,234,234,0.22)";
      ctx.fillText("LESS", legLx, legLy);
      ["rgba(234,234,234,0.06)","rgba(234,234,234,0.18)","rgba(234,234,234,0.60)","#ccff00"].forEach((c2,i) => {
        const [sx2,sy2] = w(pad + 32 + i*9, legY - 5, cw, ch);
        ctx.fillStyle = c2; ctx.fillRect(sx2, sy2, 7, 7);
      });
      const [legRx, legRy] = w(pad + 32 + 4*9 + 6, legY, cw, ch);
      ctx.fillStyle = "rgba(234,234,234,0.22)"; ctx.fillText("MORE", legRx, legRy);

      /* ─ PROTOCOL LIST ────────────────────────────────────────────── */
      const protoTop = hmTop + hmH + 27;
      const [pLx,pLy] = w(pad, protoTop, cw, ch);
      ctx.font = "500 7px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "rgba(234,234,234,0.26)";
      ctx.fillText("COMMONS PROTOCOL", pLx, pLy);

      const steps = [
        { step:"01", label:"LEARN",      desc:"Study source code like classical literature." },
        { step:"02", label:"BUILD",      desc:"Ship under real clock pressure." },
        { step:"03", label:"CONTRIBUTE", desc:"Fix the bug. Submit the patch upstream." },
        { step:"04", label:"SHARE",      desc:"Leave the door unlocked for whoever comes next." },
      ];
      const avail  = ch - protoTop - 30;
      const rowGap = avail / (steps.length + 0.5);

      steps.forEach((step, i) => {
        const ry = protoTop + (i+1)*rowGap - 6;
        // row separator
        const [sp0x,sp0y] = w(pad, ry - rowGap + 10, cw, ch);
        const [sp1x,sp1y] = w(cw-pad, ry - rowGap + 10, cw, ch);
        ctx.beginPath(); ctx.moveTo(sp0x,sp0y); ctx.lineTo(sp1x,sp1y);
        ctx.strokeStyle = "rgba(234,234,234,0.07)"; ctx.lineWidth = 0.5; ctx.stroke();

        const [stX,stY] = w(pad, ry, cw, ch);
        ctx.font = "700 8px 'IBM Plex Mono', monospace";
        ctx.fillStyle = "#ccff00";
        ctx.fillText(step.step, stX, stY);

        const [laX,laY] = w(pad + cw*0.09, ry, cw, ch);
        ctx.fillStyle = "#eaeaea";
        ctx.fillText(step.label, laX, laY);

        const [deX,deY] = w(pad + cw*0.24, ry, cw, ch);
        ctx.font = "400 7.5px 'IBM Plex Mono', monospace";
        ctx.fillStyle = "rgba(234,234,234,0.38)";
        ctx.fillText(step.desc, deX, deY);
      });

      /* ─ FOOTER ───────────────────────────────────────────────────── */
      const [ftX,ftY] = w(pad, ch - 14, cw, ch);
      ctx.font = "400 7px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "rgba(234,234,234,0.15)";
      ctx.fillText("DRAG TO DISTORT  ·  ALL ARTIFACTS OPEN BY DEFAULT", ftX, ftY);
      const [ghX,ghY] = w(cw - pad - 68, ch - 14, cw, ch);
      ctx.fillStyle = "rgba(234,234,234,0.30)";
      ctx.fillText("[ GITHUB → ]", ghX, ghY);

      /* ─ ELASTIC MESH GRID ────────────────────────────────────────── */
      const W = MESH_COLS + 1;
      ctx.lineWidth = 0.9;

      for (let r2 = 0; r2 <= MESH_ROWS; r2++) {
        ctx.beginPath();
        for (let c = 0; c <= MESH_COLS; c++) {
          const p = s.pts[r2*W+c];
          c === 0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y);
        }
        ctx.strokeStyle = "rgba(234,234,234,0.14)"; ctx.stroke();
      }
      ctx.lineWidth = 0.7;
      for (let c = 0; c <= MESH_COLS; c++) {
        ctx.beginPath();
        for (let r2 = 0; r2 <= MESH_ROWS; r2++) {
          const p = s.pts[r2*W+c];
          r2 === 0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y);
        }
        ctx.strokeStyle = "rgba(204,255,0,0.08)"; ctx.stroke();
      }
      // Vertex dots
      for (const p of s.pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1, 0, Math.PI*2);
        ctx.fillStyle = "rgba(234,234,234,0.20)"; ctx.fill();
      }

      /* ─ CORNER CHIP (acid-lime, drawn on top of everything) ──────── */
      ctx.fillStyle = "#ccff00";
      ctx.fillRect(0, 0, 88, 18);
      ctx.font = "700 7.5px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "#080808";
      ctx.textAlign = "left";
      ctx.fillText("CHOS // COMMONS", 5, 12);

      /* ─ OUTER BORDER ─────────────────────────────────────────────── */
      ctx.strokeStyle = "rgba(234,234,234,0.12)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, cw-1, ch-1);
    };

    let raf = 0;

    const tick = () => {
      const rect = canvas.getBoundingClientRect();
      const cw = rect.width, ch = rect.height;

      if (s.pts.length) {
        const m = s.mouse;
        const radius = R_FACTOR * Math.min(cw, ch);
        const pull = m.dragging ? PULL_DRAG : PULL_HOVER;

        for (const p of s.pts) {
          p.vx += (p.ox - p.x) * SPRING_K;
          p.vy += (p.oy - p.y) * SPRING_K;

          const dmx = m.x - p.x, dmy = m.y - p.y;
          const dist = Math.sqrt(dmx*dmx + dmy*dmy);
          if (dist < radius && dist > 0) {
            const force = ((radius-dist)/radius) * pull;
            p.vx += (dmx/dist) * force * 5;
            p.vy += (dmy/dist) * force * 5;
          }

          p.vx *= DAMPING; p.vy *= DAMPING;
          p.x += p.vx;    p.y += p.vy;
        }

        if (cw > 0 && ch > 0) draw(cw, ch);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(() => { init(); tick(); });

    const ro = new ResizeObserver(() => init());
    ro.observe(canvas);

    const onMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = "touches" in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const cy = "touches" in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      s.mouse.x = cx - rect.left;
      s.mouse.y = cy - rect.top;
    };
    const onDown = () => { s.mouse.dragging = true; };
    const onUp   = () => { s.mouse.dragging = false; };
    const onOut  = () => { s.mouse.x = -9999; s.mouse.y = -9999; s.mouse.dragging = false; };

    canvas.addEventListener("mousemove",  onMove);
    canvas.addEventListener("touchmove",  onMove, { passive: true });
    canvas.addEventListener("mousedown",  onDown);
    canvas.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("touchend",   onUp);
    canvas.addEventListener("mouseleave", onOut);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("mousemove",  onMove);
      canvas.removeEventListener("touchmove",  onMove);
      canvas.removeEventListener("mousedown",  onDown);
      canvas.removeEventListener("touchstart", onDown);
      window.removeEventListener("mouseup",    onUp);
      window.removeEventListener("touchend",   onUp);
      canvas.removeEventListener("mouseleave", onOut);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full cursor-crosshair select-none"
      style={{ aspectRatio: "4/3.5" }}
      aria-label="Contribution Telemetry — elastic mesh panel"
    />
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

          {/* Axiom spec list */}
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

        {/* Right ── Full Elastic Mesh Canvas Panel */}
        <Rise delay={0.15} className="md:col-span-6 md:col-start-7">
          <ElasticTelemetryCanvas />
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
