import { GlassSurface } from "@/components/Navigation/GlassSurface";

/** Floating liquid glass pill navbar with logo placeholder only */
export function HeaderNav() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto">
        <GlassSurface
          width="auto"
          height="auto"
          borderRadius={50}
          borderWidth={0.07}
          brightness={50}
          opacity={0.93}
          blur={11}
          displace={0.5}
          backgroundOpacity={0.1}
          saturation={1.2}
          distortionScale={-180}
          redOffset={0}
          greenOffset={10}
          blueOffset={20}
          mixBlendMode="difference"
          className="shadow-2xl"
        >
          <a
            href="#top"
            aria-label="Home"
            className="flex items-center gap-2.5 px-6 py-2.5 transition-opacity duration-200 hover:opacity-80"
          >
            {/* Minimalist Logo Mark */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span className="font-mono text-xs font-semibold tracking-[0.22em] text-foreground uppercase">
              [ LOGO ]
            </span>
          </a>
        </GlassSurface>
      </div>
    </header>
  );
}

export default HeaderNav;
