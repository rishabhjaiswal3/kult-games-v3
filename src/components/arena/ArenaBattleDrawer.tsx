import { useEffect, type ReactNode } from "react";
import { MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ArenaBattleAgentBanner,
  type BannerTheme,
} from "@/components/arena/ArenaBattleAgentBanner";
import type { AiArenaAgent, AiArenaBattle } from "@/types/aiArenaGateway";

type GamePhase = "live" | "ended";

type ArenaBattleDrawerProps = {
  open: boolean;
  onClose: () => void;
  mode: string;
  observerCount: number;
  chatTourId?: string;
  agentsTourId?: string;
  myAgent: AiArenaAgent | null;
  opponent: AiArenaAgent | null;
  battle?: AiArenaBattle;
  gamePhase: GamePhase;
  bannerTheme?: BannerTheme;
  children: ReactNode;
};

/** Slide-in battle panel: agents on top, chat below. */
export function ArenaBattleDrawer({
  open,
  onClose,
  mode,
  observerCount,
  chatTourId = "arena-game-chat",
  agentsTourId = "arena-game-agents",
  myAgent,
  opponent,
  battle,
  gamePhase,
  bannerTheme = "warzone",
  children,
}: ArenaBattleDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Close battle panel"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        data-tour={chatTourId}
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-dvh max-h-dvh w-[min(92vw,360px)] flex-col overflow-hidden border-l border-white/10 bg-[#04080f]/98 shadow-[-24px_0_80px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/8 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="font-tech text-[10px] font-bold uppercase tracking-widest text-white/70">
              Battle info
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-[9px] text-white/35">
                {observerCount} watching
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60 transition hover:border-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="shrink-0 border-b border-white/8" data-tour={agentsTourId}>
          <ArenaBattleAgentBanner
            myAgent={myAgent}
            opponent={opponent}
            battle={battle}
            gamePhase={gamePhase}
            theme={bannerTheme}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center gap-2 border-b border-white/8 px-3 py-2">
            <span className="font-tech text-[9px] uppercase tracking-widest text-white/45">
              Live chat
            </span>
            <span className="font-tech text-[9px] uppercase tracking-wider text-white/25">
              {mode}
            </span>
          </div>
          {children}
        </div>
      </aside>
    </>
  );
}

/** Floating action button to open the battle drawer. */
export function ArenaBattleChatFab({
  visible,
  onOpen,
}: {
  visible: boolean;
  onOpen: () => void;
}) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open battle info and chat"
      className="absolute bottom-5 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#9a35ff]/45 bg-[linear-gradient(135deg,rgba(154,53,255,0.55),rgba(4,8,15,0.92))] text-white shadow-[0_0_28px_rgba(154,53,255,0.35)] transition hover:scale-105 hover:border-[#c084fc]/70 hover:shadow-[0_0_36px_rgba(154,53,255,0.5)]"
    >
      <MessageSquare className="h-6 w-6" />
    </button>
  );
}
