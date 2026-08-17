import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, ChevronLeft, ChevronRight, Crown, Globe2, LockKeyhole, Play, Share2, Shield, Star, Target } from "lucide-react";
import type { Game } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";
import { GameAirdropBanner } from "@/components/games/GameAirdropBanner";
import { getGameAirdrop } from "@/constants/gameAirdrops";
import { getGameKey } from "@/lib/gameDisplay";
import mainMenu from "@/assets/games/warzone/main-menu.webp";
import weaponSystem from "@/assets/games/warzone/weapon-system.webp";
import gemStore from "@/assets/games/warzone/gem-store.webp";
import boosterSelection from "@/assets/games/warzone/booster-selection.webp";
import gameplay from "@/assets/games/warzone/gameplay.webp";
import quests from "@/assets/games/warzone/quests.webp";
import characters from "@/assets/games/warzone/characters.webp";
import logo from "@/assets/games/warzone/logo.png";
import heroBanner from "@/assets/games/warzone/hero-banner.webp";

const gallery = [mainMenu, boosterSelection, quests, gemStore, characters];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-l-4 border-purple-500 pl-3 font-tech text-[22px] font-bold uppercase leading-tight tracking-[-0.01em] text-white sm:text-[26px]">{children}</h2>;
}

function GameShot({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="mt-9 block w-full rounded-[11px] object-cover" loading="lazy" />;
}

export function WarzoneWarriorsDetail({ game }: { game: Game }) {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const gameId = game.identification ?? game.slug ?? "";
  const airdrop = getGameAirdrop(getGameKey(game));

  const play = () => navigate(isAuthenticated ? `/game/${game._id}/play` : "/?login=1");

  const share = async () => {
    const data = { title: "Warzone Warriors", text: "Check out Warzone Warriors on Kult Games", url: window.location.href };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  };

  return (
    <div className="mx-auto w-full max-w-[1320px] pb-20 text-[#8d8d91] [&_p]:text-justify">
      <button
        type="button"
        onClick={() => navigate("/games")}
        className="mb-4 inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#07101d] px-4 py-2.5 font-tech text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:border-purple-500/60 hover:bg-purple-950/20 hover:text-white active:translate-y-0"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Games
      </button>

      <section className="relative overflow-hidden bg-[#050b14]">
        <img src={heroBanner} alt="Warzone Warriors battle" className="aspect-[3/1] w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020610]/80 via-transparent to-transparent" />
        <h1 className="absolute bottom-3 left-5 font-tech text-3xl font-black uppercase leading-none tracking-tight text-white sm:bottom-5 sm:left-7 sm:text-5xl lg:text-[56px]">Warzone Warriors</h1>
      </section>

      {/* The page justifies every paragraph; the banner needs its own left alignment. */}
      {airdrop ? <GameAirdropBanner drop={airdrop} onClaim={play} className="mt-6 [&_p]:!text-left" /> : null}

      <div className="mt-14 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_350px] xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0">
        <SectionTitle>Introduction</SectionTitle>
        <p className="mt-4 max-w-[620px] text-[17px] leading-[1.65] text-[#a5a5ad]">Warzone Warriors is all about quick missions, tight controls, and steady progression. You&apos;re dropped into enemy territory with one goal: clear the zone and survive. As you go, you&apos;ll unlock new weapons, boosters, and characters that change how each run plays out. It&apos;s straightforward, satisfying, and easy to keep coming back to when you&apos;ve got a few minutes to kill or want to grind through harder missions.</p>
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
            <button key={item.label} type="button" onClick={item.action} disabled={!item.action} className="flex min-w-0 items-center gap-2.5 rounded-[5px] border border-[#16132d] bg-[#080719] p-2.5 text-left disabled:cursor-default">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border ${item.color}`}><item.icon className="h-4 w-4" /></span>
              <span className="min-w-0"><span className="block text-[10px] text-white/60">{item.label}</span><span className="mt-0.5 block text-sm font-bold leading-tight text-white">{item.value}</span></span>
            </button>
          ))}
        </div>

        <div className="relative mt-14 overflow-hidden rounded-[12px] bg-black">
          <img src={gallery[active]} alt={`Warzone Warriors screenshot ${active + 1}`} className="aspect-[1.78/1] w-full object-cover" />
          <button type="button" onClick={() => setActive((current) => (current - 1 + gallery.length) % gallery.length)} aria-label="Previous screenshot" className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 touch-manipulation place-items-center rounded-full border border-white/25 bg-black/65 text-white shadow-lg backdrop-blur-sm transition hover:border-cyan-300 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 active:scale-95 sm:left-4">
            <ChevronLeft className="h-7 w-7" />
          </button>
          <button type="button" onClick={() => setActive((current) => (current + 1) % gallery.length)} aria-label="Next screenshot" className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 touch-manipulation place-items-center rounded-full border border-white/25 bg-black/65 text-white shadow-lg backdrop-blur-sm transition hover:border-cyan-300 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 active:scale-95 sm:right-4">
            <ChevronRight className="h-7 w-7" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {gallery.map((_, index) => <button key={index} type="button" onClick={() => setActive(index)} aria-label={`Show screenshot ${index + 1}`} className={`h-2 w-2 rounded-full active:translate-y-0 ${active === index ? "bg-white" : "bg-white/35"}`} />)}
          </div>
        </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-1">
        {gallery.map((src, index) => (
          <button key={src} type="button" onClick={() => setActive(index)} className={`w-[152px] shrink-0 overflow-hidden rounded-sm border-2 ${active === index ? "border-white" : "border-transparent opacity-70 hover:opacity-100"}`}>
            <img src={src} alt="" className="aspect-video w-full object-cover" />
          </button>
        ))}
      </div>

      <main className="mt-14 max-w-[920px] space-y-16 text-[17px] leading-[1.65] text-[#a5a5ad] [&_strong]:font-semibold [&_strong]:text-white/80 [&_li]:pl-1">
        <section>
          <SectionTitle>Overview</SectionTitle>
          <div className="mt-3 space-y-3">
            <p>Warzone Warriors is a 2D side-scrolling <u>shooter</u> focused on fast action, short missions, and gear progression. Players step into the boots of an elite soldier deployed across hostile zones to take down enemy forces, rescue hostages, and face off against heavily armed bosses. The game mixes arcade-style shooting with modern upgrade systems, letting players unlock new weapons, boosters, and characters as they progress.</p>
            <p>Missions are short and replayable, with multiple difficulty levels and performance-based rewards. Whether you&apos;re grinding for better gear or just looking to clear a few levels, Warzone Warriors sticks to familiar mechanics that don&apos;t get in the way of the shooting.</p>
          </div>
          <GameShot src={gameplay} alt="Warzone Warriors desert gameplay" />
        </section>

        <section>
          <SectionTitle>Gameplay and Features</SectionTitle>
          <p className="mt-3">The game is split into three world maps, each containing 7 to 8 missions with a mix of standard shootouts, survival challenges, boss battles, and bonus stages centered around coin collection. Every mission can be played on one of three difficulty levels: Easy, Normal, or Crazy, allowing players to adjust the challenge to match their skill level. Missions are scored based on performance, and many include optional objectives such as rescuing hostages, finishing within a time limit, or completing the level without dying.</p>
          <GameShot src={weaponSystem} alt="Warzone Warriors weapon selection" />
        </section>

        <section>
          <SectionTitle>Weapon System</SectionTitle>
          <p className="mt-3">Weapons are core to progression. There are 22+ unlockable weapons across categories:</p>
          <ul className="ml-7 list-square">
            <li><strong>Primary:</strong> Rifles, SMGs, flamethrowers</li>
            <li><strong>Secondary:</strong> Shotguns, rocket launchers</li>
            <li><strong>Melee:</strong> Knives, swords</li>
            <li><strong>Grenades:</strong> Area-effect throwables with bounce physics</li>
          </ul>
          <div className="mt-7 space-y-0">
            <p>Weapons in Warzone Warriors can be upgraded in four key areas: damage, fire rate, ammo capacity, and reload speed. These upgrades allow players to improve performance in combat, helping weapons feel more responsive and effective as missions get tougher.</p>
            <p>Gear is unlocked progressively through normal gameplay as players complete missions and earn rewards. Some weapons and equipment can also be obtained by spending in-game currency. For those who want to access certain items faster, a selection of weapons is available through in-app purchases, offering an optional shortcut to bypass some of the grinding.</p>
          </div>
          <GameShot src={characters} alt="Warzone Warriors characters" />
        </section>

        <section>
          <SectionTitle>Characters</SectionTitle>
          <div className="mt-3">
            <p>There are three playable characters in Warzone Warriors, each with their own stats that affect speed, health, and ability performance. The starting character is Soldier Alpha, a balanced choice suited for general play. As you progress or make in-app purchases, you can unlock Shadow Dancer, who offers quicker movement, and Oldman Tracer, who leans more toward damage output but may be slower or less durable.</p>
            <p>Each character brings a slightly different playstyle to the game. Depending on the mission type or difficulty setting, switching characters can offer strategic advantages, whether it&apos;s moving faster through tight areas or lasting longer in heavy firefights.</p>
          </div>
          <GameShot src={boosterSelection} alt="Warzone Warriors booster selection" />
        </section>

        <section>
          <SectionTitle>Boosters</SectionTitle>
          <p className="mt-3">Before jumping into a mission, players can equip up to three boosters for extra support. Boosters offer various effects and can be unlocked through gameplay or purchased using in-game currency.</p>
          <p className="mt-3">Available Boosters:</p>
          <ul className="ml-7 list-square">
            <li>Shield Boost - Adds armor at mission start</li><li>Power Shot - Increases damage output</li><li>Accuracy Chip - Tightens aiming</li><li>Coin Magnet - Pulls in nearby coins</li><li>Speed Serum - Boosts movement speed</li>
          </ul>
          <GameShot src={gemStore} alt="Warzone Warriors gem packs" />
        </section>

        <section>
          <SectionTitle>Quests and Challenges</SectionTitle>
          <p className="mt-3">Warzone Warriors features a variety of rotating daily quests that give players extra rewards for completing specific in-game tasks. These quests can include objectives like reaching a certain kill count, finishing a mission without taking any damage, using particular weapons during gameplay, or maintaining a consistent login streak. They&apos;re designed to encourage regular play and offer small, achievable goals each day.</p>
          <GameShot src={quests} alt="Warzone Warriors daily quests" />
          <p className="mt-7">In addition to daily quests, the game includes longer-term achievements that track overall progression. These are tied to milestones such as unlocking new gear, completing a set number of missions, or reaching a total enemy kill count. Players are rewarded for hitting these goals with useful in-game items like coins, premium gems, XP boosters, and unlock keys. These rewards can be used to gain access to new weapons, characters, and upgrades that support continued progress across all difficulty modes.</p>
        </section>

        <section>
          <SectionTitle>How to Get Started</SectionTitle>
          <p className="mt-3">If you&apos;re interested in checking out Warzone Warriors, here&apos;s how to jump in:</p>
          <ol className="ml-8 list-decimal">
            <li>Open the game in any browser available.</li>
            <li>Connect your wallet and mint the <u>Warrior Squad NFT</u> to access the game.</li>
            <li>Launch the intro mission to learn basic movement, shooting mechanics, and how pickups and enemies work.</li>
            <li>Start with Soldier Alpha and a basic rifle; progress through missions to unlock new weapons and gear automatically.</li>
            <li>Equip boosters like Shield Boost or Accuracy Chip before missions to get an edge while learning enemy patterns.</li>
          </ol>
        </section>
      </main>
        </div>

        <aside className="order-first overflow-hidden rounded-[16px] border border-[#362052] bg-gradient-to-b from-[#0b1020] to-[#050a13] shadow-[0_20px_70px_rgba(0,0,0,0.35)] lg:sticky lg:top-24 lg:order-none [&_p]:!text-left">
          <div className="border-b border-white/5 bg-[radial-gradient(circle_at_50%_0%,rgba(145,50,255,0.18),transparent_68%)] px-5 pb-7 pt-8 text-center">
            <img src={logo} alt="Warzone Warriors" className="mx-auto h-[104px] w-[112px] object-contain" />
            <h3 className="mt-2 font-tech text-lg font-bold uppercase text-white">Warzone Warriors</h3>
          </div>
          <div className="p-6">
            <p className="text-[15px] leading-[1.7] text-[#a5a5ad]">A 2D side-scrolling shooter where players take on enemy forces, upgrade weapons, and clear missions across hostile maps packed with firepower and boss fights.</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="inline-block rounded border border-emerald-700/70 bg-emerald-950/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300">Shooting</span>
              <span className="text-[11px] uppercase tracking-wider text-white/35">Browser game</span>
            </div>
            <button type="button" onClick={play} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#681fd0] to-[#973af4] py-3.5 font-semibold text-white transition hover:brightness-110 active:translate-y-0">
              <Play className="h-4 w-4" /> Play now
            </button>
            <button type="button" onClick={share} className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-md border border-[#24405e] bg-[#071426] py-3 text-sm text-white transition-colors hover:border-purple-500/60 active:translate-y-0">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button type="button" onClick={() => navigate(`/inventory?game=${encodeURIComponent(gameId)}`)} className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-md border border-[#9a35ff]/30 bg-gradient-to-b from-[#170c28] to-[#08060f] py-3 text-sm text-white transition hover:border-[#9a35ff]/60 hover:shadow-[0_0_20px_rgba(154,53,255,0.18)] active:translate-y-0">
              <BriefcaseBusiness className="h-4 w-4 text-[#b98bff]" /> Inventory
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
