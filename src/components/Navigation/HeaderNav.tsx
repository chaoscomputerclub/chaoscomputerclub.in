import { useState, useEffect } from "react";

const NAV_LINKS = [
  { id: "#top", label: "00 / Top" },
  { id: "#about", label: "00 / About" },
  { id: "#gap", label: "01 / The gap" },
  { id: "#forge", label: "02 / The forge" },
  { id: "#chaos", label: "03 / Chaos" },
  { id: "#codebase", label: "04 / Codebase" },
  { id: "#values", label: "05 / Values" },
  { id: "#telemetry", label: "06 / Telemetry" },
  { id: "#manifesto", label: "07 / Resolution" },
];

/**
 * Clean, full-width, prominent navbar:
 * - Tall architectural height (h-20 on mobile, h-24 on desktop)
 * - Prominent CCC metallic logo with 3-line stacked title:
 *     CHAOS
 *     COMPUTER
 *     CLUB
 * - Zero overflow: responsive breakpoints ensuring clean fit on all viewports
 * - Zero border radius (strict rectangular architectural edges)
 * - Backdrop blur with subtle translucent background
 */
export function HeaderNav() {
  const [activeTab, setActiveTab] = useState<string>("#top");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const sections = NAV_LINKS.map((link) => ({
        id: link.id,
        el: link.id === "#top" ? document.body : document.querySelector(link.id),
      }));

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.el) {
          const top = sec.el.getBoundingClientRect().top + window.scrollY;
          if (scrollY >= top - 220) {
            setActiveTab(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full max-w-full rounded-none border-b border-border bg-background/85 backdrop-blur-md transition-colors">
      <div className="flex h-20 md:h-24 w-full max-w-full items-center justify-between px-4 sm:px-6 md:px-8">
        
        {/* Left: Bold Brand Logo + 3-line stacked title */}
        <a
          href="#top"
          aria-label="Chaos Computer Club Home"
          className="group flex items-center gap-3 sm:gap-3.5 font-mono text-foreground transition-colors hover:text-accent select-none shrink-0"
        >
          <img
            src="/logo.png"
            alt="Chaos Computer Club Logo"
            width={60}
            height={60}
            className="h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.18)]"
          />
          <div className="flex flex-col font-mono text-[0.6rem] sm:text-[0.68rem] md:text-[0.74rem] font-bold tracking-[0.2em] uppercase leading-[1.12] text-foreground group-hover:text-accent transition-colors">
            <span>CHAOS</span>
            <span>COMPUTER</span>
            <span>CLUB</span>
          </div>
        </a>

        {/* Center / Navigation Links: Clean simple text links on xl+ displays */}
        <nav className="hidden xl:flex items-center gap-5 2xl:gap-8" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <a
                key={link.id}
                href={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`font-mono text-xs tracking-[0.14em] uppercase whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-accent font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 font-mono text-xs">
          <a
            href="#manifesto"
            className="rounded-none border border-border bg-surface/50 px-3.5 sm:px-4 py-2 font-mono text-xs tracking-[0.14em] text-foreground uppercase transition-colors hover:border-accent hover:text-accent"
          >
            [ Enter the network → ]
          </a>

          {/* Mobile/Tablet Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex xl:hidden rounded-none border border-border p-2 text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
            aria-label="Toggle navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Dropdown Menu: Clean zero-radius backdrop blur */}
      {mobileMenuOpen && (
        <div className="xl:hidden w-full rounded-none border-b border-border bg-background/95 backdrop-blur-xl px-5 py-4 flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.id}
              onClick={() => {
                setActiveTab(link.id);
                setMobileMenuOpen(false);
              }}
              className={`rounded-none px-2 py-2 font-mono text-xs tracking-wider uppercase transition-colors ${
                activeTab === link.id
                  ? "text-accent font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

export default HeaderNav;
