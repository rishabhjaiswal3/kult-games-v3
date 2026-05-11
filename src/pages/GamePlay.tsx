import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download } from "lucide-react";
import { gamesApi } from "@/api/gamesApi";
import { StorageKeys } from "@/constants/storageKeys";
import { useAuth } from "@/contexts/AuthContext";
import { isGameDownloadable, gameDownloadUrl } from "@/lib/gameDownload";
import { triggerBrowserDownload } from "@/lib/triggerBrowserDownload";

/**
 * Append ?walletAddress= to any play URL so games that implement
 * /auto-login (warzonewarrior, warzone-new-warrior, GUESS_THE_AI, …)
 * can silently log the user in when loaded inside this iframe.
 *
 * Handles URLs that already have query params, and falls back gracefully
 * if the URL string is malformed.
 */

function buildIframeUrl(playUrl: string, token: string | null): string {
  if (!playUrl) return "";
  if (!token) return playUrl;

  try {
    const url = new URL(playUrl);
    url.searchParams.set("jwt", token);
    url.searchParams.set("source", "browser");
    return url.toString();
  } catch {
    // Relative or non-standard URL — fall back to string concat
    const sep = playUrl.includes("?") ? "&" : "?";
    return `${playUrl}${sep}jwt=${encodeURIComponent(token)}&source=browser`;
  }
}

const GamePlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useAuth();

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["game", id],
    queryFn: () => gamesApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });

  const rawPlayUrl =
    (game?.metadata?.play_url as string) ?? (game && !isGameDownloadable(game) ? game.url : "") ?? "";
  const token = localStorage.getItem(StorageKeys.local.authToken);
  const playUrl = buildIframeUrl(rawPlayUrl, token);
  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground font-display">Game URL not available.</p>
        <button type="button" onClick={() => navigate(-1)} className="text-primary hover:underline text-sm">
          Go Back
        </button>
      </div>
    );
  }

  if (isGameDownloadable(game)) {
    const href = gameDownloadUrl(game);
    const title =
      typeof game.name === "string" ? game.name : game.name?.en ?? Object.values(game.name ?? {})[0] ?? "Game";
    return (
      <div className="w-screen h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 text-sm text-foreground btn-pill hover:text-neon-cyan hover:border-neon-cyan/50"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK
        </button>
        <p className="font-display text-lg text-foreground text-center max-w-md">{title}</p>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          This game runs as a download on your device, not in the browser. Use the button below — your tab stays here.
        </p>
        <button
          type="button"
          onClick={() => triggerBrowserDownload(href)}
          className="flex items-center gap-2 px-8 py-3.5 font-display text-sm font-bold tracking-[0.18em] btn-eye"
        >
          <Download className="h-5 w-5" />
          DOWNLOAD
        </button>
        <button
          type="button"
          onClick={() => navigate(`/game/${id}`)}
          className="text-sm text-muted-foreground hover:text-neon-cyan underline underline-offset-4"
        >
          Game page
        </button>
      </div>
    );
  }

  if (!rawPlayUrl) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground font-display">Game URL not available.</p>
        <button type="button" onClick={() => navigate(-1)} className="text-primary hover:underline text-sm">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-background overflow-hidden">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 text-sm text-foreground btn-pill hover:text-neon-cyan hover:border-neon-cyan/50"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK
      </button>

      {/* Game iframe — walletAddress injected into URL for auto-login */}
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
