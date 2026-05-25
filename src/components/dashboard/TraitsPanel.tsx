import type { AiArenaAgent } from "@/types/aiArenaGateway";

type TraitsPanelProps = {
  agent: AiArenaAgent | null;
};

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
      return { label: slot.label, value: clampTraitValue(primary) };
    }

    if (slot.fallbackKey) {
      const fallback = raw[slot.fallbackKey];
      if (fallback != null) {
        return {
          label: slot.fallbackLabel ?? slot.label,
          value: clampTraitValue(fallback),
        };
      }
    }

    return { label: slot.label, value: 0 };
  });
}

type TraitCardProps = {
  label: string;
  value: number;
};

function TraitCard({ label, value }: TraitCardProps) {
  return (
    <div className="rounded-md border border-white/8 bg-[#0a0f1b]/60 px-4 py-4 shadow-[inset_0_0_18px_rgba(255,255,255,0.02)]">
      <div className="font-tech text-[10px] uppercase tracking-[0.18em] text-white/42">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

export function TraitsPanel({ agent }: TraitsPanelProps) {
  const traits = normalizeTraits(agent?.traits);

  return (
    <section className="arena-panel overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col gap-2 border-b border-white/8 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-tech text-xs uppercase tracking-wider text-white">Selected Agent Traits</h3>
          <p className="mt-1 text-sm text-white/48">
            Live trait values from your selected AI Arena agent.
          </p>
        </div>
        <div className="font-tech text-[10px] uppercase tracking-[0.18em] text-white/35">
          {agent ? agent.name : "No agent selected"}
        </div>
      </div>

      {!agent ? (
        <div className="mt-4 rounded-md border border-white/8 bg-[#0a0f1b]/50 px-4 py-6 text-center text-sm text-white/45">
          Select or create an agent to view its trait profile here.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
          {traits.map((trait) => (
            <TraitCard key={trait.label} label={trait.label} value={trait.value} />
          ))}
        </div>
      )}
    </section>
  );
}
