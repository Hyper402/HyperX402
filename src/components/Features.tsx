"use client";

export function Features() {
  return (
    <section className="section">
      <div className="section-wash" />
      <div className="mx-auto max-w-7xl px-4 relative z-[1]">
        <h2 className="text-3xl md:text-4xl font-bold">Features</h2>
        <p className="opacity-70 mt-2">Everything you need to launch and monetize agents on Solana.</p>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card
            title="Agent-as-NFT"
            desc="Ownable, tradable identity with embedded AI config (model, temperature, system prompt)."
          />
          <Card
            title="Arweave Metadata"
            desc="Immutable image + JSON via Bundlr. Trustworthy records; no silent edits."
          />
          <Card
            title="402-Ready"
            desc="Plug agents into x402 micro-payments: prepaid meters or pay-per-request receipts."
          />
        </div>
      </div>
    </section>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="hx-card p-6">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="opacity-80 mt-2">{desc}</p>
    </div>
  );
}
