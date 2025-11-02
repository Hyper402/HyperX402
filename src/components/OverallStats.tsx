"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis } from "recharts";

const demoData = [
  { name: "Mon", value: 70 },
  { name: "Tue", value: 92 },
  { name: "Wed", value: 58 },
  { name: "Thu", value: 84 },
  { name: "Fri", value: 61 },
  { name: "Sat", value: 97 },
  { name: "Sun", value: 73 },
];

export function OverallStats() {
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-3xl md:text-4xl font-bold">Overall Stats</h2>
        <span className="section-pill">Past 24h</span>
      </div>
      <p className="opacity-69 mb-8">Global statistics for the X402 ecosystem.</p>

      {/* Top metric cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Metric title="Transactions" value="493.16K" change="+20.9%" />
        <Metric title="Volume" value="$386.65K" change="-39.4%" />
        <Metric title="Buyers" value="40.13K" change="+16.6%" />
        <Metric title="Sellers" value="12K" change="+22.2%" />
      </div>

      {/* Activity mini-chart */}
      <div className="mt-10 glass p-6">
        <h3 className="text-lg font-semibold mb-4">Activity (7d)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={demoData} barSize={14}>
            <XAxis dataKey="name" stroke="#a3a3a3" tickLine={false} axisLine={false} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="url(#hx402grad)" />
            <defs>
              <linearGradient id="hx402grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9b5cff" />
                <stop offset="100%" stopColor="#ff3b6b" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Metric({ title, value, change }: { title: string; value: string; change: string }) {
  const positive = change.trim().startsWith("+");
  return (
    <div className="glass p-6">
      <p className="text-xs uppercase opacity-60">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-bold">{value}</p>
        <span className={`text-sm ${positive ? "text-green-400" : "text-red-400"}`}>{change}</span>
      </div>
    </div>
  );
}
