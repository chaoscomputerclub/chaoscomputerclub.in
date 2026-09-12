/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useLenisScroll } from "@/components/LenisProvider";
import { StaggeredMenu } from "@/components/Navigation/StaggeredMenu";

interface NavItem {
  id: string;
  num: string;
  name: string;
}

const NAV_LINKS: NavItem[] = [
  { id: "#top", num: "00", name: "Top" },
  { id: "#about", num: "00", name: "About" },
  { id: "#gap", num: "01", name: "The gap" },
  { id: "#forge", num: "02", name: "The forge" },
  { id: "#chaos", num: "03", name: "Chaos" },
  { id: "#opensource", num: "04", name: "Open Source" },
  { id: "#values", num: "05", name: "Values" },
  { id: "#telemetry", num: "06", name: "Telemetry" },
  { id: "#manifesto", num: "07", name: "Resolution" },
];

/** Menu items adapted for StaggeredMenu format */
const STAGGERED_ITEMS = NAV_LINKS.map((link) => ({
  label: link.name,
  ariaLabel: `Go to ${link.name}`,
  id: link.id,
}));

/** Social / external links shown in the mobile staggered menu */
const SOCIAL_ITEMS = [
  { label: "GitHub", link: "https://github.com" },
  { label: "Twitter", link: "https://twitter.com" },
  { label: "Discord", link: "https://discord.com" },
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
 *
 * Mobile: Uses StaggeredMenu (GSAP-animated fullscreen slide-in)
 * Desktop (xl+): Clean inline text navigation links
 */
export function HeaderNav() {
  const [activeTab, setActiveTab] = useState<string>("#top");
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const lenis = useLenisScroll();

  // Smooth scroll handler — uses Lenis when available, CSS fallback otherwise
  const scrollTo = useCallback(
    (id: string) => {
      if (id === "#top") {
        lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const el = document.querySelector(id);
        if (!el) return;
        lenis
          ? lenis.scrollTo(el as HTMLElement, { offset: -96, duration: 1.4 })
          : el.scrollIntoView({ behavior: "smooth" });
      }
    },
    [lenis]
  );

  useEffect(() => {
    const SCROLL_THRESHOLD = 8; // ignore tiny scroll jitter

    const handleScroll = () => {
      const scrollY = window.scrollY;

      // ── Active section tracking ──
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

      // ── Hide/show navbar based on scroll direction ──
      const delta = scrollY - lastScrollY.current;

      if (scrollY <= 80) {
        // Always visible near the top
        setNavVisible(true);
      } else if (Math.abs(delta) > SCROLL_THRESHOLD) {
        setNavVisible(delta < 0); // scrolling up → show, scrolling down → hide
      }

      lastScrollY.current = scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** Handler for StaggeredMenu item clicks */
  const handleMobileItemClick = useCallback(
    (id: string) => {
      setActiveTab(id);
      // Small delay to let the menu close animation start before scrolling
      setTimeout(() => scrollTo(id), 100);
    },
    [scrollTo]
  );

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 w-full max-w-full rounded-none border-b border-border bg-background/85 backdrop-blur-md transition-transform duration-300 ease-in-out ${
          navVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex h-20 md:h-24 w-full max-w-full items-center justify-between px-4 sm:px-6 md:px-8">
          
          {/* Left: Bold Brand Logo + 3-line stacked title */}
          <a
            href="#top"
            aria-label="Chaos Computer Club Home"
            onClick={(e) => { e.preventDefault(); scrollTo("#top"); }}
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
          <nav className="hidden xl:flex items-center gap-5 2xl:gap-7" aria-label="Main Navigation">
            {NAV_LINKS.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <a
                  key={link.id}
                  href={link.id}
                  onClick={(e) => { e.preventDefault(); setActiveTab(link.id); scrollTo(link.id); }}
                  className={`group flex items-baseline font-mono uppercase whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-accent font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className={`text-[0.58rem] tracking-wider transition-colors ${
                      isActive
                        ? "text-accent/90"
                        : "text-muted-foreground/60 group-hover:text-foreground/70"
                    }`}
                  >
                    {link.num}
                  </span>
                  <span className="text-[0.5rem] opacity-35 mx-1 select-none">
                    /
                  </span>
                  <span className="text-xs tracking-[0.12em]">
                    {link.name}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* Right: Join us action — visible on desktop (xl+) */}
          <div className="hidden xl:flex items-center shrink-0">
            <a
              href="#manifesto"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("#manifesto");
                scrollTo("#manifesto");
              }}
              className="inline-flex h-10 items-center justify-center rounded-none bg-accent px-5 font-mono text-[0.6rem] tracking-[0.18em] text-accent-foreground uppercase font-semibold transition-colors hover:bg-accent/85 cursor-pointer select-none"
            >
              [ Join us → ]
            </a>
          </div>
        </div>
      </header>

      {/* ── Mobile/Tablet StaggeredMenu (below xl breakpoint) ── */}
      <div className="xl:hidden">
        <StaggeredMenu
          position="right"
          items={STAGGERED_ITEMS}
          socialItems={SOCIAL_ITEMS}
          displaySocials={true}
          displayItemNumbering={true}
          menuButtonColor="#eaeaea"
          openMenuButtonColor="#eaeaea"
          changeMenuColorOnOpen={true}
          colors={["#111111", "#161616"]}
          accentColor="#ccff00"
          closeOnClickAway={true}
          activeItemId={activeTab}
          onItemClick={handleMobileItemClick}
          navHidden={!navVisible}
          footerContent={(closeMenu) => (
            <a
              href="#manifesto"
              onClick={(e) => {
                e.preventDefault();
                closeMenu?.();
                handleMobileItemClick("#manifesto");
              }}
              className="flex h-11 w-full items-center justify-center rounded-none bg-accent px-5 font-mono text-[0.68rem] tracking-[0.18em] text-accent-foreground uppercase font-semibold transition-colors hover:bg-accent/85 cursor-pointer select-none"
            >
              [ Join us → ]
            </a>
          )}
        />
      </div>
    </>
  );
}

export default HeaderNav;
