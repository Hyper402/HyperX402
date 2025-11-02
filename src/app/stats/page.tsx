"use client";

import React from "react";
import Link from "next/link";

type Kpi = {
  label: string;
  value: string;
  sub?: string;
};
type Activity = {
  id: string;
  title: string;
  subtitle: string;
  href?: string;
};

// ─── Mock data (swap with real RPC/DB later) ────────────────────────────────
const KPIS: Kpi[] = [
  { label: "Agents Minted", value: "69", sub: "all-time" },
  { label: "Collections", value: "1", sub: "H402" },
  { label: "Avg. Mint Cost", value: "0.0004 SOL", sub: "incl. upload" },
  { label: "Network", value: "Mainnet-Beta", sub: "Helius RPC" },
];

const RECENT: Activity[] = [
  {
    id: "1",
    title: "Nyx #069 • H402",
    subtitle: "Minted 2m ago • MasterEdition",
    href: "https://solscan.io",
  },
  {
    id: "2",
    title: "Nyx #068 • H402",
    subtitle: "Minted 23m ago",
    href: "https://solscan.io/",
  },
  { id: "3", title: "Nyx #067 • H402", subtitle: "Minted 1h ago" },
];

export default function StatsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stats</h1>
        <Link href="/mint" className="cta cta-primary px-4 py-2">
          Mint Agent
        </Link>
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {KPIS.map((k) => (
          <div
            key={k.label}
            className="glass p-5 rounded-2xl border border-white/10 bg-white/5"
          >
            <div className="text-sm opacity-70">{k.label}</div>
            <div className="mt-1 text-2xl font-semibold">{k.value}</div>
            {k.sub && <div className="mt-1 text-xs opacity-60">{k.sub}</div>}
          </div>
        ))}
      </section>

      {/* Charts + Activity */}
      <section className="mt-8 grid md:grid-cols-2 gap-6">
        {/* Mint volume (placeholder area chart) */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mint Volume (24h)</h2>
          </div>
          <div className="mt-4 h-56 rounded-xl bg-white/5 grid place-items-center">
            <span className="text-sm opacity-60">
              N/A
            </span>
          </div>
          <p className="mt-3 text-xs opacity-60">
            Server action that aggregates
            your mints per hour.
          </p>
        </div>

        {/* Recent activity */}
        <div className="glass p-6 rounded-2xl border border-white/10">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <ul className="mt-4 space-y-3">
            {RECENT.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
              >
                {a.href ? (
                  <a
                    href={a.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline decoration-white/30 underline-offset-4"
                  >
                    {a.title}
                  </a>
                ) : (
                  <span className="font-medium">{a.title}</span>
                )}
                <div className="text-xs opacity-60 mt-1">{a.subtitle}</div>
              </li>
            ))}
          </ul>

          <div className="mt-4 text-right">
            <Link href="/docs" className="text-sm opacity-80 hover:opacity-100">
              How we compute stats →
            </Link>
          </div>
        </div>
      </section>

      {/* System health */}
      <section className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="text-sm opacity-70">Uploader</div>
          <div className="mt-1 text-xl font-semibold">Bundlr (Arweave)</div>
          <div className="mt-2 text-xs opacity-60">
            Node: <code>node1.bundlr.network</code>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="text-sm opacity-70">RPC Provider</div>
          <div className="mt-1 text-xl font-semibold">Helius</div>
          <div className="mt-2 text-xs opacity-60">
            {process.env.NEXT_PUBLIC_HELIUS_RPC
              ? "API key configured"
              : "No API key detected"}
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="text-sm opacity-70">Network</div>
          <div className="mt-1 text-xl font-semibold">Mainnet-Beta</div>
          <div className="mt-2 text-xs opacity-60">
            Program: <code>Token Program</code>
          </div>
        </div>
      </section>
    </main>
  );
}
