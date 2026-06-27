import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Bookmark, Download, Heart, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import MomentShareDialog from "@/components/moments/MomentShareDialog";
import type { Moment } from "@/types/api";
import { cn } from "@/lib/utils";

type MomentEngagementBarProps = {
  moment: Moment;
  bookmarked: boolean;
  onBookmarkToggle: () => void;
  onLike: () => void;
  onComments: () => void;
  isLiking?: boolean;
};

type EngagementChipProps = {
  icon: LucideIcon;
  label: string;
  count?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
  accent?: "rose" | "purple" | "cyan" | "amber";
  iconOnly?: boolean;
};

function EngagementChip({
  icon: Icon,
  label,
  count,
  onClick,
  disabled,
  loading,
  active,
  accent = "cyan",
  iconOnly = false,
}: EngagementChipProps) {
  const accentStyles = {
    rose: {
      active: "border-rose-500/45 bg-rose-500/10 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.12)]",
      hover: "hover:border-rose-500/35 hover:bg-rose-500/8 hover:text-rose-300",
      icon: "text-rose-400",
    },
    purple: {
      active: "border-purple-500/45 bg-purple-500/10 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.12)]",
      hover: "hover:border-purple-500/35 hover:bg-purple-500/8 hover:text-purple-200",
      icon: "text-purple-300",
    },
    cyan: {
      active: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
      hover: "hover:border-cyan-500/30 hover:bg-cyan-500/8 hover:text-cyan-200",
      icon: "text-cyan-300/80",
    },
    amber: {
      active: "border-amber-500/45 bg-amber-500/10 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
      hover: "hover:border-amber-500/35 hover:bg-amber-500/8 hover:text-amber-200",
      icon: "text-amber-300",
    },
  }[accent];

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={disabled}
      aria-label={iconOnly ? label : undefined}
      title={label}
      className={cn(
        "group inline-flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] font-tech text-[11px] font-semibold text-white/62 transition duration-200",
        iconOnly ? "h-9 w-9 px-0" : "h-9 min-w-[3.25rem] px-3",
        active ? accentStyles.active : accentStyles.hover,
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition duration-200",
            active ? accentStyles.icon : "text-white/45 group-hover:text-inherit",
            active && accent === "rose" && "fill-rose-400/30",
            active && accent === "amber" && "fill-amber-400/35",
          )}
        />
      )}
      {!iconOnly && count !== undefined ? (
        <span className="tabular-nums leading-none">{count}</span>
      ) : null}
    </Tag>
  );
}

function deriveFilename(moment: Moment): string {
  const url = (moment.assetZgUrl ?? moment.assetUrl ?? "").split("?")[0];
  const ext = url.match(/\.(mp4|webm|mov|m4v|ogv|png|jpe?g|gif|webp|avif)$/i)?.[0] ?? "";
  const slug = (moment.title || `moment-${moment._id}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug}${ext}`;
}

export function MomentEngagementBar({
  moment,
  bookmarked,
  onBookmarkToggle,
  onLike,
  onComments,
  isLiking = false,
}: MomentEngagementBarProps) {
  const likeCount = moment.numLikes > 0 ? moment.numLikes.toLocaleString() : "—";
  const commentCount = moment.numComments > 0 ? moment.numComments.toLocaleString() : "—";
  const hasLikes = moment.numLikes > 0;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const url = moment.assetZgUrl ?? moment.assetUrl;
    if (!url) { toast.error("No asset available to download"); return; }
    setIsDownloading(true);
    const filename = deriveFilename(moment);
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success("Download started");
    } catch {
      // CORS fallback — opens in new tab so browser handles download
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.info("Opening in new tab — use Save As to download");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/8 bg-[linear-gradient(180deg,rgba(10,15,27,0.92),rgba(4,8,15,0.88))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/25 to-transparent" />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <EngagementChip
            icon={Heart}
            label="Like moment"
            count={likeCount}
            onClick={onLike}
            disabled={isLiking}
            loading={isLiking}
            active={hasLikes}
            accent="rose"
          />
          <EngagementChip
            icon={MessageCircle}
            label="View comments"
            count={commentCount}
            onClick={onComments}
            active={moment.numComments > 0}
            accent="purple"
          />
          <EngagementChip
            icon={Bookmark}
            label={bookmarked ? "Remove bookmark" : "Bookmark moment"}
            onClick={onBookmarkToggle}
            active={bookmarked}
            accent="amber"
            iconOnly
          />
          <EngagementChip
            icon={Download}
            label="Download moment"
            onClick={handleDownload}
            disabled={isDownloading}
            loading={isDownloading}
            accent="cyan"
            iconOnly
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition hover:border-purple-500/35 hover:bg-purple-500/8">
            <MomentShareDialog moment={moment} triggerVariant="icon" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MomentEngagementBar;
