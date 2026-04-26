import { motion } from "framer-motion";
import { X, Wallet, Zap, Shield, Brain, ChevronRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { CHAIN_THEMES, CHAIN_IDS, withAlpha, type ChainId } from "@/lib/chainThemes";

interface AgentWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "select" | "create" | "done";

function ChainIcon({ chainId, size = 20 }: { chainId: ChainId; size?: number }) {
  const t = CHAIN_THEMES[chainId];

  if (chainId === "0g") {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke={t.primary} strokeWidth="1.5" fill="none" />
        <text
          x="10"
          y="14"
          textAnchor="middle"
          fill={t.primary}
          fontSize="9"
          fontWeight="bold"
          fontFamily="monospace"
        >
          0G
        </text>
      </svg>
    );
  }

  if (chainId === "base") {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke={t.primary} strokeWidth="1.5" fill="none" />
        <text
          x="10.5"
          y="14.5"
          textAnchor="middle"
          fill={t.primary}
          fontSize="11"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          b
        </text>
      </svg>
    );
  }

  // Solana: 3-bar diagonal logo (all bars tilt upper-right, middle uses secondary color)
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M2 6H14L17 2H5L2 6Z" fill={t.primary} />
      <path d="M2 12H14L17 8H5L2 12Z" fill={t.secondary} />
      <path d="M2 18H14L17 14H5L2 18Z" fill={t.primary} />
    </svg>
  );
}

