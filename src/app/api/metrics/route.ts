
import { db } from '../../../..//db/kysely/client';
import { getAinaID, getUserID } from '@/app/lib/server-utils';
import { NextResponse } from 'next/server';
import { getFromCache, setInCache } from '@/app/lib/cache';

export async function GET() {
    try {
        const CACHE_KEY = 'all_sensors_per_patch'
        const cached = getFromCache(CACHE_KEY)

        if (cached) {
            console.log('fetchSensorsData in cache, using cache...')
            return NextResponse.json({ locations: cached })
        }

        console.log('fetchSensorsData not in cache, querying db...')
        
        const userID = await getUserID();
        if (!userID) {
            return NextResponse.json({ locations: [] });
        }
        
        const ainaID = await getAinaID(userID);
        if (!ainaID) {
            return NextResponse.json({ locations: [] });
        }
        
        const result = await db
            .selectFrom('metric as m')
            .innerJoin('sensor_mala as sm', 'sm.sensor_id', 'm.sensor_id')
            .innerJoin('mala as ma', 'ma.id', 'sm.mala_id')
            .innerJoin('aina as a', 'a.id', 'ma.aina_id')
            .innerJoin('metric_type as mt', 'mt.id', 'm.metric_type')
            .select(['m.value', 'm.timestamp', 'mt.type_name', 'ma.name as mala_name'])
            .where('a.id', '=', ainaID)
            .orderBy('m.timestamp asc')
            .execute();

        const grouped: Record<string, Record<string, Array<{ timestamp: string; value: number }>>> = {};
        for (const row of result) {
            const typeName = row.type_name || 'unknown';
            const malaName = row.mala_name || 'unknown';
            
            if (!grouped[malaName]) grouped[malaName] = {};
            if (!grouped[malaName][typeName]) grouped[malaName][typeName] = [];
            
            grouped[malaName][typeName].push({
                timestamp: row.timestamp?.toISOString() || new Date().toISOString(),
                value: row.value || 0,
            });
        }

        const locations = Object.entries(grouped).map(([name, data]) => ({ name, data }))
        setInCache(CACHE_KEY, locations, 1000 * 60 * 5) //5 minutes

        return NextResponse.json({ locations: locations || [] })
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ locations: [] });
    }
} 