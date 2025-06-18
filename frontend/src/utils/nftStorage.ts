import axios from 'axios';

export async function uploadToNftStorageV2(file: File) {
  const API_KEY = import.meta.env.VITE_NFT_STORAGE_KEY;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post('https://api.nft.storage/upload', formData, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.ok) {
      const cid = response.data.value.cid;
      console.log(`✅ Uploaded to IPFS with CID: ${cid}`);
      return cid;
    } else {
      throw new Error(`❌ Upload failed: ${JSON.stringify(response.data.error)}`);
    }
  } catch (err) {
    console.error('❌ Upload error:', err);
    throw err;
  }
}
