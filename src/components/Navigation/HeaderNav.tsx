import { GlassSurface } from "@/components/Navigation/GlassSurface";

/** Fixed top-edge floating navigation with liquid rainbow refraction glass and logo placeholder */
export function HeaderNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6 pointer-events-none">
      <div className="w-full max-w-7xl pointer-events-auto">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={20}
          borderWidth={0.08}
          backgroundOpacity={0.06}
          saturation={2.4}
          brightness={60}
          opacity={0.92}
          blur={32}
          displace={0.6}
          distortionScale={-180}
          redOffset={-24}
          greenOffset={0}
          blueOffset={28}
          mixBlendMode="screen"
          className="w-full"
        >
          <div className="flex w-full items-center justify-between px-5 py-3 md:px-7">
            {/* Logo Placeholder */}
            <a
              href="#top"
              aria-label="Home"
              className="group flex items-center gap-3 transition-opacity duration-200 hover:opacity-90"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/5 backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-transform duration-300 group-hover:scale-105">
                {/* Faceted Prism Logo Emblem */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 transition-transform duration-500 group-hover:rotate-12"
                >
                  <polygon
                    points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"
                    stroke="url(#prism-rainbow)"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="12"
                    y1="2"
                    x2="12"
                    y2="22"
                    stroke="url(#prism-rainbow)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1="2"
                    y1="8.5"
                    x2="22"
                    y2="15.5"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="0.8"
                  />
                  <line
                    x1="2"
                    y1="15.5"
                    x2="22"
                    y2="8.5"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="0.8"
                  />
                  <defs>
                    <linearGradient id="prism-rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff0077" />
                      <stop offset="25%" stopColor="#ffaa00" />
                      <stop offset="50%" stopColor="#00ffaa" />
                      <stop offset="75%" stopColor="#00c8ff" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Pulsing prismatic indicator */}
                <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-400 shadow-[0_0_6px_#00e1ff] animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[0.68rem] font-semibold tracking-[0.22em] text-foreground uppercase">
                  [ LOGO PLACEHOLDER ]
                </span>
                <span className="font-mono text-[0.5rem] tracking-[0.18em] text-muted-foreground uppercase">
                  CHAOS // FORGE
                </span>
              </div>
            </a>
          </div>
        </GlassSurface>
      </div>
    </header>
  );
}

export default HeaderNav;
