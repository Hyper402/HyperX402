// src/app/mint/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import ClientOnly from "@/components/ClientOnly";
import { useUmi } from "@/lib/umi";
import { mintAgentNFT } from "@/lib/mintAgent";
import { uploadAgentMetadata } from "@/lib/upload";
import { updateAgentExternalUrl } from "@/lib/updateMetadata";

export default function MintPage() {
  const router = useRouter();
  const { publicKey, signMessage } = useWallet();
  const umi = useUmi();

  const [agentName, setAgentName] = React.useState("User #001 • H402");
  const [model, setModel] = React.useState("Claude-3.5-Sonnet");
  const [temperature, setTemperature] = React.useState<number>(0.6);
  const [prompt, setPrompt] = React.useState(
    "You are User, a helpful on-chain agent. Keep answers concise and confident."
  );

  const [imgFile, setImgFile] = React.useState<File | undefined>();
  const [imgPreview, setImgPreview] = React.useState<string>("");

  const [minting, setMinting] = React.useState(false);
  const [stage, setStage] = React.useState<"idle" | "uploading" | "minting" | "finalizing">("idle");
  const [mintAddress, setMintAddress] = React.useState<string>("");
  const [err, setErr] = React.useState<string>("");

  const walletReady = !!publicKey && typeof signMessage === "function";

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    const okType = /image\/(png|jpeg)/i.test(f.type);
    const okSize = f.size <= 4 * 1024 * 1024;
    if (!okType) return setErr("Only PNG or JPG images are supported.");
    if (!okSize) return setErr("Image too large. Please keep it ≤ 4 MB.");

    setErr("");
    setImgFile(f);
    setImgPreview(URL.createObjectURL(f));
  }

  async function onMint() {
    setErr("");
    setMintAddress("");

    if (!walletReady) {
      setErr("Your connected wallet doesn’t support signMessage. Use Phantom, Backpack, or Solflare desktop.");
      return;
    }
    if (!imgFile) {
      setErr("Please choose an image (PNG/JPG).");
      return;
    }

    try {
      setMinting(true);
      setStage("uploading");

      const origin = typeof window !== "undefined" ? window.location.origin : "https://hyperx402.app";
      const { uri } = await uploadAgentMetadata(umi, {
        name: agentName.trim(),
        description: prompt.trim(),
        image: imgFile,
        symbol: "H402",
        model,
        temperature,
        external_url: origin,
      });

      setStage("minting");
      const mintPk = await mintAgentNFT(umi, {
        name: agentName.trim(),
        uri,
        symbol: "H402",
        sellerFeeBps: 0,
      });

      setMintAddress(mintPk);

      // Optional metadata patch step
      try {
        setStage("finalizing");
        const agentUrl = `${origin}/agent/${mintPk}`;

        if (typeof updateAgentExternalUrl === "function") {
          await updateAgentExternalUrl(umi, mintPk, agentUrl);
        }
      } catch {
        // ignore; optional patch failure
      } finally {
        setStage("idle");
      }
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setMinting(false);
    }
  }

  const shortPk = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}`
    : "Not connected";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="cta px-4 py-2 inline-flex items-center gap-2 hover:bg-white/10">
          ← Back
        </Link>
        <ClientOnly>
          <WalletMultiButton className="!bg-white/10 !rounded-xl !border !border-white/10 hover:!bg-white/20" />
        </ClientOnly>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass p-6">
          <h1 className="text-3xl font-bold mb-6">Mint Agent</h1>

          <label className="block text-sm opacity-70 mb-1">Agent Name</label>
          <input
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 mb-5 outline-none"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            <p className="text-xs opacity-60 mt-1">PNG/JPG recommended (≤ 4 MB)</p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={onMint}
              disabled={minting || !walletReady}
              className="cta cta-primary px-5 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {minting
                ? stage === "uploading"
                  ? "Uploading…"
                  : stage === "minting"
                  ? "Minting…"
                  : "Finalizing…"
                : "Mint Agent NFT"}
            </button>
            <p className="text-sm opacity-70">Wallet: {shortPk}</p>
          </div>

          {err && (
            <div className="mt-4 text-sm text-red-300 border border-red-500/30 bg-red-500/10 rounded-lg px-3 py-2">
              {err}
            </div>
          )}

          {mintAddress && (
            <div className="mt-4 text-sm border border-emerald-500/30 bg-emerald-500/10 rounded-lg px-3 py-2 space-y-2">
              <div>
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
              <div className="flex gap-2">
                <Link href={`/agent/${mintAddress}`} className="cta cta-primary">
                  Open Agent
                </Link>
                <button className="cta" onClick={() => router.push("/my-agents")}>
                  Go to My Agents
                </button>
              </div>
            </div>
          )}
        </div>

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
        </div>
      </div>
    </main>
  );
}
