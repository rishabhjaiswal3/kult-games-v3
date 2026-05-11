import { Play, Star, Sparkles, Clock } from "lucide-react";
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

const categoryGlow: Record<string, { border: string; shadow: string; bar: string; color: string }> = {
  Sports:   { border: "hover:border-[hsl(150_100%_50%/0.45)]", shadow: "hover:shadow-[0_0_40px_hsl(150_100%_50%/0.15),0_8px_32px_hsl(220_50%_4%/0.6)]", bar: "from-[hsl(150_100%_50%)] to-[hsl(150_80%_60%)]",  color: "hsl(150 100% 55%)" },
  Action:   { border: "hover:border-[hsl(195_100%_60%/0.45)]", shadow: "hover:shadow-[0_0_40px_hsl(195_100%_60%/0.15),0_8px_32px_hsl(220_50%_4%/0.6)]", bar: "from-[hsl(195_100%_65%)] to-[hsl(195_80%_55%)]", color: "hsl(195 100% 65%)" },
  Fighting: { border: "hover:border-[hsl(310_100%_60%/0.45)]", shadow: "hover:shadow-[0_0_40px_hsl(310_100%_60%/0.15),0_8px_32px_hsl(220_50%_4%/0.6)]", bar: "from-[hsl(310_100%_60%)] to-[hsl(270_80%_65%)]", color: "hsl(310 100% 65%)" },
  Racing:   { border: "hover:border-[hsl(40_85%_58%/0.45)]",   shadow: "hover:shadow-[0_0_40px_hsl(40_85%_58%/0.15),0_8px_32px_hsl(220_50%_4%/0.6)]",   bar: "from-[hsl(40_85%_58%)] to-[hsl(30_90%_55%)]",   color: "hsl(40 85% 60%)" },
  Default:  { border: "hover:border-[hsl(278_100%_70%/0.45)]", shadow: "hover:shadow-[0_0_40px_hsl(278_100%_70%/0.15),0_8px_32px_hsl(220_50%_4%/0.6)]", bar: "from-[hsl(278_100%_70%)] to-[hsl(270_80%_65%)]", color: "hsl(278 100% 75%)" },
};

const GameCard = ({
  title,
  image,
  category,
  rating,
  sessionLength,
  id,
}: GameCardProps) => {
  const navigate = useNavigate();
  const gameId = id || title.toLowerCase().replace(/\s+/g, "-");
  const glow = categoryGlow[category] ?? categoryGlow.Default;

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/game/${gameId}`);
        }
      }}
      onClick={() => navigate(`/game/${gameId}`)}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-border/30 bg-card transition-all duration-300 hover:-translate-y-2 ${glow.border} ${glow.shadow}`}
      style={{ boxShadow: "0 4px 24px hsl(220 50% 4% / 0.5)" }}
    >
      {/* Category accent bar */}
      <div className={`h-[2px] w-full bg-gradient-to-r ${glow.bar}`} />

      {/* Image — 16:9 cinematic */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="eager"
          decoding="async"
        />
        {/* Bottom gradient bleeds into card bg */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

        {/* Category badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-widest uppercase backdrop-blur-sm"
          style={{
            background: glow.color.replace(")", " / 0.15)"),
            color: glow.color,
            border: `1px solid ${glow.color.replace(")", " / 0.3)")}`,
          }}
        >
          {category}
        </div>

        {/* Rating badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
          <Star className="w-3 h-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />
          <span className="text-[11px] font-bold text-white">{rating}</span>
        </div>

        {/* Play overlay — appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-base font-bold text-foreground tracking-wide mb-1.5 line-clamp-1 group-hover:text-glow-cyan transition-colors duration-300">
          {title}
        </h3>

        <div className="flex items-center gap-1.5 mb-4">
          <Clock className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
          <span className="text-[11px] text-muted-foreground/60 font-mono">
            {sessionLength || "Quick Play"}
          </span>
        </div>

        {/* Action buttons — always visible */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/game/${gameId}`);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-display font-bold tracking-wider btn-eye"
          >
            <Play className="w-3 h-3 fill-current relative z-10" />
            <span className="relative z-10">PLAY</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/game/${gameId}?tab=ai-arena`);
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-bold tracking-wider btn-eye-outline"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
