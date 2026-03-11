import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Users, Swords, Trophy, Zap, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import ParticleField from "@/components/ParticleField";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MageCharacter from "@/components/MageCharacter";
import mageBattle from "@/assets/mage-battle.png";
import AIScanLine from "@/components/AIScanLine";

const events = [
  { id: 1, title: "Zero Dash Championship", game: "Zero Dash", date: "Mar 15, 2026", time: "8:00 PM UTC", prize: "5 ETH", players: "128/256", status: "Registering", type: "Tournament", description: "The ultimate speed run showdown. Top 3 runners take home massive rewards." },
  { id: 2, title: "Robo Wars Arena Season 3", game: "Robo Wars", date: "Mar 20, 2026", time: "6:00 PM UTC", prize: "10 ETH", players: "64/64", status: "Full", type: "Season", description: "Season 3 of the most intense robot fighting league. Prepare your mechs." },
  { id: 3, title: "Highway Hustle Grand Prix", game: "Highway Hustle", date: "Mar 25, 2026", time: "9:00 PM UTC", prize: "3 ETH", players: "45/100", status: "Registering", type: "Tournament", description: "Race through neon highways in this high-stakes grand prix event." },
  { id: 4, title: "AI Mind Games Open", game: "Guess The AI", date: "Apr 1, 2026", time: "4:00 PM UTC", prize: "2 ETH", players: "200/500", status: "Registering", type: "Open", description: "Can you outsmart the AI? Open tournament for all skill levels." },
  { id: 5, title: "Zero G Pool Masters", game: "Zero G Pool", date: "Apr 5, 2026", time: "7:00 PM UTC", prize: "4 ETH", players: "32/32", status: "Full", type: "Invitational", description: "Invitation-only pool championship in zero gravity. The best of the best." },
];

const statusFilters = ["All", "Registering", "Full"];

const Events = () => {
  const [filter, setFilter] = useState("All");
  const filtered = events.filter((e) => filter === "All" || e.status === filter);

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleField />
      <Navbar />

      <section className="relative pt-24 pb-20 z-10">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-15">
          <source src="/videos/SC_1-3.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/75" />
        <AIScanLine />

        {/* Cyan ambient glows */}
        <div className="absolute top-40 left-0 w-[500px] h-[400px] rounded-full bg-neon-cyan/4 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-20 right-0 w-[400px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  className="w-2 h-2 rounded-full bg-neon-cyan"
                  animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(195 100% 60%)", "0 0 15px hsl(195 100% 60%)", "0 0 4px hsl(195 100% 60%)"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs font-mono text-neon-cyan tracking-[0.2em] uppercase">
                  <Swords className="w-3 h-3 inline mr-1" /> Battles & Events
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tight">
                EVENTS & <span className="gradient-text">TOURNAMENTS</span>
              </h1>
              <p className="text-muted-foreground mt-3 max-w-lg text-sm">Compete in epic tournaments, earn rewards, and rise to glory on-chain.</p>
            </motion.div>

            {/* Mage character */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="hidden lg:block w-[280px] xl:w-[320px] flex-shrink-0"
            >
              <MageCharacter src={mageBattle} alt="Battle Mage" glowColor="blue" showMask />
            </motion.div>
          </div>

          {/* Featured event */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden mb-10 border border-neon-cyan/20 group"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 via-primary/5 to-neon-cyan/5" />
            <motion.div
              className="absolute inset-0 pointer-events-none"
            >
              <motion.div
                className="absolute left-0 right-0 h-[1px]"
                style={{ background: "linear-gradient(90deg, transparent, hsl(195 100% 60% / 0.4), transparent)" }}
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            <div className="relative z-10 p-6 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-neon-cyan" />
                    <span className="text-xs font-display font-bold text-neon-cyan tracking-wider">FEATURED EVENT</span>
                    <motion.div
                      className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      LIVE
                    </motion.div>
                  </div>
                  <h2 className="font-display text-2xl md:text-4xl font-black text-foreground tracking-tight mb-2">{events[0].title}</h2>
                  <p className="text-muted-foreground mb-6 max-w-xl">{events[0].description}</p>

                  <div className="flex flex-wrap gap-5 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-neon-cyan" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-mono">DATE</p>
                        <p className="text-sm text-foreground font-semibold">{events[0].date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-mono">TIME</p>
                        <p className="text-sm text-foreground font-semibold">{events[0].time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[hsl(var(--gold))]/10 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-[hsl(var(--gold))]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-mono">PRIZE</p>
                        <p className="text-sm text-[hsl(var(--gold))] font-display font-bold">{events[0].prize}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-mono">PLAYERS</p>
                        <p className="text-sm text-foreground font-semibold">{events[0].players}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button className="px-8 py-4 rounded-xl font-display text-sm font-semibold tracking-wider bg-neon-cyan text-background hover:shadow-[0_0_30px_hsl(195_100%_60%/0.4)] transition-all duration-300 flex items-center gap-2 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ["-200%", "200%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <Zap className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">REGISTER NOW</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filter pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2 mb-8"
          >
            {statusFilters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full font-display text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-300 ${
                  filter === f
                    ? "bg-neon-cyan text-background shadow-[0_0_15px_hsl(195_100%_60%/0.3)]"
                    : "glass-panel text-muted-foreground hover:text-foreground hover:border-neon-cyan/30"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </motion.div>

          {/* Events list */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((event, i) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border/50 bg-card/50 hover:border-neon-cyan/30 hover:bg-card/80 transition-all duration-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold tracking-wider ${
                        event.status === "Registering" ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30" :
                        event.status === "Full" ? "bg-destructive/15 text-destructive border border-destructive/30" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {event.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground border border-border/50 rounded-full px-2 py-0.5">{event.type}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-neon-cyan transition-colors">{event.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md">{event.description}</p>
                  </div>

                  <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-neon-cyan/70" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Trophy className="w-3.5 h-3.5 text-[hsl(var(--gold))]" />
                      <span className="text-[hsl(var(--gold))] font-display font-bold">{event.prize}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {event.players}
                    </div>
                    <button
                      disabled={event.status === "Full"}
                      className={`px-5 py-2.5 rounded-lg font-display text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 ${
                        event.status === "Full"
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan hover:text-background hover:shadow-[0_0_20px_hsl(195_100%_60%/0.3)]"
                      }`}
                    >
                      {event.status === "Full" ? "FULL" : <>JOIN <ArrowRight className="w-3 h-3" /></>}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
