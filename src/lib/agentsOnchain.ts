// src/lib/agentsOnchain.ts
"use client";

import type { Umi, PublicKey as UmiPublicKey } from "@metaplex-foundation/umi";
import {
  fetchAllDigitalAssetByOwner,
  fetchDigitalAsset,
  fetchJsonMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey as umiPk } from "@metaplex-foundation/umi";

export type OnchainAgent = {
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  prompt?: string;          // from JSON.description (new) or x402_agent.system_prompt (legacy)
  model?: string;           // from attributes[].trait_type === "Model" (new) or x402_agent.model (legacy)
  temperature?: number;     // from attributes[].trait_type === "Temperature" (new) or x402_agent.temperature (legacy)
  external_url?: string;    // JSON.external_url
  uri?: string;             // on-chain URI
  rawJson?: any;
};

/** ---- retry helper ------------------------------------------------------ */
// Simple exponential backoff: ~0.6s → ~0.78s → … (8 tries ≈ ~15s total)
async function retry<T>(fn: () => Promise<T>, attempts = 8, baseMs = 600): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, Math.floor(baseMs * Math.pow(1.3, i))));
    }
  }
  throw lastErr;
}

/** ---- helpers ----------------------------------------------------------- */
function parseAgentJson(json: any): Pick<OnchainAgent, "image"|"prompt"|"model"|"temperature"|"external_url"> {
  if (!json || typeof json !== "object") return {};

  const image = json.image as string | undefined;
  const external_url = json.external_url as string | undefined;

  // New format: description + attributes
  let prompt = typeof json.description === "string" ? json.description : undefined;

  let model: string | undefined;
  let temperature: number | undefined;

  const attrs = Array.isArray(json.attributes) ? json.attributes : [];
  for (const a of attrs as any[]) {
    const t = String(a?.trait_type ?? a?.traitType ?? "").toLowerCase();
    if (t === "model") model = String(a?.value);
    if (t === "temperature") {
      const n = Number(a?.value);
      if (Number.isFinite(n)) temperature = n;
    }
  }

  // Legacy support: x402_agent object
  const legacy = json.x402_agent;
  if ((!model || temperature === undefined || !prompt) && legacy) {
    model = model ?? (legacy.model ? String(legacy.model) : undefined);
    if (temperature === undefined) {
      const n =
        typeof legacy.temperature === "number"
          ? legacy.temperature
          : typeof legacy.temperature === "string"
          ? Number(legacy.temperature)
          : undefined;
      if (Number.isFinite(n as number)) temperature = n as number;
    }
    prompt = prompt ?? (typeof legacy.system_prompt === "string" ? legacy.system_prompt : undefined);
  }

  return { image, prompt, model, temperature, external_url };
}

/** ---- list by owner ----------------------------------------------------- */
export async function loadAgentsForOwner(
  umi: Umi,
  owner: UmiPublicKey,
  opts?: { symbol?: string; collection?: string }
): Promise<OnchainAgent[]> {
  const assets = await fetchAllDigitalAssetByOwner(umi, owner);

  const wantSymbol = (opts?.symbol ?? "H402").toUpperCase();
  const wantCollection = opts?.collection ? umiPk(opts.collection) : null;

  const filtered = assets.filter((a) => {
    const hasSymbol = (a.metadata.symbol ?? "").toUpperCase() === wantSymbol;
    const inCollection = wantCollection
      ? a.metadata.collection?.key?.toString() === wantCollection.toString()
      : true;
    return hasSymbol && inCollection;
  });

  const out: OnchainAgent[] = [];
  for (const a of filtered) {
    try {
      const json = await retry(() => fetchJsonMetadata(umi, a.metadata.uri));
      const parsed = parseAgentJson(json);
      out.push({
        mint: a.mint.publicKey.toString(),
        name: a.metadata.name,
        symbol: a.metadata.symbol ?? "",
        uri: a.metadata.uri,
        rawJson: json,
        ...parsed,
      });
    } catch {
      out.push({
        mint: a.mint.publicKey.toString(),
        name: a.metadata.name,
        symbol: a.metadata.symbol ?? "",
        uri: a.metadata.uri,
      });
    }
  }
  return out.sort((a, b) => (a.mint < b.mint ? 1 : -1));
}

/** ---- single by mint ---------------------------------------------------- */
export async function loadAgentByMint(umi: Umi, mintStr: string): Promise<OnchainAgent | null> {
  try {
    const asset = await fetchDigitalAsset(umi, umiPk(mintStr));
    const json = await retry(() => fetchJsonMetadata(umi, asset.metadata.uri));
    const parsed = parseAgentJson(json);

    return {
      mint: mintStr,
      name: asset.metadata.name,
      symbol: asset.metadata.symbol ?? "",
      uri: asset.metadata.uri,
      rawJson: json,
      ...parsed,
    };
  } catch {
    return null;
  }
}
