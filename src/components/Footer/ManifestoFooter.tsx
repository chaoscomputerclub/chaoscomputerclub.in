import { useState } from "react";
import { MaskedLine, Rise } from "@/components/Motion/MaskedLine";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/Motion/Magnetic";

/** Section 07 — closing manifesto and the terminal-entry action. */
export function ManifestoFooter() {
  const [handle, setHandle] = useState("");
  const [claimed, setClaimed] = useState(false);

  return (
    <footer id="manifesto" className="grain px-4 py-20 md:px-6 md:py-28">
      <div className="flex items-baseline justify-between">
        <span className="kicker">(07 // Resolution)</span>
        <span className="font-mono text-[0.6rem] tracking-[0.2em] text-index">INDEX 7.0</span>
      </div>

      <MaskedLine as="h2" className="mt-8 max-w-4xl text-4xl font-medium md:text-5xl">
        We don&apos;t think computer science belongs exclusively inside classrooms.
      </MaskedLine>

      <div className="mt-12 grid gap-10 border-t border-border pt-10 md:grid-cols-12">
        <Rise className="md:col-span-5">
          <p className="max-w-md text-sm text-muted-foreground">
            There is a world beyond grades and attendance. A world where problems don&apos;t come
            with answer keys, where systems don&apos;t explain themselves, and where someone better
            than you is waiting across the table.
          </p>
          <p className="mt-8 font-display text-xl">
            Come to learn something. Stay to build something.
          </p>
        </Rise>

        <Rise delay={0.1} className="md:col-span-6 md:col-start-7">
          <form
            data-spec-box
            onSubmit={(e) => {
              e.preventDefault();
              if (handle.trim()) setClaimed(true);
            }}
            className="border border-border-strong bg-surface p-5"
          >
            <label
              htmlFor="terminal-handle"
              className="block font-mono text-[0.55rem] tracking-[0.18em] text-index uppercase"
            >
              Terminal entry · identifier
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                id="terminal-handle"
                value={handle}
                onChange={(e) => {
                  setHandle(e.target.value);
                  setClaimed(false);
                }}
                placeholder="your.name@campus"
                className="h-10 flex-1 rounded-none border border-border bg-background px-3 font-mono text-xs text-foreground placeholder:text-index focus:border-accent focus:outline-none"
              />
              <Magnetic>
                <Button
                  type="submit"
                  className="h-10 w-full rounded-none bg-accent px-5 font-mono text-[0.6rem] tracking-[0.18em] text-accent-foreground uppercase hover:bg-accent/85 sm:w-auto"
                >
                  [ Claim terminal seat ]
                </Button>
              </Magnetic>
            </div>
            <p
              aria-live="polite"
              className="mt-3 font-mono text-[0.55rem] tracking-[0.16em] uppercase"
            >
              {claimed ? (
                <span className="text-accent">
                  SEAT RESERVED · {handle} · AWAITING FIRST COMMIT
                </span>
              ) : (
                <span className="text-index">STATUS: IDLE · PREREQUISITE: NONE</span>
              )}
            </p>
          </form>
        </Rise>
      </div>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <span className="font-mono text-[0.55rem] tracking-[0.2em] text-index uppercase">
          Chaos Computer Club — [001/EST.2026]
        </span>
        <span className="font-mono text-[0.55rem] tracking-[0.2em] text-index uppercase">
          Explore · Build · Compete · Repeat
        </span>
      </div>
    </footer>
  );
}
