# AI Arena — Codebase Context

## What this doc is

A map of how the AI Arena feature works end-to-end, written so that adding a new game (Highway Hustle) to the arena has a clear reference to follow. Covers matchmaking → routing → Unity WebGL embed → result handling.

---

## 1. Constants & game IDs

`src/constants/aiArenaMatchmaking.ts`

```ts
export const AI_ARENA_GAME_IDS = [
  { value: "warzone",        label: "Warzone" },
  { value: "robowar",        label: "Robowar" },
  { value: "highway-hustle", label: "Highway Hustle" },
] as const;
```

`highway-hustle` is already declared. Nothing else references it yet — the routing and page don't exist.

---

## 2. Routing (App.tsx)

```
/ai-arena                     → AIArenaPage          (hub, matchmaking entry)
/arena/game/:battleId         → ArenaGamePage        (Warzone Unity WebGL)
/arena/robowar/:battleId      → RobowarGamePage      (90-s simulation, no Unity)
```

Highway Hustle needs a new route: `/arena/highway-hustle/:battleId`.

---

## 3. Matchmaking flow

### Entry — AIArenaPage.tsx
- User picks game via the game card grid (line ~975 area). Each card calls `startMatchmaking(game.gameId)`.
- `startMatchmaking` stores the gameId in `selectedGameIdRef` and `sessionStorage["arena_queued_game_id"]`, then opens `ArenaStartMatchmakingModal`.
- `ArenaStartMatchmakingModal` calls `POST /v1/matchmaking` with `{ agentId, gameId, mode, eloRange }`.

### Polling — ArenaMatchStatusModal.tsx
- Polls `GET /v1/matchmaking/status/:agentId` every 2 s.
- When `status.matchId` is non-null, fetches `GET /v1/battles/:battleId` to get opponent.
- Fires `onMatchFound({ agent, opponent, battleId, mode, gameId })` once.

### Navigation — AIArenaPage.tsx `handleMatchFound` (line ~333)
```ts
if (gameId === "robowar") {
  navigate(`/arena/robowar/${payload.battleId}?${base}`);
} else {
  navigate(`/arena/game/${payload.battleId}?${base}`);   // Warzone + everything else
}
```
**This is the only place that needs a new branch for `highway-hustle`.**

Query string passed: `myAgentId=...&opponentId=...&mode=...`

---

## 4. Warzone game page — ArenaGamePage.tsx

### What it does
1. Reads `battleId` from URL params; `myAgentId`, `opponentId`, `mode` from search params.
2. Fetches agent data via React Query.
3. **Writes `localStorage["arenaBattlePayload"]`** once agents are loaded:
   ```json
   { "battleId": "...", "myAgentId": "...", "myAgentName": "...",
     "myAgentArchetype": "...", "myAgentElo": 1200, "myAgentClan": "...",
     "opponentId": "...", "opponentName": "...", "opponentArchetype": "...",
     "opponentElo": 1100, "opponentClan": "...", "mode": "RANKED" }
   ```
4. Injects `<script src="${UNITY_BASE_URL}/Arena1/WarzoneV4.loader.js">` dynamically.
5. Calls `window.createUnityInstance(canvas, { dataUrl, frameworkUrl, codeUrl, ... }, progressCb)`.
6. After 1.5 s delay: `instance.SendMessage("GameManager", "SetBattleId", battleId)`.
7. Listens for `window.CustomEvent("arenaBattleEnd")` fired by Unity when match ends.
8. On event: shows result overlay, calls `POST /v1/battles/:id/end`, runs trait evolution, training, 0G commentary, 0G memory storage.
9. On unmount: `unityInstance.Quit()` + `localStorage.removeItem("arenaBattlePayload")`.

### Env var
```
VITE_UNITY_BUILD_URL=https://pub-xxx.r2.dev/v4/WarzoneV4
```
Build files expected at `${VITE_UNITY_BUILD_URL}/Arena1/WarzoneV4.{loader.js,data,framework.js,wasm}`.

