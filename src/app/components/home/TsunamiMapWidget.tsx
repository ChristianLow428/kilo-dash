'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/app/ui/card';

interface TsunamiZone {
  objectid: number;
  island: string;
  zone_type: string;
  zone_desc: string;
  zone_code: number;
  tsu_evac: number;
  evac_zone: string;
  mapnum: number | null;
  mapname: string | null;
  areausac: number;
  st_areashape: number;
  st_perimetershape?: number;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface TsunamiData {
  zones: TsunamiZone[];
  metadata: {
    source: string;
    totalZones: number;
    oahuZones: number;
    waimanaloZones: number;
    lastUpdated: string;
  };
}

export default function TsunamiMapWidget() {
  const [data, setData] = useState<TsunamiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      case 1: return '#ef4444'; // red
      case 2: return '#f97316'; // orange
      case 3: return '#22c55e'; // green
      default: return '#6b7280'; // gray
    }
  };

  const getZoneLabel = (zoneCode: number) => {
    switch (zoneCode) {
      case 1: return 'Evacuation Zone';
      case 2: return 'Extreme Zone';
      case 3: return 'Safe Zone';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600">
          <h3 className="text-lg font-semibold mb-2">Tsunami Zone Map</h3>
          <p>Error: {error}</p>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-gray-600">
          <h3 className="text-lg font-semibold mb-2">Tsunami Zone Map</h3>
          <p>No data available</p>
        </div>
      </Card>
    );
  }

  // Group zones by type for statistics
  const evacuationZones = data.zones.filter(zone => zone.zone_code === 1);
  const extremeZones = data.zones.filter(zone => zone.zone_code === 2);
  const safeZones = data.zones.filter(zone => zone.zone_code === 3);

  // Calculate total area for each zone type
  const evacuationArea = evacuationZones.reduce((sum, zone) => sum + zone.areausac, 0);
  const extremeArea = extremeZones.reduce((sum, zone) => sum + zone.areausac, 0);
  const safeArea = safeZones.reduce((sum, zone) => sum + zone.areausac, 0);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🗺️ Tsunami Zone Map
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Visual representation of tsunami evacuation zones on Oahu
        </p>

        {/* Conceptual Map */}
        <div className="relative bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6" style={{ height: '300px' }}>
          {/* Ocean */}
          <div className="absolute inset-0 bg-blue-100 rounded-lg"></div>
          
          {/* Land Mass */}
          <div className="absolute inset-4 bg-green-100 rounded-lg border-2 border-green-300"></div>
          
          {/* Zone Representations */}
          <div className="absolute inset-6">
            {/* Safe Zones (Green) */}
            <div className="absolute top-2 left-2 w-16 h-8 bg-green-300 rounded border-2 border-green-500 opacity-80"></div>
            <div className="absolute top-2 right-2 w-12 h-6 bg-green-300 rounded border-2 border-green-500 opacity-80"></div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-10 bg-green-300 rounded border-2 border-green-500 opacity-80"></div>
            
            {/* Extreme Evacuation Zones (Orange) */}
            <div className="absolute top-1/4 left-1/4 w-8 h-4 bg-orange-300 rounded border-2 border-orange-500 opacity-80"></div>
            <div className="absolute top-1/3 right-1/3 w-6 h-3 bg-orange-300 rounded border-2 border-orange-500 opacity-80"></div>
            <div className="absolute bottom-1/4 left-1/3 w-10 h-5 bg-orange-300 rounded border-2 border-orange-500 opacity-80"></div>
            
            {/* Standard Evacuation Zones (Red) */}
            <div className="absolute top-1/2 left-1/6 w-4 h-2 bg-red-300 rounded border-2 border-red-500 opacity-80"></div>
            <div className="absolute top-2/3 right-1/4 w-6 h-3 bg-red-300 rounded border-2 border-red-500 opacity-80"></div>
            <div className="absolute bottom-1/3 left-1/2 w-8 h-4 bg-red-300 rounded border-2 border-red-500 opacity-80"></div>
            
            {/* Waimanalo Location Marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-purple-600 rounded-full border-2 border-white shadow-lg"></div>
              <div className="text-xs text-purple-800 font-semibold mt-1 text-center">Waimanalo</div>
            </div>
          </div>
          
          {/* Map Title */}
          <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-semibold">
            Oahu Tsunami Zones
          </div>
        </div>

        {/* Zone Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-red-800 font-semibold text-sm">🚨 Evacuation</div>
                <div className="text-lg font-bold text-red-600">{evacuationZones.length}</div>
              </div>
              <div className="w-4 h-4 bg-red-500 rounded"></div>
            </div>
            <div className="text-xs text-red-600 mt-1">{evacuationArea.toFixed(0)} acres</div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-orange-800 font-semibold text-sm">⚠️ Extreme</div>
                <div className="text-lg font-bold text-orange-600">{extremeZones.length}</div>
              </div>
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
            </div>
            <div className="text-xs text-orange-600 mt-1">{extremeArea.toFixed(0)} acres</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-800 font-semibold text-sm">✅ Safe</div>
                <div className="text-lg font-bold text-green-600">{safeZones.length}</div>
              </div>
              <div className="w-4 h-4 bg-green-500 rounded"></div>
            </div>
            <div className="text-xs text-green-600 mt-1">{safeArea.toFixed(0)} acres</div>
          </div>
        </div>

        {/* Zone Legend */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Zone Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <div>
                <div className="text-sm font-medium">Zone 1 - Standard Evacuation</div>
                <div className="text-xs text-gray-600">Evacuate immediately for any tsunami warning</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <div>
                <div className="text-sm font-medium">Zone 2 - Extreme Evacuation</div>
                <div className="text-xs text-gray-600">Evacuate for extreme tsunami warnings</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <div>
                <div className="text-sm font-medium">Zone 3 - Safe Zone</div>
                <div className="text-xs text-gray-600">Safe areas to evacuate to</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Facts */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-800 mb-2">📊 Quick Facts</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-blue-600 font-medium">Total Zones</div>
              <div className="text-blue-800 font-bold">{data.zones.length}</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Total Area</div>
              <div className="text-blue-800 font-bold">{(evacuationArea + extremeArea + safeArea).toFixed(0)} acres</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Data Source</div>
              <div className="text-blue-800 font-bold">Hawaii Statewide GIS</div>
            </div>
            <div>
              <div className="text-blue-600 font-medium">Last Updated</div>
              <div className="text-blue-800 font-bold">{new Date(data.metadata.lastUpdated).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Data Source */}
        <div className="text-xs text-gray-500 border-t pt-4">
          <p><strong>Data Source:</strong> {data.metadata.source}</p>
          <p><strong>Total Oahu Zones:</strong> {data.metadata.oahuZones}</p>
          <p><strong>Zones Near Waimanalo:</strong> {data.metadata.waimanaloZones}</p>
        </div>
      </div>
    </Card>
  );
} 