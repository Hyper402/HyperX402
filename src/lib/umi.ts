// src/lib/umi.ts
import type { Umi } from "@metaplex-foundation/umi";
import { publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

let _umi: Umi | null = null;

export function getUmi(wallet?: WalletContextState | null): Umi {
  const endpoint =
    process.env.NEXT_PUBLIC_HELIUS_RPC?.trim() ||
    clusterApiUrl("mainnet-beta");

  if (!_umi) {
    _umi = createUmi(endpoint).use(mplTokenMetadata());

    // Helper to (re)register a program with an isOnCluster shim
    const forceProgram = (name: string, pk: string) => {
      // remove any stale entry, then add our explicit descriptor
      try {
        // @ts-ignore — remove if exists
        _umi!.programs.remove(name as any);
      } catch {}
      _umi!.programs.add({
        name,
        publicKey: publicKey(pk),
        // Some libs call this; make it always true on mainnet usage.
        // Signature matches Umi's Program interface optional method.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        isOnCluster: (_umiInstance?: Umi) => true,
      } as any);
    };

    forceProgram("splToken", TOKEN_PROGRAM_ID.toBase58());
    forceProgram(
      "splAssociatedToken",
      ASSOCIATED_TOKEN_PROGRAM_ID.toBase58()
    );
  }

  if (wallet?.wallet?.adapter) {
    _umi.use(walletAdapterIdentity(wallet.wallet.adapter));
  }

  return _umi;
}
