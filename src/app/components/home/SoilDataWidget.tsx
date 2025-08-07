
'use client';

import { Card } from "@/app/ui/card";
import { useEffect, useState } from "react";

interface SoilHealthData {
    location: {
        lat: number;
        lon: number;
    };
    soilSeries: string;
    drainageClass: string;
    hydrologicGroup: string;
    erosionFactor: string;
    organicMatter: string;
    phLevel: string;
    soilTaxonomy: {
        order: string;
        suborder: string;
        greatGroup: string;
        subgroup: string;
    };
    suitability: {
        agricultural: string;
        drainage: string;
        erosion: string;
    };
    physicalProperties: {
        texture: string;
        slope: string;
        depth: string;
    };
}

export default function SoilDataWidget() {
    const [soilData, setSoilData] = useState<SoilHealthData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSoilData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/soil-data?lat=21.33861&lon=-157.70005');
            if (!response.ok) {
                throw new Error('Failed to fetch soil health data');
            }
            const data = await response.json();
            setSoilData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSoilData();
    }, []);

    if (loading) {
        return (
            <Card>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Waimanalo Soil Health</h2>
                    <p>Loading soil health data...</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Waimanalo Soil Health</h2>
                    <p className="text-red-500">{error}</p>
                </div>
            </Card>
        );
    }

    if (!soilData) {
        return (
            <Card>
                <div className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Waimanalo Soil Health</h2>
                    <p>No soil health data available</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Waimanalo Soil Health</h2>
                
                {/* Soil Series Info */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Soil Series: {soilData.soilSeries}</h3>
                </div>

                {/* Soil Health Metrics */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Soil Health Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p><span className="font-medium">Drainage Class:</span> {soilData.drainageClass}</p>
                            <p><span className="font-medium">Hydrologic Group:</span> {soilData.hydrologicGroup}</p>
                            <p><span className="font-medium">Erosion Factor:</span> {soilData.erosionFactor}</p>
                            <p><span className="font-medium">Organic Matter:</span> {soilData.organicMatter}</p>
                        </div>
                        <div>
                            <p><span className="font-medium">pH Level:</span> {soilData.phLevel}</p>
                            <p><span className="font-medium">Texture:</span> {soilData.physicalProperties.texture}</p>
                            <p><span className="font-medium">Slope:</span> {soilData.physicalProperties.slope}</p>
                            <p><span className="font-medium">Depth:</span> {soilData.physicalProperties.depth}</p>
                        </div>
                    </div>
                </div>

                {/* Agricultural Suitability */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Agricultural Suitability</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="font-medium">Agricultural</p>
                            <p className={`text-lg font-bold ${
                                soilData.suitability.agricultural === 'Good' ? 'text-green-600' :
                                soilData.suitability.agricultural === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                                {soilData.suitability.agricultural}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="font-medium">Drainage</p>
                            <p className="text-lg font-bold">{soilData.suitability.drainage}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="font-medium">Erosion</p>
                            <p className="text-lg font-bold">{soilData.suitability.erosion}</p>
                        </div>
                    </div>
                </div>

                {/* Soil Taxonomy */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Soil Taxonomy</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p><span className="font-medium">Order:</span> {soilData.soilTaxonomy.order}</p>
                            <p><span className="font-medium">Suborder:</span> {soilData.soilTaxonomy.suborder}</p>
                        </div>
                        <div>
                            <p><span className="font-medium">Great Group:</span> {soilData.soilTaxonomy.greatGroup}</p>
                            <p><span className="font-medium">Subgroup:</span> {soilData.soilTaxonomy.subgroup}</p>
                        </div>
                    </div>
                </div>

                {/* Location Info */}
                <div className="mt-4 text-sm text-gray-500">
                    <p>Location: {soilData.location.lat.toFixed(5)}°N, {soilData.location.lon.toFixed(5)}°W</p>
                </div>
            </div>
        </Card>
    );
} 