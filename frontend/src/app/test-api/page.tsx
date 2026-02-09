'use client';

import { useState, useEffect } from 'react';

export default function TestApi() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/health/`)
            .then((res) => {
                if (!res.ok) throw new Error(`Server responded with ${res.status}`);
                return res.json()
            })
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            })
    }, []);

    if (loading) return <div className="p-8">📡 Connecting to Backend...</div>;
    if (error) return (
        <div className="p-8 text-red-500">
            <h1 className="text-red-500 font-bold">❌ Connection Failed</h1>
            <p className="text-gray-600 mt-2">{error}</p>
            <p className="text-sm mt-4 bg-gray-100 p-2">Check: 1. Is Docker running? 2. Is CORS configured in Django?</p>
        </div>
    );

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">✅ API Connection Successful</h1>
            <div className="bg-slate-900 text-green-400 p-6 rounded-lg shadow-lg font-mono">
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        </div>
    )
}