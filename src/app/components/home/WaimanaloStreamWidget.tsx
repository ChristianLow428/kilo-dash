
'use client';

import { Card, Title } from '@tremor/react';
import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush
} from 'recharts';

const WaimanaloStreamWidget = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('https://waterservices.usgs.gov/nwis/iv/?format=json&sites=16249000&parameterCd=00065&period=P7D');
                if (!response.ok) {
                    throw new Error('Data fetching failed');
                }
                const usgsData = await response.json();
                
                if (!usgsData.value?.timeSeries?.[0]?.values?.[0]?.value) {
                    throw new Error("Unexpected data structure from USGS API");
                }
                const timeSeries = usgsData.value.timeSeries[0].values[0].value;

                const chartData = timeSeries.map((entry: any) => ({
                    date: formatDate(entry.dateTime),
                    'Gage height (ft)': parseFloat(entry.value),
                }));
                setData(chartData);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading Waimanalo Stream data...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Card>
            <Title>Waimanalo Stream - Gage Height (Last 7 Days)</Title>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={data}
                    margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[7.09, 7.11]} allowDataOverflow={true} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Gage height (ft)" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Brush />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default WaimanaloStreamWidget; 