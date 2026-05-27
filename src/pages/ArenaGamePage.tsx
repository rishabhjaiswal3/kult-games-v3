/**
 * ArenaGamePage — Full-screen AI Arena battle experience.
 *
 * Unity WebGL is loaded *directly* in this React component (ZeroDash pattern):
 *   • Dynamic <script> injection of WarzoneV4.loader.js from R2
 *   • window.createUnityInstance() called with R2 absolute file URLs
 *   • React loading screen (agent cards, rain, progress bar) shown while Unity loads
 *   • battleId sent via SendMessage('GameManager','SetBattleId', battleId) after load
 *   • unityInstance.Quit() called on unmount
 *
 * Set VITE_UNITY_BUILD_URL to the R2 base path (no trailing slash, no /index.html):
 *   e.g. https://pub-xxxx.r2.dev/v4/WarzoneV4
 */

import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { getRankFromElo } from "@/utils/rankSystem";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import { getArenaAgentPortrait } from "@/constants/arenaAgentArchetypes";
import type {
  AiArenaAgent,
  AiArenaBattle,
  AiArenaBattleResult,
} from "@/types/aiArenaGateway";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

/** Base R2 path — no trailing slash, no /index.html.
 *  e.g. https://pub-2c48e58780b648b7a2a77316f7b0aa2c.r2.dev/v4/WarzoneV4 */
