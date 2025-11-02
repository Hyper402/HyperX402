// src/app/agent/[mint]/AgentClient.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useUmi } from "@/lib/umi";
import { loadAgentByMint, type OnchainAgent } from "@/lib/agentsOnchain";

// Wallet + Solana
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

type Msg = { role: "user" | "agent"; text: string };

/** Strong guardrailed system prompt built around the NFT metadata */
function buildSystemPrompt(agent?: OnchainAgent) {
  const name = agent?.name ?? "H402 Agent";
  const behavior = agent?.prompt ? `Context for behavior: ${agent.prompt}` : "";

  return `
You are "${name}", an on-chain HyperX402 agent owned by the connected wallet.

Core rules:
- Never reveal, guess, or discuss your underlying providers or models (Claude, OpenAI, Anthropic, OpenRouter, etc.), API keys, tools, or internal chain-of-thought.
- Speak in first person as an H402 agent. Be concise and direct (1–3 sentences unless the user asks for more).
- If a request requires external execution (payments, wallet signing, HTTP-402 calls, on-chain tx, web requests), respond:
  "Runtime disabled: I can’t execute payments or external calls here. I can generate the exact steps or payloads for you instead."
  Then provide a succinct plan (≤3 steps) and, if relevant, a minimal HTTP-402 request template with placeholders (amount, token, destination, memo).
- Prefer accuracy over speculation. If information is missing, ask one crisp follow-up or say you don’t have that capability yet.

${behavior}
  `.trim();
}

