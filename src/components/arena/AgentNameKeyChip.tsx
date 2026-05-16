import { cn } from "@/lib/utils";

/** Must stay in sync with `AGENT_NAME_ACCENTS` order used by `agentNameAccentFromAgentId`. */
export type AgentNameKeyAccent = "cyan" | "purple" | "green" | "magenta" | "pink" | "gold";

const AGENT_NAME_ACCENTS: readonly AgentNameKeyAccent[] = [
  "cyan",
  "purple",
  "green",
  "magenta",
  "pink",
  "gold",
] as const;

/** Stable accent per agent so list and detail views stay consistent. */
export function agentNameAccentFromAgentId(agentId: string): AgentNameKeyAccent {
  let h = 2166136261;
  for (let i = 0; i < agentId.length; i++) {
    h ^= agentId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = (h >>> 0) % AGENT_NAME_ACCENTS.length;
  return AGENT_NAME_ACCENTS[idx] ?? "cyan";
}

export function agentNameKeyChipClassName(
  accent: AgentNameKeyAccent,
  size: "compact" | "comfortable" | "table" = "compact"
) {
  const pad =
    size === "comfortable"
      ? "px-3 py-1 sm:px-3.5 sm:py-1"
      : size === "table"
        ? "px-3 py-1"
        : "px-2.5 py-0.5 sm:px-3 sm:py-0.5";
  const text =
    size === "comfortable"
      ? "text-[11px] leading-snug sm:text-xs"
      : size === "table"
        ? "text-sm leading-snug"
        : "text-[11px] leading-snug sm:text-xs";

  const shell =
    "rounded-md border font-display font-bold tracking-wide transition-all duration-200 ease-out";
  const layout = "inline-flex min-w-0 max-w-full items-center truncate";

  const interactive = (border: string, bg: string, textC: string, shadow: string, hoverBorder: string, hoverBg: string, hoverShadow: string) =>
    cn(
      shell,
      border,
      bg,
      textC,
      shadow,
      hoverBorder,
      hoverBg,
      hoverShadow,
      "group-active:scale-[0.97]"
    );

  const variants: Record<AgentNameKeyAccent, string> = {
    cyan: interactive(
      "border-neon-cyan/50",
      "bg-neon-cyan/[0.07]",
      "text-neon-cyan",
      "shadow-[0_0_14px_hsl(198_92%_68%/0.2),inset_0_0_0_1px_hsl(198_92%_80%/0.12)]",
      "group-hover:border-neon-cyan",
      "group-hover:bg-neon-cyan/[0.11]",
      "group-hover:shadow-[0_0_20px_hsl(198_92%_68%/0.32)]"
    ),
    purple: interactive(
      "border-neon-purple/50",
      "bg-neon-purple/[0.08]",
      "text-neon-purple",
      "shadow-[0_0_14px_hsl(278_88%_62%/0.22),inset_0_0_0_1px_hsl(278_88%_74%/0.12)]",
      "group-hover:border-neon-purple",
      "group-hover:bg-neon-purple/[0.12]",
      "group-hover:shadow-[0_0_20px_hsl(278_88%_62%/0.34)]"
    ),
    green: interactive(
      "border-neon-green/50",
      "bg-neon-green/[0.07]",
      "text-neon-green",
      "shadow-[0_0_14px_hsl(152_78%_56%/0.2),inset_0_0_0_1px_hsl(152_78%_68%/0.12)]",
      "group-hover:border-neon-green",
      "group-hover:bg-neon-green/[0.11]",
      "group-hover:shadow-[0_0_20px_hsl(152_78%_56%/0.32)]"
    ),
    magenta: interactive(
      "border-neon-magenta/50",
      "bg-neon-magenta/[0.07]",
      "text-neon-magenta",
      "shadow-[0_0_14px_hsl(310_100%_60%/0.22),inset_0_0_0_1px_hsl(310_100%_72%/0.12)]",
      "group-hover:border-neon-magenta",
      "group-hover:bg-neon-magenta/[0.11]",
      "group-hover:shadow-[0_0_20px_hsl(310_100%_60%/0.34)]"
    ),
    pink: interactive(
      "border-neon-pink/50",
      "bg-neon-pink/[0.07]",
      "text-neon-pink",
      "shadow-[0_0_14px_hsl(340_85%_62%/0.22),inset_0_0_0_1px_hsl(340_85%_74%/0.12)]",
      "group-hover:border-neon-pink",
      "group-hover:bg-neon-pink/[0.11]",
      "group-hover:shadow-[0_0_20px_hsl(340_85%_62%/0.34)]"
    ),
    gold: interactive(
      "border-[hsl(var(--gold)/0.5)]",
      "bg-[hsl(var(--gold)/0.08)]",
      "text-[hsl(var(--gold))]",
      "shadow-[0_0_14px_hsl(40_85%_58%/0.22),inset_0_0_0_1px_hsl(40_85%_70%/0.14)]",
      "group-hover:border-[hsl(var(--gold))]",
      "group-hover:bg-[hsl(var(--gold)/0.12)]",
      "group-hover:shadow-[0_0_20px_hsl(40_85%_58%/0.34)]"
    ),
  };

  return cn(layout, pad, text, variants[accent]);
}

type AgentNameKeyChipProps = {
  name: string;
  accent?: AgentNameKeyAccent;
  size?: "compact" | "comfortable" | "table";
  className?: string;
};

export function AgentNameKeyChip({
  name,
  accent = "cyan",
  size = "compact",
  className,
}: AgentNameKeyChipProps) {
  return (
    <span className={cn(agentNameKeyChipClassName(accent, size), className)}>
      <span className="min-w-0 truncate">{name}</span>
    </span>
  );
}
