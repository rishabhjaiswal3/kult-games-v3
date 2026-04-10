import { motion } from "framer-motion";
import { X, Wallet, Zap, Shield, Brain } from "lucide-react";
import { useState } from "react";

interface AgentWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AgentWalletModal = ({ isOpen, onClose }: AgentWalletModalProps) => {
  const [created, setCreated] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = () => {
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      setCreated(true);
    }, 2000);
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setCreated(false);
      setCreating(false);
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
          background: "radial-gradient(ellipse at 50% 40%, hsl(270 82% 15% / 0.3), hsl(220 50% 4% / 0.88))",
          backdropFilter: "blur(12px)",
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
          {/* Ambient glow */}
          <div
            className="absolute -inset-4 -z-10 rounded-[36px] opacity-60"
            style={{
              background: "radial-gradient(circle at 50% 0%, hsl(195 100% 50% / 0.2), transparent 60%)",
              filter: "blur(30px)",
            }}
          />

          {/* Card */}
          <div
            className="relative w-full overflow-hidden"
            style={{
              borderRadius: "24px",
              border: "1px solid hsl(195 100% 50% / 0.15)",
              background: "linear-gradient(160deg, hsl(265 48% 12% / 0.98), hsl(220 45% 7% / 0.98))",
              boxShadow:
                "0 30px 80px hsl(220 50% 2% / 0.5), 0 0 60px hsl(195 100% 50% / 0.06), inset 0 1px 0 hsl(195 100% 65% / 0.08)",
            }}
          >
            {/* Top accent */}
            <div
              className="absolute top-0 left-[10%] right-[10%] h-[1px]"
              style={{
                background: "linear-gradient(90deg, transparent, hsl(195 100% 65% / 0.5), hsl(270 80% 65% / 0.4), transparent)",
              }}
            />

            {/* Close */}
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
              {!created ? (
                <>
                  {/* Pre-creation state */}
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mx-auto mb-5 w-16 h-16 flex items-center justify-center"
                      style={{
                        borderRadius: "20px",
                        background: "linear-gradient(135deg, hsl(195 60% 18% / 0.5), hsl(220 45% 10% / 0.5))",
                        border: "1px solid hsl(195 100% 50% / 0.2)",
                        boxShadow: "0 0 30px hsl(195 100% 50% / 0.12)",
                      }}
                    >
                      <Wallet className="w-7 h-7" style={{ color: "hsl(195 100% 65%)", filter: "drop-shadow(0 0 8px hsl(195 100% 65% / 0.6))" }} />
                    </motion.div>

                    <h2 className="font-display text-2xl font-black tracking-tight text-foreground mb-2">
                      Create Agent Wallet
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                      Fund your AI agent wallet and authorize it to purchase items autonomously using its own decision-making on the 0G chain.
                    </p>
                  </div>

                  {/* Feature highlights */}
                  <div className="space-y-3 mb-6">
                    {[
                      { icon: Zap, text: "Self-funded hot wallet on 0G chain", color: "hsl(195 100% 65%)" },
                      { icon: Brain, text: "AI makes autonomous purchase decisions", color: "hsl(270 80% 70%)" },
                      { icon: Shield, text: "You control the funding & authorization", color: "hsl(195 100% 65%)" },
                    ].map((item, i) => (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.08 }}
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
                            background: `${item.color.replace(")", " / 0.1)")}`,
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
                    className="w-full h-12 font-display font-semibold text-sm tracking-wider btn-eye flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {creating ? (
                      <>
                        <motion.div
                          className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
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
                </>
              ) : (
                <>
                  {/* Post-creation — show wallet */}
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
                          <path d="M7 14L12 19L21 9" stroke="hsl(150, 100%, 60%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.div>
                    </motion.div>

                    <h2 className="font-display text-2xl font-black tracking-tight text-foreground mb-1">
                      Wallet Created!
                    </h2>
                    <p className="text-sm text-muted-foreground">Your AI agent wallet is ready on 0G chain.</p>
                  </div>

                  {/* Wallet card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                    style={{
                      borderRadius: "18px",
                      border: "1px solid hsl(195 100% 50% / 0.15)",
                      background: "linear-gradient(145deg, hsl(220 45% 10% / 0.6), hsl(220 45% 8% / 0.8))",
                      boxShadow: "inset 0 1px 0 hsl(195 100% 65% / 0.06)",
                    }}
                  >
                    <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: "hsl(210 25% 20% / 0.3)" }}>
                      <div className="flex items-center gap-2.5">
                        {/* 0G Chain icon */}
                        <div
                          className="w-9 h-9 flex items-center justify-center"
                          style={{
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, hsl(195 100% 50% / 0.15), hsl(220 45% 10% / 0.4))",
                            border: "1px solid hsl(195 100% 50% / 0.2)",
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="7" stroke="hsl(195, 100%, 65%)" strokeWidth="1.5" fill="none" />
                            <text x="10" y="14" textAnchor="middle" fill="hsl(195, 100%, 65%)" fontSize="9" fontWeight="bold" fontFamily="monospace">0G</text>
                          </svg>
                        </div>
                        <div>
                          <span className="text-xs font-mono text-muted-foreground">0G Chain</span>
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
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "hsl(150 100% 60%)", boxShadow: "0 0 4px hsl(150 100% 60%)" }} />
                        <span className="text-[10px] font-mono" style={{ color: "hsl(150 100% 60%)" }}>Active</span>
                      </div>
                    </div>

                    <div className="px-5 py-5">
                      <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1">Balance</p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-3xl font-black text-foreground" style={{ textShadow: "0 0 20px hsl(195 100% 50% / 0.2)" }}>
                          0.00
                        </span>
                        <span className="text-sm font-mono" style={{ color: "hsl(195 100% 65%)" }}>0G</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/50 mt-1 font-mono">≈ $0.00 USD</p>
                    </div>
                  </motion.div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="h-11 font-display font-semibold text-xs tracking-wider btn-eye flex items-center justify-center gap-2"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Fund Wallet
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className="h-11 font-display font-semibold text-xs tracking-wider btn-eye-outline flex items-center justify-center gap-2"
                    >
                      Done
                    </motion.button>
                  </div>
                </>
              )}

              <p className="mt-5 text-center text-[10px] text-muted-foreground/40">
                Powered by 0G Chain · On-chain AI agents
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AgentWalletModal;