const UNITY_BASE_URL: string = import.meta.env.VITE_UNITY_BUILD_URL ?? "";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type GamePhase = "live" | "ended";

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
  if (c === "ZEROG") return "#00e68a";
  if (c === "BASE") return "#0052ff";
  if (c === "SOLANA") return "#9945ff";
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
// Loading screen sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Portrait + stats card shown in the Unity loading overlay */
function AgentLoadingCard({
  agent,
  side,
}: {
  agent: AiArenaAgent | null;
  side: "left" | "right";
}) {
  const portrait = agent ? getArenaAgentPortrait(agent) : null;
  const isVideo = portrait?.endsWith(".mp4");
  const color = agent ? clanColor(agent.clan) : "#8b6dff";

  return (
    <div className="flex flex-col items-center gap-3" style={{ width: 180 }}>
      {/* Portrait frame */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/20"
        style={{
          width: 180,
          height: 220,
          boxShadow: `0 0 48px ${color}55, 0 12px 40px rgba(0,0,0,0.7)`,
        }}
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

        {/* Bottom name overlay */}
        <div
          className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-10"
          style={{ background: `linear-gradient(to top, ${color}cc 0%, ${color}40 60%, transparent 100%)` }}
        >
          <div className="font-display text-base font-black leading-tight text-white drop-shadow-lg truncate">
            {agent?.name ?? "???"}
          </div>
          <div className="font-tech text-[9px] uppercase tracking-widest text-white/70 mt-0.5">
            {agent?.archetype ?? "—"}
          </div>
        </div>
      </div>

      {/* Stats panel — glassmorphism */}
      <div
        className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-center"
        style={{ background: "rgba(10,10,20,0.65)", backdropFilter: "blur(12px)" }}
      >
        <div className="font-tech text-lg font-bold" style={{ color }}>
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

/** Full-screen Unity loading overlay — video background, agent cards, progress bar */
function UnityLoadingScreen({
  progress,
  myAgent,
  opponent,
  mode,
}: {
  progress: number;
  myAgent: AiArenaAgent | null;
  opponent: AiArenaAgent | null;
  mode: string;
}) {
  const myColor = myAgent ? clanColor(myAgent.clan) : "#8b6dff";
  const oppColor = opponent ? clanColor(opponent.clan) : "#06b6d4";

  return (
    <div className="absolute inset-0 z-20 overflow-hidden">
      {/* ── Background video ── */}
      <video
        src="/videos/SC_2-3.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0.55 }}
      />

      {/* ── Dark + blur overlay (sits between video and cards) ── */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(3,7,16,0.55) 0%, rgba(3,7,16,0.45) 50%, rgba(3,7,16,0.75) 100%)", backdropFilter: "blur(2px)" }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 px-6">

        {/* Title */}
        <div className="text-center">
          <div className="font-display text-[10px] uppercase tracking-[0.35em] text-white/40 mb-1.5">
            ⚡ &nbsp;AI Battle&nbsp; ⚡
          </div>
          <div className="font-display text-4xl font-black tracking-[0.1em] text-gradient drop-shadow-[0_0_24px_rgba(139,92,246,0.8)]">
            AI ARENA
          </div>
        </div>

        {/* Agent cards + VS */}
        <div className="flex items-center gap-10 sm:gap-16">

          {/* My agent */}
          <AgentLoadingCard agent={myAgent} side="left" />

          {/* VS center — single column, perfectly centred */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/60"
              style={{
                background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.05) 100%)",
                boxShadow: "0 0 28px rgba(139,92,246,0.5), inset 0 0 16px rgba(139,92,246,0.1)",
              }}
            >
              <Swords className="h-7 w-7 text-primary" />
            </div>
            <span className="font-display text-3xl font-black text-gradient leading-none">VS</span>
            <span className="font-tech text-[9px] uppercase tracking-widest text-white/35 mt-0.5">
              {mode}
            </span>
          </div>

          {/* Opponent */}
          <AgentLoadingCard agent={opponent} side="right" />
        </div>

        {/* Progress bar */}
        <div className="w-[420px] max-w-[90vw]">
          <div className="flex justify-between font-tech text-[10px] text-white/40 mb-2 uppercase tracking-wider">
            <span>{progress < 100 ? "Loading Arena…" : "Launching…"}</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${myColor}, #8b5cf6 50%, ${oppColor})`,
                boxShadow: progress > 0 ? "0 0 14px rgba(139,92,246,0.8)" : "none",
              }}
            />
          </div>
          <p className="text-center font-mono text-[9px] text-white/25 mt-2">
            {progress === 0
              ? "Connecting to 0G network…"
              : `Loading game assets — ${progress}%`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Existing sub-components (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

/** Single agent card inside the top banner */
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
  const color = agent ? clanColor(agent.clan) : "#8b6dff";
  const isRight = side === "right";

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
        <div
          className="absolute -inset-1.5 rounded-xl blur-md opacity-50"
          style={{ background: `${color}40` }}
        />
        <ArenaAgentThumbnail
          agent={agent}
          className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl border-white/15"
        />
        {isWinner && (
          <Crown
            className="absolute -top-2 -right-2 h-4 w-4 drop-shadow-lg"
            style={{ color: "#fbbf24" }}
          />
        )}
      </div>

      <div className={`min-w-0 ${isRight ? "text-right" : "text-left"}`}>
        <div className="font-display text-base sm:text-lg font-bold leading-tight truncate max-w-[120px] sm:max-w-[160px]">
          {agent.name}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-white/45 mt-0.5">
          {agent.archetype}
        </div>
        <div
          className="flex items-center gap-2 mt-1.5"
          style={{ justifyContent: isRight ? "flex-end" : "flex-start" }}
        >
          <span
            className="font-tech text-sm font-bold"
            style={{ color }}
          >
            {agent.eloRating.toLocaleString()}
          </span>
          <span className="text-[9px] text-white/30 font-tech">ELO</span>
          {rankInfo && (
            <img
              src={rankInfo.image}
              alt={rankInfo.name}
              title={rankInfo.name}
              className="h-5 w-5 object-contain"
            />
          )}
        </div>
        <div
          className="flex items-center gap-2 mt-0.5"
          style={{ justifyContent: isRight ? "flex-end" : "flex-start" }}
        >
          <span className="text-[9px] text-white/30 font-tech">{agent.wins}W</span>
          <span className="text-[9px] text-white/20">·</span>
          <span className="text-[9px] text-white/30 font-tech">{agent.losses}L</span>
        </div>
      </div>
    </>
  );

  return (
    <div
      className={`flex flex-1 items-center gap-2 sm:gap-3 px-2 sm:px-4 transition-all duration-500 ${
        isLoser ? "opacity-40 grayscale" : ""
      } ${isRight ? "flex-row-reverse" : ""}`}
    >
      {inner}
    </div>
  );
}

/** Top banner: both agents + VS center */
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
  const myId = myAgent?.id;
  const myWon = result?.winnerId === myId;
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
            "linear-gradient(rgba(139,92,246,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.5) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#8b5cf620] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#06b6d420] to-transparent" />

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
          <span className="font-display text-base sm:text-xl font-black mt-1 text-gradient">
            VS
          </span>
          <span className="font-tech text-[8px] uppercase tracking-widest text-white/30 mt-0.5">
            {mode}
          </span>
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

/** Result card shown in the chat panel after battle ends */
function ResultCard({
  result,
  battle,
  myAgentId,
  myAgent,
  opponent,
}: {
  result: AiArenaBattleResult;
  battle: AiArenaBattle;
  myAgentId: string | null;
  myAgent: AiArenaAgent | null;
  opponent: AiArenaAgent | null;
}) {
  const winner =
    result.winnerId === myAgent?.id
      ? myAgent
      : result.winnerId === opponent?.id
      ? opponent
      : null;
  const loser =
    result.loserId === myAgent?.id
      ? myAgent
      : result.loserId === opponent?.id
      ? opponent
      : null;
  const iWon = result.winnerId === myAgentId;

  const zgLink = battle.id
    ? `https://storagescan.0g.ai/tx/${battle.id}`
    : null;

  const winnerColor = winner ? clanColor(winner.clan) : "#fbbf24";
  const loserColor = loser ? clanColor(loser.clan) : "#6b7280";

  return (
    <div className="mx-2 my-1 overflow-hidden rounded-xl border border-white/10 bg-[#0d1020] shadow-[0_0_32px_rgba(0,0,0,0.6)]">
      <div
        className="flex items-center gap-2 px-3 py-2.5"
        style={{
          background: `linear-gradient(135deg, ${winnerColor}18, transparent)`,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Trophy
          className="h-3.5 w-3.5 shrink-0"
          style={{ color: winnerColor }}
        />
        <span
          className="font-tech text-[10px] uppercase tracking-widest font-bold"
          style={{ color: winnerColor }}
        >
          {iWon ? "VICTORY" : "DEFEAT"}
        </span>
        <span className="ml-auto font-mono text-[9px] text-white/25">
          {shortId(battle.id)}
        </span>
      </div>

      <div className="px-3 py-3 space-y-2">
        {winner && (
          <div className="flex items-center gap-2">
            <Crown className="h-3 w-3 shrink-0 text-yellow-400" />
            <span className="font-tech text-[10px] text-white/40 uppercase">
              Winner
            </span>
            <span
              className="font-tech text-[11px] font-bold ml-auto truncate max-w-[100px]"
              style={{ color: winnerColor }}
            >
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
            <span className="font-tech text-[10px] text-white/40 uppercase">
              Loser
            </span>
            <span
              className="font-tech text-[11px] font-bold ml-auto truncate max-w-[100px]"
              style={{ color: loserColor }}
            >
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
              <div className="font-display text-sm font-bold text-white/80">
                {result.rounds}
              </div>
              <div className="font-tech text-[8px] uppercase text-white/30">
                Rounds
              </div>
            </div>
          )}
          {Array.isArray(result.log) && (
            <div className="text-center">
              <div className="font-display text-sm font-bold text-white/80">
                {result.log.length}
              </div>
              <div className="font-tech text-[8px] uppercase text-white/30">
                Actions
              </div>
            </div>
          )}
          <div className="text-center">
            <div className="font-display text-sm font-bold text-white/80">
              {battle.status}
            </div>
            <div className="font-tech text-[8px] uppercase text-white/30">
              Status
            </div>
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
          <span className="text-[9px] font-mono text-white/20">
            Stored on 0G
          </span>
        )}
        <button
          type="button"
          disabled
          title="Coming soon — Share in Kult Moments"
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-tech uppercase tracking-wider text-white/30 cursor-not-allowed"
        >
          <Share2 className="h-2.5 w-2.5" />
          Kult Moment
        </button>
      </div>
    </div>
  );
}

/** Individual chat message row */
function ChatBubble({ msg }: { msg: ChatMsg }) {
  const time = msg.ts.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (msg.kind === "result") {
    return (
      <div className="py-1">
        <ResultCard
          result={msg.result}
          battle={msg.battle}
          myAgentId={msg.myAgentId}
          myAgent={msg.myAgent}
          opponent={msg.opponent}
        />
      </div>
    );
  }

  if (msg.kind === "system") {
    return (
      <div className="px-3 py-1">
        <span className="text-[10px] text-white/30 italic font-mono">
          {msg.text}
        </span>
      </div>
    );
  }

  return (
    <div className="px-3 py-1 hover:bg-white/[0.025] transition">
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span
          className="font-tech text-[10px] font-bold shrink-0"
          style={{ color: msg.color }}
        >
          {msg.agentName}
        </span>
        <span className="font-mono text-[8px] text-white/20 shrink-0">
          {time}
        </span>
      </div>
      <p className="text-[11px] text-white/75 leading-snug mt-0.5 break-words">
        {msg.text}
      </p>
    </div>
  );
}

/** Right-side live chat panel */
function GameChatPanel({
  messages,
  chatInput,
  onInputChange,
  onSend,
  chatEndRef,
  myAgent,
  observerCount,
}: {
  messages: ChatMsg[];
  chatInput: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
  myAgent: AiArenaAgent | null;
  observerCount: number;
}) {
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex w-[280px] sm:w-[300px] lg:w-[320px] shrink-0 flex-col border-l border-white/8 bg-[#04080f]/90">
      <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2.5">
        <MessageSquare className="h-3.5 w-3.5 text-primary/70" />
        <span className="font-tech text-[10px] uppercase tracking-widest text-white/60 font-bold">
          LIVE CHAT
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-[9px] text-white/30">
            {observerCount} watching
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
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
            placeholder={
              myAgent ? `Chat as ${myAgent.name}…` : "Send a message…"
            }
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
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ArenaGamePage() {
  const { battleId } = useParams<{ battleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const myAgentId = searchParams.get("myAgentId");
  const opponentIdParam = searchParams.get("opponentId");
  const mode = searchParams.get("mode") ?? "RANKED";

  // ── State ────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: uid(),
      kind: "system",
      text: "Arena lobby opened. Loading battle…",
      ts: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [gamePhase, setGamePhase] = useState<GamePhase>("live");
  const [observerCount] = useState(() => Math.floor(Math.random() * 80) + 12);

  // Unity loading state
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [unityLoaded, setUnityLoaded] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unityInstanceRef = useRef<any>(null);
  const unityLoadingRef = useRef(false); // guard against double-load
  const prevStatusRef = useRef<string | null>(null);
  const resultPostedRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Queries ──────────────────────────────────────────────────────────────

  const battleQ = useQuery({
    queryKey: ["arenaGame", "battle", battleId],
    queryFn: () => aiArenaGatewayApi.getBattle(battleId!),
    enabled: !!battleId,
    refetchInterval: (q) => {
      const s = q.state.data?.battle?.status;
      if (!s || s === "PENDING" || s === "INITIALIZING" || s === "IN_PROGRESS")
        return 2_000;
      return false;
    },
    staleTime: 500,
    retry: 2,
  });

  const myAgentQ = useQuery({
    queryKey: ["arenaGame", "myAgent", myAgentId],
    queryFn: () => aiArenaGatewayApi.getAgentById(myAgentId!),
    enabled: !!myAgentId,
    staleTime: 60_000,
    retry: 1,
  });

  const battle = battleQ.data?.battle;

  const resolvedOpponentId =
    opponentIdParam ?? battle?.agentIds?.find((id) => id !== myAgentId) ?? null;

  const opponentQ = useQuery({
    queryKey: ["arenaGame", "opponent", resolvedOpponentId],
    queryFn: () => aiArenaGatewayApi.getAgentById(resolvedOpponentId!),
    enabled: !!resolvedOpponentId,
    staleTime: 60_000,
    retry: 1,
  });

  const myAgent = myAgentQ.data ?? null;
  const opponent = opponentQ.data ?? null;

  // ── Unity loading ─────────────────────────────────────────────────────────

  const loadUnity = useCallback(async () => {
    if (unityLoadingRef.current || !canvasRef.current || !UNITY_BASE_URL) return;
    unityLoadingRef.current = true;

    const buildUrl = `${UNITY_BASE_URL}/Build`;

    const script = document.createElement("script");
    script.src = `${buildUrl}/WarzoneV4.loader.js`;

    script.onload = async () => {
      try {
        const instance = await (window as any).createUnityInstance(
          canvasRef.current!,
          {
            dataUrl: `${buildUrl}/WarzoneV4.data`,
            frameworkUrl: `${buildUrl}/WarzoneV4.framework.js`,
            codeUrl: `${buildUrl}/WarzoneV4.wasm`,
            streamingAssetsUrl: "StreamingAssets",
            companyName: "Kult Games",
            productName: "WarzoneV4",
            productVersion: "1.0",
          },
          (progress: number) => {
            setLoadingProgress(Math.round(progress * 100));
          }
        );

        unityInstanceRef.current = instance;

        // Send battleId to Unity game manager
        if (battleId) {
          try {
            instance.SendMessage("GameManager", "SetBattleId", battleId);
          } catch (err) {
            console.warn("[Arena] SendMessage SetBattleId failed:", err);
          }
        }

        setUnityLoaded(true);
      } catch (err) {
        console.error("[Arena] createUnityInstance failed:", err);
        toast.error("Failed to load game. Please refresh and try again.");
        unityLoadingRef.current = false; // allow retry
      }
    };

    script.onerror = () => {
      console.error("[Arena] Failed to load Unity loader script from:", script.src);
      toast.error("Game assets unavailable. Check your connection.");
      unityLoadingRef.current = false;
    };

    document.body.appendChild(script);
  }, [battleId]);

  // Load Unity once battleId is available and canvas is mounted
  useEffect(() => {
    if (!battleId || !UNITY_BASE_URL) return;
    loadUnity();
  }, [battleId, loadUnity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unityInstanceRef.current) {
        unityInstanceRef.current.Quit?.().catch(() => {});
        unityInstanceRef.current = null;
      }
    };
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const addSystem = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: uid(), kind: "system" as const, text, ts: new Date() },
    ]);
  }, []);

  const addResult = useCallback(
    (result: AiArenaBattleResult, b: AiArenaBattle) => {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          kind: "result" as const,
          result,
          battle: b,
          myAgentId,
          myAgent,
          opponent,
          ts: new Date(),
        },
      ]);
    },
    [myAgentId, myAgent, opponent]
  );

  // ── Battle status transitions ─────────────────────────────────────────────

  useEffect(() => {
    const status = battle?.status ?? null;
    if (status === prevStatusRef.current) return;
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (!status) return;

    if ((status === "PENDING" || status === "INITIALIZING") && prev === null) {
      addSystem("⏳  Battle created — arena loading…");
    }

    if (status === "IN_PROGRESS" && prev !== "IN_PROGRESS") {
      addSystem("⚔️  Battle is LIVE! Agents are fighting.");
    }

    if (status === "COMPLETED" && battle?.result && !resultPostedRef.current) {
      resultPostedRef.current = true;
      setGamePhase("ended");
      addSystem("🏁  Battle concluded. Final results below.");
      addResult(battle.result, battle);
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

  // ── Auto-scroll chat ──────────────────────────────────────────────────────

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const isError = battleQ.isError;
  const isLoading = battleQ.isLoading && !battle;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-[#030710] text-white overflow-hidden">

      {/* ── Top Nav ───────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/8 bg-[#04080f]/95 px-3 sm:px-5 py-2 backdrop-blur z-30">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1.5 font-tech text-[9px] uppercase tracking-widest text-white/45 hover:text-white hover:border-white/20 transition"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-white/25 hidden sm:block">
            BATTLE
          </span>
          <span className="font-mono text-[10px] text-white/50">
            {shortId(battleId)}
          </span>

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
          <span className="font-tech text-[9px] uppercase tracking-widest text-white/30">
            {mode}
          </span>
          {battleQ.isFetching && (
            <Loader2 className="h-3 w-3 animate-spin text-white/25" />
          )}
        </div>
      </div>

      {/* ── Agent VS Banner ───────────────────────────────────────────────── */}
      <AgentBanner
        myAgent={myAgent}
        opponent={opponent}
        battle={battle}
        gamePhase={gamePhase}
        mode={mode}
      />

      {/* ── Main: Canvas + Chat ───────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Canvas area */}
        <div className="relative min-h-0 flex-1 bg-[#040810] overflow-hidden">

          {/* Error state — centred */}
          {isError && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="font-tech text-sm text-red-400/80 mb-2">
                  Failed to load battle
                </div>
                <button
                  onClick={() => battleQ.refetch()}
                  className="font-tech text-xs text-primary hover:text-primary/80 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* No build URL configured — centred */}
          {!isError && !UNITY_BASE_URL && (
            <div className="flex h-full items-center justify-center px-4">
              <div className="text-center">
                <p className="font-tech text-xs text-white/40 uppercase tracking-wider">
                  Unity Build URL not configured
                </p>
                <p className="font-mono text-[9px] text-white/20 mt-1">
                  Set VITE_UNITY_BUILD_URL in .env to load the game
                </p>
                {myAgent && opponent && (
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <span className="font-tech text-[10px] font-bold" style={{ color: clanColor(myAgent.clan) }}>
                      {myAgent.name}
                    </span>
                    <Swords className="h-3 w-3 text-white/20" />
                    <span className="font-tech text-[10px] font-bold" style={{ color: clanColor(opponent.clan) }}>
                      {opponent.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Unity canvas — fills entire game area ── */}
          {!isError && UNITY_BASE_URL && (
            <div className="absolute inset-0">
              {/* Unity renders directly into this canvas; CSS fills the space,
                  width/height attrs set the render resolution */}
              <canvas
                ref={canvasRef}
                id="unity-canvas"
                width={1280}
                height={720}
                style={{ width: "100%", height: "100%", display: "block", background: "#030710" }}
              />

              {/* React loading screen (shown until Unity finishes loading) */}
              {!unityLoaded && (
                <UnityLoadingScreen
                  progress={loadingProgress}
                  myAgent={myAgent}
                  opponent={opponent}
                  mode={mode}
                />
              )}

              {/* GAME OVER overlay */}
              {gamePhase === "ended" && unityLoaded && (
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center pointer-events-none">
                  <span className="font-display text-3xl font-black text-white/20 uppercase tracking-widest">
                    GAME OVER
                  </span>
                </div>
              )}

              {/* Bottom battle-ID hint */}
              {gamePhase === "live" && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
                  <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-black/50 px-3 py-1 backdrop-blur">
                    <Zap className="h-2.5 w-2.5 text-primary/60" />
                    <span className="font-mono text-[8px] text-white/25">
                      {unityLoaded ? `battle · ${shortId(battleId)}` : `loading · ${loadingProgress}%`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat panel */}
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
                agentId: myAgentId ?? "observer",
                agentName: myAgent?.name ?? "Observer",
                color: myAgent ? clanColor(myAgent.clan) : "#8b6dff",
                text: chatInput.trim(),
                ts: new Date(),
              },
            ]);
            setChatInput("");
          }}
          chatEndRef={chatEndRef}
          myAgent={myAgent}
          observerCount={observerCount}
        />
      </div>
    </div>
  );
}
