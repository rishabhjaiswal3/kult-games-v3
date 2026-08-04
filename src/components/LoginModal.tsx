import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Loader2, Mail, Wallet, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import kultLogo from "@/assets/kult-logo.png";
import {
  useLogin,
  useLoginWithEmail,
  useLoginWithOAuth,
  usePrivy,
} from "@privy-io/react-auth";
import { privyAuthErrorMessage } from "@/lib/privyAuthErrors";
import { KULT_LOGIN_LANDING_HEADER } from "@/lib/privyAppearance";
import { buildPrivyWalletList } from "@/lib/privyWalletList";
import { useAuth } from "@/contexts/AuthContext";
import {
  clearUserLoginIntent,
  consumePendingLoginModalRequest,
  getUserLoginMethod,
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

function ProtectedByPrivyFooter() {
  return (
    <div className="kult-auth-footer">
      <a
        href="https://privy.io/?utm_source=module&utm_medium=module&utm_campaign=registration_module"
        target="_blank"
        rel="noopener noreferrer"
      >
        Protected by privy
      </a>
    </div>
  );
}

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

function AuthMethodButton({
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
    <button type="button" onClick={onClick} disabled={disabled} className="kult-auth-method-btn">
      <span className="kult-auth-method-icon">{icon}</span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

function AuthEmailField({
  value,
  onChange,
  onSubmit,
  disabled,
  loading,
  placeholder = "your@email.com",
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="kult-auth-field-stack" style={{ marginTop: "10px" }}>
      <label className="kult-auth-field kult-auth-field--input-only">
        <Mail className="kult-auth-field-icon h-[18px] w-[18px]" strokeWidth={2} />
        <input
          type="email"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          disabled={disabled}
        />
      </label>
      <button
        type="button"
        className="kult-auth-submit-btn"
        onClick={onSubmit}
        disabled={disabled || loading || !value}
      >
        {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Continue"}
      </button>
    </div>
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

  const loginMethod = getUserLoginMethod();
  const isEmbeddedLoginFlow = loginMethod === "email" || loginMethod === "google";

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
    }, authLoading ? 90_000 : isEmbeddedLoginFlow ? 60_000 : 12_000);
    return () => window.clearTimeout(timer);
  }, [isOpen, finishingSignIn, authLoading, isAuthenticated, recoveryMode, isEmbeddedLoginFlow]);

  const handleWalletAuth = () => {
    if (!ready || walletFlowBusy) return;
    setRecoveryMode(false);
    if (isAuthenticated) {
      linkWallet({ walletChainType: "ethereum-only", walletList: buildPrivyWalletList() });
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
    login({
      loginMethods: ["wallet"],
      walletChainType: "ethereum-only",
      walletList: buildPrivyWalletList(),
    });
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
          : "Verification code sent. Check your inbox, if it's not there, look in spam or promotions.",
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
            className="kult-auth-backdrop fixed inset-0 z-[100]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 340 }}
            className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="kult-auth-shell pointer-events-auto">
              <div className="kult-auth-shell-glow" aria-hidden />
              <div className="kult-auth-card">
                <div className="kult-auth-card-accent" aria-hidden />

                <div className="kult-auth-toolbar">
                  <div className="w-9">
                    {otpSent ? (
                      <button
                        type="button"
                        onClick={handleBackToEmail}
                        className="kult-auth-icon-btn"
                        aria-label="Back to email"
                      >
                        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                      </button>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="kult-auth-icon-btn"
                    aria-label="close modal"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>

                <div className="kult-auth-body">
                  <header className="kult-auth-header">
                    <img src={kultLogo} alt="Kult Games" className="kult-auth-logo" />
                    {otpSent ? (
                      <p className="kult-auth-subtitle">
                        Code sent to{" "}
                        <span className="text-[var(--privy-color-foreground)]">{email}</span>
                      </p>
                    ) : (
                      <h3 className="kult-auth-subtitle">{KULT_LOGIN_LANDING_HEADER}</h3>
                    )}
                  </header>

                <div className="kult-auth-main flex flex-col">
                {authError ? (
                  <p className="kult-auth-notice kult-auth-notice--error">{authError}</p>
                ) : null}

                {finishingSignIn ? (
                  <div className="kult-auth-finishing flex flex-col items-center gap-3 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--privy-color-accent)]" />
                    <p className="text-sm font-medium text-[var(--privy-color-foreground)]">Signing you in…</p>
                    <p className="max-w-[280px] text-xs leading-relaxed text-[var(--privy-color-foreground-2)]">
                      {isEmbeddedLoginFlow
                        ? authLoading
                          ? "Creating your wallet and completing sign-in with Kult…"
                          : "Setting up your wallet, this usually takes a few seconds."
                        : authLoading
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
                      className="mt-1 text-xs text-[var(--privy-color-foreground-3)] underline-offset-2 hover:underline"
                    >
                      Use a different method
                    </button>
                  </div>
                ) : !otpSent ? (
                  <div className="kult-auth-stack kult-auth-stack--landing">
                    <AuthEmailField
                      value={email}
                      onChange={setEmail}
                      onSubmit={() => void handleSendCode()}
                      disabled={loading}
                      loading={loading}
                    />
                    <div className="kult-auth-divider" aria-hidden="true">
                      <span>or</span>
                    </div>
                    <AuthMethodButton
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
                    <AuthMethodButton
                      icon={<Wallet className="h-[18px] w-[18px]" strokeWidth={1.75} />}
                      label="Continue with a wallet"
                      onClick={handleWalletAuth}
                      disabled={loading || walletFlowBusy || !ready}
                    />
                  </div>
                ) : (
                  <div className="kult-auth-stack kult-auth-stack--landing">
                    {otpNotice ? <p className="kult-auth-notice">{otpNotice}</p> : null}
                    <label className="kult-auth-field">
                      <input
                        type="text"
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && void handleVerifyCode()}
                        className="!pl-5 !text-center !text-lg !tracking-[0.35em]"
                        style={{ fontFamily: "ui-monospace, monospace" }}
                      />
                      <button
                        type="button"
                        className="kult-auth-field-submit"
                        onClick={() => void handleVerifyCode()}
                        disabled={loading || !otpCode}
                      >
                        {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Continue"}
                      </button>
                    </label>

                    <button
                      type="button"
                      onClick={() => void handleSendCode(true)}
                      disabled={loading || otpResendCooldown > 0}
                      className="kult-auth-method-btn justify-center disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {otpResendCooldown > 0
                        ? `Resend code in ${otpResendCooldown}s`
                        : "Resend code"}
                    </button>
                  </div>
                )}

                </div>
                </div>

                {/* <ProtectedByPrivyFooter /> */}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
