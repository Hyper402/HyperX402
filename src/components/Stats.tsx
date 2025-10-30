"use client";

export function Stats() {
  return (
    <section className="section">
      <div className="section-wash" />
      <div className="mx-auto max-w-7xl px-4 relative z-[1]">
        <h2 className="text-3xl md:text-4xl font-bold">Network Stats</h2>
        <p className="opacity-70 mt-2">Live activity across the HyperX402 ecosystem (24h).</p>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <StatCard label="Transactions" value="—" sub="in the last 24 hours" />
          <StatCard label="Volume" value="—" sub="USD (24h)" />
          <StatCard label="Buyers" value="—" sub="unique (24h)" />
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass p-6">
      <p className="text-xs opacity-60 uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      {sub ? <p className="opacity-60 mt-1 text-sm">{sub}</p> : null}
    </div>
  );
}
