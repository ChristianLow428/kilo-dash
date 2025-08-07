'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/app/ui/card';
import dynamic from 'next/dynamic';
import configureLeaflet from '../../lib/leaflet-config';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const Polygon = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polygon),
  { ssr: false }
);

interface TsunamiZone {
  objectid: number;
  island: string;
  zone_type: string;
  zone_desc: string;
  zone_code: number; // Changed to number
  tsu_evac: number;
  evac_zone: string;
  areausac: number;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface TsunamiData {
  zones: TsunamiZone[];
  metadata: {
    source: string;
    description: string;
    lastUpdated: string;
    totalZones: number;
  };
}

// Oahu coordinates and bounds
const OAHU_COORDS: [number, number] = [21.4389, -157.9497];
const OAHU_BOUNDS: [[number, number], [number, number]] = [
  [21.2, -158.3], // Southwest
  [21.7, -157.6]  // Northeast
];

// Waimanalo coordinates
const WAIMANALO_COORDS: [number, number] = [21.33861, -157.70005];

export default function TsunamiEvacuationMap() {
  const [data, setData] = useState<TsunamiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configure Leaflet on client side
  useEffect(() => {
    configureLeaflet();
  }, []);

  useEffect(() => {
    const fetchTsunamiData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tsunami-zones?lat=21.33861&lon=-157.70005');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tsunamiData: TsunamiData = await response.json();
        setData(tsunamiData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tsunami data');
      } finally {
        setLoading(false);
      }
    };

    fetchTsunamiData();
  }, []);

  const getZoneColor = (zoneCode: number) => {
    switch (zoneCode) {
      case 1: return '#dc2626'; // light red - evacuation zone
      case 2: return '#ea580c'; // light orange - extreme evacuation zone
      case 3: return '#16a34a'; // light green - safe zone
      default: return '#6b7280'; // gray
    }
  };

  const getZoneOpacity = (zoneCode: number) => {
    switch (zoneCode) {
      case 1: return 0.3; // light red fill for evacuation zone
      case 2: return 0.4; // light orange fill for extreme evacuation zone
      case 3: return 0.3; // light green fill for safe zone
      default: return 0.2;
    }
  };

  const getZoneLabel = (zoneCode: number) => {
    switch (zoneCode) {
      case 1: return 'Evacuation Zone';
      case 2: return 'Extreme Evacuation Zone';
      case 3: return 'Safe Zone';
      default: return 'Unknown Zone';
    }
  };

  // Filter zones by type
  const extremeEvacuationZones = data?.zones.filter(zone => zone.zone_code === 2) || [];
  
  console.log('Extreme evacuation zones (code "2"):', extremeEvacuationZones.length);

