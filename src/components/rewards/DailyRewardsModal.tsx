import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Check, Gift, Lock, X } from "lucide-react";
import { ArenaAgentMedia } from "@/components/league/ArenaAgentMedia";
import finalRewardChest from "@/assets/icon-earn.png";
import { useCreateAgent } from "@/contexts/CreateAgentContext";
import {
  DAILY_REWARDS,
  RARITY_STYLES,
  TOTAL_REWARD_DAYS,
  getRewardDef,
  type DailyRewardDef,
  type RewardRarity,
} from "@/constants/dailyRewards";
import { useDailyRewards } from "@/hooks/useDailyRewards";
import { hasArenaAgent } from "@/hooks/useMyArenaAgents";

const CELEBRATION_COLORS = ["#fbbf24", "#c084fc", "#22d3ee", "#f472b6", "#34d399", "#fb7185", "#facc15"];

/** 14 confetti particles fired from the emoji on claim. */
const BURST_PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const dist = 70 + (i % 3) * 34;
  return {
    rx: `${Math.round(Math.cos(angle) * dist)}px`,
    ry: `${Math.round(Math.sin(angle) * dist)}px`,
    delay: `${(i % 4) * 45}ms`,
    hue: CELEBRATION_COLORS[i % 5],
  };
});

/** Firecracker burst origins across the modal (staggered like a volley). */
const FIREWORK_BURSTS = [
  { x: "16%", y: "24%", delay: "60ms", scale: 1 },
  { x: "80%", y: "18%", delay: "280ms", scale: 1.15 },
  { x: "62%", y: "58%", delay: "500ms", scale: 0.85 },
  { x: "30%", y: "68%", delay: "700ms", scale: 1 },
];

type ConfettiPiece = {
  left: string;
  delay: string;
  duration: string;
  sway: string;
  spin: string;
  color: string;
  width: number;
  height: number;
  round: boolean;
};

function makeConfetti(count = 44): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    left: `${(Math.random() * 100).toFixed(1)}%`,
    delay: `${Math.round(Math.random() * 550)}ms`,
    duration: `${(1.7 + Math.random() * 1.2).toFixed(2)}s`,
    sway: `${Math.round(Math.random() * 180 - 90)}px`,
    spin: `${Math.round(420 + Math.random() * 640)}deg`,
    color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length],
    width: 5 + Math.round(Math.random() * 4),
    height: 9 + Math.round(Math.random() * 6),
    round: Math.random() < 0.3,
  }));
}

