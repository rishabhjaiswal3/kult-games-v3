import { Download, Gamepad2, Star } from "lucide-react";
import type { Game } from "@/types/api";

type GameListingCardProps = {
  game: Game;
  name: string;
  image: string;
  description: string;
  downloadable: boolean;
  onOpen: () => void;
};

function getCategoryStyle(category: string | undefined) {
  const key = (category ?? "").toLowerCase();
  if (key.includes("action")) return "bg-red-500/10 text-red-400 border-red-500/30";
  if (key.includes("arcade")) return "bg-purple-500/10 text-[#d6acff] border-purple-500/30";
  if (key.includes("puzzle")) return "bg-blue-500/10 text-blue-400 border-blue-500/30";
  if (key.includes("racing")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  return "bg-white/5 text-white/50 border-white/10";
}

export function GameListingCard({
  game,
  name,
  image,
  description,
  downloadable,
  onOpen,
}: GameListingCardProps) {
  const tagClass = getCategoryStyle(game.category);
  const platforms = game.platform ?? [];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="arena-panel group relative flex h-full min-h-[300px] cursor-pointer flex-col overflow-hidden border-white/8 bg-[#04080f]/95 transition hover:ring-1 hover:ring-[#9a35ff]/20"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/6 bg-[#0a0f18]">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-tech text-[9px] uppercase tracking-wider text-white/35">
            No preview
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04080f] via-[#04080f]/15 to-transparent" />
        {game.category ? (
          <div
            className={`absolute left-2.5 top-2.5 rounded border px-2 py-0.5 font-tech text-[8px] font-black uppercase tracking-wider ${tagClass}`}
          >
            {game.category}
          </div>
        ) : null}
        {game.rating != null ? (
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded border border-white/10 bg-black/50 px-2 py-0.5">
            <Star className="h-3 w-3 fill-[#ffc000] text-[#ffc000]" />
            <span className="font-tech text-[9px] font-bold text-white/90">{game.rating}</span>
          </div>
        ) : null}
        <div className="absolute bottom-2.5 right-2.5 rounded border border-white/10 bg-black/50 px-2 py-0.5 font-tech text-[8px] font-bold uppercase tracking-wider text-white/75">
          {downloadable ? "Download" : "Instant Play"}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-3 p-3.5">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-xs font-bold leading-snug text-white/95 transition group-hover:text-[#c78aff]">
              {name}
            </h3>
            <span className="shrink-0 font-tech text-[10px] font-bold text-[#00f080]">FREE</span>
          </div>
          {description ? (
            <p className="line-clamp-2 text-[9px] leading-relaxed text-white/40">{description}</p>
          ) : null}
          {platforms.length > 0 ? (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {platforms.map((p) => (
                <span
                  key={p}
                  className="rounded border border-white/8 bg-white/[0.03] px-1.5 py-0.5 font-tech text-[8px] uppercase text-white/45"
                >
                  {p}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="btn-primary flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md font-tech text-[9px] font-bold uppercase tracking-wider pointer-events-none"
        >
          {downloadable ? (
            <>
              <Download className="h-3.5 w-3.5" />
              Download
            </>
          ) : (
            <>
              <Gamepad2 className="h-3.5 w-3.5" />
              Play Game
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export function GameListingCardSkeleton() {
  return (
    <div className="arena-panel overflow-hidden border-white/8 bg-[#04080f]/95">
      <div className="aspect-[16/10] animate-pulse border-b border-white/6 bg-white/5" />
      <div className="space-y-3 p-3.5">
        <div className="h-3 w-4/5 animate-pulse rounded bg-white/5" />
        <div className="h-2 w-full animate-pulse rounded bg-white/5" />
        <div className="h-9 w-full animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}
