"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { mintAgentNFT } from "@/lib/mintAgent";

export default function MintPage() {
  const wallet = useWallet();

  // form state
  const [agentName, setAgentName] = React.useState("Nyx #001 • H402");
  const [model, setModel] = React.useState("gpt-4o-mini");
  const [temperature, setTemperature] = React.useState<number>(0.6);
  const [prompt, setPrompt] = React.useState(
    "You are Nyx, a helpful on-chain agent. Keep answers concise and confident."
  );
  const [imgFile, setImgFile] = React.useState<File | undefined>();
  const [imgPreview, setImgPreview] = React.useState<string>("");

  // tx state
  const [minting, setMinting] = React.useState(false);
  const [mintAddress, setMintAddress] = React.useState<string>("");
  const [err, setErr] = React.useState<string>("");

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImgFile(f);
    const url = URL.createObjectURL(f);
    setImgPreview(url);
  }

  async function onMint() {
    setErr("");
    setMintAddress("");
    if (!wallet.connected || !wallet.publicKey) {
      setErr("Connect your wallet first.");
      return;
    }
    try {
      setMinting(true);
      const mint = await mintAgentNFT(
        wallet,
        agentName.trim(),
        model,
        temperature,
        prompt.trim(),
        imgFile
      );
      setMintAddress(mint);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setMinting(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="cta px-4 py-2 inline-flex items-center gap-2 hover:bg-white/10">
          ← Back
        </Link>

        <WalletMultiButton className="!bg-white/10 !rounded-xl !border !border-white/10 hover:!bg-white/20" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEFT: form */}
        <div className="glass p-6">
          <h1 className="text-3xl font-bold mb-6">Mint Agent</h1>

          <label className="block text-sm opacity-70 mb-1">Agent Name</label>
          <input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 mb-5 outline-none"
            placeholder="Agent name"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm opacity-70 mb-1">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
              >
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="llama-3.1-70b">llama-3.1-70b</option>
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
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-rose-400"
              />
            </div>
          </div>

          <label className="block text-sm opacity-70 mt-5 mb-1">System Prompt</label>
          <textarea
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none"
          />

          <div className="mt-6">
            <label className="block text-sm opacity-70 mb-2">Agent Image</label>
            <input type="file" accept="image/png,image/jpeg" onChange={onPickImage} />
            <p className="text-xs opacity-60 mt-1">PNG/JPG recommended.</p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={onMint}
              disabled={minting || !wallet.connected}
              className="cta cta-primary px-5 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {minting ? "Minting…" : "Mint Agent NFT"}
            </button>
            <p className="text-sm opacity-70">
              Wallet:{" "}
              {wallet.publicKey
                ? wallet.publicKey.toBase58().slice(0, 4) +
                  "… " +
                  wallet.publicKey.toBase58().slice(-4)
                : "Not connected"}
            </p>
          </div>

          {err && (
            <div className="mt-4 text-sm text-red-300 border border-red-500/30 bg-red-500/10 rounded-lg px-3 py-2">
              {err}
            </div>
          )}

          {mintAddress && (
            <div className="mt-4 text-sm border border-emerald-500/30 bg-emerald-500/10 rounded-lg px-3 py-2">
              ✅ Minted! New mint:{" "}
              <a
                className="underline"
                href={`https://solscan.io/token/${mintAddress}`}
                target="_blank"
                rel="noreferrer"
              >
                {mintAddress}
              </a>
            </div>
          )}
        </div>

        {/* RIGHT: live preview */}
        <div className="glass p-6">
          <p className="text-sm opacity-60">Preview</p>
          <h3 className="mt-1 text-xl font-semibold">{agentName}</h3>
          <p className="mt-1 text-xs opacity-60">
            Model: {model} · Temp: {temperature.toFixed(2)}
          </p>

          <div className="mt-3 rounded-lg bg-white/5 border border-white/10 p-3 text-sm">
            {prompt || "System prompt goes here…"}
          </div>

          <div className="mt-6 h-[360px] rounded-xl bg-white/5 border border-white/10 grid place-items-center overflow-hidden">
            {imgPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgPreview} alt="preview" className="object-contain w-full h-full" />
            ) : (
              <span className="opacity-50 text-sm">No image selected</span>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onMint}
              disabled={minting || !wallet.connected}
              className="cta cta-primary px-5 py-3 flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {minting ? "Minting…" : "Mint Agent NFT"}
            </button>
            <Link href="/" className="cta px-5 py-3 text-center flex-1">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
