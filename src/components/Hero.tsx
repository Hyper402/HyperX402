"use client";

import Image from "next/image";
import Link from "next/link";
import { ResponsiveContainer, BarChart, Bar, XAxis } from "recharts";
import { useEffect, useRef } from "react";

/** Toggle via env: NEXT_PUBLIC_LIVE_STATS=1 to show real numbers without blur labels */
const LIVE = process.env.NEXT_PUBLIC_LIVE_STATS === "1";

/* Demo chart data for the mini bar chart */
const demoData = [
  { name: "Mon", value: 70 },
  { name: "Tue", value: 92 },
  { name: "Wed", value: 58 },
  { name: "Thu", value: 84 },
  { name: "Fri", value: 61 },
  { name: "Sat", value: 97 },
  { name: "Sun", value: 73 },
];

/* Mock Top Servers table rows */
const mockServers = [
  { name: "api.canza.app",   txns: "105.18K", volume: "$10.65K", buyers: "5.32K", latest: "~1h ago" },
  { name: "x402.arvos.xyz",  txns: "58.05K",  volume: "$5.81K",  buyers: "5.81K", latest: "13m ago" },
  { name: "402coin.xyz",     txns: "54.3K",   volume: "$4.40K",  buyers: "17",    latest: "13m ago" },
  { name: "ainalyst-api.xyz",txns: "52.85K",  volume: "$2.75K",  buyers: "108",   latest: "~1h ago" },
  { name: "slotx402.fun",    txns: "43.78K",  volume: "$4.83K",  buyers: "2.54K", latest: "10m ago" },
];

/* Raindrop animation (lightweight) */
function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    let drops: { x: number; y: number; speed: number; len: number }[] = [];
    const COUNT = 110;

    const resize = () => {
      c.width = innerWidth;
      c.height = innerHeight;
      drops = Array.from({ length: COUNT }, () => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        speed: 2 + Math.random() * 4,
        len: 12 + Math.random() * 24,
      }));
    };
    resize();
    addEventListener("resize", resize);

    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.strokeStyle = "rgba(255,255,255,0.17)";
      ctx.lineWidth = 1;
      for (const d of drops) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.len);
        ctx.stroke();
        d.y += d.speed;
        if (d.y > c.height) {
          d.y = -20;
          d.x = Math.random() * c.width;
        }
      }
      requestAnimationFrame(tick);
    };
    tick();
    return () => removeEventListener("resize", resize);
  }, []);
  return <canvas ref={canvasRef} className="rain-canvas" />;
}

/** Subtle animated overlay for placeholder state */
function BlurStripe() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute -inset-x-16 -top-6 h-24 blur-2xl opacity-30 animate-pulse"
        style={{
          background:
            "linear-gradient(90deg, rgba(155,92,255,0.35) 0%, rgba(255,59,107,0.35) 100%)",
        }}
      />
    </div>
  );
}

