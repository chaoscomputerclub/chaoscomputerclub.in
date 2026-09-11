import { motion } from "framer-motion";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const ANCHORS = [
  { id: "#gap", label: "01 / The gap" },
  { id: "#forge", label: "02 / The forge" },
  { id: "#chaos", label: "03 / Chaos" },
  { id: "#values", label: "05 / Values" },
  { id: "#telemetry", label: "06 / Telemetry" },
  { id: "#manifesto", label: "07 / Resolution" },
];

/** Reverse-scroll HUD: drops in only while the user scrolls back upward. */
export function BackNav() {
  const { dir, y } = useScrollDirection();
  const open = y > 400 && dir === "up";

  return (
    <motion.nav
      aria-label="Quick section navigation"
      aria-hidden={!open}
      initial={false}
      animate={{ y: open ? "0%" : "-105%" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-[41px] z-40 border-b border-border bg-surface/90 backdrop-blur-md"
    >
      <ul className="flex snap-x items-center gap-4 overflow-x-auto px-4 py-2 md:justify-center md:px-6">
        {ANCHORS.map((a) => (
          <li key={a.id}>
            <a
              href={a.id}
              tabIndex={open ? 0 : -1}
              className="font-mono text-[0.55rem] tracking-[0.18em] whitespace-nowrap text-muted-foreground uppercase transition-colors duration-200 hover:text-accent"
            >
              {a.label}
            </a>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}
