import type { Moment } from "@/types/api";

export function deriveMomentGameLabel(moment: Moment): string {
  const hay = [...moment.relatedGames, ...moment.tags, moment.title].join(" ").toLowerCase();
  if (hay.includes("robo")) return "ROBOWARS";
  if (hay.includes("highway")) return "HIGHWAY HUSTLE";
  if (hay.includes("warzone")) return "WARZONE WARRIORS";
  if (hay.includes("ai-arena") || hay.includes("aiarena")) return "ARENA HIGHLIGHTS";
  const game = moment.relatedGames[0];
  return game ? game.replace(/[_-]/g, " ").toUpperCase() : "ARENA HIGHLIGHTS";
}

export function MomentGameBadge({
  moment,
  size = "sm",
}: {
  moment: Moment;
  size?: "sm" | "xs";
}) {
  const game = deriveMomentGameLabel(moment);
  const textClass =
    size === "xs"
      ? "font-tech text-[8px] font-black uppercase tracking-wide"
      : "font-tech text-[9px] font-black uppercase tracking-wide";

  if (game === "ROBOWARS") {
    return (
      <div className={`select-none rounded border border-sky-500/35 bg-sky-950/80 px-2 py-0.5 text-sky-400 ${textClass}`}>
        {game}
      </div>
    );
  }

  if (game === "HIGHWAY HUSTLE") {
    return (
      <div className={`select-none rounded border border-amber-500/35 bg-amber-950/80 px-2 py-0.5 text-amber-300 ${textClass}`}>
        {game}
      </div>
    );
  }

  return (
    <div className={`select-none rounded border border-purple-500/35 bg-purple-950/80 px-2 py-0.5 text-[#d6acff] ${textClass}`}>
      {game}
    </div>
  );
}
