import { Bookmark, Clock, Heart, Hexagon, MessageCircle, Play } from "lucide-react";
import MomentShareDialog from "@/components/moments/MomentShareDialog";
import { compactMetric, type MomentCard } from "@/lib/momentCard";
import { cn } from "@/lib/utils";

function ClanIconBadge({ type }: { type: string }) {
  const base = "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold";
  if (type === "solana") return <span className={`${base} bg-teal-400/20 text-teal-400`}>S</span>;
  if (type === "base") return <span className={`${base} bg-blue-500/20 text-blue-400`}>B</span>;
  if (type === "shadow") return <span className={`${base} bg-red-500/20 text-red-500`}>S</span>;
  if (type === "rebel") return <span className={`${base} bg-amber-400/20 text-amber-400`}>R</span>;
  return <span className={`${base} bg-gray-500/20 text-gray-400`}>A</span>;
}

function GameBadge({ game, size = "sm" }: { game: string; size?: "sm" | "xs" }) {
  const text =
    size === "xs"
      ? "font-tech text-[8px] font-black uppercase tracking-wide"
      : "font-tech text-[9px] font-black uppercase tracking-wide";
  if (game === "ROBOWARS") {
    return (
      <div className={`inline-flex max-w-full rounded border border-sky-500/35 bg-sky-950/80 px-2 py-0.5 text-sky-400 select-none ${text}`}>
        <span className="truncate">{game}</span>
      </div>
    );
  }
  if (game === "HIGHWAY HUSTLE") {
    return (
      <div className={`inline-flex max-w-full rounded border border-amber-500/35 bg-amber-950/80 px-2 py-0.5 text-amber-300 select-none ${text}`}>
        <span className="truncate">{game}</span>
      </div>
    );
  }
  return (
    <div className={`inline-flex max-w-full rounded border border-purple-500/35 bg-purple-950/80 px-2 py-0.5 text-[#d6acff] select-none ${text}`}>
      <span className="truncate">{game}</span>
    </div>
  );
}

export function MomentFeedCard({
  item,
  onOpen,
  onBookmarkToggle,
}: {
  item: MomentCard;
  onOpen: (item: MomentCard) => void;
  onBookmarkToggle: (id: string) => void;
}) {
  const hasDuration = item.duration !== "—";
  const likeCount = item.likes;
  const commentCount = compactMetric(item.raw.numComments);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-white/8 bg-[#04080f]/95 transition hover:border-purple-500/30">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="group relative block h-[152px] w-full shrink-0 cursor-pointer overflow-hidden bg-black/40 text-left sm:h-[160px]"
      >
        <img
          src={item.thumbnail}
          alt={item.title}
          loading="lazy"
          className="block w-full max-w-full h-auto origin-top transition duration-500 group-hover:scale-[1.03]"
        />
        {item.contentType === "video" ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition duration-300 group-hover:scale-110 group-hover:border-purple-400 group-hover:bg-[#9a35ff] group-hover:shadow-[0_0_15px_rgba(154,53,255,0.45)]">
              <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
            </div>
          </div>
        ) : null}
      </button>
      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-3.5">
        <h3
          onClick={() => onOpen(item)}
          className="line-clamp-2 min-h-[2.75rem] cursor-pointer text-[15px] font-semibold leading-snug text-white/90 transition hover:text-purple-400 sm:min-h-[2.5rem] sm:text-sm"
        >
          {item.title}
        </h3>
        <p className="mt-1 line-clamp-1 min-h-[1.125rem] text-[11px] leading-snug text-white/45 sm:text-xs">
          {item.description}
        </p>
        <div className="mt-1.5 flex min-h-[2.25rem] flex-col justify-center gap-1.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
          <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-white/50">
            <span className="truncate">by {item.creator}</span>
            <Hexagon className="h-3 w-3 shrink-0 fill-[#9a35ff] text-[#9a35ff]" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/40">
            <ClanIconBadge type={item.clanIconType} />
            <span className="max-w-[110px] truncate">{item.clanName}</span>
          </div>
        </div>
        <div className="mt-2 flex h-6 items-center">
          {hasDuration ? (
            <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-tech text-[8px] font-black uppercase tracking-wide text-white/65">
              <Clock className="h-2.5 w-2.5" />
              {item.duration}
            </span>
          ) : null}
        </div>
        <div className="mt-auto flex min-w-0 items-center justify-between gap-2 border-t border-white/6 pt-2 text-xs font-semibold text-white/45">
          <div className="min-w-0 max-w-[42%] shrink truncate">
            <GameBadge game={item.game} size="xs" />
          </div>
          <div className="ml-auto flex shrink-0 items-center justify-end gap-0.5 sm:gap-1">
            <span className="inline-flex h-8 items-center gap-1 rounded-md px-1.5 text-white/45 sm:px-2">
              <Heart className="h-4 w-4" />
              <span className="font-tech text-[10px] font-bold tracking-wide">{likeCount}</span>
            </span>
            <button
              type="button"
              onClick={() => onOpen(item)}
              className="inline-flex h-8 items-center gap-1 rounded-md px-1.5 text-white/45 transition hover:bg-white/5 hover:text-purple-300 sm:px-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-tech text-[10px] font-bold tracking-wide">{commentCount}</span>
            </button>
            <div
              className="inline-flex h-8 w-8 items-center justify-center text-white/30 transition hover:text-purple-400"
              onClick={(event) => event.stopPropagation()}
            >
              <MomentShareDialog moment={item.raw} triggerVariant="icon" />
            </div>
            <button
              type="button"
              onClick={() => onBookmarkToggle(item.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/30 transition hover:bg-white/5 hover:text-purple-400"
            >
              <Bookmark className={`h-4 w-4 ${item.isBookmarked ? "fill-purple-500 text-purple-500" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function MomentFeedCardSkeleton({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        "flex h-full animate-pulse flex-col overflow-hidden rounded-lg border border-white/8 bg-[#04080f]/95",
        className,
      )}
    >
      <div className="h-[152px] w-full shrink-0 bg-black/40 sm:h-[160px]">
        <div className="h-full w-full bg-white/5" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-3.5">
        <div className="min-h-[2.75rem] space-y-2 sm:min-h-[2.5rem]">
          <div className="h-3.5 w-full rounded bg-white/8" />
          <div className="h-3.5 w-[88%] rounded bg-white/6" />
        </div>
        <div className="mt-1 h-[1.125rem] w-[62%] rounded bg-white/5" />
        <div className="mt-1.5 flex min-h-[2.25rem] flex-col justify-center gap-1.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
          <div className="h-3 w-[48%] rounded bg-white/5" />
          <div className="h-3 w-[34%] rounded bg-white/5 min-[420px]:w-[28%]" />
        </div>
        <div className="mt-2 flex h-6 items-center">
          <div className="h-5 w-14 rounded border border-white/6 bg-white/[0.03]" />
        </div>
        <div className="mt-auto flex min-w-0 items-center justify-between gap-2 border-t border-white/6 pt-2">
          <div className="h-5 w-[38%] max-w-[5.5rem] rounded bg-white/5" />
          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
            <div className="h-8 w-10 rounded-md bg-white/5" />
            <div className="h-8 w-10 rounded-md bg-white/5" />
            <div className="h-8 w-8 rounded-md bg-white/5" />
            <div className="h-8 w-8 rounded-md bg-white/5" />
          </div>
        </div>
      </div>
    </article>
  );
}
