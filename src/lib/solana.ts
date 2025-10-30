// src/lib/solana.ts
export const getRpcEndpoint = () =>
  (typeof window === "undefined"
    ? process.env.HELIUS_RPC
    : process.env.NEXT_PUBLIC_HELIUS_RPC || process.env.HELIUS_RPC) || "";
