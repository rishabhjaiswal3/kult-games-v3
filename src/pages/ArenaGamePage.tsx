/**
 * ArenaGamePage — Full-screen AI Arena battle experience.
 *
 * Layout:
 *   ┌─ sticky top nav bar ─────────────────────────────────────────────┐
 *   ├─ agent vs agent banner ─────────────────────────────────────────┤
 *   ├─ iframe area (flex-1) ──────────┬─ live chat (320px fixed) ─────┤
 *   │  countdown overlay              │  system + player messages      │
 *   │  900×600 Unity iframe           │  result card on completion     │
 *   └────────────────────────────────┴──────────────────────────────┘
 *
 * Flow:
 *   PENDING/INITIALIZING → 60-s countdown overlay
 *   IN_PROGRESS          → iframe visible + "LIVE" pill
 *   COMPLETED            → result card in chat
 *
 * Unity integration:
 *   • postMessage TO   iframe  → { type:"arena_battle_start", battleId, myAgent, opponent, mode }
 *   • postMessage FROM iframe  → { type:"arena_battle_end", battleId }  → triggers endBattle API
 */

import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback, useMemo, type KeyboardEvent } from "react";
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

/** Cloudflare R2 URL for the Unity WebGL build.
 *  Set VITE_UNITY_BUILD_URL in your .env to activate the iframe.
 *  e.g. VITE_UNITY_BUILD_URL=https://pub-xxxx.r2.dev/warzone/index.html
 */
const UNITY_BUILD_URL: string = import.meta.env.VITE_UNITY_BUILD_URL ?? '';
import { toast } from "sonner";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { getRankFromElo } from "@/utils/rankSystem";
import { ArenaAgentThumbnail } from "@/components/arena/ArenaAgentThumbnail";
import type {
  AiArenaAgent,
  AiArenaBattle,
  AiArenaBattleResult,
} from "@/types/aiArenaGateway";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

