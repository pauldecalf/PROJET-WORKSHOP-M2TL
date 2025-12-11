"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Grip, List } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { RoomCard } from "@/components/RoomCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "grid";
type SortBy = "name" | "comfort" | "floor";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json());

// Map backend availability to UI status
const mapAvailability = (availability: string | undefined) => {
  if (availability === "AVAILABLE") return "available" as const;
  if (availability === "OCCUPIED") return "occupied" as const;
  return "alert" as const; // UNKNOWN ou autres
};

type RoomData = {
  temperature?: number;
  co2?: number;
  noiseLevel?: number;
  luminosity?: number;
  measuredAt?: string;
};

// Récupère les données de la salle (agrégation côté API) et prend la plus récente tous devices confondus
function useRoomData(roomId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    roomId ? `/api/rooms/by-id/${roomId}/data?limit=1` : null,
    fetcher,
  );

  // L'API retourne devices: [{ data: [...] }]; on prend la première mesure de chaque device puis la plus récente
  const devices = data?.devices ?? [];
  const measures: RoomData[] = devices
    .map((d: any) => d.data?.[0])
    .filter(Boolean)
    .sort((a: any, b: any) => {
      const ta = new Date(a.measuredAt ?? a.createdAt ?? 0).getTime();
      const tb = new Date(b.measuredAt ?? b.createdAt ?? 0).getTime();
      return tb - ta;
    });
  const latest: RoomData | undefined = measures[0];

  return {
    isLoading,
    error,
    latest: latest
      ? {
          temperature: latest.temperature,
          co2: latest.co2,
          noiseLevel: latest.noiseLevel ?? (latest as any).noise,
          luminosity: latest.luminosity ?? (latest as any).brightness,
          measuredAt: latest.measuredAt ?? (latest as any).createdAt,
        }
      : undefined,
  };
}

function useRoomTimeseries(roomId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    roomId ? `/api/rooms/by-id/${roomId}/data?limit=50` : null,
    fetcher,
  );

  // Aplatit toutes les mesures des devices, triées par date décroissante
  const series: Array<{ time: string; temperature?: number; co2?: number; humidity?: number }> = [];
  const devices = data?.devices ?? [];
  devices.forEach((d: any) => {
    (d.data ?? []).forEach((m: any) => {
      series.push({
        time: m.measuredAt ?? m.createdAt,
        temperature: m.temperature,
        co2: m.co2,
        humidity: m.humidity,
      });
    });
  });
  series.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  // Limiter pour éviter trop de points
  const limited = series.slice(0, 50).reverse(); // reverse pour l'axe X croissant

  return { series: limited, isLoading, error };
}

