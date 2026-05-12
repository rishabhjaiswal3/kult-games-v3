import axios, { type AxiosInstance } from "axios";
import { AI_ARENA_GATEWAY_URL, MAIN_BACKEND } from "@/lib/serviceUrls";
import { TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";
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

function attachAuthHeader(client: AxiosInstance) {
  client.interceptors.request.use(
    (config) => {
      const isAiArenaRequest =
        typeof config.baseURL === "string" && config.baseURL.includes("aiarena-gateway.onrender.com");
      const aiArenaTokenFromEnv = import.meta.env.VITE_AI_ARENA_BEARER_TOKEN as string | undefined;
      const aiArenaTokenFromStorage = getAiArenaAccessToken();
      const token = isAiArenaRequest
        ? aiArenaTokenFromStorage || aiArenaTokenFromEnv || localStorage.getItem(TOKEN_KEY)
        : localStorage.getItem(TOKEN_KEY);
      if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
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
  }

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
