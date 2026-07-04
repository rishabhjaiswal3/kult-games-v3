import { createPublicClient, http } from "viem";
import { polygon } from "viem/chains";

/** Shared read-only Polygon RPC client -- balance/allowance checks only, no signing. */
export const polygonPublicClient = createPublicClient({ chain: polygon, transport: http() });
