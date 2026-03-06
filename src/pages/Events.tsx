import { motion } from "framer-motion";
import { Calendar, Clock, Users, Swords, Trophy, Zap, MapPin } from "lucide-react";
import { useState } from "react";
import ParticleField from "@/components/ParticleField";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import mageBattle from "@/assets/mage-battle.png";

const events = [
  {
    id: 1,
    title: "Zero Dash Championship",
    game: "Zero Dash",
    date: "Mar 15, 2026",
    time: "8:00 PM UTC",
    prize: "5 ETH",
    players: "128/256",
    status: "Registering",
    type: "Tournament",
    description: "The ultimate speed run showdown. Top 3 runners take home massive rewards.",
  },
  {
    id: 2,
    title: "Robo Wars Arena Season 3",
    game: "Robo Wars",
    date: "Mar 20, 2026",
    time: "6:00 PM UTC",
    prize: "10 ETH",
    players: "64/64",
    status: "Full",
    type: "Season",
    description: "Season 3 of the most intense robot fighting league. Prepare your mechs.",
  },
  {
    id: 3,
    title: "Highway Hustle Grand Prix",
    game: "Highway Hustle",
    date: "Mar 25, 2026",
    time: "9:00 PM UTC",
    prize: "3 ETH",
    players: "45/100",
    status: "Registering",
    type: "Tournament",
    description: "Race through neon highways in this high-stakes grand prix event.",
  },
  {
    id: 4,
    title: "AI Mind Games Open",
    game: "Guess The AI",
    date: "Apr 1, 2026",
    time: "4:00 PM UTC",
    prize: "2 ETH",
    players: "200/500",
    status: "Registering",
    type: "Open",
    description: "Can you outsmart the AI? Open tournament for all skill levels.",
  },
  {
    id: 5,
    title: "Zero G Pool Masters",
    game: "Zero G Pool",
    date: "Apr 5, 2026",
    time: "7:00 PM UTC",
    prize: "4 ETH",
    players: "32/32",
    status: "Full",
    type: "Invitational",
    description: "Invitation-only pool championship in zero gravity. The best of the best.",
  },
];

const statusFilters = ["All", "Registering", "Full", "Upcoming"];

const Events = () => {
  const [filter, setFilter] = useState("All");

  const filtered = events.filter((e) => filter === "All" || e.status === filter);

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleField />
      <Navbar />

      <section className="relative pt-24 pb-20 z-10">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-15">
          <source src="/videos/SC_1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/80" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="text-xs font-mono text-primary tracking-[0.2em] uppercase mb-2 block">
                <Swords className="w-3 h-3 inline mr-1" /> Battles & Events
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tight">
                EVENTS & <span className="gradient-text">TOURNAMENTS</span>
              </h1>
              <p className="text-muted-foreground mt-2 max-w-md">Compete in epic tournaments, earn rewards, and rise to glory.</p>
            </motion.div>
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              src={mageBattle}
              alt="Battle Mage"
              className="hidden lg:block w-[180px] animate-float drop-shadow-[0_0_30px_hsl(270_70%_55%/0.3)]"
            />
          </div>

          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-3 mb-8 overflow-x-auto">
            {statusFilters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-lg font-display text-xs font-semibold tracking-wider whitespace-nowrap transition-all ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "glass-panel text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </motion.div>

          {/* Featured event */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="ornate-border rounded-xl p-6 md:p-8 mb-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-display font-bold text-primary tracking-wider">FEATURED EVENT</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-black text-foreground mb-2">{events[0].title}</h2>
              <p className="text-muted-foreground mb-4 max-w-xl">{events[0].description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-primary" />{events[0].date}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" />{events[0].time}</span>
                <span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-[hsl(40,80%,55%)]" />{events[0].prize}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4 text-primary" />{events[0].players}</span>
              </div>
              <button className="mt-6 px-8 py-3 rounded-lg font-display text-sm font-semibold tracking-wider bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(270_70%_55%/0.4)] transition-all">
                REGISTER NOW
              </button>
            </div>
          </motion.div>

          {/* Events list */}
          <div className="space-y-4">
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="glass-panel rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-display font-bold tracking-wider ${
                      event.status === "Registering" ? "bg-primary/20 text-primary" :
                      event.status === "Full" ? "bg-destructive/20 text-destructive" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {event.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{event.type}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">{event.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                </div>
                <div className="flex flex-wrap md:flex-nowrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</span>
                  <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-[hsl(40,80%,55%)]" />{event.prize}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.players}</span>
                  <button
                    disabled={event.status === "Full"}
                    className={`px-5 py-2 rounded-lg font-display text-xs font-semibold tracking-wider transition-all ${
                      event.status === "Full"
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:shadow-[0_0_20px_hsl(270_70%_55%/0.3)]"
                    }`}
                  >
                    {event.status === "Full" ? "FULL" : "JOIN"}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
