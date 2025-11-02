// src/app/docs/page.tsx
"use client";

import React from "react";
import Link from "next/link";

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.9em]">{children}</code>
);

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="glass rounded-2xl border border-white/10 bg-white/5 p-6">
    <h2 className="text-lg font-semibold">{title}</h2>
    <div className="prose prose-invert prose-sm mt-3 max-w-none">{children}</div>
  </section>
);

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Docs</h1>
        <Link href="/mint" className="cta cta-primary px-4 py-2">Mint Agent</Link>
      </div>

      <div className="grid gap-6">
        {/* 01 — Manifesto */}
        <Block title="HyperX402: Agents you can own, route, and monetize">
          <p>
            The internet still treats AI like a SaaS login. HyperX402 turns agents into{" "}
            <strong>ownable endpoints</strong>: mint an Agent as an NFT, embed its behavior, and plug it
            straight into <Code>402</Code> rails (pay-per-request). Your agent isn’t a tab. It’s an asset,
            a service, and a node in your personal compute economy.
          </p>
        </Block>

        {/* 02 — What ships today (MVP) */}
        <Block title="What ships in v0.1 (MVP)">
          <ul>
            <li><strong>Minting</strong> — Create a Non-Fungible Agent on Solana with image + JSON pinned.</li>
            <li>
              <strong>Live agents</strong> — Open the agent page and chat. LLM is routed via your server
              (<Code>/api/chat</Code>) using OpenRouter/Anthropic.
            </li>
            <li>
              <strong>User-signed payments</strong> — A friendly <em>Make Payment</em> modal lets the owner
              send SOL to any address. Tx is signed in the owner’s wallet; a receipt link to Solscan is posted back to chat.
            </li>
          </ul>
          <p className="text-xs opacity-70">
            Note: explorers and metadata indexers can lag. If you just minted, give it a minute before expecting
            attributes/external links to appear on Solscan.
          </p>
        </Block>

        {/* 03 — What you actually mint */}
        <Block title="What you actually mint">
          <ul>
            <li>
              A <strong>Non-Fungible Agent</strong>: an NFT that carries its <em>Agent DNA</em> (model,
              temperature, system prompt, extras).
            </li>
            <li>
              A <strong>routable identity</strong>: any app can read the NFT metadata and boot the same runtime the owner defined.
            </li>
            <li>
              A <strong>402-aware surface</strong>: bill per request, meter time, or whitelist holders—no centralized gatekeeper.
            </li>
          </ul>
        </Block>

        {/* 04 — Flow */}
        <Block title="How it works (3 steps)">
          <ol>
            <li><strong>Define</strong> — Pick model, temperature, and system prompt.</li>
            <li><strong>Anchor</strong> — We pin image + JSON to Arweave via Bundlr and mint on Solana.</li>
            <li>
              <strong>Route</strong> — Your runtime reads the NFT, boots the agent, and (optionally) charges via HTTP{" "}
              <Code>402</Code>.
            </li>
          </ol>
          <p className="mt-2 text-xs opacity-70">
            Under the hood: Solana (ownership), Arweave (permanence), Helius (RPC). You don’t need the details to use it—only to scale it.
          </p>
        </Block>

        {/* 05 — Payments V1 */}
        <Block title="Payments v1 — User-signed (no server keys)">
          <p>
            Our initial payment path is simple and safe: <strong>the user signs and sends</strong> the transfer from their wallet.
            The agent proposes, but the human disposes.
          </p>
          <ol>
            <li>Open an agent and click <strong>Make Payment</strong>.</li>
            <li>Fill <em>Recipient</em>, <em>Amount</em> (SOL), and optional memo.</li>
            <li>Approve the tx in your wallet. We post the Solscan link back into the chat as the receipt.</li>
          </ol>
          <p className="text-xs opacity-70">
            Coming soon: token picker (USDC), payment intent chat extraction → auto-prefilled modal, and HTTP-402 receipts.
          </p>
        </Block>

        {/* 06 — Agent DNA / Metadata */}
        <Block title="Agent DNA (on-chain pointer → off-chain brain)">
          <p>The NFT points to a JSON with a minimal schema. Current runtime reads either the new fields or legacy <Code>x402_agent</Code>:</p>
          <pre className="rounded-xl bg-black/40 p-4 text-xs overflow-x-auto">{`{
  "name": "Nyx #001 • H402",
  "symbol": "H402",
  "description": "You are Nyx, concise and confident.",        // used as system prompt in v0.1
  "image": "ar://<image-id>",
  "external_url": "https://hyperx402.app/agent/<mint>",
  "attributes": [
    { "trait_type": "model", "value": "Claude-3.5-Sonnet" },
    { "trait_type": "temperature", "value": 0.6 }
  ],

  // legacy (still parsed if present)
  "x402_agent": {
    "model": "Claude-3.5-Sonnet",
    "temperature": 0.6,
    "system_prompt": "You are Nyx, concise and confident.",
    "version": "v0.1"
  }
}`}</pre>
          <p className="text-xs opacity-70">
            Keep it lean. Everything the runtime needs, nothing it doesn’t. Upgrades land as new mints or versioned metadata.
          </p>
        </Block>

        {/* 07 — Quickstart */}
        <Block title="Quickstart">
          <ul>
            <li><strong>Create</strong>: Connect wallet → <Link href="/mint">Mint Agent</Link>.</li>
            <li><strong>Use</strong>: Open the agent page, chat, or integrate by mint address in your app.</li>
            <li><strong>Pay</strong>: Click <em>Make Payment</em> for user-signed SOL transfers (receipt in chat).</li>
            <li>
              <strong>Monetize</strong>: Enforce holder access or charge per call/time window using HTTP <Code>402</Code> (next).
            </li>
          </ul>
        </Block>

        {/* 08 — Developer notes */}
        <Block title="Developer notes (env & routes)">
          <ul>
            <li>
              <strong>Env</strong> — <Code>NEXT_PUBLIC_HELIUS_RPC</Code>, <Code>NEXT_PUBLIC_SOLANA_RPC</Code> (fallback),
              <Code>NEXT_PUBLIC_BUNDLR_NODE</Code>.<br />
              Server: <Code>OPENROUTER_API_KEY</Code> (or provider key used by <Code>/api/chat</Code>).
            </li>
            <li>
              <strong>Routes</strong> — <Code>/api/chat</Code> proxies LLM. Payments are wallet-native (no server keys) in v0.1.
            </li>
            <li>
              <strong>Indexing</strong> — metadata/attributes on explorers can take a minute to appear; the UI already shows a heads-up.
            </li>
          </ul>
        </Block>

        {/* 09 — Economics */}
        <Block title="Economics (the fun part)">
          <ul>
            <li><strong>Own your interface</strong>: agents are brands. Price the vibe. Trade the endpoint.</li>
            <li><strong>Creator rails</strong>: route tips/fees; optionally share to a collection treasury.</li>
            <li><strong>Programmable access</strong>: allowlists, staking for premium modes, time-boxed leases for teams.</li>
          </ul>
        </Block>

        {/* 10 — Roadmap */}
        <Block title="Roadmap">
          <ul>
            <li><strong>Verified Collections</strong> — unified crest for H402 agents.</li>
            <li><strong>Public Registry</strong> — searchable index by skill, latency, price, owner.</li>
            <li><strong>Receipts & Meters</strong> — native <Code>402</Code> receipts, prepaid meters, storefronts.</li>
            <li><strong>Agent-signed 402</strong> — service wallets + policy limits + server receipt signing.</li>
          </ul>
        </Block>

        {/* 11 — FAQ */}
        <Block title="FAQ">
          <p><strong>Is the agent itself on-chain?</strong> Identity & config are. Inference runs off-chain where it’s fast.</p>
          <p><strong>Why don’t I see attributes on Solscan yet?</strong> Indexers lag. Wait a minute; hit “Refresh” in app if needed.</p>
          <p><strong>Can I update an agent?</strong> Mint a new version or point a manager-agent at a policy file.</p>
          <p><strong>Which wallets work?</strong> Phantom, Backpack, Solflare, Ledger (via adapters) with message/tx signing.</p>
          <p><strong>Do I need a server?</strong> Not to mint. You’ll use a tiny server for <Code>/api/chat</Code> (and for 402 later).</p>
        </Block>

        {/* 12 — Stats methodology */}
        <Block title="How we compute stats">
          <p className="mb-2">
            We keep stats simple, auditable, and reproducible. Sources: (1) on-chain program logs via <Code>Helius</Code>,
            (2) Bundlr storage receipts, (3) lightweight client beacons for UX timing.
          </p>

          <h3 className="mt-4 text-base font-semibold">Data sources</h3>
          <ul>
            <li><strong>On-chain mints</strong> — parse <Code>@metaplex-foundation/mpl-token-metadata</Code> <Code>CreateV1</Code>.</li>
            <li><strong>Storage</strong> — sum uploaded bytes + Bundlr fees at upload time.</li>
            <li><strong>Client timings</strong> — “mint_attempt/confirmed” beacons (UUID + timestamps, no PII).</li>
          </ul>

          <h3 className="mt-4 text-base font-semibold">Metrics & formulas</h3>
          <ul>
            <li><strong>Total Mints</strong> = count of successful <Code>CreateV1</Code> (unique mints).</li>
            <li><strong>Success Rate</strong> = <Code>successful_mints / attempted_mints</Code>.</li>
            <li><strong>Median TTF</strong> = median of <Code>confirmedAt - sentAt</Code>.</li>
            <li><strong>Storage Used</strong> = bytes(image) + bytes(metadata.json).</li>
            <li><strong>Storage Cost</strong> = sum Bundlr <Code>finalizedPrice</Code> (or quoted <Code>price * bytes</Code>).</li>
            <li><strong>Model Mix</strong> = frequency of <Code>attributes.model</Code> in metadata.</li>
          </ul>

          <h3 className="mt-4 text-base font-semibold">Event schema (client)</h3>
          <pre className="rounded-xl bg-black/40 p-4 text-xs overflow-x-auto">{`// POST /api/telemetry
{
  "id": "uuid-v4",
  "t": "mint_attempt" | "mint_confirmed",
  "wallet": "7NXw...GigT",
  "mint": "E1M5...mpna",
  "sentAt": 1730402112451,
  "confirmedAt": 1730402119873
}`}</pre>

          <p className="mt-4 text-xs opacity-70">
            TL;DR: counts from chain, bytes from Bundlr, timing from tiny client beacons. Everything cross-checkable.
          </p>
        </Block>

        <div className="mt-2 text-sm opacity-70">
          Ready to mint your first operative?{" "}
          <Link href="/mint" className="underline decoration-dotted">Deploy an Agent</Link>.
        </div>
      </div>
    </main>
  );
}
