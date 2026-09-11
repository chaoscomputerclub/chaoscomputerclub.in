import { useNotesMode } from "@/hooks/useNotesMode";
import { Button } from "@/components/ui/button";

/** Fixed top-edge credits line plus the two editorial toggles. */
export function HeaderNav() {
  const { notes, toggle } = useNotesMode();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="grid grid-cols-2 items-center gap-3 px-4 py-3 md:grid-cols-3 md:px-6">
        <a
          href="#top"
          className="font-mono text-[0.6rem] tracking-[0.2em] text-foreground uppercase"
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
            <a href="#manifesto">[ The manifesto ]</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
