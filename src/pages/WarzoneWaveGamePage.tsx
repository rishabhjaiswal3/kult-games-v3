/**
 * WarzoneWaveGamePage — Full-screen Warzone Wave co-op battle experience.
 *
 * Same Unity build as Warzone Warriors (same VITE_UNITY_BUILD_URL).
 * React writes mode:"WAVECOOP" in arenaBattlePayload so Unity activates
 * WaveCoopModeController (2 AI fighters vs enemy waves, 60 s, most coins wins).
 *
 * React listens for "waveCoopBattleEnd" CustomEvent (fired by Unity's
 * DispatchWaveCoopEndEvent jslib function) instead of "arenaBattleEnd".
 *
 * Payload shape from Unity:
 *   { battleId, myAgentWon, winnerAgentId, winnerName, winnerCoins,
 *     loserAgentId, loserName, loserCoins, durationSeconds, endReason }
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
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { saveTrackedAiArenaBattleId } from "@/lib/arenaBattleStorage";
import { buildTrashTalkMomentPath } from "@/lib/battleTrashTalkMoment";
import { getRankFromElo } from "@/utils/rankSystem";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import { ArenaLandscapeGate } from "@/components/arena/ArenaLandscapeGate";
import { BattleLoadErrorState } from "@/components/arena/BattleLoadErrorState";
import { battleLiveRefetchInterval, isBattleNotFoundError } from "@/lib/aiArenaBattleErrors";
import { getArenaAgentPortrait } from "@/constants/arenaAgentArchetypes";
import type {
  AiArenaAgent,
  AiArenaBattle,
  AiArenaBattleResult,
} from "@/types/aiArenaGateway";

// ─────────────────────────────────────────────────────────────────────────────
// Config — same build URL as Warzone Warriors
// ─────────────────────────────────────────────────────────────────────────────

const UNITY_BASE_URL: string = import.meta.env.VITE_UNITY_BUILD_URL ?? "";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type GamePhase = "live" | "ended";

/** Shape of the CustomEvent fired by Unity when the wave co-op match ends. */
type WaveCoopResult = {
  battleId: string;
  myAgentWon: boolean;
  winnerAgentId: string;
  winnerName: string;
  winnerCoins: number;
  loserAgentId: string;
  loserName: string;
  loserCoins: number;
  durationSeconds: number;
  endReason: string;
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
  if (c === "ZEROG") return "#00e68a";
  if (c === "BASE") return "#0052ff";
  if (c === "SOLANA") return "#9945ff";
  if (c === "OKX") return "#e0a528";
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
    <div className="flex w-[132px] flex-col items-center gap-2 sm:w-[180px] sm:gap-3 arena-loading-card-wrap">
      <div
        className="arena-loading-card-frame relative h-[165px] w-[132px] overflow-hidden rounded-2xl border border-white/20 sm:h-[220px] sm:w-[180px]"
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
        className="arena-loading-card-stats w-full rounded-xl border border-white/10 px-2.5 py-2 text-center sm:px-4 sm:py-2.5"
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
// Pre-match overlay
// ─────────────────────────────────────────────────────────────────────────────

const MAP_META: Record<string, { bg: string; name: string; accentColor: string }> = {
  "1": { bg: "/Warzone/Desert_Storm.webp",      name: "Desert Storm",      accentColor: "#f59e0b" },
  "2": { bg: "/Warzone/Research_Facility.webp", name: "Research Facility", accentColor: "#06b6d4" },
  "3": { bg: "/Warzone/Mystical_Forest.webp",   name: "Mystical Forest",   accentColor: "#10b981" },
};

function PreMatchOverlay({
  mapId,
  myAgentName,
  opponentName,
  countdown,
}: {
  mapId: string;
  myAgentName: string;
  opponentName: string;
  countdown: number;
}) {
  const meta     = MAP_META[mapId] ?? MAP_META["1"];
  const maxSecs  = mapId === "1" ? 10 : mapId === "2" ? 15 : 17;
  const pct      = Math.max(0, (countdown / maxSecs) * 100);

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col overflow-hidden"
      style={{ background: "#05080f" }}
    >
      <img
        src={meta.bg}
        alt={meta.name}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0.9 }}
        draggable={false}
      />
      <div className="absolute inset-0" style={{ background: "rgba(5,8,15,0.72)" }} />

      <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden">
        <div
          className="arena-prematch-header flex shrink-0 items-center justify-between px-6 py-3"
          style={{ background: "rgba(5,8,15,0.85)", borderBottom: `2px solid ${meta.accentColor}` }}
        >
          <div className="arena-prematch-header-side flex items-center gap-3 min-w-0">
            <span
              className="font-tech text-[10px] uppercase tracking-[0.35em] font-bold truncate"
              style={{ color: meta.accentColor }}
            >
              ⚡ Warzone Wave · Co-op
            </span>
          </div>
          <div className="arena-prematch-map-title font-display text-base font-black text-white tracking-widest uppercase truncate px-2">
            {meta.name}
          </div>
          <div
            className="arena-prematch-header-side font-tech text-[10px] uppercase tracking-widest font-bold truncate text-right"
            style={{ color: meta.accentColor }}
          >
            Match Starting
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-stretch overflow-hidden">
          <div
            className="flex flex-col items-center justify-end gap-0 flex-1"
            style={{ background: `linear-gradient(to right, rgba(5,8,15,0.7) 0%, transparent 100%)` }}
          >
            <div className="mb-1 px-2 text-center sm:mb-2 sm:px-4">
              <div className="arena-prematch-agent-name mx-auto font-display text-2xl font-black uppercase tracking-wide text-white drop-shadow-lg sm:text-2xl">
                {myAgentName || "Agent A"}
              </div>
              <div className="arena-prematch-agent-meta mt-1 flex items-center justify-center gap-2 sm:mt-1.5">
                <img src="/Warzone/Uzi.webp" alt="Uzi" className="h-6 object-contain drop-shadow-lg" draggable={false} />
                <span className="font-tech text-xs text-white font-bold uppercase tracking-widest">Uzi</span>
              </div>
            </div>
            <img
              src="/Warzone/Character1-A.webp"
              alt="Fighter A"
              className="arena-prematch-character object-contain object-bottom drop-shadow-2xl"
              style={{ maxHeight: "55%", width: "auto" }}
              draggable={false}
            />
          </div>

          <div className="arena-prematch-center flex shrink-0 flex-col items-center justify-center gap-3 px-4">
            <div
              className="arena-prematch-vs font-display text-5xl font-black"
              style={{
                color: "#fff",
                textShadow: `0 0 40px ${meta.accentColor}, 0 0 80px ${meta.accentColor}80`,
                WebkitTextStroke: `2px ${meta.accentColor}`,
              }}
            >
              CO-OP
            </div>
            <div
              className="arena-prematch-countdown flex h-16 w-16 items-center justify-center rounded-full font-display text-3xl font-black"
              style={{
                border: `3px solid ${meta.accentColor}`,
                color: meta.accentColor,
                background: "rgba(5,8,15,0.9)",
                boxShadow: `0 0 30px ${meta.accentColor}80, inset 0 0 20px ${meta.accentColor}20`,
              }}
            >
              {countdown}
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-end gap-0 flex-1"
            style={{ background: `linear-gradient(to left, rgba(5,8,15,0.7) 0%, transparent 100%)` }}
          >
            <div className="mb-1 px-2 text-center sm:mb-2 sm:px-4">
              <div className="arena-prematch-agent-name mx-auto font-display text-2xl font-black uppercase tracking-wide text-white drop-shadow-lg sm:text-2xl">
                {opponentName || "Agent B"}
              </div>
              <div className="arena-prematch-agent-meta mt-1 flex items-center justify-center gap-2 sm:mt-1.5">
                <img src="/Warzone/Uzi.webp" alt="Uzi" className="h-6 object-contain drop-shadow-lg" draggable={false} />
                <span className="font-tech text-xs text-white font-bold uppercase tracking-widest">Uzi</span>
              </div>
            </div>
            <img
              src="/Warzone/Character1-B.webp"
              alt="Fighter B"
              className="arena-prematch-character object-contain object-bottom drop-shadow-2xl"
              style={{ maxHeight: "55%", width: "auto" }}
              draggable={false}
            />
          </div>
        </div>

        <div
          className="arena-prematch-footer flex shrink-0 flex-col items-center gap-2 px-6 py-4"
          style={{ background: "rgba(5,8,15,0.9)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="arena-prematch-footer-rules font-mono text-xs text-center text-white leading-relaxed max-w-lg">
            ⏱ <span className="text-white font-bold">60 second</span> co-op match ·
            Both agents fight enemy waves together ·
            The agent that{" "}
            <span className="font-bold" style={{ color: meta.accentColor }}>collects the most coins</span>{" "}
            wins · Winner earns <span className="text-white font-bold">ARENA rewards</span>
          </p>

          <div className="w-full max-w-sm">
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-full rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${pct}%`, background: `linear-gradient(to right, ${meta.accentColor}, #8b6dff)` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full animate-pulse"
              style={{ background: meta.accentColor }}
            />
            <span className="font-tech text-[10px] uppercase tracking-[0.35em] text-white font-bold">
              Syncing with 0G Network...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <video
        src="/videos/SC_2-3.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0.55 }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(3,7,16,0.55) 0%, rgba(3,7,16,0.45) 50%, rgba(3,7,16,0.75) 100%)", backdropFilter: "blur(2px)" }}
      />

      <div className="arena-loading-root relative z-10 flex h-full min-h-0 flex-col items-center justify-center gap-5 overflow-y-auto overscroll-contain px-3 sm:gap-8 sm:px-6">
        <div className="arena-loading-title-block text-center">
          <div className="font-display text-[10px] uppercase tracking-[0.35em] text-white/40 mb-1.5">
            ⚡ &nbsp;Co-op Battle&nbsp; ⚡
          </div>
          <div className="font-display text-3xl font-black tracking-[0.1em] text-gradient drop-shadow-[0_0_24px_rgba(139,92,246,0.8)] sm:text-4xl">
            WARZONE WAVE
          </div>
        </div>

        <div className="arena-loading-cards-row flex w-full items-center justify-center gap-3 sm:gap-16">
          <AgentLoadingCard agent={myAgent} side="left" />

          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              className="arena-loading-vs-ring flex h-12 w-12 items-center justify-center rounded-full border border-primary/60 sm:h-16 sm:w-16"
              style={{
                background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.05) 100%)",
                boxShadow: "0 0 28px rgba(139,92,246,0.5), inset 0 0 16px rgba(139,92,246,0.1)",
              }}
            >
              <Swords className="h-5 w-5 text-primary sm:h-7 sm:w-7" />
            </div>
            <span className="arena-loading-vs-text font-display text-2xl font-black leading-none text-gradient sm:text-3xl">CO-OP</span>
            <span className="font-tech text-[9px] uppercase tracking-widest text-white/35 mt-0.5">
              {mode}
            </span>
          </div>

          <AgentLoadingCard agent={opponent} side="right" />
        </div>

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
// Agent card sub-components (identical to ArenaGamePage)
// ─────────────────────────────────────────────────────────────────────────────

