import { sortByDistance } from './geoService';

// Mock danych - w rzeczywistości można pobierać z API
const mockBins = [
  {
    id: 1,
    type: 'general',
    location: { lat: 52.2297, lng: 21.0122 },
    acceptedWaste: ['mixed'],
    address: 'Plac Defilad 1, Warszawa'
  },
  // ... więcej koszy
];

export const getNearbyBins = async (lat, lng, limit = 5) => {
  // W rzeczywistości: fetch do API
  const location = { lat, lng };
  const generalBins = mockBins.filter(bin => bin.type === 'general');
  const sorted = sortByDistance(location, generalBins);
  return sorted.slice(0, limit);
};

export const getBinsByType = async (lat, lng, wasteType, limit = 5) => {
  // W rzeczywistości: fetch do API
  const location = { lat, lng };
  const recyclingBins = mockBins.filter(bin => 
    bin.type === 'recycling' && bin.acceptedWaste.includes(wasteType)
  );
  const sorted = sortByDistance(location, recyclingBins);
  return sorted.slice(0, limit);
};