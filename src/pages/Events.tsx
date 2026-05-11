import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Users, Swords, Trophy, Zap, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import Footer from "@/components/Footer";
import AutoPlayVideo from "@/components/AutoPlayVideo";

const events = [
  { id: 1, title: "Zero Dash Championship", game: "Zero Dash", date: "Mar 15, 2026", time: "8:00 PM UTC", prize: "5 ETH", players: "128/256", status: "Registering", type: "Tournament", description: "The ultimate speed run showdown. Top 3 runners take home massive rewards." },
  { id: 2, title: "Robo Wars Arena Season 3", game: "Robo Wars", date: "Mar 20, 2026", time: "6:00 PM UTC", prize: "10 ETH", players: "64/64", status: "Full", type: "Season", description: "Season 3 of the most intense robot fighting league. Prepare your mechs." },
  { id: 3, title: "Highway Hustle Grand Prix", game: "Highway Hustle", date: "Mar 25, 2026", time: "9:00 PM UTC", prize: "3 ETH", players: "45/100", status: "Registering", type: "Tournament", description: "Race through neon highways in this high-stakes grand prix event." },
  { id: 4, title: "AI Mind Games Open", game: "Guess The AI", date: "Apr 1, 2026", time: "4:00 PM UTC", prize: "2 ETH", players: "200/500", status: "Registering", type: "Open", description: "Can you outsmart the AI? Open tournament for all skill levels." },
  { id: 5, title: "Zero G Pool Masters", game: "Zero G Pool", date: "Apr 5, 2026", time: "7:00 PM UTC", prize: "4 ETH", players: "32/32", status: "Full", type: "Invitational", description: "Invitation-only pool championship in zero gravity. The best of the best." },
];

const statusFilters = [
  { label: "All", value: "All" },
  { label: "Active / Ongoing", value: "Registering" },
  { label: "Full", value: "Full" },
  { label: "Yours", value: "Yours" },
];

const YOURS_IDS = new Set<number>(); // user-participated events (populated from API when available)

