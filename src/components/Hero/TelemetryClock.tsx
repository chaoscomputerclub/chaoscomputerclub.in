/**
 * Chaos Computer Club India — chaoscomputerclub.in
 *
 * Copyright (c) 2026 Chaos Computer Club India
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

import { useEffect, useState } from "react";

const R = { hour: 34, minute: 46, second: 58 };

function polar(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: 70 + r * Math.cos(rad), y: 70 + r * Math.sin(rad) };
}

/** Live orbital telemetry dial: three balls on concentric tracks. */
export function TelemetryClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setNow(new Date());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const d = now ?? new Date(0);
  const ms = now ? d.getMilliseconds() : 0;
  const sec = d.getSeconds() + ms / 1000;
  const min = d.getMinutes() + sec / 60;
  const hour = (d.getHours() % 12) + min / 60;

  const balls = [
    { r: R.second, deg: sec * 6, size: 3, key: "second" },
    { r: R.minute, deg: min * 6, size: 4, key: "minute" },
    { r: R.hour, deg: hour * 30, size: 5, key: "hour" },
  ];

  const time = now
    ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}.${String(ms).padStart(3, "0")}`
    : "--:--:--.---";

  return (
    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
      <svg viewBox="0 0 140 140" className="h-36 w-36 shrink-0" aria-hidden>
        {Object.values(R).map((r) => (
          <circle
            key={r}
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-border-strong"
          />
        ))}
        {balls.map((b) => {
          const p = polar(b.r, b.deg);
          return (
            <circle
              key={b.key}
              cx={p.x}
              cy={p.y}
              r={b.size}
              className={b.key === "second" ? "fill-accent" : "fill-foreground"}
            />
          );
        })}
        <circle cx="70" cy="70" r="1.5" className="fill-muted-foreground" />
      </svg>
      <dl className="grid gap-2 font-mono text-[0.6rem] tracking-[0.16em] uppercase">
        <div className="flex gap-3">
          <dt className="w-32 text-index">Local time</dt>
          <dd className="text-foreground">{time}</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-32 text-index">Node status</dt>
          <dd className="flex items-center gap-2 text-accent">
            <span className="inline-block h-1.5 w-1.5 animate-pulse bg-accent" />
            Nominal
          </dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-32 text-index">Protocol</dt>
          <dd className="text-muted-foreground">Participation</dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-32 text-index">Prerequisite</dt>
          <dd className="text-muted-foreground">None</dd>
        </div>
      </dl>
    </div>
  );
}
