import action1Video from "@/assets/action1.mp4";
import action2Video from "@/assets/action2.mp4";
import action3Video from "@/assets/action3.mp4";
import action4Video from "@/assets/action4.mp4";

export type ArenaBattleMediaItem = {
  kind: "video" | "image";
  src: string;
};

export const ARENA_LIVE_ACTION_VIDEOS = [
  action1Video,
  action2Video,
  action3Video,
  action4Video,
] as const;

export const ARENA_LIVE_BATTLE_MEDIA: ArenaBattleMediaItem[] = ARENA_LIVE_ACTION_VIDEOS.map((src) => ({
  kind: "video",
  src,
}));

export const ARENA_LIVE_FEED_MEDIA: ArenaBattleMediaItem = ARENA_LIVE_BATTLE_MEDIA[0];

export function pickArenaBattleMedia(index: number): ArenaBattleMediaItem {
  return ARENA_LIVE_BATTLE_MEDIA[index % ARENA_LIVE_BATTLE_MEDIA.length];
}
