import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, ChevronLeft, ChevronRight, Crown, Globe2, LockKeyhole, Play, Share2, Shield, Star, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { Game } from "@/types/api";
import heroBanner from "@/assets/games/zeroDashGame/hero-banner.png";
import logo from "@/assets/games/zeroDashGame/logo.png";
import startMenu from "@/assets/games/zeroDashGame/start-menu.png";
import networkStatus from "@/assets/games/zeroDashGame/network-status.png";
import gameplay from "@/assets/games/zeroDashGame/gameplay.png";
import liveRankings from "@/assets/games/zeroDashGame/live-rankings.png";

const gallery = [startMenu, networkStatus, gameplay, liveRankings];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-l-4 border-[#ffd400] pl-3 font-tech text-[22px] font-bold uppercase leading-tight tracking-[-0.01em] text-white sm:text-[26px]">{children}</h2>;
}

function GameShot({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="mt-9 block w-full rounded-[11px] object-cover shadow-[0_22px_65px_rgba(0,204,220,0.12)]" loading="lazy" />;
}

export function ZeroDashDetail({ game }: { game: Game }) {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const play = () => navigate(isAuthenticated ? `/game/${game._id}/play` : "/?login=1");

  const share = async () => {
    const data = { title: "Zero Dash", text: "Check out Zero Dash on Kult Games", url: window.location.href };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  };

  return (
    <div className="mx-auto w-full max-w-[1320px] pb-20 text-[#97979f] [&_p]:text-justify">
      <button type="button" onClick={() => navigate("/games")} className="mb-4 inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#07101d] px-4 py-2.5 font-tech text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:border-cyan-400/60 hover:bg-cyan-950/20 hover:text-white active:translate-y-0"><ArrowLeft className="h-4 w-4" /> Back to Games</button>

      <section className="relative overflow-hidden rounded-b-xl border border-cyan-400/60 bg-[#050b14]">
        <img src={heroBanner} alt="Zero Dash voxel runner" className="aspect-[3/1] w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020610]/85 via-transparent to-transparent" />
        <h1 className="absolute bottom-3 left-5 font-tech text-3xl font-black uppercase leading-none tracking-tight text-white sm:bottom-5 sm:left-7 sm:text-5xl lg:text-[56px]">Zero Dash</h1>
      </section>

      <section className="mt-14 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_540px]">
        <div>
          <SectionTitle>Introduction</SectionTitle>
          <p className="mt-4 max-w-[650px] text-[17px] leading-[1.65] text-[#a5a5ad]">Zero Dash is a fast-paced on-chain arcade platformer where players race through challenging obstacle-filled levels while earning rewards on the 0G Network. Combining classic pixel-art gameplay with blockchain-powered progression, every run tests your timing, precision, and reflexes as you compete for the highest score.</p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { label: "Mode", value: "Browser", icon: Globe2 },
              { label: "Arena", value: "0G", icon: Target },
              { label: "Access", value: isAuthenticated ? "Ready" : "Login", icon: LockKeyhole },
            ].map((item) => <div key={item.label} className="flex min-w-0 items-center gap-3 rounded-[9px] border border-purple-600 bg-[#0b071b] px-3 py-3"><item.icon className="h-5 w-5 shrink-0 text-purple-500" /><div className="min-w-0"><div className="text-[10px] uppercase text-white/35">{item.label}</div><div className="truncate text-sm uppercase text-white sm:text-base">{item.value}</div></div></div>)}
          </div>
        </div>
        <div className="rounded-[13px] border border-[#24103e] bg-[#09051c] p-5">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-tech text-xl font-bold uppercase text-white sm:text-2xl">Launch Control</h2><span className="rounded-md bg-white/10 px-5 py-1 text-white/35">v1.0</span></div>
          <button type="button" onClick={play} className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#681fd0] to-[#973af4] py-3 text-xl font-semibold text-white transition hover:brightness-110 active:translate-y-0"><Play className="h-6 w-6" /> Play</button>
          <button type="button" onClick={() => navigate("/inventory")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-[#25103d] bg-[#070214] py-3 text-xl font-semibold text-white transition hover:border-purple-600 active:translate-y-0"><BriefcaseBusiness className="h-6 w-6" /> Inventory</button>
        </div>
      </section>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Rating", value: String(game.rating ?? 5), icon: Star, color: "text-[#ffc400] border-[#a57d00]" },
          { label: "Chain", value: "0g Chain", icon: Shield, color: "text-purple-500 border-purple-700" },
          { label: "Leaderboard", value: "Ranks", icon: Crown, color: "text-[#ffc400] border-[#a57d00]", action: () => navigate("/leaderboard") },
          { label: "Marketplace", value: "Inventory", icon: BriefcaseBusiness, color: "text-purple-500 border-purple-700", action: () => navigate("/inventory") },
        ].map((item) => <button key={item.label} type="button" onClick={item.action} disabled={!item.action} className="flex items-center gap-4 rounded-[5px] border border-[#16132d] bg-[#080719] p-3 text-left transition enabled:hover:border-cyan-400/40 disabled:cursor-default"><span className={`grid h-16 w-16 shrink-0 place-items-center rounded-[10px] border ${item.color}`}><item.icon className="h-8 w-8" /></span><span><span className="block text-xs text-white">{item.label}</span><span className="mt-1 block text-2xl text-white sm:text-[28px]">{item.value}</span></span></button>)}
      </section>

      <div className="mt-14 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0">
          <div className="relative overflow-hidden rounded-[12px] bg-black">
            <img src={gallery[active]} alt={`Zero Dash screenshot ${active + 1}`} className="aspect-[1.78/1] w-full object-cover" />
            <button type="button" onClick={() => setActive((active - 1 + gallery.length) % gallery.length)} aria-label="Previous screenshot" style={{ top: "calc(50% - 2rem)" }} className="absolute left-0 grid h-16 w-11 place-items-center rounded-r-md border-y border-r border-white/10 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70 active:translate-y-0"><ChevronLeft className="h-8 w-8" /></button>
            <button type="button" onClick={() => setActive((active + 1) % gallery.length)} aria-label="Next screenshot" style={{ top: "calc(50% - 2rem)" }} className="absolute right-0 grid h-16 w-11 place-items-center rounded-l-md border-y border-l border-white/10 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70 active:translate-y-0"><ChevronRight className="h-8 w-8" /></button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">{gallery.map((_, index) => <button key={index} type="button" onClick={() => setActive(index)} aria-label={`Show screenshot ${index + 1}`} className={`h-2 w-2 rounded-full active:translate-y-0 ${active === index ? "bg-white" : "bg-white/35"}`} />)}</div>
          </div>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-1">{gallery.map((src, index) => <button key={src} type="button" onClick={() => setActive(index)} className={`w-[152px] shrink-0 overflow-hidden rounded-sm border-2 active:translate-y-0 ${active === index ? "border-white" : "border-transparent opacity-70 hover:opacity-100"}`}><img src={src} alt="" className="aspect-video w-full object-cover" /></button>)}</div>

          <main className="mt-14 max-w-[920px] space-y-16 text-[17px] leading-[1.65] text-[#a5a5ad]">
            <section><SectionTitle>Overview</SectionTitle><p className="mt-4">Zero Dash delivers an exciting arcade experience where players navigate dynamic platforming levels, collect coins, and avoid dangerous obstacles. Improve your skills with every run, climb the live leaderboards, increase your Trust Score, and unlock new milestones while progressing through the 0G gaming ecosystem.</p><GameShot src={gameplay} alt="Zero Dash player profile and obstacle course" /></section>
            <section><SectionTitle>Gameplay</SectionTitle><p className="mt-4">Master precise movement and quick decision-making as you navigate handcrafted levels filled with moving platforms, hidden collectibles, and environmental hazards. The gameplay rewards skill, consistency, and perfect timing, making every attempt an opportunity to beat your previous best.</p><GameShot src={liveRankings} alt="Zero Dash gameplay with live rankings" /></section>
            <section><SectionTitle>Live Leaderboards</SectionTitle><p className="mt-4">Track the top-performing players through real-time leaderboards that update regularly based on the latest scores. Compare your performance with the global community, monitor your ranking, and push for the highest position with every successful run.</p><GameShot src={gameplay} alt="Zero Dash scores and player progression" /></section>
            <section><SectionTitle>Player Profile</SectionTitle><p className="mt-4">Your player profile keeps track of your complete in-game progression, including level, experience points, best score, total coins collected, daily rewards, and connected wallet session. As you continue playing, your profile reflects your achievements and overall growth.</p><GameShot src={networkStatus} alt="Zero Dash 0G Network status and start menu" /></section>
            <section><SectionTitle>Network &amp; Progression</SectionTitle><p className="mt-4">Powered by the 0G Network, Zero Dash integrates blockchain-backed progression with real-time network status and Trust Score tracking. Your gameplay contributes to your on-chain profile, allowing you to build a verifiable record of achievements while enjoying a seamless arcade experience.</p></section>
          </main>
        </div>

        <aside className="overflow-hidden rounded-[16px] border border-[#294d58] bg-gradient-to-b from-[#0b1720] to-[#050a13] shadow-[0_20px_70px_rgba(0,0,0,0.35)] lg:sticky lg:top-24 [&_p]:!text-left">
          <div className="border-b border-white/5 bg-[radial-gradient(circle_at_50%_0%,rgba(0,210,225,0.18),transparent_68%)] px-5 pb-6 pt-8 text-center"><img src={logo} alt="Zero Dash" className="mx-auto h-[92px] w-[190px] object-contain" /></div>
          <div className="p-5"><p className="text-[15px] leading-[1.7] text-[#a5a5ad]">Enter a vibrant pixel-art world where every jump counts. Dodge obstacles, cross floating platforms, collect rewards, and aim for the highest score as you compete with players around the world.</p><div className="mt-4 flex items-center justify-between"><span className="rounded border border-emerald-700/70 bg-emerald-950/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300">Arcade</span><span className="text-[11px] uppercase tracking-wider text-white/35">Browser game</span></div><button type="button" onClick={play} className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#00aaba] to-[#f1b900] py-3 font-semibold text-white transition hover:brightness-110 active:translate-y-0"><Play className="h-4 w-4" /> Play now</button><button type="button" onClick={share} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-[#285163] bg-[#071820] py-2.5 text-sm text-white transition-colors hover:border-cyan-400/60 active:translate-y-0"><Share2 className="h-4 w-4" /> Share</button></div>
        </aside>
      </div>
    </div>
  );
}