export function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);

  // Mouse parallax + tiny scroll drift for the character group
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    let targetX = 0,
      targetY = 0;
    let curX = 0,
      curY = 0;

    const onMove = (e: MouseEvent) => {
      const cx = innerWidth / 2;
      const cy = innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      targetX = dx * 10;
      targetY = dy * 8;
    };

    const onScroll = () => {
      const y = scrollY;
      targetY += ((y % 200) / 200) * 1.5;
    };

    const animate = () => {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      el.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* background animation */}
      <RainCanvas />
      <div className="absolute inset-0 bg-black/18 pointer-events-none" />

      {/* centered watermark + flowing overlay */}
      <div className="hero-stage">
        <div ref={wrapRef} className="hero-figure-wrap">
          <div className="hero-halo" aria-hidden="true" />
          <Image
            src="/nyxv2.png"
            alt="Nyx"
            width={2000}
            height={2000}
            className="hero-figure select-none pointer-events-none object-contain"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* main content */}
      <div className="relative z-[1] mx-auto max-w-7xl px-4 pt-28 pb-28">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* LEFT – headline */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="badge">
                <span className="badge-dot" />
                Composable
              </span>
              <span className="badge">On-chain</span>
              <span className="badge">Solana</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
              Mint <span style={{ color: "#b795ff" }}>Hyper Agents</span>.
              <br /> Power the <span style={{ color: "#ff6b8a" }}>402</span> Economy.
            </h1>

            <p className="mt-5 opacity-80 max-w-xl">
              Create AI agents as NFTs with embedded config. Deploy anywhere and plug into 402
              payments when you’re ready.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/mint" className="cta cta-primary">
                Mint Agent
              </Link>
              <Link href="/demo" className="cta">
                Live Demo
              </Link>
            </div>

            <div className="caption-row">
              <span className="caption-chip">
                <span className="caption-dot" />
                Backed by Solana speed
              </span>
              <span className="caption-chip">Arweave metadata via Bundlr</span>
              <span className="caption-chip">0% royalties</span>
            </div>
          </div>

          {/* RIGHT – preview card */}
          <div className="relative">
            <div className="glass-soft w-full md:w-[520px] p-6 md:ml-auto">
              <p className="text-sm opacity-60">Preview</p>
              <h3 className="mt-1 text-xl font-semibold">User #001 · H402</h3>
              <p className="mt-1 text-xs opacity-60">Model: Claude-3.5-Sonnet · Temp: 0.6</p>

              <div className="mt-4 grid gap-3">
                <div
                  className="rounded-lg p-3 text-sm opacity-85"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  System prompt goes here…
                </div>
                <div className="flex gap-3">
                  <Link href="/mint" className="cta cta-primary flex-1 text-center">
                    Mint Agent NFT
                  </Link>
                  <Link href="/metadata" className="cta flex-1 text-center">
                    View Metadata
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="Agent-as-NFT"
            desc="Ownable, tradable identity with embedded AI config (model, temperature, system prompt)."
          />
          <FeatureCard
            title="Arweave Metadata"
            desc="Immutable image + JSON via Bundlr. Trustworthy records; no silent edits."
          />
          <FeatureCard
            title="402-Ready"
            desc="Plug agents into x402 micro-payments: prepaid meters or pay-per-request receipts."
          />
        </div>

        {/* OVERALL STATS + TOP SERVERS */}
        <div className="mt-24 space-y-16">
          {/* Overall Stats */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl md:text-4xl font-bold">Overall Stats</h2>
              <span className="section-pill">Past 24h</span>
              {!LIVE && (
                <span className="ml-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs opacity-80">
                  Simulated preview — Live sync soon
                </span>
              )}
            </div>
            <p className="opacity-70 mb-8">
              Global statistics for the X402 ecosystem{LIVE ? "." : " (U w U)."}
            </p>

            <div className="grid md:grid-cols-4 gap-6">
              <Metric title="Transactions" value={LIVE ? "493.16K" : "—"} change={LIVE ? "+20.9%" : "soon"} live={LIVE} />
              <Metric title="Volume"       value={LIVE ? "$386.65K" : "—"} change={LIVE ? "-39.4%" : "soon"} live={LIVE} />
              <Metric title="Buyers"       value={LIVE ? "40.13K" : "—"} change={LIVE ? "+16.6%" : "soon"} live={LIVE} />
              <Metric title="Sellers"      value={LIVE ? "12K"    : "—"} change={LIVE ? "+22.2%" : "soon"} live={LIVE} />
            </div>

            <div className="mt-10 glass p-6 relative overflow-hidden">
              {!LIVE && <BlurStripe />}
              <div className={!LIVE ? "opacity-60 pointer-events-none select-none" : ""}>
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
              {!LIVE && (
                <p className="absolute bottom-3 right-4 text-xs opacity-70">
                  Live stats via Helius/TensorHub coming soon
                </p>
              )}
            </div>
          </div>

          {/* Top Servers */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl md:text-4xl font-bold">Top Servers</h2>
              <span className="section-pill">Past 24 h</span>
              {!LIVE && (
                <span className="ml-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs opacity-80">
                  Simulated preview — Live indexing soon
                </span>
              )}
            </div>

            <p className="opacity-70 mb-8">
              Top addresses that have received x402 transfers and are listed in the Bazaar.
            </p>

            <div className="relative overflow-x-auto glass p-4">
              {!LIVE && <BlurStripe />}
              <table
                className={`w-full border-collapse text-sm ${
                  !LIVE ? "opacity-60 select-none pointer-events-none" : ""
                }`}
              >
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
                    <tr key={srv.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">{srv.name}</td>
                      <td className="py-3 px-4">{srv.txns}</td>
                      <td className="py-3 px-4">{srv.volume}</td>
                      <td className="py-3 px-4">{srv.buyers}</td>
                      <td className="py-3 px-4">{srv.latest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!LIVE && (
                <p className="absolute bottom-3 right-4 text-xs opacity-70">
                  Live data will populate as servers come online
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* reusable cards */
function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="glass p-6">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="opacity-80 mt-2">{desc}</p>
    </div>
  );
}

function Metric({
  title,
  value,
  change,
  live,
}: {
  title: string;
  value: string;
  change: string;
  live: boolean;
}) {
  const positive = change.trim().startsWith("+");
  return (
    <div className="glass p-6 relative overflow-hidden">
      {!live && <BlurStripe />}
      <p className="text-xs uppercase opacity-60">{title}</p>
      <div className={`${!live ? "opacity-60" : ""} mt-2 flex items-baseline gap-2`}>
        <p className="text-3xl font-bold">{value}</p>
        <span
          className={`text-sm ${live ? (positive ? "text-green-400" : "text-red-400") : "opacity-60"}`}
        >
          {change}
        </span>
      </div>
    </div>
  );
}
