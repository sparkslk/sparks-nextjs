"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DebugAuth() {
    const { data: session, status } = useSession();
    const [sessionData, setSessionData] = useState<any>(null);

    useEffect(() => {
        // Fetch session data directly from API
        fetch('/api/auth/session')
            .then(res => res.json())
            .then(data => setSessionData(data))
            .catch(err => console.error('Failed to fetch session:', err));
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>

            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">useSession Hook:</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                    Status: {status}
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Direct API Call:</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(sessionData, null, 2)}
                </pre>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Current URL:</h2>
                <pre className="bg-gray-100 p-4 rounded">
                    {typeof window !== 'undefined' ? window.location.href : 'N/A'}
                </pre>
            </div>
        </div>
    );
}
