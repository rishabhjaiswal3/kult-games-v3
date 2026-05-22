import { ArrowUpRight, Download, Gamepad2, Star } from "lucide-react";
import type { Game } from "@/types/api";

type GameListingCardProps = {
  game: Game;
  name: string;
  image: string;
  description: string;
  downloadable: boolean;
  onOpen: () => void;
};

function getCategoryBadgeStyle(category: string | undefined) {
  const key = (category ?? "").toLowerCase();
  if (key.includes("action")) return "bg-red-950/80 border-red-500/35 text-red-400";
  if (key.includes("arcade")) return "bg-purple-950/80 border-purple-500/35 text-[#d6acff]";
  if (key.includes("puzzle")) return "bg-blue-950/80 border-blue-500/35 text-blue-400";
  if (key.includes("racing")) return "bg-emerald-950/80 border-emerald-500/35 text-emerald-400";
  return "bg-purple-950/80 border-purple-500/35 text-[#d6acff]";
}

export function GameListingCard({
  game,
  name,
  image,
  description,
  downloadable,
  onOpen,
}: GameListingCardProps) {
  const badgeClass = getCategoryBadgeStyle(game.category);
  const platforms = game.platform ?? [];

  return (
    <article className="group flex min-h-full flex-col overflow-hidden rounded-lg border border-white/8 bg-[#04080f]/95 transition hover:border-[#9a35ff]/35">
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden bg-[#0a0f18] text-left"
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-tech text-[9px] uppercase tracking-wider text-white/35">
            No preview
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent transition group-hover:via-black/25" />
        {game.category ? (
          <div
            className={`absolute left-3 top-3 rounded border px-2 py-0.5 font-tech text-[9px] font-black uppercase tracking-wide ${badgeClass}`}
          >
            {game.category}
          </div>
        ) : null}
        {game.rating != null ? (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded border border-white/10 bg-[#03070d]/80 px-1.5 py-0.5">
            <Star className="h-3 w-3 fill-[#ffc000] text-[#ffc000]" />
            <span className="font-tech text-[9px] font-bold text-white">{game.rating}</span>
          </div>
        ) : null}
        <div className="absolute bottom-3 right-3 rounded border border-white/10 bg-[#03070d]/80 px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wide text-white/85">
          {downloadable ? "Download" : "Instant Play"}
        </div>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <button
          type="button"
          onClick={onOpen}
          className="truncate text-left text-base font-semibold text-white/90 transition hover:text-[#c78aff]"
        >
          {name}
        </button>
        {description ? (
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/45">{description}</p>
        ) : null}
        {platforms.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {platforms.slice(0, 3).map((p) => (
              <span
                key={p}
                className="rounded border border-white/8 bg-white/[0.03] px-1.5 py-0.5 font-tech text-[8px] uppercase text-white/40"
              >
                {p}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between border-t border-white/6 pt-3">
          <span className="font-tech text-[10px] font-bold uppercase tracking-wider text-[#00f080]">Free</span>
          <button
            type="button"
            onClick={onOpen}
            className="flex items-center gap-1.5 rounded border border-[#9b32ff]/70 bg-[#170d26]/65 px-3 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-[#d6acff] transition hover:border-[#9a35ff] hover:bg-[#230b35]/90"
          >
            {downloadable ? (
              <>
                <Download className="h-3.5 w-3.5" />
                Get Game
              </>
            ) : (
              <>
                <Gamepad2 className="h-3.5 w-3.5" />
                Play
              </>
            )}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function GameListingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-white/8 bg-[#04080f]/95">
      <div className="aspect-[16/10] animate-pulse bg-white/5" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-4/5 animate-pulse rounded bg-white/5" />
        <div className="h-3 w-full animate-pulse rounded bg-white/5" />
        <div className="mt-3 flex justify-between border-t border-white/6 pt-3">
          <div className="h-3 w-10 animate-pulse rounded bg-white/5" />
          <div className="h-8 w-24 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}