const AgentWalletModal = ({ isOpen, onClose }: AgentWalletModalProps) => {
  const [step, setStep] = useState<Step>("select");
  const [chainId, setChainId] = useState<ChainId>("0g");
  const [creating, setCreating] = useState(false);
  const [hoveredChain, setHoveredChain] = useState<ChainId | null>(null);

  // On chain-select step, preview the hovered chain; otherwise use the selected one
  const displayTheme = CHAIN_THEMES[step === "select" ? (hoveredChain ?? "0g") : chainId];
  const selectedTheme = CHAIN_THEMES[chainId];

  const handleSelectChain = (id: ChainId) => {
    setChainId(id);
    setHoveredChain(null);
    setStep("create");
  };

  const handleCreate = () => {
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      setStep("done");
    }, 2000);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("select");
      setChainId("0g");
      setCreating(false);
      setHoveredChain(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        style={{
          background: displayTheme.backdropBg,
          backdropFilter: "blur(12px)",
          transition: "background 0.35s ease",
        }}
        onClick={handleClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="relative w-full max-w-lg pointer-events-auto">
          {/* Ambient glow behind card */}
          <div
            className="absolute -inset-4 -z-10 rounded-[36px] opacity-60"
            style={{
              background: displayTheme.ambientGlow,
              filter: "blur(30px)",
              transition: "background 0.35s ease",
            }}
          />

          {/* Card */}
          <div
            className="relative w-full overflow-hidden"
            style={{
              borderRadius: "24px",
              border: `1px solid ${displayTheme.border}`,
              background: displayTheme.cardBg,
              boxShadow: displayTheme.boxShadow,
              transition: "border-color 0.35s ease, box-shadow 0.35s ease",
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-[10%] right-[10%] h-[1px]"
              style={{
                background: displayTheme.topAccent,
                transition: "background 0.35s ease",
              }}
            />

            {/* Back button — only on create step */}
            {step === "create" && (
              <button
                onClick={() => setStep("select")}
                className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                style={{
                  borderRadius: "10px",
                  border: "1px solid hsl(210 25% 20% / 0.4)",
                  background: "hsl(220 45% 10% / 0.5)",
                  padding: "6px 10px",
                }}
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>
            )}

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              style={{
                borderRadius: "12px",
                border: "1px solid hsl(210 25% 20% / 0.5)",
                background: "hsl(220 45% 10% / 0.5)",
              }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 pb-7 pt-10">

              {/* ── STEP: Chain Selection ── */}
              {step === "select" && (
                <>
                  <div className="text-center mb-6">
                    <h2 className="font-display text-2xl font-black tracking-tight text-foreground mb-2">
                      Choose Your Chain
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      Select the blockchain where your AI agent's hot wallet will live.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {CHAIN_IDS.map((id) => {
                      const t = CHAIN_THEMES[id];
                      const isHovered = hoveredChain === id;
                      return (
                        <motion.button
                          key={id}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          onHoverStart={() => setHoveredChain(id)}
                          onHoverEnd={() => setHoveredChain(null)}
                          onClick={() => handleSelectChain(id)}
                          className="flex flex-col items-center gap-2.5 px-3 py-4 text-center"
                          style={{
                            borderRadius: "16px",
                            border: `1px solid ${isHovered ? withAlpha(t.primary, 0.4) : "hsl(210 25% 20% / 0.4)"}`,
                            background: isHovered ? t.iconBg : "hsl(220 45% 10% / 0.3)",
                            transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
                            boxShadow: isHovered ? `0 0 24px ${withAlpha(t.primary, 0.15)}` : "none",
                          }}
                        >
                          <div
                            className="w-10 h-10 flex items-center justify-center"
                            style={{
                              borderRadius: "12px",
                              background: t.iconBg,
                              border: `1px solid ${t.border}`,
                            }}
                          >
                            <ChainIcon chainId={id} size={22} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground leading-tight">{t.name}</p>
                            <p
                              className="text-[10px] font-mono mt-0.5"
                              style={{ color: t.primary }}
                            >
                              {t.token}
                            </p>
                          </div>
                          <div
                            className="flex items-center gap-0.5 text-[10px] font-mono"
                            style={{ color: isHovered ? t.primary : "hsl(210 15% 45%)" }}
                          >
                            Select <ChevronRight className="w-2.5 h-2.5" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  <p className="text-center text-[10px] text-muted-foreground/40">
                    Powered by Kult · Multi-chain AI agents
                  </p>
                </>
              )}

              {/* ── STEP: Create Wallet ── */}
              {step === "create" && (
                <>
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mx-auto mb-4 w-16 h-16 flex items-center justify-center"
                      style={{
                        borderRadius: "20px",
                        background: selectedTheme.iconBg,
                        border: `1px solid ${withAlpha(selectedTheme.primary, 0.3)}`,
                        boxShadow: `0 0 30px ${withAlpha(selectedTheme.primary, 0.12)}`,
                      }}
                    >
                      <Wallet
                        className="w-7 h-7"
                        style={{
                          color: selectedTheme.primary,
                          filter: `drop-shadow(0 0 8px ${withAlpha(selectedTheme.primary, 0.6)})`,
                        }}
                      />
                    </motion.div>

                    {/* Chain badge */}
                    <div
                      className="inline-flex items-center gap-2 mb-3 px-3 py-1.5"
                      style={{
                        borderRadius: "99px",
                        border: `1px solid ${withAlpha(selectedTheme.primary, 0.25)}`,
                        background: selectedTheme.iconBg,
                      }}
                    >
                      <ChainIcon chainId={chainId} size={14} />
                      <span className="text-[11px] font-mono" style={{ color: selectedTheme.primary }}>
                        {selectedTheme.name}
                      </span>
                    </div>

                    <h2 className="font-display text-2xl font-black tracking-tight text-foreground mb-2">
                      Create Agent Wallet
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      Fund your AI agent wallet and authorize it to purchase items autonomously
                      using its own decision-making on {selectedTheme.name}.
                    </p>
                  </div>

                  {/* Feature highlights */}
                  <div className="space-y-3 mb-6">
                    {[
                      { icon: Zap, ...selectedTheme.features[0] },
                      { icon: Brain, ...selectedTheme.features[1] },
                      { icon: Shield, ...selectedTheme.features[2] },
                    ].map((item, i) => (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        className="flex items-center gap-3 px-4 py-3"
                        style={{
                          borderRadius: "14px",
                          border: "1px solid hsl(210 25% 20% / 0.4)",
                          background: "hsl(220 45% 10% / 0.3)",
                        }}
                      >
                        <div
                          className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderRadius: "10px",
                            background: withAlpha(item.color, 0.1),
                          }}
                        >
                          <item.icon className="w-4 h-4" style={{ color: item.color }} />
                        </div>
                        <span className="text-xs text-foreground font-medium">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Create button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleCreate}
                    disabled={creating}
                    className="w-full h-12 font-display font-semibold text-sm tracking-wider flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{
                      borderRadius: "16px",
                      background: `linear-gradient(135deg, ${selectedTheme.primary}, ${selectedTheme.secondary})`,
                      color: "hsl(220 50% 6%)",
                      boxShadow: `0 0 30px ${withAlpha(selectedTheme.primary, 0.3)}`,
                    }}
                  >
                    {creating ? (
                      <>
                        <motion.div
                          className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black/80"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Creating Wallet...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        Create Agent Wallet
                      </>
                    )}
                  </motion.button>

                  <p className="mt-5 text-center text-[10px] text-muted-foreground/40">
                    Powered by {selectedTheme.name} · On-chain AI agents
                  </p>
                </>
              )}

              {/* ── STEP: Done ── */}
              {step === "done" && (
                <>
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="mx-auto mb-5 w-16 h-16 flex items-center justify-center"
                      style={{
                        borderRadius: "20px",
                        background: "linear-gradient(135deg, hsl(150 80% 20% / 0.4), hsl(195 60% 15% / 0.4))",
                        border: "1px solid hsl(150 100% 50% / 0.25)",
                        boxShadow: "0 0 30px hsl(150 100% 50% / 0.12)",
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                          <path
                            d="M7 14L12 19L21 9"
                            stroke="hsl(150, 100%, 60%)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.div>
                    </motion.div>

                    <h2 className="font-display text-2xl font-black tracking-tight text-foreground mb-1">
                      Wallet Created!
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Your AI agent wallet is ready on {selectedTheme.name}.
                    </p>
                  </div>

                  {/* Wallet card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                    style={{
                      borderRadius: "18px",
                      border: `1px solid ${selectedTheme.border}`,
                      background: "linear-gradient(145deg, hsl(220 45% 10% / 0.6), hsl(220 45% 8% / 0.8))",
                      boxShadow: `inset 0 1px 0 ${withAlpha(selectedTheme.primary, 0.06)}`,
                    }}
                  >
                    <div
                      className="px-5 py-4 flex items-center justify-between border-b"
                      style={{ borderColor: "hsl(210 25% 20% / 0.3)" }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 flex items-center justify-center"
                          style={{
                            borderRadius: "12px",
                            background: selectedTheme.iconBg,
                            border: `1px solid ${withAlpha(selectedTheme.primary, 0.2)}`,
                          }}
                        >
                          <ChainIcon chainId={chainId} size={20} />
                        </div>
                        <div>
                          <span className="text-xs font-mono text-muted-foreground">
                            {selectedTheme.name}
                          </span>
                          <p className="text-[10px] text-muted-foreground/60 font-mono">Agent Wallet</p>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1"
                        style={{
                          borderRadius: "8px",
                          background: "hsl(150 100% 50% / 0.08)",
                          border: "1px solid hsl(150 100% 50% / 0.15)",
                        }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: "hsl(150 100% 60%)",
                            boxShadow: "0 0 4px hsl(150 100% 60%)",
                          }}
                        />
                        <span className="text-[10px] font-mono" style={{ color: "hsl(150 100% 60%)" }}>
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="px-5 py-5">
                      <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1">
                        Balance
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="font-display text-3xl font-black text-foreground"
                          style={{ textShadow: `0 0 20px ${withAlpha(selectedTheme.primary, 0.2)}` }}
                        >
                          0.00
                        </span>
                        <span className="text-sm font-mono" style={{ color: selectedTheme.primary }}>
                          {selectedTheme.token}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/50 mt-1 font-mono">≈ $0.00 USD</p>
                    </div>
                  </motion.div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="h-11 font-display font-semibold text-xs tracking-wider flex items-center justify-center gap-2"
                      style={{
                        borderRadius: "14px",
                        background: `linear-gradient(135deg, ${selectedTheme.primary}, ${selectedTheme.secondary})`,
                        color: "hsl(220 50% 6%)",
                        boxShadow: `0 0 20px ${withAlpha(selectedTheme.primary, 0.25)}`,
                      }}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Fund Wallet
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className="h-11 font-display font-semibold text-xs tracking-wider flex items-center justify-center gap-2"
                      style={{
                        borderRadius: "14px",
                        border: `1px solid ${withAlpha(selectedTheme.primary, 0.3)}`,
                        background: selectedTheme.iconBg,
                        color: selectedTheme.primary,
                      }}
                    >
                      Done
                    </motion.button>
                  </div>

                  <p className="mt-5 text-center text-[10px] text-muted-foreground/40">
                    Powered by {selectedTheme.name} · On-chain AI agents
                  </p>
                </>
              )}

            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AgentWalletModal;
