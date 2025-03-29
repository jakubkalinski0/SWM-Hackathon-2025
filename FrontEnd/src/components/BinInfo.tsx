import React from 'react';

interface Bin {
  id: number;
  type: 'general' | 'recycling';
  location: { lat: number; lng: number };
  acceptedWaste: string[];
  address?: string;
  distance?: number;
}

interface BinInfoProps {
  bin: Bin;
}

const BinInfo: React.FC<BinInfoProps> = ({ bin }) => {
  return (
    <div className="bin-info">
      <h3>Informacje o koszu</h3>
      <p><strong>Typ:</strong> {bin.type === 'general' ? 'Ogólny' : 'Do segregacji'}</p>
      <p><strong>Akceptowane odpady:</strong> {bin.acceptedWaste.join(', ')}</p>
      <p><strong>Odległość:</strong> {bin.distance?.toFixed(2) || 'N/A'} metrów</p>
      <p><strong>Adres:</strong> {bin.address || 'Nieznany'}</p>
    </div>
  );
};

export default BinInfo;