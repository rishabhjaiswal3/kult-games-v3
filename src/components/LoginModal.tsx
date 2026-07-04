import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, Loader2, Wallet } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import kultLogo from "@/assets/kult-logo.png";
import {
  useLogin,
  useLoginWithEmail,
  useLoginWithOAuth,
  usePrivy,
} from "@privy-io/react-auth";
import { privyAuthErrorMessage } from "@/lib/privyAuthErrors";
import { useAuth } from "@/contexts/AuthContext";
import {
  clearUserLoginIntent,
  consumePendingLoginModalRequest,
  markUserLoginIntent,
  subscribeOpenLoginModal,
} from "@/lib/loginModalBus";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const OTP_RESEND_COOLDOWN_SECONDS = 30;
const OTP_DELAY_NOTICE_SECONDS = 20;

const CARD_DOT_GRID =
  "radial-gradient(circle, rgba(0,0,0,0.045) 1px, transparent 1px)";

function otpVerifyErrorMessage(error: unknown) {
  const fallback = privyAuthErrorMessage(error);
  const lower = fallback.toLowerCase();

  if (/invalid|incorrect|wrong/.test(lower)) {
    return "That code does not look right. Check the latest email and enter the 6-digit code again.";
  }

  if (/expired|expire/.test(lower)) {
    return "That code has expired. Please request a new code and use the latest email.";
  }

  if (/too many|rate|limit/.test(lower)) {
    return "Too many attempts. Please wait a moment before trying again.";
  }

  return fallback || "Could not verify the code. Please try again or request a new one.";
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 border-t border-dashed border-gray-200" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-400">or</span>
      <div className="h-px flex-1 border-t border-dashed border-gray-200" />
    </div>
  );
}

function GradientSubmitButton({
  disabled,
  loading,
  onClick,
  label = "Continue",
}: {
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        background: "linear-gradient(135deg, #00FF94 0%, #00E0FF 100%)",
        boxShadow: "0 4px 14px rgba(0, 224, 255, 0.35)",
      }}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      )}
    </button>
  );
}

function AltLoginButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3.5 text-left transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="flex-1 text-sm font-medium text-gray-600">{label}</span>
      <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover:text-gray-400" />
    </button>
  );
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState("");
  const [otpWaitSeconds, setOtpWaitSeconds] = useState(0);
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [walletFlowBusy, setWalletFlowBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [finishingSignIn, setFinishingSignIn] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const walletFlowInFlightRef = useRef(false);
  const wasOpenRef = useRef(false);

  const resetModalState = useCallback(() => {
    walletFlowInFlightRef.current = false;
    setEmail("");
    setOtpCode("");
    setOtpSent(false);
    setOtpNotice("");
    setOtpWaitSeconds(0);
    setOtpResendCooldown(0);
    setLoading(false);
    setWalletFlowBusy(false);
    setAuthError("");
    setFinishingSignIn(false);
    setRecoveryMode(false);
  }, []);

  const applyRecoverRequest = (message?: string) => {
    walletFlowInFlightRef.current = false;
    setOtpSent(false);
    setOtpCode("");
    setOtpNotice("");
    setOtpWaitSeconds(0);
    setOtpResendCooldown(0);
    setLoading(false);
    setWalletFlowBusy(false);
    setRecoveryMode(true);
    setFinishingSignIn(false);
    setAuthError(
      message ?? "Sign-in could not finish. Please choose wallet, email, or Google to continue.",
    );
  };

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { authenticated, ready, linkWallet, logout: privyLogout } = usePrivy();

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
    onComplete: () => {
      walletFlowInFlightRef.current = false;
      setWalletFlowBusy(false);
      setRecoveryMode(false);
      setAuthError("");
      setFinishingSignIn(true);
    },
    onError: (error) => {
      walletFlowInFlightRef.current = false;
      setWalletFlowBusy(false);
      const msg = privyAuthErrorMessage(error);
      if (msg) setAuthError(msg);
    },
  });

  useEffect(() => {
    return subscribeOpenLoginModal((request) => {
      if (request?.mode === "recover") {
        applyRecoverRequest(request.message);
        return;
      }
      if (request?.mode === "finishing") {
        walletFlowInFlightRef.current = false;
        setWalletFlowBusy(false);
        setRecoveryMode(false);
        setAuthError("");
        setFinishingSignIn(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!isOpen || !otpSent || finishingSignIn) return;

    const timer = window.setInterval(() => {
      setOtpWaitSeconds((seconds) => seconds + 1);
      setOtpResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isOpen, otpSent, finishingSignIn]);

  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!isOpen) {
      const siweStillRunning = authenticated && !isAuthenticated && authLoading;
      if (!siweStillRunning) {
        resetModalState();
      }
      return;
    }

    const pendingRequest = consumePendingLoginModalRequest();
    if (pendingRequest?.mode === "recover") {
      applyRecoverRequest(pendingRequest.message);
      return;
    }
    if (pendingRequest?.mode === "finishing") {
      walletFlowInFlightRef.current = false;
      setWalletFlowBusy(false);
      setRecoveryMode(false);
      setAuthError("");
      setFinishingSignIn(true);
      return;
    }

    if (
      justOpened &&
      authenticated &&
      !isAuthenticated &&
      authLoading &&
      !recoveryMode &&
      !authError
    ) {
      setFinishingSignIn(true);
    }

    if (finishingSignIn && isAuthenticated && !authLoading) {
      resetModalState();
      onClose();
      return;
    }

    if (finishingSignIn && !authenticated && !isAuthenticated && !authLoading) {
      setFinishingSignIn(false);
    }
  }, [
    isOpen,
    authenticated,
    isAuthenticated,
    authLoading,
    finishingSignIn,
    recoveryMode,
    authError,
    onClose,
    resetModalState,
  ]);

  useEffect(() => {
    if (!isOpen || !finishingSignIn || recoveryMode) return;
    const timer = window.setTimeout(() => {
      if (!isAuthenticated) {
        setFinishingSignIn(false);
        setRecoveryMode(true);
        setAuthError(
          authLoading
            ? "Still waiting for your wallet. Check for a signature popup in your browser or wallet extension."
            : "Sign-in started but could not complete. Please try again or use Wallet login.",
        );
      }
    }, authLoading ? 50_000 : 12_000);
    return () => window.clearTimeout(timer);
  }, [isOpen, finishingSignIn, authLoading, isAuthenticated, recoveryMode]);

  const handleWalletAuth = () => {
    if (!ready || walletFlowBusy) return;
    setRecoveryMode(false);
    if (isAuthenticated) {
      linkWallet({ walletChainType: "ethereum-only" });
      return;
    }
    if (authenticated) {
      setAuthError("");
      markUserLoginIntent("wallet");
      setFinishingSignIn(true);
      return;
    }
    setWalletFlowBusy(true);
    setAuthError("");
    markUserLoginIntent("wallet");
    walletFlowInFlightRef.current = true;
    login({ loginMethods: ["wallet"], walletChainType: "ethereum-only" });
  };

  const handleSendCode = async (resend = false) => {
    if (!email) return;
    setLoading(true);
    setRecoveryMode(false);
    setAuthError("");
    setOtpNotice("");
    markUserLoginIntent("email");
    try {
      await sendCode({ email });
      setOtpCode("");
      setOtpSent(true);
      setOtpWaitSeconds(0);
      setOtpResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
      setOtpNotice(
        resend
          ? "We sent a new code. Use the newest email, because older codes may stop working."
          : "Code sent. It can take a few seconds to arrive — check spam or promotions too.",
      );
    } catch (err) {
      const msg = privyAuthErrorMessage(err);
      setAuthError(msg || "Could not send the code. Please check the email address and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otpCode) return;
    setLoading(true);
    setRecoveryMode(false);
    setAuthError("");
    setOtpNotice("");
    try {
      await loginWithCode({ code: otpCode });
    } catch (err) {
      setAuthError(otpVerifyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtpCode("");
    setOtpNotice("");
    setOtpWaitSeconds(0);
    setOtpResendCooldown(0);
    setAuthError("");
  };

  const showDelayedOtpNotice = otpSent && otpWaitSeconds >= OTP_DELAY_NOTICE_SECONDS;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#f4f4f5]/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div
              className="pointer-events-auto relative w-full max-w-[420px] overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
              style={{
                backgroundImage: CARD_DOT_GRID,
                backgroundSize: "18px 18px",
              }}
            >
              <div className="relative px-7 pb-6 pt-5">
                <button
                  type="button"
                  onClick={otpSent ? handleBackToEmail : onClose}
                  className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
                  aria-label={otpSent ? "Back to email" : "Close"}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="px-2 pb-2 pt-10 text-center">
                  <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gray-900 shadow-sm">
                    <img src={kultLogo} alt="Kult" className="h-8 w-8 object-contain" />
                  </div>

                  <h2 className="font-body text-[1.65rem] font-bold tracking-tight text-gray-900">
                    {otpSent ? "Check your email" : "Welcome to Kult"}
                  </h2>
                  <p className="mx-auto mt-2 max-w-[280px] text-sm leading-relaxed text-gray-500">
                    {otpSent
                      ? `Enter the code we sent to ${email}`
                      : "Sign in with your email or connect a Web3 wallet to get started."}
                  </p>
                </div>

                {authError ? (
                  <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                    {authError}
                  </p>
                ) : null}

                {finishingSignIn ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <div
                      className="h-11 w-11 animate-spin rounded-full border-2 border-gray-200"
                      style={{ borderTopColor: "#00E0FF" }}
                    />
                    <p className="text-sm font-medium text-gray-700">Signing you in…</p>
                    <p className="max-w-[260px] text-xs leading-relaxed text-gray-500">
                      {authLoading
                        ? "Completing wallet verification with Kult…"
                        : "If a wallet prompt appears, approve it to verify with SIWE."}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        clearUserLoginIntent();
                        setFinishingSignIn(false);
                        setRecoveryMode(false);
                        setAuthError("");
                        if (authenticated && !isAuthenticated) {
                          void privyLogout();
                        }
                      }}
                      className="mt-1 text-xs text-gray-400 underline-offset-2 transition-colors hover:text-gray-600 hover:underline"
                    >
                      Use a different method
                    </button>
                  </div>
                ) : !otpSent ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 pl-5 shadow-sm transition-all focus-within:border-gray-300 focus-within:shadow-md">
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && void handleSendCode()}
                        className="h-11 min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                      />
                      <GradientSubmitButton
                        disabled={!email}
                        loading={loading}
                        onClick={() => void handleSendCode()}
                        label="Send code"
                      />
                    </div>

                    <OrDivider />

                    <div className="space-y-2.5">
                      <AltLoginButton
                        icon={<GoogleIcon />}
                        label="Google"
                        onClick={() => {
                          setRecoveryMode(false);
                          setAuthError("");
                          markUserLoginIntent("google");
                          void initOAuth({ provider: "google" });
                        }}
                        disabled={loading}
                      />
                      <AltLoginButton
                        icon={<Wallet className="h-4 w-4 text-gray-800" strokeWidth={1.75} />}
                        label="Login with Wallet"
                        onClick={handleWalletAuth}
                        disabled={loading || walletFlowBusy || !ready}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {otpNotice ? (
                      <p className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-xs leading-relaxed text-cyan-800">
                        {otpNotice}
                      </p>
                    ) : null}
                    {showDelayedOtpNotice ? (
                      <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">
                        Still waiting? Email delivery can be delayed. Check spam/promotions, confirm
                        the email address, or send a new code below.
                      </p>
                    ) : null}

                    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 pl-5 shadow-sm transition-all focus-within:border-gray-300 focus-within:shadow-md">
                      <input
                        type="text"
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && void handleVerifyCode()}
                        className="h-11 min-w-0 flex-1 bg-transparent text-center text-lg font-mono tracking-[0.35em] text-gray-900 outline-none placeholder:text-gray-300"
                      />
                      <GradientSubmitButton
                        disabled={!otpCode}
                        loading={loading}
                        onClick={() => void handleVerifyCode()}
                        label="Verify code"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleSendCode(true)}
                      disabled={loading || otpResendCooldown > 0}
                      className="w-full rounded-full border border-gray-200 px-4 py-3 text-xs font-medium text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {otpResendCooldown > 0
                        ? `Resend code in ${otpResendCooldown}s`
                        : "Resend code"}
                    </button>
                  </div>
                )}

                <p className="mt-8 text-center text-[10px] text-gray-400">
                  © Copyright 2026 — Kult Games — All Rights Reserved
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
