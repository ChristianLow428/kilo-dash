'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/app/ui/card';
import dynamic from 'next/dynamic';
import configureLeaflet from '../../lib/leaflet-config'; // Import Leaflet configuration

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

const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

interface ShorelinePoint {
  lat: number;
  lon: number;
  elevation?: number;
  type: string;
  name?: string;
  properties?: {
    parcel_owner?: string;
    parcel_operator?: string;
    access_type?: string;
    access_surface?: string;
    dedicated_area?: number;
    shore_type?: string;
    restroom?: string;
    showers?: string;
    picnic_facilities?: string;
    trash_receptacles?: string;
    water?: string;
    phone?: string;
    lifeguard?: string;
    sign_words?: string;
  };
}

interface ShorelineData {
  location: {
    lat: number;
    lon: number;
    area: string;
  };
  shorelinePoints: ShorelinePoint[];
  metadata: {
    source: string;
    description: string;
    lastUpdated: string;
    dataUrl: string;
    totalPoints: number;
    shorelineLength: number;
  };
}

// Waimanalo coordinates
const WAIMANALO_COORDS: [number, number] = [21.33861, -157.70005];

// Waimanalo area bounding box
const WAIMANALO_BOUNDS: [[number, number], [number, number]] = [
  [21.32, -157.75], // Southwest
  [21.38, -157.65]  // Northeast
];

