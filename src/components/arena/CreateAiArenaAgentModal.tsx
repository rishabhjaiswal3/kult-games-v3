import { useEffect, useState } from "react";
import { toast } from "sonner";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { AI_ARENA_ARCHETYPE_OPTIONS, AI_ARENA_CLAN_OPTIONS } from "@/constants/aiArenaAgent";
import type { AiArenaAgent } from "@/types/aiArenaGateway";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type CreateAiArenaAgentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Default agent display name (e.g. Kult player name). */
  defaultName?: string;
  /** Pre-select archetype when opened from the roster showcase. */
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
  const [archetype, setArchetype] = useState<(typeof AI_ARENA_ARCHETYPE_OPTIONS)[number]>("TACTICIAN");
  const [backstory, setBackstory] = useState(
    "Built for smart plays, sharp banter, and a long climb up the arena ladder."
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName((n) => (n.trim() ? n : defaultName));
    if (defaultArchetype) setArchetype(defaultArchetype);
  }, [open, defaultName, defaultArchetype]);

  const handleSubmit = async () => {
    if (!walletAddress) {
      toast.error("Connect a wallet first.");
      return;
    }
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }
    if (backstory.trim().length < 8) {
      toast.error("Backstory should be at least 8 characters.");
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
      toast.success("AI Arena agent created");
      await onCreated?.(agent);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "z-[100] max-h-[min(92vh,720px)] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto border border-neon-purple/30 bg-surface-1/95 p-5 shadow-neon sm:p-6"
        )}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight sm:text-2xl">
            Create <span className="text-gradient-hero">AI Agent</span>
          </DialogTitle>
          <DialogDescription className="text-left text-xs sm:text-sm">
            One step creates your arena agent and its custodial hot wallet. Choose clan, archetype, name, and backstory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label className="arena-label">Clan</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {AI_ARENA_CLAN_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setClan(c.value)}
                  className={cn("arena-chip", clan === c.value && "arena-chip-active-cyan")}
                >
                  <div className="font-display text-[11px] font-bold">{c.label}</div>
                  <div className="text-[9px] opacity-80">{c.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="arena-label">Archetype</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AI_ARENA_ARCHETYPE_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArchetype(a)}
                  className={cn(
                    "arena-chip font-display text-[10px] font-semibold tracking-wide sm:text-[11px]",
                    archetype === a && "arena-chip-active-purple"
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="arena-agent-name" className="arena-label">
              Name
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
            <Label htmlFor="arena-agent-backstory" className="arena-label">
              Backstory
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
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? "Creating…" : "Create AI Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