function AgentCard({
  agent,
  side,
  isWinner,
  isLoser,
  compact = false,
}: {
  agent: AiArenaAgent | null;
  side: "left" | "right";
  isWinner?: boolean;
  isLoser?: boolean;
  compact?: boolean;
}) {
  const rankInfo = agent ? getRankFromElo(agent.eloRating) : null;
  const color = agent ? clanColor(agent.clan) : "#8b6dff";
  const isRight = side === "right";

  if (!agent) {
    return (
      <div
        className={
          compact
            ? "flex min-w-0 flex-col items-center gap-1.5 px-1 py-2"
            : "flex min-w-0 flex-1 items-center gap-2 px-2 sm:gap-3 sm:px-3"
        }
      >
        <div className="h-10 w-10 animate-pulse rounded-xl bg-white/5 sm:h-14 sm:w-14" />
        <div className="space-y-1.5">
          <div className="h-3 w-20 animate-pulse rounded bg-white/8" />
          <div className="h-2 w-14 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={`flex min-w-0 flex-col items-center gap-1 px-1 py-2 text-center transition-all duration-500 ${
          isLoser ? "opacity-40 grayscale" : ""
        }`}
      >
        <div className="relative shrink-0">
          <div
            className="absolute -inset-1 rounded-lg blur-md opacity-40"
            style={{ background: `${color}40` }}
          />
          <ArenaAgentThumbnail
            agent={agent}
            className="relative h-10 w-10 rounded-lg border-white/15"
          />
          {isWinner ? (
            <Crown
              className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 drop-shadow-lg"
              style={{ color: "#fbbf24" }}
            />
          ) : null}
        </div>
        <div className="min-w-0 w-full">
          <div className="truncate font-display text-[11px] font-bold leading-tight text-white">
            {agent.name}
          </div>
          <div className="mt-0.5 truncate text-[8px] font-mono uppercase tracking-wider text-white/45">
            {agent.archetype}
          </div>
          <div className="mt-1 flex items-center justify-center gap-1">
            <span className="font-tech text-[10px] font-bold" style={{ color }}>
              {agent.eloRating.toLocaleString()}
            </span>
            <span className="text-[8px] text-white/30 font-tech">ELO</span>
          </div>
          <div className="mt-0.5 flex items-center justify-center gap-1.5 text-[8px] text-white/30 font-tech">
            <span>{agent.wins}W</span>
            <span className="text-white/20">·</span>
            <span>{agent.losses}L</span>
          </div>
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
          className="relative h-12 w-12 rounded-xl border-white/15 sm:h-14 sm:w-14"
        />
        {isWinner && (
          <Crown
            className="absolute -top-2 -right-2 h-4 w-4 drop-shadow-lg"
            style={{ color: "#fbbf24" }}
          />
        )}
      </div>

      <div className={`min-w-0 ${isRight ? "text-right" : "text-left"}`}>
        <div className="font-display text-sm font-bold leading-tight truncate max-w-[88px] sm:max-w-[120px]">
          {agent.name}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-white/45 mt-0.5">
          {agent.archetype}
        </div>
        <div
          className="flex items-center gap-1.5 mt-1"
          style={{ justifyContent: isRight ? "flex-end" : "flex-start" }}
        >
          <span className="font-tech text-xs font-bold sm:text-sm" style={{ color }}>
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
      className={`flex min-w-0 flex-1 items-center gap-2 px-2 sm:gap-3 sm:px-3 transition-all duration-500 ${
        isLoser ? "opacity-40 grayscale" : ""
      } ${isRight ? "flex-row-reverse" : ""}`}
    >
      {inner}
    </div>
  );
}

function AgentBanner({
  myAgent,
  opponent,
  battle,
  gamePhase,
  mode: _mode,
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
    <div className="relative overflow-hidden border-b border-white/8 bg-[#04080f]/95 backdrop-blur">
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

      <div className="relative grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] items-center gap-0 px-1 py-1 sm:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)]">
        <AgentCard
          agent={myAgent}
          side="left"
          compact
          isWinner={gamePhase === "ended" && myWon}
          isLoser={gamePhase === "ended" && !myWon && !!result}
        />

        <div className="flex shrink-0 flex-col items-center justify-center self-center">
          <span className="font-display text-base font-black leading-none text-gradient sm:text-lg">
            CO-OP
          </span>
        </div>

        <AgentCard
          agent={opponent}
          side="right"
          compact
          isWinner={gamePhase === "ended" && !!oppWon}
          isLoser={gamePhase === "ended" && oppWon === false && !!result}
        />
      </div>
    </div>
  );
}

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

  const zgLink = battle.id ? `https://storagescan.0g.ai/tx/${battle.id}` : null;
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
            <span className="font-tech text-[10px] text-white/40 uppercase">Loser</span>
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
          <div className="text-center">
            <div className="font-display text-sm font-bold text-white/80">{battle.status}</div>
            <div className="font-tech text-[8px] uppercase text-white/30">Status</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-white/6 bg-white/[0.02]">
        {zgLink ? (
          <a href={zgLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] font-mono text-white/35 hover:text-neon-cyan transition">
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

function GameChatPanel({
  messages,
  chatInput,
  onInputChange,
  onSend,
  chatEndRef,
  myAgent,
  onShareMoment,
}: {
  messages: ChatMsg[];
  chatInput: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
  myAgent: AiArenaAgent | null;
  onShareMoment?: () => void;
}) {
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[#04080f]/95">
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y py-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 [-webkit-overflow-scrolling:touch]">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} onShareMoment={onShareMoment} />
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="shrink-0 border-t border-white/8 p-2">
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
        <p className="mt-1 text-center font-mono text-[8px] text-white/15">Enter to send · observers can chat</p>
      </div>
    </div>
  );
}

function ArenaBattleDrawer({
  open,
  onClose,
  myAgent,
  opponent,
  battle,
  gamePhase,
  mode,
  messages,
  chatInput,
  onInputChange,
  onSend,
  chatEndRef,
  observerCount,
  onShareMoment,
}: {
  open: boolean;
  onClose: () => void;
  myAgent: AiArenaAgent | null;
  opponent: AiArenaAgent | null;
  battle?: AiArenaBattle;
  gamePhase: GamePhase;
  mode: string;
  messages: ChatMsg[];
  chatInput: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
  observerCount: number;
  onShareMoment?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") onClose(); };
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
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex h-dvh max-h-dvh w-[min(92vw,360px)] flex-col overflow-hidden border-l border-white/10 bg-[#04080f]/98 shadow-[-24px_0_80px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/8 px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <span className="font-tech text-[10px] uppercase tracking-widest text-white/70 font-bold">Battle info</span>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-mono text-[9px] text-white/35">{observerCount} watching</span>
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

        <div className="shrink-0 border-b border-white/8">
          <AgentBanner myAgent={myAgent} opponent={opponent} battle={battle} gamePhase={gamePhase} mode={mode} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center gap-2 border-b border-white/8 px-3 py-2">
            <span className="font-tech text-[9px] uppercase tracking-widest text-white/45">Live chat</span>
            <span className="font-tech text-[9px] uppercase tracking-wider text-white/25">{mode}</span>
          </div>
          <GameChatPanel
            messages={messages}
            chatInput={chatInput}
            onInputChange={onInputChange}
            onSend={onSend}
            chatEndRef={chatEndRef}
            myAgent={myAgent}
            onShareMoment={onShareMoment}
          />
        </div>
      </aside>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Wave Co-op Result Overlay — coin-based, shown when Unity fires waveCoopBattleEnd
// ─────────────────────────────────────────────────────────────────────────────

function WaveCoopResultOverlay({
  result,
  commentary,
  storageHashes,
  myAgent,
  opponent,
  onHome,
  onShareMoment,
}: {
  result: WaveCoopResult;
  commentary?: string | null;
  storageHashes?: string[];
  myAgent?: AiArenaAgent | null;
  opponent?: AiArenaAgent | null;
  onHome: () => void;
  onShareMoment?: () => void;
}) {
  const winnerAgent = result.myAgentWon ? myAgent : opponent;
  const loserAgent  = result.myAgentWon ? opponent : myAgent;
  const winnerColor = winnerAgent ? clanColor(winnerAgent.clan) : "#22d3ee";
  const loserColor  = loserAgent  ? clanColor(loserAgent.clan)  : "#6b7280";

  const durationMin = Math.floor(result.durationSeconds / 60);
  const durationSec = result.durationSeconds % 60;
  const durationStr = `${String(durationMin).padStart(2, "0")}:${String(durationSec).padStart(2, "0")}`;

  return (
    <div
      className="absolute inset-0 z-40 overflow-y-auto"
      style={{ background: "rgba(3,7,16,0.90)", backdropFilter: "blur(10px)" }}
    >
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          className="w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.85)] sm:max-w-md sm:rounded-3xl"
          style={{ background: "rgba(8,12,24,0.97)" }}
        >
          {/* Header */}
          <div
            className="relative px-5 pt-2 pb-2 text-center overflow-hidden sm:px-8 sm:pt-5 sm:pb-3.5"
            style={{
              background: result.myAgentWon
                ? `linear-gradient(135deg, ${winnerColor}20 0%, transparent 60%)`
                : "linear-gradient(135deg, rgba(239,68,68,0.10) 0%, transparent 60%)",
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background: result.myAgentWon
                  ? `linear-gradient(90deg, transparent, ${winnerColor}, transparent)`
                  : "linear-gradient(90deg, transparent, #ef4444, transparent)",
              }}
            />
            <div
              className="font-display text-2xl font-black tracking-[0.08em] sm:text-4xl"
              style={{
                color: result.myAgentWon ? winnerColor : "#ef4444",
                textShadow: `0 0 40px ${result.myAgentWon ? winnerColor : "#ef4444"}88`,
              }}
            >
              {result.myAgentWon ? "VICTORY" : "DEFEAT"}
            </div>
            <div className="flex items-center justify-center gap-3 mt-1.5 sm:mt-2">
              <span
                className="rounded-full border px-3 py-0.5 font-tech text-[9px] uppercase tracking-widest"
                style={{
                  borderColor: result.myAgentWon ? `${winnerColor}50` : "rgba(239,68,68,0.4)",
                  color: result.myAgentWon ? winnerColor : "#f87171",
                  background: result.myAgentWon ? `${winnerColor}12` : "rgba(239,68,68,0.08)",
                }}
              >
                ⏱ Wave Complete
              </span>
              <span className="font-mono text-[10px] text-white/25">{durationStr}</span>
            </div>
          </div>

          {/* Coin cards */}
          <div className="grid grid-cols-2 gap-2.5 px-4 py-2 sm:gap-3 sm:px-6 sm:py-3">
            {/* Winner */}
            <div
              className="relative overflow-hidden rounded-xl border p-3 sm:rounded-2xl"
              style={{ borderColor: `${winnerColor}80`, background: `radial-gradient(circle at 18% 12%, ${winnerColor}22, transparent 50%), rgba(255,255,255,0.03)` }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${winnerColor}, transparent)` }} />
              <div className="mb-2 flex items-center gap-1.5">
                <Crown className="h-3 w-3 shrink-0 text-yellow-400" />
                <span className="font-tech text-[8px] uppercase tracking-widest text-white/90">Winner</span>
              </div>
              <div className="font-display text-[13px] font-bold leading-tight truncate text-white sm:text-sm">
                {result.winnerName}
              </div>
              <div
                className="mt-2 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1.5"
              >
                <span className="text-lg leading-none">🪙</span>
                <div>
                  <div className="font-display text-xl font-black leading-none" style={{ color: winnerColor }}>
                    {result.winnerCoins}
                  </div>
                  <div className="font-tech text-[8px] uppercase text-white/35">coins</div>
                </div>
              </div>
            </div>

            {/* Loser */}
            <div
              className="relative overflow-hidden rounded-xl border p-3 sm:rounded-2xl"
              style={{ borderColor: "rgba(255,255,255,0.18)", background: "radial-gradient(circle at 18% 12%, rgba(255,255,255,0.08), transparent 50%), rgba(255,255,255,0.02)" }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="mb-2 flex items-center gap-1.5">
                <Shield className="h-3 w-3 shrink-0 text-white/35" />
                <span className="font-tech text-[8px] uppercase tracking-widest text-white/70">Runner-up</span>
              </div>
              <div className="font-display text-[13px] font-bold leading-tight truncate text-white/80 sm:text-sm">
                {result.loserName}
              </div>
              <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5">
                <span className="text-lg leading-none opacity-50">🪙</span>
                <div>
                  <div className="font-display text-xl font-black leading-none text-white/50">
                    {result.loserCoins}
                  </div>
                  <div className="font-tech text-[8px] uppercase text-white/25">coins</div>
                </div>
              </div>
            </div>
          </div>

          {/* 0G Compute Commentary */}
          {commentary && (
            <div className="mx-4 mb-1.5 rounded-xl border border-white/8 bg-white/[0.03] p-2 sm:mx-6 sm:mb-3 sm:rounded-2xl sm:p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MessageSquare className="h-3 w-3 text-primary/60 shrink-0" />
                <span className="font-tech text-[9px] uppercase tracking-widest text-white/35">0G Compute · AI Commentator</span>
              </div>
              <p className="font-mono text-[10px] leading-relaxed text-white/60 italic">"{commentary}"</p>
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
            <div className="mx-4 mb-3 flex items-center gap-2 sm:mx-6">
              <Loader2 className="h-3 w-3 animate-spin text-white/15 shrink-0" />
              <span className="font-tech text-[9px] text-white/20 uppercase tracking-widest">AI commentator generating…</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-1.5 px-4 pb-2.5 sm:gap-2 sm:px-6 sm:pb-5">
            <button
              type="button"
              onClick={onShareMoment}
              disabled={!onShareMoment}
              className={`flex w-full items-center justify-center gap-2.5 rounded-xl border py-2 font-tech text-[11px] uppercase tracking-widest transition sm:rounded-2xl sm:py-3 ${
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
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.06] py-2 font-tech text-[11px] uppercase tracking-widest text-white/65 hover:bg-white/10 hover:text-white hover:border-white/25 transition sm:rounded-2xl sm:py-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Home Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function WarzoneWaveGamePage() {
  const { battleId } = useParams<{ battleId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const myAgentId = searchParams.get("myAgentId");
  const opponentIdParam = searchParams.get("opponentId");

  // ── State ────────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: uid(), kind: "system", text: "Wave co-op lobby opened. Loading battle…", ts: new Date() },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [gamePhase, setGamePhase] = useState<GamePhase>("live");
  const [observerCount] = useState(() => Math.floor(Math.random() * 80) + 12);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [unityLoaded, setUnityLoaded] = useState(false);
  const [unityLoadError, setUnityLoadError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const [battleResult, setBattleResult] = useState<WaveCoopResult | null>(null);
  const [battleCommentary, setBattleCommentary] = useState<string | null>(null);
  const [memoryRootHashes, setMemoryRootHashes] = useState<string[]>([]);

  const [preMatchData, setPreMatchData] = useState<{
    mapId: string;
    myAgentName: string;
    opponentName: string;
  } | null>(null);
  const [preMatchCountdown, setPreMatchCountdown] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unityInstanceRef = useRef<any>(null);
  const unityLoadingRef = useRef(false);
  const prevStatusRef = useRef<string | null>(null);
  const resultPostedRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const trackedAudioContextsRef = useRef<Set<AudioContext>>(new Set());

  // ── Queries ──────────────────────────────────────────────────────────────

  const battleQ = useQuery({
    queryKey: ["waveGame", "battle", battleId],
    queryFn: () => aiArenaGatewayApi.getBattle(battleId!),
    enabled: !!battleId,
    refetchInterval: (q) => battleLiveRefetchInterval(q, 2_000),
    staleTime: 500,
    retry: (failureCount, error) => {
      if (isBattleNotFoundError(error)) return false;
      return failureCount < 2;
    },
    refetchOnWindowFocus: (q) => !isBattleNotFoundError(q.state.error),
    refetchOnReconnect: (q) => !isBattleNotFoundError(q.state.error),
  });

  const myAgentQ = useQuery({
    queryKey: ["waveGame", "myAgent", myAgentId],
    queryFn: () => aiArenaGatewayApi.getAgentById(myAgentId!),
    enabled: !!myAgentId,
    staleTime: 60_000,
    retry: 1,
  });

  const battle = battleQ.data?.battle;

  const resolvedOpponentId =
    opponentIdParam ?? battle?.agentIds?.find((id) => id !== myAgentId) ?? null;

  const opponentQ = useQuery({
    queryKey: ["waveGame", "opponent", resolvedOpponentId],
    queryFn: () => aiArenaGatewayApi.getAgentById(resolvedOpponentId!),
    enabled: !!resolvedOpponentId,
    staleTime: 60_000,
    retry: 1,
  });

  const myAgent = myAgentQ.data ?? null;
  const opponent = opponentQ.data ?? null;

  // ── Unity loading ─────────────────────────────────────────────────────────

  const diagnoseBuildFiles = async (buildUrl: string): Promise<'ok' | 'cors' | 'not-found'> => {
    const testUrl = `${buildUrl}/WarzoneV4.data`;
    try {
      const res = await fetch(testUrl, { method: 'HEAD', mode: 'cors', cache: 'no-store' });
      if (res.ok || res.status === 206) return 'ok';
      return 'not-found';
    } catch (_corsErr) {
      try {
        await fetch(testUrl, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' });
        return 'cors';
      } catch (_netErr) {
        return 'not-found';
      }
    }
  };

  const unityShowBanner = (msg: string, type: 'error' | 'warning' | string) => {
    console.log(`[WaveGame ${type}]`, msg);
    if (type === 'warning') console.warn('[WaveGame warning]', msg);
  };

  useEffect(() => {
    const win = window as any;
    if (win.__kultAudioContextPatched) return;
    const contexts = trackedAudioContextsRef.current;
    const patchAudioContext = (key: "AudioContext" | "webkitAudioContext") => {
      const Original = win[key];
      if (!Original) return;
      function PatchedAudioContext(this: AudioContext, ...args: unknown[]) {
        const context = new Original(...args) as AudioContext;
        contexts.add(context);
        return context;
      }
      PatchedAudioContext.prototype = Original.prototype;
      Object.setPrototypeOf(PatchedAudioContext, Original);
      win[key] = PatchedAudioContext;
    };
    patchAudioContext("AudioContext");
    patchAudioContext("webkitAudioContext");
    win.__kultAudioContextPatched = true;
    win.__kultAudioContexts = contexts;
  }, []);

  const applyAudioMute = useCallback((muted: boolean) => {
    document.querySelectorAll<HTMLMediaElement>("audio, video").forEach((el) => {
      el.muted = muted;
      el.volume = muted ? 0 : 1;
    });

    const unity = unityInstanceRef.current;
    const win = window as any;
    const possibleContexts = [
      unity?.Module?.SDL2?.audioContext,
      unity?.Module?.audioContext,
      unity?.Module?.WEBAudio?.audioContext,
      win.unityAudioContext,
      win.WEBAudio?.audioContext,
      win.Module?.SDL2?.audioContext,
      win.Module?.audioContext,
      win.Module?.WEBAudio?.audioContext,
      ...(Array.from(win.__kultAudioContexts ?? []) as AudioContext[]),
      ...(Array.from(trackedAudioContextsRef.current) as AudioContext[]),
    ].filter(Boolean) as AudioContext[];

    for (const audioContext of new Set(possibleContexts)) {
      if (muted && audioContext.state === "running") void audioContext.suspend();
      else if (!muted && audioContext.state === "suspended") void audioContext.resume();
    }

    [
      ["GameManager", "SetMuted", muted ? "1" : "0"],
      ["GameManager", "SetMute", muted ? "1" : "0"],
      ["GameManager", "SetMasterVolume", muted ? "0" : "1"],
      ["AudioManager", "SetMuted", muted ? "1" : "0"],
      ["AudioManager", "SetMasterVolume", muted ? "0" : "1"],
    ].forEach(([objectName, methodName, value]) => {
      try { unity?.SendMessage?.(objectName, methodName, value); } catch (_err) {}
    });
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((current) => {
      const next = !current;
      applyAudioMute(next);
      return next;
    });
  }, [applyAudioMute]);

  // Load Unity — writes WAVECOOP mode into arenaBattlePayload so Unity activates wave co-op
  useEffect(() => {
    if (!battleId || !UNITY_BASE_URL) return;
    if (myAgentQ.isLoading || opponentQ.isLoading) return;
    if (unityLoadingRef.current || !canvasRef.current) return;

    unityLoadingRef.current = true;

    const arenaPayload = {
      battleId,
      myAgentId:         myAgentId ?? '',
      myAgentName:       myAgent?.name ?? '',
      myAgentArchetype:  myAgent?.archetype ?? '',
      myAgentElo:        myAgent?.eloRating ?? 1000,
      myAgentClan:       myAgent?.clan ?? '',
      opponentId:        resolvedOpponentId ?? '',
      opponentName:      opponent?.name ?? '',
      opponentArchetype: opponent?.archetype ?? '',
      opponentElo:       opponent?.eloRating ?? 1000,
      opponentClan:      opponent?.clan ?? '',
      mode:              "WAVECOOP",
    };
    localStorage.setItem('arenaBattlePayload', JSON.stringify(arenaPayload));

    const buildUrl = `${UNITY_BASE_URL}/Warzone2`;
    const script = document.createElement("script");
    script.src = `${buildUrl}/WarzoneV4.loader.js`;

    script.onload = async () => {
      if (!canvasRef.current) return;
      if (typeof (window as any).createUnityInstance !== 'function') {
        console.error("[WaveGame] createUnityInstance not found after loader script");
        unityLoadingRef.current = false;
        return;
      }

      const diagnosis = await diagnoseBuildFiles(buildUrl);
      if (diagnosis === 'cors') {
        console.error("[WaveGame] R2 CORS not configured.");
        setUnityLoadError('cors');
        unityLoadingRef.current = false;
        return;
      }
      if (diagnosis === 'not-found') {
        console.error("[WaveGame] Build files not reachable at:", buildUrl);
        setUnityLoadError('not-found');
        unityLoadingRef.current = false;
        return;
      }

      const stuckTimer = setTimeout(() => {
        if (!unityInstanceRef.current) {
          console.warn("[WaveGame] Unity stuck at 0% — R2 rate-limit stall.");
          setUnityLoadError('slow');
        }
      }, 90_000);

      try {
        const instance = await (window as any).createUnityInstance(
          canvasRef.current,
          {
            arguments: [],
            dataUrl:       `${buildUrl}/WarzoneV4.data`,
            frameworkUrl:  `${buildUrl}/WarzoneV4.framework.js`,
            codeUrl:       `${buildUrl}/WarzoneV4.wasm`,
            streamingAssetsUrl: "StreamingAssets",
            companyName:   "Kult Games",
            productName:   "WarzoneV4",
            productVersion: "1.0",
            matchWebGLToCanvasSize: false,
            devicePixelRatio: 1,
            showBanner: unityShowBanner,
          },
          (progress: number) => { setLoadingProgress(Math.round(progress * 100)); }
        );

        clearTimeout(stuckTimer);
        unityInstanceRef.current = instance;
        setUnityLoaded(true);

        setTimeout(() => {
          try {
            instance.SendMessage("GameManager", "SetBattleId", battleId ?? '');
            console.log("[WaveGame] ✅ battleId sent to Unity");
          } catch (err) {
            console.warn("[WaveGame] SendMessage failed:", err);
          }
        }, 1500);

      } catch (err) {
        clearTimeout(stuckTimer);
        console.error("[WaveGame] createUnityInstance failed:", err);
        unityLoadingRef.current = false;
      }
    };

    script.onerror = () => {
      console.error("[WaveGame] Failed to load loader from:", script.src);
      unityLoadingRef.current = false;
    };

    document.body.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battleId, myAgentQ.isLoading, opponentQ.isLoading]);

  useEffect(() => {
    return () => {
      if (unityInstanceRef.current) {
        unityInstanceRef.current.Quit?.().catch(() => {});
        unityInstanceRef.current = null;
      }
      localStorage.removeItem('arenaBattlePayload');
      saveTrackedAiArenaBattleId(null);
    };
  }, []);

  useEffect(() => {
    if (unityLoaded) applyAudioMute(isMuted);
  }, [applyAudioMute, isMuted, unityLoaded]);

  // Listen for Unity's wave co-op battle end event
  useEffect(() => {
    const handler = async (e: Event) => {
      const detail = (e as CustomEvent<WaveCoopResult>).detail;
      if (!detail || typeof detail !== "object") return;

      setBattleResult(detail);
      setGamePhase("ended");
      saveTrackedAiArenaBattleId(null);
      localStorage.removeItem('arenaBattlePayload');

      const bid = detail.battleId;
      if (!bid) {
        console.warn("[WaveGame] waveCoopBattleEnd — no battleId in payload.");
        return;
      }

      // Submit official result (winnerId / loserId from co-op payload)
      try {
        await aiArenaGatewayApi.endBattle(bid, {
          winnerId: detail.winnerAgentId,
          loserId:  detail.loserAgentId,
        });
        console.log("[WaveGame] ✅ endBattle submitted for:", bid);
      } catch (err) {
        console.warn("[WaveGame] endBattle API failed:", err);
      }

      // Trait evolution (fire-and-forget)
      void (async () => {
        try {
          if (detail.winnerAgentId) {
            await aiArenaGatewayApi.evolveAgentTraits(detail.winnerAgentId, {
              outcome: "WIN",
              jumps: 0, shotsAttempted: 0, shotsConnected: 0,
              timesHit: 0, distanceCovered: 0,
              durationSeconds: detail.durationSeconds,
            });
          }
          if (detail.loserAgentId) {
            await aiArenaGatewayApi.evolveAgentTraits(detail.loserAgentId, {
              outcome: "LOSS",
              jumps: 0, shotsAttempted: 0, shotsConnected: 0,
              timesHit: 0, distanceCovered: 0,
              durationSeconds: detail.durationSeconds,
            });
          }
        } catch (err) {
          console.warn("[WaveGame] Trait evolution failed:", err);
        }
      })();

      // 0G Compute commentary
      let commentary = "";
      try {
        const commentaryRes = await aiArenaGatewayApi.generateBattleCommentary({
          battleId:        bid,
          winnerName:      detail.winnerName,
          winnerArchetype: "",
          winnerClan:      "",
          winnerElo:       0,
          winnerHpPercent: 100,
          loserName:       detail.loserName,
          loserArchetype:  "",
          loserClan:       "",
          loserElo:        0,
          loserHpPercent:  0,
          durationSeconds: detail.durationSeconds,
          endReason:       detail.endReason,
        });
        commentary = commentaryRes.commentary ?? "";
        if (commentary) setBattleCommentary(commentary);
      } catch (err) {
        console.warn("[WaveGame] Commentary generation failed:", err);
      }

      // 0G Storage memory
      const memContent = commentary ||
        `${detail.winnerName} collected ${detail.winnerCoins} coins vs ${detail.loserName}'s ${detail.loserCoins} in a ${detail.durationSeconds}s wave battle.`;
      const hashes: string[] = [];

      if (detail.winnerAgentId) {
        try {
          const winRes = await aiArenaGatewayApi.storeBattleMemory(detail.winnerAgentId, {
            battleId: bid, outcome: "WIN", content: memContent,
          });
          if (winRes.snapshotRootHash) hashes.push(winRes.snapshotRootHash);
        } catch (err) {
          console.warn("[WaveGame] Winner memory storage failed:", err);
        }
      }

      if (detail.loserAgentId) {
        try {
          const loseRes = await aiArenaGatewayApi.storeBattleMemory(detail.loserAgentId, {
            battleId: bid, outcome: "LOSS", content: memContent,
          });
          if (loseRes.snapshotRootHash) hashes.push(loseRes.snapshotRootHash);
        } catch (err) {
          console.warn("[WaveGame] Loser memory storage failed:", err);
        }
      }

      if (hashes.length) setMemoryRootHashes(hashes);
    };

    window.addEventListener("waveCoopBattleEnd", handler);
    return () => window.removeEventListener("waveCoopBattleEnd", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-match overlay — arenaMultiplayerStart fires same as Warzone Warriors
  useEffect(() => {
    const MAP_DURATIONS: Record<string, number> = { "1": 10, "2": 15, "3": 17 };
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { mapId?: string; myAgentName?: string; opponentName?: string };
      const mapId = (detail?.mapId ?? "1").charAt(0);
      const duration = MAP_DURATIONS[mapId] ?? 10;
      setPreMatchData({ mapId, myAgentName: detail?.myAgentName ?? "", opponentName: detail?.opponentName ?? "" });
      setPreMatchCountdown(duration);
    };
    window.addEventListener("arenaMultiplayerStart", handler);
    return () => window.removeEventListener("arenaMultiplayerStart", handler);
  }, []);

  useEffect(() => {
    if (preMatchCountdown <= 0 || !preMatchData) return;
    const t = setTimeout(() => {
      setPreMatchCountdown((c) => {
        if (c <= 1) { setPreMatchData(null); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [preMatchCountdown, preMatchData]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const addSystem = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: uid(), kind: "system" as const, text, ts: new Date() }]);
  }, []);

  const navigateToTrashTalkMoment = useCallback(() => {
    if (!battleId || !myAgentId) return;
    navigate(buildTrashTalkMomentPath(battleId, myAgentId, "warzone-wave"));
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

  // ── Battle status transitions ─────────────────────────────────────────────

  useEffect(() => {
    const status = battle?.status ?? null;
    if (status === prevStatusRef.current) return;
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    if (!status) return;

    if ((status === "PENDING" || status === "INITIALIZING") && prev === null)
      addSystem("⏳  Wave battle created — arena loading…");
    if (status === "IN_PROGRESS" && prev !== "IN_PROGRESS")
      addSystem("⚔️  Wave battle is LIVE! Agents are fighting enemy waves.");
    if (status === "COMPLETED" && battle?.result && !resultPostedRef.current) {
      resultPostedRef.current = true;
      setGamePhase("ended");
      addSystem("🏁  Wave battle concluded. Final results below.");
      addResult(battle.result, battle);
    }
    if (status === "CANCELLED") { setGamePhase("ended"); addSystem("❌  Battle was cancelled."); }
    if (status === "DISPUTED") { setGamePhase("ended"); addSystem("⚠️  Battle result is disputed."); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle?.status]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const isError = battleQ.isError;
  const isBattleComplete = Boolean((battle?.status === "COMPLETED" && battle?.result) || battleResult);
  const canShareMoment = Boolean(battleId && myAgentId && isBattleComplete);
  const shareMomentHandler = canShareMoment ? navigateToTrashTalkMoment : undefined;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-[#030710] text-white">

      {/* Top Nav */}
      <header className="relative z-30 shrink-0 border-b border-white/8 bg-[#04080f]/92 backdrop-blur-xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(circle at 18% 0%, rgba(34,211,238,0.12), transparent 42%), radial-gradient(circle at 82% 0%, rgba(0,137,255,0.12), transparent 38%)" }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#22d3ee]/35 to-transparent" />

        <div className="relative grid h-12 grid-cols-[auto_1fr_auto] items-center gap-2 px-2 sm:h-14 sm:gap-3 sm:px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1.5 font-tech text-[9px] uppercase tracking-[0.18em] text-white/55 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white sm:px-3 sm:py-2"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex min-w-0 items-center justify-center">
            <div className="flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 sm:gap-2.5 sm:px-3.5 sm:py-1.5">
              <Swords className="hidden h-3.5 w-3.5 shrink-0 text-[#22d3ee] sm:block" />
              <span className="hidden font-tech text-[8px] uppercase tracking-[0.22em] text-cyan-300/80 sm:inline">Wave</span>
              <span className="h-3 w-px bg-white/12" />
              <span className="truncate font-mono text-[10px] font-medium text-sky-300 sm:text-[11px]">
                {shortId(battleId)}
              </span>
              {gamePhase === "live" ? (
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-red-400/35 bg-red-500/12 px-2 py-0.5 font-tech text-[8px] uppercase tracking-[0.16em] text-red-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                  Live
                </span>
              ) : (
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/[0.05] px-2 py-0.5 font-tech text-[8px] uppercase tracking-[0.16em] text-white/45">
                  Ended
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <span className="rounded-full border border-[#22d3ee]/25 bg-[#22d3ee]/10 px-2 py-1 font-tech text-[8px] font-bold uppercase tracking-[0.18em] text-cyan-200/90 sm:px-2.5 sm:text-[9px]">
              WAVE CO-OP
            </span>
            {canShareMoment ? (
              <button
                type="button"
                onClick={navigateToTrashTalkMoment}
                className="hidden items-center gap-1.5 rounded-xl border border-[#9a35ff]/40 bg-[linear-gradient(135deg,rgba(154,53,255,0.22),rgba(4,8,15,0.55))] px-2.5 py-1.5 font-tech text-[8px] uppercase tracking-wider text-[#e9d5ff] transition hover:border-[#c084fc]/55 hover:bg-[#9a35ff]/28 sm:flex"
              >
                <Share2 className="h-3 w-3" />
                Moment
              </button>
            ) : null}
            {battleQ.isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin text-white/30" /> : null}
          </div>
        </div>
      </header>

      {/* Full-screen game canvas */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute battle sound" : "Mute battle sound"}
          className="absolute right-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white/75 shadow-[0_0_22px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-primary/55 hover:bg-primary/15 hover:text-white"
        >
          {isMuted ? <VolumeX className="h-[18px] w-[18px]" /> : <Volume2 className="h-[18px] w-[18px]" />}
        </button>

        {!chatDrawerOpen ? (
          <button
            type="button"
            onClick={() => setChatDrawerOpen(true)}
            aria-label="Open battle info and chat"
            className="absolute bottom-5 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#22d3ee]/45 bg-[linear-gradient(135deg,rgba(34,211,238,0.45),rgba(4,8,15,0.92))] text-white shadow-[0_0_28px_rgba(34,211,238,0.35)] transition hover:scale-105"
          >
            <MessageSquare className="h-6 w-6" />
          </button>
        ) : null}

        {isError && (
          <BattleLoadErrorState error={battleQ.error} onRetry={() => void battleQ.refetch()} />
        )}

        {!isError && !UNITY_BASE_URL && (
          <div className="flex h-full items-center justify-center px-4">
            <div className="text-center">
              <p className="font-tech text-xs text-white/40 uppercase tracking-wider">Unity Build URL not configured</p>
              <p className="font-mono text-[9px] text-white/20 mt-1">Set VITE_UNITY_BUILD_URL in .env to load the game</p>
              {myAgent && opponent && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <span className="font-tech text-[10px] font-bold" style={{ color: clanColor(myAgent.clan) }}>{myAgent.name}</span>
                  <Swords className="h-3 w-3 text-white/20" />
                  <span className="font-tech text-[10px] font-bold" style={{ color: clanColor(opponent.clan) }}>{opponent.name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {!isError && UNITY_BASE_URL && (
          <div className="absolute inset-0">
            <ArenaLandscapeGate active={unityLoaded} className="absolute inset-0">
              <canvas
                ref={canvasRef}
                id="unity-canvas"
                width={1280}
                height={720}
                style={{ width: "100%", height: "100%", display: "block", background: "#030710" }}
              />

              {!unityLoaded && !unityLoadError && (
                <UnityLoadingScreen
                  progress={loadingProgress}
                  myAgent={myAgent}
                  opponent={opponent}
                  mode="WAVE CO-OP"
                />
              )}

              {preMatchData && unityLoaded && (
                <PreMatchOverlay
                  mapId={preMatchData.mapId}
                  myAgentName={preMatchData.myAgentName}
                  opponentName={preMatchData.opponentName}
                  countdown={preMatchCountdown}
                />
              )}

              {unityLoadError && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#030710]/95 p-6">
                  <div className={`w-full max-w-md rounded-2xl border bg-[#0d0812] p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)] ${unityLoadError === 'slow' ? 'border-yellow-500/30' : 'border-red-500/30'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">{unityLoadError === 'slow' ? '⏳' : '⚠️'}</span>
                      <span className={`font-display text-base font-bold uppercase tracking-wider ${unityLoadError === 'slow' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {unityLoadError === 'slow' ? 'Loading Slow' : unityLoadError === 'cors' ? 'CORS Blocked' : 'Files Not Found'}
                      </span>
                    </div>
                    {unityLoadError === 'slow' ? (
                      <p className="font-tech text-[11px] text-white/60 leading-relaxed mb-4">
                        The game is taking too long to start. Click Retry to try again.
                      </p>
                    ) : unityLoadError === 'cors' ? (
                      <>
                        <p className="font-tech text-[11px] text-white/60 leading-relaxed mb-4">
                          R2 CORS not configured. Add a CORS rule to your Cloudflare R2 bucket.
                        </p>
                        <div className="rounded-xl border border-white/8 bg-black/40 p-4 mb-4">
                          <p className="font-mono text-[9px] text-primary/70 mb-2 uppercase tracking-wider">
                            Cloudflare R2 → bucket → Settings → CORS Policy
                          </p>
                          <pre className="font-mono text-[10px] text-white/70 leading-relaxed whitespace-pre-wrap">{`[{"AllowedOrigins":["*"],"AllowedMethods":["GET","HEAD"],"AllowedHeaders":["*"],"MaxAgeSeconds":86400}]`}</pre>
                        </div>
                      </>
                    ) : (
                      <p className="font-tech text-[11px] text-white/60 leading-relaxed mb-3">
                        Build files not reachable. Check <code className="font-mono text-[10px] text-primary/80">VITE_UNITY_BUILD_URL</code>.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => { setUnityLoadError(null); unityLoadingRef.current = false; window.location.reload(); }}
                      className="mt-4 w-full rounded-xl border border-primary/40 bg-primary/15 py-2 font-tech text-[11px] uppercase tracking-wider text-primary hover:bg-primary/25 transition"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {battleResult && (
                <WaveCoopResultOverlay
                  result={battleResult}
                  commentary={battleCommentary}
                  storageHashes={memoryRootHashes}
                  myAgent={myAgent}
                  opponent={opponent}
                  onHome={() => navigate(-1)}
                  onShareMoment={shareMomentHandler}
                />
              )}

              {gamePhase === "live" && !unityLoadError && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
                  <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-black/50 px-3 py-1 backdrop-blur">
                    <Zap className="h-2.5 w-2.5 text-[#22d3ee]/60" />
                    <span className="font-mono text-[8px] text-white/25">
                      {unityLoaded ? `wave · ${shortId(battleId)}` : `loading · ${loadingProgress}%`}
                    </span>
                  </div>
                </div>
              )}
            </ArenaLandscapeGate>
          </div>
        )}
      </div>

      <ArenaBattleDrawer
        open={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        myAgent={myAgent}
        opponent={opponent}
        battle={battle}
        gamePhase={gamePhase}
        mode="WAVE CO-OP"
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
              color: myAgent ? clanColor(myAgent.clan) : "#22d3ee",
              text: chatInput.trim(),
              ts: new Date(),
            },
          ]);
          setChatInput("");
        }}
        chatEndRef={chatEndRef}
        observerCount={observerCount}
        onShareMoment={shareMomentHandler}
      />
    </div>
  );
}
