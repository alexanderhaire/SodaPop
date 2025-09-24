import axios from "./axiosConfig";
import { getToken } from "./authToken";
import { uploadToNftStorageV2 } from "./nftStorage";

const NFT_STORAGE_GATEWAY = "https://nftstorage.link/ipfs/";

export interface UploadImageResult {
  /**
   * Canonical IPFS URI returned by NFT.Storage (e.g. ipfs://<cid>)
   * that should be persisted in on-chain metadata.
   */
  ipfsUri: string;
  /**
   * HTTP URL that can be rendered directly in the browser for previews.
   */
  previewUrl: string;
}

/**
 * Uploads an asset to NFT.Storage and returns a preview + canonical URI.
 * Falls back to the legacy backend endpoint if the decentralized upload fails
 * so that existing environments without NFT.Storage credentials still work.
 */
export const uploadImage = async (file: File): Promise<UploadImageResult> => {
  if (!(file instanceof File)) {
    throw new Error("A valid file must be provided for upload.");
  }

  try {
    const cid = await uploadToNftStorageV2(file);
    const trimmedCid = cid.trim();
    if (!trimmedCid) {
      throw new Error("NFT.Storage returned an empty CID.");
    }

    return {
      ipfsUri: `ipfs://${trimmedCid}`,
      previewUrl: `${NFT_STORAGE_GATEWAY}${trimmedCid}`,
    };
  } catch (primaryError) {
    console.warn("NFT.Storage upload failed, falling back to legacy uploader.", primaryError);

    const formData = new FormData();
    formData.append("file", file);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await axios.post("upload", formData, { headers });
      const data = response.data ?? {};
      const candidateUrl =
        typeof data === "string"
          ? data
          : data.url ?? data.imageUrl ?? data.previewUrl ?? data.location ?? null;

      if (typeof candidateUrl !== "string" || !candidateUrl.trim()) {
        throw new Error("Upload API did not return an accessible image URL.");
      }

      const finalUrl = candidateUrl.trim();
      return {
        ipfsUri: finalUrl,
        previewUrl: finalUrl,
      };
    } catch (fallbackError) {
      const reason =
        fallbackError instanceof Error
          ? fallbackError.message
          : typeof fallbackError === "string"
            ? fallbackError
            : "Unknown error";
      throw new Error(`Image upload failed: ${reason}`);
    }
  }
};
