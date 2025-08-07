
'use client';

import SoilDataWidget from "@/app/components/home/SoilDataWidget";
import WaimanaloStreamWidget from "@/app/components/home/WaimanaloStreamWidget";
import LocationMap from "@/app/components/home/LocationMap";
import ShorelineMap from "@/app/components/home/ShorelineMap";
import GeographicNamesWidget from "@/app/components/home/GeographicNamesWidget";
import TsunamiEvacuationMap from "@/app/components/home/TsunamiEvacuationMap";

export default function Page() {
    return (
        <div className="space-y-4 md:space-y-6">
            <p className="text-tremor-content">
                This page displays publicly available data related to the Waimanalo area, including real-time stream gauge information, soil composition data, shoreline access information, and tsunami evacuation zones.
            </p>
            
            {/* Location Map Section */}
            <div className="space-y-4">
                <LocationMap />
            </div>
            
            {/* Environmental Data Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">🌿 Environmental Data</h2>
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                    <SoilDataWidget />
                    <WaimanaloStreamWidget />
                    <ShorelineMap />
                </div>
            </div>
            
            {/* Geographic Information Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">🗺️ Geographic Information</h2>
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                    <GeographicNamesWidget />
                </div>
            </div>
            
            {/* Emergency Information Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">🚨 Emergency Information</h2>
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                    <TsunamiEvacuationMap />
                </div>
            </div>
        </div>
    );
} 