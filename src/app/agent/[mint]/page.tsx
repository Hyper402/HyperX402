// src/app/agent/[mint]/page.tsx
import AgentClient from "./AgentClient";

export default async function Page({
  params,
}: {
  params: Promise<{ mint: string }>;
}) {
  const { mint } = await params; // unwrap the Promise in Next 16
  const cleanMint = decodeURIComponent(mint.trim());
  return <AgentClient mint={cleanMint} />;
}
