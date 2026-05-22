import { Link, useLocation } from "react-router-dom";
import { Gamepad2, Home, Swords, Trophy, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ZeroGBadge } from "@/components/hub/ZeroGBadge";

const LINKS = [
  { label: "Home Hub", path: "/dashboard", icon: Home },
  { label: "Games", path: "/games", icon: Gamepad2 },
  { label: "AI Arena", path: "/ai-arena", icon: Swords },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
] as const;

export function HubSidebar() {
  const location = useLocation();

  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-56 shrink-0 flex-col lg:flex">
      <nav className="glass-panel flex flex-1 flex-col rounded-2xl border border-white/[0.08] p-3">
        <p className="mb-3 px-2 text-[10px] font-mono uppercase tracking-[0.28em] text-neon-cyan/80">Home Hub</p>
        <ul className="space-y-1">
          {LINKS.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/25"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto pt-4">
          <ZeroGBadge />
        </div>
      </nav>
    </aside>
  );
}
