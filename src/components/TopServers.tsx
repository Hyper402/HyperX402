"use client";

const mockServers = [
  { name: "api.canza.app", txns: "105.18K", volume: "$10.65K", buyers: "5.32K", latest: "~1h ago" },
  { name: "x402.arvos.xyz", txns: "58.05K", volume: "$5.81K", buyers: "5.81K", latest: "13m ago" },
  { name: "402coin.xyz", txns: "54.3K", volume: "$4.40K", buyers: "17", latest: "13m ago" },
  { name: "ainalyst-api.xyz", txns: "52.85K", volume: "$2.75K", buyers: "108", latest: "~1h ago" },
  { name: "slotx402.fun", txns: "43.78K", volume: "$4.83K", buyers: "2.54K", latest: "10m ago" },
];

export function TopServers() {
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold">Top Servers</h2>
        <span className="section-pill">Past 24 h</span>
      </div>
      <p className="opacity-70 mb-8">
        Top addresses that have received x402 transfers and are listed in the Bazaar.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-white/10">
              <th className="py-3 px-4">Server</th>
              <th className="py-3 px-4">Txns</th>
              <th className="py-3 px-4">Volume</th>
              <th className="py-3 px-4">Buyers</th>
              <th className="py-3 px-4">Latest</th>
            </tr>
          </thead>
          <tbody>
            {mockServers.map((srv) => (
              <tr
                key={srv.name}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-4">{srv.name}</td>
                <td className="py-3 px-4">{srv.txns}</td>
                <td className="py-3 px-4">{srv.volume}</td>
                <td className="py-3 px-4">{srv.buyers}</td>
                <td className="py-3 px-4">{srv.latest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
