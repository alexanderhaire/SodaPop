// File: frontend/src/components/HorseCard.tsx
// Place this into: ~/SodaPop/frontend/src/components/HorseCard.tsx

import React from "react";

interface Horse {
  _id: string;
  tokenId: number;
  name: string;
  purchasePrice: number;
  status: "training" | "racing" | "retired" | "claimed";
  totalShares: number;
  sharesSold: number;
}

interface HorseCardProps {
  horse: Horse;
}

const HorseCard: React.FC<HorseCardProps> = ({ horse }) => (
  <div className="horse-card">
    <h3>{horse.name}</h3>
    <p>Token ID: {horse.tokenId}</p>
    <p>Price: ${horse.purchasePrice}</p>
    <p>Status: {horse.status}</p>
    <p>
      Sold: {horse.sharesSold}/{horse.totalShares} shares
    </p>
  </div>
);

export default HorseCard;
