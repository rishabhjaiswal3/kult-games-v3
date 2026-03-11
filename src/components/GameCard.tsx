import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  category: string;
  rating: number;
  aiSummary?: string;
  sessionLength: string;
  skillLevel: string;
  index: number;
  id?: string;
}

const categoryGlow: Record<string, { border: string; shadow: string; bar: string }> = {
  Sports:    { border: "hover:border-[hsl(150_100%_50%/0.5)]", shadow: "hover:shadow-[0_0_30px_hsl(150_100%_50%/0.2)]", bar: "from-[hsl(150_100%_50%)] to-[hsl(150_80%_60%)]" },
  Action:    { border: "hover:border-neon-cyan/50",             shadow: "hover:shadow-[0_0_30px_hsl(195_100%_60%/0.2)]", bar: "from-primary to-secondary" },
  Fighting:  { border: "hover:border-[hsl(310_100%_60%/0.5)]", shadow: "hover:shadow-[0_0_30px_hsl(310_100%_60%/0.2)]", bar: "from-[hsl(310_100%_60%)] to-[hsl(270_80%_65%)]" },
  Racing:    { border: "hover:border-[hsl(40_85%_58%/0.5)]",   shadow: "hover:shadow-[0_0_30px_hsl(40_85%_58%/0.2)]",   bar: "from-[hsl(40_85%_58%)] to-[hsl(30_90%_55%)]" },
  Default:   { border: "hover:border-neon-cyan/50",             shadow: "hover:shadow-[0_0_30px_hsl(195_100%_60%/0.2)]", bar: "from-primary to-secondary" },
};

const GameCard = ({
  title,
  image,
  category,
  rating,
  sessionLength,
  skillLevel,
  index,
  id,
}: GameCardProps) => {
  const navigate = useNavigate();
  const gameId = id || title.toLowerCase().replace(/\s+/g, "-");
  const glow = categoryGlow[category] ?? categoryGlow.Default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      onClick={() => navigate(`/game/${gameId}`)}
      className={`group relative rounded-xl overflow-hidden cursor-pointer bg-card border border-border/50 transition-all duration-300 ${glow.border} ${glow.shadow}`}
    >
      {/* Holographic shimmer on hover */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "linear-gradient(135deg, hsl(195 100% 50% / 0) 0%, hsl(195 100% 50% / 0.08) 50%, hsl(195 100% 50% / 0) 100%)",
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Image with play button */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center border border-border/50 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:shadow-[0_0_25px_hsl(195_100%_50%/0.4)] transition-all duration-300">
            <Play className="w-6 h-6 text-foreground fill-foreground ml-0.5" />
          </div>
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm">
          <Star className="w-3 h-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />
          <span className="text-xs font-semibold text-foreground">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-base font-bold text-foreground tracking-wide mb-2 group-hover:text-glow-cyan transition-all">{title}</h3>

        {/* Meta */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-mono tracking-wider text-primary/80">{category}</span>
          <span>{sessionLength}</span>
        </div>
        
        {/* AI-style skill bar with cyan glow */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-mono">SKILL</span>
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden relative">
            <motion.div 
              className={`h-full bg-gradient-to-r ${glow.bar} rounded-full relative`}
              style={{ 
                width: skillLevel === "Beginner" ? "30%" : skillLevel === "Intermediate" ? "60%" : "50%",
                boxShadow: "0 0 8px hsl(195 100% 50% / 0.5)",
              }}
              initial={{ width: 0 }}
              whileInView={{ width: skillLevel === "Beginner" ? "30%" : skillLevel === "Intermediate" ? "60%" : "50%" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
            />
            {/* Pulse at the end */}
            <motion.div
              className="absolute top-0 h-full w-1 bg-primary-foreground/50 rounded-full"
              style={{ left: skillLevel === "Beginner" ? "30%" : skillLevel === "Intermediate" ? "60%" : "50%" }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
