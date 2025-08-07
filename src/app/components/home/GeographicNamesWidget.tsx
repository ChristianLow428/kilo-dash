'use client';

import { Card } from "@/app/ui/card";
import { useEffect, useState } from "react";
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

interface GeographicFeature {
    objectid: number;
    feature_id: number;
    map_name: string;
    feature_name: string;
    feature_class: string;
    state_numeric: number;
    county_name: string;
    county_numeric: number;
    prim_lat_dec: number;
    prim_long_dec: number;
    source_lat_dec: number;
    source_long_dec: number;
    lat: number;
    lon: number;
}

interface GeographicNamesData {
    location: {
        lat: number;
        lon: number;
        area: string;
    };
    features: {
        populated_places: GeographicFeature[];
        streams: GeographicFeature[];
        bays: GeographicFeature[];
        valleys: GeographicFeature[];
        mountains: GeographicFeature[];
        beaches: GeographicFeature[];
        other: GeographicFeature[];
    };
    metadata: {
        source: string;
        description: string;
        lastUpdated: string;
        totalFeatures: number;
    };
}

export default function GeographicNamesWidget() {
    const [geographicData, setGeographicData] = useState<GeographicNamesData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchGeographicData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/geographic-names?lat=21.33861&lon=-157.70005');
            if (!response.ok) {
                throw new Error('Failed to fetch geographic names');
            }
            const data = await response.json();
            setGeographicData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        configureLeaflet();
        fetchGeographicData();
    }, []);

    const getFeatureIcon = (featureClass: string) => {
        switch (featureClass.toLowerCase()) {
            case 'populated place':
            case 'census':
            case 'civil':
                return '🏘️';
            case 'stream':
            case 'canal':
                return '🌊';
            case 'bay':
                return '🏖️';
            case 'valley':
                return '🏔️';
            case 'summit':
            case 'ridge':
                return '⛰️';
            case 'beach':
                return '🏝️';
            default:
                return '📍';
        }
    };

    const getFeatureTypeLabel = (featureClass: string) => {
        switch (featureClass.toLowerCase()) {
            case 'populated place':
            case 'census':
            case 'civil':
                return 'Populated Place';
            case 'stream':
            case 'canal':
                return 'Stream';
            case 'bay':
                return 'Bay';
            case 'valley':
                return 'Valley';
            case 'summit':
            case 'ridge':
                return 'Mountain/Ridge';
            case 'beach':
                return 'Beach';
            default:
                return 'Other';
        }
    };

    if (loading) {
        return (
            <Card>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Geographic Names - Waimanalo</h2>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p>Loading geographic names...</p>
                    </div>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Geographic Names - Waimanalo</h2>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-red-500">{error}</p>
                    </div>
                </div>
            </Card>
        );
    }

    if (!geographicData) {
        return (
            <Card>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Geographic Names - Waimanalo</h2>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p>No geographic data available</p>
                    </div>
                </div>
            </Card>
        );
    }

    const allFeatures = [
        ...geographicData.features.populated_places,
        ...geographicData.features.streams,
        ...geographicData.features.bays,
        ...geographicData.features.valleys,
        ...geographicData.features.mountains,
        ...geographicData.features.beaches,
        ...geographicData.features.other
    ];

    return (
        <Card>
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Geographic Names - Waimanalo</h2>
                
                {/* Summary Statistics */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Feature Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-blue-50 rounded">
                            <div className="text-2xl">🏘️</div>
                            <div className="font-medium">Populated Place</div>
                            <div>{geographicData.features.populated_places.length}</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                            <div className="text-2xl">🌊</div>
                            <div className="font-medium">Streams</div>
                            <div>{geographicData.features.streams.length}</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded">
                            <div className="text-2xl">🏖️</div>
                            <div className="font-medium">Bays</div>
                            <div>{geographicData.features.bays.length}</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded">
                            <div className="text-2xl">⛰️</div>
                            <div className="font-medium">Mountains</div>
                            <div>{geographicData.features.mountains.length}</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded">
                            <div className="text-2xl">🏝️</div>
                            <div className="font-medium">Beaches</div>
                            <div>{geographicData.features.beaches.length}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-2xl">📍</div>
                            <div className="font-medium">Other</div>
                            <div>{geographicData.features.other.length}</div>
                        </div>
                    </div>
                </div>

                {/* Interactive Leaflet Map */}
                <div className="relative h-96 w-full rounded-lg overflow-hidden border-2 border-gray-200 mb-6">
                    <MapContainer
                        center={[21.33861, -157.70005]}
                        zoom={12}
                        style={{ height: '400px', width: '100%' }}
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
                                    <p>Reference location for geographic features</p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Geographic Features */}
                        {allFeatures.map((feature) => {
                            return (
                                <Marker 
                                    key={feature.feature_id} 
                                    position={[feature.lat, feature.lon]}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <h3 className="font-bold">{feature.feature_name}</h3>
                                            <p><strong>Type:</strong> {getFeatureTypeLabel(feature.feature_class)}</p>
                                            <p><strong>Coordinates:</strong> {feature.lat.toFixed(4)}°N, {feature.lon.toFixed(4)}°W</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>
                
                {/* Data Source */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                        <p><strong>Source:</strong> {geographicData.metadata.source}</p>
                        <p><strong>Total Features:</strong> {geographicData.metadata.totalFeatures}</p>
                        <p><strong>Last Updated:</strong> {geographicData.metadata.lastUpdated}</p>
                        <p><strong>Location:</strong> {geographicData.location.lat.toFixed(5)}°N, {geographicData.location.lon.toFixed(5)}°W</p>
                    </div>
                </div>
            </div>
        </Card>
    );
} 