function formatCountdown(nextUnlockAt: string | null, now: number): string {
  if (!nextUnlockAt) return "";
  const ms = Date.parse(nextUnlockAt) - now;
  if (!Number.isFinite(ms) || ms <= 0) return "any moment";
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.ceil((ms % 3_600_000) / 60_000);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/** Rarity-driven CLAIM button gradient (gold for legendary, like the design). */
function claimGradient(rarity: RewardRarity): { background: string; color: string; glow: string } {
  if (rarity === "LEGENDARY") return { background: "linear-gradient(120deg, #f59e0b, #fbbf24)", color: "#1a1203", glow: "rgba(251,191,36,0.45)" };
  if (rarity === "RARE") return { background: "linear-gradient(120deg, #3b82f6, #8b5cf6)", color: "#fff", glow: "rgba(99,102,241,0.45)" };
  return { background: "linear-gradient(120deg, #8b5cf6, #c026d3)", color: "#fff", glow: "rgba(168,85,247,0.45)" };
}

function rewardMediaProps(reward: DailyRewardDef) {
  const isVideo = reward.img?.endsWith(".mp4") ?? false;
  const fit = reward.imgFit ?? (isVideo ? "cover" : "contain");
  const position = reward.imgPosition ?? (isVideo || fit === "cover" ? "top" : "center");
  const layout: "fill" | "intrinsic" = fit === "contain" && !isVideo ? "intrinsic" : "fill";
  return { fit, position, layout };
}

type DayStatus = "claimed" | "today" | "locked";

/** One vertical reward card in the track grid — neon rarity frame, ring
 *  medallion, per-card CLAIM state. */
function RewardCard({
  reward,
  status,
  canClaim,
  isClaiming,
  onClaim,
}: {
  reward: DailyRewardDef;
  status: DayStatus;
  canClaim: boolean;
  isClaiming: boolean;
  onClaim: () => void;
}) {
  const rarity = RARITY_STYLES[reward.rarity];
  const cta = claimGradient(reward.rarity);
  const isToday = status === "today";
  const isClaimed = status === "claimed";

  return (
    <div
      className={`relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border p-3 text-center transition duration-300 ${
        isToday ? "z-10 scale-[1.03]" : "hover:-translate-y-0.5"
      }`}
      style={{
        borderColor: `${rarity.hex}${isToday ? "aa" : isClaimed ? "77" : "40"}`,
        background: `radial-gradient(circle at 50% 0%, ${rarity.hex}14, transparent 58%), linear-gradient(180deg, rgba(255,255,255,0.03), transparent 40%), #07060e`,
        boxShadow: isToday
          ? `0 0 26px ${rarity.hex}45, inset 0 0 22px ${rarity.hex}14`
          : `0 0 14px ${rarity.hex}1c`,
      }}
    >
      {isToday ? (
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-[reward-shine_2.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      ) : null}

      <p className="font-tech text-[11px] font-black uppercase tracking-[0.24em] text-white">Day {reward.day}</p>

      <span
        className="rounded-full border px-2.5 py-0.5 font-tech text-[8px] font-black uppercase tracking-[0.18em]"
        style={{
          borderColor: `${reward.accentHex}75`,
          color: reward.accentHex,
          background: `linear-gradient(120deg, ${reward.accentHex}20, ${reward.accentHex}08)`,
          boxShadow: `0 0 10px ${reward.accentHex}30`,
          textShadow: `0 0 8px ${reward.accentHex}60`,
        }}
      >
        {reward.tag}
      </span>

      {/* Artwork — flex-centered so wide/portrait assets stay aligned on every breakpoint */}
      <span
        className={`relative my-1 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/35 p-1.5 sm:h-[72px] sm:w-[72px] sm:p-2 ${
          reward.img && isToday ? "animate-[reward-float_3.6s_ease-in-out_infinite]" : ""
        }`}
        style={reward.img ? { boxShadow: `0 0 18px ${rarity.hex}${isToday ? "55" : "38"}` } : undefined}
        aria-hidden
      >
        {reward.img ? (
          <ArenaAgentMedia src={reward.img} alt="" {...rewardMediaProps(reward)} />
        ) : (
          <span
            className={`text-4xl leading-none sm:text-5xl ${
              isToday ? "animate-[reward-float_3.6s_ease-in-out_infinite]" : ""
            }`}
            style={{ filter: `drop-shadow(0 0 12px ${rarity.hex}${isToday ? "70" : "50"})` }}
          >
            {reward.emoji}
          </span>
        )}
      </span>

      <p className="min-h-8 w-full font-tech text-[11px] font-bold leading-snug text-white [text-wrap:balance]">
        {reward.title}
      </p>

      {/* CTA */}
      {isClaimed ? (
        <span
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border px-2 py-2 font-tech text-[10px] font-black uppercase tracking-[0.2em]"
          style={{ borderColor: `${rarity.hex}70`, color: rarity.hex, background: `${rarity.hex}12` }}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> Claimed
        </span>
      ) : (
        <button
          type="button"
          disabled={!canClaim || isClaiming}
          onClick={onClaim}
          className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-tech text-[10px] font-black uppercase tracking-[0.2em] transition ${
            canClaim ? "hover:scale-[1.03] active:scale-95" : "cursor-not-allowed opacity-70"
          }`}
          style={{ background: cta.background, color: cta.color, boxShadow: canClaim ? `0 0 18px ${cta.glow}` : `0 0 10px ${cta.glow}` }}
        >
          {canClaim ? <Gift className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          {isClaiming && canClaim ? "Claiming…" : "Claim"}
        </button>
      )}
    </div>
  );
}

function rewardRedirectPath(day: number): string | "create-agent" | null {
  switch (day) {
    case 10:
      return "create-agent";
    case 2:
    case 5:
      return "/training";
    case 4:
      return "/inventory";
    case 9:
      return "/autonomous";
    default:
      return null;
  }
}

export function DailyRewardsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { openCreateAgent, subscribeAgentCreated } = useCreateAgent();
  const { state, hasGenesisAgent, isLoading, claim, isClaiming, refetch, refetchAgents } = useDailyRewards();
  const [justClaimedDay, setJustClaimedDay] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const pendingDay1ClaimRef = useRef(false);

  // Refresh reward + agent state when the modal opens.
  useEffect(() => {
    if (!open) return;
    void refetch();
    void refetchAgents();
  }, [open, refetch, refetchAgents]);

  // After creating a Genesis agent from the day-1 flow, record day 1 in the backend.
  useEffect(() => {
    return subscribeAgentCreated(() => {
      if (!pendingDay1ClaimRef.current) return;
      pendingDay1ClaimRef.current = false;
      void (async () => {
        try {
          const result = await claim({ legacyDay1: false });
          setJustClaimedDay(result.claimedDay);
        } catch {
          /* user can retry from the rewards modal */
        }
      })();
    });
  }, [claim, subscribeAgentCreated]);

  // Tick the countdown while the modal is open.
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setJustClaimedDay(null);
      pendingDay1ClaimRef.current = false;
    }
  }, [open]);

  const currentDay = state?.currentDay ?? 1;
  const claimedDays = useMemo(() => new Set(state?.claimedDays ?? []), [state?.claimedDays]);
  const userHasAgent = hasGenesisAgent || claimedDays.has(1);
  const claimedCount = claimedDays.size;
  const completed = state?.completed ?? false;
  const claimableNow = state?.claimableToday ?? false;
  const claimable = claimableNow && !isClaiming && !isLoading;
  const lastClaimedDay = claimedCount > 0 ? Math.max(...(state?.claimedDays ?? [])) : 0;

  // Featured card shows TODAY's reward: the claimable one, or — while waiting
  // for the next unlock — the reward just claimed (in its claimed state).
  const featuredDay = completed || (!claimableNow && lastClaimedDay > 0) ? lastClaimedDay : currentDay;
  const featured = getRewardDef(featuredDay);
  const rarity = RARITY_STYLES[featured.rarity];
  const featuredClaimed = claimedDays.has(featured.day);
  const featuredCta = claimGradient(featured.rarity);

  // Fresh confetti layout for every claim.
  const confetti = useMemo(() => (justClaimedDay ? makeConfetti() : []), [justClaimedDay]);

  const handleClaim = async () => {
    if (!claimable) return;
    const dayToClaim = currentDay;

    if (dayToClaim === 1 && !userHasAgent) {
      const result = await refetchAgents();
      if (!hasArenaAgent(result.data)) {
        pendingDay1ClaimRef.current = true;
        onClose();
        navigate("/my-agents");
        window.setTimeout(() => openCreateAgent(), 150);
        return;
      }
    }

    const result = await claim();
    setJustClaimedDay(result.claimedDay);

    const redirect = rewardRedirectPath(result.claimedDay);
    if (redirect) {
      onClose();
      if (redirect === "create-agent") {
        navigate("/my-agents");
        window.setTimeout(() => openCreateAgent(), 150);
      } else {
        navigate(redirect);
      }
    }
  };

  const dayStatus = (day: number): DayStatus =>
    claimedDays.has(day) ? "claimed" : day === currentDay && !completed ? "today" : "locked";

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Daily login rewards"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[calc(100dvh-32px)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#a855f7]/35 bg-[#05040c] shadow-[0_32px_110px_rgba(0,0,0,0.85)]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Ambient glows */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% -6%, rgba(124,58,237,0.28), transparent 34%), radial-gradient(circle at 12% 30%, ${featured.accentHex}14, transparent 34%), radial-gradient(circle at 90% 20%, rgba(34,211,238,0.09), transparent 34%)`,
          }}
        />

        {/* Firecracker celebration — fires once per claim, then self-hides */}
        {justClaimedDay ? (
          <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
            {confetti.map((piece, i) => (
              <span
                key={`c-${justClaimedDay}-${i}`}
                className="absolute -top-4"
                style={{
                  left: piece.left,
                  width: piece.width,
                  height: piece.round ? piece.width : piece.height,
                  borderRadius: piece.round ? "9999px" : "2px",
                  background: piece.color,
                  boxShadow: `0 0 6px ${piece.color}80`,
                  animation: `reward-confetti-fall ${piece.duration} cubic-bezier(0.3,0.5,0.5,1) ${piece.delay} both`,
                  ["--sway" as string]: piece.sway,
                  ["--spin" as string]: piece.spin,
                }}
              />
            ))}
            {FIREWORK_BURSTS.map((burst, bi) => (
              <span key={`f-${justClaimedDay}-${bi}`} className="absolute" style={{ left: burst.x, top: burst.y }}>
                <span
                  className="absolute -left-6 -top-6 h-12 w-12 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${CELEBRATION_COLORS[bi % CELEBRATION_COLORS.length]}70, transparent 65%)`,
                    animation: `reward-flash 0.8s ease-out ${burst.delay} both`,
                  }}
                />
                {BURST_PARTICLES.map((p, i) => (
                  <span
                    key={i}
                    className="absolute h-1.5 w-1.5 rounded-full"
                    style={{
                      background: p.hue,
                      boxShadow: `0 0 8px ${p.hue}`,
                      animation: `reward-burst-particle 1s ease-out ${burst.delay} both`,
                      ["--rx" as string]: `${Math.round(parseInt(p.rx, 10) * burst.scale)}px`,
                      ["--ry" as string]: `${Math.round(parseInt(p.ry, 10) * burst.scale)}px`,
                    }}
                  />
                ))}
              </span>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close rewards"
          className="absolute right-3.5 top-3.5 z-20 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/50 text-white/70 transition hover:border-white/40 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative z-10 overflow-y-auto p-4 sm:p-6 [scrollbar-color:rgba(192,132,252,0.4)_transparent] [scrollbar-width:thin]">
          {/* Header — centered like the design */}
          <div className="flex flex-col items-center text-center">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-[#38bdf8]/45 bg-[#38bdf8]/12 text-lg" aria-hidden>
              🎁
            </span>
            <h2
              className="mt-2 font-tech text-3xl font-black italic uppercase tracking-[0.06em] sm:text-4xl"
              style={{
                background: "linear-gradient(180deg, #ffffff 25%, #cdd6ff 55%, #9aa8ff 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 4px 18px rgba(124,58,237,0.5))",
              }}
            >
              Daily Rewards
            </h2>
            <p className="mt-1 text-xs text-white/60 sm:text-sm">Login every day to unlock exclusive loot and bonuses.</p>
          </div>

          {/* Day stepper */}
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
            <p className="shrink-0 font-tech text-base font-black uppercase tracking-[0.2em] text-white">
              Day <span className="text-amber-400">{Math.min(currentDay, TOTAL_REWARD_DAYS)}</span>{" "}
              <span className="text-white/35">/ {TOTAL_REWARD_DAYS}</span>
            </p>

            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <div className="flex min-w-0 flex-1 items-center">
                {DAILY_REWARDS.map((reward, index) => {
                  const status = dayStatus(reward.day);
                  // The trail you've already walked glows gold.
                  const litConnector = claimedDays.has(reward.day - 1);
                  return (
                    <Fragment key={reward.day}>
                      {index > 0 ? (
                        <span
                          className={`h-[2px] min-w-[3px] flex-1 rounded-full ${
                            litConnector ? "bg-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "bg-white/12"
                          }`}
                          aria-hidden
                        />
                      ) : null}
                      {status === "claimed" ? (
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-amber-400 bg-amber-400/10 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)] sm:h-7 sm:w-7">
                          <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3.5} />
                        </span>
                      ) : status === "today" ? (
                        <span
                          className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-[#c084fc]/70 bg-[#12081f] shadow-[0_0_16px_rgba(168,85,247,0.8)] sm:h-7 sm:w-7"
                          aria-label={`Day ${reward.day} — today`}
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-[#a855f7] shadow-[0_0_8px_rgba(192,132,252,0.9)] sm:h-3.5 sm:w-3.5" />
                        </span>
                      ) : (
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/22 bg-[#0b0d16] font-tech text-[9px] font-bold text-white/55 sm:h-7 sm:w-7 sm:text-[11px]">
                          {reward.day}
                        </span>
                      )}
                    </Fragment>
                  );
                })}
                <span className="hidden h-[2px] w-4 shrink-0 rounded-full bg-white/12 sm:block" aria-hidden />
              </div>

              {/* Final reward chest */}
              <div className="flex shrink-0 flex-col items-center gap-0.5 sm:gap-1">
                <img
                  src={finalRewardChest}
                  alt="Final reward"
                  className="h-8 w-8 rounded-lg object-cover drop-shadow-[0_0_12px_rgba(251,191,36,0.55)] sm:h-12 sm:w-12"
                />
                <span className="font-tech text-[7px] font-black uppercase tracking-[0.14em] text-amber-400 sm:text-[8px] sm:tracking-[0.18em]">
                  Final reward
                </span>
              </div>
            </div>
          </div>

          {/* Featured card */}
          <div
            className="relative mt-5 overflow-hidden rounded-2xl border-2 p-4 sm:p-5"
            style={{
              borderColor: `${featured.accentHex}70`,
              background: `radial-gradient(circle at 50% -20%, ${featured.accentHex}20, transparent 55%), linear-gradient(160deg, rgba(255,255,255,0.045), transparent 45%), #08060f`,
              boxShadow: `0 0 34px ${featured.accentHex}30, inset 0 0 44px ${featured.accentHex}14`,
            }}
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-[reward-shine_3.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
            {/* Faint oversized emoji echo on the right, like the concept art slot */}
            <span
              className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 text-[120px] opacity-[0.12] blur-[1px] md:block"
              aria-hidden
            >
              {featured.emoji}
            </span>

            <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
              {/* Medallion + claim burst */}
              <div className="relative grid h-32 w-32 shrink-0 place-items-center sm:h-36 sm:w-36">
                <span
                  className="absolute inset-0 animate-[reward-ring-spin_9s_linear_infinite] rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0 70%, ${featured.accentHex}90 85%, transparent 100%)`,
                    WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)",
                    mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 0)",
                  }}
                />
                <span
                  className="absolute inset-3 rounded-full border"
                  style={{ borderColor: `${featured.accentHex}35`, background: `radial-gradient(circle, ${featured.accentHex}1c, transparent 75%)` }}
                />
                {featured.img ? (
                  <span
                    key={`${featured.day}-${featuredClaimed}`}
                    className={`absolute inset-4 z-10 flex items-center justify-center overflow-hidden rounded-full bg-black/25 p-2 sm:p-3 ${
                      justClaimedDay
                        ? "animate-[reward-pop_0.6s_cubic-bezier(0.2,1.4,0.4,1)_both]"
                        : "animate-[reward-float_4.5s_ease-in-out_infinite]"
                    }`}
                    aria-hidden
                  >
                    <ArenaAgentMedia src={featured.img} alt="" {...rewardMediaProps(featured)} />
                  </span>
                ) : (
                  <span
                    key={`${featured.day}-${featuredClaimed}`}
                    className={`relative z-10 text-6xl sm:text-7xl ${
                      justClaimedDay
                        ? "animate-[reward-pop_0.6s_cubic-bezier(0.2,1.4,0.4,1)_both]"
                        : "animate-[reward-float_4.5s_ease-in-out_infinite]"
                    }`}
                    aria-hidden
                  >
                    {featured.emoji}
                  </span>
                )}

                {justClaimedDay ? (
                  <>
                    <span
                      className="absolute inset-6 z-0 animate-[reward-flash_0.7s_ease-out_both] rounded-full"
                      style={{ background: `radial-gradient(circle, ${featured.accentHex}70, transparent 65%)` }}
                    />
                    {BURST_PARTICLES.map((p, i) => (
                      <span
                        key={i}
                        className="absolute left-1/2 top-1/2 z-20 h-2 w-2 animate-[reward-burst-particle_0.9s_ease-out_both] rounded-full"
                        style={{
                          background: p.hue,
                          boxShadow: `0 0 8px ${p.hue}`,
                          animationDelay: p.delay,
                          ["--rx" as string]: p.rx,
                          ["--ry" as string]: p.ry,
                        }}
                      />
                    ))}
                  </>
                ) : null}
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                  <span
                    className="rounded-full border px-2.5 py-0.5 font-tech text-[9px] font-black uppercase tracking-[0.2em]"
                    style={{ borderColor: "#38bdf870", color: "#7dd3fc", background: "#38bdf815" }}
                  >
                    Day {featured.day}
                  </span>
                  <span
                    className="rounded-full border px-2.5 py-0.5 font-tech text-[9px] font-black uppercase tracking-[0.2em]"
                    style={{ borderColor: `${rarity.hex}70`, color: rarity.hex, background: `${rarity.hex}15` }}
                  >
                    {rarity.label}
                  </span>
                  <span className="rounded-full border border-white/14 bg-white/[0.04] px-2.5 py-0.5 font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">
                    {featured.tag}
                  </span>
                </div>

                <h3 className="mt-2.5 font-tech text-xl font-black leading-tight text-white sm:text-2xl">{featured.title}</h3>
                <p className="mt-1.5 max-w-md text-xs leading-relaxed text-white/65 sm:text-[13px]">{featured.blurb}</p>

                <div className="mt-4">
                  {completed ? (
                    <span className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-5 py-3 font-tech text-xs font-black uppercase tracking-[0.16em] text-amber-300">
                      🏆 All {TOTAL_REWARD_DAYS} rewards claimed
                    </span>
                  ) : featuredClaimed ? (
                    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/45 bg-emerald-400/12 px-5 py-3 font-tech text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                        <Check className="h-4 w-4" strokeWidth={3} /> Claimed
                      </span>
                      {state?.nextUnlockAt ? (
                        <span className="font-tech text-[10px] uppercase tracking-widest text-white/45">
                          Next reward in {formatCountdown(state.nextUnlockAt, now)}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleClaim()}
                      disabled={!claimable}
                      className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl px-9 py-3.5 font-tech text-sm font-black uppercase tracking-[0.2em] transition hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-55"
                      style={{ background: featuredCta.background, color: featuredCta.color, boxShadow: `0 0 30px ${featuredCta.glow}` }}
                    >
                      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-[reward-cta-sheen_2.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent" />
                      <Gift className="h-4 w-4" />
                      {isClaiming ? "Claiming…" : "Claim reward"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reward track grid */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {DAILY_REWARDS.map((reward) => {
              const status = dayStatus(reward.day);
              return (
                <RewardCard
                  key={reward.day}
                  reward={reward}
                  status={status}
                  canClaim={status === "today" && claimable}
                  isClaiming={isClaiming}
                  onClaim={() => void handleClaim()}
                />
              );
            })}
          </div>

          {/* Footer strip */}
          <div className="mt-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#a855f7]/35 bg-[#a855f7]/[0.07] px-4 py-2 font-tech text-[10px] font-bold uppercase tracking-[0.16em] text-[#d8b4fe]">
              <CalendarDays className="h-3.5 w-3.5" />
              {completed
                ? "Season complete — all rewards banked"
                : !claimableNow && state?.nextUnlockAt
                  ? `Next reward unlocks in ${formatCountdown(state.nextUnlockAt, now)}`
                  : "Don't miss a day — a new reward unlocks every 24h"}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
