import { useEffect, useRef, useState } from "react";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import {
  AI_ARENA_ARCHETYPE_OPTIONS,
  AI_ARENA_CLAN_OPTIONS,
  randomAiArenaArchetype,
} from "@/constants/aiArenaAgent";
import { getArchetypeCardByType } from "@/constants/arenaAgentArchetypes";
import type { AiArenaAgent } from "@/types/aiArenaGateway";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog } from "@/components/ui/dialog";
import {
  ArenaDialogBody,
  ArenaDialogContent,
  ArenaDialogDescription,
  ArenaDialogFooter,
  ArenaDialogHeader,
  ArenaDialogTitle,
} from "@/components/ui/arena-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import zeroGLogo from "@/assets/0G Logo.png";
import baseLogo from "@/assets/Base Logo.png";
import solanaLogo from "@/assets/solana-sol-logo.png";
import okxLogo from "@/assets/OKX_crypto-logo-okb-png_2.png";

const CLAN_LOGOS: Record<string, string> = {
  ZEROG: zeroGLogo,
  BASE: baseLogo,
  SOLANA: solanaLogo,
  OKX: okxLogo,
};

export type CreateAiArenaAgentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName?: string;
  defaultArchetype?: (typeof AI_ARENA_ARCHETYPE_OPTIONS)[number];
  onCreated?: (agent: AiArenaAgent) => void | Promise<void>;
};

