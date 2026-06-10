import { useState, useMemo, useCallback } from "react";
import { Check, Copy, ExternalLink, Share2, X } from "lucide-react";
import { toast } from "sonner";
import type { Moment } from "@/types/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ── Types ─────────────────────────────────────────────────────────────────────

type SharePlatformId = "twitter" | "facebook" | "reddit" | "whatsapp" | "pinterest" | "tiktok";

type SharePayload = {
  /** Moment page URL — what humans visit */
  url: string;
  /** Direct public asset URL (image/video) — passed to platforms for image preview */
  mediaUrl?: string;
  title: string;
  teaser: string;
  hashtags: string[];
  relatedGames: string[];
};

type SharePlatform = {
  id: SharePlatformId;
  label: string;
  icon: string;
  color: string;
  bg: string;
  copyOnly?: boolean;
  buildUrl: (p: SharePayload) => string;
  buildPostText: (p: SharePayload) => string;
};

type ShareTemplate = { id: string; label: string; text: string };
type GameTemplateGroup = { gameSlug: string; gameName: string; templates: ShareTemplate[] };

// ── Payload ───────────────────────────────────────────────────────────────────

const APP_ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

function buildSharePayload(moment: Moment): SharePayload {
  const url = `${APP_ORIGIN}/moments/${moment.momentId}`;
  const game = moment.relatedGames?.[0] ?? "Kult";
  const teaser = moment.aiCaption?.trim() || moment.description?.trim() || moment.title;
  const hashtags = ["KultGames", "KultMoments", game.replace(/[\s-]+/g, "")].filter(Boolean);
  return {
    url,
    mediaUrl: moment.assetZgUrl ?? moment.assetUrl ?? undefined,
    title: moment.title || "Kult Moment",
    teaser: teaser ?? "",
    hashtags,
    relatedGames: moment.relatedGames ?? [],
  };
}

// ── Platforms ─────────────────────────────────────────────────────────────────
// Where a platform can accept an image URL directly in its share params we use
// `mediaUrl` so the post/pin shows the actual moment asset rather than relying
// on the SPA page having OG meta tags (which it doesn't).

const PLATFORMS: SharePlatform[] = [
  {
    id: "twitter",
    label: "Twitter / X",
    icon: "𝕏",
    color: "#fff",
    bg: "#000",
    // Twitter appends the `url` param automatically to the tweet — don't put it
    // in `text` too, and never use mediaUrl as the url param (it shows the raw
    // storage URL in the tweet). Use the moment page URL only.
    buildUrl: (p) => {
      const text = `${p.title}\n${p.hashtags.map(h => `#${h}`).join(" ")}`;
      return `https://twitter.com/intent/tweet?${new URLSearchParams({ text, url: p.url })}`;
    },
    buildPostText: (p) => `${p.title}\n\n${p.teaser}\n\n${p.hashtags.map(h => `#${h}`).join(" ")}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: "f",
    color: "#fff",
    bg: "#1877f2",
    buildUrl: (p) => {
      // Share the media URL when available so Facebook crawls the image.
      const sharedUrl = p.mediaUrl ?? p.url;
      return `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: sharedUrl })}`;
    },
    buildPostText: (p) => `${p.title}\n\n${p.teaser}\n\n${p.url}`,
  },
  {
    id: "reddit",
    label: "Reddit",
    icon: "r/",
    color: "#fff",
    bg: "#ff4500",
    // Submit the image URL directly so Reddit renders it as an image post.
    buildUrl: (p) => {
      const submitUrl = p.mediaUrl ?? p.url;
      return `https://www.reddit.com/submit?${new URLSearchParams({ url: submitUrl, title: p.title })}`;
    },
    buildPostText: (p) => p.title,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: "W",
    color: "#fff",
    bg: "#25d366",
    // Include the media URL in the message text — WhatsApp fetches and previews it.
    buildUrl: (p) => {
      const parts = [`*${p.title}*`, p.teaser, p.mediaUrl, p.url].filter(Boolean);
      return `https://api.whatsapp.com/send?${new URLSearchParams({ text: parts.join("\n") })}`;
    },
    buildPostText: (p) => {
      const parts = [`*${p.title}*`, p.teaser, p.mediaUrl, p.url].filter(Boolean);
      return parts.join("\n");
    },
  },
  {
    id: "pinterest",
    label: "Pinterest",
    icon: "P",
    color: "#fff",
    bg: "#e60023",
    // Pinterest natively supports `media` — no OG crawl needed.
    buildUrl: (p) => {
      const params = new URLSearchParams({ url: p.url, description: `${p.title} – ${p.teaser}` });
      if (p.mediaUrl) params.set("media", p.mediaUrl);
      return `https://www.pinterest.com/pin/create/button/?${params}`;
    },
    buildPostText: (p) => `${p.title}\n\n${p.teaser}`,
  },
  {
    id: "tiktok",
    label: "TikTok",
    icon: "♪",
    color: "#fff",
    bg: "#010101",
    copyOnly: true,
    buildUrl: () => "https://www.tiktok.com",
    buildPostText: (p) => `${p.title}\n${p.hashtags.map(h => `#${h}`).join(" ")}\n${p.url}`,
  },
];

