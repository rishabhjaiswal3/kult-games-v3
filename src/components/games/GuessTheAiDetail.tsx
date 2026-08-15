import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, ChevronLeft, ChevronRight, Crown, Globe2, LockKeyhole, Play, Share2, Shield, Star, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { Game } from "@/types/api";
import heroBanner from "@/assets/games/guess-the-ai/hero-banner.webp";
import logo from "@/assets/games/guess-the-ai/logo.png";
import gameModes from "@/assets/games/guess-the-ai/game-modes.webp";
import homeScreen from "@/assets/games/guess-the-ai/home-screen.webp";
import contests from "@/assets/games/guess-the-ai/contest-rewards.webp";
import leaderboard from "@/assets/games/guess-the-ai/leaderboard.webp";
import profile from "@/assets/games/guess-the-ai/profile-progression.webp";

const gallery = [homeScreen, gameModes, contests, leaderboard, profile];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-l-4 border-[#b64cff] pl-3 font-tech text-[22px] font-bold uppercase leading-tight tracking-[-0.01em] text-white sm:text-[26px]">{children}</h2>;
}

function GameShot({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="mt-9 block w-full rounded-[11px] object-cover shadow-[0_22px_65px_rgba(141,60,255,0.13)]" loading="lazy" />;
}

export function GuessTheAiDetail({ game }: { game: Game }) {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const gameId = game.identification ?? game.slug ?? "";
  const play = () => navigate(isAuthenticated ? `/game/${game._id}/play` : "/?login=1");

  const share = async () => {
    const data = { title: "Guess the AI", text: "Check out Guess the AI on Kult Games", url: window.location.href };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  };

  return (
    <div className="mx-auto w-full max-w-[1320px] pb-20 text-[#97979f] [&_p]:text-justify">
      <button type="button" onClick={() => navigate("/games")} className="mb-4 inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#07101d] px-4 py-2.5 font-tech text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:border-purple-400/60 hover:bg-purple-950/20 hover:text-white active:translate-y-0"><ArrowLeft className="h-4 w-4" /> Back to Games</button>

      <section className="relative overflow-hidden rounded-b-xl bg-[#050b14]">
        <img src={heroBanner} alt="Guess the AI visual challenge" className="aspect-[3/1] w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020610]/85 via-transparent to-transparent" />
        <h1 className="absolute bottom-3 left-5 font-tech text-3xl font-black uppercase leading-none tracking-tight text-white sm:bottom-5 sm:left-7 sm:text-5xl lg:text-[56px]">Guess the AI</h1>
      </section>

      <div className="mt-14 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0">
          <SectionTitle>Introduction</SectionTitle>
          <p className="mt-4 max-w-[650px] text-[17px] leading-[1.65] text-[#a5a5ad]">Guess The AI is an interactive visual intelligence game where players test their ability to distinguish AI-generated images from real photographs. Featuring multiple game modes, competitive progression, achievements, and cross-game rewards, the game challenges players to sharpen their observation skills while competing against others around the world.</p>
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">{[
            { label: "Mode", value: "Browser", icon: Globe2 },
            { label: "Arena", value: "0G", icon: Target },
            { label: "Access", value: isAuthenticated ? "Ready" : "Login", icon: LockKeyhole },
          ].map((item) => <div key={item.label} className="flex min-w-0 items-center gap-3 rounded-[9px] border border-purple-600 bg-[#0b071b] px-3 py-3"><item.icon className="h-5 w-5 shrink-0 text-purple-500" /><div className="min-w-0"><div className="text-[10px] uppercase text-white/35">{item.label}</div><div className="truncate text-sm uppercase text-white sm:text-base">{item.value}</div></div></div>)}</div>

          <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,170px),1fr))] gap-3">{[
            { label: "Rating", value: String(game.rating ?? 5), icon: Star, color: "text-[#ffc400] border-[#a57d00]" },
            { label: "Chain", value: "0g Chain", icon: Shield, color: "text-purple-500 border-purple-700" },
            { label: "Leaderboard", value: "Ranks", icon: Crown, color: "text-[#ffc400] border-[#a57d00]", action: () => navigate("/leaderboard") },
            { label: "Marketplace", value: "Inventory", icon: BriefcaseBusiness, color: "text-purple-500 border-purple-700", action: () => navigate(`/inventory?game=${encodeURIComponent(gameId)}`) },
          ].map((item) => <button key={item.label} type="button" onClick={item.action} disabled={!item.action} className="flex min-w-0 items-center gap-2.5 rounded-[5px] border border-[#16132d] bg-[#080719] p-2.5 text-left transition enabled:hover:border-purple-400/50 disabled:cursor-default"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border ${item.color}`}><item.icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-[10px] text-white/60">{item.label}</span><span className="mt-0.5 block text-sm font-bold leading-tight text-white">{item.value}</span></span></button>)}</div>

          <div className="relative mt-14 overflow-hidden rounded-[12px] bg-black">
            <img src={gallery[active]} alt={`Guess the AI screenshot ${active + 1}`} className="aspect-[1.78/1] w-full object-cover" />
            <button type="button" onClick={() => setActive((current) => (current - 1 + gallery.length) % gallery.length)} aria-label="Previous screenshot" className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 touch-manipulation place-items-center rounded-full border border-white/25 bg-black/65 text-white shadow-lg backdrop-blur-sm transition hover:border-cyan-300 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 active:scale-95 sm:left-4"><ChevronLeft className="h-7 w-7" /></button>
            <button type="button" onClick={() => setActive((current) => (current + 1) % gallery.length)} aria-label="Next screenshot" className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 touch-manipulation place-items-center rounded-full border border-white/25 bg-black/65 text-white shadow-lg backdrop-blur-sm transition hover:border-cyan-300 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 active:scale-95 sm:right-4"><ChevronRight className="h-7 w-7" /></button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">{gallery.map((_, index) => <button key={index} type="button" onClick={() => setActive(index)} aria-label={`Show screenshot ${index + 1}`} className={`h-2 w-2 rounded-full active:translate-y-0 ${active === index ? "bg-white" : "bg-white/35"}`} />)}</div>
          </div>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-1">{gallery.map((src, index) => <button key={src} type="button" onClick={() => setActive(index)} className={`w-[146px] shrink-0 overflow-hidden rounded-sm border-2 active:translate-y-0 ${active === index ? "border-white" : "border-transparent opacity-70 hover:opacity-100"}`}><img src={src} alt="" className="aspect-video w-full object-cover" /></button>)}</div>

          <main className="mt-14 max-w-[920px] space-y-16 text-[17px] leading-[1.65] text-[#a5a5ad]">
            <section><SectionTitle>Overview</SectionTitle><p className="mt-4">Guess The AI combines entertainment with visual reasoning by presenting a variety of image-based challenges that become increasingly difficult as players progress. Earn XP, maintain winning streaks, unlock achievements, participate in contests, and climb the global leaderboard while enjoying a seamless and rewarding gameplay experience within the Kult ecosystem.</p><GameShot src={gameModes} alt="Guess the AI game modes" /></section>
            <section><SectionTitle>Game Modes</SectionTitle><p className="mt-4">The game offers multiple modes including Classic, Duel, Multi-Select, and Odd One Out, each designed to test a different aspect of visual perception. Players must carefully analyze images, compare subtle details, and make accurate decisions to build streaks, improve their scores, and unlock new challenges.</p><GameShot src={contests} alt="Guess the AI contest reward" /></section>
            <section><SectionTitle>Contests</SectionTitle><p className="mt-4">Special contests reward players for consistency rather than speed. By maintaining long winning streaks and completing event objectives, players can unlock exclusive cross-game rewards, collectible items, and limited-time prizes that carry across the Kult gaming ecosystem.</p><GameShot src={leaderboard} alt="Guess the AI global leaderboard" /></section>
            <section><SectionTitle>Leaderboards</SectionTitle><p className="mt-4">The leaderboard ranks players based on their performance, accuracy, and total score. Compete with thousands of players worldwide, improve your ranking through consistent gameplay, and earn recognition as one of the community&apos;s top AI image detectives.</p><GameShot src={profile} alt="Guess the AI player profile and trophies" /></section>
            <section><SectionTitle>Player Profile &amp; Progression</SectionTitle><p className="mt-4">Your profile serves as your personal progress hub, displaying your level, XP progression, best streak, current score, unlocked achievements, and trophy collection. As you continue playing, new milestones, badges, and rewards become available, reflecting your growth and mastery of AI image detection.</p></section>
          </main>
        </div>

        <aside className="order-first overflow-hidden rounded-[16px] border border-[#432460] bg-gradient-to-b from-[#110b22] to-[#050a13] shadow-[0_20px_70px_rgba(0,0,0,0.35)] lg:sticky lg:top-24 lg:order-none [&_p]:!text-left">
          <div className="border-b border-white/5 bg-[radial-gradient(circle_at_50%_0%,rgba(176,68,255,0.22),transparent_68%)] px-5 pb-7 pt-9 text-center"><img src={logo} alt="Guess the AI" className="mx-auto h-[112px] w-[118px] object-contain" /><h3 className="mt-1 font-tech text-lg font-bold uppercase text-white">Guess the AI</h3></div>
          <div className="p-6"><p className="text-[15px] leading-[1.7] text-[#a5a5ad]">Welcome to Guess The AI, where every image is a challenge. Test your ability to spot AI-generated visuals, compete across multiple game modes, earn rewards, and prove your skills against players from around the world.</p><div className="mt-5 flex items-center justify-between"><span className="rounded border border-emerald-700/70 bg-emerald-950/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300">Puzzle</span><span className="text-[11px] uppercase tracking-wider text-white/35">Browser game</span></div><button type="button" onClick={play} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#4c48ff] to-[#d33df0] py-3.5 font-semibold text-white transition hover:brightness-110 active:translate-y-0"><Play className="h-4 w-4" /> Play now</button><button type="button" onClick={share} className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-md border border-[#42295f] bg-[#10091e] py-3 text-sm text-white transition-colors hover:border-purple-400/60 active:translate-y-0"><Share2 className="h-4 w-4" /> Share</button><button type="button" onClick={() => navigate(`/inventory?game=${encodeURIComponent(gameId)}`)} className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-md border border-[#b64cff]/30 bg-gradient-to-b from-[#1a0c2c] to-[#10091e] py-3 text-sm text-white transition hover:border-[#b64cff]/60 hover:shadow-[0_0_20px_rgba(182,76,255,0.18)] active:translate-y-0"><BriefcaseBusiness className="h-4 w-4 text-[#c98bff]" /> Inventory</button></div>
        </aside>
      </div>
    </div>
  );
}
