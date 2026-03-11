import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Wallet, Chrome } from "lucide-react";
import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [email, setEmail] = useState("");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[hsl(220_50%_4%/0.82)] backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
            style={{ maxHeight: "100vh" }}
          >
            <div className="relative w-full max-w-md pointer-events-auto">
              <div className="absolute inset-0 -z-10 rounded-[28px] bg-[radial-gradient(circle_at_top,hsl(278_100%_70%/0.16),transparent_40%)] blur-xl" />

              <div className="relative w-full overflow-hidden rounded-[24px] border border-[hsl(278_100%_75%/0.14)] bg-[linear-gradient(135deg,hsl(265_90%_14%/0.98),hsl(220_45%_9%/0.98))] shadow-[0_24px_60px_hsl(220_50%_2%/0.42),0_0_30px_hsl(270_82%_58%/0.1)]">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-[16px] border border-border/40 bg-card/40 text-muted-foreground hover:text-foreground hover:border-[hsl(278_100%_70%/0.28)] hover:bg-[hsl(278_100%_70%/0.08)] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="px-5 pb-5 pt-14 md:px-6 md:pb-6">
                  <div className="text-center">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[hsl(278_100%_70%/0.22)] bg-[hsl(278_100%_70%/0.08)] px-3 py-1.5">
                      <div className="h-2 w-2 rounded-full bg-[hsl(278_100%_82%)]" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[hsl(278_100%_82%)]">
                        Browser Access
                      </span>
                    </div>
                    <h2 className="font-display text-3xl font-black tracking-tight text-foreground">
                      Sign In
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Access games, events, rankings, and AI features.
                    </p>
                  </div>

                  <div className="mt-6 space-y-2">
                    <label className="text-sm font-medium text-foreground">Email address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 rounded-[16px] border border-border/50 bg-muted/35 px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(278_100%_70%/0.28)] focus:border-[hsl(278_100%_70%/0.35)] transition-all"
                    />
                  </div>

                  <div className="mt-5 space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full h-12 font-display font-semibold text-sm tracking-wider btn-eye transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Send Code
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full h-12 font-display font-semibold text-sm tracking-wider btn-eye-outline transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      Connect Wallet
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full h-12 rounded-[16px] font-medium text-sm text-foreground border border-border/50 bg-muted/25 hover:bg-muted/45 hover:border-[hsl(278_100%_70%/0.24)] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Chrome className="w-4 h-4" />
                      Continue with Google
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
