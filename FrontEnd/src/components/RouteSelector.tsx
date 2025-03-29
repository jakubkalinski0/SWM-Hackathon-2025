import React from 'react';

interface Bin {
  id: number;
  type: 'general' | 'recycling';
  location: { lat: number; lng: number };
  acceptedWaste: string[];
  address?: string;
  distance?: number;
}

interface RouteSelectorProps {
  generalBins: Bin[];
  recyclingBins: Bin[];
  onSelectBin: (bin: Bin) => void;
}

const RouteSelector: React.FC<RouteSelectorProps> = ({ generalBins, recyclingBins, onSelectBin }) => {
  return (
    <div className="route-selector">
      <div className="bin-list">
        <h3>Najbliższe kosze ogólne</h3>
        <ul>
          {generalBins.map(bin => (
            <li key={`general-${bin.id}`} onClick={() => onSelectBin(bin)}>
              {bin.distance?.toFixed(2) || 'N/A'} m - {bin.address || 'Nieznany adres'}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bin-list">
        <h3>Najbliższe kosze do segregacji</h3>
        <ul>
          {recyclingBins.map(bin => (
            <li key={`recycling-${bin.id}`} onClick={() => onSelectBin(bin)}>
              {bin.distance?.toFixed(2) || 'N/A'} m - {bin.acceptedWaste.join(', ')} - {bin.address || 'Nieznany adres'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RouteSelector;