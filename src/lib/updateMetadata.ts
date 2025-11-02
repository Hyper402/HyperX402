// src/lib/updateMetadata.ts
import { Umi, publicKey } from "@metaplex-foundation/umi";
import { getUmi } from "./umi";
import { updateV1 } from "@metaplex-foundation/mpl-token-metadata";
import { uploadAgentAssets } from "./upload";

export async function repairAgentMetadata(
  wallet: any,
  mintAddress: string,
  payload: Parameters<typeof uploadAgentAssets>[1]
) {
  const umi = getUmi(wallet);
  const { jsonUri } = await uploadAgentAssets(umi, payload);

  await updateV1(umi, {
    mint: publicKey(mintAddress),
    data: {
      uri: jsonUri,
    },
  }).sendAndConfirm(umi);

  return jsonUri;
}
