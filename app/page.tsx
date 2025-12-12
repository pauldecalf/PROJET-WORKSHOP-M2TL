"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wifi, Gauge } from "lucide-react";
import { useRoomLatest, useRoomSeries, mapLuminosityToAvailability } from "@/hooks/useRoomData";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json());

// Les hooks sont maintenant dans /hooks/useRoomData.ts

function RoomCardWithData({
  room,
  availabilityFilter,
  minTemp,
  maxTemp,
}: {
  room: any;
  availabilityFilter: "all" | "available" | "occupied";
  minTemp: string;
  maxTemp: string;
}) {
  const { data: latest } = useRoomLatest(room._id);
  const { data: series } = useRoomSeries(room._id);
  const availability = mapLuminosityToAvailability(latest?.luminosity);

  // Filtre disponibilité
  if (availabilityFilter !== "all" && availability !== availabilityFilter) return null;
  // Filtre température
  const t = latest?.temperature;
  if (minTemp && t != null && t < Number(minTemp)) return null;
  if (maxTemp && t != null && t > Number(maxTemp)) return null;

  return (
    <RoomCard
      id={room._id}
      name={room.name ?? "Salle"}
      floor={room.floor ?? 0}
      status={availability}
      actualStatus={latest?.luminosity != null ? `${latest.luminosity} lx` : undefined}
      conditions={{
        temperature: latest?.temperature ?? 0,
        co2: latest?.co2 ?? 0,
        noise: latest?.decibel,
        brightness: latest?.luminosity,
      }}
      lastUpdated={
        latest?.measuredAt
          ? new Date(latest.measuredAt).toLocaleTimeString()
          : undefined
      }
      timeseries={
        series.length > 0 ? (
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <XAxis dataKey="time" hide />
                <YAxis yAxisId="temp" hide domain={['dataMin-5', 'dataMax+8']} />
                <YAxis yAxisId="hum" hide domain={['dataMin-10', 'dataMax+12']} />
                <YAxis yAxisId="co2" hide orientation="right" domain={['dataMin-400', 'dataMax+800']} />
                <YAxis yAxisId="lux" hide orientation="right" domain={['dataMin-150', 'dataMax+350']} />
                <YAxis yAxisId="db" hide orientation="right" domain={['dataMin-10', 'dataMax+30']} />
                <Tooltip
                  labelFormatter={(t) => new Date(t as string).toLocaleString()}
                  formatter={(value: any, name: any) => {
                    if (name === "temperature") return [value, "Temp (°C)"];
                    if (name === "humidity") return [value, "Humidité (%)"];
                    if (name === "co2") return [value, "CO₂ (ppm)"];
                    if (name === "luminosity") return [value, "Luminosité (lx)"];
                    if (name === "decibel") return [value, "Bruit (dB)"];
                    return [value, name];
                  }}
                />
                <Line type="monotone" dataKey="temperature" stroke="#2563eb" dot={false} strokeWidth={2} yAxisId="temp" />
                <Line type="monotone" dataKey="humidity" stroke="#f97316" dot={false} strokeWidth={2} yAxisId="hum" />
                <Line type="monotone" dataKey="luminosity" stroke="#facc15" dot={false} strokeWidth={2} yAxisId="lux" />
                <Line type="monotone" dataKey="decibel" stroke="#a855f7" dot={false} strokeWidth={2} yAxisId="db" />
                <Line type="monotone" dataKey="co2" stroke="#16a34a" dot={false} strokeWidth={2} yAxisId="co2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : null
      }
    />
  );
}

function RoomDetailModal({
  room,
  open,
  onOpenChange,
}: {
  room: any | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { data: latest } = useRoomLatest(room?._id);
  const { data: series } = useRoomSeries(room?._id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{room?.name ?? "Salle"}</DialogTitle>
          <DialogDescription>
            Bâtiment : {room?.buildingId?.name ?? "—"} • Étage : {room?.floor ?? "—"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Température</span>
              <Badge variant="outline">{latest?.temperature ?? "—"} °C</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CO₂</span>
              <Badge variant="outline">{latest?.co2 ?? "—"} ppm</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Humidité</span>
              <Badge variant="outline">{latest?.humidity ?? "—"} %</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Luminosité</span>
              <Badge variant="outline">{latest?.luminosity ?? "—"} lx</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bruit</span>
              <Badge variant="outline">{latest?.decibel ?? "—"} dB</Badge>
            </div>
          </div>
          <div className="h-48">
            {series.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <XAxis dataKey="time" hide />
                  <YAxis yAxisId="temp" hide domain={['dataMin-5', 'dataMax+8']} />
                  <YAxis yAxisId="hum" hide domain={['dataMin-10', 'dataMax+12']} />
                  <YAxis yAxisId="co2" hide orientation="right" domain={['dataMin-400', 'dataMax+800']} />
                  <YAxis yAxisId="lux" hide orientation="right" domain={['dataMin-150', 'dataMax+350']} />
                  <YAxis yAxisId="db" hide orientation="right" domain={['dataMin-10', 'dataMax+30']} />
                  <Tooltip
                    labelFormatter={(t) => new Date(t as string).toLocaleString()}
                    formatter={(value: any, name: any) => {
                      if (name === "temperature") return [value, "Temp (°C)"];
                      if (name === "humidity") return [value, "Humidité (%)"];
                      if (name === "co2") return [value, "CO₂ (ppm)"];
                      if (name === "luminosity") return [value, "Luminosité (lx)"];
                      if (name === "decibel") return [value, "Bruit (dB)"];
                      return [value, name];
                    }}
                  />
                  <Line type="monotone" dataKey="temperature" stroke="#2563eb" dot={false} strokeWidth={2} yAxisId="temp" />
                  <Line type="monotone" dataKey="humidity" stroke="#f97316" dot={false} strokeWidth={2} yAxisId="hum" />
                  <Line type="monotone" dataKey="luminosity" stroke="#facc15" dot={false} strokeWidth={2} yAxisId="lux" />
                  <Line type="monotone" dataKey="decibel" stroke="#a855f7" dot={false} strokeWidth={2} yAxisId="db" />
                  <Line type="monotone" dataKey="co2" stroke="#16a34a" dot={false} strokeWidth={2} yAxisId="co2" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Pas de données disponibles</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function HomePage() {
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "occupied">("all");
  const [minTemp, setMinTemp] = useState<string>("");
  const [maxTemp, setMaxTemp] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

  const { data: buildingsRes } = useSWR("/api/buildings", fetcher);
  const buildings = buildingsRes?.data ?? [];

  const roomsUrl =
    selectedBuilding !== "all"
      ? `/api/buildings/by-id/${selectedBuilding}/rooms`
      : "/api/rooms";
  const { data: roomsRes } = useSWR(roomsUrl, fetcher);
  const rooms = roomsRes?.data ?? [];

  const floors = useMemo(() => {
    const set = new Set<number>();
    rooms.forEach((r: any) => {
      if (r.floor != null) set.add(r.floor);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [rooms]);

  const filteredRooms = rooms.filter((room: any) => {
    if (selectedFloor !== "all" && room.floor !== Number(selectedFloor)) return false;
    return true;
  });

  return (
    <div className="space-y-10">
      {/* Hero Section - Présentation du projet */}
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-card to-card p-8 shadow-lg md:p-12">
        <div className="relative z-10 grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <Badge variant="secondary" className="text-xs md:text-sm font-semibold">
              🎓 Digital Campus IoT - Workshop M2 TL
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Supervision IoT des Salles de Campus
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Visualisez en temps réel la disponibilité, la température et la qualité de l'air de toutes les salles du campus.
              Une solution moderne pour optimiser l'utilisation des espaces.
            </p>
          </div>

          {/* Features cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-2 shadow-md">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Wifi className="mb-3 h-10 w-10 text-primary" />
                <h3 className="font-bold text-foreground">Temps Réel</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Données actualisées automatiquement
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 shadow-md">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Gauge className="mb-3 h-10 w-10 text-primary" />
                <h3 className="font-bold text-foreground">Capteurs IoT</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Temp • CO₂ • Bruit • Luminosité
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 shadow-md sm:col-span-2">
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-3">💡 Règle de disponibilité</h3>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p>✅ <span className="font-medium text-status-available">Disponible</span> : Luminosité &lt; 1000 lx</p>
                  <p>🔴 <span className="font-medium text-status-alert">Occupée</span> : Luminosité ≥ 1000 lx</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section Filtres et Liste des Salles */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Salles disponibles</h2>
            <p className="text-muted-foreground">
              {filteredRooms.length} salle{filteredRooms.length > 1 ? 's' : ''} trouvée{filteredRooms.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-48">
            <label className="text-sm text-muted-foreground">Bâtiment</label>
            <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les bâtiments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {buildings.map((b: any) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <label className="text-sm text-muted-foreground">Étage</label>
            <Select value={selectedFloor} onValueChange={setSelectedFloor}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les étages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {floors.map((f) => (
                  <SelectItem key={f} value={String(f)}>
                    Étage {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-44">
            <label className="text-sm text-muted-foreground">Disponibilité</label>
            <Select value={availabilityFilter} onValueChange={(v) => setAvailabilityFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Disponibilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="available">Disponibles</SelectItem>
                <SelectItem value="occupied">Occupées</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <div className="w-28">
              <label className="text-sm text-muted-foreground">Temp min (°C)</label>
              <Input
                type="number"
                value={minTemp}
                onChange={(e) => setMinTemp(e.target.value)}
                placeholder="ex: 19"
              />
            </div>
            <div className="w-28">
              <label className="text-sm text-muted-foreground">Temp max (°C)</label>
              <Input
                type="number"
                value={maxTemp}
                onChange={(e) => setMaxTemp(e.target.value)}
                placeholder="ex: 25"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.map((room: any) => (
            <div
              key={room._id}
              className="cursor-pointer"
              onClick={() => setSelectedRoom(room)}
            >
              <RoomCardWithData
                room={room}
                availabilityFilter={availabilityFilter}
                minTemp={minTemp}
                maxTemp={maxTemp}
              />
            </div>
          ))}
        </div>
      </section>

      <RoomDetailModal
        room={selectedRoom}
        open={!!selectedRoom}
        onOpenChange={(o) => {
          if (!o) setSelectedRoom(null);
        }}
      />
    </div>
  );
}
