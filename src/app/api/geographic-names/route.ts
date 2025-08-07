import { NextResponse } from 'next/server';
import path from 'path';
import { createReadStream } from 'fs';
import readline from 'readline';

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

async function readGNISFile(): Promise<GeographicFeature[]> {
    try {
        const filePath = path.join(process.cwd(), 'src', 'app', 'dashboard', 'public-information', 'GNIS_(Geographic_Names).geojson');
        console.log('Reading GNIS file:', filePath);
        
        const fs = require('fs');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const geojson = JSON.parse(fileContent);
        
        const features: GeographicFeature[] = [];
        
        if (geojson.features && Array.isArray(geojson.features)) {
            for (const feature of geojson.features) {
                if (feature.properties && feature.geometry) {
                    const props = feature.properties;
                    const geom = feature.geometry;
                    
                    // Extract coordinates from geometry
                    let lat = 0, lon = 0;
                    if (geom.coordinates && Array.isArray(geom.coordinates)) {
                        if (geom.type === 'Point') {
                            [lon, lat] = geom.coordinates;
                        } else if (geom.type === 'LineString' && geom.coordinates.length > 0) {
                            [lon, lat] = geom.coordinates[0];
                        } else if (geom.type === 'Polygon' && geom.coordinates.length > 0 && geom.coordinates[0].length > 0) {
                            [lon, lat] = geom.coordinates[0][0];
                        }
                    }
                    
                    // Validate coordinates
                    if (typeof lat === 'number' && typeof lon === 'number' && 
                        !isNaN(lat) && !isNaN(lon) && 
                        lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                        
                        features.push({
                            objectid: props.objectid || 0,
                            feature_id: props.feature_id || 0,
                            map_name: props.map_name || '',
                            feature_name: props.feature_name || '',
                            feature_class: props.feature_class || '',
                            state_numeric: props.state_numeric || 0,
                            county_name: props.county_name || '',
                            county_numeric: props.county_numeric || 0,
                            prim_lat_dec: props.prim_lat_dec || lat,
                            prim_long_dec: props.prim_long_dec || lon,
                            source_lat_dec: props.source_lat_dec || lat,
                            source_long_dec: props.source_long_dec || lon,
                            lat: lat,
                            lon: lon
                        });
                    }
                }
            }
        }
        
        console.log(`Parsed ${features.length} features from GNIS file`);
        return features;
    } catch (error) {
        console.error('Error reading GNIS file:', error);
        throw error;
    }
}

function isNearWaimanalo(lat: number, lon: number): boolean {
    // Waimanalo area bounds (approximate)
    const waimanaloBounds = {
        latMin: 21.32,
        latMax: 21.36,
        lonMin: -157.75,
        lonMax: -157.65
    };
    
    return lat >= waimanaloBounds.latMin && 
           lat <= waimanaloBounds.latMax && 
           lon >= waimanaloBounds.lonMin && 
           lon <= waimanaloBounds.lonMax;
}

export async function GET(request: Request) {
    try {
        console.log('=== GEOGRAPHIC NAMES API CALLED ===');
        
        // Get lat/lon from query parameters
        const url = new URL(request.url);
        const lat = url.searchParams.get('lat');
        const lon = url.searchParams.get('lon');

        if (!lat || !lon) {
            return NextResponse.json({ message: 'Missing lat/lon parameters' }, { status: 400 });
        }

        console.log('Coordinates:', lat, lon);

        // Read the GNIS file
        const gnisFeatures = await readGNISFile();
        
        // Parse features and filter for Waimanalo area
        const allFeatures: GeographicFeature[] = [];
        
        for (const feature of gnisFeatures) {
            if (isNearWaimanalo(feature.lat, feature.lon)) {
                allFeatures.push(feature);
            }
        }
        
        console.log('Found features near Waimanalo:', allFeatures.length);
        
        // Categorize features
        const categorizedFeatures = {
            populated_places: allFeatures.filter(f => 
                f.feature_class === 'Populated Place' || 
                f.feature_class === 'Census' ||
                f.feature_class === 'Civil'
            ),
            streams: allFeatures.filter(f => 
                f.feature_class === 'Stream' || 
                f.feature_class === 'Canal'
            ),
            bays: allFeatures.filter(f => 
                f.feature_class === 'Bay'
            ),
            valleys: allFeatures.filter(f => 
                f.feature_class === 'Valley'
            ),
            mountains: allFeatures.filter(f => 
                f.feature_class === 'Summit' || 
                f.feature_class === 'Ridge'
            ),
            beaches: allFeatures.filter(f => 
                f.feature_class === 'Beach'
            ),
            other: allFeatures.filter(f => 
                !['Populated Place', 'Census', 'Civil', 'Stream', 'Canal', 'Bay', 'Valley', 'Summit', 'Ridge', 'Beach'].includes(f.feature_class)
            )
        };

        const geographicNamesData: GeographicNamesData = {
            location: { 
                lat: Number(lat), 
                lon: Number(lon), 
                area: 'Waimanalo' 
            },
            features: categorizedFeatures,
            metadata: {
                source: 'USGS Geographic Names Information System (GNIS)',
                description: 'Geographic features and place names around Waimanalo, Oahu',
                lastUpdated: '2025',
                totalFeatures: allFeatures.length
            }
        };

        console.log('Returning geographic names data');
        return NextResponse.json(geographicNamesData);

    } catch (error) {
        console.error('Geographic names error:', error);
        return NextResponse.json({ 
            message: 'Failed to fetch geographic names',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 