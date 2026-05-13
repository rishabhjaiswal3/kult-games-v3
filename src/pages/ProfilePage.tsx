import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bot,
  Copy,
  Crown,
  Flame,
  Gamepad2,
  Loader2,
  Pencil,
  Save,
  Sparkles,
  Swords,
  Trophy,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import { HubSidebar } from "@/components/hub/HubSidebar";
import { HomeHubHero } from "@/components/hub/HomeHubHero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { playerApi } from "@/api/playerApi";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const KULT_AVATARS = [
  {
    id: "cyber-warrior",
    label: "Cyber Warrior",
    color: "hsl(195,100%,60%)",
    svg: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M28 4L50 16V40L28 52L6 40V16L28 4Z" fill="hsl(195,100%,50%)" fillOpacity="0.12" stroke="hsl(195,100%,65%)" strokeWidth="1.5" />
        <rect x="14" y="20" width="28" height="16" rx="4" fill="hsl(220,45%,10%)" stroke="hsl(195,100%,60%)" strokeWidth="1" />
        <rect x="16" y="23" width="24" height="10" rx="2" fill="hsl(195,100%,55%)" fillOpacity="0.18" />
        <rect x="16" y="23" width="10" height="10" rx="2" fill="hsl(195,100%,60%)" fillOpacity="0.6" />
        <rect x="30" y="23" width="10" height="10" rx="2" fill="hsl(195,100%,60%)" fillOpacity="0.6" />
        <line x1="28" y1="4" x2="28" y2="10" stroke="hsl(195,100%,75%)" strokeWidth="1.5" />
        <line x1="28" y1="46" x2="28" y2="52" stroke="hsl(195,100%,75%)" strokeWidth="1.5" />
        <circle cx="28" cy="40" r="2" fill="hsl(195,100%,75%)" />
      </svg>
    ),
  },
  {
    id: "neon-hunter",
    label: "Neon Hunter",
    color: "hsl(40,90%,60%)",
    svg: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="28" cy="28" r="23" fill="hsl(40,90%,50%)" fillOpacity="0.1" stroke="hsl(40,90%,60%)" strokeWidth="1.5" />
        <circle cx="28" cy="28" r="15" fill="hsl(220,45%,10%)" stroke="hsl(40,85%,55%)" strokeWidth="1" />
        <ellipse cx="22" cy="27" rx="5" ry="4" fill="hsl(40,90%,60%)" fillOpacity="0.7" />
        <ellipse cx="34" cy="27" rx="5" ry="4" fill="hsl(40,90%,60%)" fillOpacity="0.7" />
        <line x1="27" y1="27" x2="29" y2="27" stroke="hsl(40,90%,80%)" strokeWidth="1.5" />
        <path d="M20 33 Q28 37 36 33" stroke="hsl(40,90%,65%)" strokeWidth="1.2" fill="none" />
        <circle cx="28" cy="8" r="2" fill="hsl(40,90%,70%)" />
        <circle cx="8" cy="28" r="2" fill="hsl(40,90%,70%)" />
        <circle cx="48" cy="28" r="2" fill="hsl(40,90%,70%)" />
      </svg>
    ),
  },
  {
    id: "phantom-rogue",
    label: "Phantom Rogue",
    color: "hsl(278,100%,72%)",
    svg: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M28 6L50 18V38L28 50L6 38V18L28 6Z" fill="hsl(278,100%,60%)" fillOpacity="0.1" stroke="hsl(278,100%,72%)" strokeWidth="1.5" />
        <path d="M16 22 Q28 14 40 22 L38 36 Q28 42 18 36 Z" fill="hsl(220,45%,8%)" stroke="hsl(278,100%,65%)" strokeWidth="1" />
        <circle cx="22" cy="27" r="4" fill="hsl(278,100%,72%)" fillOpacity="0.6" />
        <circle cx="34" cy="27" r="4" fill="hsl(278,100%,72%)" fillOpacity="0.6" />
        <circle cx="28" cy="29" r="3" fill="hsl(151,100%,55%)" fillOpacity="0.7" />
        <path d="M20 35 Q28 39 36 35" stroke="hsl(278,100%,80%)" strokeWidth="1" fill="none" />
        <line x1="12" y1="24" x2="16" y2="26" stroke="hsl(278,100%,72%)" strokeWidth="1.2" />
        <line x1="44" y1="24" x2="40" y2="26" stroke="hsl(278,100%,72%)" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "iron-sentinel",
    label: "Iron Sentinel",
    color: "hsl(45,100%,55%)",
    svg: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="6" y="6" width="44" height="44" rx="10" fill="hsl(45,100%,50%)" fillOpacity="0.1" stroke="hsl(45,100%,60%)" strokeWidth="1.5" />
        <rect x="13" y="18" width="30" height="20" rx="5" fill="hsl(220,45%,9%)" stroke="hsl(45,95%,55%)" strokeWidth="1" />
        <rect x="18" y="23" width="20" height="10" rx="3" fill="hsl(45,100%,55%)" fillOpacity="0.25" />
        <ellipse cx="28" cy="28" rx="8" ry="4" fill="hsl(45,100%,60%)" fillOpacity="0.55" />
        <circle cx="28" cy="28" r="2.5" fill="hsl(45,100%,80%)" />
        <line x1="28" y1="6" x2="28" y2="13" stroke="hsl(45,100%,65%)" strokeWidth="1.5" />
        <line x1="28" y1="43" x2="28" y2="50" stroke="hsl(45,100%,65%)" strokeWidth="1.5" />
        <line x1="6" y1="28" x2="13" y2="28" stroke="hsl(45,100%,65%)" strokeWidth="1.5" />
        <line x1="43" y1="28" x2="50" y2="28" stroke="hsl(45,100%,65%)" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "byte-ghost",
    label: "Byte Ghost",
    color: "hsl(151,100%,55%)",
    svg: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="28" cy="28" r="22" fill="hsl(151,100%,45%)" fillOpacity="0.1" stroke="hsl(151,100%,55%)" strokeWidth="1.5" strokeDasharray="4 2" />
        <path d="M18 20 Q28 10 38 20 L40 36 Q34 44 28 46 Q22 44 16 36 Z" fill="hsl(220,45%,9%)" stroke="hsl(151,100%,50%)" strokeWidth="1" />
        <ellipse cx="23" cy="27" rx="4" ry="5" fill="hsl(151,100%,55%)" fillOpacity="0.65" />
        <ellipse cx="33" cy="27" rx="4" ry="5" fill="hsl(151,100%,55%)" fillOpacity="0.65" />
        <path d="M22 36 L24 34 L28 36 L32 34 L34 36" stroke="hsl(151,100%,65%)" strokeWidth="1" fill="none" />
        <circle cx="14" cy="18" r="1.5" fill="hsl(151,100%,65%)" fillOpacity="0.6" />
        <circle cx="42" cy="18" r="1.5" fill="hsl(151,100%,65%)" fillOpacity="0.6" />
      </svg>
    ),
  },
  {
    id: "quantum-raider",
    label: "Quantum Raider",
    color: "hsl(220,100%,70%)",
    svg: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M28 4L52 18V38L28 52L4 38V18L28 4Z" fill="hsl(220,100%,60%)" fillOpacity="0.1" stroke="hsl(220,100%,70%)" strokeWidth="1.5" />
        <rect x="15" y="19" width="26" height="18" rx="6" fill="hsl(220,45%,8%)" stroke="hsl(220,100%,65%)" strokeWidth="1" />
        <path d="M20 26 H36" stroke="hsl(220,100%,70%)" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 30 H32" stroke="hsl(220,100%,70%)" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 34 H28" stroke="hsl(220,100%,70%)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="38" cy="22" r="3" fill="hsl(220,100%,75%)" fillOpacity="0.8" />
        <circle cx="28" cy="9" r="2" fill="hsl(220,100%,75%)" />
      </svg>
    ),
  },
  {
    id: "void-maven",
    label: "Void Maven",
    color: "hsl(340,100%,65%)",
    svg: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <circle cx="28" cy="28" r="23" fill="hsl(340,100%,50%)" fillOpacity="0.1" stroke="hsl(340,100%,65%)" strokeWidth="1.5" />
        <path d="M14 20 Q28 12 42 20 L42 36 Q28 44 14 36 Z" fill="hsl(220,45%,8%)" stroke="hsl(340,95%,60%)" strokeWidth="1" />
        <circle cx="28" cy="27" r="8" fill="hsl(340,100%,60%)" fillOpacity="0.15" stroke="hsl(340,100%,65%)" strokeWidth="1" />
        <circle cx="28" cy="27" r="4" fill="hsl(340,100%,65%)" fillOpacity="0.7" />
        <circle cx="28" cy="27" r="2" fill="hsl(340,100%,90%)" />
        <line x1="20" y1="27" x2="24" y2="27" stroke="hsl(340,100%,70%)" strokeWidth="1" />
        <line x1="32" y1="27" x2="36" y2="27" stroke="hsl(340,100%,70%)" strokeWidth="1" />
        <line x1="28" y1="19" x2="28" y2="23" stroke="hsl(340,100%,70%)" strokeWidth="1" />
        <line x1="28" y1="31" x2="28" y2="35" stroke="hsl(340,100%,70%)" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "nova-pilot",
    label: "Nova Pilot",
    color: "hsl(270,80%,68%)",
    svg: (
      <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="5" y="5" width="46" height="46" rx="16" fill="hsl(270,80%,60%)" fillOpacity="0.1" stroke="hsl(270,80%,70%)" strokeWidth="1.5" />
        <ellipse cx="28" cy="26" rx="14" ry="12" fill="hsl(220,45%,9%)" stroke="hsl(270,75%,65%)" strokeWidth="1" />
        <path d="M16 24 Q28 18 40 24" stroke="hsl(270,80%,70%)" strokeWidth="1.5" fill="none" />
        <ellipse cx="22" cy="27" rx="5" ry="3.5" fill="hsl(270,80%,68%)" fillOpacity="0.6" />
        <ellipse cx="34" cy="27" rx="5" ry="3.5" fill="hsl(270,80%,68%)" fillOpacity="0.6" />
        <circle cx="28" cy="40" r="4" fill="hsl(270,80%,65%)" fillOpacity="0.5" stroke="hsl(270,80%,75%)" strokeWidth="1" />
        <line x1="28" y1="38" x2="28" y2="44" stroke="hsl(270,80%,80%)" strokeWidth="1" />
      </svg>
    ),
  },
] as const;