export default function ShorelineMap() {
  const [data, setData] = useState<ShorelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configure Leaflet on client side
  useEffect(() => {
    configureLeaflet();
  }, []);

  useEffect(() => {
    const fetchShorelineData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shoreline-data?lat=21.33861&lon=-157.70005');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const shorelineData: ShorelineData = await response.json();
        setData(shorelineData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch shoreline data');
      } finally {
        setLoading(false);
      }
    };

    fetchShorelineData();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600">
          <h3 className="text-lg font-semibold mb-2">Shoreline Map</h3>
          <p>Error: {error}</p>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-gray-600">
          <h3 className="text-lg font-semibold mb-2">Shoreline Map</h3>
          <p>No data available</p>
        </div>
      </Card>
    );
  }

  // Convert shoreline points to polyline coordinates
  const shorelineCoords = data.shorelinePoints.map(point => [point.lat, point.lon] as [number, number]);

  // Group points by type for different markers
  const beachParkPoints = data.shorelinePoints.filter(point => point.type === 'beach_park');
  const accessPoints = data.shorelinePoints.filter(point => point.type === 'access_point');
  const otherPoints = data.shorelinePoints.filter(point => !['beach_park', 'access_point'].includes(point.type));

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🏖️ Waimanalo Shoreline Access Map
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Interactive map showing public shoreline access points and beach parks in the Waimanalo area
        </p>

        {/* Interactive Leaflet Map */}
        <div className="relative h-96 w-full rounded-lg overflow-hidden border-2 border-gray-200 mb-6">
          <MapContainer
            center={WAIMANALO_COORDS}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            bounds={WAIMANALO_BOUNDS}
          >
            {/* OpenStreetMap tiles */}
            <TileLayer
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Waimanalo Center Marker */}
            <Marker position={WAIMANALO_COORDS}>
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-purple-800">📍 Waimanalo</h4>
                  <p className="text-sm text-gray-600">Shoreline Data Center</p>
                  <p className="text-xs text-gray-500">
                    Lat: {WAIMANALO_COORDS[0].toFixed(5)}<br />
                    Lon: {WAIMANALO_COORDS[1].toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Shoreline Polyline */}
            {shorelineCoords.length > 1 && (
              <Polyline
                positions={shorelineCoords}
                pathOptions={{
                  color: '#3b82f6',
                  weight: 3,
                  opacity: 0.8
                }}
              >
                <Popup>
                  <div className="text-center">
                    <h4 className="font-semibold text-blue-800">🏖️ Shoreline Access Route</h4>
                    <p className="text-sm text-gray-600">Public access points along the coast</p>
                    <p className="text-xs text-gray-500">
                      Length: {data.metadata.shorelineLength.toFixed(1)} km<br />
                      Points: {data.shorelinePoints.length}
                    </p>
                  </div>
                </Popup>
              </Polyline>
            )}

            {/* Beach Park Points */}
            {beachParkPoints.map((point, index) => (
              <Marker key={`beach-park-${index}`} position={[point.lat, point.lon]}>
                <Popup>
                  <div className="text-center min-w-[200px]">
                    <h4 className="font-semibold text-green-800">🏖️ {point.name}</h4>
                    <p className="text-sm text-gray-600">Beach Park</p>
                    <div className="text-xs text-gray-500 mt-2 text-left">
                      <div><strong>Owner:</strong> {point.properties?.parcel_owner}</div>
                      <div><strong>Operator:</strong> {point.properties?.parcel_operator}</div>
                      <div><strong>Shore Type:</strong> {point.properties?.shore_type}</div>
                      <div><strong>Dedicated Area:</strong> {point.properties?.dedicated_area} acres</div>
                      <div><strong>Access Type:</strong> {point.properties?.access_type}</div>
                      <div><strong>Restroom:</strong> {point.properties?.restroom}</div>
                      <div><strong>Showers:</strong> {point.properties?.showers}</div>
                      <div><strong>Picnic Facilities:</strong> {point.properties?.picnic_facilities}</div>
                      <div><strong>Lifeguard:</strong> {point.properties?.lifeguard}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Access Points */}
            {accessPoints.map((point, index) => (
              <Marker key={`access-${index}`} position={[point.lat, point.lon]}>
                <Popup>
                  <div className="text-center min-w-[200px]">
                    <h4 className="font-semibold text-blue-800">🚶 {point.name}</h4>
                    <p className="text-sm text-gray-600">Public Access Point</p>
                    <div className="text-xs text-gray-500 mt-2 text-left">
                      <div><strong>Owner:</strong> {point.properties?.parcel_owner}</div>
                      <div><strong>Operator:</strong> {point.properties?.parcel_operator}</div>
                      <div><strong>Shore Type:</strong> {point.properties?.shore_type}</div>
                      <div><strong>Access Type:</strong> {point.properties?.access_type}</div>
                      <div><strong>Access Surface:</strong> {point.properties?.access_surface}</div>
                      <div><strong>Sign:</strong> {point.properties?.sign_words}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Other Points */}
            {otherPoints.map((point, index) => (
              <Marker key={`other-${index}`} position={[point.lat, point.lon]}>
                <Popup>
                  <div className="text-center">
                    <h4 className="font-semibold text-orange-800">📍 {point.name || 'Shoreline Point'}</h4>
                    <p className="text-sm text-gray-600">Shoreline feature</p>
                    <p className="text-xs text-gray-500">
                      Type: {point.type}<br />
                      Shore Type: {point.properties?.shore_type}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Shoreline Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-800 font-semibold text-sm">🏖️ Total Points</div>
                <div className="text-lg font-bold text-blue-600">{data.shorelinePoints.length}</div>
              </div>
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
            </div>
            <div className="text-xs text-blue-600 mt-1">Shoreline access points</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-800 font-semibold text-sm">🏖️ Beach Parks</div>
                <div className="text-lg font-bold text-green-600">{beachParkPoints.length}</div>
              </div>
              <div className="w-4 h-4 bg-green-500 rounded"></div>
            </div>
            <div className="text-xs text-green-600 mt-1">Public beach parks</div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-800 font-semibold text-sm">🚶 Access Points</div>
                <div className="text-lg font-bold text-blue-600">{accessPoints.length}</div>
              </div>
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
            </div>
            <div className="text-xs text-blue-600 mt-1">Public access ways</div>
          </div>
        </div>

        {/* Shoreline Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">🏖️ Shoreline Access Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-blue-600 font-medium">Total Access Points</div>
              <div className="text-blue-800 font-bold">{data.shorelinePoints.length}</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Data Source</div>
              <div className="text-blue-800 font-bold">{data.metadata.source}</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Beach Park Coverage</div>
              <div className="text-blue-800 font-bold">{((beachParkPoints.length / data.shorelinePoints.length) * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Last Updated</div>
              <div className="text-blue-800 font-bold">{new Date(data.metadata.lastUpdated).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 