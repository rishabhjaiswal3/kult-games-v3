import { motion } from "framer-motion";
import { Star, Clock, Zap, Brain } from "lucide-react";

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  category: string;
  rating: number;
  aiSummary: string;
  sessionLength: string;
  skillLevel: string;
  index: number;
}

const GameCard = ({
  title,
  description,
  image,
  category,
  rating,
  aiSummary,
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
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative rounded-2xl overflow-hidden glass-panel gradient-border cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        
        {/* Category badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider bg-primary/20 text-primary backdrop-blur-sm border border-primary/30">
          {category}
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm">
          <Star className="w-3 h-3 text-primary fill-primary" />
          <span className="text-xs font-semibold text-foreground">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-foreground mb-1 tracking-wide">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        {/* AI Summary */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50 mb-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Brain className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-mono text-primary tracking-widest uppercase">
              AI INSIGHT
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{aiSummary}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{sessionLength}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{skillLevel}</span>
          </div>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" 
        style={{ boxShadow: "inset 0 0 40px hsl(185 85% 55% / 0.05), 0 0 30px hsl(185 85% 55% / 0.1)" }} 
      />
    </motion.div>
  );
};

export default GameCard;
