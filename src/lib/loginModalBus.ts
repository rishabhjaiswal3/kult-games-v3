const LOGIN_OPEN_EVENT = "kult-open-login";

export function requestOpenLoginModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LOGIN_OPEN_EVENT));
}

export function subscribeOpenLoginModal(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(LOGIN_OPEN_EVENT, listener);
  return () => window.removeEventListener(LOGIN_OPEN_EVENT, listener);
}
