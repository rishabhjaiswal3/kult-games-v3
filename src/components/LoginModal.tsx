import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Wallet, Globe, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  useLogin,
  useLoginWithEmail,
  useLoginWithOAuth,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import { getAllowedChainFromEnv } from "@/lib/chain";
import { switchAppChainViaInjectedProvider } from "@/lib/ensureWalletChain";
import { privyAuthErrorMessage } from "@/lib/privyAuthErrors";
import { useAuth } from "@/contexts/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletFlowPending, setWalletFlowPending] = useState(false);
  const [walletFlowBusy, setWalletFlowBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [finishingSignIn, setFinishingSignIn] = useState(false);
  const walletFlowInFlightRef = useRef(false);

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { authenticated, ready, linkWallet } = usePrivy();
  const { wallets } = useWallets();
  const activeWallet = wallets[0];
  const targetChainId = getAllowedChainFromEnv().decimalChainId;

  const { sendCode, loginWithCode } = useLoginWithEmail({
    onComplete: () => {
      setFinishingSignIn(true);
    },
    onError: (error) => {
      setFinishingSignIn(false);
      const msg = privyAuthErrorMessage(error);
      if (msg) setAuthError(msg);
    },
  });
  const { initOAuth } = useLoginWithOAuth({
    onComplete: () => {
      setFinishingSignIn(true);
    },
    onError: (error) => {
      setFinishingSignIn(false);
      const msg = privyAuthErrorMessage(error);
      if (msg) setAuthError(msg);
    },
  });
  const { login } = useLogin({
    onComplete: ({ loginMethod }) => {
      walletFlowInFlightRef.current = false;
      setWalletFlowBusy(false);
      if (loginMethod === "siwe") {
        setWalletFlowPending(true);
        return;
      }
      setWalletFlowPending(false);
      onClose();
    },
    onError: (error) => {
      walletFlowInFlightRef.current = false;
      setWalletFlowPending(false);
      setWalletFlowBusy(false);
      const msg = privyAuthErrorMessage(error);
      if (msg) setAuthError(msg);
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setAuthError("");
      setFinishingSignIn(false);
      return;
    }
    if (authenticated && !isAuthenticated && !authLoading) {
      setFinishingSignIn(true);
    }
    if (finishingSignIn && isAuthenticated && !authLoading) {
      setFinishingSignIn(false);
      onClose();
    }
  }, [isOpen, authenticated, isAuthenticated, authLoading, finishingSignIn, onClose]);

  useEffect(() => {
    if (!isOpen || !finishingSignIn || authLoading) return;
    const timer = window.setTimeout(() => {
      if (!isAuthenticated) {
        setFinishingSignIn(false);
        setAuthError("Sign-in started but could not complete. Please try again or use wallet login.");
      }
    }, 25_000);
    return () => window.clearTimeout(timer);
  }, [isOpen, finishingSignIn, authLoading, isAuthenticated]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;
    console.info("[Auth] LoginModal opened", {
      url: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
    });
  }, [isOpen]);

  const handleWalletAuth = () => {
    if (!ready || walletFlowBusy) return;
    if (isAuthenticated) {
      linkWallet({ walletChainType: "ethereum-only" });
      return;
    }
    if (authenticated) {
      setAuthError("");
      setFinishingSignIn(true);
      return;
    }
    setWalletFlowPending(false);
    setWalletFlowBusy(true);
    setAuthError("");
    walletFlowInFlightRef.current = true;
    login({ loginMethods: ["wallet"], walletChainType: "ethereum-only" });
  };

  useEffect(() => {
    if (!isOpen || !ready || !authenticated || !walletFlowPending) return;
    if (!activeWallet?.address) return;
    if (walletFlowInFlightRef.current) return;

    walletFlowInFlightRef.current = true;
    void (async () => {
      try {
        await switchAppChainViaInjectedProvider();
        if (typeof activeWallet.switchChain === "function") {
          try {
            await activeWallet.switchChain(targetChainId);
          } catch {
            /* injected switch above is the reliable path */
          }
        }
        setWalletFlowPending(false);
        onClose();
      } catch (err) {
        console.error("[Auth] 0G chain switch after wallet login failed:", err);
        setWalletFlowPending(false);
      } finally {
        walletFlowInFlightRef.current = false;
        setWalletFlowBusy(false);
      }
    })();
  }, [isOpen, ready, authenticated, walletFlowPending, activeWallet, targetChainId, onClose]);

  const handleSendCode = async () => {
    if (!email) return;
    setLoading(true);
    setAuthError("");
    try {
      await sendCode({ email });
      setOtpSent(true);
    } catch (err) {
      const msg = privyAuthErrorMessage(err);
      if (msg) setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otpCode) return;
    setLoading(true);
    setAuthError("");
    try {
      await loginWithCode({ code: otpCode });
    } catch (err) {
      const msg = privyAuthErrorMessage(err);
      if (msg) setAuthError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
            style={{ maxHeight: "100vh" }}
          >
            <div className="relative w-full max-w-md pointer-events-auto">
              {/* Outer ambient glow */}
              <div
                className="absolute -inset-4 -z-10 rounded-[36px] opacity-60"
                style={{
                  background: "radial-gradient(circle at 50% 0%, hsl(270 82% 58% / 0.25), transparent 60%)",
                  filter: "blur(30px)",
                }}
              />

              {/* Card */}
              <div
                className="relative w-full overflow-hidden"
                style={{
                  borderRadius: "24px",
                  border: "1px solid hsl(270 80% 60% / 0.2)",
                  background: "linear-gradient(160deg, hsl(265 48% 12% / 0.98), hsl(220 45% 7% / 0.98))",
                  boxShadow:
                    "0 30px 80px hsl(220 50% 2% / 0.5), 0 0 0 1px hsl(270 80% 60% / 0.08), 0 0 60px hsl(270 82% 58% / 0.08), inset 0 1px 0 hsl(278 100% 82% / 0.08)",
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-[10%] right-[10%] h-[1px]"
                  style={{
                    background: "linear-gradient(90deg, transparent, hsl(270 80% 65% / 0.6), hsl(195 100% 65% / 0.4), transparent)",
                  }}
                />

                {/* Close button */}
                <button
                  onClick={onClose}
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
                  {/* Header */}
                  <div className="text-center mb-7">
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mx-auto mb-5 w-16 h-16 flex items-center justify-center"
                      style={{
                        borderRadius: "20px",
                        background: "linear-gradient(135deg, hsl(270 80% 20% / 0.5), hsl(220 45% 10% / 0.5))",
                        border: "1px solid hsl(270 80% 60% / 0.2)",
                        boxShadow: "0 0 30px hsl(270 82% 58% / 0.15), inset 0 1px 0 hsl(278 100% 82% / 0.1)",
                      }}
                    >
                      <Zap className="w-7 h-7" style={{ color: "hsl(278 100% 82%)", filter: "drop-shadow(0 0 8px hsl(278 100% 82% / 0.6))" }} />
                    </motion.div>

                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3" style={{ border: "1px solid hsl(270 80% 60% / 0.2)", background: "hsl(270 80% 60% / 0.06)" }}>
                      <div className="h-1.5 w-1.5 rounded-full" style={{ background: "hsl(195 100% 65%)", boxShadow: "0 0 6px hsl(195 100% 65%)" }} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.22em]" style={{ color: "hsl(210 15% 50%)" }}>
                        Secure Access
                      </span>
                    </div>

                    <h2 className="font-display text-2xl font-black tracking-tight text-foreground">
                      Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Sign in to access games, AI features & rankings.
                    </p>
                  </div>

                  {authError ? (
                    <p className="mb-4 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-100/95">
                      {authError}
                    </p>
                  ) : null}

                  {finishingSignIn ? (
                    <motion.div className="flex flex-col items-center gap-3 py-8 text-center">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan" />
                      <p className="text-sm text-muted-foreground">Finishing sign-in…</p>
                      <p className="text-xs text-muted-foreground/70">Creating wallet &amp; verifying with Kult backend</p>
                    </motion.div>
                  ) : !otpSent ? (
                    <div className="space-y-4">
                      {/* Email input */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                          className="w-full h-12 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all"
                          style={{
                            borderRadius: "14px",
                            border: "1px solid hsl(210 25% 20% / 0.6)",
                            background: "hsl(220 45% 8% / 0.6)",
                            boxShadow: "inset 0 2px 4px hsl(220 50% 4% / 0.3)",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "hsl(270 80% 60% / 0.5)";
                            e.currentTarget.style.boxShadow = "inset 0 2px 4px hsl(220 50% 4% / 0.3), 0 0 0 3px hsl(270 80% 60% / 0.1)";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "hsl(210 25% 20% / 0.6)";
                            e.currentTarget.style.boxShadow = "inset 0 2px 4px hsl(220 50% 4% / 0.3)";
                          }}
                        />
                      </div>

                      {/* Send Code button */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleSendCode}
                        disabled={loading || !email}
                        className="w-full h-12 font-display font-semibold text-sm tracking-wider btn-eye flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Mail className="w-4 h-4" />
                        {loading ? "Sending..." : "Send Code"}
                      </motion.button>

                      {/* Divider */}
                      <div className="flex items-center gap-3 py-1">
                        <div className="flex-1 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, hsl(210 25% 20% / 0.6), transparent)" }} />
                        <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">or</span>
                        <div className="flex-1 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, hsl(210 25% 20% / 0.6), transparent)" }} />
                      </div>

                      {/* Alt methods */}
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleWalletAuth}
                          disabled={loading || walletFlowBusy || !ready}
                          className="h-11 font-medium text-xs flex items-center justify-center gap-2 transition-all group"
                          style={{
                            borderRadius: "12px",
                            border: "1px solid hsl(210 25% 20% / 0.5)",
                            background: "hsl(220 45% 10% / 0.4)",
                            color: "hsl(210 20% 93%)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "hsl(270 80% 60% / 0.4)";
                            e.currentTarget.style.boxShadow = "0 0 15px hsl(270 82% 58% / 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "hsl(210 25% 20% / 0.5)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <Wallet className="w-3.5 h-3.5 text-[hsl(195_100%_65%)]" />
                          Wallet
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setAuthError("");
                            void initOAuth({ provider: "google" });
                          }}
                          className="h-11 font-medium text-xs flex items-center justify-center gap-2 transition-all"
                          style={{
                            borderRadius: "12px",
                            border: "1px solid hsl(210 25% 20% / 0.5)",
                            background: "hsl(220 45% 10% / 0.4)",
                            color: "hsl(210 20% 93%)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "hsl(270 80% 60% / 0.4)";
                            e.currentTarget.style.boxShadow = "0 0 15px hsl(270 82% 58% / 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "hsl(210 25% 20% / 0.5)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Google
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <p className="text-sm text-muted-foreground text-center">
                        Enter the code sent to <span className="text-foreground font-medium">{email}</span>
                      </p>
                      <input
                        type="text"
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                        className="w-full h-14 px-4 text-center text-foreground tracking-[0.4em] text-xl font-mono placeholder:text-muted-foreground/30 focus:outline-none transition-all"
                        style={{
                          borderRadius: "16px",
                          border: "1px solid hsl(270 80% 60% / 0.3)",
                          background: "hsl(220 45% 8% / 0.6)",
                          boxShadow: "inset 0 2px 4px hsl(220 50% 4% / 0.3), 0 0 0 3px hsl(270 80% 60% / 0.08)",
                        }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleVerifyCode}
                        disabled={loading || !otpCode}
                        className="w-full h-12 font-display font-semibold text-sm tracking-wider btn-eye flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Verifying..." : "Verify Code"}
                      </motion.button>
                      <button
                        onClick={() => setOtpSent(false)}
                        className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ← Back
                      </button>
                    </div>
                  )}

                  {/* Footer */}
                  <p className="mt-6 text-center text-[10px] text-muted-foreground/40">
                    Secured by Privy · On-chain identity
                  </p>
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
