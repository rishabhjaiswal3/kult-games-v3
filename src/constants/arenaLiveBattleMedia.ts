import step1Video from "@/assets/step1.mp4";
import step2Video from "@/assets/step2.mp4";
import step3Video from "@/assets/step3.mp4";
import step4Video from "@/assets/step4.mp4";
import step5Video from "@/assets/step5.mp4";

export type ArenaBattleMediaItem = {
  kind: "video" | "image";
  src: string;
};

export const ARENA_LIVE_FEED_MEDIA: ArenaBattleMediaItem = {
  kind: "video",
  src: step1Video,
};

export const ARENA_LIVE_BATTLE_MEDIA: ArenaBattleMediaItem[] = [
  { kind: "video", src: step2Video },
  { kind: "video", src: step3Video },
  { kind: "video", src: step4Video },
  { kind: "video", src: step5Video },
];

export function pickArenaBattleMedia(index: number): ArenaBattleMediaItem {
  return ARENA_LIVE_BATTLE_MEDIA[index % ARENA_LIVE_BATTLE_MEDIA.length];
}
