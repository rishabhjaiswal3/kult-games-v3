/**
 * LauncherPreMatchView — shown in the main canvas area when phase === "idle".
 *
 * Displays the bot vs bot pre-match cards, an Unreal Engine badge, a short
 * description, and the Download / Launch action buttons.
 */

import { Download, Rocket, ExternalLink, Monitor } from "lucide-react";
import { LAUNCHER_DOWNLOAD_URL } from "@/constants/launcher";
import type { AiArenaAgent } from "@/types/aiArenaGateway";

const ACCENT = "#dc2626";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function clanColor(clan?: string): string {
  const c = (clan ?? "").toUpperCase();
  if (c === "ZEROG")  return "#00e68a";
  if (c === "BASE")   return "#0052ff";
  if (c === "SOLANA") return "#9945ff";
  if (c === "OKX")    return "#e0a528";
  return "#8b6dff";
}

// ─────────────────────────────────────────────────────────────────────────────
// BotCard — agent portrait + stats
// ──────────────────────────────────────────────────���──────────────────────────

function BotCard({
  agent,
  botSrc,
  flip,
}: {
  agent: AiArenaAgent | null;
  botSrc: string;
  flip?: boolean;
}) {
  const color = agent ? clanColor(agent.clan) : "#8b6dff";
  return (
    <div className={`flex flex-1 flex-col items-center justify-end gap-0 ${flip ? "scale-x-[-1]" : ""}`}
      style={{ background: flip
        ? "linear-gradient(to left, rgba(8,2,2,0.75) 0%, transparent 100%)"
        : "linear-gradient(to right, rgba(8,2,2,0.75) 0%, transparent 100%)"
      }}
    >
      {/* Agent name + archetype (un-flip the text so it reads correctly) */}
      <div className={`text-center mb-2 px-4 ${flip ? "scale-x-[-1]" : ""}`}>
        {agent ? (
          <>
            <div className="font-display text-xl font-black text-white uppercase tracking-wide drop-shadow-lg sm:text-2xl">
              {agent.name}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1.5">
              <span className="font-tech text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                {agent.archetype}
              </span>
              <span className="font-mono text-[10px] text-white/40">
                {agent.eloRating} ELO
              </span>
            </div>
            {agent.clan && (
              <span className="font-tech text-[9px] uppercase tracking-wider mt-0.5 block" style={{ color }}>
                {agent.clan}
              </span>
            )}
          </>
        ) : (
          <>
            <div className="h-5 w-32 animate-pulse rounded bg-white/10 mx-auto mb-1" />
            <div className="h-3 w-20 animate-pulse rounded bg-white/6 mx-auto" />
          </>
        )}
      </div>
      <img
        src={botSrc}
        alt={agent?.name ?? "Bot"}
        className="object-contain object-bottom drop-shadow-2xl"
        style={{ maxHeight: "52%", width: "auto" }}
        draggable={false}
      />
    </div>
  );
}

// ──────────���──────────────────────────────────────────────────────────────────
// LauncherPreMatchView
// ──────────────────────────────────────────────────────���──────────────────────

export function LauncherPreMatchView({
  myAgent,
  opponent,
  mode,
  onLaunch,
  isLaunching,
}: {
  myAgent: AiArenaAgent | null;
  opponent: AiArenaAgent | null;
  mode: string;
  onLaunch: () => void;
  isLaunching: boolean;
}) {
  const hasDownloadUrl = Boolean(LAUNCHER_DOWNLOAD_URL);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" style={{ background: "#080202" }}>

      {/* Background */}
      <img
        src="/Robowar/bg.png"
        alt="Robowar arena"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: 0.75 }}
        draggable={false}
      />
      <div className="absolute inset-0" style={{ background: "rgba(8,2,2,0.70)" }} />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">

        {/* Header bar */}
        <div
          className="flex shrink-0 items-center justify-between px-5 py-2.5"
          style={{ background: "rgba(8,2,2,0.85)", borderBottom: `1.5px solid ${ACCENT}` }}
        >
          <div className="flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5" style={{ color: ACCENT }} />
            <span className="font-tech text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: ACCENT }}>
              Robowar · {mode}
            </span>
          </div>
          <div className="font-display text-sm font-black text-white tracking-widest uppercase">
            The Crush Pit
          </div>
          {/* Unreal Engine badge */}
          <div
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5"
            style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
            <span className="font-tech text-[9px] uppercase tracking-wider text-white/60">
              Unreal Engine
            </span>
          </div>
        </div>

        {/* Fighter panels */}
        <div className="flex flex-1 min-h-0 items-stretch">
          <BotCard agent={myAgent} botSrc="/Robowar/bot1.png" />

          {/* Centre column */}
          <div className="flex shrink-0 flex-col items-center justify-center px-4 gap-2.5">
            <div
              className="font-display text-4xl font-black sm:text-5xl"
              style={{
                color: "#fff",
                textShadow: `0 0 40px ${ACCENT}, 0 0 80px ${ACCENT}80`,
                WebkitTextStroke: `2px ${ACCENT}`,
              }}
            >
              VS
            </div>
          </div>

          <BotCard agent={opponent} botSrc="/Robowar/bot2.png" flip />
        </div>

        {/* Footer — description + action buttons */}
        <div
          className="shrink-0 flex flex-col items-center gap-3 px-5 py-4"
          style={{ background: "rgba(4,2,2,0.92)", borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Description */}
          <p className="font-mono text-[11px] text-center text-white/55 leading-relaxed max-w-md">
            RoboWars is powered by{" "}
            <span className="text-white font-bold">Unreal Engine</span> and runs via the
            {" "}<span className="font-bold" style={{ color: ACCENT }}>AI Arena Launcher</span>.
            Click <span className="text-white font-bold">Launch RoboWars</span> to start — the launcher
            handles the match while this page tracks results live.
          </p>

          {/* Buttons row */}
          <div className="flex items-center gap-3 flex-wrap justify-center">

            {/* Download button (only shown when URL is configured) */}
            {hasDownloadUrl && (
              <a
                href={LAUNCHER_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-4 py-2.5 font-tech text-[10px] uppercase tracking-wider text-white/65 hover:bg-white/12 hover:text-white hover:border-white/25 transition"
              >
                <Download className="h-3.5 w-3.5 shrink-0" />
                Download Launcher
              </a>
            )}

            {/* Launch button */}
            <button
              type="button"
              onClick={onLaunch}
              disabled={isLaunching}
              className="flex items-center gap-2 rounded-xl border px-5 py-2.5 font-tech text-[11px] uppercase tracking-wider font-bold transition disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                borderColor: `${ACCENT}80`,
                background: `${ACCENT}22`,
                color: "#fff",
                boxShadow: `0 0 18px ${ACCENT}30`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = `${ACCENT}40`;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 28px ${ACCENT}55`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = `${ACCENT}22`;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 18px ${ACCENT}30`;
              }}
            >
              <Rocket className="h-4 w-4 shrink-0" />
              {isLaunching ? "Opening launcher…" : "Launch RoboWars"}
            </button>

          </div>

          {/* First-time install hint */}
          {hasDownloadUrl && (
            <p className="font-mono text-[9px] text-white/25 text-center">
              First time?{" "}
              <a
                href={LAUNCHER_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-white/40 hover:text-white/70 transition underline underline-offset-2"
              >
                Download the AI Arena Launcher
                <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
              </a>{" "}
              then click Launch RoboWars.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
