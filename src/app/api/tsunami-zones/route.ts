import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface TsunamiZone {
  objectid: number;
  zone_code: number; // Changed from string to number
  zone_type: string;
  zone_desc: string;
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

function isNearWaimanalo(lat: number, lon: number): boolean {
  // Waimanalo coordinates: 21.33861, -157.70005
  const waimanaloLat = 21.33861;
  const waimanaloLon = -157.70005;
  const maxDistance = 0.5; // Increased to 50km radius to capture more zones
  
  const latDiff = Math.abs(lat - waimanaloLat);
  const lonDiff = Math.abs(lon - waimanaloLon);
  
  // Simple distance calculation (approximate)
  const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
  
  console.log(`Checking coordinates [${lat}, ${lon}] - distance: ${distance.toFixed(4)}`);
  
  return distance <= maxDistance;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '21.33861');
    const lon = parseFloat(searchParams.get('lon') || '-157.70005');

    // Updated file path to use the correct location
    const filePath = path.join(process.cwd(), 'src/app/dashboard/public-information/Tsunami_Evacuation_-_All_Zones (3).geojson');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Tsunami evacuation zones file not found' }, { status: 404 });
    }

    // Read the entire file as JSON
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const geoJson = JSON.parse(fileContent);

    if (!geoJson.features || !Array.isArray(geoJson.features)) {
      return NextResponse.json({ error: 'Invalid GeoJSON structure' }, { status: 400 });
    }

    const allZones: TsunamiZone[] = [];
    let oahuZones = 0;
    let waimanaloZones = 0;

    // Process each feature
    for (const feature of geoJson.features) {
      if (!feature.properties || !feature.geometry) {
        continue;
      }

      const properties = feature.properties;
      const geometry = feature.geometry;

      // Extract properties
      const objectid = properties.objectid;
      const zone_code = properties.zone_code;
      const zone_type = properties.zone_type;
      const zone_desc = properties.zone_desc || '';
      const areausac = properties.areausac || 0;

      if (!objectid || zone_code === undefined || !zone_type) {
        continue;
      }

      // Create zone object with proper type conversion
      const zone: TsunamiZone = {
        objectid: parseInt(objectid.toString()),
        zone_code: parseInt(zone_code.toString()), // Convert to number
        zone_type: zone_type.toString(),
        zone_desc: zone_desc.toString(),
        areausac: parseFloat(areausac.toString()),
        geometry: {
          type: geometry.type,
          coordinates: geometry.coordinates
        }
      };

      allZones.push(zone);

      // Count Oahu zones (check island property instead of zone_code)
      if (properties.island === 'OAHU') {
        oahuZones++;
        
        // Check if zone is near Waimanalo
        if (geometry.coordinates && geometry.coordinates.length > 0) {
          const firstCoord = geometry.coordinates[0][0];
          if (firstCoord && firstCoord.length >= 2) {
            const zoneLat = firstCoord[1];
            const zoneLon = firstCoord[0];
            if (isNearWaimanalo(zoneLat, zoneLon)) {
              waimanaloZones++;
            }
          }
        }
      }
    }

    console.log(`Found ${allZones.length} total zones`);
    console.log(`Found ${oahuZones} Oahu zones`);
    console.log(`Found ${waimanaloZones} zones near Waimanalo`);

    // Filter zones near Waimanalo
    const nearbyZones = allZones.filter(zone => {
      // Get the first coordinate of the first polygon to check distance
      if (zone.geometry.coordinates && zone.geometry.coordinates.length > 0) {
        const firstPolygon = zone.geometry.coordinates[0];
        if (firstPolygon && firstPolygon.length > 0) {
          const firstRing = firstPolygon[0];
          if (firstRing && firstRing.length > 0) {
            const [lon, lat] = firstRing[0];
            const isNearby = isNearWaimanalo(lat, lon);
            console.log(`Zone ${zone.objectid} (${zone.zone_code}) at [${lat}, ${lon}] - nearby: ${isNearby}`);
            return isNearby;
          }
        }
      }
      return false;
    });

    console.log(`Found ${nearbyZones.length} zones near Waimanalo`);

    // Return nearby zones
    const response: TsunamiData = {
      zones: nearbyZones,
      metadata: {
        source: 'Hawaii State GIS Program',
        description: 'Tsunami evacuation zones for Hawaii',
        lastUpdated: '2024',
        totalZones: nearbyZones.length
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing tsunami evacuation zones:', error);
    return NextResponse.json({ error: 'Failed to process tsunami evacuation zones' }, { status: 500 });
  }
} 