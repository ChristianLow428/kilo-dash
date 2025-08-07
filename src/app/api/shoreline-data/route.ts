import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface ShorelinePoint {
    lat: number;
    lon: number;
    elevation?: number;
    type?: string;
    name?: string;
    properties?: any;
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

// Shoreline access points GeoJSON data
const shorelineAccessData = {
    "type": "FeatureCollection",
    "name": "Shoreline_Public_Access",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": [
        { "type": "Feature", "properties": { "objectid": 46, "map_id": 46, "name": "Waimanalo Beach Park", "latitude": 21.33246, "longitude": -157.69364, "parcel_own": "State of Hawaii & DHHL (Licensed to City)", "parcel_ope": "City & County of Honolulu", "access_typ": "Vertical and Horizontal", "access_sur": "Grass", "dedicated_": 108, "shore_type": "Sand", "restroom": "Yes", "showers": "Yes", "picnic_fac": "Yes", "trash_rece": "Yes", "water": "Yes", "phone": "Yes", "lifeguard": "Yes", "alt_name": "Waimanalo Beach Park", "sign_word": "Waimanalo Beach Park" }, "geometry": { "type": "Point", "coordinates": [ -157.693625591908557, 21.332456578943688 ] } },
        { "type": "Feature", "properties": { "objectid": 47, "map_id": 47, "name": "Laumilo I", "latitude": 21.33416, "longitude": -157.69575, "parcel_own": "State of Hawaii", "parcel_ope": "City & County of Honolulu", "access_typ": "Vertical and Horizontal", "access_sur": "Grass", "dedicated_": 0, "shore_type": "Sand", "restroom": "No", "showers": "No", "picnic_fac": "No", "trash_rece": "No", "water": "No", "phone": "No", "lifeguard": "No", "alt_name": "Laumilo I", "sign_word": "101B, Public Right Of Way To Beach" }, "geometry": { "type": "Point", "coordinates": [ -157.695735592074186, 21.33415657937293 ] } },
        { "type": "Feature", "properties": { "objectid": 48, "map_id": 48, "name": "Laumilo H", "latitude": 21.33502, "longitude": -157.69633, "parcel_own": "State of Hawaii", "parcel_ope": "City & County of Honolulu", "access_typ": "Vertical and Horizontal", "access_sur": "Grass", "dedicated_": 0, "shore_type": "Sand", "restroom": "No", "showers": "No", "picnic_fac": "No", "trash_rece": "No", "water": "No", "phone": "No", "lifeguard": "No", "alt_name": "Laumilo H", "sign_word": "101A, Public Right Of Way To Beach" }, "geometry": { "type": "Point", "coordinates": [ -157.696315592294667, 21.335016579315543 ] } },
        { "type": "Feature", "properties": { "objectid": 49, "map_id": 49, "name": "Laumilo G", "latitude": 21.33578, "longitude": -157.69686, "parcel_own": "State of Hawaii", "parcel_ope": "City & County of Honolulu", "access_typ": "Vertical and Horizontal", "access_sur": "Grass", "dedicated_": 0, "shore_type": "Sand", "restroom": "No", "showers": "No", "picnic_fac": "No", "trash_rece": "No", "water": "No", "phone": "No", "lifeguard": "No", "alt_name": "Laumilo G", "sign_word": "100G, Public Right Of Way To Beach" }, "geometry": { "type": "Point", "coordinates": [ -157.69684559176082, 21.335776579385428 ] } },
        { "type": "Feature", "properties": { "objectid": 50, "map_id": 50, "name": "Laumilo F", "latitude": 21.3366, "longitude": -157.69737, "parcel_own": "State of Hawaii", "parcel_ope": "City & County of Honolulu", "access_typ": "Vertical and Horizontal", "access_sur": "Grass", "dedicated_": 0, "shore_type": "Sand", "restroom": "No", "showers": "No", "picnic_fac": "No", "trash_rece": "No", "water": "No", "phone": "No", "lifeguard": "No", "alt_name": "Laumilo F", "sign_word": "100F, Public Right Of Way To Beach" }, "geometry": { "type": "Point", "coordinates": [ -157.697355591973349, 21.336596579217193 ] } },
        { "type": "Feature", "properties": { "objectid": 51, "map_id": 51, "name": "Laumilo E", "latitude": 21.33743, "longitude": -157.69796, "parcel_own": "State of Hawaii", "parcel_ope": "City & County of Honolulu", "access_typ": "Vertical and Horizontal", "access_sur": "Grass", "dedicated_": 0, "shore_type": "Sand", "restroom": "No", "showers": "No", "picnic_fac": "No", "trash_rece": "No", "water": "No", "phone": "No", "lifeguard": "No", "alt_name": "Laumilo E", "sign_word": "100E, Public Right Of Way To Beach" }, "geometry": { "type": "Point", "coordinates": [ -157.697945591715325, 21.337426579810803 ] } },
        { "type": "Feature", "properties": { "objectid": 52, "map_id": 52, "name": "Laumilo D", "latitude": 21.33823, "longitude": -157.69854, "parcel_own": "State of Hawaii", "parcel_ope": "City & County of Honolulu", "access_typ": "Vertical and Horizontal", "access_sur": "Grass", "dedicated_": 0, "shore_type": "Sand", "restroom": "No", "showers": "No", "picnic_fac": "No", "trash_rece": "No", "water": "No", "phone": "No", "lifeguard": "No", "alt_name": "Laumilo D", "sign_word": "100D, Public Right Of Way To Beach" }, "geometry": { "type": "Point", "coordinates": [ -157.698525591967467, 21.33822657922595 ] } },
        { "type": "Feature", "properties": { "objectid": 53, "map_id": 53, "name": "Laumilo C", "latitude": 21.33905, "longitude": -157.69911, "parcel_own": "State of Hawaii", "parcel_ope": "City & County of Honolulu", "access_typ": "Vertical and Horizontal", "access_sur": "Grass", "dedicated_": 0, "shore_type": "Sand", "restroom": "No", "showers": "No", "picnic_fac": "No", "trash_rece": "No", "water": "No", "phone": "No", "lifeguard": "No", "alt_name": "Laumilo C", "sign_word": "100C, Public Right Of Way To Beach" }, "geometry": { "type": "Point", "coordinates": [ -157.699095591857343, 21.339046579219229 ] } },
        { "type": "Feature", "properties": { "objectid": 54, "map_id": 54, "name": "Laumilo B", "latitude": 21.33991, "longitude": -157.69959, "parcel_own": "State of Hawaii", "parcel_ope": "City & County of Honolulu", "access_typ": "Vertical and Horizontal", "access_sur": "Grass", "dedicated_": 0, "shore_type": "Sand", "restroom": "No", "showers": "No", "picnic_fac": "No", "trash_rece": "No", "water": "No", "phone": "No", "lifeguard": "No", "alt_name": "Laumilo B", "sign_word": "100B, Public Right Of Way To Beach" }, "geometry": { "type": "Point", "coordinates": [ -157.699575592675842, 21.339906579876804 ] } },
        { "type": "Feature", "properties": { "objectid": 55, "map_id": 55, "name": "Laumilo A", "latitude": 21.3407, "longitude": -157.7001, "parcel_own": "State of Hawaii", "parcel_ope": "City & County of Honolulu", "access_typ": "Vertical and Horizontal", "access_sur": "Grass", "dedicated_": 0, "shore_type": "Sand", "restroom": "No", "showers": "No", "picnic_fac": "No", "trash_rece": "No", "water": "No", "phone": "No", "lifeguard": "No", "alt_name": "Laumilo A", "sign_word": "100A, Public Right Of Way To Beach" }, "geometry": { "type": "Point", "coordinates": [ -157.70008559273839, 21.340696579973734 ] } },
        { "type": "Feature", "properties": { "objectid": 56, "map_id": 56, "name": "Waimanalo Bay Beach Park", "latitude": 21.3443, "longitude": -157.7023, "parcel_own": "City & County of Honolulu", "parcel_ope": "City & County of Honolulu", "access_typ": "Vertical and Horizontal", "access_sur": "Grass", "dedicated_": 220, "shore_type": "Sand", "restroom": "Yes", "showers": "Yes", "picnic_fac": "Yes", "trash_rece": "Yes", "water": "Yes", "phone": "Yes", "lifeguard": "Yes", "alt_name": "Waimanalo Bay Beach Park", "sign_word": "Waimanalo Bay Beach Park" }, "geometry": { "type": "Point", "coordinates": [ -157.702285592235739, 21.344296579975868 ] } },
        { "type": "Feature", "properties": { "objectid": 57, "map_id": 57, "name": "Bellows Field Beach Park", "latitude": 21.34556, "longitude": -157.71013, "parcel_own": "United States of America", "parcel_ope": "City & County of Honolulu", "access_typ": "Vertical and Horizontal", "access_sur": "Grass", "dedicated_": 65, "shore_type": "Sand", "restroom": "Yes", "showers": "Yes", "picnic_fac": "Yes", "trash_rece": "Yes", "water": "Yes", "phone": "No", "lifeguard": "Yes", "alt_name": "Bellows Field Beach Park", "sign_word": "No Vehiles On The Beach   The Following Are Prohibited…" }, "geometry": { "type": "Point", "coordinates": [ -157.710115592432118, 21.345556579626308 ] } }
    ]
};

