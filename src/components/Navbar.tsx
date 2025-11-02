"use client";

import React from "react";
import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Navbar() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="fixed top-0 inset-x-0 z-40">
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">
            <span style={{ color: "#9b5cff" }}>Hyper</span>X402
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm opacity-80">
            <Link href="/features" className="hover:opacity-100">Features</Link>
            <Link href="/stats" className="hover:opacity-100">Stats</Link>
            <Link href="/docs" className="hover:opacity-100">Docs</Link>
            <Link href="/my-agents" className="hover:opacity-100">My Agents</Link>
          </nav>

          {/* Guard the wallet button to client-only to avoid hydration mismatch */}
          {mounted ? (
            <WalletMultiButton className="!bg-white/10 !rounded-xl !border !border-white/10 hover:!bg-white/20" />
          ) : (
            <div className="h-10 w-36 rounded-xl bg-white/10 border border-white/10" />
          )}
        </div>
      </div>
      <div className="h-px w-full bg-white/10" />
    </div>
  );
}
