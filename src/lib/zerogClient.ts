import { createPublicClient, http } from "viem";
import { appChain } from "@/lib/zerogChain";

/** Shared read-only 0G Chain RPC client -- balance/allowance checks only, no signing. */
export const zerogPublicClient = createPublicClient({ chain: appChain, transport: http() });
