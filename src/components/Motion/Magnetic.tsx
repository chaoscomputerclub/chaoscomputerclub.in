import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Magnetic wrapper: the child drifts toward the cursor and springs back. */
export function Magnetic({
  children,
  radius = 90,
  pull = 0.28,
  className,
}: {
  children: ReactNode;
  radius?: number;
  pull?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const cur = { x: 0, y: 0 };
    const to = { x: 0, y: 0 };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < r.width / 2 + radius;
      to.x = near ? dx * pull : 0;
      to.y = near ? dy * pull : 0;
    };

    const tick = () => {
      cur.x += (to.x - cur.x) * 0.14;
      cur.y += (to.y - cur.y) * 0.14;
      el.style.transform = `translate3d(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [radius, pull]);

  return (
    <span ref={ref} className={cn("inline-block will-change-transform", className)}>
      {children}
    </span>
  );
}
