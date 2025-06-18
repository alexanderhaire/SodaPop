// 🎯 GOAL: Full CreateItem form styled with Tailwind CSS, NFT.Storage V2 upload, and state-bound fields.
// 💡 Assumes Tailwind is configured in the project.

import { useState } from 'react';
import axios from 'axios';
import axiosClient from '../utils/axiosConfig';

export default function CreateItem() {
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

    if (res.data.ok) {
      const cid = res.data.value.cid;
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
      await axiosClient.post('/items', payload);
      alert('✅ Item created!');
    } catch (err) {
      console.error('Item creation error:', err);
      alert('Failed to create item.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-4"
    >
      <h2 className="text-xl font-bold">Create New Item</h2>

      <input
        name="itemType"
        placeholder="Item Type"
        value={form.itemType}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <input
        name="sharePrice"
        placeholder="Share Price (ETH)"
        type="number"
        step="0.01"
        value={form.sharePrice}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <input
        name="totalShares"
        placeholder="Total Shares"
        type="number"
        value={form.totalShares}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <input
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
      />

      {ipfsUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">Image Preview:</p>
          <img src={ipfsUrl} alt="IPFS Preview" className="w-48 mt-2 rounded shadow" />
        </div>
      )}

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isVariable"
          checked={form.isVariable}
          onChange={handleChange}
          className="toggle toggle-primary"
        />
        Variable
      </label>

      <button
        type="submit"
        className="w-full py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition"
      >
        Create
      </button>
    </form>
  );
}
