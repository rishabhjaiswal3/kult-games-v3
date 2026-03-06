import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";

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
}

const GameCard = ({
  title,
  image,
  category,
  rating,
  sessionLength,
  skillLevel,
  index,
}: GameCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="group relative rounded-xl overflow-hidden ornate-border cursor-pointer bg-card"
    >
      {/* Image with play button */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center border border-border/50 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all duration-300">
            <Play className="w-6 h-6 text-foreground fill-foreground ml-0.5" />
          </div>
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm">
          <Star className="w-3 h-3 text-[hsl(40,80%,55%)] fill-[hsl(40,80%,55%)]" />
          <span className="text-xs font-semibold text-foreground">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-base font-bold text-foreground tracking-wide mb-2">
          {title}
        </h3>

        {/* Meta */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-mono tracking-wider text-primary/80">{category}</span>
          <span>{sessionLength}</span>
        </div>
        
        {/* Skill bar */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">SKILL</span>
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: skillLevel === "Beginner" ? "30%" : skillLevel === "Intermediate" ? "60%" : "50%" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;
