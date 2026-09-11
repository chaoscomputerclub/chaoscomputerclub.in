import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

type LenisInstance = {
  raf: (t: number) => void;
  destroy: () => void;
  scrollTo: (
    target: string | number | HTMLElement,
    opts?: {
      offset?: number;
      duration?: number;
      easing?: (t: number) => number;
      immediate?: boolean;
    }
  ) => void;
};

const LenisContext = createContext<{ scrollTo: LenisInstance["scrollTo"] } | null>(null);

/** Global inertial smooth scrolling (Lenis), skipped for reduced motion. */
export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisInstance | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let cancelled = false;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const instance = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }) as unknown as LenisInstance;

      lenisRef.current = instance;

      const tick = (time: number) => {
        instance.raf(time);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo: LenisInstance["scrollTo"] = (target, opts) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, opts);
    } else {
      // Fallback for reduced-motion or before Lenis loads
      const el =
        typeof target === "string"
          ? document.querySelector(target)
          : target;
      if (el instanceof Element) {
        el.scrollIntoView({ behavior: "smooth" });
      } else if (typeof target === "number") {
        window.scrollTo({ top: target, behavior: "smooth" });
      }
    }
  };

  return (
    <LenisContext.Provider value={{ scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
}

/** Access the Lenis scrollTo helper from any child component. */
export function useLenisScroll() {
  return useContext(LenisContext);
}
