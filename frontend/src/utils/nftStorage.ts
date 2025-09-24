import axios from "axios";

const NFT_STORAGE_UPLOAD_URL = "https://api.nft.storage/upload";

export async function uploadToNftStorageV2(file: File): Promise<string> {
  const rawApiKey = import.meta.env.VITE_NFT_STORAGE_KEY;
  const apiKey = typeof rawApiKey === "string" ? rawApiKey.trim() : "";

  if (!apiKey) {
    const error = new Error("NFT.Storage API key is not configured");
    (error as Error & { code?: string }).code = "MISSING_NFT_STORAGE_KEY";
    console.warn("[nftStorage] NFT.Storage API key missing; skipping decentralized upload", {
      name: file.name,
    });
    throw error;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(NFT_STORAGE_UPLOAD_URL, formData, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.data?.ok) {
      const cid = String(response.data.value?.cid ?? "").trim();
      if (!cid) {
        throw new Error("NFT.Storage response did not include a CID");
      }

      console.info("[nftStorage] Uploaded asset to IPFS", {
        name: file.name,
        cid,
      });

      return cid;
    }

    throw new Error(
      `NFT.Storage request failed: ${JSON.stringify(response.data?.error ?? response.data)}`,
    );
  } catch (err) {
    console.error("[nftStorage] Upload request failed", {
      name: file.name,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw err;
  }
}
