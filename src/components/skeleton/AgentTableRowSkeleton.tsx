import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors an agent row in AutonomousPage's "Agent | Task | Status | Stats | Autonomous | Action" table. */
export function AgentTableRowSkeleton() {
  return (
    <tr aria-hidden>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-8 w-8 shrink-0 rounded-lg bg-white/8" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20 bg-white/10" />
            <Skeleton className="h-2.5 w-14 bg-white/6" />
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5"><Skeleton className="h-3 w-24 bg-white/6" /></td>
      <td className="px-5 py-3.5"><Skeleton className="h-3 w-16 bg-white/6" /></td>
      <td className="px-5 py-3.5"><Skeleton className="h-3 w-20 bg-white/6" /></td>
      <td className="px-5 py-3.5 text-center"><Skeleton className="mx-auto h-5 w-9 rounded-full bg-white/8" /></td>
      <td className="px-5 py-3.5 text-center"><Skeleton className="mx-auto h-6 w-16 rounded bg-white/6" /></td>
    </tr>
  );
}

export function AgentTableSkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <AgentTableRowSkeleton key={i} />
      ))}
    </>
  );
}