// ── Templates ─────────────────────────────────────────────────────────────────

const GAME_TEMPLATES: GameTemplateGroup[] = [
  {
    gameSlug: "ai-arena", gameName: "AI Arena",
    templates: [
      { id: "ai-1", label: "99% wrong", text: "Everyone said my agent wouldn't win. 99% were wrong. 👁️\n#KultGames #AIArena" },
      { id: "ai-2", label: "Top 1%",    text: "Top 1% agent worldwide. The proof is right here. 🏆\n#KultGames #AIArena" },
      { id: "ai-3", label: "Not today", text: "Every AI in the lobby said I wasn't winning. Every one of them was wrong.\n#KultMoments" },
    ],
  },
  {
    gameSlug: "robowars", gameName: "Robowars",
    templates: [
      { id: "rw-1", label: "Dominant",   text: "No contest. My agent ran through the whole lobby.\n#Robowars #KultGames" },
      { id: "rw-2", label: "Clutch",     text: "Down to the last second. This is why I play.\n#Robowars #KultMoments" },
    ],
  },
  {
    gameSlug: "kult-royale", gameName: "Warzone",
    templates: [
      { id: "ww-1", label: "Last alive", text: "Last one standing. That's all that matters.\n#WarzoneWarriors #KultGames" },
      { id: "ww-2", label: "Squad wipe", text: "Full squad wipe in under 90 seconds.\n#WarzoneWarriors #KultMoments" },
    ],
  },
];

function findMatchedGroup(relatedGames: string[]): GameTemplateGroup {
  const hay = relatedGames.join(" ").toLowerCase();
  if (hay.includes("ai-arena") || hay.includes("aiarena") || hay.includes("guess")) return GAME_TEMPLATES[0]!;
  if (hay.includes("robo")) return GAME_TEMPLATES[1]!;
  if (hay.includes("warzone") || hay.includes("royale")) return GAME_TEMPLATES[2]!;
  return GAME_TEMPLATES[0]!;
}

// ── Clipboard ─────────────────────────────────────────────────────────────────

