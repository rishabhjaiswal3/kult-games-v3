import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Crown,
  Globe2,
  LockKeyhole,
  Play,
  Share2,
  Shield,
  Star,
  Target,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { Game } from "@/types/api";
import heroBanner from "@/assets/games/zeroGpool/hero-banner.webp";
import poolTableOverview from "@/assets/games/zeroGpool/pool-table-overview.webp";
import gameModes from "@/assets/games/zeroGpool/game-modes.webp";
import controlSelection from "@/assets/games/zeroGpool/control-selection.webp";
import controlsAndAiming from "@/assets/games/zeroGpool/controls-and-aiming.webp";
import cueSelection from "@/assets/games/zeroGpool/cue-selection.webp";

const gallery = [poolTableOverview, gameModes, controlsAndAiming, cueSelection, controlSelection];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-l-4 border-cyan-400 pl-3 font-tech text-[22px] font-bold uppercase leading-tight text-white sm:text-[26px]">{children}</h2>;
}

function GameShot({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="mt-8 block w-full rounded-xl object-cover shadow-[0_22px_65px_rgba(0,183,255,0.12)]" loading="lazy" />;
}

export function ZeroGPoolDetail({ game }: { game: Game }) {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const gameId = game.identification ?? game.slug ?? "zerogpool";
  const play = () => navigate(isAuthenticated ? `/game/${game._id}/play` : "/?login=1");

  const share = async () => {
    const data = { title: "Zero G Pool", text: "Check out Zero G Pool on Kult Games", url: window.location.href };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  };

  return (
    <div className="mx-auto w-full max-w-[1320px] pb-20 text-[#97979f] [&_p]:text-justify">
      <button type="button" onClick={() => navigate("/games")} className="mb-4 inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#07101d] px-4 py-2.5 font-tech text-xs font-semibold uppercase tracking-wider text-white/70 transition hover:border-cyan-400/60 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Games
      </button>

      <section className="relative overflow-hidden rounded-xl border border-cyan-500/15 bg-[#050b14]">
        <img src={heroBanner} alt="Zero G Pool neon pool table" className="aspect-[3/1] w-full object-cover" fetchPriority="high" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020610]/90 via-transparent to-transparent" />
        <h1 className="absolute bottom-4 left-5 font-tech text-3xl font-black uppercase text-white sm:left-7 sm:text-5xl lg:text-[56px]">Zero G Pool</h1>
      </section>

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0">
          <SectionTitle>Introduction</SectionTitle>
          <p className="mt-4 max-w-[680px] text-[17px] leading-[1.65] text-[#a5a5ad]">Zero G Pool is a modern 8-ball pool game where players test their aim, timing, and shot control. Practice solo, compete through matchmaking, challenge AI opponents, and master a growing collection of cues in a neon arena built for precise play.</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Mode", value: "Browser", icon: Globe2 },
              { label: "Arena", value: "0G", icon: Target },
              { label: "Access", value: isAuthenticated ? "Ready" : "Login", icon: LockKeyhole },
            ].map((item) => <div key={item.label} className="flex min-w-0 items-center gap-3 rounded-lg border border-cyan-500/35 bg-[#071524] px-3 py-3"><item.icon className="h-5 w-5 shrink-0 text-cyan-300" /><div className="min-w-0"><div className="text-[10px] uppercase text-white/35">{item.label}</div><div className="truncate text-sm uppercase text-white sm:text-base">{item.value}</div></div></div>)}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Rating", value: String(game.rating ?? 5), icon: Star, color: "text-yellow-300 border-yellow-500/45" },
              { label: "Chain", value: "0G Chain", icon: Shield, color: "text-cyan-300 border-cyan-500/45" },
              { label: "Leaderboard", value: "Ranks", icon: Crown, color: "text-yellow-300 border-yellow-500/45", action: () => navigate("/leaderboard") },
              { label: "Marketplace", value: "Inventory", icon: BriefcaseBusiness, color: "text-purple-300 border-purple-500/45", action: () => navigate(`/inventory?game=${encodeURIComponent(gameId)}`) },
            ].map((item) => <button key={item.label} type="button" onClick={item.action} disabled={!item.action} className="flex min-w-0 items-center gap-2.5 rounded-md border border-white/8 bg-[#07101d] p-2.5 text-left enabled:hover:border-cyan-400/40"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${item.color}`}><item.icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-[10px] text-white/55">{item.label}</span><span className="block truncate text-sm font-bold text-white">{item.value}</span></span></button>)}
          </div>

          <div className="relative mt-12 overflow-hidden rounded-xl bg-black">
            <img src={gallery[active]} alt={`Zero G Pool screenshot ${active + 1}`} className="aspect-video w-full object-cover" />
            <button type="button" onClick={() => setActive((active - 1 + gallery.length) % gallery.length)} aria-label="Previous screenshot" className="absolute left-0 top-1/2 grid h-14 w-10 -translate-y-1/2 place-items-center rounded-r-md bg-black/50 text-white"><ChevronLeft className="h-7 w-7" /></button>
            <button type="button" onClick={() => setActive((active + 1) % gallery.length)} aria-label="Next screenshot" className="absolute right-0 top-1/2 grid h-14 w-10 -translate-y-1/2 place-items-center rounded-l-md bg-black/50 text-white"><ChevronRight className="h-7 w-7" /></button>
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">{gallery.map((src, index) => <button key={src} type="button" onClick={() => setActive(index)} className={`w-[142px] shrink-0 overflow-hidden rounded border-2 ${active === index ? "border-cyan-300" : "border-transparent opacity-65"}`}><img src={src} alt="" className="aspect-video w-full object-cover" loading="lazy" /></button>)}</div>

          <main className="mt-14 max-w-[920px] space-y-14 text-[17px] leading-[1.65] text-[#a5a5ad]">
            <section><SectionTitle>Overview</SectionTitle><p className="mt-4">Step into the Zero G Pool arena and master the perfect shot. Adjust aim, power, spin, and cue-ball position to outplay opponents across practice and competitive matches.</p><GameShot src={gameModes} alt="Zero G Pool matchmaking and practice modes" /></section>
            <section><SectionTitle>Game Modes</SectionTitle><p className="mt-4">Choose competitive 8-ball matchmaking or Practice Solo to sharpen your skills. The flexible modes make it easy to learn the table before entering higher-pressure matches.</p><GameShot src={controlsAndAiming} alt="Zero G Pool aiming controls" /></section>
            <section><SectionTitle>Controls &amp; Aiming</SectionTitle><p className="mt-4">Move the cue ball, adjust spin, drag to aim, pinch to zoom, and set the right power for every strike. Multiple control styles let you choose the shot mechanic that feels most natural.</p><GameShot src={controlSelection} alt="Zero G Pool control selection" /></section>
            <section><SectionTitle>Cue Selection</SectionTitle><p className="mt-4">Choose from a variety of cue designs and customize your table presence before stepping into a match.</p><GameShot src={cueSelection} alt="Zero G Pool cue collection" /></section>
            <section><SectionTitle>Pool Gameplay</SectionTitle><p className="mt-4">Plan every move carefully, position the cue ball strategically, and sink targets while keeping control of the table. Consistency and precision separate casual shots from match-winning runs.</p></section>
          </main>
        </div>

        <aside className="order-first overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#07182a] to-[#050a13] shadow-[0_20px_70px_rgba(0,0,0,0.35)] lg:sticky lg:top-24 lg:order-none [&_p]:!text-left">
          <div className="bg-[radial-gradient(circle_at_50%_0%,rgba(0,190,255,0.2),transparent_70%)] p-5"><img src={heroBanner} alt="Zero G Pool" className="aspect-video w-full rounded-lg object-cover" /></div>
          <div className="p-6"><h3 className="font-tech text-xl font-bold uppercase text-white">Launch Control</h3><p className="mt-4 text-[15px] leading-[1.7]">Enter a polished 8-ball experience with solo practice, competitive matchmaking, AI challenges, and customizable cues.</p><button type="button" onClick={play} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#087be8] to-[#943df5] py-3.5 font-semibold text-white hover:brightness-110"><Play className="h-4 w-4" /> Play now</button><button type="button" onClick={() => navigate(`/inventory?game=${encodeURIComponent(gameId)}`)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-purple-500/30 bg-[#0b0920] py-3 text-white"><BriefcaseBusiness className="h-4 w-4" /> Inventory</button><button type="button" onClick={share} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-cyan-500/25 bg-[#071426] py-3 text-white"><Share2 className="h-4 w-4" /> Share</button></div>
        </aside>
      </div>
    </div>
  );
}