### Result event payload (from Unity → React)
```ts
type UnityBattleResult = {
  battleId: string;
  myAgentWon: boolean;
  winnerId: string;  winnerName: string;  winnerArchetype: string;
  winnerClan: string;  winnerElo: number;  winnerHpPercent: number;
  loserId: string;   loserName: string;   loserArchetype: string;
  loserClan: string;   loserElo: number;   loserHpPercent: number;
  durationSeconds: number;  endReason: string;
  playerStats?: { [agentId: string]: { jumps, shotsAttempted, shotsConnected, timesHit, distanceCovered } };
};
```

### Pre-match overlay
Unity fires `window.CustomEvent("arenaMultiplayerStart", { detail: { mapId, myAgentName, opponentName } })`.
React shows a countdown overlay covering Unity for 10–17 s while agents walk to centre.

---

## 5. Highway Hustle differences vs Warzone

| Aspect | Warzone | Highway Hustle |
|---|---|---|
| localStorage key | `arenaBattlePayload` | `hrDuelPayload` |
| localStorage shape | battleId + archetype + clan + elo per agent | battleId + carAId/Name/Elo + carBId/Name/Elo + mode |
| Unity loader path | `${URL}/Arena1/WarzoneV4.loader.js` | `${VITE_HIGHWAY_HUSTLE_BUILD_URL}/HighwayHustle.loader.js` |
| Unity result event | `arenaBattleEnd` | `hrDuelEnd` |
| Result payload | HP%, archetype, clan, duration, playerStats | winnerId/Name, loserId/Name, winnerDistance, loserDistance |
| Pre-match overlay | Yes (`arenaMultiplayerStart`) | No |
| Result UI | Victory/Defeat, HP bars, commentary | WINNER / CRASHED, distance traveled |
| Post-result API calls | endBattle + evolveTraits + train + commentary + memory | endBattle + evolveTraits (distance-based) |
| Route | `/arena/game/:battleId` | `/arena/highway-hustle/:battleId` |
| Env var | `VITE_UNITY_BUILD_URL` | `VITE_HIGHWAY_HUSTLE_BUILD_URL` |

---

## 6. Post-battle API calls

All via `src/api/aiArenaGatewayApi.ts`:

| Call | Endpoint | When |
|---|---|---|
| `endBattle` | `POST /v1/battles/:id/end` | Immediately on result event — submits `{ winnerId, loserId, playerStats }` |
| `evolveAgentTraits` | `POST /v1/agents/:id/evolve-traits` | Fire-and-forget after endBattle |
| `triggerTrainingFromBattle` | `POST /v1/agents/:id/train` | Fire-and-forget after endBattle |
| `generateBattleCommentary` | `POST /v1/inference/battle-commentary` | After endBattle — 0G Compute |
| `storeBattleMemory` | `POST /v1/memory/:id/memory/episode` | After commentary — 0G Storage |

For Highway Hustle: `endBattle` is required. `evolveTraits` should still run (use `distanceCovered` as the main stat). Commentary + memory are optional/later.

---

## 7. Key file map

```
src/
  constants/aiArenaMatchmaking.ts      game IDs, modes
  pages/
    AIArenaPage.tsx                    hub: matchmaking entry, handleMatchFound navigation
    ArenaGamePage.tsx                  Warzone Unity WebGL page (full pattern to copy)
    RobowarGamePage.tsx                simpler reference — no Unity, just simulation
  components/arena/
    ArenaMatchStatusModal.tsx          polling, fires onMatchFound with gameId
    ArenaStartMatchmakingModal.tsx     POST /v1/matchmaking
  api/aiArenaGatewayApi.ts             all API calls
  App.tsx                              routes
```

---

## 8. Unity build files needed for Highway Hustle

Upload to R2 (or any CDN). Expected filenames from Unity's WebGL build output:
```
HighwayHustle.loader.js
HighwayHustle.data          (or .data.gz / .data.br)
HighwayHustle.framework.js
HighwayHustle.wasm          (or .wasm.gz / .wasm.br)
```

Set in `.env`:
```
VITE_HIGHWAY_HUSTLE_BUILD_URL=https://pub-xxx.r2.dev/v1/HighwayHustle
```
