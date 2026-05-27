import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import agentNexus from "@/assets/hybrid.mp4";
import iconTrain from "@/assets/icon-train.png";
import iconBattle from "@/assets/icon-battle.png";
import iconEarn from "@/assets/icon-earn.png";
import iconOwn from "@/assets/Own.png";

const actions = [
  {
    n: "01",
    title: "CREATE",
    desc: "Create your AI Agent and choose its path.",
    img: agentNexus,
    href: "/ai-arena",
  },
  {
    n: "02",
    title: "TRAIN",
    desc: "Train and evolve your agent to make it stronger.",
    img: iconTrain,
    href: "/training",
  },
  {
    n: "03",
    title: "BATTLE",
    desc: "Enter the Arena and battle players worldwide.",
    img: iconBattle,
    href: "/battles",
  },
  {
    n: "04",
    title: "EARN",
    desc: "Win battles, earn rewards and climb the leaderboard.",
    img: iconEarn,
    href: "/leaderboard",
  },
  {
    n: "05",
    title: "OWN",
    desc: "Your AI. Your NFT. Your legacy.",
    img: iconOwn,
    href: "/inventory",
  },
];

export function QuickActions() {
  return (
    <section className="arena-panel overflow-hidden border-white/8 bg-[#04080f]/95 p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-center gap-3 sm:gap-4">
        <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-primary" />
        <h3 className="font-display text-2xl text-white sm:text-3xl">QUICK ACTIONS</h3>
        <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-primary" />
      </div>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-5">
        {actions.map((action, i) => (
          <div key={action.n} className="relative">
            <Link
              to={action.href}
              className="card-glass group flex h-full flex-col overflow-hidden rounded-xl transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_12px_42px_rgba(154,53,255,0.22)]"
            >
              <div className="aspect-square overflow-hidden bg-background/50">
                {action.img.endsWith(".mp4") ? (
                  <video
                    src={action.img}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={action.img}
                    alt={action.title}
                    loading="lazy"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="p-4 text-center md:text-left">
                <div className="font-display text-xl text-primary glow-text">{action.n}</div>
                <div className="mt-2 break-words font-tech text-sm tracking-wider text-white">{action.title}</div>
                <p className="mt-2 text-xs text-muted-foreground">{action.desc}</p>
              </div>
            </Link>
            {i < actions.length - 1 && (
              <ArrowRight className="absolute -right-2 top-1/3 z-10 hidden h-5 w-5 text-primary md:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
