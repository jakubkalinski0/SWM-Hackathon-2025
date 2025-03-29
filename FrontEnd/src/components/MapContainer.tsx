import React, { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom blue marker for user location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapContainerProps {
  userLocation: { lat: number; lng: number } | null;
}

const ChangeView = ({ center }: { center: L.LatLngExpression }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

const MapContainer: React.FC<MapContainerProps> = ({ userLocation }) => {
  const krakowZablocieCoords: L.LatLngExpression = [50.047, 19.961];
  
  return (
    <div style={{ height: '500px', width: '100%' }}>
      <LeafletMap
        center={userLocation ? [userLocation.lat, userLocation.lng] : krakowZablocieCoords}
        zoom={17}  // Wyższy zoom, aby lepiej widzieć lokalizację
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}  // Ukrywamy kontrolki zoomu
      >
        {userLocation && (
          <>
            <ChangeView center={[userLocation.lat, userLocation.lng]} />
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
          </>
        )}
        
        {/* Uproszczony styl mapy - tylko kontury budynków i drogi */}
        <TileLayer
          attribution=''
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
      </LeafletMap>
    </div>
  );
};

export default MapContainer;