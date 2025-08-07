'use client';

import { Card } from "@/app/ui/card";
import { useEffect, useState } from "react";

interface ShorelinePoint {
    lat: number;
    lon: number;
    elevation?: number;
    type?: string;
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
    };
}

export default function ShorelineWidget() {
    const [shorelineData, setShorelineData] = useState<ShorelineData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchShorelineData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/shoreline-data?lat=21.33861&lon=-157.70005');
            if (!response.ok) {
                throw new Error('Failed to fetch shoreline data');
            }
            const data = await response.json();
            setShorelineData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShorelineData();
    }, []);

    if (loading) {
        return (
            <Card>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Waimanalo Shoreline</h2>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p>Loading shoreline data...</p>
                    </div>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Waimanalo Shoreline</h2>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-red-500">{error}</p>
                    </div>
                </div>
            </Card>
        );
    }

    if (!shorelineData || shorelineData.shorelinePoints.length === 0) {
        return (
            <Card>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Waimanalo Shoreline</h2>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p>No shoreline data available</p>
                    </div>
                </div>
            </Card>
        );
    }

    // Calculate bounds for the map
    const lats = shorelineData.shorelinePoints.map(p => p.lat);
    const lons = shorelineData.shorelinePoints.map(p => p.lon);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    // Normalize coordinates for display
    const normalizeCoord = (value: number, min: number, max: number) => {
        return ((value - min) / (max - min)) * 100;
    };

    return (
        <Card>
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Waimanalo Shoreline</h2>
                
                {/* Shoreline Map Visualization */}
                <div className="relative h-64 bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg border-2 border-blue-300 overflow-hidden mb-4">
                    {/* Ocean background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-200 to-blue-400"></div>
                    
                    {/* Land background */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-b from-green-200 to-green-400"></div>
                    
                    {/* Shoreline points */}
                    {shorelineData.shorelinePoints.map((point, index) => {
                        const x = normalizeCoord(point.lon, minLon, maxLon);
                        const y = 100 - normalizeCoord(point.lat, minLat, maxLat);
                        
                        return (
                            <div
                                key={index}
                                className="absolute w-2 h-2 bg-yellow-400 border border-yellow-600 rounded-full transform -translate-x-1 -translate-y-1"
                                style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                }}
                                title={`Lat: ${point.lat.toFixed(4)}, Lon: ${point.lon.toFixed(4)}`}
                            />
                        );
                    })}
                    
                    {/* Shoreline line */}
                    <svg className="absolute inset-0 w-full h-full">
                        <polyline
                            points={shorelineData.shorelinePoints.map((point, index) => {
                                const x = normalizeCoord(point.lon, minLon, maxLon);
                                const y = 100 - normalizeCoord(point.lat, minLat, maxLat);
                                return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#fbbf24"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    
                    {/* Location marker */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg"></div>
                        <div className="text-xs text-gray-700 mt-1 text-center">Waimanalo</div>
                    </div>
                    
                    {/* Legend */}
                    <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded p-2 text-xs">
                        <div className="font-medium mb-1">Legend:</div>
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-yellow-400 border border-yellow-600 rounded-full"></div>
                            <span>Shoreline Points</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                            <span>Waimanalo Center</span>
                        </div>
                    </div>
                </div>
                
                {/* Shoreline Statistics */}
                <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Shoreline Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p><span className="font-medium">Total Points:</span> {shorelineData.shorelinePoints.length}</p>
                            <p><span className="font-medium">Latitude Range:</span> {minLat.toFixed(4)}° to {maxLat.toFixed(4)}°</p>
                        </div>
                        <div>
                            <p><span className="font-medium">Longitude Range:</span> {minLon.toFixed(4)}° to {maxLon.toFixed(4)}°</p>
                            <p><span className="font-medium">Elevation:</span> Sea Level (0m)</p>
                        </div>
                    </div>
                </div>
                
                {/* Shoreline Points Table */}
                <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Shoreline Points</h3>
                    <div className="max-h-32 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-2 py-1 text-left">Point</th>
                                    <th className="px-2 py-1 text-left">Latitude</th>
                                    <th className="px-2 py-1 text-left">Longitude</th>
                                    <th className="px-2 py-1 text-left">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shorelineData.shorelinePoints.slice(0, 10).map((point, index) => (
                                    <tr key={index} className="border-b border-gray-100">
                                        <td className="px-2 py-1">{index + 1}</td>
                                        <td className="px-2 py-1">{point.lat.toFixed(4)}°</td>
                                        <td className="px-2 py-1">{point.lon.toFixed(4)}°</td>
                                        <td className="px-2 py-1 capitalize">{point.type}</td>
                                    </tr>
                                ))}
                                {shorelineData.shorelinePoints.length > 10 && (
                                    <tr>
                                        <td colSpan={4} className="px-2 py-1 text-center text-gray-500">
                                            ... and {shorelineData.shorelinePoints.length - 10} more points
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Data Source */}
                <div className="mt-4 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                        <p><strong>Source:</strong> {shorelineData.metadata.source}</p>
                        <p><strong>Last Updated:</strong> {shorelineData.metadata.lastUpdated}</p>
                        <p><strong>Location:</strong> {shorelineData.location.lat.toFixed(5)}°N, {shorelineData.location.lon.toFixed(5)}°W</p>
                        <a 
                            href={shorelineData.metadata.dataUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                        >
                            View ArcGIS Web Scene
                        </a>
                    </div>
                </div>
            </div>
        </Card>
    );
} 