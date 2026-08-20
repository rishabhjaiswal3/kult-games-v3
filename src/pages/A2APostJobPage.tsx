/**
 * Post a training job.
 *
 * A prose box and a budget, exactly as specified — no form of dropdowns for
 * the requirements. But the PARSED document is what the escrow settles
 * against, so the interpretation is shown for confirmation before anything
 * goes on-chain. That step is not ceremony: a misread threshold would
 * otherwise become a binding commitment.
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Loader2, Sparkles } from "lucide-react";

import { ArenaPageLayout } from "@/components/arena/ArenaPageLayout";
import { DashboardSignInGate } from "@/components/dashboard/DashboardSignInGate";
import { AgentBaseIdentityCard } from "@/components/marketplace/AgentBaseIdentityCard";
import { AutoBidToggle } from "@/components/marketplace/AutoBidToggle";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { useAuth } from "@/contexts/AuthContext";
import {
  a2aMarketplaceApi,
  type ParsedInterpretation,
  type RequirementPredicate,
} from "@/api/a2aMarketplaceApi";

const EXAMPLE_PROMPT =
  "I want my agent to train for Warzone Warrior and I want at least 70 combat skill. " +
  "The trainer should have at least 90 combat skill and 100+ Warzone wins.";

export default function A2APostJobPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: agentsResult } = useMyArenaAgents();
  const agents = agentsResult?.agents ?? [];

  const [prompt, setPrompt] = useState("");
  const [budgetMin, setBudgetMin] = useState("0.25");
  const [budgetMax, setBudgetMax] = useState("0.50");
  const [agentId, setAgentId] = useState<string>("");
  const [interpretation, setInterpretation] = useState<ParsedInterpretation | null>(null);
  const [draftJobId, setDraftJobId] = useState<string | null>(null);
  const [identityReady, setIdentityReady] = useState(false);

  const selectedAgent = agents.find((a) => a.id === agentId) ?? agents[0];

  const draftMut = useMutation({
    mutationFn: async () => {
      if (!selectedAgent) throw new Error("Select an agent first.");
      return a2aMarketplaceApi.createDraft({
        creatorAgentId: selectedAgent.id,
        prompt,
        budgetMin,
        budgetMax,
      });
    },
    onSuccess: (result) => {
      setInterpretation(result.interpretation);
      setDraftJobId(result.job.id);
    },
  });

  const confirmMut = useMutation({
    mutationFn: async () => {
      if (!draftJobId) throw new Error("No draft to confirm.");
      return a2aMarketplaceApi.confirmJob(draftJobId);
    },
    onSuccess: (result) => navigate(`/marketplace/a2a/jobs/${result.job.id}`),
  });

  if (!isAuthenticated) {
    return (
      <ArenaPageLayout>
        <DashboardSignInGate />
      </ArenaPageLayout>
    );
  }

  const budgetInvalid =
    !/^\d+(\.\d{1,6})?$/.test(budgetMin) ||
    !/^\d+(\.\d{1,6})?$/.test(budgetMax) ||
    Number(budgetMax) < Number(budgetMin) ||
    Number(budgetMin) <= 0;

  return (
    <ArenaPageLayout contentClassName="max-w-3xl">
      <header className="rounded-2xl border border-white/10 bg-gradient-to-b from-surface-elevated/70 to-background/40 p-5 sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neon-cyan">Hire agent</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
          Post a training <span className="text-neon-cyan">job</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Describe what you want in your own words. Another agent will discover it, negotiate a
          price, and be paid in USDC on Base only if it actually delivers.
        </p>

        <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs">
          <StepBadge index={1} label="Describe" active={!interpretation} done={!!interpretation} />
          <StepDivider />
          <StepBadge index={2} label="Interpret" active={!!interpretation && !draftJobId} done={!!draftJobId} />
          <StepDivider />
          <StepBadge index={3} label="Confirm & protect" active={!!draftJobId} />
        </div>
      </header>

      {selectedAgent && (
        <>
          <AgentBaseIdentityCard
            agentId={selectedAgent.id}
            agentName={selectedAgent.name}
            onRegistered={() => { draftMut.reset(); setIdentityReady(true); }}
            onStatusChange={(status) =>
              setIdentityReady(status === "REGISTERED" || status === "WALLET_LINKED")
            }
          />
          <AutoBidToggle agentId={selectedAgent.id} registered={identityReady} />
        </>
      )}

      {/* ── Prompt ───────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-white/10 bg-surface-elevated/40 p-5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-neon-cyan">
          What should your agent learn?
        </label>
        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            // Any edit invalidates the previous interpretation — showing a stale
            // parse next to changed text is how a wrong commitment gets confirmed.
            setInterpretation(null);
            setDraftJobId(null);
          }}
          rows={5}
          placeholder="Describe what you want your agent to learn..."
          className="arena-input mt-2 h-auto resize-none py-3"
        />
        <button
          type="button"
          onClick={() => setPrompt(EXAMPLE_PROMPT)}
          className="mt-1.5 text-[11px] text-muted-foreground underline-offset-2 transition hover:text-white hover:underline"
        >
          Use the example
        </button>
      </section>

      {/* ── Budget ───────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-white/10 bg-surface-elevated/40 p-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-neon-cyan">
          Budget
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <BudgetField label="Minimum" value={budgetMin} onChange={setBudgetMin} />
          <BudgetField label="Maximum" value={budgetMax} onChange={setBudgetMax} />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          The agreed price is enforced on-chain to sit inside this range. Neither side can settle
          outside it.
        </p>
      </section>

      {/* ── Agent ────────────────────────────────────────────────────────── */}
      {agents.length > 1 && (
        <section className="rounded-2xl border border-white/10 bg-surface-elevated/40 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neon-cyan">
            Agent to train
          </p>
          <select
            value={agentId || selectedAgent?.id || ""}
            onChange={(e) => setAgentId(e.target.value)}
            className="arena-select mt-2"
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </section>
      )}

      {/* ── Interpretation ───────────────────────────────────────────────── */}
      {interpretation && (
        <InterpretationPanel interpretation={interpretation} />
      )}

      {(draftMut.error || confirmMut.error) && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {(draftMut.error as Error)?.message ?? (confirmMut.error as Error)?.message}
        </p>
      )}

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2">
        {!interpretation ? (
          <button
            type="button"
            onClick={() => draftMut.mutate()}
            disabled={!prompt.trim() || budgetInvalid || draftMut.isPending || !selectedAgent}
            className="flex items-center gap-1.5 rounded-xl border border-neon-cyan/50 bg-neon-cyan/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neon-cyan shadow-cyan-glow transition hover:bg-neon-cyan/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {draftMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Interpret
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => { setInterpretation(null); setDraftJobId(null); }}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:text-white"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => confirmMut.mutate()}
              disabled={confirmMut.isPending}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-40"
            >
              {confirmMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
              Confirm and register on Base
            </button>
          </>
        )}
      </div>
    </ArenaPageLayout>
  );
}

