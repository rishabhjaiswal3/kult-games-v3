import { useEffect, useState } from "react";

/** "Today 8:00 PM" / "Tomorrow 6:00 PM" / "Jun 14 · 8:00 PM" from a real ISO kickoff timestamp. */
export function formatKickoffDisplay(kickoffAtIso: string): string {
  const kickoff = new Date(kickoffAtIso);
  const now = new Date();

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round((startOfDay(kickoff).getTime() - startOfDay(now).getTime()) / 86_400_000);

  const time = kickoff.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  if (dayDiff === 0) return `Today ${time}`;
  if (dayDiff === 1) return `Tomorrow ${time}`;
  const date = kickoff.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${date} · ${time}`;
}

function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return "Locked";
  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/** Live-ticking "HH:MM:SS" countdown to a real ISO kickoff timestamp, or "Locked" once it's passed. */
export function useCountdown(kickoffAtIso: string | undefined): string {
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!kickoffAtIso) return;
    const interval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [kickoffAtIso]);

  if (!kickoffAtIso) return "—";
  return formatCountdown(new Date(kickoffAtIso).getTime() - Date.now());
}
