import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Box,
  Crown,
  Gamepad2,
  Package,
  Sparkles,
  Swords,
  TrendingUp,
} from "lucide-react";
import { gamesApi } from "@/api/gamesApi";
import { useAuth } from "@/contexts/AuthContext";
import { getGameDescription, getGameImage, getGameName } from "@/lib/gameDisplay";
import heroTrio from "@/assets/hero-trio.png";
import zeroGLogo from "@/assets/0G Logo.png";
import kultLogo from "@/assets/Kult Logo.png";

const quickLinks = [
  { label: "Games", path: "/games", icon: Gamepad2, color: "#0089ff" },
  { label: "AI Arena", path: "/ai-arena", icon: Sparkles, color: "#9a35ff" },
  { label: "Inventory", path: "/inventory", icon: Package, color: "#ffc000" },
  { label: "Dashboard", path: "/dashboard", icon: Box, color: "#00f080" },
  { label: "Battles", path: "/battles", icon: Swords, color: "#b338ff" },
  { label: "Leaderboard", path: "/leaderboard", icon: Crown, color: "#f59e0b" },
];

export function HomePage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const { data: gamesData, isLoading } = useQuery({
    queryKey: ["games", "all", "home"],
    queryFn: () => gamesApi.getAll(1, 8),
    staleTime: 5 * 60_000,
  });

  const featuredGames = gamesData?.games?.slice(0, 4) ?? [];

  const handleExploreGames = () => {
    if (isAuthenticated) {
      navigate("/games");
      return;
    }
    navigate("/?login=1");
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="arena-panel relative min-h-[280px] overflow-hidden border-white/8">
        <img src={heroTrio} alt="" className="absolute inset-0 h-full w-full object-cover object-right opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050913] via-[#050913]/92 to-[#050913]/25" />
        <div className="relative z-10 flex flex-col justify-between gap-8 p-6 sm:p-8 lg:min-h-[280px]">
          <div className="flex flex-wrap items-center gap-3 text-[9px] font-tech uppercase tracking-[0.2em] text-white/50">
            <span className="flex items-center gap-1.5">
              Presented by <img src={kultLogo} alt="Kult" className="h-3.5 w-auto object-contain" />
            </span>
            <span className="flex items-center gap-1.5">
              Powered by <img src={zeroGLogo} alt="0G" className="h-3.5 w-auto object-contain" />
            </span>
          </div>
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex rounded border border-[#9f2dff]/50 bg-[#5b1499]/35 px-2 py-0.5 font-tech text-[9px] font-bold uppercase tracking-wider text-[#d773ff]">
              Kult Games
            </span>
            <h1 className="font-tech text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Shape the future of on-chain gaming
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-white/60">
              Play curated Web3 titles, train AI agents, battle rivals, and climb the arena leaderboard — all in one hub.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExploreGames}
                className="btn-primary inline-flex items-center gap-2 rounded-md px-6 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider"
              >
                Explore games
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={isAuthenticated ? () => navigate("/dashboard") : login}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#0a0f1b]/60 px-6 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider text-white/75 transition hover:border-purple-500/35 hover:text-white"
              >
                {isAuthenticated ? "Open dashboard" : "Connect wallet"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="arena-panel grid grid-cols-2 divide-x divide-white/8 overflow-hidden md:grid-cols-4">
        {[
          { label: "Live games", value: String(gamesData?.games?.length ?? "—"), icon: Gamepad2, color: "#0089ff" },
          { label: "AI Arena", value: "Live", icon: Sparkles, color: "#9a35ff" },
          { label: "Marketplace", value: "Open", icon: Package, color: "#ffc000" },
          { label: "Battles", value: "24/7", icon: Swords, color: "#00f080" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-4 p-4">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-white/[0.04]">
              <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
            </div>
            <div>
              <div className="font-tech text-[9px] text-white/48">{stat.label}</div>
              <div className="mt-1 text-xl font-semibold text-white">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-tech text-xs font-semibold uppercase tracking-wider text-white/86">Jump in</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="arena-panel group flex items-center justify-between border-white/8 bg-[#04080f]/95 p-4 transition hover:border-[#9a35ff]/30"
            >
              <div className="flex items-center gap-3">
                <div
                  className="grid h-10 w-10 place-items-center rounded-md bg-white/[0.04]"
                  style={{ color: link.color }}
                >
                  <link.icon className="h-5 w-5" />
                </div>
                <span className="font-tech text-sm font-bold uppercase tracking-wide text-white">{link.label}</span>
              </div>
              <ArrowUpRight className="h-4 w-4 text-white/30 transition group-hover:text-[#c78aff]" />
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-tech text-xs font-semibold uppercase tracking-wider text-white/86">Featured games</h2>
          <Link
            to="/games"
            className="font-tech text-[10px] font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="arena-panel aspect-[16/9] animate-pulse border-white/8 bg-white/5" />
              ))
            : featuredGames.map((game) => {
                const id = game.identification ?? game.slug ?? game._id;
                const image = getGameImage(game);
                return (
                  <Link
                    key={game._id ?? id}
                    to={`/game/${id}`}
                    className="group flex flex-col overflow-hidden rounded-lg border border-white/8 bg-[#04080f]/95 transition hover:border-[#9a35ff]/35"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#0a0f18]">
                      {image ? (
                        <img
                          src={image}
                          alt={getGameName(game.name)}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#04080f] to-transparent" />
                    </div>
                    <div className="p-3">
                      <p className="truncate text-xs font-semibold text-white/90 group-hover:text-[#c78aff]">
                        {getGameName(game.name)}
                      </p>
                      <p className="mt-1 line-clamp-1 text-[10px] text-white/40">
                        {getGameDescription(game.description) || game.category}
                      </p>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>

      <div className="arena-panel flex flex-wrap items-center justify-between gap-4 border-white/8 bg-[#04080f]/95 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-tech text-sm font-bold uppercase text-white">Ready for the arena?</h3>
            <p className="text-xs text-white/45">Train agents, earn rewards, and compete globally.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/ai-arena")}
          className="btn-primary inline-flex items-center gap-2 rounded-md px-5 py-2.5 font-tech text-[10px] font-bold uppercase tracking-wider"
        >
          Enter AI Arena
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
