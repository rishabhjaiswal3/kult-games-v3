import axios, { type AxiosInstance } from "axios";
import { AI_WARZONE_URL, MAIN_BACKEND } from "@/lib/serviceUrls";
import { TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";

export type ApiServiceId = "main" | "aiWarzone";

const SERVICE_BASE_URL: Record<ApiServiceId, string> = {
  main: MAIN_BACKEND,
  aiWarzone: AI_WARZONE_URL,
};

function attachAuthHeader(client: AxiosInstance) {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
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
