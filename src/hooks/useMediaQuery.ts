import { useEffect, useState } from "react";

export function useMediaQuery(query: string, defaultValue = false) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return defaultValue;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Tailwind `sm` breakpoint — render desktop layout at 640px and above. */
export function useIsDesktopLayout() {
  return useMediaQuery("(min-width: 640px)");
}