  // Helper function to process MultiPolygon coordinates
  const processMultiPolygonCoordinates = (coordinates: number[][][]) => {
    const polygons: [number, number][][] = [];
    
    console.log('Processing coordinates:', coordinates.length, 'polygons');
    
    for (let polygonIndex = 0; polygonIndex < coordinates.length; polygonIndex++) {
      const polygon = coordinates[polygonIndex];
      console.log(`Processing polygon ${polygonIndex} with`, polygon.length, 'rings');
      
      // Each polygon can have multiple rings (outer boundary + holes)
      for (let ringIndex = 0; ringIndex < polygon.length; ringIndex++) {
        const ring = polygon[ringIndex];
        console.log(`Processing ring ${ringIndex} with`, ring.length, 'coordinates');
        
        if (ring.length < 3) {
          console.log('Skipping ring with insufficient coordinates:', ring.length);
          continue; // Skip rings with less than 3 coordinates
        }
        
        const positions: [number, number][] = [];
        
        for (const coord of ring) {
          if (coord.length >= 2) {
            // GeoJSON uses [lon, lat] order, Leaflet uses [lat, lon]
            positions.push([coord[1], coord[0]]);
          }
        }
        
        if (positions.length >= 3) {
          console.log(`Created valid polygon ${polygonIndex}-${ringIndex} with`, positions.length, 'coordinates');
          console.log('First few positions:', positions.slice(0, 3));
          polygons.push(positions);
        } else {
          console.log('Skipping invalid polygon with', positions.length, 'coordinates');
        }
      }
    }
    
    console.log('Total valid polygons created:', polygons.length);
    return polygons;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            🌊 Tsunami Evacuation Zones - Oahu
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Loading tsunami evacuation zones...
          </p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            🌊 Tsunami Evacuation Zones - Oahu
          </h3>
          <p className="text-red-600 text-sm mb-4">
            Error: {error}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🌊 Tsunami Evacuation Zones - Oahu
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Interactive map showing tsunami evacuation zones across Oahu from Hawaii Statewide GIS Program
        </p>

        {/* Interactive Leaflet Map */}
        <div className="relative h-96 w-full rounded-lg overflow-hidden border-2 border-gray-200 mb-6">
          <MapContainer
            center={[21.39, -157.72]} // Adjusted to show both Waimanalo and evacuation zones
            zoom={10} // Adjusted zoom level
            style={{ height: '500px', width: '100%' }}
          >
            {/* OpenStreetMap tiles */}
            <TileLayer
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Waimanalo Reference Marker */}
            <Marker position={[21.33861, -157.70005]}>
              <Popup>
                <div>
                  <h3 className="font-bold">Waimanalo</h3>
                  <p>Reference location for tsunami evacuation zones</p>
                </div>
              </Popup>
            </Marker>

            {/* Extreme Evacuation Zones (Zone 2) */}
            {extremeEvacuationZones.map((zone, zoneIndex) => {
              console.log('Rendering extreme evacuation zone:', zone.objectid);
              const polygons = processMultiPolygonCoordinates(zone.geometry.coordinates);
              console.log('Created', polygons.length, 'polygons for zone', zone.objectid);
              
              return polygons.map((positions, polygonIndex) => {
                console.log('Rendering polygon', polygonIndex, 'with', positions.length, 'coordinates');
                return (
                  <Polygon
                    key={`extreme-${zone.objectid}-polygon-${polygonIndex}`}
                    positions={positions}
                    pathOptions={{
                      color: '#ea580c', // orange border
                      fillColor: '#fed7aa', // light orange fill
                      fillOpacity: 0.6, // Increased opacity for better visibility
                      weight: 4, // Increased weight for better visibility
                      opacity: 1.0 // Full opacity for better visibility
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <h3 className="font-bold text-orange-600">{getZoneLabel(zone.zone_code)}</h3>
                        <p><strong>Zone Code:</strong> {zone.zone_code}</p>
                        <p><strong>Type:</strong> {zone.zone_type}</p>
                        <p><strong>Description:</strong> {zone.zone_desc}</p>
                        <p><strong>Area:</strong> {zone.areausac.toLocaleString()} acres</p>
                        <p><strong>Polygon:</strong> {polygonIndex + 1} of {polygons.length}</p>
                        <p><strong>Coordinates:</strong> {positions.length} points</p>
                      </div>
                    </Popup>
                  </Polygon>
                );
              });
            })}

            {/* Safe Zones (Zone 3) */}
            {/* Safe Zones (Zone 3) */}
            {/* Safe Zones (Zone 3) */}
          </MapContainer>
        </div>

        {/* Zone Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-orange-600 mb-2">
              ⚠️ Extreme Evacuation Zones
            </h3>
            <p className="text-2xl font-bold text-orange-700">{extremeEvacuationZones.length}</p>
            <p className="text-sm text-gray-600">Zone Code: 2</p>
          </Card>
        </div>

        {/* Data Source */}
        <div className="text-xs text-gray-500">
          <p><strong>Source:</strong> {data?.metadata.source}</p>
          <p><strong>Last Updated:</strong> {data?.metadata.lastUpdated}</p>
          <p><strong>Total Zones:</strong> {data?.metadata.totalZones}</p>
        </div>
      </div>
    </Card>
  );
} 