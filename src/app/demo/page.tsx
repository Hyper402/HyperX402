"use client";

import React from "react";

/* ------------------ Simple particle visualizer ------------------ */
function Visualizer({ energy }: { energy: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    let t = 0;

    const resize = () => {
      c.width = c.clientWidth;
      c.height = 180;
    };
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const draw = () => {
      t += 0.02;
      ctx.clearRect(0, 0, c.width, c.height);
      const bars = 32;
      const mid = c.height / 2;
      for (let i = 0; i < bars; i++) {
        const x = (i / (bars - 1)) * c.width;
        const amp = Math.sin(t + i * 0.35) * 0.5 + 0.5;
        const h = (amp * energy + 8);
        ctx.fillStyle = `rgba(155,92,255,0.35)`;
        ctx.fillRect(x - 3, mid - h, 6, h);
        ctx.fillStyle = `rgba(255,59,107,0.35)`;
        ctx.fillRect(x - 3, mid, 6, h);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [energy]);

  return <canvas ref={canvasRef} className="w-full rounded-lg bg-white/5 border border-white/10" />;
}

/* ------------------ 402 Meter ------------------ */
function Meter({
  credits,
  cost,
  onChange,
}: {
  credits: number;
  cost: number;
  onChange: (v: number) => void;
}) {
  const pct = Math.max(0, Math.min(100, (credits / 100) * 100));
  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold">402 Meter</p>
        <span className="text-sm opacity-70">Cost / msg: {cost.toFixed(2)}</span>
      </div>
      <div className="h-2 rounded bg-white/10 overflow-hidden">
        <div
          className="h-full"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, rgba(155,92,255,0.9), rgba(255,59,107,0.9))",
          }}
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          value={credits}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm opacity-80 w-14 text-right">{credits.toFixed(0)}%</span>
      </div>
      <p className="mt-2 text-xs opacity-70">
        This is a visual simulation. In production, the meter is prepaid (or auto-topped) and
        deductions happen on each successful request.
      </p>
    </div>
  );
}

