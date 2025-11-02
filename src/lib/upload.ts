// src/lib/upload.ts
"use client";

import type { Umi } from "@metaplex-foundation/umi";
import { createGenericFile } from "@metaplex-foundation/umi";

type UploadAgentInputs = {
  name: string;
  description?: string;
  image: File | Blob | Uint8Array; // allow Blob/Uint8Array too
  symbol?: string;
  model?: string;
  temperature?: number;
  external_url?: string; // defaulted below
};

type UploadResult = { imageUri: string; uri: string };

const fallback = <T,>(v: T | undefined, fb: T) => (v === undefined || v === null ? fb : v);

async function toGenericFromFileLike(f: File | Blob | Uint8Array) {
  if (f instanceof Uint8Array) {
    return createGenericFile(f, "agent.png", { contentType: "image/png" });
  }
  // File or Blob
  const bytes = new Uint8Array(await (f as Blob).arrayBuffer());
  const name = (f as any).name || "agent.png";
  const type = (f as any).type || "image/png";
  return createGenericFile(bytes, name, { contentType: type });
}

function toGenericJsonFile(obj: unknown, fileName = "metadata.json") {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  return createGenericFile(bytes, fileName, { contentType: "application/json" });
}

export async function uploadAgentMetadata(umi: Umi, input: UploadAgentInputs): Promise<UploadResult> {
  if (!umi?.uploader) throw new Error("UMI uploader is not configured. Did you `.use(bundlrUploader(...))`?");

  // 1) Upload image to Arweave via Bundlr
  const imageGeneric = await toGenericFromFileLike(input.image);
  const [imageUri] = await umi.uploader.upload([imageGeneric]);

  // 2) Build metadata JSON (Solscan-friendly)
  const externalUrl = fallback(input.external_url, "https://hyperx402.app");
  const attributes = [
    ...(input.model ? [{ trait_type: "Model", value: String(input.model) }] : []),
    ...(input.temperature !== undefined
      ? [{ trait_type: "Temperature", value: String(input.temperature) }]
      : []),
  ];

  const metadata = {
    name: input.name,
    symbol: fallback(input.symbol, "H402"),
    description: fallback(input.description, ""),
    image: imageUri,
    external_url: externalUrl,
    attributes,
    properties: {
      category: "image",
      files: [{ uri: imageUri, type: imageGeneric.contentType ?? "image/png" }],
    },
    // You can add 'seller_fee_basis_points' etc. here if desired.
  };

  // 3) Upload JSON
  const uri = await umi.uploader.uploadJson(metadata);

  return { imageUri, uri };
}
