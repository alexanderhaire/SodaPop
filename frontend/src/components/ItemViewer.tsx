import React, { useEffect, useState } from "react";

interface Attribute {
  trait_type: string;
  value: string | number;
}

interface ItemMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Attribute[];
}

const ItemViewer: React.FC = () => {
  const [item, setItem] = useState<ItemMetadata | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8080/1.json")
      .then((res) => res.json())
      .then(setItem)
      .catch((err) => console.error("Failed to fetch item metadata", err));
  }, []);

  if (!item) return <div>Loading item metadata...</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <img src={item.image} alt={item.name} className="rounded-2xl shadow-md" />
      <h1 className="text-2xl font-bold mt-4">{item.name}</h1>
      <p className="text-gray-700 mb-4">{item.description}</p>
      <div>
        {item.attributes.map((attr, i) => (
          <div key={i} className="mb-2">
            <strong>{attr.trait_type}:</strong> {attr.value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemViewer;
