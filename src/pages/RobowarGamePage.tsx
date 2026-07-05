/**
 * RobowarGamePage — Full-screen Robowar AI duel battle experience.
 *
 * RoboWars is an Unreal Engine title that runs via the AI Arena desktop
 * Launcher rather than a Unity WebGL embed. The launcher handles the match;
 * this page:
 *   1. Shows a pre-match landing (LauncherPreMatchView) with a Launch button.
 *   2. Opens the aiarena:// URI scheme to hand off to the installed launcher.
 *   3. Detects whether the launcher is installed (window blur heuristic).
 *   4. Polls /v1/battles/:battleId every 2 s while the match runs.
 *   5. When the backend marks the battle COMPLETE, transitions automatically
 *      into the normal AI Arena result overlay (commentary + 0G storage).
 *
 * Highway Hustle and Warzone Warrior are completely unaffected.
 */

import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from "react";
import {
  Swords,
  Trophy,
  ExternalLink,
  Send,
  Share2,
  Loader2,
  ArrowLeft,
  Crown,
  Shield,
  Zap,
  MessageSquare,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { buildTrashTalkMomentPath } from "@/lib/battleTrashTalkMoment";
import { getRankFromElo } from "@/utils/rankSystem";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import { getArenaAgentPortrait } from "@/constants/arenaAgentArchetypes";
import {
  LauncherPreMatchView,
  LauncherWaitingScreen,
  LauncherNotInstalledModal,
  LauncherErrorView,
} from "@/components/launcher";
import { useLauncherBattle } from "@/hooks/useLauncherBattle";
import type {
  AiArenaAgent,
  AiArenaBattle,
  AiArenaBattleResult,
} from "@/types/aiArenaGateway";

// ─────────────────────────────────────────────────────────────────────────────
// Theme — red
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT       = "#dc2626";
const ACCENT_BRIGHT = "#ef4444";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type GamePhase = "live" | "ended";

type RobowarDuelResult = {
  battleId: string;
  winnerId: string;
  winnerName: string;
  winnerHp: number;
  loserId: string;
  loserName: string;
  loserHp: number;
};

type ChatMsg =
  | { id: string; kind: "system"; text: string; ts: Date }
  | {
      id: string;
      kind: "player";
      agentId: string;
      agentName: string;
      color: string;
      text: string;
      ts: Date;
    }
  | {
      id: string;
      kind: "result";
      result: AiArenaBattleResult;
      battle: AiArenaBattle;
      myAgentId: string | null;
      myAgent: AiArenaAgent | null;
      opponent: AiArenaAgent | null;
      ts: Date;
    };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function shortId(v?: string | null) {
  if (!v) return "—";
  return v.length > 14 ? `${v.slice(0, 6)}…${v.slice(-4)}` : v;
}

function clanColor(clan?: string): string {
  const c = (clan ?? "").toUpperCase();
  if (c === "ZEROG")  return "#00e68a";
  if (c === "BASE")   return "#0052ff";
  if (c === "SOLANA") return "#9945ff";
  if (c === "OKX")    return "#e0a528";
  return "#8b6dff";
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function eloSign(delta?: number) {
  if (delta == null) return null;
  return delta >= 0 ? `+${delta}` : `${delta}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// AgentLoadingCard
// ─────────────────────────────────────────────────────────────────────────────

function AgentLoadingCard({
  agent,
  side,
}: {
  agent: AiArenaAgent | null;
  side: "left" | "right";
}) {
  const portrait = agent ? getArenaAgentPortrait(agent) : null;
  const isVideo  = portrait?.endsWith(".mp4");
  const color    = agent ? clanColor(agent.clan) : "#8b6dff";

  return (
    <div className="flex w-[132px] flex-col items-center gap-2 sm:w-[180px] sm:gap-3">
      <div
        className="relative h-[165px] w-[132px] overflow-hidden rounded-2xl border border-white/20 sm:h-[220px] sm:w-[180px]"
        style={{ boxShadow: `0 0 48px ${color}55, 0 12px 40px rgba(0,0,0,0.7)` }}
      >
        {portrait ? (
          isVideo ? (
            <video
              src={portrait}
              autoPlay
              loop
              muted
              playsInline
              className={cn(
                "h-full w-full object-cover object-top",
                side === "right" && "-scale-x-100"
              )}
            />
          ) : (
            <img
              src={portrait}
              alt={agent?.name ?? "agent"}
              className={cn(
                "h-full w-full object-cover object-top",
                side === "right" && "-scale-x-100"
              )}
              loading="eager"
            />
          )
        ) : (
          <div className="h-full w-full animate-pulse bg-white/5" />
        )}
        <div
          className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10"
          style={{ background: `linear-gradient(to top, ${color}cc 0%, ${color}40 60%, transparent 100%)` }}
        >
          <div className="font-display text-sm font-black leading-tight text-white drop-shadow-lg truncate sm:text-base">
            {agent?.name ?? "???"}
          </div>
          <div className="font-tech text-[9px] uppercase tracking-widest text-white/70 mt-0.5">
            {agent?.archetype ?? "—"}
          </div>
        </div>
      </div>

      <div
        className="w-full rounded-xl border border-white/10 px-2.5 py-2 text-center sm:px-4 sm:py-2.5"
        style={{ background: "rgba(10,10,20,0.65)", backdropFilter: "blur(12px)" }}
      >
        <div className="font-tech text-base font-bold sm:text-lg" style={{ color }}>
          {agent?.eloRating?.toLocaleString() ?? "—"}
          <span className="text-[9px] text-white/30 font-normal ml-1">ELO</span>
        </div>
        <div className="flex justify-center gap-3 mt-0.5">
          <span className="font-mono text-[9px] text-white/35">{agent?.wins ?? 0}W</span>
          <span className="text-white/15">·</span>
          <span className="font-mono text-[9px] text-white/35">{agent?.losses ?? 0}L</span>
        </div>
        {agent?.clan && (
          <div className="font-tech text-[8px] uppercase tracking-wider mt-1" style={{ color }}>
            {agent.clan}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AgentCard
// ─────────────────────────────────────────────────────────────────────────────

function AgentCard({
  agent,
  side,
  isWinner,
  isLoser,
}: {
  agent: AiArenaAgent | null;
  side: "left" | "right";
  isWinner?: boolean;
  isLoser?: boolean;
}) {
  const rankInfo = agent ? getRankFromElo(agent.eloRating) : null;
  const color    = agent ? clanColor(agent.clan) : "#8b6dff";
  const isRight  = side === "right";

  if (!agent) {
    return (
      <div className="flex flex-1 items-center gap-3 px-2 sm:px-4">
        <div className="h-14 w-14 sm:h-16 sm:w-16 animate-pulse rounded-xl bg-white/5" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 animate-pulse rounded bg-white/8" />
          <div className="h-2 w-16 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    );
  }

  const inner = (
    <>
      <div className="relative shrink-0">
        <div className="absolute -inset-1.5 rounded-xl blur-md opacity-50" style={{ background: `${color}40` }} />
        <ArenaAgentThumbnail agent={agent} className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-xl border-white/15" />
        {isWinner && (
          <Crown className="absolute -top-2 -right-2 h-4 w-4 drop-shadow-lg" style={{ color: "#fbbf24" }} />
        )}
      </div>

      <div className={`min-w-0 ${isRight ? "text-right" : "text-left"}`}>
        <div className="font-display text-sm sm:text-lg font-bold leading-tight truncate max-w-[88px] sm:max-w-[160px]">
          {agent.name}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-white/45 mt-0.5">
          {agent.archetype}
        </div>
        <div className="flex items-center gap-2 mt-1.5" style={{ justifyContent: isRight ? "flex-end" : "flex-start" }}>
          <span className="font-tech text-sm font-bold" style={{ color }}>
            {agent.eloRating.toLocaleString()}
          </span>
          <span className="text-[9px] text-white/30 font-tech">ELO</span>
          {rankInfo && (
            <img src={rankInfo.image} alt={rankInfo.name} title={rankInfo.name} className="h-5 w-5 object-contain" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5" style={{ justifyContent: isRight ? "flex-end" : "flex-start" }}>
          <span className="text-[9px] text-white/30 font-tech">{agent.wins}W</span>
          <span className="text-[9px] text-white/20">·</span>
          <span className="text-[9px] text-white/30 font-tech">{agent.losses}L</span>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3 px-1.5 sm:px-4 transition-all duration-500 ${
        isLoser ? "opacity-40 grayscale" : ""
      } ${isRight ? "flex-row-reverse" : ""}`}
    >
      {inner}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AgentBanner
// ─────────────────────────────────────────────────────────────────────────────

function AgentBanner({
  myAgent,
  opponent,
  battle,
  gamePhase,
  mode,
}: {
  myAgent: AiArenaAgent | null;
  opponent: AiArenaAgent | null;
  battle?: AiArenaBattle;
  gamePhase: GamePhase;
  mode: string;
}) {
  const result = battle?.result;
  const myId   = myAgent?.id;
  const myWon  = result?.winnerId === myId;
  const oppWon =
    result?.loserId !== myId && result?.winnerId !== myId
      ? null
      : result?.winnerId !== myId;

  return (
    <div className="relative border-b border-white/8 bg-[#04080f]/95 backdrop-blur overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(220,38,38,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(220,38,38,0.5) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#dc262620] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#dc262620] to-transparent" />

      <div className="relative flex items-center min-h-[80px] sm:min-h-[96px]">
        <AgentCard
          agent={myAgent}
          side="left"
          isWinner={gamePhase === "ended" && myWon}
          isLoser={gamePhase === "ended" && !myWon && !!result}
        />

        <div className="flex shrink-0 flex-col items-center justify-center px-2 sm:px-4">
          <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full border border-primary/50 bg-primary/15 shadow-[0_0_20px_hsl(268_100%_70%/0.3)]">
              <Swords className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </div>
          <span className="font-display text-base sm:text-xl font-black mt-1 text-gradient">VS</span>
          <span className="font-tech text-[8px] uppercase tracking-widest text-white/30 mt-0.5">{mode}</span>
        </div>

        <AgentCard
          agent={opponent}
          side="right"
          isWinner={gamePhase === "ended" && !!oppWon}
          isLoser={gamePhase === "ended" && oppWon === false && !!result}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ResultCard (inside chat)
// ─────────────────────────────────────────────────────────────────────────────

function ResultCard({
  result,
  battle,
  myAgentId,
  myAgent,
  opponent,
  onShareMoment,
}: {
  result: AiArenaBattleResult;
  battle: AiArenaBattle;
  myAgentId: string | null;
  myAgent: AiArenaAgent | null;
  opponent: AiArenaAgent | null;
  onShareMoment?: () => void;
}) {
  const winner      = result.winnerId === myAgent?.id ? myAgent : result.winnerId === opponent?.id ? opponent : null;
  const loser       = result.loserId  === myAgent?.id ? myAgent : result.loserId  === opponent?.id ? opponent : null;
  const iWon        = result.winnerId === myAgentId;
  const zgLink      = battle.id ? `https://storagescan.0g.ai/tx/${battle.id}` : null;
  const winnerColor = winner ? clanColor(winner.clan) : "#fbbf24";
  const loserColor  = loser  ? clanColor(loser.clan)  : "#6b7280";

  return (
    <div className="mx-2 my-1 overflow-hidden rounded-xl border border-white/10 bg-[#0d1020] shadow-[0_0_32px_rgba(0,0,0,0.6)]">
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{ background: `linear-gradient(135deg, ${winnerColor}18, transparent)`, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Trophy className="h-3.5 w-3.5 shrink-0" style={{ color: winnerColor }} />
        <span className="font-tech text-[10px] uppercase tracking-widest font-bold" style={{ color: winnerColor }}>
          {iWon ? "VICTORY" : "DEFEAT"}
        </span>
        <span className="ml-auto font-mono text-[9px] text-white/25">{shortId(battle.id)}</span>
      </div>

      <div className="px-3 py-3 space-y-2">
        {winner && (
          <div className="flex items-center gap-2">
            <Crown className="h-3 w-3 shrink-0 text-yellow-400" />
            <span className="font-tech text-[10px] text-white/40 uppercase">Winner</span>
            <span className="font-tech text-[11px] font-bold ml-auto truncate max-w-[100px]" style={{ color: winnerColor }}>
              {winner.name}
            </span>
            {result.eloChange?.[winner.id] != null && (
              <span className="font-mono text-[10px] text-green-400 shrink-0">
                {eloSign(result.eloChange[winner.id])} ELO
              </span>
            )}
          </div>
        )}
        {loser && (
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 shrink-0 text-white/25" />
            <span className="font-tech text-[10px] text-white/40 uppercase">Destroyed</span>
            <span className="font-tech text-[11px] font-bold ml-auto truncate max-w-[100px]" style={{ color: loserColor }}>
              {loser.name}
            </span>
            {result.eloChange?.[loser.id] != null && (
              <span className="font-mono text-[10px] text-red-400 shrink-0">
                {eloSign(result.eloChange[loser.id])} ELO
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1.5 border-t border-white/6">
          {result.rounds != null && (
            <div className="text-center">
              <div className="font-display text-sm font-bold text-white/80">{result.rounds}</div>
              <div className="font-tech text-[8px] uppercase text-white/30">Rounds</div>
            </div>
          )}
          <div className="text-center">
            <div className="font-display text-sm font-bold text-white/80">{battle.status}</div>
            <div className="font-tech text-[8px] uppercase text-white/30">Status</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-white/6 bg-white/[0.02]">
        {zgLink ? (
          <a
            href={zgLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[9px] font-mono text-white/35 hover:text-neon-cyan transition"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            View on 0G
          </a>
        ) : (
          <span className="text-[9px] font-mono text-white/20">Stored on 0G</span>
        )}
        <button
          type="button"
          onClick={onShareMoment}
          disabled={!onShareMoment}
          className={`ml-auto flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[9px] font-tech uppercase tracking-wider transition ${
            onShareMoment
              ? "border-[#9a35ff]/40 bg-[#9a35ff]/12 text-[#d6acff] hover:bg-[#9a35ff]/22"
              : "border-white/10 bg-white/5 text-white/30 cursor-not-allowed"
          }`}
        >
          <Share2 className="h-2.5 w-2.5" />
          Kult Moment
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ChatBubble
// ─────────────────────────────────────────────────────────────────────────────

function ChatBubble({ msg, onShareMoment }: { msg: ChatMsg; onShareMoment?: () => void }) {
  const time = msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (msg.kind === "result") {
    return (
      <div className="py-1">
        <ResultCard
          result={msg.result}
          battle={msg.battle}
          myAgentId={msg.myAgentId}
          myAgent={msg.myAgent}
          opponent={msg.opponent}
          onShareMoment={onShareMoment}
        />
      </div>
    );
  }

  if (msg.kind === "system") {
    return (
      <div className="px-3 py-1">
        <span className="text-[10px] text-white/30 italic font-mono">{msg.text}</span>
      </div>
    );
  }

  return (
    <div className="px-3 py-1 hover:bg-white/[0.025] transition">
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="font-tech text-[10px] font-bold shrink-0" style={{ color: msg.color }}>
          {msg.agentName}
        </span>
        <span className="font-mono text-[8px] text-white/20 shrink-0">{time}</span>
      </div>
      <p className="text-[11px] text-white/75 leading-snug mt-0.5 break-words">{msg.text}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GameChatPanel
// ─────────────────────────────────────────────────────────────────────────────

function GameChatPanel({
  messages,
  chatInput,
  onInputChange,
  onSend,
  chatEndRef,
  myAgent,
  observerCount,
  onShareMoment,
}: {
  messages: ChatMsg[];
  chatInput: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
  myAgent: AiArenaAgent | null;
  observerCount: number;
  onShareMoment?: () => void;
}) {
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex h-[460px] w-full shrink-0 flex-col border-t border-white/8 bg-[#04080f]/90 md:h-auto md:w-[300px] md:border-l md:border-t-0 lg:w-[320px]">
      <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2.5">
        <MessageSquare className="h-3.5 w-3.5 text-primary/70" />
        <span className="font-tech text-[10px] uppercase tracking-widest text-white/60 font-bold">LIVE CHAT</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-[9px] text-white/30">{observerCount} watching</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} onShareMoment={onShareMoment} />
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-white/8 p-2">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 focus-within:border-primary/40 transition">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder={myAgent ? `Chat as ${myAgent.name}…` : "Send a message…"}
            maxLength={200}
            className="flex-1 min-w-0 bg-transparent text-[11px] text-white/80 placeholder:text-white/25 outline-none"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!chatInput.trim()}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/20 text-primary hover:bg-primary/35 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
        <p className="mt-1 text-center font-mono text-[8px] text-white/15">
          Enter to send · observers can chat
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Battle Result Overlay
// ─────────────────────────────────────────────────────────────────────────────

function BattleResultOverlay({
  result,
  myAgentId,
  commentary,
  storageHashes,
  onHome,
  onShareMoment,
}: {
  result: RobowarDuelResult;
  myAgentId: string | null;
  commentary?: string | null;
  storageHashes?: string[];
  onHome: () => void;
  onShareMoment?: () => void;
}) {
  const myAgentWon = result.winnerId === myAgentId;

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "rgba(3,7,16,0.90)", backdropFilter: "blur(10px)" }}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.85)]"
        style={{ background: "rgba(8,12,24,0.97)" }}
      >
        {/* Header */}
        <div
          className="relative px-8 pt-8 pb-5 text-center overflow-hidden"
          style={{
            background: myAgentWon
              ? "linear-gradient(135deg, rgba(251,191,36,0.15) 0%, transparent 60%)"
              : "linear-gradient(135deg, rgba(220,38,38,0.10) 0%, transparent 60%)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: myAgentWon
                ? "linear-gradient(90deg, transparent, #fbbf24, transparent)"
                : "linear-gradient(90deg, transparent, #dc2626, transparent)",
            }}
          />
          <div
            className="font-display text-5xl font-black tracking-[0.08em]"
            style={{
              color: myAgentWon ? "#fbbf24" : ACCENT_BRIGHT,
              textShadow: `0 0 40px ${myAgentWon ? "#fbbf2488" : `${ACCENT_BRIGHT}88`}`,
            }}
          >
            {myAgentWon ? "VICTORIOUS!" : "DESTROYED"}
          </div>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span
              className="rounded-full border px-3 py-0.5 font-tech text-[9px] uppercase tracking-widest"
              style={{
                borderColor: myAgentWon ? "rgba(251,191,36,0.4)" : `${ACCENT}66`,
                color:  myAgentWon ? "#fbbf24" : ACCENT_BRIGHT,
                background: myAgentWon ? "rgba(251,191,36,0.08)" : `${ACCENT}14`,
              }}
            >
              🤖 Robowar Duel
            </span>
          </div>
        </div>

        {/* Fighter cards */}
        <div className="grid grid-cols-2 gap-3 px-6 py-4">
          {/* Winner */}
          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "rgba(251,191,36,0.35)", background: "rgba(251,191,36,0.06)" }}
          >
            <div className="flex items-center gap-1.5 mb-3">
              <Crown className="h-3 w-3 text-yellow-400 shrink-0" />
              <span className="font-tech text-[9px] uppercase tracking-widest text-white/40">Winner</span>
            </div>
            <div className="font-display text-sm font-bold leading-tight truncate text-yellow-300">
              {result.winnerName}
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-1.5 font-mono text-[9px]">
                <Bot className="h-3 w-3 text-yellow-400/60 shrink-0" />
                <span className="text-white/30">HP Remaining</span>
                <span className="ml-auto font-bold text-yellow-400">
                  {result.winnerHp > 0 ? `${result.winnerHp}%` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Loser */}
          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
          >
            <div className="flex items-center gap-1.5 mb-3">
              <Shield className="h-3 w-3 text-white/20 shrink-0" />
              <span className="font-tech text-[9px] uppercase tracking-widest text-white/40">Destroyed</span>
            </div>
            <div className="font-display text-sm font-bold leading-tight truncate text-white/45">
              {result.loserName}
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-1.5 font-mono text-[9px]">
                <Bot className="h-3 w-3 text-white/20 shrink-0" />
                <span className="text-white/30">HP Remaining</span>
                <span className="ml-auto text-white/30">0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Commentary */}
        {commentary && (
          <div className="mx-6 mb-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare className="h-3 w-3 text-primary/60 shrink-0" />
              <span className="font-tech text-[9px] uppercase tracking-widest text-white/35">
                0G Compute · AI Commentator
              </span>
            </div>
            <p className="font-mono text-[10px] leading-relaxed text-white/60 italic">
              "{commentary}"
            </p>
            {storageHashes && storageHashes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {storageHashes.map((h) => (
                  <a
                    key={h}
                    href={`https://storagescan.0g.ai/tx/${h}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-white/6 bg-white/[0.03] px-2 py-0.5 font-mono text-[8px] text-white/25 hover:text-primary/60 transition"
                  >
                    <ExternalLink className="h-2 w-2 shrink-0" />
                    {h.slice(0, 8)}…{h.slice(-4)}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {!commentary && (
          <div className="mx-6 mb-3 flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin text-white/15 shrink-0" />
            <span className="font-tech text-[9px] text-white/20 uppercase tracking-widest">
              AI commentator generating…
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2.5 px-6 pb-7">
          <button
            type="button"
            onClick={onShareMoment}
            disabled={!onShareMoment}
            className={`flex w-full items-center justify-center gap-2.5 rounded-2xl border py-3.5 font-tech text-[11px] uppercase tracking-widest transition ${
              onShareMoment
                ? "border-[#9a35ff]/45 bg-[#9a35ff]/15 text-white hover:bg-[#9a35ff]/25 hover:border-[#9a35ff]/60"
                : "border-white/8 bg-white/[0.04] text-white/25 cursor-not-allowed"
            }`}
          >
            <Share2 className="h-4 w-4" />
            Share with Kult Moments
          </button>

          <button
            type="button"
            onClick={onHome}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/[0.06] py-3.5 font-tech text-[11px] uppercase tracking-widest text-white/65 hover:bg-white/10 hover:text-white hover:border-white/25 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Home Page
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function RobowarGamePage() {
  const { battleId }    = useParams<{ battleId: string }>();
  const [searchParams]  = useSearchParams();
  const navigate        = useNavigate();

  const myAgentId       = searchParams.get("myAgentId");
  const opponentIdParam = searchParams.get("opponentId");
  const mode            = searchParams.get("mode") ?? "RANKED";

  // ── State ─────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: uid(), kind: "system", text: "Arena lobby opened. Preparing the crush pit…", ts: new Date() },
  ]);
  const [chatInput, setChatInput]       = useState("");
  const [gamePhase, setGamePhase]       = useState<GamePhase>("live");
  const [observerCount]                 = useState(() => Math.floor(Math.random() * 80) + 12);
  const [battleResult, setBattleResult] = useState<RobowarDuelResult | null>(null);
  const [battleCommentary, setBattleCommentary] = useState<string | null>(null);
  const [memoryRootHashes, setMemoryRootHashes] = useState<string[]>([]);

  const prevStatusRef   = useRef<string | null>(null);
  const resultPostedRef = useRef(false);
  const chatEndRef      = useRef<HTMLDivElement>(null);

  // ── Queries ───────────────────────────────────────────────────────────────

  const battleQ = useQuery({
    queryKey: ["rwGame", "battle", battleId],
    queryFn:  () => aiArenaGatewayApi.getBattle(battleId!),
    enabled:  !!battleId,
    refetchInterval: (q) => {
      const s = q.state.data?.battle?.status;
      if (!s || s === "PENDING" || s === "INITIALIZING" || s === "IN_PROGRESS") return 2_000;
      return false;
    },
    staleTime: 500,
    retry: 2,
  });

  const myAgentQ = useQuery({
    queryKey: ["rwGame", "myAgent", myAgentId],
    queryFn:  () => aiArenaGatewayApi.getAgentById(myAgentId!),
    enabled:  !!myAgentId,
    staleTime: 60_000,
    retry: 1,
  });

  const battle = battleQ.data?.battle;
  const resolvedOpponentId =
    opponentIdParam ?? battle?.agentIds?.find((id) => id !== myAgentId) ?? null;

  const opponentQ = useQuery({
    queryKey: ["rwGame", "opponent", resolvedOpponentId],
    queryFn:  () => aiArenaGatewayApi.getAgentById(resolvedOpponentId!),
    enabled:  !!resolvedOpponentId,
    staleTime: 60_000,
    retry: 1,
  });

  const myAgent  = myAgentQ.data ?? null;
  const opponent = opponentQ.data ?? null;

  // ── Launcher state machine ────────────────────────────────────────────────

  const { phase: launcherPhase, errorMessage, launch, retry } = useLauncherBattle({
    battleId:     battleId ?? "",
    agentAId:     myAgentId ?? "",
    agentBId:     resolvedOpponentId ?? "",
    battleStatus: battle?.status,
    onComplete:   () => {
      // Phase transitions to "complete" — result handling picks up from the
      // status transition effect below.
    },
  });

  // ── Post-battle API calls (shared between launcher and any future Unity path)
  const triggerPostBattleApis = useCallback(
    async (
      duelResult: RobowarDuelResult,
      winnerAgent: AiArenaAgent | null,
      loserAgent: AiArenaAgent | null,
    ) => {
      const bid = duelResult.battleId;

      // 1. Trait evolution (fire-and-forget)
      void (async () => {
        try {
          if (duelResult.winnerId) {
            await aiArenaGatewayApi.evolveAgentTraits(duelResult.winnerId, {
              outcome: "WIN", jumps: 0, shotsAttempted: 0, shotsConnected: 0,
              timesHit: 0, distanceCovered: 0, durationSeconds: 0,
            });
          }
          if (duelResult.loserId) {
            await aiArenaGatewayApi.evolveAgentTraits(duelResult.loserId, {
              outcome: "LOSS", jumps: 0, shotsAttempted: 0, shotsConnected: 0,
              timesHit: 0, distanceCovered: 0, durationSeconds: 0,
            });
          }
        } catch (err) {
          console.warn("[RW] Trait evolution failed:", err);
        }
      })();

      // 2. Training trigger (fire-and-forget)
      void (async () => {
        try {
          if (duelResult.winnerId) {
            await aiArenaGatewayApi.triggerTrainingFromBattle(duelResult.winnerId, {
              jumps: 0, shotsAttempted: 0, shotsConnected: 0,
              timesHit: 0, distanceCovered: 0, outcome: "WIN", durationSeconds: 0,
            });
          }
          if (duelResult.loserId) {
            await aiArenaGatewayApi.triggerTrainingFromBattle(duelResult.loserId, {
              jumps: 0, shotsAttempted: 0, shotsConnected: 0,
              timesHit: 0, distanceCovered: 0, outcome: "LOSS", durationSeconds: 0,
            });
          }
        } catch (err) {
          console.warn("[RW] Training trigger failed:", err);
        }
      })();

      // 3. 0G Compute commentary
      let commentary = "";
      try {
        const res = await aiArenaGatewayApi.generateBattleCommentary({
          battleId:        bid,
          winnerName:      duelResult.winnerName,
          winnerArchetype: winnerAgent?.archetype ?? "",
          winnerClan:      winnerAgent?.clan      ?? "",
          winnerElo:       winnerAgent?.eloRating ?? 0,
          winnerHpPercent: duelResult.winnerHp,
          loserName:       duelResult.loserName,
          loserArchetype:  loserAgent?.archetype  ?? "",
          loserClan:       loserAgent?.clan       ?? "",
          loserElo:        loserAgent?.eloRating  ?? 0,
          loserHpPercent:  0,
          durationSeconds: 0,
          endReason:       "robowar-battle-end",
          gameName:        "Robowar",
        });
        commentary = res.commentary ?? "";
        if (commentary) {
          setBattleCommentary(commentary);
          console.log("[RW] ✅ 0G commentary:", commentary.slice(0, 60), "…");
        }
      } catch (err) {
        console.warn("[RW] Commentary generation failed:", err);
      }

      // 4. Store battle memory on 0G Storage
      const memContent = commentary ||
        `${duelResult.winnerName} won the Robowar duel; ${duelResult.loserName} was destroyed.`;
      const hashes: string[] = [];

      if (duelResult.winnerId) {
        try {
          const r = await aiArenaGatewayApi.storeBattleMemory(duelResult.winnerId, {
            battleId: bid, outcome: "WIN", content: memContent,
          });
          if (r.snapshotRootHash) hashes.push(r.snapshotRootHash);
        } catch (err) {
          console.warn("[RW] Winner memory storage failed:", err);
        }
      }
      if (duelResult.loserId) {
        try {
          const r = await aiArenaGatewayApi.storeBattleMemory(duelResult.loserId, {
            battleId: bid, outcome: "LOSS", content: memContent,
          });
          if (r.snapshotRootHash) hashes.push(r.snapshotRootHash);
        } catch (err) {
          console.warn("[RW] Loser memory storage failed:", err);
        }
      }
      if (hashes.length) setMemoryRootHashes(hashes);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Battle status transitions ─────────────────────────────────────────────
  useEffect(() => {
    const status = battle?.status ?? null;
    if (status === prevStatusRef.current) return;
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (!status) return;

    if ((status === "PENDING" || status === "INITIALIZING") && prev === null)
      addSystem("⏳  Battle created — waiting for the launcher…");
    if (status === "IN_PROGRESS" && prev !== "IN_PROGRESS")
      addSystem("🤖  Bots are LIVE! Battle has begun.");
    if (status === "COMPLETED" && battle?.result && !resultPostedRef.current) {
      resultPostedRef.current = true;
      setGamePhase("ended");
      addSystem("🏆  Battle concluded. Final results below.");
      addResult(battle.result, battle);

      // Build a RobowarDuelResult from the polling payload and show the overlay.
      // The launcher POSTs endBattle directly to the backend so we skip that call here.
      if (!battleResult) {
        const r = battle.result;
        const winnerAgent = r.winnerId === myAgentId ? myAgent : opponent;
        const loserAgent  = r.loserId  === myAgentId ? myAgent : opponent;
        const duelResult: RobowarDuelResult = {
          battleId:   battleId ?? "",
          winnerId:   r.winnerId ?? "",
          winnerName: winnerAgent?.name ?? r.winnerId ?? "",
          winnerHp:   0, // HP not stored in standard battle result; launcher can extend this
          loserId:    r.loserId  ?? "",
          loserName:  loserAgent?.name  ?? r.loserId  ?? "",
          loserHp:    0,
        };
        setBattleResult(duelResult);
        void triggerPostBattleApis(duelResult, winnerAgent, loserAgent);
      }
    }
    if (status === "CANCELLED") {
      setGamePhase("ended");
      addSystem("❌  Battle was cancelled.");
    }
    if (status === "DISPUTED") {
      setGamePhase("ended");
      addSystem("⚠️  Battle result is disputed — under review.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle?.status]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const addSystem = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: uid(), kind: "system" as const, text, ts: new Date() }]);
  }, []);

  const navigateToTrashTalkMoment = useCallback(() => {
    if (!battleId || !myAgentId) return;
    navigate(buildTrashTalkMomentPath(battleId, myAgentId, "robowar"));
  }, [battleId, myAgentId, navigate]);

  const addResult = useCallback(
    (result: AiArenaBattleResult, b: AiArenaBattle) => {
      setMessages((prev) => [
        ...prev,
        { id: uid(), kind: "result" as const, result, battle: b, myAgentId, myAgent, opponent, ts: new Date() },
      ]);
    },
    [myAgentId, myAgent, opponent]
  );

  // ── Derived ───────────────────────────────────────────────────────────────

  const isError           = battleQ.isError;
  const isBattleComplete  = Boolean((battle?.status === "COMPLETED" && battle?.result) || battleResult);
  const canShareMoment    = Boolean(battleId && myAgentId && isBattleComplete);
  const shareMomentHandler = canShareMoment ? navigateToTrashTalkMoment : undefined;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-[#030710] text-white md:h-dvh md:min-h-0 md:overflow-hidden">

      {/* Top Nav */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/8 bg-[#04080f]/95 px-2 py-2 backdrop-blur z-30 sm:gap-3 sm:px-5" data-tour="robowar-topbar">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1.5 font-tech text-[9px] uppercase tracking-widest text-white/45 hover:text-white hover:border-white/20 transition"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-white/25 hidden sm:block">BATTLE</span>
          <span className="font-mono text-[10px] text-white/50">{shortId(battleId)}</span>
          {gamePhase === "live" && (
            <span className="flex items-center gap-1 rounded-full border border-red-400/40 bg-red-500/15 px-2 py-0.5 font-tech text-[8px] uppercase tracking-wider text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
              LIVE
            </span>
          )}
          {gamePhase === "ended" && (
            <span className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-tech text-[8px] uppercase tracking-wider text-white/40">
              ENDED
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-tech text-[9px] uppercase tracking-widest text-white/30">{mode}</span>
          {canShareMoment && (
            <button
              type="button"
              onClick={navigateToTrashTalkMoment}
              className="flex items-center gap-1.5 rounded-lg border border-[#9a35ff]/40 bg-[#9a35ff]/12 px-2.5 py-1 font-tech text-[8px] uppercase tracking-wider text-[#d6acff] hover:bg-[#9a35ff]/22 transition"
            >
              <Share2 className="h-3 w-3" />
              Kult Moment
            </button>
          )}
          {battleQ.isFetching && <Loader2 className="h-3 w-3 animate-spin text-white/25" />}
        </div>
      </div>

      {/* Agent VS Banner */}
      <div data-tour="robowar-agents">
        <AgentBanner
          myAgent={myAgent}
          opponent={opponent}
          battle={battle}
          gamePhase={gamePhase}
          mode={mode}
        />
      </div>

      {/* Main: Launcher area + Chat */}
      <div className="flex min-h-0 flex-1 flex-col overflow-visible md:flex-row md:overflow-hidden">

        {/* Launcher canvas area */}
        <div
          className="relative h-[58dvh] min-h-[360px] shrink-0 bg-[#040810] overflow-hidden md:h-auto md:min-h-0 md:flex-1"
          data-tour="robowar-canvas"
        >

          {/* ── Battle API error ── */}
          {isError && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="font-tech text-sm text-red-400/80 mb-2">Failed to load battle</div>
                <button
                  onClick={() => battleQ.refetch()}
                  className="font-tech text-xs text-primary hover:text-primary/80 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* ── Launcher phases (shown when no battle API error) ── */}
          {!isError && (
            <>
              {/* Phase: idle — pre-match landing with Download + Launch */}
              {(launcherPhase === "idle" || launcherPhase === "launching") && (
                <LauncherPreMatchView
                  myAgent={myAgent}
                  opponent={opponent}
                  mode={mode}
                  onLaunch={launch}
                  isLaunching={launcherPhase === "launching"}
                />
              )}

              {/* Phase: not_installed — install prompt */}
              {launcherPhase === "not_installed" && (
                <>
                  {/* Keep pre-match visible as background */}
                  <LauncherPreMatchView
                    myAgent={myAgent}
                    opponent={opponent}
                    mode={mode}
                    onLaunch={launch}
                    isLaunching={false}
                  />
                  <LauncherNotInstalledModal onRetry={retry} />
                </>
              )}

              {/* Phase: waiting — animated progress stepper */}
              {launcherPhase === "waiting" && (
                <LauncherWaitingScreen
                  battleStatus={battle?.status}
                  battleId={battleId}
                />
              )}

              {/* Phase: complete — result overlay */}
              {(launcherPhase === "complete" || battleResult) && (
                <>
                  {/* Keep waiting screen as backdrop */}
                  <LauncherWaitingScreen
                    battleStatus={battle?.status}
                    battleId={battleId}
                  />
                  {battleResult && (
                    <BattleResultOverlay
                      result={battleResult}
                      myAgentId={myAgentId}
                      commentary={battleCommentary}
                      storageHashes={memoryRootHashes}
                      onHome={() => navigate(-1)}
                      onShareMoment={shareMomentHandler}
                    />
                  )}
                </>
              )}

              {/* Phase: error / timeout / cancelled */}
              {(launcherPhase === "error" ||
                launcherPhase === "timeout" ||
                launcherPhase === "cancelled") && (
                <>
                  <LauncherWaitingScreen
                    battleStatus={battle?.status}
                    battleId={battleId}
                  />
                  <LauncherErrorView
                    phase={launcherPhase}
                    errorMessage={errorMessage}
                    onRetry={retry}
                    onHome={() => navigate(-1)}
                  />
                </>
              )}

              {/* Status footer (shown while waiting, fades once complete) */}
              {launcherPhase === "waiting" && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
                  <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-black/50 px-3 py-1 backdrop-blur">
                    <Zap className="h-2.5 w-2.5 text-primary/60" />
                    <span className="font-mono text-[8px] text-white/25">
                      {`robowar · ${shortId(battleId)} · ${battle?.status ?? "—"}`}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Chat panel */}
        <div data-tour="robowar-chat">
          <GameChatPanel
            messages={messages}
            chatInput={chatInput}
            onInputChange={setChatInput}
            onSend={() => {
              if (!chatInput.trim()) return;
              setMessages((prev) => [
                ...prev,
                {
                  id: uid(),
                  kind: "player" as const,
                  agentId:   myAgentId ?? "observer",
                  agentName: myAgent?.name ?? "Observer",
                  color:     myAgent ? clanColor(myAgent.clan) : "#8b6dff",
                  text:      chatInput.trim(),
                  ts:        new Date(),
                },
              ]);
              setChatInput("");
            }}
            chatEndRef={chatEndRef}
            myAgent={myAgent}
            observerCount={observerCount}
            onShareMoment={shareMomentHandler}
          />
        </div>
      </div>
    </div>
  );
}