type AvatarId = (typeof KULT_AVATARS)[number]["id"];

const AVATAR_LS_KEY = "kult_selected_avatar";

function initialsFromName(name: string) {
  const t = name.trim();
  if (!t) return "?";
  const p = t.split(/\s+/).filter(Boolean);
  if (p.length >= 2) return `${p[0][0]}${p[1][0]}`.toUpperCase();
  return t.slice(0, 2).toUpperCase();
}

function shortAddr(a: string) {
  if (a.length < 14) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, walletAddress, refetchProfile } = useAuth();
  const [nameDraft, setNameDraft] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId | null>(
    () => (typeof window !== "undefined" ? (localStorage.getItem(AVATAR_LS_KEY) as AvatarId | null) : null),
  );
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSelectAvatar = (id: AvatarId) => {
    setSelectedAvatar(id);
    localStorage.setItem(AVATAR_LS_KEY, id);
    setShowAvatarPicker(false);
  };

  const currentAvatar = KULT_AVATARS.find((a) => a.id === selectedAvatar);

  const {
    data: full,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["player", "full-profile"],
    queryFn: () => playerApi.getFullProfile(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const agentQuery = useQuery({
    queryKey: ["aiArenaGateway", "profileAgentList"],
    queryFn: async () => {
      const res = await aiArenaGatewayApi.getMyAgents(1, 10);
      return res.agents?.[0] ?? null;
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (full?.player?.name != null) setNameDraft(full.player.name);
  }, [full?.player?.name]);

  const saveName = useMutation({
    mutationFn: (name: string) => playerApi.updateName(name),
    onSuccess: async (name) => {
      toast.success("Display name updated");
      setNameDraft(name);
      await queryClient.invalidateQueries({ queryKey: ["player", "full-profile"] });
      await refetchProfile();
    },
    onError: () => {
      toast.error("Could not update name");
    },
  });

  const copyText = (label: string, text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div
          className="pointer-events-none fixed inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, hsl(195 100% 45% / 0.25), transparent),
              radial-gradient(ellipse 60% 40% at 100% 50%, hsl(278 100% 50% / 0.12), transparent),
              radial-gradient(ellipse 50% 30% at 0% 80%, hsl(195 90% 40% / 0.1), transparent)
            `,
          }}
        />
        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col items-center justify-center px-6 pt-20 pb-16">
          <div
            className="w-full rounded-[28px] border border-white/10 bg-card/60 p-10 text-center shadow-[0_24px_80px_hsl(220_60%_2%/0.45)] backdrop-blur-xl"
          >
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, hsl(195 100% 50% / 0.2), hsl(278 100% 60% / 0.15))",
                boxShadow: "0 0 40px hsl(195 100% 50% / 0.2)",
              }}
            >
              <UserCircle className="h-10 w-10 text-neon-cyan" />
            </div>
            <HomeHubHero
              subtitle="Sign in with your wallet to see stats, your AI Arena agent, and customize your display name."
              className="text-center [&_h1]:text-2xl [&_p]:mx-auto"
            />
            <Button
              asChild
              className="mt-8 h-12 rounded-xl bg-gradient-to-r from-[hsl(195_100%_45%)] to-[hsl(278_85%_50%)] px-8 font-display text-xs font-bold tracking-[0.2em] text-white shadow-[0_0_28px_hsl(195_100%_50%/_0.35)] hover:opacity-95"
            >
              <Link to="/?login=1">Sign in</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = full?.player.name?.trim() || "Player";
  const agent = agentQuery.data;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.55]"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% -10%, hsl(195 100% 50% / 0.14), transparent 55%),
            radial-gradient(ellipse 70% 50% at 100% 20%, hsl(278 100% 55% / 0.1), transparent),
            radial-gradient(ellipse 50% 40% at 0% 100%, hsl(195 80% 45% / 0.08), transparent)
          `,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(270 40% 40% / 0.04) 1px, transparent 1px),
            linear-gradient(90deg, hsl(270 40% 40% / 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />


      <section className="relative pt-24 pb-20 md:pb-28">
        <div className="relative mx-auto flex max-w-7xl gap-8 px-4 md:px-8">
          <HubSidebar />
          <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/50 px-4 py-2 text-[11px] font-mono tracking-[0.2em] text-muted-foreground backdrop-blur-md btn-pill hover:border-neon-cyan/35 hover:text-neon-cyan"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            BACK
          </button>

          <HomeHubHero />

          {/* Hero */}
          <div
            className="relative mb-10 overflow-visible rounded-[32px] border border-white/[0.09] bg-gradient-to-br from-card/80 via-card/40 to-background/80 p-8 shadow-[0_32px_100px_hsl(220_60%_2%/0.5)] backdrop-blur-xl md:p-10"
          >
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "hsl(195 100% 50% / 0.12)" }}
            />
            <div
              className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full blur-3xl"
              style={{ background: "hsl(278 100% 55% / 0.1)" }}
            />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                <div className="relative z-[60] shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker((v) => !v)}
                    className="group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:h-28 sm:w-28"
                    style={{
                      background: currentAvatar
                        ? `hsl(220 45% 9%)`
                        : "linear-gradient(145deg, hsl(195 100% 52%), hsl(278 95% 58%))",
                      boxShadow: currentAvatar
                        ? `0 0 0 2px ${currentAvatar.color}, 0 16px 48px ${currentAvatar.color}55`
                        : "0 0 0 1px hsl(195 100% 70% / 0.35), 0 16px 48px hsl(195 100% 45% / 0.35)",
                    }}
                  >
                    {currentAvatar ? (
                      <div className="h-full w-full p-2">{currentAvatar.svg}</div>
                    ) : (
                      <span className="text-2xl font-black tracking-tight text-background sm:text-3xl">
                        {initialsFromName(displayName)}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker((v) => !v)}
                    className="absolute -right-1.5 -top-1.5 z-20 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neon-cyan/40 bg-background/90 text-neon-cyan shadow-[0_8px_20px_hsl(220_60%_2%/0.5)] transition hover:border-neon-cyan/70 hover:bg-neon-cyan/10"
                    aria-label="Change avatar"
                    title="Change avatar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-lg border border-background bg-background text-neon-cyan shadow-lg">
                    <Crown className="h-4 w-4" />
                  </span>

                  {/* Avatar picker panel */}
                  {typeof document !== "undefined" &&
                    createPortal(
                      <AnimatePresence>
                        {showAvatarPicker && (
                          <>
                            <motion.button
                              type="button"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setShowAvatarPicker(false)}
                              className="fixed inset-0 z-[9998] bg-black/55 backdrop-blur-sm"
                              aria-label="Close avatar picker"
                            />
                            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                              <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 12 }}
                                transition={{ type: "spring", damping: 22, stiffness: 260 }}
                                className="w-[min(92vw,360px)] rounded-[20px] border border-white/15 bg-[hsl(220_45%_9%)] p-4 shadow-[0_24px_60px_hsl(220_60%_2%/0.7)] backdrop-blur-xl"
                              >
                                <div className="mb-3 flex items-center justify-between">
                                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-neon-cyan/80">Choose Avatar</p>
                                  <button
                                    type="button"
                                    onClick={() => setShowAvatarPicker(false)}
                                    className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {KULT_AVATARS.map((av) => (
                                    <button
                                      key={av.id}
                                      type="button"
                                      onClick={() => handleSelectAvatar(av.id)}
                                      className="group relative flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition-all hover:bg-white/5"
                                      style={{
                                        border: selectedAvatar === av.id ? `1.5px solid ${av.color}` : "1.5px solid transparent",
                                        boxShadow: selectedAvatar === av.id ? `0 0 10px ${av.color}55` : "none",
                                      }}
                                    >
                                      <div
                                        className="h-12 w-12 rounded-lg overflow-hidden"
                                        style={{ background: "hsl(220 45% 7%)", border: `1px solid ${av.color}44` }}
                                      >
                                        {av.svg}
                                      </div>
                                      <span className="text-[9px] font-mono text-muted-foreground group-hover:text-foreground transition-colors leading-tight text-center">
                                        {av.label.split(" ")[0]}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            </div>
                          </>
                        )}
                      </AnimatePresence>,
                      document.body
                    )}
                </div>
                <div className="text-center sm:text-left">
                  <p className="mb-1 text-[11px] font-mono uppercase tracking-[0.35em] text-neon-cyan/85">Kult identity</p>
                  <h1 className="font-display text-3xl font-black uppercase tracking-[-0.04em] text-foreground sm:text-4xl md:text-5xl">
                    {displayName}
                  </h1>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Player profile and autonomous AI agent — synced with the Kult backend.
                  </p>
                  {walletAddress ? (
                    <button
                      type="button"
                      onClick={() => copyText("Wallet", walletAddress)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/50 px-4 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-neon-cyan/30 hover:text-neon-cyan"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      {shortAddr(walletAddress)}
                      <Copy className="h-3.5 w-3.5 opacity-50" />
                    </button>
                  ) : null}
                </div>
              </div>
              {full && !isLoading ? (
                <div className="grid w-full max-w-sm grid-cols-2 gap-3 md:w-auto md:max-w-none">
                  <div className="rounded-2xl border border-white/10 bg-background/40 p-4 text-center backdrop-blur-sm">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Level</p>
                    <p className="mt-1 font-display text-3xl font-black text-neon-cyan tabular-nums">{full.level}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-background/40 p-4 text-center backdrop-blur-sm">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Rank</p>
                    <p className="mt-1 font-display text-3xl font-black tabular-nums text-foreground">
                      {full.rank != null ? `#${full.rank}` : "—"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {isLoading && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-72 rounded-[28px]" />
              <Skeleton className="h-72 rounded-[28px]" />
            </div>
          )}

          {isError && (
            <div className="rounded-[28px] border border-red-500/25 bg-red-500/5 p-8 text-center text-sm text-muted-foreground">
              Could not load profile.{" "}
              <button type="button" className="font-medium text-neon-cyan underline underline-offset-4" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          )}

          {full && !isLoading && (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Account + name */}
              <div
                className="lg:col-span-5"
              >
                <div className="h-full rounded-[28px] border border-white/[0.08] bg-card/50 p-6 shadow-[0_20px_60px_hsl(220_60%_2%/0.35)] backdrop-blur-md md:p-8">
                  <div className="mb-6 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-cyan/15 text-neon-cyan">
                      <UserCircle className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">Account</h2>
                      <p className="text-xs text-muted-foreground">Display name &amp; wallet</p>
                    </div>
                  </div>
                  <label htmlFor="profile-name" className="mb-2 block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Display name
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      id="profile-name"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      maxLength={100}
                      className="h-12 flex-1 rounded-xl border-white/10 bg-background/70 text-base"
                    />
                    <Button
                      type="button"
                      disabled={saveName.isPending || !nameDraft.trim() || nameDraft.trim() === full.player.name}
                      onClick={() => saveName.mutate(nameDraft.trim())}
                      className="h-12 shrink-0 rounded-xl px-6 font-display text-xs font-bold tracking-wider"
                    >
                      {saveName.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                  {full.player.referral_code ? (
                    <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                      <p className="mb-1 text-[10px] font-mono uppercase tracking-wider text-violet-300/90">Referral code</p>
                      <p className="font-mono text-lg font-semibold tracking-wide text-foreground">{full.player.referral_code}</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Stats stack */}
              <div
                className="lg:col-span-7"
              >
                <div className="grid h-full gap-4 sm:grid-cols-2">
                  <div className="rounded-[28px] border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/[0.08] to-transparent p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center gap-2 text-neon-cyan">
                      <Trophy className="h-5 w-5" />
                      <span className="text-xs font-mono uppercase tracking-[0.2em]">Arena stats</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Total score</p>
                        <p className="mt-1 font-display text-2xl font-black tabular-nums text-foreground">
                          {full.totalScore.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Games</p>
                        <p className="mt-1 font-display text-2xl font-black tabular-nums text-foreground">{full.totalGamesPlayed}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Quests</p>
                        <p className="mt-1 font-display text-xl font-black text-muted-foreground">{full.completedQuests}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Cache</p>
                        <p className="mt-1 text-sm text-muted-foreground">{full.cached ? "Server cache" : "Live"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between rounded-[28px] border border-white/[0.08] bg-card/40 p-6 backdrop-blur-md">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                        <Gamepad2 className="h-5 w-5 text-neon-cyan" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em]">Session</span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        You’re signed in with Privy. Session and JWT are cleared when you log out from the header menu.
                      </p>
                    </div>
                    <Button variant="outline" asChild className="mt-4 rounded-xl border-white/15 bg-background/30 hover:bg-background/50">
                      <Link to="/ai-arena">Open AI Arena</Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* AI Agent */}
              <div
                className="lg:col-span-12"
              >
                <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-card/60 via-card/30 to-background/80 p-1 shadow-[0_24px_80px_hsl(220_60%_2%/0.4)]">
                  <div className="rounded-[26px] border border-violet-500/15 bg-background/40 p-6 backdrop-blur-md md:p-8">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-neon-cyan/20 text-violet-200">
                          <Bot className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-violet-300/90">AI Arena</p>
                          <h2 className="font-display text-xl font-black uppercase tracking-tight text-foreground md:text-2xl">
                            Your AI agent
                          </h2>
                        </div>
                      </div>
                      {agent ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "w-fit border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
                            agent.status?.toLowerCase() === "inactive" && "border-amber-500/40 bg-amber-500/10 text-amber-200",
                          )}
                        >
                          {agent.status || "Active"}
                        </Badge>
                      ) : null}
                    </div>

                    {agentQuery.isLoading ? (
                      <div className="flex items-center gap-3 py-12 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin text-neon-cyan" />
                        <span className="text-sm">Loading agent…</span>
                      </div>
                    ) : agentQuery.isError ? (
                      <p className="py-8 text-sm text-red-400/90">Could not connect to AI Arena right now.</p>
                    ) : !agent ? (
                      <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-background/30 py-12 text-center">
                        <Sparkles className="mb-3 h-10 w-10 text-muted-foreground/50" />
                        <p className="max-w-md text-sm text-muted-foreground">
                          No agent linked to this wallet yet. Create one from the header menu or visit AI Arena to get started.
                        </p>
                        <Button asChild className="mt-6 rounded-xl font-display text-xs font-bold tracking-wider">
                          <Link to="/ai-arena">Go to AI Arena</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,280px)]">
                        <div>
                          <h3 className="font-display text-lg font-bold text-foreground">{agent.name}</h3>
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{agent.description}</p>
                          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-xl border border-white/10 bg-background/50 p-3">
                              <p className="text-[10px] font-mono uppercase text-muted-foreground">Elo</p>
                              <p className="mt-1 font-display text-xl font-black tabular-nums text-neon-cyan">{agent.eloRating}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-background/50 p-3">
                              <p className="text-[10px] font-mono uppercase text-muted-foreground">Balance</p>
                              <p className="mt-1 font-display text-xl font-black tabular-nums text-foreground">—</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-background/50 p-3">
                              <p className="text-[10px] font-mono uppercase text-muted-foreground">Record</p>
                              <p className="mt-1 flex items-center gap-1 font-mono text-sm">
                                <span className="text-emerald-400">{agent.wins}W</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="text-red-400/90">{agent.losses}L</span>
                              </p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-background/50 p-3">
                              <p className="text-[10px] font-mono uppercase text-muted-foreground">Matches</p>
                              <p className="mt-1 font-display text-xl font-black tabular-nums">{agent.wins + agent.losses}</p>
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Agent ID</p>
                            <button
                              type="button"
                              onClick={() => copyText("Agent ID", agent.id)}
                              className="flex w-full max-w-xl items-center justify-between gap-2 rounded-xl border border-white/10 bg-background/60 px-3 py-2.5 text-left font-mono text-xs text-foreground transition-colors hover:border-neon-cyan/30"
                            >
                              <span className="truncate">{agent.id}</span>
                              <Copy className="h-4 w-4 shrink-0 opacity-50" />
                            </button>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Evolution stage</p>
                            <p className="truncate rounded-xl border border-white/5 bg-background/40 px-3 py-2 font-mono text-[11px] text-muted-foreground">
                              {agent.evolutionStage}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-500/[0.07] to-transparent p-5">
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-orange-300/90">
                              <Flame className="h-5 w-5" />
                              <span className="text-xs font-mono uppercase tracking-wider">Combat ready</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Fund your agent from the header menu to keep it stocked for arena matches and in-game actions.
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button asChild variant="secondary" className="rounded-xl border border-white/10 bg-background/60">
                              <Link to="/ai-arena">
                                <Swords className="mr-2 h-4 w-4" />
                                Arena &amp; training
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {full && full.gameScoresList.length > 0 && (
            <div
              className="mt-8 overflow-hidden rounded-[28px] border border-white/[0.08] bg-card/40 shadow-[0_20px_60px_hsl(220_60%_2%/0.35)] backdrop-blur-md"
            >
              <div className="border-b border-white/10 bg-gradient-to-r from-neon-cyan/10 via-transparent to-violet-500/10 px-6 py-4 md:px-8">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">Scores by game</h2>
                <p className="text-xs text-muted-foreground">Weighted leaderboard contributions per title</p>
              </div>
              <div className="overflow-x-auto px-2 pb-2 md:px-4">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Game</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Weight</th>
                      <th className="px-4 py-3">Weighted</th>
                      <th className="px-4 py-3">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {full.gameScoresList.map((row, i) => (
                      <tr
                        key={row.identification}
                        className={cn(
                          "border-t border-white/[0.05] transition-colors hover:bg-white/[0.03]",
                          i % 2 === 1 && "bg-white/[0.02]",
                        )}
                      >
                        <td className="px-4 py-3.5 font-mono text-xs font-medium text-foreground">{row.identification}</td>
                        <td className="px-4 py-3.5 tabular-nums text-muted-foreground">{row.score.toLocaleString()}</td>
                        <td className="px-4 py-3.5 tabular-nums text-muted-foreground">{row.weight}</td>
                        <td className="px-4 py-3.5 tabular-nums text-neon-cyan/90">
                          {row.weightedScore.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums font-medium text-foreground">
                          {row.rank != null ? `#${row.rank}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProfilePage;
