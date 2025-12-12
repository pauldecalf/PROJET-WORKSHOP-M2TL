"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json());

/**
 * Hook pour récupérer les dernières données d'une salle
 */
export function useRoomLatest(roomId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    roomId ? `/api/rooms/by-id/${roomId}/data?limit=1` : null,
    fetcher,
    {
      refreshInterval: 10000, // Rafraîchir toutes les 10 secondes
    }
  );

  const devices = data?.devices ?? [];
  const measures = devices
    .map((d: any) => d.data?.[0])
    .filter(Boolean)
    .sort((a: any, b: any) => {
      const ta = new Date(a.measuredAt ?? a.createdAt ?? 0).getTime();
      const tb = new Date(b.measuredAt ?? b.createdAt ?? 0).getTime();
      return tb - ta;
    });

  const latest = measures[0];

  if (!latest) {
    return { data: undefined, error, isLoading };
  }

  return {
    data: {
      temperature: latest.temperature,
      humidity: latest.humidity,
      co2: latest.co2,
      decibel: latest.decibel ?? latest.noiseLevel,
      luminosity: latest.luminosity ?? latest.brightness,
      measuredAt: latest.measuredAt ?? latest.createdAt,
    },
    error,
    isLoading,
  };
}

/**
 * Hook pour récupérer les séries temporelles d'une salle
 */
export function useRoomSeries(roomId: string | undefined, limit = 100) {
  const { data, error, isLoading } = useSWR(
    roomId ? `/api/rooms/by-id/${roomId}/data?limit=${limit}` : null,
    fetcher,
    {
      refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    }
  );

  const series: Array<{
    time: string;
    temperature?: number;
    humidity?: number;
    co2?: number;
    decibel?: number;
    luminosity?: number;
  }> = [];

  const devices = data?.devices ?? [];
  devices.forEach((d: any) => {
    (d.data ?? []).forEach((m: any) => {
      series.push({
        time: m.measuredAt ?? m.createdAt,
        temperature: m.temperature,
        humidity: m.humidity,
        co2: m.co2,
        decibel: m.decibel ?? m.noiseLevel,
        luminosity: m.luminosity ?? m.brightness,
      });
    });
  });

  series.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return { data: series, error, isLoading };
}

/**
 * Détermine la disponibilité d'une salle en fonction de la luminosité
 */
export function mapLuminosityToAvailability(lux?: number): 'available' | 'occupied' | 'alert' {
  if (lux == null) return 'alert';
  return lux >= 1000 ? 'occupied' : 'available';
}

