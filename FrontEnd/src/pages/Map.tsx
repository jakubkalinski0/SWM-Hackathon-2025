import React, { useState, useEffect } from 'react';
import '@/styles/App.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MapContainer from '@/components/MapContainer';
import BinInfo from '@/components/BinInfo';
import RouteSelector from '@/components/RouteSelector';
import {getNearbyBins,getBinsByType} from '../services/binService.js'

interface Bin {
  id: number;
  type: 'general' | 'recycling';
  location: { lat: number; lng: number };
  acceptedWaste: string[];
  address?: string;
  distance?: number;
}

function Map() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [generalBins, setGeneralBins] = useState<Bin[]>([]);
  const [recyclingBins, setRecyclingBins] = useState<Bin[]>([]);
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDefaultLocation, setUsingDefaultLocation] = useState(false);
  
  // Default location: Zabłocie 43B, Kraków
  const defaultLocation = { lat: 50.047, lng: 19.961 };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            // Success callback
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // Check if location is within Kraków bounds
              if (isWithinKrakowBounds(latitude, longitude)) {
                setUserLocation({ lat: latitude, lng: longitude });
                await fetchBins(latitude, longitude);
              } else {
                setError("Twoja lokalizacja jest poza obszarem Krakowa. Używam domyślnej lokalizacji Zabłocie 43B.");
                setUserLocation(defaultLocation);
                setUsingDefaultLocation(true);
                await fetchBins(defaultLocation.lat, defaultLocation.lng);
              }
              setLoading(false);
            },
            // Error callback
            async (error) => {
              console.error("Geolocation error:", error);
              
              let errorMessage: string;
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = "Odmówiono dostępu do lokalizacji. Używam domyślnej lokalizacji Zabłocie 43B.";
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage = "Informacje o lokalizacji są niedostępne. Używam domyślnej lokalizacji Zabłocie 43B.";
                  break;
                case error.TIMEOUT:
                  errorMessage = "Upłynął limit czasu żądania lokalizacji. Używam domyślnej lokalizacji Zabłocie 43B.";
                  break;
                default:
                  errorMessage = "Wystąpił nieznany błąd podczas pobierania lokalizacji. Używam domyślnej lokalizacji Zabłocie 43B.";
              }
              
              setError(errorMessage);
              setUserLocation(defaultLocation);
              setUsingDefaultLocation(true);
              await fetchBins(defaultLocation.lat, defaultLocation.lng);
              setLoading(false);
            },
            // Options
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        } else {
          setError('Twoja przeglądarka nie obsługuje geolokalizacji. Używam domyślnej lokalizacji Zabłocie 43B.');
          setUserLocation(defaultLocation);
          setUsingDefaultLocation(true);
          await fetchBins(defaultLocation.lat, defaultLocation.lng);
          setLoading(false);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError(`Nieoczekiwany błąd: ${err instanceof Error ? err.message : String(err)}. Używam domyślnej lokalizacji Zabłocie 43B.`);
        setUserLocation(defaultLocation);
        setUsingDefaultLocation(true);
        await fetchBins(defaultLocation.lat, defaultLocation.lng);
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  // Function to check if coordinates are within Kraków bounds
  const isWithinKrakowBounds = (lat: number, lng: number): boolean => {
    // Approximate bounds of Kraków
    const southWest = { lat: 49.9, lng: 19.79 };
    const northEast = { lat: 50.12, lng: 20.22 };
    
    return (
      lat >= southWest.lat &&
      lat <= northEast.lat &&
      lng >= southWest.lng &&
      lng <= northEast.lng
    );
  };

  const fetchBins = async (lat: number, lng: number) => {
    try {
      const [general, recycling] = await Promise.all([
        getNearbyBins(lat, lng, 5),
        getBinsByType(lat, lng, 'recycling', 5)
      ]);
      
      setGeneralBins(general);
      setRecyclingBins(recycling);
    } catch (err) {
      console.error("Error fetching bins:", err);
      setError(`Błąd podczas pobierania danych o koszach: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchBins(
        userLocation ? userLocation.lat : defaultLocation.lat,
        userLocation ? userLocation.lng : defaultLocation.lng
      );
    } catch (err) {
      setError(`Błąd podczas odświeżania danych: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading p-4">Ładowanie danych dla Krakowa...</div>
      </div>
    );
  }

  return (
    <div className="app p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Znajdź najbliższe kosze na śmieci w Krakowie</h1>
      
      {usingDefaultLocation && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <p>Używam domyślnej lokalizacji: Zabłocie 43B, Kraków</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p>{error}</p>
        </div>
      )}
      
      <Card className="mb-4 p-4">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={handleManualRefresh} disabled={loading}>
            Odśwież dane
          </Button>
        </div>
        
      </Card>
      
      <Card className="mb-4 p-4">
        <div className="map-container">
          <MapContainer
            userLocation={userLocation}
            generalBins={generalBins}
            recyclingBins={recyclingBins}
            selectedBin={selectedBin}
          />
        </div>
      </Card>
      
      {selectedBin && (
        <Card className="p-4">
          <BinInfo bin={selectedBin} />
        </Card>
      )}
    </div>
  );
}

export default Map;