export function CreateAiArenaAgentModal({
  open,
  onOpenChange,
  defaultName = "",
  defaultArchetype,
  onCreated,
}: CreateAiArenaAgentModalProps) {
  const { walletAddress } = useAuth();
  const [name, setName] = useState(defaultName);
  const [clan, setClan] = useState<(typeof AI_ARENA_CLAN_OPTIONS)[number]["value"]>("ZEROG");
  const [archetype, setArchetype] = useState<(typeof AI_ARENA_ARCHETYPE_OPTIONS)[number]>(() =>
    randomAiArenaArchetype()
  );
  const [backstory, setBackstory] = useState(
    "Built for smart plays, sharp banter, and a long climb up the arena ladder."
  );
  const [submitting, setSubmitting] = useState(false);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    setName((n) => (n.trim() ? n : defaultName));

    if (!wasOpenRef.current) {
      wasOpenRef.current = true;
      setArchetype(defaultArchetype ?? randomAiArenaArchetype());
      return;
    }

    if (defaultArchetype) {
      setArchetype(defaultArchetype);
    }
  }, [open, defaultName, defaultArchetype]);

  const selectedCard = getArchetypeCardByType(archetype);

  const handleSubmit = async () => {
    if (!walletAddress) {
      return;
    }
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return;
    }
    if (backstory.trim().length < 8) {
      return;
    }
    setSubmitting(true);
    try {
      const agent = await aiArenaGatewayApi.createAgent({
        name: trimmed,
        clan,
        archetype,
        backstory: backstory.trim(),
      });
      await onCreated?.(agent);
      onOpenChange(false);
    } catch (e) {
      console.error("Failed to create AI Arena agent", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ArenaDialogContent size="md">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_-6%,rgba(154,53,255,0.20),transparent_46%),radial-gradient(circle_at_-4%_104%,rgba(0,137,255,0.16),transparent_46%),radial-gradient(circle_at_50%_120%,rgba(0,240,128,0.06),transparent_40%)]" />
          <div className="absolute inset-0 ai-grid-overlay opacity-[0.05]" />
          <div className="absolute -left-24 top-10 h-56 w-56 rounded-full bg-[#9a35ff]/12 blur-3xl" />
          <div className="absolute -right-20 bottom-8 h-56 w-56 rounded-full bg-[#0089ff]/10 blur-3xl" />
        </div>
        <ArenaDialogHeader>
          <ArenaDialogTitle className="font-display text-xl tracking-tight sm:text-2xl">
            Create <span className="text-gradient-hero">AI Agent</span>
          </ArenaDialogTitle>
          <ArenaDialogDescription className="text-xs text-white/90 sm:text-sm">
            One step creates your arena agent and its custodial hot wallet. Choose clan, archetype, name, and backstory.
          </ArenaDialogDescription>
        </ArenaDialogHeader>

        <ArenaDialogBody className="space-y-4 scrollbar-none">
          {selectedCard ? (
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-br from-[hsl(268_40%_11%/0.9)] to-[hsl(268_32%_6%/0.92)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_0%,rgba(154,53,255,0.20),transparent_55%),radial-gradient(circle_at_0%_100%,rgba(0,137,255,0.12),transparent_50%)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9a35ff]/80 to-transparent" />
              <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5">
                <div className="relative mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-white/12 bg-[hsl(268_32%_6%/0.9)] shadow-[0_0_28px_rgba(154,53,255,0.22)] ring-1 ring-white/[0.06] sm:mx-0 sm:h-28 sm:w-28">
                  {selectedCard.image.endsWith(".mp4") ? (
                    <video
                      src={selectedCard.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <img
                      src={selectedCard.image}
                      alt={`${selectedCard.codename} — ${selectedCard.archetype}`}
                      className="h-full w-full object-cover object-top"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-display text-[9px] tracking-[0.22em] text-white/80">
                    <span className="h-1 w-1 rounded-full bg-[#c084fc] shadow-[0_0_6px_rgba(192,132,252,0.9)]" />
                    SELECTED ARCHETYPE
                  </span>
                  <p className={cn("mt-2 font-display text-xl font-bold tracking-wide", selectedCard.accent)}>
                    {selectedCard.archetype}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/85">{selectedCard.tagline}</p>
                  <div className="mt-2.5 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                    {selectedCard.role.split("·").map((r) => (
                      <span
                        key={r}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-white/80"
                      >
                        {r.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label className="arena-label flex items-center gap-2 text-white"><span className="h-3 w-1 shrink-0 rounded-full bg-gradient-to-b from-[#c084fc] to-[#7f9cff] shadow-[0_0_6px_rgba(192,132,252,0.6)]" />Clan</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {AI_ARENA_CLAN_OPTIONS.filter((c) => c.value !== "OKX").map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setClan(c.value)}
                  className={cn(
                    "arena-chip",
                    clan === c.value
                      ? (c.value as string) === "OKX"
                        ? "border-[#e0a528] bg-gradient-to-br from-[#f7d774]/20 via-[#e0a528]/15 to-[#9a6b12]/10 text-[#f7d774] shadow-[0_0_10px_rgba(224,165,40,0.4)]"
                        : "arena-chip-active-cyan"
                      : "bg-gradient-to-b from-white/[0.06] to-transparent text-white",
                  )}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    {CLAN_LOGOS[c.value] && (
                      <img
                        src={CLAN_LOGOS[c.value]}
                        alt=""
                        aria-hidden
                        className="h-5 w-5 shrink-0 object-contain"
                      />
                    )}
                    <span className="font-display text-[13px] font-bold">{c.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="arena-label flex items-center gap-2 text-white"><span className="h-3 w-1 shrink-0 rounded-full bg-gradient-to-b from-[#c084fc] to-[#7f9cff] shadow-[0_0_6px_rgba(192,132,252,0.6)]" />Archetype</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AI_ARENA_ARCHETYPE_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArchetype(a)}
                  className={cn(
                    "arena-chip font-display text-[10px] font-semibold tracking-wide sm:text-[11px]",
                    archetype === a ? "arena-chip-active-purple" : "bg-gradient-to-b from-white/[0.06] to-transparent text-white"
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="arena-agent-name" className="arena-label flex items-center gap-2 text-white">
              <span className="h-3 w-1 shrink-0 rounded-full bg-gradient-to-b from-[#c084fc] to-[#7f9cff] shadow-[0_0_6px_rgba(192,132,252,0.6)]" />Name
            </Label>
            <input
              id="arena-agent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={48}
              className="arena-input"
              placeholder="NeuralReaper-7"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="arena-agent-backstory" className="arena-label flex items-center gap-2 text-white">
              <span className="h-3 w-1 shrink-0 rounded-full bg-gradient-to-b from-[#c084fc] to-[#7f9cff] shadow-[0_0_6px_rgba(192,132,252,0.6)]" />Backstory
            </Label>
            <Textarea
              id="arena-agent-backstory"
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              rows={4}
              maxLength={2000}
              className="arena-input min-h-[7rem] resize-y py-3"
              placeholder="Born from corrupted validator nodes…"
            />
          </div>
        </ArenaDialogBody>

        <ArenaDialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? "Creating…" : "Create AI Agent"}
          </Button>
        </ArenaDialogFooter>
      </ArenaDialogContent>
    </Dialog>
  );
}
