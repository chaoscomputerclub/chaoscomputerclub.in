import { useState } from "react";
import { GlassSurface } from "@/components/Navigation/GlassSurface";

const NAV_LINKS = [
  { id: "#gap", label: "01 / The gap" },
  { id: "#forge", label: "02 / The forge" },
  { id: "#chaos", label: "03 / Chaos" },
  { id: "#values", label: "05 / Values" },
  { id: "#telemetry", label: "06 / Telemetry" },
  { id: "#manifesto", label: "07 / Resolution" },
];

/**
 * Floating Apple iOS 26 Liquid Glass Navigation Bar
 * Features tactile press elasticity, dynamic liquid refraction, and droplet tab adhesion.
 */
export function HeaderNav() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6 pointer-events-none">
      <div className="w-full max-w-7xl pointer-events-auto">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={20}
          borderWidth={0.25}
          brightness={50}
          opacity={0.93}
          blur={11}
          displace={0.55}
          backgroundOpacity={0.08}
          saturation={1.45}
          distortionScale={-180}
          redOffset={-4}
          greenOffset={8}
          blueOffset={18}
          mixBlendMode="difference"
          interactive={true}
          effect="regular"
          className="w-full"
        >
          <div className="flex w-full items-center justify-between px-5 py-3 md:px-7">
            {/* Logo on the left (not centered) */}
            <a
              href="#top"
              aria-label="Home"
              className="group flex items-center gap-2.5 font-mono text-xs font-semibold tracking-[0.2em] text-foreground uppercase transition-all duration-200 hover:text-accent shrink-0 active:scale-95"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground transition-transform duration-300 group-hover:rotate-12 group-hover:text-accent"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
              <span>[ LOGO ]</span>
            </a>

            {/* Section Navigation Links with Liquid Droplet Hover Pill */}
            <nav className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar">
              {NAV_LINKS.map((link) => {
                const isHovered = activeTab === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.id}
                    onMouseEnter={() => setActiveTab(link.id)}
                    onMouseLeave={() => setActiveTab(null)}
                    className={`relative px-2.5 py-1 rounded-full font-mono text-[0.58rem] tracking-[0.18em] whitespace-nowrap uppercase transition-all duration-200 ${
                      isHovered
                        ? "text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_8px_rgba(0,0,0,0.3)] bg-white/[0.09] backdrop-blur-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>
          </div>
        </GlassSurface>
      </div>
    </header>
  );
}

export default HeaderNav;
