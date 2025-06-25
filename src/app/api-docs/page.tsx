'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading API documentation...</span>
    </div>
  ),
});

export default function ApiDoc() {
  const [spec, setSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadApiDocs() {
      try {
        const response = await fetch('/api/swagger');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiSpec = await response.json();
        setSpec(apiSpec);
      } catch (err) {
        console.error('Error loading API documentation:', err);
        setError(err instanceof Error ? err.message : 'Failed to load API documentation');
      } finally {
        setLoading(false);
      }
    }

    loadApiDocs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sparks API Documentation
            </h1>
            <p className="text-gray-600">
              Interactive API documentation for the Sparks therapy management platform
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading API documentation...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sparks API Documentation
            </h1>
            <p className="text-gray-600">
              Interactive API documentation for the Sparks therapy management platform
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to load API documentation
              </h3>
              <p className="text-gray-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sparks API Documentation
          </h1>
          <p className="text-gray-600">
            Interactive API documentation for the Sparks therapy management platform
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border">
          {spec && (
            <SwaggerUI
              spec={spec}
              docExpansion="list"
              defaultModelsExpandDepth={2}
              defaultModelExpandDepth={2}
              deepLinking={true}
              displayOperationId={false}
              displayRequestDuration={true}
              tryItOutEnabled={true}
              filter={true}
              syntaxHighlight={{
                activated: true,
                theme: "agate"
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
