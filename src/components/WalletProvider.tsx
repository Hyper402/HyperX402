"use client";

import { ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

// Prefer your Helius RPC but fall back to mainnet-beta public RPC
const endpoint =
  (process.env.NEXT_PUBLIC_HELIUS_RPC || "").trim() || clusterApiUrl("mainnet-beta");

export default function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // Either omit network completely OR use the enum:
      // new SolflareWalletAdapter()
      new SolflareWalletAdapter({ network: WalletAdapterNetwork.Mainnet }),
      new LedgerWalletAdapter(),
      // Add Backpack later if/when installed:
      // new BackpackWalletAdapter(),
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