function RoomCardWithData({
  room,
  availability,
}: {
  room: any;
  availability?: any;
}) {
  const { latest } = useRoomData(room._id);
  const { series } = useRoomTimeseries(room._id);

  return (
    <RoomCard
      key={room._id}
      id={room._id}
      name={room.name ?? "Salle"}
      floor={room.floor ?? 0}
      status={mapAvailability(availability?.availability)}
      conditions={{
        temperature: latest?.temperature ?? 0,
        co2: latest?.co2 ?? 0,
        noise: latest?.noiseLevel,
        brightness: latest?.luminosity,
      }}
      lastUpdated={
        availability?.lastUpdateAt
          ? new Date(availability.lastUpdateAt).toLocaleTimeString()
          : latest?.measuredAt
            ? new Date(latest.measuredAt).toLocaleTimeString()
            : undefined
      }
      timeseries={
        series.length > 0 ? (
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <XAxis
                  dataKey="time"
                  tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                  hide
                />
                <YAxis
                  yAxisId="temp"
                  hide
                  domain={['dataMin-2', 'dataMax+2']}
                />
                <YAxis
                  yAxisId="co2"
                  orientation="right"
                  hide
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  labelFormatter={(t) => new Date(t as string).toLocaleString()}
                  formatter={(value: any, name: any) => {
                    if (name === "temperature") return [value, "Temp (°C)"];
                    if (name === "co2") return [value, "CO₂ (ppm)"];
                    if (name === "humidity") return [value, "Humidité (%)"];
                    return [value, name];
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#2563eb"
                  dot={false}
                  strokeWidth={2}
                  yAxisId="temp"
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  stroke="#f97316"
                  dot={false}
                  strokeWidth={2}
                  yAxisId="temp"
                />
                <Line
                  type="monotone"
                  dataKey="co2"
                  stroke="#16a34a"
                  dot={false}
                  strokeWidth={2}
                  yAxisId="co2"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : null
      }
    />
  );
}

export default function Salles() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");

  const { data: buildingsRes } = useSWR("/api/buildings", fetcher);
  const buildings = buildingsRes?.data ?? [];

  // Requête rooms.status, filtrée par buildingId si sélectionné
  // Rooms par bâtiment : /api/buildings/by-id/{id}/rooms, sinon /api/rooms (toutes)
  const roomsUrl =
    selectedBuilding !== "all"
      ? `/api/buildings/by-id/${selectedBuilding}/rooms`
      : "/api/rooms";
  const { data: roomsRes } = useSWR(roomsUrl, fetcher);
  const rooms = roomsRes?.data ?? [];

  // Statuts, filtrés par bâtiment si présent
  const statusUrl =
    selectedBuilding !== "all"
      ? `/api/rooms/status?buildingId=${selectedBuilding}`
      : "/api/rooms/status";
  const { data: statusRes } = useSWR(statusUrl, fetcher);
  const statuses = statusRes?.data ?? [];

  const availabilityByRoomId = useMemo(() => {
    const map = new Map<string, any>();
    statuses.forEach((s: any) => {
      if (s.room?._id) map.set(s.room._id, s);
    });
    return map;
  }, [statuses]);

  const floors = useMemo(() => {
    const set = new Set<number>();
    rooms.forEach((r: any) => {
      if (r.floor != null) set.add(r.floor);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    const floorFilter = selectedFloor === "all" ? null : parseInt(selectedFloor, 10);
    let list = rooms as any[];

    if (floorFilter !== null) {
      list = list.filter((r) => r.floor === floorFilter);
    }

    if (showOnlyAvailable) {
      list = list.filter((r) => {
        const status = availabilityByRoomId.get(r._id);
        return status?.availability === "AVAILABLE";
      });
    }

    list = [...list].sort((a, b) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      } else if (sortBy === "floor") {
        return (a.floor || 0) - (b.floor || 0);
      } else if (sortBy === "comfort") {
        // Pas de confort réel → fallback sur availability
        const statusA = availabilityByRoomId.get(a._id);
        const statusB = availabilityByRoomId.get(b._id);
        const score = (s: any) => (s?.availability === "AVAILABLE" ? 1 : 0);
        return score(statusB) - score(statusA);
      }
      return 0;
    });

    return list;
  }, [rooms, selectedFloor, showOnlyAvailable, sortBy, availabilityByRoomId]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Salles</h1>
        <p className="text-muted-foreground">
          Trouvez une salle confortable et disponible
        </p>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Affinez la vue selon le bâtiment, l'étage et la disponibilité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="building">Bâtiment</Label>
              <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                <SelectTrigger id="building">
                  <SelectValue placeholder="Choisir un bâtiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les bâtiments</SelectItem>
                  {buildings.map((b: any) => (
                    <SelectItem key={b._id} value={b._id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Étage</Label>
              <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                <SelectTrigger id="floor">
                  <SelectValue placeholder="Tous les étages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les étages</SelectItem>
                  {floors.map((floor) => (
                    <SelectItem key={floor} value={floor.toString()}>
                      Étage {floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort">Trier par</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                <SelectTrigger id="sort">
                  <SelectValue placeholder="Choisir un tri" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="floor">Étage</SelectItem>
                  <SelectItem value="comfort">Confort</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4 rounded-md border px-4 py-3">
              <Switch
                id="available"
                checked={showOnlyAvailable}
                onCheckedChange={setShowOnlyAvailable}
              />
              <div className="space-y-1 text-sm">
                <Label htmlFor="available" className="font-medium">
                  Disponibles seulement
                </Label>
                <p className="text-muted-foreground">
                  Masquer les salles occupées ou en alerte
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vue toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => value && setViewMode(value as ViewMode)}
          className="rounded-md border bg-card p-1"
        >
          <ToggleGroupItem value="list" aria-label="Vue liste">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Vue grille">
            <Grip className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <Badge variant="outline" className="text-muted-foreground">
          {filteredRooms.length} salle{filteredRooms.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Liste des salles */}
      {filteredRooms.length > 0 ? (
        <div
          className={cn(
            "gap-4",
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col"
          )}
        >
          {filteredRooms.map((item: any) => (
            <RoomCardWithData
              key={item._id}
              room={item}
              availability={availabilityByRoomId.get(item._id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-lg font-medium text-foreground">
            Aucune salle trouvée
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Essayez de modifier les filtres
          </p>
        </div>
      )}
    </div>
  );
}
