// File: frontend/src/pages/HorseDetail.tsx
// Place this into: ~/SodaPop/frontend/src/pages/HorseDetail.tsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

interface Horse {
  _id: string;
  tokenId: number;
  name: string;
  purchasePrice: number;
  status: "training" | "racing" | "retired" | "claimed";
  totalShares: number;
  sharesSold: number;
  purchaseDate: string;
}

const HorseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [horse, setHorse] = useState<Horse | null>(null);
  const [shares, setShares] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    api.get<Horse>(`/horses/${id}`).then((res) => setHorse(res.data));
  }, [id]);

  const handlePurchase = async () => {
    if (!horse || shares <= 0) return;
    try {
      const tx = await api.post("/transactions", {
        userId: "replace_with_logged_in_user_id",
        horseId: horse._id,
        shares,
        amount: shares * horse.purchasePrice,
      });
      setMessage(`Purchased ${shares} shares. TXID: ${tx.data._id}`);
      setShares(0);
    } catch {
      setMessage("Purchase failed.");
    }
  };

  if (!horse) return null;

  return (
    <div>
      <h2>{horse.name}</h2>
      <p>Purchase Price: ${horse.purchasePrice}</p>
      <p>Status: {horse.status}</p>
      <p>
        Sold: {horse.sharesSold}/{horse.totalShares} shares
      </p>
      <p>Purchase Date: {new Date(horse.purchaseDate).toLocaleDateString()}</p>
      <label>
        Number of Shares:
        <input
          type="number"
          value={shares}
          onChange={(e) => setShares(Number(e.target.value))}
          max={horse.totalShares - horse.sharesSold}
        />
      </label>
      <button onClick={handlePurchase}>Buy Shares</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default HorseDetail;
