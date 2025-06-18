// File: frontend/src/components/ItemCard.tsx

import React from "react";

interface Item {
  _id: string;
  tokenId: number;
  name: string;
  purchasePrice: number;
  status: "training" | "racing" | "retired" | "claimed";
  totalShares: number;
  sharesSold: number;
}

interface ItemCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => (
  <div className="horse-card">
    <h3>{item.name}</h3>
    <p>Token ID: {item.tokenId}</p>
    <p>Price: ${item.purchasePrice}</p>
    <p>Status: {item.status}</p>
    <p>
      Sold: {item.sharesSold}/{item.totalShares} shares
    </p>
  </div>
);

export default ItemCard;
