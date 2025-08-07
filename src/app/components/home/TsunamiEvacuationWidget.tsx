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

export default function TsunamiEvacuationWidget() {
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
      case 1: return 'bg-red-100 border-red-300 text-red-800';
      case 2: return 'bg-orange-100 border-orange-300 text-orange-800';
      case 3: return 'bg-green-100 border-green-300 text-green-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getZoneIcon = (zoneCode: number) => {
    switch (zoneCode) {
      case 1: return '🚨';
      case 2: return '⚠️';
      case 3: return '✅';
      default: return '📍';
    }
  };

  const getZoneDescription = (zoneCode: number) => {
    switch (zoneCode) {
      case 1: return 'Standard Evacuation Zone';
      case 2: return 'Extreme Evacuation Zone';
      case 3: return 'Safe Zone';
      default: return 'Unknown Zone';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600">
          <h3 className="text-lg font-semibold mb-2">Tsunami Evacuation Zones</h3>
          <p>Error: {error}</p>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-gray-600">
          <h3 className="text-lg font-semibold mb-2">Tsunami Evacuation Zones</h3>
          <p>No data available</p>
        </div>
      </Card>
    );
  }

  // Group zones by type
  const evacuationZones = data.zones.filter(zone => zone.zone_code === 1);
  const extremeZones = data.zones.filter(zone => zone.zone_code === 2);
  const safeZones = data.zones.filter(zone => zone.zone_code === 3);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🌊 Tsunami Evacuation Zones
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Real evacuation zone data for Oahu from Hawaii Statewide GIS Program
        </p>
        
        {/* Emergency Information */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-red-800 mb-2">🚨 Emergency Information</h4>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• <strong>Zone 1 (Red):</strong> Evacuate immediately for any tsunami warning</li>
            <li>• <strong>Zone 2 (Orange):</strong> Evacuate for extreme tsunami warnings</li>
            <li>• <strong>Zone 3 (Green):</strong> Safe areas to evacuate to</li>
            <li>• Always follow official emergency instructions</li>
            <li>• Monitor local news and emergency broadcasts</li>
          </ul>
        </div>

        {/* Zone Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-red-800 font-semibold">🚨 Evacuation Zones</div>
            <div className="text-2xl font-bold text-red-600">{evacuationZones.length}</div>
            <div className="text-xs text-red-600">Standard Risk</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-orange-800 font-semibold">⚠️ Extreme Zones</div>
            <div className="text-2xl font-bold text-orange-600">{extremeZones.length}</div>
            <div className="text-xs text-orange-600">High Risk</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-green-800 font-semibold">✅ Safe Zones</div>
            <div className="text-2xl font-bold text-green-600">{safeZones.length}</div>
            <div className="text-xs text-green-600">Safe Areas</div>
          </div>
        </div>

        {/* Evacuation Zones */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Evacuation Zones (Zone 1)</h4>
          <div className="space-y-3">
            {evacuationZones.slice(0, 5).map((zone) => (
              <div key={zone.objectid} className={`p-3 rounded-lg border ${getZoneColor(zone.zone_code)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{getZoneIcon(zone.zone_code)} {getZoneDescription(zone.zone_code)}</div>
                    <div className="text-sm opacity-75">{zone.zone_desc}</div>
                    <div className="text-xs opacity-60">Area: {zone.areausac.toFixed(1)} acres</div>
                  </div>
                </div>
              </div>
            ))}
            {evacuationZones.length > 5 && (
              <div className="text-sm text-gray-500 text-center">
                +{evacuationZones.length - 5} more evacuation zones
              </div>
            )}
          </div>
        </div>

        {/* Extreme Evacuation Zones */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Extreme Evacuation Zones (Zone 2)</h4>
          <div className="space-y-3">
            {extremeZones.slice(0, 3).map((zone) => (
              <div key={zone.objectid} className={`p-3 rounded-lg border ${getZoneColor(zone.zone_code)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{getZoneIcon(zone.zone_code)} {getZoneDescription(zone.zone_code)}</div>
                    <div className="text-sm opacity-75">{zone.zone_desc}</div>
                    <div className="text-xs opacity-60">Area: {zone.areausac.toFixed(1)} acres</div>
                  </div>
                </div>
              </div>
            ))}
            {extremeZones.length > 3 && (
              <div className="text-sm text-gray-500 text-center">
                +{extremeZones.length - 3} more extreme zones
              </div>
            )}
          </div>
        </div>

        {/* Safe Zones */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Safe Zones (Zone 3)</h4>
          <div className="space-y-3">
            {safeZones.slice(0, 3).map((zone) => (
              <div key={zone.objectid} className={`p-3 rounded-lg border ${getZoneColor(zone.zone_code)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{getZoneIcon(zone.zone_code)} {getZoneDescription(zone.zone_code)}</div>
                    <div className="text-sm opacity-75">{zone.zone_desc}</div>
                    <div className="text-xs opacity-60">Area: {zone.areausac.toFixed(1)} acres</div>
                  </div>
                </div>
              </div>
            ))}
            {safeZones.length > 3 && (
              <div className="text-sm text-gray-500 text-center">
                +{safeZones.length - 3} more safe zones
              </div>
            )}
          </div>
        </div>

        {/* Data Source */}
        <div className="text-xs text-gray-500 border-t pt-4">
          <p><strong>Data Source:</strong> {data.metadata.source}</p>
          <p><strong>Total Oahu Zones:</strong> {data.metadata.oahuZones}</p>
          <p><strong>Last Updated:</strong> {new Date(data.metadata.lastUpdated).toLocaleDateString()}</p>
        </div>
      </div>
    </Card>
  );
} 