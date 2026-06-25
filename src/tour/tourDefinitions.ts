import type { DriveStep, Side } from "driver.js";

type TourContext = {
  pathname: string;
  isAuthenticated: boolean;
};

function step(selector: string, title: string, description: string, side: Side = "bottom"): DriveStep {
  return {
    element: selector,
    popover: {
      title,
      description,
      side,
      align: "start",
    },
  };
}

const shellSteps = [
  step("[data-tour='sidebar-brand']", "Kult + 0G", "This is your entry point into Kult Games, AI Arena agents, moments, league boards, rewards, and rankings.", "right"),
  step("[data-tour='sidebar-nav']", "Main navigation", "Use the sidebar to move between every major product area. Each section has its own page tour.", "right"),
];

function routeSteps({ pathname, isAuthenticated }: TourContext): DriveStep[] {
  if (pathname === "/") {
    return [
      step("[data-tour='home-hero']", "Home hub", "Start here for the main Kult Games experience, featured flows, AI Arena entry points, and player actions."),
      step("[data-tour='home-quick-links']", "Quick snapshot", "Use these cards to understand the current product surface and jump into the most important actions."),
      step("[data-tour='topbar-connect']", isAuthenticated ? "Account controls" : "Connect first", isAuthenticated ? "Open your account controls, notifications, and wallet actions from the top bar." : "Connect with wallet, Google, or email OTP to unlock personalized pages and actions.", "left"),
    ];
  }

  if (pathname.startsWith("/games")) {
    return [
      step("[data-tour='games-stats']", "Game library stats", "See how many titles are available, which ones can be played instantly, and which are downloadable builds."),
      step("[data-tour='games-filters']", "Game discovery filters", "Search by name and filter by category before opening a title. This keeps the catalog usable as more games are added."),
      step("[data-tour='games-grid']", "Game cards", "Open any game card to view its detail page, launch controls, media, inventory links, and leaderboard entry points."),
    ];
  }

  if (pathname.startsWith("/game/") && pathname.endsWith("/play")) {
    return [
      step("[data-tour='game-play-chrome-toggle']", "Focus mode", "Hide or restore the app chrome while playing so the game canvas gets maximum space.", "right"),
      step("[data-tour='game-play-iframe']", "Game canvas", "The browser game runs inside this frame with your auth token and wallet context passed into the game URL."),
      step("[data-tour='game-play-download-nav']", "Download navigation", "For downloadable games, use this header to go back or open the game detail page."),
      step("[data-tour='game-play-download-card']", "Download build", "Downloadable games do not run inside the browser. Use this card to grab the native build when available."),
    ];
  }

  if (pathname.startsWith("/game/")) {
    return [
      step("[data-tour='game-detail-hero']", "Game overview", "This hero explains what the title is, whether it is instant-play or downloadable, and whether your account is ready."),
      step("[data-tour='game-detail-launch']", "Launch control", isAuthenticated ? "Start the browser game or download the build from here." : "Connect first if the game requires a signed-in session before play."),
      step("[data-tour='game-detail-facts']", "Game facts", "Quick facts summarize platform, chain, mode, ranking links, and inventory routes for this title."),
      step("[data-tour='game-detail-briefing']", "Mission briefing", "Read the longer game description so players understand objectives and gameplay before launching."),
      step("[data-tour='game-detail-garage']", "Garage", "For Highway Hustle style games, select or inspect the ride setup before playing."),
      step("[data-tour='game-detail-features']", "Features", "Use this area to understand mechanics, special systems, or gameplay highlights."),
      step("[data-tour='game-detail-cta']", "Final launch CTA", "This lower call-to-action repeats the launch or download action after the player has reviewed details."),
      step("[data-tour='game-detail-media']", "Media deck", "Preview screenshots and visual assets for the game before jumping in.", "left"),
    ];
  }

  if (pathname.startsWith("/moments/") && !pathname.startsWith("/moments/browse")) {
    return [
      step("[data-tour='moment-detail-media']", "Moment media", "Watch the image or video highlight. Video moments support playback directly on the detail page."),
      step("[data-tour='moment-detail-meta']", "Moment context", "Title, creator, date, tags, game badge, and AI labels explain what this moment represents."),
      step("[data-tour='moment-detail-engagement']", "Engage", isAuthenticated ? "Like, bookmark, comment, and open sharing actions from this engagement bar." : "Connect first to like, bookmark, and comment on moments."),
      step("[data-tour='moment-detail-storage']", "0G storage proof", "When available, this proof links the uploaded asset to 0G storage and chain transaction metadata."),
      step("[data-tour='moment-detail-comments']", "Discussion thread", "Read and write comments here to keep the conversation attached to the moment."),
      step("[data-tour='moment-detail-info']", "Moment info", "This sidebar summarizes creator, game, likes, comments, posted date, and 0G storage status.", "left"),
      step("[data-tour='moment-detail-ai']", "AI analysis", "AI-generated captioning, rarity, type, rank score, skill score, and highlights are shown here when processed.", "left"),
      step("[data-tour='moment-detail-share']", "Share moment", "Share the moment with rich preview metadata for social platforms.", "left"),
      step("[data-tour='moment-detail-manage']", "Manage your moment", "Owners can edit details or delete the moment from this private management card.", "left"),
    ];
  }

  if (pathname.startsWith("/moments")) {
    return [
      step("[data-tour='moments-create']", "Create a moment", isAuthenticated ? "Publish a highlight, trash-talk card, battle clip, or AI-ranked moment from here." : "Connect first, then use this button to publish your own highlights."),
      step("[data-tour='moments-tabs']", "Moment collections", "Switch between discovery, your moments, bookmarks, and recently watched clips."),
      step("[data-tour='moments-filters']", "Moment filters", "Search and filter by game, mode, ranking, and time window so you can find the right highlight quickly."),
      step("[data-tour='moments-grid']", "Moment grid", "Open clips, bookmark favorites, inspect AI details, and share moments to social platforms."),
    ];
  }

  if (pathname.startsWith("/ai-arena")) {
    return [
      step("[data-tour='ai-arena-hero']", "AI Arena command center", "Create agents, train them, send them into battle, and track their evolution across the 0G-backed arena."),
      step("[data-tour='ai-arena-quick-links']", "Arena shortcuts", "Jump straight to agents, training, battles, achievements, or autonomous mode."),
      step("[data-tour='ai-arena-matchmaking']", "Start matchmaking", isAuthenticated ? "Pick an agent and start a battle flow from here." : "Connect your wallet first to unlock matchmaking and your AI Arena session."),
    ];
  }

  if (pathname.startsWith("/dashboard")) {
    return [
      step("[data-tour='dashboard-profile']", "Player dashboard", "Your Kult identity, wallet, rank, points, and profile summary start here."),
      step("[data-tour='dashboard-agent']", "Live agent panel", "Manage the active AI agent, create a new one, and inspect current status."),
      step("[data-tour='dashboard-quick-actions']", "Quick actions", "Use these shortcuts to jump into the most important game, moment, and arena flows."),
    ];
  }

  if (pathname.startsWith("/my-agents")) {
    return [
      step("[data-tour='my-agents-header']", "Agent roster", "This page manages your AI Arena agents: status, stats, wallets, battle memory, and training links."),
      step("[data-tour='my-agents-stats']", "Roster stats", "Track your agent count, arena population, active agents, total battles, and overall win rate."),
      step("[data-tour='my-agents-filters']", "Find and sort agents", "Filter by status, search by name, sort by performance, and create a new agent."),
      step("[data-tour='my-agents-create']", "Create agent", "Open the creation flow to mint or register a new AI Arena fighter."),
      step("[data-tour='my-agents-grid']", "Agent cards", "Each card shows identity, clan, archetype, evolution stage, record, power score, wallet tools, details, and retire controls."),
      step("[data-tour='my-agents-battle-history']", "Battle memory", "Review completed battles and reopen battle replays or memory records from your agents."),
      step("[data-tour='my-agents-ai-arena-link']", "Arena bridge", "Jump back to the AI Arena hub when you want to move from roster management to battles or training."),
    ];
  }

  if (pathname.startsWith("/training")) {
    return [
      step("[data-tour='training-header']", "Training center", "Queue real AI Arena training jobs, monitor progress, inspect eligibility, and improve agents."),
      step("[data-tour='training-stats']", "Training metrics", "See how many agents, jobs, active runs, completed runs, and eligible agents are available."),
      step("[data-tour='training-tabs']", "Training views", "Switch between overview, active sessions, completed skills, and failed or cancelled lab jobs."),
      step("[data-tour='training-agent-selector']", "Select an agent", "Pick which agent receives quick training, custom training, or program-based jobs."),
      step("[data-tour='training-queue']", "Training queue", "Use quick train, create jobs, inspect status, cancel active jobs, and follow progress bars."),
      step("[data-tour='training-global-feed']", "Global training feed", "See recent arena-wide training activity and inspect jobs outside your local queue."),
      step("[data-tour='training-programs']", "Training programs", "Choose predefined training programs based on the type of behavior improvement you want."),
      step("[data-tour='training-job-inspector']", "Job inspector", "Paste or select a job ID to inspect details like status, priority, start time, completion time, and dataset root."),
      step("[data-tour='training-readiness']", "Agent readiness", "Check why the selected agent can or cannot train, including battle requirements and running jobs."),
      step("[data-tour='training-boosts']", "Boosts", "Review training boosts and bonuses that describe how agent improvement is accelerated.", "left"),
    ];
  }

  if (pathname.startsWith("/battles")) {
    return [
      step("[data-tour='battles-stats']", "Battle overview", "Review your arena stats, agent rank, total battles, and current competitive position."),
      step("[data-tour='battles-game-modes']", "Game modes", "Browse the battle modes that explain where agents can fight and what style each mode supports."),
      step("[data-tour='battles-board']", "Arena battle board", "Open lobbies and ranked snapshots live here. Pick a challenger and join available fights."),
      step("[data-tour='battles-live-control']", "Live control deck", "Manage your own queued fighters, reopen match status, and start matchmaking."),
      step("[data-tour='battles-my-queue']", "Your live queue", "This section shows agents currently waiting for opponents and lets you view or leave queue."),
      step("[data-tour='battles-public-join']", "Join public battles", "Use the public board flow to challenge open lobbies with a free agent."),
      step("[data-tour='battles-console']", "Battle console", "Create direct fights, inspect battle IDs, watch socket traffic, and dispute results."),
      step("[data-tour='battles-direct-setup']", "Direct battle setup", "Choose your fighter, battle mode, game, opponent ID, and optional wager before creating a fight."),
      step("[data-tour='battles-lookup']", "Battle lookup", "Paste a battle ID to inspect live state, participants, socket events, and dispute controls."),
      step("[data-tour='battles-sidebar']", "Rewards and performers", "The side rail summarizes rewards and top-performing agents while battle tools stay available.", "left"),
    ];
  }

  if (pathname.startsWith("/inventory") || pathname.startsWith("/marketplace")) {
    return [
      step("[data-tour='inventory-summary']", "Inventory marketplace", "Browse assets, listing counts, categories, games, and the active marketplace scope."),
      step("[data-tour='inventory-filters']", "Asset filters", "Filter by game, category, and search text. Reset filters when you want the full listing set again."),
      step("[data-tour='inventory-grid']", "Available items", "Open listing cards, preview item information, and start the purchase flow with your connected wallet."),
    ];
  }

  if (pathname.startsWith("/leaderboard")) {
    return [
      step("[data-tour='leaderboard-mode-switch']", "Leaderboard modes", "Switch between KULT Points and AI Arena rankings without mixing the scoring systems."),
      step("[data-tour='leaderboard-tabs-filters']", "Rank views and filters", "Move between global rankings and your own rank. AI Arena also supports league filtering."),
      step("[data-tour='leaderboard-rankings']", "Ranking table", "This area shows podiums, rank tables, pagination, your pinned row, or your personal stats depending on the selected view."),
      step("[data-tour='leaderboard-sidebar']", "Rank sidebar", "Use the sidebar for season progress, rank context, league filtering notes, and system-specific scoring explanations.", "left"),
    ];
  }

  if (pathname.startsWith("/league")) {
    return [
      step("[data-tour='league-header']", "Kult League", "This page tracks live league stories, predictions, agent picks, and market-style questions."),
      step("[data-tour='league-mode-tabs']", "League modes", "Switch between the Kult League view and upcoming Polymarket-style prediction markets."),
      step("[data-tour='league-featured']", "Live featured match", "Follow the main active matchup, read the room, and understand the current league focus."),
      step("[data-tour='league-stats']", "League side stats", "See top agents, win-rate signals, and supporting context beside the featured matchup.", "left"),
      step("[data-tour='league-moments']", "Moments ticker", "Watch league-relevant moments and story beats move across the page."),
      step("[data-tour='league-upcoming']", "Upcoming fights", "Preview what is coming next so you can prepare picks before the lock window."),
      step("[data-tour='league-predictions']", "Today predictions", "Review daily prediction opportunities and decide where your conviction belongs."),
      step("[data-tour='league-recent-picks']", "Recent picks", "Track recent selections so users can understand current sentiment."),
      step("[data-tour='league-rivalries']", "Rivalries", "See repeated matchups and narrative rivalries shaping the league."),
      step("[data-tour='league-lineup']", "Your lineup", "Review the user-focused lineup area for personalized league participation."),
      step("[data-tour='league-fights']", "Fight board", "Explore broader fights and compare agent conviction."),
      step("[data-tour='league-questions']", "Questions carousel", "Use question cards to explore more prediction topics and discussion points."),
    ];
  }

  if (pathname.startsWith("/achievements")) {
    return [
      step("[data-tour='achievements-header']", "Achievements", "Track challenges, unlocked rewards, points, and progression milestones for your AI Arena agents."),
      step("[data-tour='achievements-stats']", "Achievement stats", "Review total achievement points, unlocked count, active categories, and next reward progress."),
      step("[data-tour='achievements-filters']", "Achievement filters", "Switch tabs, search by achievement text, or filter by category."),
      step("[data-tour='achievements-categories']", "Category progress", "Each category shows progress toward completion across battles, agents, training, autonomous mode, collection, and special goals."),
      step("[data-tour='achievements-list']", "Achievement cards", "Cards show rarity, locked or unlocked state, progress, and point rewards."),
      step("[data-tour='achievements-overview']", "Achievement overview", "The donut chart summarizes achievement rarity distribution and unlocked progress.", "left"),
      step("[data-tour='achievements-rewards']", "Milestone rewards", "Milestones show reward crates and progress toward the next point threshold.", "left"),
      step("[data-tour='achievements-recent']", "Recently unlocked", "Use this feed to see the newest achievements and points earned.", "left"),
    ];
  }

  if (pathname.startsWith("/autonomous")) {
    return [
      step("[data-tour='autonomous-header']", "Autonomous command", "This page controls hands-free agent loops: matchmaking, training, rewards, and telemetry."),
      step("[data-tour='autonomous-metrics']", "Autonomous metrics", "Track active autonomous agents, battles, training completions, win rate, and average ELO."),
      step("[data-tour='autonomous-brain']", "System status", "The brain panel gives a quick visual status of whether any agents are currently operating autonomously."),
      step("[data-tour='autonomous-status']", "Capabilities", "See what autonomous mode can handle, including matchmaking, training, and continuous loops."),
      step("[data-tour='autonomous-agent-table']", "Agent autonomy toggles", "Enable or disable autonomous mode per agent, and review task, status, and stats."),
      step("[data-tour='autonomous-telemetry']", "Live telemetry", "This console simulates and reports loop activity so you can understand what the autonomous system is doing."),
      step("[data-tour='autonomous-how-it-works']", "How it works", "Follow the lifecycle: enable an agent, auto-queue battles, auto-train, and review results."),
      step("[data-tour='autonomous-strategy']", "Strategy", "Review the current autonomous allocation between matchmaking, training, and rest or ELO guard.", "left"),
      step("[data-tour='autonomous-performance']", "Performance profile", "Use this profile to compare your agents against an average strategy baseline.", "left"),
      step("[data-tour='autonomous-rewards']", "Auto rewards", "Rewards and battle wins are summarized here for autonomous activity.", "left"),
      step("[data-tour='autonomous-activity']", "Activity log", "Recent autonomous battles and training jobs are combined into one audit-style feed.", "left"),
    ];
  }

  if (pathname.startsWith("/arena/game/")) {
    return [
      step("[data-tour='arena-game-topbar']", "Battle top bar", "Use this bar to go back, identify the battle, see live or ended status, and share a result as a Kult Moment."),
      step("[data-tour='arena-game-agents']", "Agent matchup", "The versus banner shows both agents, battle mode, rank context, and live battle identity."),
      step("[data-tour='arena-game-canvas']", "Live battle canvas", "Unity renders the AI Arena battle here. Loading, pre-match, errors, and result overlays all appear inside this area."),
      step("[data-tour='arena-game-chat']", "Observer chat", "Use the chat panel to follow system events, add observer messages, and share moments from the battle.", "left"),
    ];
  }

  if (pathname.startsWith("/arena/robowar/")) {
    return [
      step("[data-tour='robowar-topbar']", "Robowar header", "Use this red-themed header to identify the battle and navigate back."),
      step("[data-tour='robowar-agents']", "Robowar matchup", "Both competing agents, archetypes, ELO values, and battle mode are summarized here."),
      step("[data-tour='robowar-category-filter']", "Moment categories", "Filter the post-battle feed by For You, Trending, AI Arena, or Robowars."),
      step("[data-tour='robowar-moments-feed']", "Battle moments feed", "Browse related moments, play video highlights, open detail pages, and continue loading more clips."),
    ];
  }

  return [
    step("[data-tour='sidebar-nav']", "Page tour not customized yet", "Use the sidebar to continue exploring. The tour will show page-specific guidance wherever anchors are available.", "right"),
  ];
}

export function getWebsiteTourSteps(context: TourContext): DriveStep[] {
  return [
    ...shellSteps,
    ...routeSteps(context),
    step("[data-tour='tour-start']", "Replay this page tour", "Use this button whenever you want to restart the walkthrough for the current page.", "left"),
  ];
}
