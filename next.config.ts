import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, // Garde le strict mode pour le reste de l'app
  
  // Configuration Turbopack (Next.js 16+)
  turbopack: {}, // Active Turbopack et silencieux l'avertissement
  
  // Suppression des warnings Swagger UI dans la console (pour webpack legacy)
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/swagger-ui-react/ },
    ];
    return config;
  },
};

export default nextConfig;
