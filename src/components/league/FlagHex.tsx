import { cn } from "@/lib/utils";
import { resolveCountryCode, teamInitials } from "@/lib/teamCode";
import { flagUrlFor } from "@/lib/flagImages";

const HEX_CLIP = "[clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]";

export type CountryCode =
  | "BRA"
  | "ARG"
  | "FRA"
  | "GER"
  | "POR"
  | "ESP"
  | "ITA"
  | "NLD"
  | "ENG"
  | "AUT"
  | "IRQ";

const FLAG_STYLES: Record<CountryCode, string> = {
  BRA: "bg-[#009c3b] [background-image:linear-gradient(135deg,transparent_38%,#ffdf00_38%,#ffdf00_62%,transparent_62%),radial-gradient(circle_at_50%_50%,#002776_22%,transparent_23%)]",
  ARG: "bg-[#74acdf] [background-image:linear-gradient(180deg,transparent_33%,#fff_33%,#fff_66%,transparent_66%)]",
  FRA: "bg-[linear-gradient(90deg,#002395_33%,#fff_33%,#fff_66%,#ed2939_66%)]",
  GER: "bg-[linear-gradient(180deg,#000_33%,#dd0000_33%,#dd0000_66%,#ffce00_66%)]",
  POR: "bg-[linear-gradient(90deg,#006600_40%,#ff0000_40%)]",
  ESP: "bg-[linear-gradient(180deg,#c60b1e_25%,#ffc400_25%,#ffc400_75%,#c60b1e_75%)]",
  ITA: "bg-[linear-gradient(90deg,#009246_33%,#fff_33%,#fff_66%,#ce2b37_66%)]",
  NLD: "bg-[linear-gradient(180deg,#ae1c28_33%,#fff_33%,#fff_66%,#21468b_66%)]",
  ENG: "bg-[linear-gradient(180deg,#fff_20%,#fff_20%,#ce1124_20%,#ce1124_40%,#fff_40%,#fff_60%,#ce1124_60%,#ce1124_80%,#fff_80%)]",
  AUT: "bg-[linear-gradient(180deg,#ed2939_33%,#fff_33%,#fff_66%,#ed2939_66%)]",
  IRQ: "bg-[linear-gradient(180deg,#ce1126_33%,#fff_33%,#fff_66%,#000_66%)]",
};

/** Circular flag badge for lists. */
export function FlagCircle({ code, className }: { code: CountryCode; className?: string }) {
  return (
    <div
      className={cn(
        "h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/15 shadow-[0_0_8px_rgba(154,53,255,0.15)]",
        FLAG_STYLES[code],
        className,
      )}
    />
  );
}

/**
 * Safe wrapper around `FlagCircle` for a live team-name string (not a fixed
 * `CountryCode`) — falls back to a plain initials badge for any team not in
 * the hardcoded flag set instead of crashing. Use this at every real-data
 * call site instead of `FlagCircle` directly.
 */
export function TeamFlagCircle({ teamName, className }: { teamName: string; className?: string }) {
  const flag = flagUrlFor(teamName);
  if (flag)
    return (
      <div
        className={cn(
          "h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/15 shadow-[0_0_8px_rgba(154,53,255,0.15)]",
          className,
        )}
      >
        {/* Noto flag art sits in the central ~78% of its canvas; scale up so it fills the circle. */}
        <img src={flag} alt={teamName} loading="lazy" className="h-full w-full scale-[1.4] object-cover" />
      </div>
    );
  const code = resolveCountryCode(teamName);
  if (code) return <FlagCircle code={code} className={className} />;
  return (
    <div
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 font-tech text-[8px] font-bold text-white/60",
        className,
      )}
    >
      {teamInitials(teamName)}
    </div>
  );
}

type FlagHexProps = {
  code: CountryCode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZE_MAP = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16 sm:h-20 sm:w-20",
  xl: "h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28",
};

export function FlagHex({ code, size = "md", className }: FlagHexProps) {
  return (
    <div
      className={cn(
        "relative shrink-0",
        SIZE_MAP[size],
        className,
      )}
    >
      <div
        className="absolute inset-0 rotate-0 [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] bg-[#1a1f2e] shadow-[0_0_12px_rgba(154,53,255,0.25)]"
      />
      <div
        className={cn(
          "absolute inset-[3px] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]",
          FLAG_STYLES[code],
        )}
      />
    </div>
  );
}

/** Safe wrapper around `FlagHex` for a live team-name string — see `TeamFlagCircle` above for why this exists. */
export function TeamFlagHex({ teamName, size = "md", className }: { teamName: string; size?: FlagHexProps["size"]; className?: string }) {
  const flag = flagUrlFor(teamName);
  if (flag)
    return (
      <div className={cn("relative shrink-0", SIZE_MAP[size ?? "md"], className)}>
        <div className={cn("absolute inset-0 bg-[#1a1f2e] shadow-[0_0_12px_rgba(154,53,255,0.25)]", HEX_CLIP)} />
        <div className={cn("absolute inset-[3px] overflow-hidden", HEX_CLIP)}>
          {/* Noto flag art sits in the central ~78% of its canvas; scale up so it fills the hexagon. */}
          <img src={flag} alt={teamName} loading="lazy" className="h-full w-full scale-[1.4] object-cover" />
        </div>
      </div>
    );
  const code = resolveCountryCode(teamName);
  if (code) return <FlagHex code={code} size={size} className={className} />;
  return (
    <div className={cn("relative flex shrink-0 items-center justify-center", SIZE_MAP[size ?? "md"], className)}>
      <div className={cn("absolute inset-0 bg-[#1a1f2e] shadow-[0_0_12px_rgba(154,53,255,0.25)]", HEX_CLIP)} />
      <span className="relative font-tech text-[10px] font-bold text-white/60">{teamInitials(teamName)}</span>
    </div>
  );
}
