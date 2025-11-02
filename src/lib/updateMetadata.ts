// Minimal placeholder so builds pass; safe to call in try/catch.
// Later you can implement an actual metadata re-upload + updateV1.
import type { Umi, PublicKey as UmiPublicKey } from "@metaplex-foundation/umi";

export async function updateAgentExternalUrl(
  _umi: Umi,
  _mint: UmiPublicKey | string,
  _externalUrl: string
): Promise<void> {
  // Intentionally no-op for now (Vercel/server builds).
  // Real flow:
  // 1) fetch current JSON
  // 2) clone + set external_url = _externalUrl
  // 3) upload new JSON to Arweave
  // 4) call mpl-token-metadata updateV1 to point URI to the new JSON
  return;
}