export async function GET(request: Request) {
    try {
        console.log('=== SHORELINE DATA API CALLED ===');
        
        // Get lat/lon from query parameters
        const url = new URL(request.url);
        const lat = url.searchParams.get('lat');
        const lon = url.searchParams.get('lon');

        if (!lat || !lon) {
            return NextResponse.json({ message: 'Missing lat/lon parameters' }, { status: 400 });
        }

        console.log('Coordinates:', lat, lon);

        // Parse the shoreline access data from GeoJSON
        const shorelinePoints: ShorelinePoint[] = shorelineAccessData.features.map((feature: any) => {
            const coords = feature.geometry.coordinates;
            const props = feature.properties;
            
            // Determine point type based on properties
            let pointType = 'access';
            if (props.name?.includes('Beach Park')) {
                pointType = 'beach_park';
            } else if (props.name?.includes('Laumilo')) {
                pointType = 'access_point';
            }

            return {
                lat: coords[1], // GeoJSON uses [lon, lat] order
                lon: coords[0],
                elevation: 0, // Default elevation for shoreline points
                type: pointType,
                name: props.name,
                properties: {
                    parcel_owner: props.parcel_own,
                    parcel_operator: props.parcel_ope,
                    access_type: props.access_typ,
                    access_surface: props.access_sur,
                    dedicated_area: props.dedicated_,
                    shore_type: props.shore_type,
                    restroom: props.restroom,
                    showers: props.showers,
                    picnic_facilities: props.picnic_fac,
                    trash_receptacles: props.trash_rece,
                    water: props.water,
                    phone: props.phone,
                    lifeguard: props.lifeguard,
                    sign_words: props.sign_word
                }
            };
        });

        // Calculate approximate shoreline length (sum of distances between consecutive points)
        let shorelineLength = 0;
        for (let i = 1; i < shorelinePoints.length; i++) {
            const prev = shorelinePoints[i - 1];
            const curr = shorelinePoints[i];
            const distance = calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon);
            shorelineLength += distance;
        }

        console.log('Returning shoreline access data for Waimanalo');

        return NextResponse.json({
            location: { lat: Number(lat), lon: Number(lon), area: 'Waimanalo' },
            shorelinePoints,
            metadata: {
                source: 'Shoreline Public Access Data',
                description: 'Waimanalo Shoreline Public Access Points',
                lastUpdated: '2025',
                dataUrl: 'Local GeoJSON Data',
                totalPoints: shorelinePoints.length,
                shorelineLength: shorelineLength
            }
        });

    } catch (error) {
        console.error('Shoreline data error:', error);
        return NextResponse.json({ 
            message: 'Failed to fetch shoreline data',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

// Helper function to calculate distance between two points in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
} 