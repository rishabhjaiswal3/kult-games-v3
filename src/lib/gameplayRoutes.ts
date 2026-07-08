/** True when the user is in an active full-screen game session. */
export function isGameplayRoute(pathname: string): boolean {
  return (
    /^\/arena\/game\//.test(pathname) ||
    /^\/arena\/robowar\//.test(pathname) ||
    /^\/arena\/highway-hustle\//.test(pathname) ||
    /^\/game\/[^/]+\/play$/.test(pathname)
  );
}