const Events = () => {
  const [filter, setFilter] = useState("All");
  const filtered = events.filter((e) => {
    if (filter === "All") return true;
    if (filter === "Yours") return YOURS_IDS.has(e.id);
    return e.status === filter;
  });

  return (
    <div className="min-h-screen bg-transparent relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <AutoPlayVideo src="/videos/SC_12.mp4" loop className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/85 to-background/92" />
      </div>

      <section className="relative pt-24 pb-20 z-10 overflow-hidden">
   

        {/* Purple ambient glows */}
        <div className="absolute top-40 left-0 w-[500px] h-[400px] rounded-full bg-neon-purple/6 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-20 right-0 w-[400px] h-[300px] rounded-full bg-[hsl(278_100%_70%/0.08)] blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col lg:flex-row justify-between w-full rounded-[28px] bg-[linear-gradient(135deg,hsl(265_90%_18%/0.78),hsl(220_45%_10%/0.6),hsl(220_45%_10%/0.28))] overflow-hidden backdrop-blur-md shadow-[0_8px_40px_hsl(270_82%_58%/0.12)]"
            >
              <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top_left,hsl(278_100%_70%/0.16),transparent_42%)] pointer-events-none" />

              {/* Video — top on mobile/tablet, right on desktop */}
              <div className="order-last w-full lg:w-[500px] flex-shrink-0 pointer-events-none flex items-center">
                <div className="relative overflow-hidden lg:rounded-l-[32px]">
                  <AutoPlayVideo src="/videos/SC_12.mp4" loop className="w-full aspect-[16/9] object-cover opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-l from-background/10 via-background/18 to-background/58" />
                  <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-transparent to-background/40" />
                </div>
              </div>

              {/* Text content */}
              <div className="relative z-10 order-first lg:order-first px-6 py-7 md:px-8 md:py-9">
                <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(278_100%_70%/0.24)] bg-[hsl(278_100%_70%/0.08)] px-3 py-1.5 mb-4">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[hsl(278_100%_78%)]"
                    animate={{ opacity: [1, 0.35, 1], boxShadow: ["0 0 4px hsl(278 100% 72%)", "0 0 14px hsl(278 100% 72%)", "0 0 4px hsl(278 100% 72%)"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-[10px] font-mono text-[hsl(278_100%_82%)] tracking-[0.26em] uppercase">
                    <Swords className="w-3 h-3 inline mr-1" />
                    Battles & Events
                  </span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight text-foreground">
                  EVENTS
                  <span className="block mt-1 text-[hsl(278_100%_82%)] drop-shadow-[0_0_24px_hsl(270_82%_58%/0.3)]">
                    &amp; TOURNAMENTS
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm md:text-base text-muted-foreground">
                  Compete in high-stakes tournaments, claim rewards, and climb the rankings across Kult&apos;s live on-chain events.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Featured event */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden mb-10 border border-[hsl(278_100%_70%/0.22)] group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(265_90%_28%/0.28)] via-[hsl(270_82%_52%/0.14)] to-[hsl(278_100%_70%/0.22)]" />

            <div className="relative z-10 p-6 md:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[hsl(278_100%_78%)]" />
                    <span className="text-xs font-display font-bold text-[hsl(278_100%_82%)] tracking-wider">FEATURED EVENT</span>
                    <motion.div
                      className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-[hsl(278_100%_70%/0.14)] text-[hsl(278_100%_82%)] border border-[hsl(278_100%_70%/0.32)]"
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
                      <div className="w-8 h-8 rounded-lg bg-[hsl(278_100%_70%/0.1)] flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-[hsl(278_100%_78%)]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-mono">DATE</p>
                        <p className="text-sm text-foreground font-semibold">{events[0].date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[hsl(270_82%_52%/0.12)] flex items-center justify-center">
                        <Clock className="w-4 h-4 text-[hsl(278_100%_78%)]" />
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
                      <div className="w-8 h-8 rounded-lg bg-[hsl(270_82%_52%/0.12)] flex items-center justify-center">
                        <Users className="w-4 h-4 text-[hsl(278_100%_78%)]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-mono">PLAYERS</p>
                        <p className="text-sm text-foreground font-semibold">{events[0].players}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <button
                    type="button"
                    className="px-8 py-3.5 font-display text-sm font-semibold tracking-wider btn-eye flex items-center gap-2 relative overflow-hidden"
                  >
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
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-5 py-2 rounded-full font-display text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-300 ${
                  filter === f.value
                    ? "btn-eye shadow-[0_0_18px_hsl(270_82%_58%/0.35)]"
                    : "btn-eye-outline"
                }`}
              >
                {f.label.toUpperCase()}
              </button>
            ))}
          </motion.div>

          {/* Events list */}
          <div className="space-y-4">
            {filter === "Yours" && filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[hsl(278_100%_70%/0.15)] bg-[hsl(278_100%_70%/0.04)] py-16 text-center"
              >
                <Trophy className="w-10 h-10 text-[hsl(278_100%_70%/0.35)] mx-auto mb-3" />
                <p className="font-display text-sm font-semibold text-muted-foreground">No events joined yet.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Register for an active event to see it here.</p>
              </motion.div>
            )}
            <AnimatePresence mode="popLayout">
              {filtered.map((event, i) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border/50 bg-card/50 hover:border-[hsl(278_100%_70%/0.3)] hover:bg-card/80 transition-all duration-300"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold tracking-wider ${
                        event.status === "Registering" ? "bg-[hsl(278_100%_70%/0.14)] text-[hsl(278_100%_82%)] border border-[hsl(278_100%_70%/0.32)]" :
                        event.status === "Full" ? "bg-destructive/15 text-destructive border border-destructive/30" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {event.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground border border-border/50 rounded-full px-2 py-0.5">{event.type}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground group-hover:text-[hsl(278_100%_82%)] transition-colors">{event.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md">{event.description}</p>
                  </div>

                  <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-[hsl(278_100%_78%/0.8)]" />
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
                          : "bg-[hsl(278_100%_70%/0.14)] text-[hsl(278_100%_82%)] border border-[hsl(278_100%_70%/0.32)] hover:bg-[hsl(270_82%_52%)] hover:text-white hover:shadow-[0_0_22px_hsl(270_82%_58%/0.35)]"
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
