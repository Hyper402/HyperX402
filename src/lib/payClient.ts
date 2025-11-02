// src/lib/payClient.ts
"use client";

import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection } from "@solana/web3.js";

export type PaymentIntent = {
  token: "SOL" | string;   // "SOL" or SPL mint address
  to: string;              // recipient base58
  amount: number;          // SOL in SOL units; SPL in uiAmount
  decimals?: number;       // required for SPL (e.g., USDC = 6)
  memo?: string;
};

export async function sendSOL(
  connection: Connection,
  fromPubkey: PublicKey,
  sendTx: (tx: Transaction, conn: Connection) => Promise<string>,
  intent: PaymentIntent
) {
  if (!(intent.amount > 0)) throw new Error("Amount must be > 0");
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: new PublicKey(intent.to),
      lamports: Math.floor(intent.amount * LAMPORTS_PER_SOL),
    })
  );
  const sig = await sendTx(tx, connection);
  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}

export async function sendSPL(
  connection: Connection,
  fromPubkey: PublicKey,
  sendTx: (tx: Transaction, conn: Connection) => Promise<string>,
  intent: PaymentIntent
) {
  if (!(intent.amount > 0)) throw new Error("Amount must be > 0");
  if (!intent.decimals && intent.token !== "SOL") throw new Error("Decimals required for SPL");
  const mint = new PublicKey(intent.token);
  const to = new PublicKey(intent.to);

  const fromAta = await getAssociatedTokenAddress(mint, fromPubkey);
  const toAta = await getAssociatedTokenAddress(mint, to);

  const base = BigInt(Math.floor(intent.amount * 10 ** (intent.decimals as number)));
  const ix = createTransferInstruction(fromAta, toAta, fromPubkey, base, [], TOKEN_PROGRAM_ID);
  const tx = new Transaction().add(ix);

  const sig = await sendTx(tx, connection);
  await connection.confirmTransaction(sig, "confirmed");
  return sig;
}
