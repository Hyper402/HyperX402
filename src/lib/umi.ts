// src/lib/umi.ts
"use client";

import { useEffect, useRef } from "react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import type { Umi } from "@metaplex-foundation/umi";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { bundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";
import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";

/** Build a fresh Umi with RPC + Bundlr (no wallet bound yet) */
function buildBaseUmi(endpoint: string, bundlrNode: string): Umi {
  return createUmi(endpoint)
    .use(mplTokenMetadata())
    // `providerUrl` is optional; Umi will use its own RPC. You can re-add if needed.
    .use(bundlrUploader({ address: bundlrNode }));
}

/** Non-hook helper for libs (mint/update/etc.) */
export function getUmi(wallet?: WalletContextState) {
  const helius = process.env.NEXT_PUBLIC_HELIUS_RPC;
  const fallback = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://mainnet.helius-rpc.com";
  const bundlr = process.env.NEXT_PUBLIC_BUNDLR_NODE || "https://node1.bundlr.network";
  const endpoint = helius || fallback;

  const umi = buildBaseUmi(endpoint, bundlr);
  if (wallet?.publicKey) {
    // pass the adapter itself, not a custom object
    umi.use(walletAdapterIdentity(wallet as any));
  }
  return umi;
}

/** React hook version for components */
export function useUmi() {
  const wallet = useWallet();

  const helius = process.env.NEXT_PUBLIC_HELIUS_RPC;
  const fallback = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://mainnet.helius-rpc.com";
  const bundlr = process.env.NEXT_PUBLIC_BUNDLR_NODE || "https://node1.bundlr.network";
  const endpoint = helius || fallback;

  const umiRef = useRef<Umi>(buildBaseUmi(endpoint, bundlr));

  // Rebuild when RPC changes
  useEffect(() => {
    umiRef.current = buildBaseUmi(endpoint, bundlr);
  }, [endpoint, bundlr]);

  // Bind wallet identity whenever it’s available
  useEffect(() => {
    if (wallet?.publicKey) {
      umiRef.current.use(walletAdapterIdentity(wallet as any));
    }
  }, [wallet]);

  return umiRef.current;
}
