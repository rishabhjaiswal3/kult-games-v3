import { Suspense, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { subscribeOpenLoginModal, markUserLoginIntent } from "@/lib/loginModalBus";

const LoginModal = lazyWithRetry(() => import("@/components/LoginModal"));

export function LoginModalHost() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("login") !== "1" || isAuthenticated) return;

    markUserLoginIntent();
    setLoginOpen(true);
    params.delete("login");
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true }
    );
  }, [location.pathname, location.search, isAuthenticated, navigate]);

  useEffect(() => subscribeOpenLoginModal(() => setLoginOpen(true)), []);

  return (
    <Suspense fallback={null}>
      {loginOpen ? <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} /> : null}
    </Suspense>
  );
}
