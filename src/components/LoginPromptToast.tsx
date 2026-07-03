import { useEffect, useState, type CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import {
  BrainCircuit,
  Crown,
  Gamepad2,
  Medal,
  Package,
  Sparkles,
  Swords,
  Trophy,
  Video,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type LoginPromptToast = {
  icon?: typeof BrainCircuit;
  color: string;
  title: string;
  description: string;
  liveDot?: boolean;
};

const LOGIN_PROMPTS: Array<{ match: (path: string) => boolean; toast: LoginPromptToast }> = [
  {
    match: (path) => path === "/ai-arena" || path === "/dashboard",
    toast: {
      color: "#00f080",
      title: "Beta Live",
      description: "Your AI Agent is waiting. Enter the Arena and begin your journey",
      liveDot: true,
    },
  },
  {
    match: (path) => path === "/my-agents" || path === "/training",
    toast: {
      icon: BrainCircuit,
      color: "#a855ff",
      title: "AI Agents",
      description: "Mint, train, and send your agent to battle.",
    },
  },
  {
    match: (path) => path === "/battles" || path.startsWith("/arena/"),
    toast: {
      icon: Swords,
      color: "#11a7ff",
      title: "24/7 Matchmaking",
      description: "Humans vs agents — queues never sleep.",
    },
  },
  {
    match: (path) => path === "/league",
    toast: {
      icon: Medal,
      color: "#ffc42e",
      title: "Kult Agent League",
      description: "Sign in to make picks, follow rivalries, and earn KP.",
    },
  },
  {
    match: (path) => path === "/games" || path.startsWith("/game/"),
    toast: {
      icon: Gamepad2,
      color: "#11a7ff",
      title: "Kult Games",
      description: "Sign in to play, track wins, and climb the ranks.",
    },
  },
  {
    match: (path) => path === "/moments" || path.startsWith("/moments/"),
    toast: {
      icon: Video,
      color: "#9a35ff",
      title: "Kult Moments",
      description: "Sign in to save, share, and earn from your highlights.",
    },
  },
  {
    match: (path) => path === "/inventory",
    toast: {
      icon: Package,
      color: "#c084fc",
      title: "Your Inventory",
      description: "Sign in to manage agents, items, and rewards.",
    },
  },
  {
    match: (path) => path === "/leaderboard",
    toast: {
      icon: Crown,
      color: "#ffc42e",
      title: "Leaderboard",
      description: "Sign in to see where you rank among top players.",
    },
  },
  {
    match: (path) => path === "/achievements",
    toast: {
      icon: Trophy,
      color: "#f59e0b",
      title: "Achievements",
      description: "Sign in to unlock badges and track your progress.",
    },
  },
  {
    match: (path) => path === "/autonomous",
    toast: {
      icon: Sparkles,
      color: "#22d3ee",
      title: "Autonomous Agents",
      description: "Sign in to deploy agents that play while you sleep.",
    },
  },
];

const DEFAULT_LOGIN_PROMPT: LoginPromptToast = {
  icon: Sparkles,
  color: "#a855ff",
  title: "Join Kult",
  description: "Sign in to access the full platform.",
};

const EXCLUDED_PATHS = new Set(["/access", "/"]);

function getLoginPromptForPath(pathname: string): LoginPromptToast | null {
  if (EXCLUDED_PATHS.has(pathname)) return null;
  return LOGIN_PROMPTS.find((entry) => entry.match(pathname))?.toast ?? DEFAULT_LOGIN_PROMPT;
}

function LoginPromptToastCard({
  toast,
  onLogin,
}: {
  toast: LoginPromptToast;
  onLogin: () => void;
}) {
  const Icon = toast.icon;
  return (
    <div
      role="status"
      className="login-prompt-toast pointer-events-auto relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2.5 pr-2.5 animate-in slide-in-from-bottom-3 fade-in duration-500"
      style={{ "--toast-accent": toast.color } as CSSProperties}
    >
      <div className="login-prompt-toast__glow pointer-events-none absolute inset-0" aria-hidden />

      <div
        className="home-stat-icon relative z-[1] grid h-8 w-8 shrink-0 place-items-center rounded-lg"
        style={{ "--stat-color": toast.color } as CSSProperties}
      >
        {toast.liveDot ? (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#26e63b] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#26e63b] shadow-[0_0_10px_rgba(38,230,59,0.95)]" />
          </span>
        ) : Icon ? (
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        ) : null}
      </div>

      <p className="login-prompt-toast__copy relative z-[1] min-w-0 flex-1 text-[11px] leading-snug sm:text-xs">
        <span className="font-bold text-white">{toast.title}</span>
        <span className="mx-1.5 text-white/30">·</span>
        <span className="text-white/55">{toast.description}</span>
      </p>

      <button
        type="button"
        onClick={onLogin}
        className="login-prompt-toast__cta relative z-[1] inline-flex h-7 shrink-0 items-center justify-center self-center rounded-full px-3 text-[11px] font-semibold text-white transition duration-200 hover:scale-[1.03] active:scale-[0.98]"
        style={{ "--toast-accent": toast.color } as CSSProperties}
      >
        Connect
      </button>
    </div>
  );
}

export function PageLoginPrompt() {
  const { pathname } = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);

  const toast = getLoginPromptForPath(pathname);

  useEffect(() => {
    if (!toast || isAuthenticated) {
      setVisible(false);
      return;
    }

    const scroller = document.querySelector(".arena-scroll");
    if (!scroller) return;

    const updateVisibility = () => {
      const scrollable = scroller.scrollHeight - scroller.clientHeight;
      setVisible(scrollable <= 120 || scroller.scrollTop > 80);
    };

    scroller.addEventListener("scroll", updateVisibility, { passive: true });
    updateVisibility();
    return () => scroller.removeEventListener("scroll", updateVisibility);
  }, [pathname, isAuthenticated, toast]);

  if (!toast || isAuthenticated || !visible) return null;

  return (
    <div className="pointer-events-none fixed bottom-20 right-4 z-[60] w-[calc(100%-2rem)] max-w-[400px] sm:bottom-6">
      <LoginPromptToastCard toast={toast} onLogin={() => void login()} />
    </div>
  );
}
