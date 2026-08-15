import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, ChevronLeft, ChevronRight, Crown, Download, Globe2, LockKeyhole, Share2, Shield, Star, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { gameDownloadUrl } from "@/lib/gameDownload";
import { triggerBrowserDownload } from "@/lib/triggerBrowserDownload";
import type { Game } from "@/types/api";
import heroBanner from "@/assets/games/robowar/hero-banner.webp";
import logo from "@/assets/games/robowar/logo.png";
import mainMenu from "@/assets/games/robowar/main-menu.webp";
import customization from "@/assets/games/robowar/robot-customization.webp";
import levelUp from "@/assets/games/robowar/level-up.webp";
import arenaCombat from "@/assets/games/robowar/arena-combat.webp";
import energyCombat from "@/assets/games/robowar/energy-combat.webp";
import matchResults from "@/assets/games/robowar/match-results.webp";

const gallery = [mainMenu, customization, levelUp, arenaCombat, energyCombat, matchResults];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-l-4 border-[#ff315f] pl-3 font-tech text-[22px] font-bold uppercase leading-tight tracking-[-0.01em] text-white sm:text-[26px]">{children}</h2>;
}

function GameShot({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="mt-9 block w-full rounded-[11px] object-cover shadow-[0_22px_60px_rgba(195,21,91,0.12)]" loading="lazy" />;
}

export function RoboWarsDetail({ game }: { game: Game }) {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const gameId = game.identification ?? game.slug ?? "";
  const download = () => triggerBrowserDownload(gameDownloadUrl(game));

  const share = async () => {
    const data = { title: "Robo Wars", text: "Check out Robo Wars on Kult Games", url: window.location.href };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  };

  return (
    <div className="mx-auto w-full max-w-[1320px] pb-20 text-[#97979f] [&_p]:text-justify">
      <button type="button" onClick={() => navigate("/games")} className="mb-4 inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#07101d] px-4 py-2.5 font-tech text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:border-[#ff315f]/60 hover:bg-[#3a0716]/30 hover:text-white active:translate-y-0">
        <ArrowLeft className="h-4 w-4" /> Back to Games
      </button>

      <section className="relative overflow-hidden bg-[#050b14]">
        <img src={heroBanner} alt="Robo Wars arena battle" className="aspect-[3/1] w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020610]/85 via-transparent to-transparent" />
        <h1 className="absolute bottom-3 left-5 font-tech text-3xl font-black uppercase leading-none tracking-tight text-white sm:bottom-5 sm:left-7 sm:text-5xl lg:text-[56px]">Robo Wars</h1>
      </section>

      <div className="mt-14 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0">
          <SectionTitle>Introduction</SectionTitle>
          <p className="mt-4 max-w-[650px] text-[17px] leading-[1.65] text-[#a5a5ad]">Robo Wars is an action-packed robot combat game where players build, customize, and battle powerful machines in intense arena fights. Featuring strategic gameplay, unique robot classes, and dynamic combat mechanics, every match challenges players to outmaneuver opponents using skill, precision, and powerful weapons. Upgrade your machines, master different battle styles, and fight your way to the top of the arena.</p>
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">
            {[
              { label: "Mode", value: "Browser", icon: Globe2 },
              { label: "Arena", value: "0G", icon: Target },
              { label: "Access", value: isAuthenticated ? "Ready" : "Login", icon: LockKeyhole },
            ].map((item) => (
              <div key={item.label} className="flex min-w-0 items-center gap-3 rounded-[9px] border border-purple-600 bg-[#0b071b] px-3 py-3">
                <item.icon className="h-5 w-5 shrink-0 text-purple-500" />
                <div className="min-w-0"><div className="text-[10px] uppercase text-white/35">{item.label}</div><div className="truncate text-sm uppercase text-white sm:text-base">{item.value}</div></div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,170px),1fr))] gap-3">
            {[
              { label: "Rating", value: String(game.rating ?? 5), icon: Star, color: "text-[#ffc400] border-[#a57d00]" },
              { label: "Chain", value: "0g Chain", icon: Shield, color: "text-purple-500 border-purple-700" },
              { label: "Leaderboard", value: "Ranks", icon: Crown, color: "text-[#ffc400] border-[#a57d00]", action: () => navigate("/leaderboard") },
              { label: "Marketplace", value: "Inventory", icon: BriefcaseBusiness, color: "text-purple-500 border-purple-700", action: () => navigate(`/inventory?game=${encodeURIComponent(gameId)}`) },
            ].map((item) => (
              <button key={item.label} type="button" onClick={item.action} disabled={!item.action} className="flex min-w-0 items-center gap-2.5 rounded-[5px] border border-[#16132d] bg-[#080719] p-2.5 text-left transition enabled:hover:border-[#ff315f]/40 disabled:cursor-default">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border ${item.color}`}><item.icon className="h-4 w-4" /></span>
                <span className="min-w-0"><span className="block text-[10px] text-white/60">{item.label}</span><span className="mt-0.5 block text-sm font-bold leading-tight text-white">{item.value}</span></span>
              </button>
            ))}
          </div>

          <div className="relative mt-14 overflow-hidden rounded-[12px] bg-black">
            <img src={gallery[active]} alt={`Robo Wars screenshot ${active + 1}`} className="aspect-[1.78/1] w-full object-cover" />
            <button type="button" onClick={() => setActive((current) => (current - 1 + gallery.length) % gallery.length)} aria-label="Previous screenshot" className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 touch-manipulation place-items-center rounded-full border border-white/25 bg-black/65 text-white shadow-lg backdrop-blur-sm transition hover:border-cyan-300 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 active:scale-95 sm:left-4"><ChevronLeft className="h-7 w-7" /></button>
            <button type="button" onClick={() => setActive((current) => (current + 1) % gallery.length)} aria-label="Next screenshot" className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 touch-manipulation place-items-center rounded-full border border-white/25 bg-black/65 text-white shadow-lg backdrop-blur-sm transition hover:border-cyan-300 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 active:scale-95 sm:right-4"><ChevronRight className="h-7 w-7" /></button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">{gallery.map((_, index) => <button key={index} type="button" onClick={() => setActive(index)} aria-label={`Show screenshot ${index + 1}`} className={`h-2 w-2 rounded-full active:translate-y-0 ${active === index ? "bg-white" : "bg-white/35"}`} />)}</div>
          </div>

          <div className="mt-6 flex gap-4 overflow-x-auto pb-1">
            {gallery.map((src, index) => <button key={src} type="button" onClick={() => setActive(index)} className={`w-[142px] shrink-0 overflow-hidden rounded-sm border-2 active:translate-y-0 ${active === index ? "border-white" : "border-transparent opacity-70 hover:opacity-100"}`}><img src={src} alt="" className="aspect-video w-full object-cover" /></button>)}
          </div>

          <main className="mt-14 max-w-[920px] space-y-16 text-[17px] leading-[1.65] text-[#a5a5ad]">
            <section><SectionTitle>Overview</SectionTitle><p className="mt-4">Robo Wars combines fast-paced arena combat with deep progression and customization systems. Players can select different robots, personalize their appearance, level up through victories, and unlock stronger upgrades as they progress. With immersive battle arenas, real-time combat, rewarding progression, and competitive gameplay, Robo Wars offers an exciting experience for both casual players and competitive robot fighters.</p><GameShot src={levelUp} alt="Robo Wars level-up moment" /></section>
            <section><SectionTitle>Gameplay</SectionTitle><p className="mt-4">Master precise movement and quick decision-making as you navigate handcrafted levels filled with moving platforms, hidden collectibles, and environmental hazards. The gameplay rewards skill, consistency, and perfect timing, making every attempt an opportunity to beat your previous best.</p><GameShot src={customization} alt="Robo Wars robot workshop" /></section>
            <section><SectionTitle>Robot Customization</SectionTitle><p className="mt-4">Customize your robot by selecting different combat builds, appearances, and color styles. Each robot features unique characteristics, allowing players to create a machine that matches their preferred fighting strategy.</p><GameShot src={arenaCombat} alt="Customized robots battling in the arena" /></section>
            <section><SectionTitle>Combat System</SectionTitle><p className="mt-4">Battle against AI or other robots in fast-paced arena matches where timing, positioning, and weapon control determine victory. Keep an eye on your energy, score points through successful attacks, and outlast your opponent before time runs out.</p><GameShot src={energyCombat} alt="Robo Wars energy-based combat" /></section>
            <section><SectionTitle>Level Progression</SectionTitle><p className="mt-4">Earn experience through every battle to level up your robot and unlock new milestones. As you progress, stronger opponents, improved rewards, and additional customization options become available.</p><GameShot src={matchResults} alt="Robo Wars match result battle" /></section>
            <section><SectionTitle>Match Results</SectionTitle><p className="mt-4">Every match concludes with a detailed performance summary, displaying your score, earned rewards, and overall battle results. Analyze your performance, improve your strategy, and prepare for the next challenge.</p></section>
          </main>
        </div>

        <aside className="order-first overflow-hidden rounded-[16px] border border-[#4a1731] bg-gradient-to-b from-[#130b20] to-[#050a13] shadow-[0_20px_70px_rgba(0,0,0,0.35)] lg:sticky lg:top-24 lg:order-none [&_p]:!text-left">
          <div className="border-b border-white/5 bg-[radial-gradient(circle_at_50%_0%,rgba(255,35,94,0.18),transparent_68%)] px-5 pb-9 pt-11 text-center"><img src={logo} alt="Robo Wars" className="mx-auto h-[54px] w-[230px] object-contain" /></div>
          <div className="p-6">
            <p className="text-[15px] leading-[1.7] text-[#a5a5ad]">Choose your combat robot, enter the arena, and defeat opponents using powerful weapons and smart tactics. Every battle earns experience, improves your score, and brings you closer to becoming the arena champion.</p>
            <div className="mt-5 flex items-center justify-between"><span className="rounded border border-emerald-700/70 bg-emerald-950/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300">Shooting</span><span className="text-[11px] uppercase tracking-wider text-white/35">Browser game</span></div>
            <button type="button" onClick={download} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#d51b50] to-[#ff3e74] py-3.5 font-semibold text-white transition hover:brightness-110 active:translate-y-0"><Download className="h-4 w-4" /> Download</button>
            <button type="button" onClick={share} className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-md border border-[#4b263e] bg-[#100916] py-3 text-sm text-white transition-colors hover:border-[#ff315f]/60 active:translate-y-0"><Share2 className="h-4 w-4" /> Share</button>
            <button type="button" onClick={() => navigate(`/inventory?game=${encodeURIComponent(gameId)}`)} className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-md border border-[#ff315f]/30 bg-gradient-to-b from-[#1c0c15] to-[#100916] py-3 text-sm text-white transition hover:border-[#ff315f]/60 hover:shadow-[0_0_20px_rgba(255,49,95,0.18)] active:translate-y-0"><BriefcaseBusiness className="h-4 w-4 text-[#ff315f]" /> Inventory</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
