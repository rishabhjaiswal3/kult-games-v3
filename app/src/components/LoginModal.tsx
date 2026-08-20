import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { privyAuthErrorMessage } from "@/lib/privyAuthErrors";
import { KULT_LOGIN_LANDING_HEADER } from "@/lib/privyAppearance";
import { type PrivyNamedA2AWalletId } from "@/lib/privyWalletList";
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

const CoinbaseIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 32 32" aria-hidden>
    <circle cx="16" cy="16" r="16" fill="#0052FF" />
    <path
      fill="#fff"
      d="M16 8.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm-2.6 5.9c0-.33.27-.6.6-.6h4c.33 0 .6.27.6.6v3.2c0 .33-.27.6-.6.6h-4a.6.6 0 0 1-.6-.6v-3.2Z"
    />
  </svg>
);

const OkxIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 32 32" aria-hidden>
    <rect width="32" height="32" rx="7" fill="#000" />
    <rect x="6" y="6" width="7" height="7" fill="#fff" />
    <rect x="19.5" y="6" width="7" height="7" fill="#fff" />
    <rect x="12.75" y="12.5" width="7" height="7" fill="#fff" />
    <rect x="6" y="19" width="7" height="7" fill="#fff" />
    <rect x="19.5" y="19" width="7" height="7" fill="#fff" />
  </svg>
);

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

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [loading, setLoading] = useState(false);
  const [walletFlowBusy, setWalletFlowBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [finishingSignIn, setFinishingSignIn] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const walletFlowInFlightRef = useRef(false);
  const wasOpenRef = useRef(false);

  const resetModalState = useCallback(() => {
    walletFlowInFlightRef.current = false;
    setLoading(false);
    setWalletFlowBusy(false);
    setAuthError("");
    setFinishingSignIn(false);
    setRecoveryMode(false);
  }, []);

  const applyRecoverRequest = (message?: string) => {
    walletFlowInFlightRef.current = false;
    setLoading(false);
    setWalletFlowBusy(false);
    setRecoveryMode(true);
    setFinishingSignIn(false);
    setAuthError(message ?? "Sign-in could not finish. Please try again with Coinbase or OKX wallet.");
  };

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { authenticated, ready, linkWallet, logout: privyLogout } = usePrivy();

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
            : "Sign-in started but could not complete. Please try again.",
        );
      }
    }, authLoading ? 90_000 : 12_000);
    return () => window.clearTimeout(timer);
  }, [isOpen, finishingSignIn, authLoading, isAuthenticated, recoveryMode]);

  const handleWalletAuth = (walletId: PrivyNamedA2AWalletId) => {
    if (!ready || walletFlowBusy) return;
    setRecoveryMode(false);
    if (isAuthenticated) {
      linkWallet({ walletChainType: "ethereum-only", walletList: [walletId] });
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
      walletList: [walletId],
    });
  };

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
                  <div className="w-9" />
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
                    <h3 className="kult-auth-subtitle">{KULT_LOGIN_LANDING_HEADER}</h3>
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
                        ? "Setting up your wallet, this usually takes a few seconds."
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
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="kult-auth-stack kult-auth-stack--landing">
                    <AuthMethodButton
                      icon={<CoinbaseIcon />}
                      label="Coinbase Wallet"
                      onClick={() => handleWalletAuth("coinbase_wallet")}
                      disabled={loading || walletFlowBusy || !ready}
                    />
                    <AuthMethodButton
                      icon={<OkxIcon />}
                      label="OKX Wallet"
                      onClick={() => handleWalletAuth("okx_wallet")}
                      disabled={loading || walletFlowBusy || !ready}
                    />
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
