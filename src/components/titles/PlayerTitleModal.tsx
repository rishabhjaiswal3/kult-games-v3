import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { PlayerTitle, TitleType } from "@/api/playerTitlesApi";
import goldenFounderImg from "@/assets/golden_founder.jpeg";
import vipGrowthMemberImg from "@/assets/vip_growth_member.jpeg";

export const TITLE_CONFIG: Record<TitleType, {
  label: string;
  badge: string;
  headline: string;
  message: string;
  sub: string;
  accentColor: string;
  border: string;
  glow: string;
  badgePill: string;
  btnClass: string;
  img: string;
}> = {
  GOLDEN_FOUNDER: {
    label: "Golden Founder",
    badge: "GOLDEN FOUNDER",
    headline: "You're One of the Originals.",
    message:
      "You believed in Kult before the world knew its name. This title is permanent — a mark of the founding few who built the foundation everyone else stands on.",
    sub: "Held by fewer than 150 wallets in existence.",
    accentColor: "text-amber-300",
    border: "border-amber-400/40",
    glow: "shadow-[0_0_60px_rgba(251,191,36,0.2),0_0_120px_rgba(251,191,36,0.08)]",
    badgePill: "bg-amber-400/10 border border-amber-400/30 text-amber-300",
    btnClass:
      "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black shadow-[0_0_24px_rgba(251,191,36,0.4)]",
    img: goldenFounderImg,
  },
  VIP_GROWTH_MEMBER: {
    label: "VIP Growth Member",
    badge: "VIP GROWTH MEMBER",
    headline: "You're Part of the Inner Circle.",
    message:
      "Selected for exclusive access, early features, and direct influence over Kult's growth. This title recognises you as a force behind the expansion.",
    sub: "Granted to fewer than 500 members worldwide.",
    accentColor: "text-purple-300",
    border: "border-purple-400/40",
    glow: "shadow-[0_0_60px_rgba(168,85,247,0.2),0_0_120px_rgba(168,85,247,0.08)]",
    badgePill: "bg-purple-500/10 border border-purple-400/30 text-purple-300",
    btnClass:
      "bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-500 hover:to-violet-400 text-white font-black shadow-[0_0_24px_rgba(168,85,247,0.45)]",
    img: vipGrowthMemberImg,
  },
};

export interface PlayerTitleModalProps {
  open: boolean;
  titles: PlayerTitle[];
  onClose: () => void;
}

export function PlayerTitleModal({ open, titles, onClose }: PlayerTitleModalProps) {
  const [page, setPage] = useState(0);

  if (titles.length === 0) return null;

  const current = titles[page]!;
  const cfg = TITLE_CONFIG[current.type];
  const isLast = page === titles.length - 1;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[300] bg-black/88 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[300] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 p-4 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">

          {/* Card */}
          <div className={`relative overflow-hidden rounded-2xl border ${cfg.border} bg-[#03070d] ${cfg.glow}`}>

            {/* Close */}
            <DialogPrimitive.Close
              onClick={onClose}
              className="absolute right-3 top-3 z-20 rounded-full border border-white/10 bg-black/50 p-1.5 text-white/50 backdrop-blur-sm transition hover:text-white/90"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            {/* Title image — full width, tall */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img
                src={cfg.img}
                alt={cfg.label}
                className="h-full w-full object-cover"
              />
              {/* Bottom fade into card body */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#03070d] via-[#03070d]/10 to-transparent" />

              {/* Badge pill overlaid on image */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <span className={`inline-flex items-center rounded-full px-4 py-1.5 font-tech text-[10px] font-black tracking-[0.22em] backdrop-blur-sm ${cfg.badgePill}`}>
                  {cfg.badge}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-3 px-5 pb-5 pt-4 text-center">
              {titles.length > 1 && (
                <p className="font-tech text-[9px] font-semibold uppercase tracking-[0.3em] text-white/35">
                  {page + 1} of {titles.length}
                </p>
              )}

              <h2 className={`font-tech text-lg font-bold leading-tight ${cfg.accentColor}`}>
                {cfg.headline}
              </h2>

              <p className="text-[13px] leading-relaxed text-white/60">
                {cfg.message}
              </p>

              <p className={`font-tech text-[10px] font-semibold uppercase tracking-wider ${cfg.accentColor} opacity-70`}>
                {cfg.sub}
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (isLast) onClose();
                    else setPage((p) => p + 1);
                  }}
                  className={`w-full rounded-xl py-3 font-tech text-[11px] uppercase tracking-wider transition ${cfg.btnClass}`}
                >
                  {isLast ? "Enter the Arena" : "See Next Title"}
                </button>

                {!isLast && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-xl border border-white/8 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white/40 transition hover:text-white/70"
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>
          </div>

        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
