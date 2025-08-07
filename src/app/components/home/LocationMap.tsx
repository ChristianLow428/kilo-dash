'use client';

import { useEffect } from 'react';
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

// Waimanalo coordinates
const WAIMANALO_COORDS: [number, number] = [21.33861, -157.70005];

// Oahu bounding box
const OAHU_BOUNDS: [[number, number], [number, number]] = [
  [21.25, -158.3], // Southwest
  [21.75, -157.6]  // Northeast
];

export default function LocationMap() {
  // Configure Leaflet on client side
  useEffect(() => {
    configureLeaflet();
  }, []);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          📍 Data Source Location - Waimanalo, Oahu
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Interactive map showing the Waimanalo area on Oahu where our environmental and emergency data is sourced from.
        </p>

        {/* Interactive Leaflet Map */}
        <div className="relative h-96 w-full rounded-lg overflow-hidden border-2 border-gray-200 mb-6">
          <MapContainer
            center={WAIMANALO_COORDS}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            bounds={OAHU_BOUNDS}
          >
            {/* OpenStreetMap tiles */}
            <TileLayer
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Waimanalo Marker */}
            <Marker position={WAIMANALO_COORDS}>
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-purple-800">📍 Waimanalo</h4>
                  <p className="text-sm text-gray-600">Data Source Location</p>
                  <p className="text-xs text-gray-500">
                    Latitude: {WAIMANALO_COORDS[0].toFixed(5)}°N<br />
                    Longitude: {WAIMANALO_COORDS[1].toFixed(5)}°W
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <p><strong>Available Data:</strong></p>
                    <ul className="text-left mt-1">
                      <li>• Soil Health Information</li>
                      <li>• Stream Gauge Data</li>
                      <li>• Geographic Names</li>
                      <li>• Shoreline Data</li>
                      <li>• Emergency Information</li>
                    </ul>
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Location Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">📍 About Waimanalo</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-blue-600 font-medium">Location</div>
              <div className="text-blue-800">Windward Coast, Oahu, Hawaii</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Coordinates</div>
              <div className="text-blue-800">21.33861°N, 157.70005°W</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Region</div>
              <div className="text-blue-800">Honolulu County</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Island</div>
              <div className="text-blue-800">Oahu</div>
            </div>
          </div>
        </div>

        {/* Data Coverage */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">📊 Data Coverage Area</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-green-800 font-semibold text-sm">🌿 Environmental</div>
              <div className="text-xs text-green-600 mt-1">Soil health, stream data, shoreline information</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-blue-800 font-semibold text-sm">🗺️ Geographic</div>
              <div className="text-xs text-blue-600 mt-1">Place names, landmarks, natural features</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="text-orange-800 font-semibold text-sm">🚨 Emergency</div>
              <div className="text-xs text-orange-600 mt-1">Tsunami zones, evacuation information</div>
            </div>
          </div>
        </div>




      </div>
    </Card>
  );
} 