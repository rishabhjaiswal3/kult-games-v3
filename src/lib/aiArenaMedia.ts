/** Lazy-loaded AI Arena media — keeps heavy mp4s out of the initial page chunk. */
export const aiArenaMedia = {
  hybrid: () => import("@/assets/hybrid.mp4"),
  defender: () => import("@/assets/defender.mp4"),
  tactician: () => import("@/assets/tactician.mp4"),
  support: () => import("@/assets/support.mp4"),
  berserker: () => import("@/assets/berserker.mp4"),
  assassin: () => import("@/assets/assassin.mp4"),
  warzone: () => import("@/assets/IMG_9260.mp4"),
  highwayHustle: () => import("@/assets/step3.mp4"),
  robowar: () => import("@/assets/step5.mp4"),
  leagueBackground: () => import("@/assets/league_background.mp4"),
  scene: () => import("@/assets/Scene 1.mp4"),
} as const;

export type AiArenaMediaKey = keyof typeof aiArenaMedia;
