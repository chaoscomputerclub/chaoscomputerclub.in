import { useEffect, useState } from "react";
import { useNotesMode } from "@/hooks/useNotesMode";

/** Architectural overlay: 12-column hairlines, redline specs, coordinate pins. */
export function NotesModeOverlay() {
  const { notes } = useNotesMode();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!notes) return;
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    const onMove = (e: PointerEvent) => setPointer({ x: e.clientX, y: e.clientY });
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [notes]);

  if (!notes) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[60]">
      <div className="mx-auto grid h-full max-w-none grid-cols-4 gap-4 px-4 md:grid-cols-12 md:px-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={i > 3 ? "hidden md:block" : ""}
            style={{
              background: "rgba(204, 255, 0, 0.05)",
              borderInline: "1px solid rgba(204,255,0,0.18)",
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-x-0"
        style={{ top: pointer.y, borderTop: "1px solid rgba(255,0,85,0.35)" }}
      />
      <div
        className="absolute inset-y-0"
        style={{ left: pointer.x, borderLeft: "1px solid rgba(255,0,85,0.35)" }}
      />

      <span className="absolute top-14 left-4 bg-accent px-1.5 py-0.5 font-mono text-[0.55rem] tracking-[0.14em] text-accent-foreground">
        VIEWPORT {size.w} × {size.h}
      </span>
      <span className="absolute bottom-4 right-4 bg-accent px-1.5 py-0.5 font-mono text-[0.55rem] tracking-[0.14em] text-accent-foreground">
        [X: {pointer.x}, Y: {pointer.y}]
      </span>
      <span className="absolute bottom-4 left-4 font-mono text-[0.55rem] tracking-[0.14em] text-accent">
        GRID 12 · GUTTER 16px · SPEC MODE ACTIVE
      </span>
    </div>
  );
}
