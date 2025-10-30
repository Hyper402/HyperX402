// src/lib/mintAgent.ts
'use client';

import type { WalletContextState } from '@solana/wallet-adapter-react';
import { getUmi } from './umi';

import { generateSigner, percentAmount } from '@metaplex-foundation/umi';
import { createNft } from '@metaplex-foundation/mpl-token-metadata';

/** Helper: file → data URI */
async function fileToDataUri(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const base64 = Buffer.from(buf).toString('base64');
  const mime = file.type || 'application/octet-stream';
  return `data:${mime};base64,${base64}`;
}

/** Helper: build metadata JSON as a data URI */
function buildMetadataDataUri(opts: {
  name: string;
  description: string;
  imageDataUri?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
}): string {
  const { name, description, imageDataUri, attributes = [] } = opts;

  const json = {
    name,
    symbol: 'H402',
    description,
    image: imageDataUri ?? undefined,
    attributes,
    properties: {
      files: imageDataUri
        ? [{ uri: imageDataUri, type: imageDataUri.split(';')[0].replace('data:', '') }]
        : [],
      category: 'image',
    },
  };

  const payload = Buffer.from(JSON.stringify(json)).toString('base64');
  return `data:application/json;base64,${payload}`;
}

/**
 * Mint an Agent NFT (Token Metadata standard) with a data: URI metadata.
 * Returns the minted NFT's mint address (string).
 */
export async function mintAgentNFT(
  wallet: WalletContextState,
  agentName: string,
  model: string,
  temperature: number,
  systemPrompt: string,
  imageFile?: File
): Promise<string> {
  const umi = getUmi(wallet);

  if (!wallet.publicKey) {
    throw new Error('Connect your wallet first.');
  }

  // Optional image → data URI
  const imageDataUri = imageFile ? await fileToDataUri(imageFile) : undefined;

  // Minimal, clear description that also embeds your model/prompt info
  const description = [
    `HyperX402 Agent`,
    `Model: ${model}`,
    `Temp: ${temperature.toFixed(2)}`,
    '',
    systemPrompt,
  ].join('\n');

  const metadataDataUri = buildMetadataDataUri({
    name: agentName,
    description,
    imageDataUri,
    attributes: [
      { trait_type: 'Model', value: model },
      { trait_type: 'Temperature', value: temperature },
    ],
  });

  // Create the mint keypair for the NFT
  const mint = generateSigner(umi);

  // Create the NFT (0% royalties)
  await createNft(umi, {
    mint,
    name: agentName,
    uri: metadataDataUri, // <= data:application/json;base64,...
    sellerFeeBasisPoints: percentAmount(0), // 0% royalties
    isMutable: true,
  }).sendAndConfirm(umi);

  return mint.publicKey.toString();
}
