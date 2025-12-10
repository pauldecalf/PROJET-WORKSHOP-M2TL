'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📚 Documentation API
          </h1>
          <p className="text-gray-600">
            Documentation interactive de l'API Workshop IoT
          </p>
        </div>
        <SwaggerUI url="/api/swagger" />
      </div>
    </div>
  );
}

