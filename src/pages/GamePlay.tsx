import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { gamesApi } from "@/api/gamesApi";

const GamePlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["game", id],
    queryFn: () => gamesApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });

  const playUrl = (game?.metadata?.play_url as string) ?? game?.url ?? "";

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !game || !playUrl) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground font-display">Game URL not available.</p>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline text-sm">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-background overflow-hidden">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 text-sm text-foreground hover:text-neon-cyan hover:border-neon-cyan/50 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK
      </button>

      {/* Game iframe */}
      <iframe
        src={playUrl}
        title={game.name as string}
        className="w-full h-full border-none"
        allow="fullscreen; autoplay; clipboard-write"
      />
    </div>
  );
};

export default GamePlay;