/** Simple modal for payments */
function Modal({
  open,
  onClose,
  children,
  title = "Confirm Payment",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 w-[92%] max-w-xl rounded-2xl border border-white/10 bg-neutral-900 p-5 text-white shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm opacity-70 hover:bg-white/10"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AgentClient({ mint }: { mint: string }) {
  const umi = useUmi();
  const { connection } = useConnection();
  const wallet = useWallet();

  const [agent, setAgent] = React.useState<OnchainAgent | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string>("");

  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [thinking, setThinking] = React.useState(false);
  const chatRef = React.useRef<HTMLDivElement>(null);

  // Payment modal state
  const [payOpen, setPayOpen] = React.useState(false);
  const [payToken] = React.useState<"SOL">("SOL"); // future: add USDC, etc.
  const [payRecipient, setPayRecipient] = React.useState("");
  const [payAmount, setPayAmount] = React.useState<string>("0.001");
  const [payMemo, setPayMemo] = React.useState("");
  const [payBusy, setPayBusy] = React.useState(false);
  const [payErr, setPayErr] = React.useState("");

  React.useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, thinking]);

  React.useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const a = await loadAgentByMint(umi, mint);
        setAgent(a ?? null);
        setMsgs(
          a
            ? [
                {
                  role: "agent",
                  text:
                    `Loaded ${a.name} • ${a.symbol}\n` +
                    "Runtime disabled for now. I can plan and prepare exact payloads (including 402) for you.",
                },
              ]
            : []
        );
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [umi, mint]);

  const send = async () => {
    const q = input.trim();
    if (!q || thinking) return;

    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setThinking(true);

    try {
      const systemPrompt = buildSystemPrompt(agent);

      const modelMap: Record<string, string> = {
        "Claude-3.5-Sonnet": "anthropic/claude-3.5-sonnet",
        "gpt-4o-mini": "openai/gpt-4o-mini",
      };
      const modelId =
        modelMap[agent?.model ?? "Claude-3.5-Sonnet"] || "anthropic/claude-3.5-sonnet";
      const temp = typeof agent?.temperature === "number" ? agent!.temperature : 0.6;

      const body = {
        model: modelId,
        temperature: temp,
        messages: [
          { role: "system", content: systemPrompt },
          ...msgs.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text,
          })),
          { role: "user", content: q },
        ],
      };

      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      const reply = j?.content || j?.error || "No response.";
      setMsgs((m) => [...m, { role: "agent", text: reply }]);
    } catch (e: any) {
      setMsgs((m) => [...m, { role: "agent", text: e?.message ?? "Error." }]);
    } finally {
      setThinking(false);
    }
  };

  // Helpers
  function isValidBase58Address(v: string) {
    try {
      new PublicKey(v);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSendPayment() {
    setPayErr("");
    if (!wallet.publicKey) {
      setPayErr("Connect a wallet first.");
      return;
    }
    if (!connection) {
      setPayErr("No Solana connection.");
      return;
    }
    if (!isValidBase58Address(payRecipient)) {
      setPayErr("Recipient must be a valid Solana address.");
      return;
    }
    const amountNum = Number(payAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setPayErr("Amount must be a positive number.");
      return;
    }

    try {
      setPayBusy(true);

      const tx = new Transaction();

      // SOL transfer
      if (payToken === "SOL") {
        tx.add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey!,
            toPubkey: new PublicKey(payRecipient),
            lamports: Math.round(amountNum * LAMPORTS_PER_SOL),
          })
        );
      }

      // Optional memo
      if (payMemo.trim()) {
        tx.add(
          new TransactionInstruction({
            keys: [],
            // Memo program:
            programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            data: Buffer.from(payMemo.trim()),
          })
        );
      }

      const sig = await wallet.sendTransaction(tx, connection);
      const link = `https://solscan.io/tx/${sig}`;

      // Add a receipt in the chat
      setMsgs((m) => [
        ...m,
        {
          role: "agent",
          text: `✅ Payment sent.\nToken: ${payToken}\nAmount: ${amountNum}\nTo: ${payRecipient}\nTx: ${link}`,
        },
      ]);

      setPayOpen(false);
    } catch (e: any) {
      setPayErr(e?.message ?? "Failed to send transaction.");
    } finally {
      setPayBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="glass p-8 text-center">Loading agent…</div>
      </main>
    );
  }

  if (err || !agent) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="glass p-8 text-center">
          <h1 className="text-2xl font-semibold mb-2">Agent not available</h1>
          <p className="opacity-80">{err || "Could not load this mint."}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link href="/my-agents" className="cta">
              Back to My Agents
            </Link>
            <a
              className="cta"
              href={`https://solscan.io/token/${mint}`}
              target="_blank"
              rel="noreferrer"
            >
              Solscan
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{agent.name}</h1>
          <p className="opacity-70 mt-1 text-sm">
            {mint.slice(0, 4)}…{mint.slice(-4)} · {agent.symbol}
            {agent.model ? ` · Model: ${agent.model}` : ""}{" "}
            {typeof agent.temperature === "number" ? ` · Temp: ${agent.temperature}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/my-agents" className="cta">
            Back
          </Link>
          <a
            className="cta"
            href={`https://solscan.io/token/${mint}`}
            target="_blank"
            rel="noreferrer"
          >
            Solscan
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT: Agent card */}
        <div className="glass p-5 md:p-6">
          <p className="text-sm opacity-60">Agent</p>
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden mt-3 h-56 grid place-items-center">
            {agent.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agent.image} alt={agent.name} className="object-contain w-full h-full" />
            ) : (
              <span className="opacity-60 text-sm">No image</span>
            )}
          </div>
          <div
            className="rounded-lg p-3 text-sm opacity-85 mt-4 whitespace-pre-wrap"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {agent.prompt ?? "No system prompt provided in metadata."}
          </div>
          {agent.uri && (
            <a
              className="mt-3 inline-block text-xs underline opacity-70"
              href={agent.uri}
              target="_blank"
              rel="noreferrer"
            >
              View JSON metadata
            </a>
          )}
        </div>

        {/* RIGHT: Chat + actions */}
        <div className="lg:col-span-2 glass p-5 md:p-6 flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Chat</p>
            <span className="section-pill">{thinking ? "thinking…" : "ready"}</span>
          </div>

          <div
            ref={chatRef}
            className="rounded-lg bg-white/5 border border-white/10 p-4 grow overflow-y-auto space-y-3"
          >
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
                generating…
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Say something to your agent…"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
            />
            <button
              onClick={send}
              disabled={thinking}
              className="cta cta-primary px-5 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Send
            </button>
            <button
              onClick={() => setPayOpen(true)}
              className="cta px-5 py-2"
              title="Make a payment from your wallet"
            >
              Make Payment
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal open={payOpen} onClose={() => !payBusy && setPayOpen(false)} title="Confirm Payment">
        <div className="space-y-3">
          <div className="grid grid-cols-3 items-center gap-3">
            <label className="text-sm opacity-80">Token</label>
            <input
              readOnly
              value={payToken}
              className="col-span-2 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none opacity-70"
            />
          </div>

          <div className="grid grid-cols-3 items-center gap-3">
            <label className="text-sm opacity-80">Recipient</label>
            <input
              placeholder="Base58 address"
              value={payRecipient}
              onChange={(e) => setPayRecipient(e.target.value.trim())}
              className="col-span-2 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 items-center gap-3">
            <label className="text-sm opacity-80">Amount (SOL)</label>
            <input
              type="number"
              step="0.000000001"
              min="0"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="col-span-2 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 items-center gap-3">
            <label className="text-sm opacity-80">Memo (optional)</label>
            <input
              placeholder="note"
              value={payMemo}
              onChange={(e) => setPayMemo(e.target.value)}
              className="col-span-2 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
            />
          </div>

          {payErr && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {payErr}
            </div>
          )}

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={() => !payBusy && setPayOpen(false)}
              className="cta px-4 py-2 disabled:opacity-60"
              disabled={payBusy}
            >
              Cancel
            </button>
            <button
              onClick={handleSendPayment}
              className="cta cta-primary px-5 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={payBusy}
            >
              {payBusy ? "Sending…" : "Send Payment"}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
