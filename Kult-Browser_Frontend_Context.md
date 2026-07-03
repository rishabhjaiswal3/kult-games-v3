# Kult Games v3 — Frontend Context

Working reference for the frontend at `C:\Users\RENTKAR\Desktop\0g-ai\kult-browser\kult-games-v3`.
This is the actual consumer-facing site live at `kult-browser-rust-l2lwg.ondigitalocean.app` — the
one with Home/AI Arena/League/Games/Moments/Inventory/Achievements/Leaderboard navigation. Written
from a full read of the repo's own notes (`README.md`, `context_aiarena.md`, `memory.md`,
`todo.md`) plus direct code verification (routing, API clients, contexts, and a representative
slice of pages/components — not assumptions from the UI alone). Companion doc: `0G-AIARENA_Context.md`
in the sibling `0g-AIArena` repo, one of this app's two backends.

---

## What this app is

A Vite + React 18 + TypeScript SPA — "one browser for every game world." Presented by Kult Games,
powered by 0G. Gated behind an invite-code access system layered on top of Privy wallet auth.
Composes two largely independent product surfaces:

1. **Kult Browser proper** — games catalog, moments (social clips), marketplace/inventory,
   player profile/KP points, a football-prediction "League" (World Cup 2026 themed), Polymarket
   integration. Backed by its own Rust backend (not in this checkout).
2. **AI Arena bridge** — agent creation/management, matchmaking, live Unity WebGL battles,
   training, autonomous agents, wallet/x402 payments. Talks directly to the separate `0g-AIArena`
   Node.js gateway.

## Stack (confirmed from `package.json`)

| | |
|---|---|
| Framework | React 18.3 + Vite 5.4 (not Next.js) + TypeScript 5.8 |
| Routing | react-router-dom 6.30 |
| Server state | TanStack React Query 5.83 (no Redux/Zustand — Context API for client state) |
| Wallet/auth | `@privy-io/react-auth` 3.18, viem 2.47 (SIWE flow, not raw wagmi) |
| UI | Tailwind 3.4 + shadcn/ui (Radix primitives) + framer-motion + GSAP (loading screen) |
| Onboarding tour | `driver.js` 1.5 |
| HTTP | axios (two separate instances, see API layer below) |
| Forms | react-hook-form + zod |
| Charts | recharts |
| Testing | Vitest + Testing Library (present, not verified for coverage) |
| Deployment | `Dockerfile` + `vercel.json` present — check which is actually used; `scripts/production-server.mjs` for the `npm start` path |

## Dual-backend architecture — the most important thing to understand

`src/lib/serviceUrls.ts` defines two base URLs, and `src/lib/apiClientFactory.ts` builds a separate
cached axios instance per backend (`getApiClient("main")` / `getApiClient("aiArenaGateway")`):

```
MAIN_BACKEND        = `${VITE_API_URL ?? "https://kult-browser-rust-l2lwg.ondigitalocean.app"}/api`
AI_ARENA_GATEWAY_URL = VITE_AI_ARENA_GATEWAY_URL ?? "https://aiarena-gateway.onrender.com"
```

- **`MAIN_BACKEND`** — the Kult Rust backend (not in this checkout, no source access). Serves
  games, moments, marketplace/inventory, player profile/login, KP leaderboard, comments, player
  titles, the `/studio/` creator tool, and access-code verification.
- **`AI_ARENA_GATEWAY_URL`** — the `0g-AIArena` monorepo's `api-gateway` service (full source
  available, see companion doc). Serves everything agent/battle/matchmaking/training/wallet.

The auth interceptor (`attachAuthHeader` in `apiClientFactory.ts`) branches on which `baseURL` a
request is going to: main-backend requests get `Authorization: Bearer <TOKEN_KEY>` +
`X-Kult-Access-Token` (the invite-code session token); AI-Arena-gateway requests get a completely
separate JWT (`getAiArenaAccessToken()`), with its own 401→refresh interceptor
(`attachAiArenaRefreshOn401`).