/* ------------------ Agent Card ------------------ */
function AgentCard({
  name,
  model,
  temperature,
  prompt,
  img,
}: {
  name: string;
  model: string;
  temperature: number;
  prompt: string;
  img?: string;
}) {
  return (
    <div className="glass p-5 md:p-6">
      <p className="text-sm opacity-60">Preview</p>
      <h3 className="mt-1 text-xl font-semibold">{name || "Agent • H402"}</h3>
      <p className="mt-1 text-xs opacity-60">
        Model: {model} · Temp: {temperature.toFixed(2)}
      </p>

      <div className="mt-4 grid gap-3">
        <div
          className="rounded-lg p-3 text-sm opacity-85"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {prompt || "System prompt goes here…"}
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 grid place-items-center overflow-hidden h-56">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} className="object-contain w-full h-full" alt="agent" />
          ) : (
            <span className="opacity-60 text-sm">No image selected</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------ Chat Simulator ------------------ */
type Msg = { role: "user" | "assistant"; text: string };

function ChatBox({
  onDebit,
  cost,
  onEnergy,
}: {
  onDebit: (amt: number) => void;
  cost: number;
  onEnergy: (e: number) => void;
}) {
  const [input, setInput] = React.useState("");
  const [msgs, setMsgs] = React.useState<Msg[]>([
    { role: "assistant", text: "Spawned. How can I help?" },
  ]);
  const [thinking, setThinking] = React.useState(false);

  const send = async () => {
    if (!input.trim() || thinking) return;
    const userMsg = input.trim();
    setMsgs((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setThinking(true);
    onDebit(cost);
    onEnergy(Math.min(100, Math.max(10, userMsg.length / 2)));

    // Fake model latency + response
    const delay = 400 + Math.min(1500, userMsg.length * 20);
    await new Promise((r) => setTimeout(r, delay));
    const reply =
      userMsg.length < 20
        ? "Acknowledged. Give me a bit more detail."
        : "Got it. If this were live, I’d execute with your agent’s config and log a 402 receipt.";
    setMsgs((m) => [...m, { role: "assistant", text: reply }]);
    setThinking(false);
    onEnergy(35);
  };

  return (
    <div className="glass p-5 md:p-6 h-full">
      <p className="font-semibold mb-3">Agent Chat (Simulated)</p>
      <div className="rounded-lg bg-white/5 border border-white/10 p-3 h-64 overflow-y-auto space-y-3">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
              m.role === "user" ? "bg-white/10 ml-auto" : "bg-black/30"
            }`}
          >
            {m.text}
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-2 text-xs opacity-70">
            <span className="h-2 w-2 rounded-full bg-white/60 animate-pulse" />
            thinking…
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
        />
        <button onClick={send} className="cta cta-primary px-4 py-2">
          Send
        </button>
      </div>
      <p className="mt-2 text-xs opacity-70">
        Each message reduces the meter by the configured cost. Hook this up to your on-chain
        receipt/meter logic to go live.
      </p>
    </div>
  );
}

/* ------------------ Main Demo Page ------------------ */
export default function DemoPage() {
  const [name, setName] = React.useState("User #001 • H402");
  const [model, setModel] = React.useState("gpt-4o-mini");
  const [temperature, setTemperature] = React.useState(0.6);
  const [prompt, setPrompt] = React.useState(
    "You are User, a helpful on-chain agent. Keep answers concise and confident."
  );
  const [img, setImg] = React.useState<string>();
  const [credits, setCredits] = React.useState(100);
  const [cost, setCost] = React.useState(3);
  const [energy, setEnergy] = React.useState(40);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImg(URL.createObjectURL(f));
  };

  const debit = (amt: number) => setCredits((c) => Math.max(0, c - amt));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Live Demo</h1>
        <p className="opacity-80 mt-2">
          Spawn a demo agent, chat with it, and watch the 402 meter simulate deductions. No wallet
          or backend required.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Config */}
        <div className="glass p-5 md:p-6">
          <p className="font-semibold mb-4">Agent Config</p>

          <label className="block text-sm opacity-70 mb-1">Agent Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 mb-4 outline-none"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm opacity-70 mb-1">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
              >
                <option value="Claude-3.5-Sonnet">Claude-3.5-Sonnet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm opacity-70 mb-1">
                Temperature ({temperature.toFixed(2)})
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat((e.target as HTMLInputElement).value))}
                className="w-full"
              />
            </div>
          </div>

          <label className="block text-sm opacity-70 mt-4 mb-1">System Prompt</label>
          <textarea
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
          />

          <div className="mt-4">
            <label className="block text-sm opacity-70 mb-2">Agent Image</label>
            <input type="file" accept="image/png,image/jpeg" onChange={onPick} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="glass p-3">
              <label className="block text-sm opacity-70">Cost / msg</label>
              <input
                type="range"
                min={1}
                max={10}
                value={cost}
                onChange={(e) => setCost(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-sm opacity-80">{cost.toFixed(0)} credits</div>
            </div>

            <div className="glass p-3">
              <label className="block text-sm opacity-70">Seed Energy</label>
              <input
                type="range"
                min={10}
                max={100}
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-sm opacity-80">{energy}</div>
            </div>
          </div>
        </div>

        {/* Middle: Agent Card + Visualizer */}
        <div className="space-y-6">
          <AgentCard name={name} model={model} temperature={temperature} prompt={prompt} img={img} />
          <div className="glass p-5 md:p-6">
            <p className="font-semibold mb-3">Signal Visualizer</p>
            <Visualizer energy={energy} />
            <p className="text-xs opacity-70 mt-2">
              Bars swell with telemetry (latency,
              tokens, errors, etc.).
            </p>
          </div>
        </div>

        {/* Right: Chat + Meter */}
        <div className="space-y-6">
          <Meter credits={credits} cost={cost} onChange={setCredits} />
          <ChatBox onDebit={debit} cost={cost} onEnergy={setEnergy} />
        </div>
      </div>
    </main>
  );
}
