import axios, { type AxiosInstance } from "axios";
import { AI_ARENA_GATEWAY_URL, MAIN_BACKEND } from "@/lib/serviceUrls";
import { StorageKeys, TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";
import {
  clearAiArenaAuthTokens,
  getAiArenaAccessToken,
  refreshAiArenaAccessToken,
} from "@/lib/aiArenaAuth";

export type ApiServiceId = "main" | "aiArenaGateway";

const SERVICE_BASE_URL: Record<ApiServiceId, string> = {
  main: MAIN_BACKEND,
  aiArenaGateway: AI_ARENA_GATEWAY_URL,
};

function analyticsEndpoint(url?: string) {
  if (!url) return "unknown";
  try {
    return new URL(url, window.location.origin).pathname
      .replace(/\/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, "/:id")
      .replace(/\/[A-Za-z0-9_-]{18,}(?=\/|$)/g, "/:id")
      .replace(/\/\d+(?=\/|$)/g, "/:id");
  } catch {
    return "unknown";
  }
}

/**
 * Converts successful mutation requests into stable product outcomes. These are
 * intentionally based only on method + normalized path: request/response bodies
 * may contain prompts, wallet details, comments, or other private user data.
 */
function productEventFor(method: string | undefined, endpoint: string) {
  const key = `${method?.toUpperCase() || "GET"} ${endpoint}`;
  const exact: Record<string, string> = {
    "POST /access-code/verify": "access_code_verified",
    "POST /player/login": "login_completed",
    "PATCH /player/name": "profile_name_updated",
    "POST /rewards/daily/claim": "daily_reward_claimed",
    "POST /leaderboard/refresh": "leaderboard_refreshed",
    "POST /marketplace/orders/prepare": "marketplace_order_prepared",
    "POST /marketplace/orders/complete": "marketplace_purchase_completed",
    "POST /moments/register": "moment_created",
    "POST /v1/agents": "agent_created",
    "POST /v1/battles": "battle_created",
    "POST /v1/matchmaking": "matchmaking_joined",
    "POST /v1/matchmaking/match/direct": "direct_challenge_created",
    "POST /v1/wallets/deposits": "wallet_deposit_requested",
    "POST /v1/wallets/withdrawals": "wallet_withdrawal_requested",
    "POST /v1/wallets/permit": "wallet_permit_submitted",
    "POST /v1/f1/fantasy/draft": "fantasy_team_drafted",
  };
  if (exact[key]) return exact[key];

  const patterns: Array<[RegExp, string]> = [
    [/^POST \/moments\/:id\/like$/, "moment_like_toggled"],
    [/^POST \/moments\/:id\/bookmark$/, "moment_bookmark_toggled"],
    [/^POST \/moments\/:id\/watch$/, "moment_watched"],
    [/^PATCH \/moments\/:id$/, "moment_updated"],
    [/^DELETE \/moments\/:id$/, "moment_deleted"],
    [/^POST \/moments\/:id\/zg\/retry$/, "moment_storage_retry_requested"],
    [/^POST \/moments\/:id\/comments$/, "moment_comment_created"],
    [/^POST \/moments\/comments\/:id\/replies$/, "moment_reply_created"],
    [/^PATCH \/moments\/comments\/:id$/, "moment_comment_updated"],
    [/^DELETE \/moments\/comments\/:id$/, "moment_comment_deleted"],
    [/^DELETE \/v1\/agents\/:id$/, "agent_deleted"],
    [/^POST \/v1\/agents\/:id\/autonomous$/, "agent_autonomy_updated"],
    [/^POST \/v1\/agents\/:id\/train/, "agent_training_started"],
    [/^POST \/v1\/training/, "agent_training_started"],
    [/^DELETE \/v1\/training\/:id/, "agent_training_cancelled"],
    [/^POST \/v1\/battles\/:id\/dispute$/, "battle_disputed"],
    [/^POST \/v1\/battles\/:id\/end$/, "battle_completed"],
    [/^POST \/v1\/battles\/:id\/commentary$/, "battle_commentary_generated"],
    [/^DELETE \/v1\/matchmaking\//, "matchmaking_left"],
    [/^POST \/v1\/league\/matches\/:id\/predict$/, "league_prediction_created"],
    [/^POST \/v1\/league\/battles\/:id\/accept$/, "league_battle_accepted"],
    [/^POST \/v1\/league\/battles$/, "league_battle_created"],
    [/^POST \/v1\/f1\/drivers\/:id\/predict$/, "f1_prediction_generated"],
    [/^POST \/v1\/f1\/races\/:id\/(pick|predict-pick)$/, "f1_pick_submitted"],
    [/^POST \/v1\/polymarket\/signals\//, "market_signal_created"],
  ];
  return patterns.find(([pattern]) => pattern.test(key))?.[1];
}

function attachApiAnalytics(client: AxiosInstance, service: ApiServiceId) {
  client.interceptors.request.use((config) => {
    (config as typeof config & { __analyticsStartedAt?: number }).__analyticsStartedAt = performance.now();
    return config;
  });
  client.interceptors.response.use(
    (response) => {
      const startedAt = (response.config as typeof response.config & { __analyticsStartedAt?: number }).__analyticsStartedAt;
      const endpoint = analyticsEndpoint(response.config.url);
      window.dispatchEvent(new CustomEvent("kult:api-analytics", { detail: {
        service,
        outcome: "success",
        method: response.config.method?.toUpperCase(),
        endpoint,
        status: response.status,
        duration_ms: startedAt ? Math.round(performance.now() - startedAt) : undefined,
        product_event: productEventFor(response.config.method, endpoint),
      } }));
      return response;
    },
    (error) => {
      const config = error?.config as (typeof error.config & { __analyticsStartedAt?: number; _retry?: boolean; _x402Retry?: boolean }) | undefined;
      window.dispatchEvent(new CustomEvent("kult:api-analytics", { detail: {
        service,
        outcome: "failure",
        method: config?.method?.toUpperCase(),
        endpoint: analyticsEndpoint(config?.url),
        status: error?.response?.status,
        duration_ms: config?.__analyticsStartedAt ? Math.round(performance.now() - config.__analyticsStartedAt) : undefined,
        error_code: typeof error?.code === "string" ? error.code : undefined,
        is_timeout: error?.code === "ECONNABORTED",
        retried_auth: Boolean(config?._retry),
        retried_payment: Boolean(config?._x402Retry),
      } }));
      return Promise.reject(error);
    },
  );
}

function attachAuthHeader(client: AxiosInstance) {
  client.interceptors.request.use(
    (config) => {
      const isAiArenaRequest =
        typeof config.baseURL === "string" && config.baseURL.includes("aiarena-gateway.onrender.com");

      if (isAiArenaRequest) {
        const arenaToken = getAiArenaAccessToken();
        if (arenaToken) {
          config.headers.Authorization = `Bearer ${arenaToken}`;
        }
      } else {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token && token !== "undefined" && token !== "null") {
          config.headers.Authorization = `Bearer ${token}`;
        }
        const rawAccess = localStorage.getItem(StorageKeys.local.browserAccessSession);
        if (rawAccess) {
          try {
            const accessToken = JSON.parse(rawAccess)?.accessToken;
            if (typeof accessToken === "string" && accessToken) {
              config.headers["X-Kult-Access-Token"] = accessToken;
            }
          } catch {
            localStorage.removeItem(StorageKeys.local.browserAccessSession);
          }
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

function attachAiArenaRefreshOn401(client: AxiosInstance) {
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      const original = error?.config as (typeof error.config & { _retry?: boolean }) | undefined;
      if (status !== 401 || !original || original._retry) {
        return Promise.reject(error);
      }

      original._retry = true;
      try {
        const nextAccessToken = await refreshAiArenaAccessToken();
        original.headers = {
          ...(original.headers ?? {}),
          Authorization: `Bearer ${nextAccessToken}`,
        };
        return client.request(original);
      } catch (refreshErr) {
        clearAiArenaAuthTokens();
        return Promise.reject(refreshErr);
      }
    }
  );
}

/**
 * x402 automatic payment interceptor.
 *
 * When the gateway returns 402 Payment Required, this interceptor:
 *   1. Reads the payment requirements from the response body
 *   2. Gets the current agent ID from local storage
 *   3. POSTs to /v1/financial/escrow/x402/pay to deduct from the agent's
 *      custodial ARENA wallet and receive a synthetic tx hash
 *   4. Retries the original request with X-Payment-Tx-Hash + X-Payment-Agent-Id headers
 *
 * Only retries once (_x402Retry flag) to prevent infinite loops.
 */
function attachX402AutoPay(client: AxiosInstance) {
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status   = error?.response?.status;
      const original = error?.config as (typeof error.config & { _x402Retry?: boolean }) | undefined;

      if (status !== 402 || !original || original._x402Retry) {
        return Promise.reject(error);
      }

      const payment = error.response?.data?.payment as {
        amount?: number;
        action?: string;
        currency?: string;
      } | undefined;

      if (!payment?.amount || !payment?.action) return Promise.reject(error);

      // Get stored agent ID
      const { getStoredAiAgentInfo } = await import("@/lib/aiAgentStorage");
      const agentInfo = getStoredAiAgentInfo();
      if (!agentInfo?.agentId) {
        console.warn("[x402] No agent ID in storage — cannot auto-pay");
        return Promise.reject(error);
      }

      original._x402Retry = true;

      try {
        // Pay from agent's custodial wallet
        const payRes = await client.post<{ ok: boolean; txHash: string; agentId: string }>(
          "/v1/financial/escrow/x402/pay",
          { agentId: agentInfo.agentId, amount: payment.amount, purpose: payment.action }
        );

        if (!payRes.data?.ok || !payRes.data?.txHash) {
          console.warn("[x402] Payment initiation returned no txHash");
          return Promise.reject(error);
        }

        const { txHash } = payRes.data;
        console.info(`[x402] Auto-paid ${payment.amount} ARENA for ${payment.action} → tx ${txHash}`);

        // Retry with payment proof headers
        original.headers = {
          ...(original.headers ?? {}),
          "X-Payment-Tx-Hash":  txHash,
          "X-Payment-Agent-Id": agentInfo.agentId,
        };
        return client.request(original);
      } catch (payErr) {
        console.warn("[x402] Auto-pay failed:", payErr);
        return Promise.reject(error); // surface original 402
      }
    }
  );
}

/**
 * Only the main backend uses shared session storage for login; clearing tokens on 401
 * matches existing player/games behavior. Other services get their own client without this.
 */
function attachMainSessionOn401(client: AxiosInstance) {
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(WALLET_KEY);
      }
      return Promise.reject(error);
    }
  );
}

function buildClient(service: ApiServiceId): AxiosInstance {
  const instance = axios.create({
    baseURL: SERVICE_BASE_URL[service],
    headers: {
      "Content-Type": "application/json",
    },
  });

  attachAuthHeader(instance);

  if (service === "main") {
    attachMainSessionOn401(instance);
  }
  if (service === "aiArenaGateway") {
    attachAiArenaRefreshOn401(instance);
    attachX402AutoPay(instance);
  }
  attachApiAnalytics(instance, service);

  return instance;
}

const cache = new Map<ApiServiceId, AxiosInstance>();

/**
 * Returns a shared Axios instance for the given microservice.
 * Add new services in {@link ApiServiceId} and {@link SERVICE_BASE_URL}.
 */
export function getApiClient(service: ApiServiceId): AxiosInstance {
  let client = cache.get(service);
  if (!client) {
    client = buildClient(service);
    cache.set(service, client);
  }
  return client;
}

/**
 * Factory entry for tests or one-off instances (does not use the singleton cache).
 */
export function createApiClient(service: ApiServiceId): AxiosInstance {
  return buildClient(service);
}
