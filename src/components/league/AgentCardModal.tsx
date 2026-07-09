import { createPortal } from "react-dom";
import type { LeagueArenaAgent } from "@/constants/leagueAgents";
import { ArenaAgentMedia } from "./ArenaAgentMedia";
import { ClanIcon } from "@/components/arena/ClanIcon";

function chainType(chain: string): string {
  const c = chain.trim().toLowerCase();
  if (c === "solana") return "solana";
  if (c === "base") return "base";
  if (c === "okx") return "okx";
  return "zerog";
}

export type AgentCardModalProps = {
  agent: LeagueArenaAgent;
  quote: string;
  confidence: number;
  pick: string;
  /** Heading over the quote block; defaults to "Match call". */
  quoteLabel?: string;
  /** Label of the first stat tile; defaults to "Pick". */
  pickLabel?: string;
  /** Label of the progress bar; defaults to "Confidence". */
  confidenceLabel?: string;
  onClose: () => void;
};

/** Full-screen agent card dialog shared by Today's Agent Predictions, the
 *  Match Prediction Questions carousel and the Top Agents leaderboard. */
export function AgentCardModal({
  agent,
  quote,
  confidence,
  pick,
  quoteLabel = "Match call",
  pickLabel = "Pick",
  confidenceLabel = "Confidence",
  onClose,
}: AgentCardModalProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={`${agent.name} agent card`}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[calc(100dvh-40px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border bg-[#050712] shadow-[0_28px_90px_rgba(0,0,0,0.72)]"
        style={{ borderColor: `${agent.accentHex}70` }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background: `radial-gradient(circle at 18% 0%, ${agent.accentHex}30, transparent 42%), linear-gradient(135deg, rgba(255,255,255,0.06), transparent 48%)`,
          }}
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/45 font-tech text-xs text-white/70 transition hover:border-white/35 hover:text-white"
          aria-label="Close agent card"
        >
          X
        </button>

        <div className="relative z-10 overflow-y-auto">
          <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-4 sm:p-4">
            <div
              className="h-28 self-start overflow-hidden rounded-xl border bg-black/40 shadow-[0_0_24px_rgba(0,0,0,0.35)] sm:h-36"
              style={{ borderColor: `${agent.accentHex}45` }}
            >
              <ArenaAgentMedia src={agent.img} alt={agent.name} fit="cover" className="h-full w-full object-top" />
            </div>

            <div className="min-w-0 pr-7">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full border px-2 py-0.5 font-tech text-[8px] font-bold uppercase tracking-widest"
                  style={{
                    borderColor: `${agent.accentHex}70`,
                    color: agent.accentHex,
                    background: `${agent.accentHex}18`,
                  }}
                >
                  Rank {agent.rank}
                </span>
                <span className="rounded-full border border-white/12 bg-white/[0.04] px-2 py-0.5 font-tech text-[8px] uppercase tracking-widest text-white/65">
                  LV. {agent.lvl}
                </span>
                <span className="flex items-center gap-1 rounded-full border border-white/12 bg-white/[0.04] px-2 py-0.5 font-tech text-[8px] uppercase tracking-widest text-white/65">
                  <ClanIcon type={chainType(agent.chain)} className="h-3 w-3" />
                  {agent.chain}
                </span>
              </div>

              <h4 className="truncate font-tech text-lg font-black uppercase text-white sm:text-xl">
                {agent.name}
              </h4>
              <p className="mt-1 font-tech text-[10px] uppercase tracking-widest text-white/45">
                {agent.callsign} · {agent.tier}
              </p>

              <div className="mt-3 rounded-xl border border-white/10 bg-black/28 p-3">
                <p className="mb-1.5 font-tech text-[8px] font-bold uppercase tracking-widest text-white/35">{quoteLabel}</p>
                <p className="text-xs leading-relaxed text-white/82 sm:text-sm">
                  &ldquo;{quote}&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-3 pb-3 pt-3 sm:px-4 sm:pb-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="font-tech text-[10px] uppercase tracking-widest text-white/50">{confidenceLabel}</span>
              <span className="font-tech text-base font-black" style={{ color: agent.accentHex }}>
                {confidence}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full shadow-[0_0_14px_currentColor]"
                style={{
                  width: `${Math.min(100, Math.max(0, confidence))}%`,
                  backgroundColor: agent.accentHex,
                  color: agent.accentHex,
                }}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <p className="font-tech text-[8px] uppercase tracking-widest text-white/38">{pickLabel}</p>
                <p className="mt-1 truncate font-tech text-sm font-black uppercase text-white">{pick}</p>
              </div>
              <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <p className="font-tech text-[8px] uppercase tracking-widest text-white/38">Power</p>
                <p className="mt-1 truncate font-tech text-sm font-black text-white">{agent.power}</p>
              </div>
              <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <p className="font-tech text-[8px] uppercase tracking-widest text-white/38">Tier</p>
                <p className="mt-1 truncate font-tech text-sm font-black uppercase" style={{ color: agent.accentHex }}>{agent.tier}</p>
              </div>
              <div className="min-w-0 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <p className="font-tech text-[8px] uppercase tracking-widest text-white/38">Rank</p>
                <p className="mt-1 truncate font-tech text-sm font-black text-white">#{agent.rank}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
