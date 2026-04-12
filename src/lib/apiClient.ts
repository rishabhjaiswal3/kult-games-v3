import { getApiClient } from "@/lib/apiClientFactory";

export { StorageKeys, TOKEN_KEY, WALLET_KEY } from "@/constants/storageKeys";
export { getApiClient, createApiClient, type ApiServiceId } from "@/lib/apiClientFactory";
export { MAIN_BACKEND, AI_WARZONE_URL } from "@/lib/serviceUrls";

/** Default client: main Kult backend (`/api` on {@link MAIN_BACKEND}). */
export default getApiClient("main");
