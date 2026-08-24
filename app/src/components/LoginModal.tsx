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

const MetaMaskIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 32 32" aria-hidden>
    <path fill="#E17726" d="m29 4-11.8 8.8 2.2-5.2L29 4Z" />
    <path fill="#E27625" d="m3 4 11.7 8.9-2.1-5.3L3 4Zm21.8 20.2-3.1 4.7 6.6 1.8 1.9-6.4-5.4-.1Zm-23 .1 1.9 6.4 6.6-1.8-3.1-4.7-5.4.1Z" />
    <path fill="#E27625" d="m10 16.2-1.9 2.9 6.5.3-.2-7L10 16.2Zm12 0-4.5-3.9-.2 7 6.5-.3-1.8-2.8Zm-11.7 12.7 3.9-1.9-3.4-2.6-.5 4.5Zm7.5-1.9 3.9 1.9-.5-4.5-3.4 2.6Z" />
    <path fill="#D5BFB2" d="m21.7 28.9-3.9-1.9.3 2.5v1.1l3.6-1.7Zm-11.4 0 3.6 1.7v-1.1l.3-2.5-3.9 1.9Z" />
    <path fill="#233447" d="m14 22.7-3.3-1 .2 1.5 3.1.2v-.7Zm4 0v.7l3.1-.2.2-1.5-3.3 1Z" />
    <path fill="#CC6228" d="m10.3 28.9.5-4.7-3.6.1 3.1 4.6Zm10.9-4.7.5 4.7 3.1-4.6-3.6-.1Zm2.6-5.2-6.5.3.6 3.4.1 4.3 3.2-2.6 3.9-.1-1.3-5.3ZM6.9 24.3l3.9.1L14 27l.1-4.3.5-3.4-6.5-.3-1.2 5.3Z" />
    <path fill="#E27525" d="m8.1 19 2.7 5.4-.1-2.7L8.1 19Zm13.2 2.7-.1 2.7 2.6-5.4-2.5 2.7ZM14.6 19l-.6 3.7.8 4.1.2-5.4-.4-2.4Zm2.7 0-.4 2.4.2 5.4.8-4.1-.6-3.7Z" />
    <path fill="#F5841F" d="m17.9 22.7-.8 4.1.6.4 3.5-2.8.1-2.7-3.4 1Zm-7.2-1 .1 2.7 3.5 2.8.6-.4-.8-4.1-3.4-1Z" />
    <path fill="#C0AC9D" d="m18.1 30.6v-1.1l-.3-2.3h-3.6l-.3 2.3v1.1l-3.6-1.7 1.3 1.1 2.6 1.8h3.6l2.6-1.8 1.3-1.1-3.6 1.7Z" />
    <path fill="#763E1A" d="m17.8 27.2-.7-.4h-2.2l-.7.4-.3 2.3.3-.2h3.6l.3.2-.3-2.3Z" />
    <path fill="#F5841F" d="m29.5 13.4 1-4.8L29 4l-11.2 8.3 4.3 3.7 6.1 1.8 1.3-1.5-.6-.4 1-.9-.8-.6 1-.8-.6-.2ZM1.5 8.6l1 4.8-.6.2 1 .8-.8.6 1 .9-.6.4 1.3 1.5L9.9 16l4.3-3.7L3 4 1.5 8.6Z" />
    <path fill="#F5841F" d="m28.2 17.8-6.1-1.8 1.7 3-2.5 2.7 3.8-.1h5.6l-2.5-3.8ZM9.9 16l-6.1 1.8-2.5 3.8h5.6l3.8.1L8.1 19l1.8-3Z" />
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
    setAuthError(message ?? "Sign-in could not finish. Please try again with MetaMask, Coinbase, or OKX Wallet.");
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
                          : "If a wallet prompt appears, approve it to finish signing in."}
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
                      icon={<MetaMaskIcon />}
                      label="MetaMask"
                      onClick={() => handleWalletAuth("metamask")}
                      disabled={loading || walletFlowBusy || !ready}
                    />
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
