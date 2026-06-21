const LOGIN_OPEN_EVENT = "kult-open-login";

export type LoginModalOpenRequest = {
  mode?: "default" | "recover" | "finishing";
  message?: string;
};

let pendingLoginModalRequest: LoginModalOpenRequest | null = null;
/** Survives Google OAuth redirects — cleared on logout or SIWE end. */
const LOGIN_INTENT_SESSION_KEY = "kult_login_intent";
/** In-memory mirror for the current tab session. */
let userLoginIntent = false;

function readStoredLoginIntent() {
  try {
    return sessionStorage.getItem(LOGIN_INTENT_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markUserLoginIntent() {
  userLoginIntent = true;
  try {
    sessionStorage.setItem(LOGIN_INTENT_SESSION_KEY, "1");
  } catch {
    /* private mode / quota */
  }
}

export function clearUserLoginIntent() {
  userLoginIntent = false;
  try {
    sessionStorage.removeItem(LOGIN_INTENT_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function hasUserLoginIntent() {
  return userLoginIntent || readStoredLoginIntent();
}

export function requestOpenLoginModal(request?: LoginModalOpenRequest) {
  if (typeof window === "undefined") return;
  if (!request?.mode || request.mode === "default") {
    markUserLoginIntent();
  }
  pendingLoginModalRequest = request ?? null;
  window.dispatchEvent(
    new CustomEvent<LoginModalOpenRequest | undefined>(LOGIN_OPEN_EVENT, {
      detail: request,
    })
  );
}

export function consumePendingLoginModalRequest() {
  const request = pendingLoginModalRequest;
  pendingLoginModalRequest = null;
  return request;
}

export function subscribeOpenLoginModal(
  listener: (request?: LoginModalOpenRequest) => void
) {
  if (typeof window === "undefined") return () => undefined;
  const handleOpen = (event: Event) => {
    listener(
      event instanceof CustomEvent ? event.detail : undefined
    );
  };
  window.addEventListener(LOGIN_OPEN_EVENT, handleOpen);
  return () => window.removeEventListener(LOGIN_OPEN_EVENT, handleOpen);
}