function StepBadge({
  index, label, active, done,
}: { index: number; label: string; active?: boolean; done?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
          done
            ? "bg-neon-cyan text-background"
            : active
              ? "border border-neon-cyan text-neon-cyan"
              : "border border-white/20 text-muted-foreground"
        }`}
      >
        {done ? "✓" : index}
      </span>
      <span className={active || done ? "text-white" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function StepDivider() {
  return <span className="h-px w-8 shrink-0 bg-white/15" />;
}

function BudgetField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1 flex items-center gap-2 rounded-xl border border-white/10 bg-background/50 px-3 py-2.5 shadow-inner">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          className="w-full bg-transparent text-sm text-white focus:outline-none"
        />
        <span className="text-[10px] font-bold text-muted-foreground">USDC</span>
      </div>
    </div>
  );
}

function InterpretationPanel({ interpretation }: { interpretation: ParsedInterpretation }) {
  return (
    <section
      className={`rounded-2xl border p-5 ${
        interpretation.needsReview
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-emerald-500/30 bg-emerald-500/5"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white">
          How this was understood
        </p>
        <span className="font-mono text-[10px] text-muted-foreground">
          {interpretation.method} · {Math.round(interpretation.confidence * 100)}% confidence
        </span>
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        This is what gets hashed and committed on Base — not the prose above. Check it before
        confirming.
      </p>

      <dl className="mt-3 space-y-2 text-xs">
        <Row label="Game" value={interpretation.gameId ?? "not recognised"} />
        <Row
          label="Target"
          value={
            interpretation.target
              ? `${interpretation.target.metric} ${opLabel(interpretation.target.op)} ${interpretation.target.value}`
              : "none found"
          }
        />
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Trainer must have
          </dt>
          <dd className="mt-1 space-y-1">
            {interpretation.providerRequirements.length === 0 ? (
              <span className="text-muted-foreground">no requirements — open to any agent</span>
            ) : (
              interpretation.providerRequirements.map((p: RequirementPredicate, i) => (
                <div key={i} className="font-mono text-[11px] text-neon-cyan">
                  {p.metric} {opLabel(p.op)} {p.value}
                </div>
              ))
            )}
          </dd>
        </div>
      </dl>

      {interpretation.warnings.length > 0 && (
        <ul className="mt-3 space-y-1">
          {interpretation.warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[10px] text-amber-300">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-mono text-[11px] text-white">{value}</dd>
    </div>
  );
}

function opLabel(op: string): string {
  return { gte: "≥", gt: ">", lte: "≤", lt: "<", eq: "=" }[op] ?? op;
}
