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
  onCreated?: (agent: AiArenaAgent) => void | Promise<void>;
};

export function CreateAiArenaAgentModal({
  open,
  onOpenChange,
  defaultName = "",
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
  }, [open, defaultName]);

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
          "z-[100] max-h-[min(92vh,720px)] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto border border-neon-cyan/25 bg-card/95 p-5 shadow-[0_0_80px_hsl(195_100%_55%/0.18)] sm:p-6"
        )}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-tight sm:text-2xl">Create AI Arena agent</DialogTitle>
          <DialogDescription className="text-left text-xs sm:text-sm">
            Pick a clan and archetype, then give your agent a name and backstory. We handle the setup for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label className="text-xs font-display tracking-wider text-muted-foreground">Clan</Label>
            <div className="grid grid-cols-3 gap-2">
              {AI_ARENA_CLAN_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setClan(c.value)}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-center transition",
                    clan === c.value
                      ? "border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan"
                      : "border-border/50 bg-background/50 text-muted-foreground hover:border-neon-cyan/35"
                  )}
                >
                  <div className="font-display text-[11px] font-bold">{c.label}</div>
                  <div className="text-[9px] opacity-80">{c.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-display tracking-wider text-muted-foreground">Archetype</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AI_ARENA_ARCHETYPE_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArchetype(a)}
                  className={cn(
                    "rounded-lg border px-2 py-2 font-display text-[10px] font-semibold tracking-wide transition sm:text-[11px]",
                    archetype === a
                      ? "border-neon-purple/60 bg-neon-purple/15 text-neon-purple"
                      : "border-border/50 bg-background/50 text-muted-foreground hover:border-neon-purple/35"
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="arena-agent-name" className="text-xs">
              Name
            </Label>
            <input
              id="arena-agent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={48}
              className="h-10 w-full rounded-lg border border-border/50 bg-background/80 px-3 text-sm outline-none ring-neon-cyan/25 focus:ring-2"
              placeholder="NeuralReaper-7"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="arena-agent-backstory" className="text-xs">
              Backstory
            </Label>
            <Textarea
              id="arena-agent-backstory"
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              rows={4}
              maxLength={2000}
              className="resize-y text-sm"
              placeholder="Born from corrupted validator nodes…"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? "Creating…" : "Create agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
