import { useState } from 'react';
import axios from '../utils/axiosConfig';

export default function CreateItemForm() {
  const [form, setForm] = useState({
    itemType: '',
    sharePrice: '',
    totalShares: '',
    description: '',
    isVariable: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const uploadToNftStorageV2 = async (file: File): Promise<string> => {
    const API_KEY = import.meta.env.VITE_NFT_STORAGE_KEY;
    const formData = new FormData();
    formData.append('file', file);

    const res = await axios.post('https://api.nft.storage/upload', formData, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if ((res.data as any).ok) {
      const cid = (res.data as any).value.cid;
      return `https://ipfs.io/ipfs/${cid}`;
    } else {
      throw new Error(`Upload failed: ${JSON.stringify(res.data.error)}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);

    try {
      const url = await uploadToNftStorageV2(file);
      setIpfsUrl(url);
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Failed to upload image.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipfsUrl) {
      alert('Image not uploaded yet.');
      return;
    }

    const payload = {
      ...form,
      sharePrice: parseFloat(form.sharePrice),
      totalShares: parseInt(form.totalShares),
      isVariable: Boolean(form.isVariable),
      image: ipfsUrl,
    };

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/items`, payload);
      alert('✅ Item created!');
    } catch (err) {
      console.error('Item creation error:', err);
      alert('Failed to create item.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="itemType"
        placeholder="Item Type"
        value={form.itemType}
        onChange={handleChange}
      />
      <input
        name="sharePrice"
        placeholder="Share Price (ETH)"
        type="number"
        step="0.01"
        value={form.sharePrice}
        onChange={handleChange}
      />
      <input
        name="totalShares"
        placeholder="Total Shares"
        type="number"
        value={form.totalShares}
        onChange={handleChange}
      />
      <input
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      <input type="file" onChange={handleFileChange} />
      {ipfsUrl && (
        <div>
          <p>Preview:</p>
          <img src={ipfsUrl} alt="IPFS Preview" width="200" />
        </div>
      )}

      <label>
        Variable
        <input
          type="checkbox"
          name="isVariable"
          checked={form.isVariable}
          onChange={handleChange}
        />
      </label>

      <button type="submit">Create</button>
    </form>
  );
}

