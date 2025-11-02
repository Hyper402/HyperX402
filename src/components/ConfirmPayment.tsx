// src/components/ConfirmPayment.tsx
"use client";

import React from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { PaymentIntent } from "@/lib/payClient";
import { sendSOL, sendSPL } from "@/lib/payClient";

type Props = {
  open: boolean;
  initial?: PaymentIntent | null;
  onClose: () => void;
  onSuccess: (sig: string, intent: PaymentIntent) => void;
};

export default function ConfirmPayment({ open, initial, onClose, onSuccess }: Props) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [form, setForm] = React.useState<PaymentIntent>(
    initial ?? { token: "SOL", to: "", amount: 0.001 }
  );
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  if (!open) return null;

  const change = (k: keyof PaymentIntent, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    try {
      setErr("");
      if (!publicKey) throw new Error("Connect wallet first");
      setBusy(true);
      const maxSol = 0.25;
      if (form.token === "SOL" && form.amount > maxSol) {
        throw new Error(`Amount exceeds max ${maxSol} SOL`);
      }

      let sig: string;
      if (form.token === "SOL") {
        sig = await sendSOL(connection, publicKey, sendTransaction, form);
      } else {
        if (!form.decimals && form.token !== "SOL") throw new Error("Decimals required for SPL");
        sig = await sendSPL(connection, publicKey, sendTransaction, form);
      }
      onSuccess(sig, form);
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Confirm Payment</h3>
          <button onClick={onClose} className="opacity-70 hover:opacity-100">✕</button>
        </div>

        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs opacity-70">Token</label>
              <input
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
                value={form.token}
                onChange={(e) => change("token", e.target.value.trim())}
                placeholder='SOL or SPL mint'
              />
            </div>
            {form.token !== "SOL" && (
              <div>
                <label className="text-xs opacity-70">Decimals</label>
                <input
                  type="number"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
                  value={form.decimals ?? 6}
                  onChange={(e) => change("decimals", Number(e.target.value))}
                  placeholder="e.g., 6"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs opacity-70">Recipient</label>
            <input
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
              value={form.to}
              onChange={(e) => change("to", e.target.value.trim())}
              placeholder="Base58 address"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs opacity-70">Amount</label>
              <input
                type="number"
                min={0}
                step="any"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
                value={form.amount}
                onChange={(e) => change("amount", Number(e.target.value))}
                placeholder="0.001"
              />
            </div>
            <div>
              <label className="text-xs opacity-70">Memo (optional)</label>
              <input
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
                value={form.memo ?? ""}
                onChange={(e) => change("memo", e.target.value)}
                placeholder="note"
              />
            </div>
          </div>

          {err && (
            <div className="text-sm text-red-300 border border-red-500/30 bg-red-500/10 rounded-lg px-3 py-2">
              {err}
            </div>
          )}

          <div className="mt-2 flex gap-2">
            <button onClick={submit} disabled={busy} className="cta cta-primary px-4 py-2 disabled:opacity-60">
              {busy ? "Sending…" : "Send Payment"}
            </button>
            <button onClick={onClose} className="cta px-4 py-2">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