async function copyText(text: string) {
  if (navigator?.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
}

function buildPlatformUrlWithTemplate(platform: SharePlatform, templateText: string, payload: SharePayload): string {
  const withUrl = `${templateText}\n${payload.url}`;
  switch (platform.id) {
    case "twitter":
      // Use moment URL only — never mediaUrl, Twitter appends `url` param to tweet text
      return `https://twitter.com/intent/tweet?${new URLSearchParams({ text: templateText, url: payload.url })}`;
    case "whatsapp": {
      const parts = [templateText, payload.mediaUrl, payload.url].filter(Boolean);
      return `https://api.whatsapp.com/send?${new URLSearchParams({ text: parts.join("\n") })}`;
    }
    case "reddit": {
      const submitUrl = payload.mediaUrl ?? payload.url;
      return `https://www.reddit.com/submit?${new URLSearchParams({ url: submitUrl, title: templateText.split("\n")[0] ?? payload.title })}`;
    }
    case "facebook": {
      const sharedUrl = payload.mediaUrl ?? payload.url;
      return `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({ u: sharedUrl, quote: templateText })}`;
    }
    case "pinterest": {
      const params = new URLSearchParams({ url: payload.url, description: templateText });
      if (payload.mediaUrl) params.set("media", payload.mediaUrl);
      return `https://www.pinterest.com/pin/create/button/?${params}`;
    }
    default:
      return platform.buildUrl(payload);
  }
}

// ── CopyLinkBar ───────────────────────────────────────────────────────────────

function CopyLinkBar({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await copyText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-1 pl-3">
      <span className="flex-1 truncate font-mono text-[11px] text-white/40">{url}</span>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 font-tech text-[10px] font-bold uppercase tracking-wider transition ${
          copied ? "bg-emerald-500/20 text-emerald-400" : "bg-[#9a35ff] text-white hover:bg-[#8525eb]"
        }`}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

// ── Template chips ────────────────────────────────────────────────────────────

function TemplateChips({ group, selectedId, onSelect }: {
  group: GameTemplateGroup;
  selectedId: string | null;
  onSelect: (t: ShareTemplate | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {/* Auto chip */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-tech text-[9px] font-bold uppercase tracking-wider transition-all ${
          selectedId === null
            ? "border-[#9a35ff]/50 bg-[#9a35ff]/15 text-[#c084fc]"
            : "border-white/8 bg-white/[0.03] text-white/35 hover:border-white/15 hover:text-white/60"
        }`}
      >
        {selectedId === null && <Check className="h-2.5 w-2.5" />}
        Auto
      </button>
      {/* Template chips */}
      {group.templates.map((tmpl) => {
        const active = selectedId === tmpl.id;
        return (
          <button
            key={tmpl.id}
            type="button"
            onClick={() => onSelect(tmpl)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-tech text-[9px] font-bold uppercase tracking-wider transition-all ${
              active
                ? "border-[#9a35ff]/50 bg-[#9a35ff]/15 text-[#c084fc]"
                : "border-white/8 bg-white/[0.03] text-white/35 hover:border-white/15 hover:text-white/60"
            }`}
          >
            {active && <Check className="h-2.5 w-2.5" />}
            {tmpl.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Post preview ──────────────────────────────────────────────────────────────

function PostPreviewText({ platform, payload, customText }: {
  platform: SharePlatform;
  payload: SharePayload;
  customText: string | null;
}) {
  const postText = customText ?? platform.buildPostText(payload);
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await copyText(postText);
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };
  return (
    <div className="relative rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5">
      <pre className="whitespace-pre-wrap break-words font-sans text-[12px] leading-relaxed text-white/65 pr-8">
        {postText}
      </pre>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-white/30 transition hover:bg-white/5 hover:text-white"
        title="Copy post text"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

// ── Main dialog ───────────────────────────────────────────────────────────────

type MomentShareDialogProps = {
  moment: Moment;
  onShareOpen?: () => void;
  triggerVariant?: "button" | "icon";
};

const MomentShareDialog = ({ moment, onShareOpen, triggerVariant = "button" }: MomentShareDialogProps) => {
  const payload = useMemo(() => buildSharePayload(moment), [moment]);
  const [selectedPlatformId, setSelectedPlatformId] = useState<SharePlatformId>("twitter");
  const [selectedTemplate, setSelectedTemplate] = useState<ShareTemplate | null>(null);
  const matchedGroup = useMemo(() => findMatchedGroup(moment.relatedGames ?? []), [moment.relatedGames]);
  const platform = PLATFORMS.find((p) => p.id === selectedPlatformId) ?? PLATFORMS[0]!;
  const mediaUrl = moment.assetZgUrl ?? moment.assetUrl;
  const isVideo = /\.(mp4|webm|mov)(\?.*)?$/i.test(mediaUrl ?? "");

  const handleShare = useCallback(async () => {
    if (platform.copyOnly) {
      const text = selectedTemplate?.text ?? platform.buildPostText(payload);
      try {
        await copyText(`${text}\n${payload.url}`);
        toast.success("Link copied — paste it in TikTok to share.");
      } catch {
        toast.error("Could not copy");
      }
      window.open(platform.buildUrl(payload), "_blank", "noopener,noreferrer");
      return;
    }
    const url = selectedTemplate
      ? buildPlatformUrlWithTemplate(platform, selectedTemplate.text, payload)
      : platform.buildUrl(payload);
    window.open(url, "_blank", "noopener,noreferrer");
  }, [platform, payload, selectedTemplate]);

  return (
    <Dialog onOpenChange={(open) => { if (open) onShareOpen?.(); }}>
      <DialogTrigger asChild>
        {triggerVariant === "icon" ? (
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            aria-label="Share moment"
            className="cursor-pointer rounded-md p-1.5 text-white/50 transition hover:bg-[#9a35ff]/10 hover:text-[#9a35ff]"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-tech text-xs font-bold uppercase tracking-wider text-white/60 transition hover:border-[#9a35ff]/40 hover:text-white"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border border-white/10 bg-[#0e0e16] p-0 sm:max-w-[560px] [&>button.absolute]:hidden">

        {/* ── Hero image — full width, pinned ── */}
        {mediaUrl && (
          <div className="relative shrink-0 aspect-video w-full overflow-hidden bg-black">
            {isVideo ? (
              <video src={mediaUrl} className="h-full w-full object-cover" preload="metadata" muted playsInline />
            ) : (
              <img src={mediaUrl} alt={moment.title} className="h-full w-full object-cover" />
            )}
            {/* Gradient + overlay info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
            <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
              <DialogTitle className="font-tech text-sm font-bold text-white drop-shadow">
                {moment.title}
              </DialogTitle>
            </div>
            {/* Close button top-right */}
            <DialogClose className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white/70 backdrop-blur-sm transition hover:bg-black/80 hover:text-white">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
        )}

        {/* No-image fallback header */}
        {!mediaUrl && (
          <div className="shrink-0 flex items-center justify-between border-b border-white/6 px-5 py-4">
            <DialogTitle className="font-tech text-sm font-bold uppercase tracking-wider text-white">
              {moment.title || "Share Moment"}
            </DialogTitle>
            <DialogClose className="rounded-lg p-1.5 text-white/30 transition hover:bg-white/5 hover:text-white">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
        )}

        {/* ── Scrollable body ── */}
        <div className="min-h-0 flex-1 overflow-y-auto space-y-4 px-5 py-4 [scrollbar-width:thin]">

          {/* Copy link */}
          <CopyLinkBar url={payload.url} />

          {/* Platform grid — 6 platforms, 3 per row */}
          <div>
            <p className="mb-2.5 font-tech text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Share on</p>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => {
                const isActive = selectedPlatformId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlatformId(p.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
                      isActive
                        ? "border-transparent shadow-[0_0_0_1.5px_rgba(154,53,255,0.6)] bg-[#9a35ff]/10"
                        : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                      style={{ background: p.bg, color: p.color }}
                    >
                      {p.icon}
                    </span>
                    <span className={`font-tech text-[9px] font-bold uppercase tracking-wide ${isActive ? "text-[#c084fc]" : "text-white/40"}`}>
                      {p.label.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template chips */}
          <TemplateChips
            group={matchedGroup}
            selectedId={selectedTemplate?.id ?? null}
            onSelect={setSelectedTemplate}
          />

          {/* Post preview */}
          <PostPreviewText
            platform={platform}
            payload={payload}
            customText={selectedTemplate?.text ?? null}
          />
        </div>

        {/* ── CTA — fixed at bottom ── */}
        <div className="shrink-0 border-t border-white/6 px-5 py-4">
          <button
            type="button"
            onClick={() => void handleShare()}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-tech text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${platform.bg}, ${platform.bg}bb)`,
              boxShadow: `0 4px 24px ${platform.bg}44`,
            }}
          >
            {platform.copyOnly
              ? <><Copy className="h-4 w-4" /> Copy &amp; Open {platform.label.split(" ")[0]}</>
              : <><ExternalLink className="h-4 w-4" /> Open {platform.label.split(" ")[0]}</>
            }
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MomentShareDialog;
