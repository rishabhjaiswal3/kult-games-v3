import { useEffect, useState, type CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import {
  BrainCircuit,
  Crown,
  Gamepad2,
  Home,
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
    match: (path) => path === "/",
    toast: {
      icon: Home,
      color: "#a855ff",
      title: "Welcome to Kult",
      description: "Sign in to play, compete, and earn rewards.",
    },
  },
  {
    match: (path) => path === "/ai-arena" || path === "/dashboard",
    toast: {
      color: "#00f080",
      title: "Beta Live",
      description: "Sign in to enter the arena on 0G.",
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

const EXCLUDED_PATHS = new Set(["/access"]);

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
      className="login-prompt-toast pointer-events-auto relative flex w-full items-center gap-3.5 overflow-hidden rounded-2xl p-4 pr-3.5 animate-in slide-in-from-bottom-3 fade-in duration-500"
      style={{ "--toast-accent": toast.color } as CSSProperties}
    >
      <div className="login-prompt-toast__glow pointer-events-none absolute inset-0" aria-hidden />

      <div
        className="home-stat-icon relative z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ "--stat-color": toast.color } as CSSProperties}
      >
        {toast.liveDot ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#26e63b] opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#26e63b] shadow-[0_0_12px_rgba(38,230,59,0.95)]" />
          </span>
        ) : Icon ? (
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
        ) : null}
      </div>

      <div className="relative z-[1] grid min-w-0 flex-1 gap-1">
        <p className="text-[13px] font-bold leading-none tracking-tight text-white sm:text-sm">{toast.title}</p>
        <p className="text-[11px] leading-snug text-white/58 sm:text-xs">{toast.description}</p>
      </div>

      <button
        type="button"
        onClick={onLogin}
        className="login-prompt-toast__cta relative z-[1] inline-flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-[11px] font-bold uppercase tracking-[0.08em] text-white transition duration-200 hover:scale-[1.03] active:scale-[0.98] sm:text-xs"
        style={{ "--toast-accent": toast.color } as CSSProperties}
      >
        Connect Wallet
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
