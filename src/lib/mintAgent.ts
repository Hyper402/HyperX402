// src/lib/mintAgent.ts
"use client";

import type { Umi } from "@metaplex-foundation/umi";
import { generateSigner, some, percentAmount } from "@metaplex-foundation/umi";
import { createNft } from "@metaplex-foundation/mpl-token-metadata";

/**
 * Args for minting an AI Agent NFT
 */
export type MintAgentArgs = {
  name: string;              // Display name of the NFT
  uri: string;               // JSON metadata URI from Arweave/Bundlr
  symbol?: string;           // Default: "H402"
  sellerFeeBps?: number;     // Optional royalty (0–10000)
  collectionMint?: string;   // Optional collection NFT mint
};

/**
 * Mint the Agent NFT with embedded metadata URI
 * Returns: minted NFT address (mint public key as string)
 */
export async function mintAgentNFT(umi: Umi, args: MintAgentArgs): Promise<string> {
  if (!umi?.identity?.publicKey) throw new Error("Connect your wallet first.");

  // 1. Create a signer for the new mint (the NFT itself)
  const mint = generateSigner(umi);

  // 2. Send transaction
  await createNft(umi, {
    mint,
    name: args.name,
    symbol: args.symbol ?? "H402",
    uri: args.uri, // MUST point to your uploaded JSON (Arweave/Bundlr)
    sellerFeeBasisPoints: percentAmount(Math.max(0, Math.min(10000, args.sellerFeeBps ?? 0))),
    isMutable: true,
    collection: args.collectionMint
      ? some({ verified: false, key: umi.publicKey(args.collectionMint) })
      : undefined,
    creators: [
      {
        address: umi.identity.publicKey,
        verified: false,
        share: 100,
      },
    ],
  }).sendAndConfirm(umi, { confirm: { commitment: "finalized" } });

  return mint.publicKey.toString();
}
