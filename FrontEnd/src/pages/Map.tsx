import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
// import { ArrowLeft } from 'lucide-react';

// Define types
type RecyclableType = 'plastik' | 'metal' | 'glass' | 'papier' | 'unknown';

interface LocationPin {
  id: string;
  location: [number, number]; // [latitude, longitude]
  type: RecyclableType;
  description?: string;
}

// Mock data - just 3 entries
const mockLocations: LocationPin[] = [
  {
    id: '1',
    location: [52.520008, 13.404954],
    type: 'plastik',
    description: 'Plastic collection point'
  },
  {
    id: '2',
    location: [52.523008, 13.414954],
    type: 'metal',
    description: 'Metal recycling center'
  },
  {
    id: '3',
    location: [52.518008, 13.399954],
    type: 'glass',
    description: 'Glass container - Separate by color'
  }
];

const RecyclablesMap: React.FC = () => {
  const [locations] = useState<LocationPin[]>(mockLocations);
  
  // Get pin color based on recyclable type
  const getPinColor = (type: RecyclableType): string => {
    switch (type) {
      case 'plastik': return 'yellow';
      case 'metal': return 'red';
      case 'glass': return 'green';
      case 'papier': return 'blue';
      case 'unknown':
      default: return 'gray';
    }
  };

  // Create custom pin icon with appropriate color
  const createPinIcon = (type: RecyclableType) => {
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${getPinColor(type)}.png`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41]
    });
  };

  // Calculate center of the map based on all points
  const getMapCenter = (): [number, number] => {
    const sumLat = locations.reduce((sum, loc) => sum + loc.location[0], 0);
    const sumLng = locations.reduce((sum, loc) => sum + loc.location[1], 0);
    return [sumLat / locations.length, sumLng / locations.length];
  };

  return (
    <div className="relative h-screen w-screen">
      {/* Back button */}
      <Button 
        onClick={() => window.history.back()}
        className="absolute top-4 left-4 z-[10000] bg-white"
        aria-label="Go back"
      >
        {/* <ArrowLeft size={24} /> */}
        Back
      </Button>
      
      {/* Map container */}
      <MapContainer 
        center={getMapCenter()} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}zx
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((pin) => (
          <Marker 
            key={pin.id}
            position={pin.location} 
            icon={createPinIcon(pin.type)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg capitalize">{pin.type}</h3>
                {pin.description && <p className="mt-1">{pin.description}</p>}
                <p className="mt-1">Latitude: {pin.location[0]}</p>
                <p>Longitude: {pin.location[1]}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 p-4 bg-white rounded-md shadow-lg border border-black transform translate-x-2 translate-y-2">
        <h3 className="font-bold mb-2">Legend</h3>
        <ul className="space-y-1">
          {(['plastik', 'metal', 'glass', 'papier', 'unknown'] as RecyclableType[]).map(type => (
            <li key={type} className="flex items-center">
              <span 
                className="inline-block w-4 h-4 mr-2 rounded-full"
                style={{ backgroundColor: getPinColor(type) }}
              />
              <span className="capitalize">{type}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecyclablesMap;
