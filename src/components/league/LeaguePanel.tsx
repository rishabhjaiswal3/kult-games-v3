import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LeaguePanelProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Stretch to fill grid cell height */
  fill?: boolean;
};

/** Shared glass card shell for league widgets — consistent padding and stretch behavior. */
export function LeaguePanel({ children, className, id, fill = true }: LeaguePanelProps) {
  return (
    <section
      id={id}
      className={cn(
        "card-glass rounded-xl border border-white/10 bg-[#05050a]/40 p-4 sm:p-5",
        fill && "h-full min-h-0",
        className,
      )}
    >
      {children}
    </section>
  );
}
