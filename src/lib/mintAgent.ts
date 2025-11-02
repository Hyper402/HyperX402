// src/lib/mintAgent.ts
"use client";

import type { Umi } from "@metaplex-foundation/umi";
import {
  generateSigner,
  some,
  percentAmount,
  publicKey as umiPk,   // <-- add this
} from "@metaplex-foundation/umi";
import { createNft } from "@metaplex-foundation/mpl-token-metadata";

export type MintAgentArgs = {
  name: string;
  uri: string;
  symbol?: string;
  sellerFeeBps?: number;
  collectionMint?: string;
};

export async function mintAgentNFT(umi: Umi, args: MintAgentArgs): Promise<string> {
  if (!umi?.identity?.publicKey) throw new Error("Connect your wallet first.");

  const mint = generateSigner(umi);

  await createNft(umi, {
    mint,
    name: args.name,
    symbol: args.symbol ?? "H402",
    uri: args.uri,
    sellerFeeBasisPoints: percentAmount(
      Math.max(0, Math.min(10000, args.sellerFeeBps ?? 0))
    ),
    isMutable: true,
    collection: args.collectionMint
      ? some({ verified: false, key: umiPk(args.collectionMint) }) // <-- change here
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
