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
  prompt?: string;
  model?: string;
  temperature?: number;
  external_url?: string;
  uri?: string;
  rawJson?: any;
};

/** ---- helpers ----------------------------------------------------------- */
function parseAgentJson(json: any): Pick<OnchainAgent, "image" | "prompt" | "model" | "temperature" | "external_url"> {
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
  const legacy = (json as any).x402_agent;
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

/** Normalize collection to a string key, handling both shapes */
function collectionKeyToString(col: any): string | undefined {
  if (!col) return undefined;
  // Some versions expose Option<PublicKey-like> with toString()
  if (typeof col?.toString === "function") {
    try {
      const s = col.toString();
      return s && s !== "None" ? s : undefined;
    } catch {
      /* noop */
    }
  }
  // Others expose { key: PublicKey, verified: boolean }
  if (typeof col === "object" && "key" in col && col.key) {
    try {
      return typeof (col as any).key?.toString === "function"
        ? (col as any).key.toString()
        : String((col as any).key);
    } catch {
      /* noop */
    }
  }
  return undefined;
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
  const wantCollectionStr = wantCollection ? wantCollection.toString() : undefined;

  const filtered = assets.filter((a) => {
    const hasSymbol = (a.metadata.symbol ?? "").toUpperCase() === wantSymbol;

    const assetColStr = collectionKeyToString(a.metadata.collection);
    const inCollection = wantCollectionStr ? assetColStr === wantCollectionStr : true;

    return hasSymbol && inCollection;
  });

  const out: OnchainAgent[] = [];
  for (const a of filtered) {
    try {
      const json = await fetchJsonMetadata(umi, a.metadata.uri);
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
    const json = await fetchJsonMetadata(umi, asset.metadata.uri);
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
