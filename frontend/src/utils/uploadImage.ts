import axiosInstance from "./axiosConfig";
import { getToken } from "./authToken";
import { uploadToNftStorageV2 } from "./nftStorage";
import { isAxiosError } from "axios";

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

  console.info("[uploadImage] Initiating upload", {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  try {
    const cid = await uploadToNftStorageV2(file);
    const trimmedCid = cid.trim();
    if (!trimmedCid) {
      throw new Error("NFT.Storage returned an empty CID.");
    }

    console.info("[uploadImage] NFT.Storage upload succeeded", {
      name: file.name,
      cid: trimmedCid,
    });

    return {
      ipfsUri: `ipfs://${trimmedCid}`,
      previewUrl: `${NFT_STORAGE_GATEWAY}${trimmedCid}`,
    };
  } catch (primaryError) {
    const fallbackReason =
      primaryError instanceof Error ? primaryError.message : String(primaryError);
    console.warn("[uploadImage] NFT.Storage upload failed; falling back to legacy uploader", {
      name: file.name,
      reason: fallbackReason,
    });

    const formData = new FormData();
    formData.append("file", file);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await axiosInstance.post("upload", formData, { headers });
      const data = response.data ?? {};
      const candidateUrl =
        typeof data === "string"
          ? data
          : data.url ?? data.imageUrl ?? data.previewUrl ?? data.location ?? null;

      if (typeof candidateUrl !== "string" || !candidateUrl.trim()) {
        throw new Error("Upload API did not return an accessible image URL.");
      }

      const finalUrl = candidateUrl.trim();
      console.info("[uploadImage] Legacy uploader succeeded", {
        name: file.name,
        url: finalUrl,
      });
      return {
        ipfsUri: finalUrl,
        previewUrl: finalUrl,
      };
    } catch (fallbackError) {
      let detailedMessage =
        fallbackError instanceof Error
          ? fallbackError.message
          : typeof fallbackError === "string"
            ? fallbackError
            : "Unknown error";

      if (isAxiosError(fallbackError)) {
        const status = fallbackError.response?.status;
        const statusText = fallbackError.response?.statusText;
        const responseData = fallbackError.response?.data;
        detailedMessage = status
          ? `Request failed with status ${status}${statusText ? ` ${statusText}` : ""}`
          : detailedMessage;

        console.error("[uploadImage] Legacy uploader request failed", {
          name: file.name,
          status,
          statusText,
          responseData,
          message: fallbackError.message,
          stack: fallbackError.stack,
        });
      } else {
        console.error("[uploadImage] Legacy uploader threw non-Axios error", {
          name: file.name,
          error: fallbackError,
        });
      }

      throw new Error(`Image upload failed: ${detailedMessage}`);
    }
  }
};
