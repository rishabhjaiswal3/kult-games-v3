import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import {
  ArenaDialogBody,
  ArenaDialogContent,
  ArenaDialogFooter,
  ArenaDialogHeader,
  ArenaDialogTitle,
} from "@/components/ui/arena-dialog";
import { Button } from "@/components/ui/button";
import { f1Api, type F1Driver } from "@/api/f1Api";

type F1DriverModalProps = {
  driverId: string | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * Driver history/data popup + "AI Prediction" button (real 0G Compute call,
 * grounded in the driver's actual career stats -- services/inference-service's
 * generateF1DriverPrediction, see docs/league/F1_LEAGUE_CONTEXT.md).
 */
export function F1DriverModal({ driverId, onOpenChange }: F1DriverModalProps) {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  const { data: driver, isLoading } = useQuery({
    queryKey: ["f1", "driver", driverId],
    queryFn: () => f1Api.getDriver(driverId!),
    enabled: !!driverId,
  });

  async function handlePredict() {
    if (!driverId) return;
    setPredicting(true);
    setPredictError(null);
    try {
      const result = await f1Api.getAiPrediction(driverId);
      setPrediction(result);
    } catch {
      setPredictError("Couldn't generate a prediction right now, try again.");
    } finally {
      setPredicting(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setPrediction(null);
      setPredictError(null);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={!!driverId} onOpenChange={handleOpenChange}>
      <ArenaDialogContent size="lg" className="max-w-[560px]">
        {isLoading || !driver ? (
          <div className="flex items-center gap-2 py-10 justify-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading driver…
          </div>
        ) : (
          <DriverDetail
            driver={driver}
            prediction={prediction}
            predicting={predicting}
            predictError={predictError}
            onPredict={handlePredict}
          />
        )}
      </ArenaDialogContent>
    </Dialog>
  );
}

function DriverDetail({
  driver,
  prediction,
  predicting,
  predictError,
  onPredict,
}: {
  driver: F1Driver;
  prediction: string | null;
  predicting: boolean;
  predictError: string | null;
  onPredict: () => void;
}) {
  return (
    <>
      <ArenaDialogHeader>
        <div className="flex items-center gap-3">
          {driver.image ? (
            <img src={driver.image} alt={driver.name} className="h-16 w-16 rounded-full border border-white/10 object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-full border border-white/10 bg-white/5" />
          )}
          <div className="min-w-0">
            <ArenaDialogTitle className="text-left text-xl">{driver.name}</ArenaDialogTitle>
            <p className="mt-0.5 font-mono text-xs text-white/50">
              {driver.abbr ?? "—"} {driver.number != null ? `· #${driver.number}` : ""} {driver.nationality ? `· ${driver.nationality}` : ""}
            </p>
          </div>
        </div>
      </ArenaDialogHeader>

      <ArenaDialogBody className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Career podiums" value={driver.podiums ?? "—"} />
          <Stat label="Career points" value={driver.careerPoints ?? "—"} />
          <Stat label="Current team" value={driver.currentTeam?.name ?? "Unattached"} />
          <Stat label="Chassis" value={driver.currentTeam?.chassis ?? "—"} />
        </div>

        {driver.teamHistory && driver.teamHistory.length > 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">Team history</div>
            <ul className="mt-2 space-y-1">
              {driver.teamHistory.slice(0, 8).map((t) => (
                <li key={`${t.season}-${t.team?.name}`} className="flex items-center justify-between text-xs text-white/70">
                  <span className="font-mono text-white/40">{t.season}</span>
                  <span>{t.team?.name ?? "Unknown"}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="rounded-xl border border-[#a855f7]/25 bg-[radial-gradient(circle_at_0%_0%,rgba(168,85,247,0.1),transparent_60%),#0a0a12] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#c084fc]">
              <Sparkles className="h-3.5 w-3.5" /> AI Prediction
            </div>
            <Button type="button" size="sm" disabled={predicting} onClick={onPredict} className="h-7 gap-1.5 text-[10px]">
              {predicting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {prediction ? "Regenerate" : "Predict"}
            </Button>
          </div>
          {predictError ? (
            <p className="mt-2 text-xs text-rose-400">{predictError}</p>
          ) : prediction ? (
            <p className="mt-2 text-sm leading-relaxed text-white/80">{prediction}</p>
          ) : (
            <p className="mt-2 text-xs text-white/40">
              Summarizes {driver.name.split(" ")[0]}'s real career stats and predicts their outlook for the upcoming race.
            </p>
          )}
        </div>
      </ArenaDialogBody>

      <ArenaDialogFooter />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="font-mono text-[9px] uppercase tracking-wider text-white/35">{label}</div>
      <div className="mt-0.5 font-tech text-sm font-bold text-white">{value}</div>
    </div>
  );
}
