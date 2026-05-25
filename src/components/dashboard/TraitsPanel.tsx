import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import type { AiArenaAgent } from "@/types/aiArenaGateway";

type TraitsPanelProps = {
  agent: AiArenaAgent | null;
};

const CENTER = { x: 125, y: 104 };
const OUTER_POINTS = [
  { x: 125, y: 18 },
  { x: 180, y: 42 },
  { x: 216, y: 96 },
  { x: 194, y: 158 },
  { x: 125, y: 190 },
  { x: 56, y: 158 },
  { x: 34, y: 96 },
  { x: 70, y: 42 },
] as const;

const TRAIT_SLOTS = [
  { key: "aggression", label: "Aggression" },
  { key: "patience", label: "Patience" },
  { key: "adaptability", label: "Adaptability" },
  { key: "resilience", label: "Resilience" },
  { key: "creativity", label: "Creativity" },
  { key: "loyalty", label: "Loyalty" },
  { key: "deception", label: "Deception" },
  { key: "precision", label: "Precision", fallbackKey: "intelligence", fallbackLabel: "Intelligence" },
] as const;

const traitPositions = [
  "left-[112px] top-0 text-center",
  "right-1 top-10 text-right",
  "right-0 top-[92px] text-right",
  "right-8 bottom-6 text-right",
  "left-[105px] bottom-0 text-center",
  "left-8 bottom-6",
  "left-0 top-[92px]",
  "left-4 top-10",
];

function clampTraitValue(value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function normalizeTraits(traits: AiArenaAgent["traits"]) {
  const raw = traits && typeof traits === "object" ? (traits as Record<string, unknown>) : {};
  return TRAIT_SLOTS.map((slot) => {
    const primary = raw[slot.key];
    if (primary != null) {
      return { name: slot.label, value: clampTraitValue(primary) };
    }
    if (slot.fallbackKey) {
      const fallback = raw[slot.fallbackKey];
      if (fallback != null) {
        return { name: slot.fallbackLabel ?? slot.label, value: clampTraitValue(fallback) };
      }
    }
    return { name: slot.label, value: 0 };
  });
}

function scalePoint(point: (typeof OUTER_POINTS)[number], value: number) {
  const ratio = value / 100;
  return {
    x: CENTER.x + (point.x - CENTER.x) * ratio,
    y: CENTER.y + (point.y - CENTER.y) * ratio,
  };
}

function pointsToString(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

export function TraitsPanel({ agent }: TraitsPanelProps) {
  const agentQ = useQuery({
    queryKey: ["aiArenaGateway", "dashboard", "agentTraits", agent?.id],
    queryFn: () => aiArenaGatewayApi.getAgentById(agent!.id),
    enabled: !!agent?.id,
    staleTime: 20_000,
    retry: false,
  });

  const sourceAgent = agentQ.data ?? agent;
  const traits = useMemo(() => normalizeTraits(sourceAgent?.traits), [sourceAgent?.traits]);
  const profilePolygon = useMemo(
    () => pointsToString(OUTER_POINTS.map((point, index) => scalePoint(point, traits[index]?.value ?? 0))),
    [traits]
  );

  return (
    <section className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#04080f]/60 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 hover:border-[#8531ff]/30 hover:shadow-[0_8px_40px_rgba(133,49,255,0.15)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-tech text-xs font-bold uppercase tracking-wider text-white drop-shadow-sm">Traits Overview</h3>
          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/35">
            {sourceAgent ? sourceAgent.name : "No agent selected"}
          </p>
        </div>
        {agentQ.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-white/35" /> : null}
      </div>

      {!sourceAgent ? (
        <div className="mt-5 rounded-lg border border-white/8 bg-[#0a0f1b]/50 px-4 py-5 text-sm text-white/45">
          Select an agent to view its trait profile.
        </div>
      ) : (
        <>
      <div className="mt-5 grid place-items-center">
        <div className="relative h-[210px] w-full max-w-[260px]">
          <svg viewBox="-20 -20 290 250" className="h-full w-full drop-shadow-[0_0_15px_rgba(133,49,255,0.5)]">
            <polygon
              points="125,18 180,42 216,96 194,158 125,190 56,158 34,96 70,42"
              fill="rgba(123,37,255,.24)"
              stroke="#8531ff"
            />
            <polygon
              points="125,44 164,58 186,96 174,142 125,164 76,142 64,96 86,58"
              fill="rgba(141,41,255,.34)"
              stroke="#b13fff"
              strokeWidth="2"
            />
            {[0, 1, 2].map((i) => (
              <polygon
                key={i}
                points="125,18 180,42 216,96 194,158 125,190 56,158 34,96 70,42"
                fill="none"
                stroke="rgba(255,255,255,.12)"
                transform={`translate(${i * 0.3} ${i * 0.3}) scale(${1 - i * 0.18})`}
                style={{ transformOrigin: "125px 104px" }}
              />
            ))}
            {OUTER_POINTS.map((point, index) => (
              <line
                key={`axis-${traits[index]?.name ?? index}`}
                x1={CENTER.x}
                y1={CENTER.y}
                x2={point.x}
                y2={point.y}
                stroke="rgba(255,255,255,.08)"
              />
            ))}
            <polygon
              points={profilePolygon}
              fill="rgba(175,78,255,.22)"
              stroke="#d4a0ff"
              strokeWidth="2"
            />
          </svg>
          {traits.map((trait, i) => (
            <div key={trait.name} className={`absolute text-[10px] text-white/70 ${traitPositions[i]} whitespace-nowrap`}>
              <div>{trait.name}</div>
              <strong className="font-tech text-[#c896ff] drop-shadow-[0_0_5px_rgba(200,150,255,0.6)]">{trait.value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-8 text-xs text-white/58">
        <span className="flex items-center gap-2 drop-shadow-sm">
          <span className="h-1 w-6 rounded-full bg-[#a833ff] shadow-[0_0_5px_#a833ff]" /> Selected agent
        </span>
        <span className="flex items-center gap-2 drop-shadow-sm">
          <span className="h-px w-6 border-t border-white/20" /> Live trait data
        </span>
      </div>
      {agentQ.isError ? (
        <div className="mt-3 text-center text-xs text-white/40">
          Showing cached trait data for this agent.
        </div>
      ) : null}
        </>
      )}
    </section>
  );
}
