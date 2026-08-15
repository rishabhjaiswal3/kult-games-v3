/**
 * Frontend overrides are reserved for games that cannot use their catalog URL.
 * Zero Dash intentionally uses metadata.play_url/game.url from the API so its
 * production deployment can be changed in the database without a frontend build.
 */
export const GAME_FRONTEND_URL_OVERRIDES: Readonly<Record<string, string>> = {};