// "live"  — iframe loaded / battle in progress (Unity loading screen visible)
// "ended" — battle completed / result card shown
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
// Sub-components
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
      {/* Avatar */}
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

      {/* Info */}
      <div className={`min-w-0 ${isRight ? "text-right" : "text-left"}`}>
        <div className="font-display text-base sm:text-lg font-bold leading-tight truncate max-w-[120px] sm:max-w-[160px]">
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
            <img
              src={rankInfo.image}
              alt={rankInfo.name}
              title={rankInfo.name}
              className="h-5 w-5 object-contain"
            />
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
  const oppWon = result?.loserId !== myId && result?.winnerId !== myId ? null : result?.winnerId !== myId;

  return (
    <div className="relative border-b border-white/8 bg-[#04080f]/95 backdrop-blur overflow-hidden">
      {/* subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.5) 1px,transparent 1px)", backgroundSize: "40px 40px" }}
      />
      {/* glow streaks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#8b5cf620] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#06b6d420] to-transparent" />

      <div className="relative flex items-center min-h-[80px] sm:min-h-[96px]">
        {/* Left agent (mine) */}
        <AgentCard
          agent={myAgent}
          side="left"
          isWinner={gamePhase === "ended" && myWon}
          isLoser={gamePhase === "ended" && !myWon && !!result}
        />

        {/* Center VS */}
        <div className="flex shrink-0 flex-col items-center justify-center px-2 sm:px-4">
          <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full border border-primary/50 bg-primary/15 shadow-[0_0_20px_hsl(268_100%_70%/0.3)]">
              <Swords className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
          </div>
          <span className="font-display text-base sm:text-xl font-black mt-1 text-gradient">VS</span>
          <span className="font-tech text-[8px] uppercase tracking-widest text-white/30 mt-0.5">
            {mode}
          </span>
        </div>

        {/* Right agent (opponent) */}
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
  const winner = result.winnerId === myAgent?.id ? myAgent : result.winnerId === opponent?.id ? opponent : null;
  const loser = result.loserId === myAgent?.id ? myAgent : result.loserId === opponent?.id ? opponent : null;
  const iWon = result.winnerId === myAgentId;
  const myEloDelta = myAgentId ? result.eloChange?.[myAgentId] : undefined;
  const oppEloDelta = opponent?.id ? result.eloChange?.[opponent.id] : undefined;

  const zgLink = battle.id
    ? `https://storagescan.0g.ai/tx/${battle.id}`
    : null;

  const winnerColor = winner ? clanColor(winner.clan) : "#fbbf24";
  const loserColor = loser ? clanColor(loser.clan) : "#6b7280";

  return (
    <div className="mx-2 my-1 overflow-hidden rounded-xl border border-white/10 bg-[#0d1020] shadow-[0_0_32px_rgba(0,0,0,0.6)]">
      {/* Header */}
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

      {/* Winner / Loser row */}
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

        {/* Stats row */}
        <div className="flex items-center gap-3 pt-1.5 border-t border-white/6">
          {result.rounds != null && (
            <div className="text-center">
              <div className="font-display text-sm font-bold text-white/80">{result.rounds}</div>
              <div className="font-tech text-[8px] uppercase text-white/30">Rounds</div>
            </div>
          )}
          {Array.isArray(result.log) && (
            <div className="text-center">
              <div className="font-display text-sm font-bold text-white/80">{result.log.length}</div>
              <div className="font-tech text-[8px] uppercase text-white/30">Actions</div>
            </div>
          )}
          <div className="text-center">
            <div className="font-display text-sm font-bold text-white/80">{battle.status}</div>
            <div className="font-tech text-[8px] uppercase text-white/30">Status</div>
          </div>
        </div>
      </div>

      {/* Footer: 0G link + Share */}
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
      {/* Chat header */}
      <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2.5">
        <MessageSquare className="h-3.5 w-3.5 text-primary/70" />
        <span className="font-tech text-[10px] uppercase tracking-widest text-white/60 font-bold">
          LIVE CHAT
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-[9px] text-white/30">{observerCount} watching</span>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Chat input */}
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
  // No countdown — Unity's loading screen (index.html) handles that visually.
  const [gamePhase, setGamePhase] = useState<GamePhase>("live");
  const [observerCount] = useState(() => Math.floor(Math.random() * 80) + 12);

  const prevStatusRef = useRef<string | null>(null);
  const resultPostedRef = useRef(false);
  const iframeSrcSetRef = useRef(false);  // ensure iframe src is set only once
  const chatEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ── Queries ──────────────────────────────────────────────────────────────

  const battleQ = useQuery({
    queryKey: ["arenaGame", "battle", battleId],
    queryFn: () => aiArenaGatewayApi.getBattle(battleId!),
    enabled: !!battleId,
    refetchInterval: (q) => {
      const s = q.state.data?.battle?.status;
      if (!s || s === "PENDING" || s === "INITIALIZING" || s === "IN_PROGRESS") return 2_000;
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

  // Resolve opponent ID — from URL param or battle agentIds
  const resolvedOpponentId =
    opponentIdParam ?? battle?.agentIds?.find((id) => id !== myAgentId) ?? null;

  const opponentQ = useQuery({
    queryKey: ["arenaGame", "opponent", resolvedOpponentId],
    queryFn: () => aiArenaGatewayApi.getAgentById(resolvedOpponentId!),
    enabled: !!resolvedOpponentId,
    staleTime: 60_000,
    retry: 1,
  });

  // Replay for 0G link (fetched after completion)
  const replayQ = useQuery({
    queryKey: ["arenaGame", "replay", battleId],
    queryFn: () => aiArenaGatewayApi.getReplay(battleId!),
    enabled: !!battleId && gamePhase === "ended",
    staleTime: Infinity,
    retry: 1,
  });

  const myAgent = myAgentQ.data ?? null;
  const opponent = opponentQ.data ?? null;

  // ── Build Unity iframe URL (set once, contains all agent data as params) ──
  // Waits until both agent queries have settled so all name/archetype params
  // are populated.  battleId is also readable by Unity via Application.absoluteURL.
  const iframeSrc = useMemo(() => {
    if (!battleId || !UNITY_BUILD_URL) return '';
    // Don't compute until queries have finished loading
    if (myAgentQ.isLoading || opponentQ.isLoading) return '';
    const sp = new URLSearchParams({
      battleId,
      myAgentId:         myAgentId          ?? '',
      myAgentName:       myAgent?.name       ?? '',
      myAgentArchetype:  myAgent?.archetype  ?? '',
      myAgentElo:        String(myAgent?.eloRating ?? 1000),
      myAgentClan:       myAgent?.clan        ?? '',
      opponentId:        resolvedOpponentId  ?? '',
      opponentName:      opponent?.name      ?? '',
      opponentArchetype: opponent?.archetype ?? '',
      opponentElo:       String(opponent?.eloRating ?? 1000),
      opponentClan:      opponent?.clan      ?? '',
      mode,
    });
    return `${UNITY_BUILD_URL}?${sp.toString()}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myAgentQ.isLoading, opponentQ.isLoading, myAgent, opponent, battleId, myAgentId, resolvedOpponentId, mode]);

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
  // Countdown is gone — Unity's loading screen handles that visually.
  // Here we only watch for IN_PROGRESS (add live banner) and terminal states.

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

  // ── Set iframe src once (when agent queries finish) ───────────────────────
  useEffect(() => {
    if (iframeSrcSetRef.current || !iframeSrc || !iframeRef.current) return;
    iframeSrcSetRef.current = true;
    iframeRef.current.src = iframeSrc;
  }, [iframeSrc]);

  // ── Auto-scroll chat ──────────────────────────────────────────────────────

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── postMessage TO Unity once it's ready ─────────────────────────────────
  // Unity also reads battleId from window.location.search (Application.absoluteURL).
  // postMessage is kept as a belt-and-suspenders approach.
  useEffect(() => {
    if (!iframeRef.current || !myAgent || !opponent || !battleId) return;
    const frame = iframeRef.current;
    const send = () => {
      frame.contentWindow?.postMessage(
        {
          type: "arena_battle_start",
          battleId,
          myAgent: {
            id: myAgent.id, name: myAgent.name,
            archetype: myAgent.archetype, clan: myAgent.clan,
            eloRating: myAgent.eloRating, traits: myAgent.traits ?? {},
          },
          opponent: {
            id: opponent.id, name: opponent.name,
            archetype: opponent.archetype, clan: opponent.clan,
            eloRating: opponent.eloRating, traits: opponent.traits ?? {},
          },
          mode,
        },
        "*"
      );
    };
    // Send once Unity frame is loaded (onload fires after Unity initialises)
    frame.addEventListener("load", send);
    return () => frame.removeEventListener("load", send);
  }, [myAgent, opponent, battleId, mode]);

  // ── postMessage FROM Unity (game_over) ────────────────────────────────────

  useEffect(() => {
    const handle = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "arena_battle_end" && e.data.battleId === battleId) {
        addSystem("🎮  Game client reported battle end. Awaiting server confirmation…");
        // Note: the game server should call POST /v1/battles/:battleId/end
        // The battle polling will pick up the COMPLETED status automatically.
      }
    };
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, [battleId, addSystem]);

  // ── Chat send ─────────────────────────────────────────────────────────────

  const handleSend = useCallback(() => {
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
  }, [chatInput, myAgentId, myAgent]);

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

      {/* ── Main: Iframe + Chat ───────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Iframe / Countdown area */}
        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center bg-[#040810] overflow-hidden">

          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/4 top-1/3 h-72 w-72 rounded-full bg-primary/6 blur-3xl" />
            <div className="absolute right-1/4 bottom-1/3 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl" />
          </div>

          {/* Battle load error */}
          {isError && (
            <div className="relative text-center">
              <div className="font-tech text-sm text-red-400/80 mb-2">Failed to load battle</div>
              <button
                onClick={() => battleQ.refetch()}
                className="font-tech text-xs text-primary hover:text-primary/80 underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Unity iframe — always visible once battle is loaded ── */}
          {!isError && (
            <div className="relative flex w-full h-full items-center justify-center p-2 sm:p-4">
              <div
                className="relative overflow-hidden rounded-xl border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)]"
                style={{
                  width: "min(900px, 100%)",
                  aspectRatio: "900 / 600",
                  maxHeight: "calc(100vh - 200px)",
                }}
              >
                {/* Connecting placeholder shown while agent data loads or no build URL set */}
                {(!iframeSrc || isLoading) && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#030710]">
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(139,92,246,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.6) 1px,transparent 1px)",
                        backgroundSize: "60px 60px",
                      }}
                    />
                    <Loader2 className="h-7 w-7 animate-spin text-primary/50 relative z-10" />
                    {!UNITY_BUILD_URL ? (
                      <div className="relative z-10 text-center px-4">
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
                    ) : (
                      <span className="relative z-10 font-tech text-xs text-white/30 uppercase tracking-wider">
                        Preparing arena…
                      </span>
                    )}
                  </div>
                )}

                {/* The actual Unity WebGL iframe.
                    src is set imperatively (via ref) once agent queries settle,
                    so the frame never reloads when React re-renders. */}
                <iframe
                  ref={iframeRef}
                  title="AI Arena Game"
                  className="h-full w-full bg-[#030710]"
                  allow="fullscreen; autoplay"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
                />

                {/* GAME OVER overlay */}
                {gamePhase === "ended" && (
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center pointer-events-none">
                    <span className="font-display text-3xl font-black text-white/20 uppercase tracking-widest">
                      GAME OVER
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom hint — battle ID + Zap */}
          {!isError && gamePhase === "live" && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
              <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-black/50 px-3 py-1 backdrop-blur">
                <Zap className="h-2.5 w-2.5 text-primary/60" />
                <span className="font-mono text-[8px] text-white/25">
                  {UNITY_BUILD_URL
                    ? `battleId passed via URL query · ${shortId(battleId)}`
                    : `configure VITE_UNITY_BUILD_URL · ${shortId(battleId)}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chat panel */}
        <GameChatPanel
          messages={messages}
          chatInput={chatInput}
          onInputChange={setChatInput}
          onSend={handleSend}
          chatEndRef={chatEndRef}
          myAgent={myAgent}
          observerCount={observerCount}
        />
      </div>
    </div>
  );
}
