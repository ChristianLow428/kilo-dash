import { NextResponse } from 'next/server';
import path from 'path';
import { createReadStream } from 'fs';
import readline from 'readline';

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

async function readTabularFile(fileName: string): Promise<string[]> {
    try {
        const filePath = path.join(process.cwd(), 'src', 'app', 'components', 'home', 'wss_aoi_2025-07-22_20-58-28', 'tabular', fileName);
        console.log('Reading file:', filePath);
        
        const fileStream = createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        const lines: string[] = [];
        for await (const line of rl) {
            lines.push(line);
        }
        console.log(`Read ${lines.length} lines from ${fileName}`);
        return lines;
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
        throw error;
    }
}

// Waimanalo area soil series
const WAIMANALO_SOIL_SERIES = [
    'Kawaihapai',
    'Pohakupu', 
    'Lolekaa',
    'Haleiwa',
    'Hanalei'
];

export async function GET(request: Request) {
    try {
        console.log('=== SOIL HEALTH API CALLED ===');
        
        // Get lat/lon from query parameters
        const url = new URL(request.url);
        const lat = url.searchParams.get('lat');
        const lon = url.searchParams.get('lon');

        if (!lat || !lon) {
            return NextResponse.json({ message: 'Missing lat/lon parameters' }, { status: 400 });
        }

        console.log('Coordinates:', lat, lon);

        // Read the component data file
        const compLines = await readTabularFile('comp.txt');
        console.log('Component lines count:', compLines.length);

        // Parse component data to find Waimanalo soils
        const waimanaloSoils = compLines
            .slice(1) // Skip header
            .map((line, index) => {
                const parts = line.split('|');
                
                // Debug: Log the first few lines to understand structure
                if (index < 3) {
                    console.log(`Line ${index} parts:`, parts.slice(0, 25));
                }
                
                const soilSeries = parts[3]?.replace(/"/g, '') || '';
                const drainageClass = parts[20]?.replace(/"/g, '') || '';
                const hydrologicGroup = parts[82]?.replace(/"/g, '') || '';
                const erosionFactor = parts[13]?.replace(/"/g, '') || '';
                const organicMatter = parts[14]?.replace(/"/g, '') || '';
                const phLevel = parts[15]?.replace(/"/g, '') || '';
                const taxorder = parts[84]?.replace(/"/g, '') || '';
                const taxsuborder = parts[85]?.replace(/"/g, '') || '';
                const taxgrtgroup = parts[86]?.replace(/"/g, '') || '';
                const taxsubgrp = parts[87]?.replace(/"/g, '') || '';
                const texture = parts[88]?.replace(/"/g, '') || '';
                const slope = parts[9] && parts[10] ? `${parts[9]}-${parts[10]}%` : 'Unknown';
                const depth = parts[11]?.replace(/"/g, '') || 'Unknown';
                
                return {
                    soilSeries,
                    drainageClass,
                    hydrologicGroup,
                    erosionFactor,
                    organicMatter,
                    phLevel,
                    taxorder,
                    taxsuborder,
                    taxgrtgroup,
                    taxsubgrp,
                    texture,
                    slope,
                    depth
                };
            })
            .filter(soil => WAIMANALO_SOIL_SERIES.includes(soil.soilSeries));

        console.log('Waimanalo soils found:', waimanaloSoils.length);
        console.log('Available soil series:', waimanaloSoils.map(s => s.soilSeries));

        if (waimanaloSoils.length === 0) {
            console.error('No Waimanalo soils found');
            return NextResponse.json({ 
                message: 'Soil health data not available for Waimanalo area',
                availableSeries: compLines.slice(1).map(line => {
                    const parts = line.split('|');
                    return parts[3]?.replace(/"/g, '') || '';
                }).filter(series => series && series !== '')
            }, { status: 404 });
        }

        // Use the first Waimanalo soil for now
        const soil = waimanaloSoils[0];
        console.log('Using soil:', soil);

        // Determine agricultural suitability based on drainage and erosion
        const agriculturalSuitability = soil.drainageClass === 'Well drained' ? 'Good' : 
                                      soil.drainageClass === 'Moderately well drained' ? 'Moderate' : 'Poor';

        const soilHealthData: SoilHealthData = {
            location: {
                lat: Number(lat),
                lon: Number(lon)
            },
            soilSeries: soil.soilSeries,
            drainageClass: soil.drainageClass,
            hydrologicGroup: soil.hydrologicGroup,
            erosionFactor: soil.erosionFactor,
            organicMatter: soil.organicMatter,
            phLevel: soil.phLevel,
            soilTaxonomy: {
                order: soil.taxorder,
                suborder: soil.taxsuborder,
                greatGroup: soil.taxgrtgroup,
                subgroup: soil.taxsubgrp
            },
            suitability: {
                agricultural: agriculturalSuitability,
                drainage: soil.drainageClass,
                erosion: soil.erosionFactor
            },
            physicalProperties: {
                texture: soil.texture,
                slope: soil.slope,
                depth: soil.depth
            }
        };

        console.log('Returning soil health data successfully');
        return NextResponse.json(soilHealthData);

    } catch (error) {
        console.error('Soil health data error:', error);
        return NextResponse.json({ 
            message: 'Failed to fetch soil health data',
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}