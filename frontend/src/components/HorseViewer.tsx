import React, { useEffect, useState } from "react";

interface Attribute {
  trait_type: string;
  value: string | number;
}

interface HorseMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Attribute[];
}

const HorseViewer: React.FC = () => {
  const [horse, setHorse] = useState<HorseMetadata | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8080/1.json")
      .then((res) => res.json())
      .then(setHorse)
      .catch((err) => console.error("Failed to fetch horse metadata", err));
  }, []);

  if (!horse) return <div>Loading horse metadata...</div>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <img src={horse.image} alt={horse.name} className="rounded-2xl shadow-md" />
      <h1 className="text-2xl font-bold mt-4">{horse.name}</h1>
      <p className="text-gray-700 mb-4">{horse.description}</p>
      <div>
        {horse.attributes.map((attr, i) => (
          <div key={i} className="mb-2">
            <strong>{attr.trait_type}:</strong> {attr.value}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorseViewer;
