import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Flag, Loader2, MapPin } from "lucide-react";
import { f1Api, type F1Driver } from "@/api/f1Api";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { F1DriverModal } from "@/components/f1/F1DriverModal";

/**
 * F1 League, its own tab, separate from the football League board (per
 * request: "not like polymarket, just like we're doing in League for
 * football, same for F1"). Data source + endpoint reference:
 * docs/league/F1_LEAGUE_CONTEXT.md (0g-AIArena repo).
 */
const F1Page = () => {
  const [openDriverId, setOpenDriverId] = useState<string | null>(null);

  return (
    <div className="min-w-0 w-full max-w-full overflow-x-hidden bg-black px-3 py-3 sm:px-6 lg:px-8">
      <PageHeader />
      <div className="mt-3 space-y-4">
        <UpcomingRaceSection />
        <DriverGridSection onSelectDriver={setOpenDriverId} />
      </div>
      <F1DriverModal driverId={openDriverId} onOpenChange={(open) => !open && setOpenDriverId(null)} />
    </div>
  );
};

function PageHeader() {
  return (
    <div className="flex items-center gap-2.5 border-b border-red-500/20 pb-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-red-500/30 bg-red-500/10">
        <Flag className="h-4.5 w-4.5 text-red-400" />
      </span>
      <div>
        <h1 className="font-tech text-lg font-bold uppercase tracking-wide text-white sm:text-xl">F1 League</h1>
        <p className="font-mono text-[11px] text-white/40"># AI agent predictions on the grid</p>
      </div>
    </div>
  );
}

function UpcomingRaceSection() {
  const { data: weekend, isLoading } = useQuery({
    queryKey: ["f1", "grand-prix", "belgium"],
    queryFn: () => f1Api.getBelgianGrandPrix(),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <Skeleton className="h-5 w-40 bg-white/10" />
        <Skeleton className="mt-3 h-24 w-full bg-white/6" />
      </section>
    );
  }

  if (!weekend) {
    return (
      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="font-mono text-xs text-white/40">
          Race calendar not synced yet, an admin needs to trigger POST /v1/f1/sync once the API-SPORTS plan supports
          the current season.
        </p>
      </section>
    );
  }

  const { race, sessions } = weekend;
  const raceDate = new Date(race.startsAt);

  return (
    <section
      className="overflow-hidden rounded-xl border border-red-500/25 bg-[radial-gradient(circle_at_0%_0%,rgba(239,68,68,0.14),transparent_55%),#0a0a12]"
      data-tour="f1-upcoming-race"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-300">Upcoming Race</p>
          <h2 className="mt-1 font-tech text-xl font-bold uppercase text-white sm:text-2xl">
            <span aria-hidden className="mr-1.5">🇭🇺</span>
            {race.grandPrixName}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-white/50">
            <MapPin className="h-3.5 w-3.5" /> {race.circuitName ?? "TBD"}
            <span className="text-white/25">·</span>
            {raceDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
        {race.circuitImage ? (
          <img src={race.circuitImage} alt={race.circuitName ?? ""} className="h-16 w-auto rounded-lg border border-white/10 bg-black/40 object-contain p-1" />
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-white/10 px-4 py-2.5">
        {sessions.map((s) => (
          <span
            key={s.id}
            className={`rounded-lg border px-2 py-1 font-mono text-[10px] uppercase tracking-wider ${
              s.status === "COMPLETED" ? "border-white/10 text-white/30" : "border-red-400/30 bg-red-400/5 text-red-300"
            }`}
          >
            {s.sessionType}
          </span>
        ))}
      </div>

      <div className="border-t border-white/10 p-4">
        <MakePickPanel raceId={race.id} />
      </div>
    </section>
  );
}

function MakePickPanel({ raceId }: { raceId: string }) {
  const { isAuthenticated, login } = useAuth();
  const { data: myAgents } = useMyArenaAgents();
  const agent = myAgents?.agents?.[0];
  const queryClient = useQueryClient();

  const { data: drivers } = useQuery({
    queryKey: ["f1", "drivers"],
    queryFn: () => f1Api.getDrivers(),
    staleTime: 5 * 60_000,
  });

  const { data: existingPick } = useQuery({
    queryKey: ["f1", "pick", raceId, agent?.id],
    queryFn: () => f1Api.getPick(raceId, agent!.id),
    enabled: !!agent?.id,
  });

  const pickMutation = useMutation({
    mutationFn: (driverId: string) => f1Api.makePick(raceId, agent!.id, driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["f1", "pick", raceId, agent?.id] });
    },
  });

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={login}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left font-tech text-[10px] font-bold uppercase tracking-wider text-white/50 transition hover:border-red-400/40 hover:text-white"
      >
        Connect your wallet to make a pick
      </button>
    );
  }

  if (!agent) {
    return <p className="font-mono text-xs text-white/40">Mint an agent first to make a pick.</p>;
  }

  if (existingPick) {
    return (
      <p className="font-mono text-xs text-white/70">
        <span className="font-bold text-emerald-300">{agent.name}</span> picked{" "}
        <span className="font-bold text-white">{existingPick.predictedDriver?.name ?? "a driver"}</span> to win.
      </p>
    );
  }

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        Make your pick, who wins the {agent.name ? `race` : ""}?
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(drivers ?? []).slice(0, 12).map((d) => (
          <button
            key={d.id}
            type="button"
            disabled={pickMutation.isPending}
            onClick={() => pickMutation.mutate(d.id)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 font-tech text-[10px] font-bold uppercase text-white/70 transition hover:border-red-400/40 hover:text-white disabled:opacity-40"
          >
            {pickMutation.isPending && pickMutation.variables === d.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {d.abbr ?? d.name}
          </button>
        ))}
      </div>
      {pickMutation.isError ? <p className="mt-2 text-xs text-rose-400">Couldn't lock in that pick, try again.</p> : null}
    </div>
  );
}

