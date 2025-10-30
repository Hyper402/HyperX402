"use client";

import { ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  LedgerWalletAdapter,
  // BackpackWalletAdapter,   // see Backpack notes below
  // BraveWalletAdapter,      // optional
  // CoinbaseWalletAdapter,   // optional
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

// Use Helius if provided, otherwise fall back to public mainnet RPC
const endpoint =
  (process.env.NEXT_PUBLIC_HELIUS_RPC?.trim()?.length
    ? process.env.NEXT_PUBLIC_HELIUS_RPC!.trim()
    : undefined) || clusterApiUrl("mainnet-beta");

export default function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // The `network` arg is optional on recent versions — leaving it is fine.
      new SolflareWalletAdapter({ network: "mainnet-beta" }),
      new LedgerWalletAdapter(),
      // new BackpackWalletAdapter(),  // add once Backpack is installed (see notes)
      // new BraveWalletAdapter(),
      // new CoinbaseWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: "confirmed" }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
