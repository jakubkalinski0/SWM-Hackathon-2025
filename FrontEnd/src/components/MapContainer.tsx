import React, { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, Typography } from '@mui/material';
import initSqlJs from 'sql.js';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different recycling types
const createCustomIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  'recycling_glass_bottles': createCustomIcon('green'),
  'unknown': createCustomIcon('grey'),
  'recycling_clothes': createCustomIcon('violet'),
  'recycling_cans': createCustomIcon('orange'),
  'waste_basket': createCustomIcon('black'),
  'recycling_aluminium': createCustomIcon('silver'),
  'recycling_scrap_metal': createCustomIcon('steelblue'),
  'recycling_batteries': createCustomIcon('yellow'),
  'recycling_drugs': createCustomIcon('red'),
  'recycling_paper': createCustomIcon('white'),
  'recycling_bio': createCustomIcon('brown'),
  'recycling_electrical_items': createCustomIcon('blue'),
  'recycling_cardboard': createCustomIcon('beige'),
  'recycling_green_waste': createCustomIcon('darkgreen'),
  'recycling_plastic_bottle_caps': createCustomIcon('lightblue'),
};

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

interface RecyclingPoint {
  id: number;
  type: string;
  lat: number;
  lng: number;
  address?: string;
}

const ChangeView = ({ center }: { center: L.LatLngExpression }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

const MapContainer: React.FC<MapContainerProps> = ({ userLocation }) => {
  const [recyclingPoints, setRecyclingPoints] = useState<RecyclingPoint[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [db, setDb] = useState<any>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [nearestBin, setNearestBin] = useState<RecyclingPoint | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const krakowZablocieCoords: L.LatLngExpression = [50.047, 19.961];

  useEffect(() => {
    const loadDb = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        });
        
        const newDb = new SQL.Database();
        setDb(newDb);
        
        newDb.run(`
          CREATE TABLE IF NOT EXISTS recycling_points (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            lat REAL,
            lng REAL,
            address TEXT
          );
        `);
        
        const result = newDb.exec("SELECT COUNT(*) as count FROM recycling_points");
        if (result[0].values[0][0] === 0) {
          newDb.run(`
            INSERT INTO recycling_points (type, lat, lng, address) VALUES 
            ('recycling_glass_bottles', 50.0475, 19.9615, 'Sample address 1'),
            ('waste_basket', 50.0465, 19.9605, 'Sample address 2'),
            ('recycling_paper', 50.048, 19.962, 'Sample address 3');
          `);
        }
        
        fetchRecyclingPoints(newDb);
      } catch (err) {
        console.error('Error initializing SQL.js:', err);
      }
    };
    
    loadDb();
  }, []);

  const fetchRecyclingPoints = (database: any) => {
    try {
      const result = database.exec("SELECT * FROM recycling_points");
      if (result.length > 0) {
        const points = result[0].values.map((row: any) => ({
          id: row[0],
          type: row[1],
          lat: row[2],
          lng: row[3],
          address: row[4]
        }));
        setRecyclingPoints(points);
      }
    } catch (err) {
      console.error('Error fetching recycling points:', err);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const findNearestBin = () => {
    if (!userLocation || recyclingPoints.length === 0) return null;

    let nearest = null;
    let minDistance = Infinity;

    recyclingPoints.forEach(point => {
      const dist = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        point.lat,
        point.lng
      );
      
      if (dist < minDistance) {
        minDistance = dist;
        nearest = point;
      }
    });

    return { bin: nearest, distance: minDistance };
  };

  const generateRoute = (start: { lat: number, lng: number }, end: { lat: number, lng: number }) => {
    // Simple straight line route for demo purposes
    // In a real app, you would use a routing API like OSRM or Mapbox
    return [
      [start.lat, start.lng],
      [end.lat, end.lng]
    ] as [number, number][];
  };

  const handleScan = () => {
    setIsScanning(true);
    
    setTimeout(() => {
      if (!db || !userLocation) {
        setIsScanning(false);
        return;
      }

      // Find nearest bin
      const result = findNearestBin();
      if (!result || !result.bin) {
        setIsScanning(false);
        return;
      }

      setNearestBin(result.bin);
      setDistance(result.distance);
      
      // Generate route
      const newRoute = generateRoute(userLocation, result.bin);
      setRoute(newRoute);

      setIsScanning(false);
    }, 2000);
  };

  return (
    <div style={{ height: '500px', width: '100%', position: 'relative' }}>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleScan}
        disabled={isScanning}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
        }}
      >
        {isScanning ? 'Skanowanie...' : 'Skan'}
      </Button>
      
      {distance && nearestBin && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '10px',
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <Typography variant="subtitle1">
            Najbliższy kosz: {nearestBin.type}
          </Typography>
          <Typography variant="body2">
            Dystans: {distance.toFixed(2)} metrów
          </Typography>
        </div>
      )}
      
      <LeafletMap
        center={userLocation ? [userLocation.lat, userLocation.lng] : krakowZablocieCoords}
        zoom={17}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {userLocation && (
          <>
            <ChangeView center={[userLocation.lat, userLocation.lng]} />
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
          </>
        )}
        
        {/* Display recycling points */}
        {recyclingPoints.map(point => (
          <Marker
            key={`recycling-${point.id}`}
            position={[point.lat, point.lng]}
            icon={icons[point.type as keyof typeof icons] || icons['unknown']}
          />
        ))}
        
        {/* Display route to nearest bin */}
        {route.length > 0 && (
          <Polyline 
            positions={route} 
            color="red"
            weight={3}
            opacity={0.7}
          />
        )}
        
        <TileLayer
          attribution=''
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
      </LeafletMap>
    </div>
  );
};

export default MapContainer;