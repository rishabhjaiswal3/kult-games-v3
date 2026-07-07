import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2, Search } from "lucide-react";
import { arenaChainApi, zeroGExplorer, type OnChainEvent } from "@/api/arenaChainApi";

const PAGE_SIZE = 20;

function shortHash(value?: string | null) {
  if (!value) return "—";
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}…${value.slice(-8)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatArena(value?: string | null) {
  const num = value == null ? NaN : Number.parseFloat(value);
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function eventAmount(event: OnChainEvent): string | null {
  const raw = event.args?.amount;
  if (raw == null) return null;
  const num = typeof raw === "string" ? Number.parseFloat(raw) : Number(raw);
  if (!Number.isFinite(num)) return null;
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function EventsTable({ events, emptyLabel }: { events: OnChainEvent[]; emptyLabel: string }) {
  if (!events.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[10px] font-tech uppercase tracking-[0.14em] text-white/45">
            <th className="py-2 pr-4">Event</th>
            <th className="py-2 pr-4">Amount</th>
            <th className="py-2 pr-4">Tx Hash</th>
            <th className="py-2 pr-4">Block</th>
            <th className="py-2 pr-4">Occurred At</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-white/5 text-foreground/90">
              <td className="py-2 pr-4 font-tech text-xs uppercase text-neon-cyan">
                {event.eventName.replaceAll("_", " ")}
              </td>
              <td className="py-2 pr-4 font-mono tabular-nums">{eventAmount(event) ?? "—"}</td>
              <td className="py-2 pr-4">
                {event.txHash ? (
                  <a
                    href={zeroGExplorer.tx(event.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-white/60 transition hover:text-neon-cyan"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                    {shortHash(event.txHash)}
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="py-2 pr-4 font-mono text-xs text-white/60">{event.blockNumber ?? "—"}</td>
              <td className="py-2 pr-4 font-mono text-xs text-white/60">{formatDate(event.occurredAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WalletLookup() {
  const [inputAddress, setInputAddress] = useState("");
  const [lookupAddress, setLookupAddress] = useState<string | null>(null);

  const balanceQ = useQuery({
    queryKey: ["arenaChain", "admin", "explorer", "walletBalance", lookupAddress],
    queryFn: () => arenaChainApi.getWalletBalance(lookupAddress!),
    enabled: !!lookupAddress,
    retry: false,
  });

  const txQ = useQuery({
    queryKey: ["arenaChain", "admin", "explorer", "walletTx", lookupAddress],
    queryFn: () => arenaChainApi.getWalletTransactions(lookupAddress!, 1, PAGE_SIZE),
    enabled: !!lookupAddress,
    retry: false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputAddress.trim();
    if (trimmed) setLookupAddress(trimmed);
  };

  return (
    <section className="arena-panel p-4 sm:p-5">
      <div className="font-tech text-[10px] uppercase tracking-[0.18em] text-neon-purple">Wallet Lookup</div>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          placeholder="0x wallet address"
          className="h-11 flex-1 rounded-xl border border-input bg-background/70 px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none transition focus:border-neon-cyan/40"
        />
        <button
          type="submit"
          disabled={!inputAddress.trim()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neon-cyan/40 bg-neon-cyan/12 px-4 text-sm font-semibold text-neon-cyan transition hover:bg-neon-cyan/20 disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          Lookup
        </button>
      </form>

      {lookupAddress ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#05070d]/95 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Balance</div>
                <div className="mt-2 font-display text-xl font-black tabular-nums text-foreground">
                  {balanceQ.isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                  ) : balanceQ.isError ? (
                    "—"
                  ) : (
                    `${formatArena(balanceQ.data?.balanceArena)} ARENA`
                  )}
                </div>
              </div>
              <a
                href={zeroGExplorer.address(lookupAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-neon-cyan/20 bg-neon-cyan/8 px-2 py-0.5 text-[10px] font-mono text-neon-cyan transition hover:bg-neon-cyan/15"
              >
                <ExternalLink className="h-2.5 w-2.5" />
                0G Explorer
              </a>
            </div>
            {balanceQ.isError ? (
              <div className="mt-2 text-xs text-white/40">Balance unavailable for this address right now.</div>
            ) : null}
          </div>

          <div>
            <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              Transaction History
            </div>
            {txQ.isLoading ? (
              <div className="h-16 animate-pulse rounded-xl border border-white/8 bg-white/5" />
            ) : txQ.isError ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/90">
                Transaction history unavailable for this address right now.
              </div>
            ) : (
              <EventsTable events={txQ.data?.events ?? []} emptyLabel="No transactions found for this address." />
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function ArenaExplorerPage() {
  const [eventName, setEventName] = useState<string>("");
  const [page, setPage] = useState(1);

  const eventsQ = useQuery({
    queryKey: ["arenaChain", "admin", "explorer", "events", eventName, page],
    queryFn: () => arenaChainApi.getExplorerEvents({ eventName: eventName || undefined, page, limit: PAGE_SIZE }),
    retry: false,
  });

  const totalPages = eventsQ.data?.total ? Math.max(1, Math.ceil(eventsQ.data.total / PAGE_SIZE)) : 1;

  const knownEventNames = [
    "",
    "Transfer",
    "Approval",
    "Deposit",
    "Withdrawal",
    "RewardDistributed",
    "CommissionCollected",
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <div className="font-tech text-[10px] uppercase tracking-[0.24em] text-neon-purple">Admin · $ARENA Economy</div>
          <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-foreground">
            On-Chain Explorer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Repo-wide $ARENA events on 0G Chain, plus a wallet lookup tool.
          </p>
        </header>

        <section className="arena-panel p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-tech text-[10px] uppercase tracking-[0.18em] text-neon-cyan">Events</div>
            <div className="flex items-center gap-2">
              <select
                value={eventName}
                onChange={(e) => {
                  setEventName(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-lg border border-white/10 bg-background/70 px-2 text-xs text-foreground outline-none focus:border-neon-cyan/40"
              >
                {knownEventNames.map((name) => (
                  <option key={name || "all"} value={name}>
                    {name || "All events"}
                  </option>
                ))}
              </select>
              {eventsQ.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-white/40" /> : null}
            </div>
          </div>

          <div className="mt-4">
            {eventsQ.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg border border-white/8 bg-white/5" />
                ))}
              </div>
            ) : eventsQ.isError ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/90">
                Event feed is not available right now (GET /v1/arena/explorer/events unreachable or not yet
                implemented).
              </div>
            ) : (
              <EventsTable events={eventsQ.data?.events ?? []} emptyLabel="No on-chain events found." />
            )}
          </div>

          {!eventsQ.isLoading && !eventsQ.isError && (eventsQ.data?.events?.length ?? 0) > 0 ? (
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-white/10 bg-background/70 px-3 py-1.5 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-white/10 bg-background/70 px-3 py-1.5 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <WalletLookup />
      </div>
    </div>
  );
}
