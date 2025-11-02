// src/app/my-agents/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import ClientOnly from "@/components/ClientOnly";
import { useUmi } from "@/lib/umi";
import { loadAgentsForOwner, type OnchainAgent } from "@/lib/agentsOnchain";
import { publicKey as umiPk } from "@metaplex-foundation/umi";

export default function MyAgentsPage() {
  const { publicKey } = useWallet();
  const umi = useUmi();

  const [loading, setLoading] = React.useState(false);
  const [agents, setAgents] = React.useState<OnchainAgent[]>([]);
  const [err, setErr] = React.useState<string>("");

  const refresh = React.useCallback(async () => {
    if (!publicKey) {
      setAgents([]);
      return;
    }
    try {
      setErr("");
      setLoading(true);
      const owner = umiPk(publicKey.toBase58()); // convert wallet PK for Umi
      const list = await loadAgentsForOwner(umi, owner, {
        symbol: "H402",
        // collection: "<optional collection mint>",
      });
      setAgents(list);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [publicKey, umi]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">My Agents</h1>
          <p className="opacity-80 mt-2">
            On-chain agents (symbol <code>H402</code>) held by your wallet.
          </p>
        </div>

        <div className="flex gap-2">
          {/* ✅ wallet button only renders on client to avoid hydration mismatch */}
          <ClientOnly>
            <WalletMultiButton className="!bg-white/10 !rounded-xl !border !border-white/10 hover:!bg-white/20" />
          </ClientOnly>
          <button onClick={refresh} className="cta">Refresh</button>
          <Link href="/mint" className="cta cta-primary">Mint New Agent</Link>
        </div>
      </div>

      {!publicKey ? (
        <div className="glass p-8 text-center">
          <p className="opacity-80 mb-2">Connect a wallet to load your agents.</p>
          <ClientOnly>
            <WalletMultiButton className="!bg-white/10 !rounded-xl !border !border-white/10 hover:!bg-white/20" />
          </ClientOnly>
        </div>
      ) : loading ? (
        <div className="glass p-8 text-center">
          <p className="opacity-80">Loading agents from chain…</p>
        </div>
      ) : err ? (
        <div className="glass p-8 text-center border-red-500/30 bg-red-500/10">
          <p className="opacity-80">Error: {err}</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="glass p-8 text-center">
          <p className="opacity-80">No H402 agents found for this wallet.</p>
          <Link href="/mint" className="cta mt-4 inline-flex">Mint your first agent</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((a) => (
            <div key={a.mint} className="glass p-5 flex flex-col">
              <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden h-44 grid place-items-center">
                {a.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image} alt={a.name} className="object-contain w-full h-full" />
                ) : (
                  <span className="opacity-60 text-sm">No image</span>
                )}
              </div>

              <h3 className="mt-3 text-lg font-semibold line-clamp-1">{a.name}</h3>
              <p className="text-xs opacity-70">
                Model: {a.model ?? "—"} · Temp: {a.temperature ?? "—"}
              </p>
              <p className="mt-2 line-clamp-2 text-sm opacity-80">
                {a.prompt ?? "No prompt in metadata."}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <Link href={`/agent/${a.mint}`} className="cta cta-primary flex-1 text-center">
                  Open
                </Link>
                <a
                  className="cta flex-1 text-center"
                  href={`https://solscan.io/token/${a.mint}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Solscan
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
