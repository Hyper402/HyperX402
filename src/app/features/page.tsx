// src/app/features/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features • HyperX402",
  description:
    "Mint AI agents as NFTs. On-chain identity, Arweave storage, and HTTP-402 payment rails.",
};

export default function FeaturesPage() {
  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section className="glass border-white/10 bg-white/[0.03] rounded-2xl p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-3">
        {title}
      </h2>
      <div className="text-sm md:text-base leading-relaxed opacity-90">
        {children}
      </div>
    </section>
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <header className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-bold">
          Hyper<span className="text-[#9b5cff]">X402</span> Features
        </h1>
        <p className="mt-2 opacity-80">
          Early-access vision: mint AI agents as NFTs, wire them to payments,
          and let them act on-chain.
        </p>
      </header>

      <div className="grid gap-6 md:gap-8">
        <Section title="🧠 Agent-as-NFT Architecture">
          <p>
            Each carries an AI identity layer
            (model/temperature/prompt). Your agent can be referenced by any app,
            upgraded over time, and proven on-chain.
          </p>
        </Section>

        <Section title="⚙️ On-Chain Intelligence Core">
          <p>
            Intelligence parameters live on Solana for portability and
            verifiability. You’re minting a tokenized “mind” that any dApp can
            read without trusting a server.
          </p>
        </Section>

        <Section title="💳 HTTP-402 Payment Rails (Soon™)">
          <p>
            Rolling out a 402 paywall layer so agents can pay per request:
            AI inferences, API calls, gated content. Micro-transactions =
            programmable UX.
          </p>
        </Section>

        <Section title="🧬 Modular Upgrades & Traits">
          <p>
            Upcoming Module NFTs let you slot in skills: DeFi instincts,
            content-creation modes, even autonomous trading behaviors. Equip,
            trade, evolve.
          </p>
        </Section>

        <Section title="☁️ Arweave + Helius Integration">
          <p>
            Permanent storage via Bundlr/Arweave and fast mainnet confirmations
            with Helius RPC. Full browser flow, no servers needed.
          </p>
        </Section>

        <Section title="🧩 Open SDK (Q1 2026)">
          <p>
            A lightweight SDK so builders can launch games, tools, and live
            services around agent NFTs. Spin up AI colonies, guilds, or custom
            runtimes.
          </p>
        </Section>
      </div>

      <footer className="mt-10 text-xs opacity-60">
        HyperX402 is pre-release software. Features marked “Soon™” are on the
        public roadmap.
      </footer>
    </main>
  );
}