**Third-party APIs called directly (no Kult backend involved at all)**:
- `footballNewsApi.ts` → `api.rss2json.com` wrapping BBC Sport + Sky Sports RSS
- `polymarketApi.ts` → `gamma-api.polymarket.com` + `clob.polymarket.com`, client-side filtered to football
- `worldCupApi.ts` → `worldcup26.ir/get` (groups/games/teams, with fallback path guessing since the API shape isn't fully known)
- `highwayHustleApi.ts` → `highway-hustle-backend.onrender.com` (a **third** backend, specific to the Highway Hustle mini-game's garage/ownership system)

**x402 auto-pay is fully wired client-side** (`apiClientFactory.ts:89-146`): on a `402` from the
AI Arena gateway, the interceptor reads `payment.amount`/`payment.action`, POSTs
`/v1/financial/escrow/x402/pay` with the stored agent ID, then retries the original request once
with `X-Payment-Tx-Hash` + `X-Payment-Agent-Id` headers. This matches the backend's x402 design in
`0G-AIARENA_Context.md` exactly.

## Access gating & auth (two separate, layered systems)

1. **`AccessContext`** (`src/contexts/AccessContext.tsx`) — invite-code gate, checked *before*
   anything else renders (`App.tsx`'s `BrowserApp`: `if (!hasAccess) return <AccessLoginPage/>`).
   Session = `{ tier, label, features[], accessToken, expiresAt }`, verified via
   `accessCodeApi.verify(code)` → `POST /api/access-code/verify` on the main backend, stored in
   localStorage. `canUse(feature)` gates individual nav items/routes — features seen:
   `ai_arena`, `league`, `games`, `moments`, `full_browser` (inventory), `creator_studio`
   (Studio button).
2. **`AuthContext`** (`src/contexts/AuthContext.tsx`, 369 lines) — wallet/player identity, layered
   *inside* the access gate. Full SIWE flow: Privy login (wallet/email/Google) → fetch nonce →
   build SIWE message → sign (45s timeout) → `playerApi.login()` exchanges signature for a Kult
   JWT → separately exchanges the Privy access token for an AI-Arena JWT
   (`tryExchangePrivyTokenForAiArenaToken`). Handles embedded-vs-external wallet preference,
   chain-switching to the allowed chain, and de-dupes concurrent SIWE attempts per address
   (guards against React Strict Mode double-invoke). **No dev-login path exists in this frontend**
   — wallet/email/Google only.

`AccessRoute` (`src/components/AccessRoute.tsx`) wraps almost every route in `App.tsx` and
redirects to the first permitted path if the current one isn't in the session's `features`.

## Routing (`src/App.tsx`, read in full)

All routes lazy-loaded via `lazyWithRetry` (retries a failed chunk load once — handles stale
deployed-bundle-hash 404s after a redeploy). Two route groups:

**Inside `AppShell`** (sidebar layout): `/` (Index/HomePage), `/dashboard`, `/games`,
`/my-agents`, `/training`, `/battles`, `/inventory`, `/marketplace` → **redirects to
`/inventory`** (`<Navigate to="/inventory" replace/>` — marketplace and inventory are the same
page), `/leaderboard`, `/league`, `/ai-arena`, `/moments`, `/moments/browse`, `/moments/:id`,
`/autonomous`, `/achievements`, `/game/:id`, `/game/:id/play`.

**Outside `AppShell`** (full-screen, no sidebar — live battle pages): `/arena/game/:battleId`
(Warzone), `/arena/robowar/:battleId`, `/arena/highway-hustle/:battleId`.

A splash `LoadingScreen` (GSAP-animated, "Initializing 0G Sync") gates first paint, remembered via
`sessionStorage["kult_splash_seen"]`. `KultAIFloating` (the floating chat widget) and
`LoginModalHost` mount globally, outside the route tree.

## AI Arena bridge — matchmaking → Unity WebGL flow (already documented in `context_aiarena.md`, summarized here)

```
AIArenaPage (hub) → user picks game → ArenaStartMatchmakingModal → POST /v1/matchmaking
    → ArenaMatchStatusModal polls GET /v1/matchmaking/status/:agentId every 2s
    → matchId appears → GET /v1/battles/:battleId for opponent
    → navigate to /arena/game/:battleId (Warzone/default), /arena/robowar/:battleId, or
      /arena/highway-hustle/:battleId (branch lives in AIArenaPage's handleMatchFound)
```

Each battle page (`ArenaGamePage.tsx`, `RobowarGamePage.tsx`, `HighwayHustleGamePage.tsx`) follows
an identical pattern: write a localStorage payload (`arenaBattlePayload` / `robowarPayload` /
`hrDuelPayload`) → dynamically inject the Unity WebGL loader script from
`${VITE_UNITY_BUILD_URL}` (or the Highway-specific env var) → `createUnityInstance()` → after a
short delay, `SendMessage("GameManager", "SetBattleId", battleId)` → listen for a
game-specific `window.CustomEvent` (`arenaBattleEnd` / `robowarDuelEnd` / `hrDuelEnd`) → on
result: `POST /v1/battles/:id/end`, fire-and-forget `evolve-traits` + `train`, then (Warzone only)
0G Compute battle commentary + memory-episode storage. Robowar has no Unity — it's a 120s
client-side simulation. Full per-game env vars, payload shapes, and result event schemas are in
`context_aiarena.md` in this repo — that doc is accurate and was written specifically to onboard
the Highway Hustle integration; don't re-derive it, just read it.

## Page inventory (`src/pages/`, 21 files)

| Page | Purpose | Backend(s) called |
|---|---|---|
| `Index.tsx` | Thin wrapper → `HomePage` + `Footer` | — |
| `AccessLoginPage.tsx` | Invite-code entry gate, animated video bg | main (`accessCodeApi`) |
| `Dashboard.tsx` | Authenticated home: agent panel, traits, quests, balance, autonomous panel | main (`playerApi.getFullProfile`) + AI Arena (agents) |
| `Games.tsx` | Game discovery grid, featured carousel, filters | main (`gamesApi`) |
| `GameDetail.tsx` | Single game page, gallery, facts, related links | main (`gamesApi`) |
| `GamePlay.tsx` | Full-screen iframe embed / download redirect | main (`gamesApi`) |
| `Inventory.tsx` | **This is the marketplace UI** (`/marketplace` redirects here) — buy/sell items, Privy purchase dialog | main (`marketplaceApi`, `gamesApi`) |
| `Leaderboard.tsx` | Dual-mode: KULT_POINTS tab vs AI_ARENA tab, each with GLOBAL/MY_RANK, podium + table | **both** — see leaderboard section below |
| `LeaguePage.tsx` | World Cup prediction league, mode toggle League/Polymarket; thin container, all data-fetching in children | mixed — see League section below |
| `AllMomentsPage.tsx` | Moments feed, infinite scroll, tabs (Discover/Mine/Bookmarks/Recently Watched) | main (`momentsApi`) |
| `MomentDetailPage.tsx` | Single moment player + engagement + thread | main (`momentsApi`) |
| `MyAgentsPage.tsx` | Agent roster CRUD, per-agent wallet manager, battle history | AI Arena gateway |
| `AIArenaPage.tsx` | AI Arena hub/landing: matchmaking entry, top agents, how-it-works | AI Arena gateway |
| `AutonomousPage.tsx` | Autonomous-loop dashboard, per-agent toggle, live log terminal | AI Arena gateway |
| `TrainingPage.tsx` | Training program selection, active/history jobs, eligibility | AI Arena gateway |
| `BattlesPage.tsx` | Battle hub: live board, queue status, history, WebSocket detail panel, dispute form | AI Arena gateway |
| `ArenaGamePage.tsx` | Warzone Unity WebGL battle (full-screen) | AI Arena gateway + Unity |
| `RobowarGamePage.tsx` | Robowar 120s simulation battle (full-screen, red theme, no Unity) | AI Arena gateway |
| `HighwayHustleGamePage.tsx` | Highway Hustle race duel (full-screen, mirrors ArenaGamePage) | AI Arena gateway + Unity |
| `AchievementsPage.tsx` | Achievement grid, rarity donut chart, milestones | AI Arena gateway |
| `NotFound.tsx` | 404 | — |

`MyAgentsPage` (roster management: list/retire/wallet) is distinct from `AIArenaPage` (matchmaking
entry hub) — they're two different views into the same agent data, not overlapping features.

## Leaderboard architecture — three separate ranking surfaces, easy to conflate

This matters because a live bug was observed during QA (a podium showing agent "Hybrid" ranked #1
with fewer points than agent "Assassin" ranked #2) — here's exactly where each number on screen
actually comes from:

### 1. `/leaderboard` page (`src/pages/Leaderboard.tsx`, 589 lines) — where the observed bug lives

Two independent tabs, each with its own query and its own podium:

- **KULT POINTS tab**: `leaderboardApi.getGlobal(page, 10, period)` →
  `GET /leaderboard/global` on **MAIN_BACKEND** (the Rust backend, not in this checkout).
- **AI ARENA tab**: `useEnrichedArenaLeaderboard()` → `aiArenaGatewayApi.getGlobalLeaderboard()` →
  `GET /v1/leaderboards/global` on the **AI Arena gateway** (real source in `0G-AIArena` repo,
  `services/leaderboard-service`).

**Podium rendering is verified correct**, both tabs, same pattern
(`Leaderboard.tsx:71` for KULT, `:150-152` for AI Arena; rendered by
`src/components/leaderboard/LeaderboardPodium.tsx:146-148`): the top-3 array is reordered to
`[2nd, 1st, 3rd]` purely so 1st place lands in the visually-tallest **center** slot — a standard
podium layout, not a bug. Each entry's `rank` field is copied straight from the API response with
no client-side re-sorting (`leaderboardUtils.ts:52` for KULT, `:114` for AI Arena) — the frontend
does not compute or re-derive rank at all, in either tab.

**Conclusion**: the mismatch (higher score ranked lower) has to originate upstream, in whichever
backend fed that specific tab — the frontend just displays what `entry.rank` says. If it was the
KULT POINTS tab, the bug is in the Rust `MAIN_BACKEND`'s `/leaderboard/global` (not accessible
from either of these two checked-out repos — would need that third repo to fix). If it was the AI
ARENA tab, check `0G-AIArena`'s `services/leaderboard-service` — that service was recently patched
per git history ("eliminate N+1", "make Redis fully optional, fallback to Postgres") and sorts by
`Agent.eloRating`, so a stale-Redis-vs-Postgres divergence there is a plausible root cause worth
checking first.

### 2. League page's "Top Agents" panel — a *different*, currently-static component

`src/components/league/LeagueTopAgentsPanel.tsx` renders `TOP_LEAGUE_ROWS`, a **hardcoded array
literal in `src/components/league/leagueData.ts:276-281`** — not an API call at all:

```ts
export const TOP_LEAGUE_ROWS = [
  { rank: 1, agentName: "HYBRID",     reputation: 4820, record: "18-2", streak: 6 },
  { rank: 2, agentName: "TACTICIAN",  reputation: 4650, record: "16-4", streak: 4 },
  { rank: 3, agentName: "DEFENDER",   reputation: 4410, record: "15-5", streak: 3 },
];
```

This list is internally consistent (rank does match descending reputation) and does **not**
contain an "Assassin" row, so this specific panel is not where the observed bug is — but it
confirms the League page is still substantially running on **mock data** (`YOUR_LINEUP`,
`LEAGUE_MOMENTS`, and likely more in the same file are the same pattern). This lines up exactly
with `0G-AIArena`'s own League design doc, which explicitly plans for "the frontend can stay on
`leagueData.ts` mocks behind a feature flag until Phase 1 endpoints are stable, then cut over
incrementally per-component" — i.e. this is a known, expected interim state, not a surprise bug.
**When the League page's live cutover happens, `leagueData.ts`'s static arrays are the first place
to look** for what still needs wiring to `0G-AIArena`'s real `/v1/league/*` endpoints.

### 3. `LeagueYourLineup`, `LeagueRecentPicks`, `LeagueMomentsTicker`, etc.

Same static-mock pattern as #2 (all pull from `leagueData.ts` constants) unless a specific
component was verified otherwise — treat the whole League page as "UI is real, most data is still
mock" until proven live per-component.

## League page component set (`src/components/league/`, 23 files)

Football/World-Cup-2026-themed prediction UI. Two modes toggled in `LeaguePage.tsx`: **League**
(`KultLeagueBoard`, KP-based) vs **Polymarket** (`LeaguePolymarketBoard`, real odds from
`polymarketApi.ts`). Key pieces: `LeagueFeaturedBanner`, `LeagueTopAgentsPanel` (mock, see above),
`LeagueYourLineup` (mock), `LeagueFightCarousel`/`LeagueUpcomingCarousel`/`LeagueRecentPicks`
(carousels), `LeagueRivalries`, `LeagueMomentsTicker`, `LeagueTrashTalkPanel`,
`LeagueQuestionsCarousel`, `LeagueStatsSidebar`, `LeagueWinRatePanel`. Styling helpers:
`leagueFifaStyles.ts`, `FlagHex.tsx` (hex-shaped country flags), `LeagueStadiumBackground.tsx`.

**Known frontend↔backend copy mismatches** flagged in `0G-AIArena`'s design doc (§18.1), not yet
fixed here:
- `LeaguePage.tsx` footer claims picks lock "15 minutes before kickoff"; the backend's
  implemented default is a true kickoff-lock (`lockBufferMinutes: 0`).
- `LeagueFightCarousel.tsx` subtitle says agents "stake KP head-to-head"; the implemented Battle
  staking economy uses **$ARENA**, not KP — this looks like pre-economy-finalization placeholder
  copy that was never updated.

## Studio button

Sidebar has a "Studio" button (gated behind the `creator_studio` access feature) linking externally
to `https://kult-browser-rust-l2lwg.ondigitalocean.app/studio/` — a separate tool hosted at a
path on the main backend's domain, not part of this SPA's route tree. Not explored further (no
source in this checkout).

## Onboarding tour

`src/tour/TourProvider.tsx` (190 lines), built on **driver.js 1.5**. Auto-starts ~1.2s after route
load unless already dismissed (`localStorage["kult_tour_state_v2"]`). Steps are path-specific
(`getWebsiteTourSteps()`), filtered down to only DOM elements actually present on the current page
(`resolveAvailableSteps`). Dark overlay (`#03070d`, 82% opacity), custom popover class
`kult-driver-popover`, "{{current}} / {{total}}" progress text. Resettable via the "Tour" button in
`DashboardTopbar`. This matches what was observed live: an 11-step walkthrough that correctly
highlights each sidebar nav item in turn.

## Floating AI chat widget (`KultAIFloating`)

Bottom-right widget on every page. `useKultAIChat.ts` hook streams a reply from
`VITE_KULT_AI_API_URL` (defaults to `${VITE_API_URL}/assistant/v1/chat` if unset) — a **fourth**
backend surface, separate from both `MAIN_BACKEND` and the AI Arena gateway, described in
`.env.example` as "the Python inference service." Builds a "catalog-grounded prompt"
(`buildCatalogGroundedPrompt`) so answers can reference real games/agents. Displays a live "0G
session: {sessionId}" footer, implying the reply is itself served via 0G Compute infrastructure.
Quick-prompt suggestions: "Find first game," "Compare games," "Pick by vibe," "Trending."

## Component directory map (`src/components/`, excluding `ui/` which is plain shadcn primitives)

| Dir | Feature area |
|---|---|
| `arena/` (11 files) | Agent create/detail modals, matchmaking start/status modals, wallet manager, battle board card, clan icons |
| `dashboard/` (16 files) | Profile header, topbar (nav+notifications+tour button), live-agent panel, balance/traits/quests/recent-activity panels |
| `league/` (23 files) | World Cup prediction UI — see League section above |
| `leaderboard/` (5 files) | `LeaderboardPodium`, `LeaderboardTablePanel`, `LeaderboardSidebar`, `leaderboardUtils.ts` |
| `moments/` (6 files) | Create/edit/share dialogs, engagement bar, thread panel, game badge |
| `inventory/` (4 files) | Listing card, stats rail, asset image, toolbar |
| `marketplace/` (2 files) | Purchase dialog (Privy payment flow), filters panel |
| `games/` (1 file) | `GameListingCard` |
| `titles/` (2 files) | Player title cards + unlock-detail modal |
| `highway/` (2 files) | Highway Hustle garage + mode-select modal |
| `skeleton/` (2 files) | Loading skeletons for battle board / gameplay |
| `home/` (1 file) | `HomePage.tsx` — landing hero + feature cards |
| top-level | `KultAIFloating`, `LoadingScreen`, `LoginModal` (625 lines, full Privy UI), `LoginModalHost`, `AccessRoute`, `RouteChunkErrorBoundary`, `PageRouteFallback`, `AutoPlayVideo`, `Footer` |

## Hooks (`src/hooks/`)

`useKultAIChat`, `useAiArenaGatewaySession`, `useAiArenaGlobalLeaderboard`, `useArenaAgentsList`,
`useMyArenaAgents`, `useArenaBattleBoard`, `useEnrichedArenaLeaderboard` (merges global leaderboard
with the current user's own agent stats), `useDebounce`, `usePrivyWalletTools`, `use-toast`.

## API file inventory (`src/api/`, 13 files) — backend + endpoints

| File | Backend | Key endpoints |
|---|---|---|
| `accessCodeApi.ts` | main | `POST /access-code/verify` |
| `playerApi.ts` | main | `GET /player/nonce`, `POST /player/login` (SIWE), `GET /player/profile`, `PATCH /player/name` |
| `gamesApi.ts` | main | `GET /games/all`, `GET /games/categories`, `GET /games/:id` |
| `momentsApi.ts` | main | Full CRUD + like/bookmark/watch/top-creators + two-step presigned upload + 0G proof/DA-events endpoints |
| `commentsApi.ts` | main | Comments/replies CRUD on moments |
| `marketplaceApi.ts` | main | `GET /marketplace`, `GET /marketplace/:id`, two-step order (`prepare`→`complete`), `GET /marketplace/orders/mine` |
| `leaderboardApi.ts` | main | `GET /leaderboard/global`, `GET /leaderboard/game/:gameId`, `POST /leaderboard/refresh` |
| `playerTitlesApi.ts` | main | `GET /player-titles/:walletAddress` |
| `aiArenaGatewayApi.ts` (893 lines, largest file) | AI Arena gateway | Agents, battles, matchmaking, training, wallets, transactions, memory, evolve-traits, leaderboard, battle commentary — full surface matching `0G-AIArena`'s documented API |
| `highwayHustleApi.ts` | third-party (`highway-hustle-backend.onrender.com`) | Marketplace assets, user purchases, rewards, equip vehicle |
| `polymarketApi.ts` | third-party (Polymarket gamma/clob APIs) | Markets, events, comments, price history — client-filtered to football |
| `worldCupApi.ts` | third-party (`worldcup26.ir`) | Groups, games, teams — defensive multi-path-fallback parsing since the API isn't formally documented |
| `footballNewsApi.ts` | third-party (`rss2json.com`) | Wraps BBC/Sky Sports RSS |

All main-backend and AI-Arena-gateway API files do defensive response parsing (handle multiple
field-name variants, snake_case vs camelCase, nested envelopes) — a sign the actual backend
response shapes have drifted/varied over time and the frontend compensates rather than assuming a
single strict contract.

## Repo-local docs already present (read these, don't re-derive)

- `context_aiarena.md` — accurate, detailed AI-Arena-integration reference (matchmaking → Unity
  WebGL flow, per-game differences, env vars, result payload shapes). Written specifically to
  onboard the Highway Hustle game addition.
- `memory.md` — the 8-tier ELO rank system (Initiate → Singularity Prime), badge image paths,
  where rank badges are used across the UI. Matches what's visible live on the AI Arena page.
- `todo.md` — Highway Hustle integration status (frontend wiring done; Unity WebGL build + R2
  upload still pending as of last update).

## Env vars (`.env.example`)

```
VITE_API_URL                    Main Kult backend (default: kult-browser-rust-l2lwg.ondigitalocean.app)
VITE_AI_ARENA_GATEWAY_URL        AI Arena gateway (default: aiarena-gateway.onrender.com)
VITE_AI_ARENA_BEARER_TOKEN       Optional static override for protected AI Arena routes
VITE_PRIVY_APP_ID                Privy dashboard app ID
VITE_ALLOWED_CHAIN_ID/NAME/RPC_URL/EXPLORER_URL/NATIVE_*   0G mainnet chain config for wallet switching
VITE_KULT_AI_API_URL             Floating AI chat endpoint override
VITE_HIGHWAY_HUSTLE_API_URL      Highway Hustle garage backend
VITE_HIGHWAY_HUSTLE_BUILD_URL    Highway Hustle Unity WebGL build CDN path (still unset — see todo.md)
VITE_UNITY_BUILD_URL             Warzone Unity WebGL build CDN path
VITE_MARKETPLACE_CONTRACT_ADDRESS / VITE_MARKETPLACE_CHAIN_ID / VITE_USDC_CONTRACT_ADDRESS / VITE_USDT_CONTRACT_ADDRESS   On-chain marketplace payment config (frontend-visible by necessity)
```

⚠️ Note: this repo's actual `.env` (not `.env.example`) was **not** inspected in this pass — if it
contains real secrets, the same caution from `0G-AIArena_Context.md`'s security note applies:
check before assuming `.env.example`-style placeholders are all that's committed.

---

*Compiled 2026-07-03 from this repo's own notes plus direct verification of `App.tsx`,
`src/lib/serviceUrls.ts`, `src/lib/apiClientFactory.ts`, `src/contexts/AccessContext.tsx`,
`src/contexts/AuthContext.tsx`, `src/components/league/LeagueTopAgentsPanel.tsx` +
`leagueData.ts`, `src/pages/Leaderboard.tsx` (traced via research pass), and `package.json` — not
UI observation alone.*
