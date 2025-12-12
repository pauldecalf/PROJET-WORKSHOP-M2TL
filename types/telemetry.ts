/**
 * Types pour les données de télémétrie (mesures des capteurs)
 */

export interface TelemetryData {
  _id?: string;
  deviceId: string;
  serialNumber?: string;
  temperature?: number;      // °C
  humidity?: number;         // %
  co2?: number;             // ppm
  decibel?: number;         // dB (niveau sonore)
  luminosity?: number;      // lux
  measuredAt: string;
  createdAt?: string;
}

export interface TelemetrySummary {
  temperature: {
    current?: number;
    min?: number;
    max?: number;
    avg?: number;
  };
  humidity: {
    current?: number;
    min?: number;
    max?: number;
    avg?: number;
  };
  co2: {
    current?: number;
    min?: number;
    max?: number;
    avg?: number;
  };
  decibel?: {
    current?: number;
    min?: number;
    max?: number;
    avg?: number;
  };
  luminosity?: {
    current?: number;
    min?: number;
    max?: number;
    avg?: number;
  };
}

export interface TimeSeriesData {
  timestamp: string;
  temperature?: number;
  humidity?: number;
  co2?: number;
  decibel?: number;
  luminosity?: number;
}

/**
 * Qualité de l'air basée sur le CO2
 */
export type AirQuality = 'good' | 'moderate' | 'poor';

export function getAirQuality(co2?: number): AirQuality {
  if (!co2) return 'moderate';
  if (co2 < 1000) return 'good';
  if (co2 < 1500) return 'moderate';
  return 'poor';
}

/**
 * Niveau de confort basé sur température et CO2
 */
export type ComfortLevel = 'comfortable' | 'acceptable' | 'uncomfortable';

export function getComfortLevel(temperature?: number, co2?: number): ComfortLevel {
  if (!temperature || !co2) return 'acceptable';
  
  const tempOk = temperature >= 19 && temperature <= 25;
  const airOk = co2 < 1000;
  
  if (tempOk && airOk) return 'comfortable';
  if (!tempOk || !airOk) return 'acceptable';
  return 'uncomfortable';
}