function DriverGridSection({ onSelectDriver }: { onSelectDriver: (id: string) => void }) {
  const { data: drivers, isLoading } = useQuery({
    queryKey: ["f1", "drivers"],
    queryFn: () => f1Api.getDrivers(),
    staleTime: 5 * 60_000,
  });

  return (
    <section>
      <div className="flex items-center gap-x-2 gap-y-1 border-b border-red-500/15 pb-2">
        <span className="font-mono text-[10px] font-bold text-red-400">$</span>
        <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">Drivers</h2>
        <span className="font-mono text-[11px] text-white/40"># tap a driver for history + an AI prediction</span>
      </div>

      {isLoading ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl bg-white/6" />
          ))}
        </div>
      ) : !drivers || drivers.length === 0 ? (
        <p className="mt-3 font-mono text-xs text-white/40">
          Drivers not synced yet, an admin needs to trigger POST /v1/f1/sync.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {drivers.map((driver) => (
            <DriverCard key={driver.id} driver={driver} onClick={() => onSelectDriver(driver.id)} />
          ))}
        </div>
      )}
    </section>
  );
}

function DriverCard({ driver, onClick }: { driver: F1Driver; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center transition hover:border-red-400/40 hover:bg-white/[0.05]"
    >
      {driver.image ? (
        <img src={driver.image} alt={driver.name} className="h-14 w-14 rounded-full border border-white/10 object-cover" />
      ) : (
        <div className="h-14 w-14 rounded-full border border-white/10 bg-white/5" />
      )}
      <span className="line-clamp-1 font-tech text-xs font-bold text-white">{driver.name}</span>
      <span className="flex items-center gap-1 font-mono text-[10px] text-white/40">
        {driver.currentTeam?.logo ? <img src={driver.currentTeam.logo} alt="" className="h-3 w-3 object-contain" /> : null}
        <span className="line-clamp-1">{driver.currentTeam?.name ?? "Unattached"}</span>
      </span>
    </button>
  );
}

export default F1Page;
