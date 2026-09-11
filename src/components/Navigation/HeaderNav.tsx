import { useNotesMode } from "@/hooks/useNotesMode";
import { Button } from "@/components/ui/button";
import { GlassSurface } from "@/components/Navigation/GlassSurface";

/** Fixed top-edge floating navigation using liquid GlassSurface. */
export function HeaderNav() {
  const { notes, toggle } = useNotesMode();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6 pointer-events-none">
      <div className="w-full max-w-7xl pointer-events-auto">
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={14}
          borderWidth={0.1}
          backgroundOpacity={0.08}
          saturation={1.5}
          brightness={50}
          opacity={0.92}
          blur={10}
          displace={0.5}
          distortionScale={-160}
          redOffset={0}
          greenOffset={12}
          blueOffset={24}
          mixBlendMode="difference"
          className="w-full transition-all duration-300"
        >
          <div className="grid w-full grid-cols-2 items-center gap-3 px-4 py-2.5 md:grid-cols-3 md:px-6">
            <a
              href="#top"
              className="font-mono text-[0.6rem] tracking-[0.2em] text-foreground uppercase transition-colors hover:text-accent"
            >
              Chaos Computer Club <span className="text-index">[001/EST.2026]</span>
            </a>
            <p className="hidden justify-self-center text-center font-mono text-[0.55rem] tracking-[0.2em] text-muted-foreground uppercase md:block">
              Student community for practical engineering &amp; pressure
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                aria-pressed={notes}
                onClick={toggle}
                className="h-7 rounded-none border-border-strong bg-transparent px-2 font-mono text-[0.55rem] tracking-[0.16em] uppercase hover:bg-accent hover:text-accent-foreground"
              >
                [ Notes mode: {notes ? "on" : "off"} ]
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden h-7 rounded-none border-border-strong bg-transparent px-2 font-mono text-[0.55rem] tracking-[0.16em] uppercase hover:bg-accent hover:text-accent-foreground sm:inline-flex"
              >
                <a href="#gap">[ The Manifesto ]</a>
              </Button>
            </div>
          </div>
        </GlassSurface>
      </div>
    </header>
  );
}

export default HeaderNav;
