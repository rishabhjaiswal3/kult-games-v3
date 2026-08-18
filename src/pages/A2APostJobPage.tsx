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
      <header>
        <h1 className="font-tech text-lg font-bold uppercase tracking-[0.2em] text-white">
          Post training job
        </h1>
        <p className="mt-1 text-xs text-white/50">
          Describe what you want in your own words. Another agent will discover it, negotiate a
          price, and be paid in USDC on Base only if it actually delivers.
        </p>
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
      <section className="rounded-lg border border-white/10 bg-black/30 p-4">
        <label className="font-tech text-[10px] font-bold uppercase tracking-wider text-cyan-300">
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
          className="mt-2 w-full resize-none rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-cyan-500/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setPrompt(EXAMPLE_PROMPT)}
          className="mt-1 text-[10px] text-white/35 underline-offset-2 transition hover:text-white/60 hover:underline"
        >
          Use the example
        </button>
      </section>

      {/* ── Budget ───────────────────────────────────────────────────────── */}
      <section className="rounded-lg border border-white/10 bg-black/30 p-4">
        <p className="font-tech text-[10px] font-bold uppercase tracking-wider text-cyan-300">
          Budget
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <BudgetField label="Minimum" value={budgetMin} onChange={setBudgetMin} />
          <BudgetField label="Maximum" value={budgetMax} onChange={setBudgetMax} />
        </div>
        <p className="mt-2 text-[10px] text-white/35">
          The agreed price is enforced on-chain to sit inside this range. Neither side can settle
          outside it.
        </p>
      </section>

      {/* ── Agent ────────────────────────────────────────────────────────── */}
      {agents.length > 1 && (
        <section className="rounded-lg border border-white/10 bg-black/30 p-4">
          <p className="font-tech text-[10px] font-bold uppercase tracking-wider text-cyan-300">
            Agent to train
          </p>
          <select
            value={agentId || selectedAgent?.id || ""}
            onChange={(e) => setAgentId(e.target.value)}
            className="mt-2 w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
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
        <p className="rounded border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
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
            className="flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {draftMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Interpret
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => { setInterpretation(null); setDraftJobId(null); }}
              className="rounded border border-white/15 px-4 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-white/60 transition hover:text-white"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => confirmMut.mutate()}
              disabled={confirmMut.isPending}
              className="flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 font-tech text-[10px] font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-40"
            >
              {confirmMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
              Confirm and register on Base
            </button>
          </>
        )}
      </div>
    </ArenaPageLayout>
  );
}

function BudgetField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-white/40">{label}</label>
      <div className="mt-1 flex items-center gap-2 rounded border border-white/10 bg-black/40 px-3 py-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          className="w-full bg-transparent text-sm text-white focus:outline-none"
        />
        <span className="font-tech text-[10px] font-bold text-white/40">USDC</span>
      </div>
    </div>
  );
}

function InterpretationPanel({ interpretation }: { interpretation: ParsedInterpretation }) {
  return (
    <section
      className={`rounded-lg border p-4 ${
        interpretation.needsReview
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-emerald-500/30 bg-emerald-500/5"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <p className="font-tech text-[10px] font-bold uppercase tracking-wider text-white">
          How this was understood
        </p>
        <span className="font-mono text-[10px] text-white/40">
          {interpretation.method} · {Math.round(interpretation.confidence * 100)}% confidence
        </span>
      </div>

      <p className="mt-2 text-[10px] text-white/45">
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
          <dt className="text-[10px] uppercase tracking-wider text-white/40">
            Trainer must have
          </dt>
          <dd className="mt-1 space-y-1">
            {interpretation.providerRequirements.length === 0 ? (
              <span className="text-white/40">no requirements — open to any agent</span>
            ) : (
              interpretation.providerRequirements.map((p: RequirementPredicate, i) => (
                <div key={i} className="font-mono text-[11px] text-cyan-300">
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
      <dt className="text-[10px] uppercase tracking-wider text-white/40">{label}</dt>
      <dd className="font-mono text-[11px] text-white">{value}</dd>
    </div>
  );
}

function opLabel(op: string): string {
  return { gte: "≥", gt: ">", lte: "≤", lt: "<", eq: "=" }[op] ?? op;
}
