"use client";

import { useMemo, useState } from "react";
import { Grip, List } from "lucide-react";

import { RoomCard } from "@/components/RoomCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

// Mock data - replace with API calls later
const mockRooms = [
  {
    id: "101",
    name: "Salle 101",
    floor: 0,
    building: "Bâtiment A",
    status: "available" as const,
    conditions: { temperature: 22.5, co2: 850, noise: 55, brightness: 75 },
    lastUpdated: "À l'instant",
  },
  {
    id: "102",
    name: "Salle 102",
    floor: 0,
    building: "Bâtiment A",
    status: "available" as const,
    conditions: { temperature: 23.1, co2: 950, noise: 48, brightness: 82 },
    lastUpdated: "Il y a 30s",
  },
  {
    id: "103",
    name: "Salle 103",
    floor: 0,
    building: "Bâtiment A",
    status: "occupied" as const,
    conditions: { temperature: 21.8, co2: 1200, noise: 65, brightness: 70 },
    lastUpdated: "Il y a 1m",
  },
  {
    id: "201",
    name: "Salle 201",
    floor: 1,
    building: "Bâtiment A",
    status: "available" as const,
    conditions: { temperature: 24.2, co2: 1100, noise: 52, brightness: 88 },
    lastUpdated: "Il y a 15s",
  },
  {
    id: "202",
    name: "Salle 202",
    floor: 1,
    building: "Bâtiment A",
    status: "alert" as const,
    conditions: { temperature: 26.5, co2: 1450, noise: 72, brightness: 45 },
    lastUpdated: "À l'instant",
  },
  {
    id: "203",
    name: "Salle 203",
    floor: 1,
    building: "Bâtiment A",
    status: "available" as const,
    conditions: { temperature: 22.0, co2: 780, noise: 40, brightness: 80 },
    lastUpdated: "Il y a 45s",
  },
  {
    id: "301",
    name: "Salle 301",
    floor: 2,
    building: "Bâtiment A",
    status: "occupied" as const,
    conditions: { temperature: 23.9, co2: 1050, noise: 58, brightness: 65 },
    lastUpdated: "Il y a 2m",
  },
  {
    id: "302",
    name: "Salle 302",
    floor: 2,
    building: "Bâtiment A",
    status: "available" as const,
    conditions: { temperature: 21.5, co2: 920, noise: 50, brightness: 85 },
    lastUpdated: "Il y a 20s",
  },
];

type ViewMode = "list" | "grid";
type SortBy = "name" | "comfort" | "floor";

export default function Salles() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("name");

  const buildings = ["Bâtiment A", "Bâtiment B"];
  const [selectedBuilding, setSelectedBuilding] = useState(buildings[0]);
  const floors = [0, 1, 2];

  // Filter and sort rooms
  const filteredRooms = useMemo(() => {
    const floorFilter = selectedFloor === "all" ? null : parseInt(selectedFloor, 10);
    let rooms = mockRooms.filter((room) => room.building === selectedBuilding);

    if (floorFilter !== null) {
      rooms = rooms.filter((room) => room.floor === floorFilter);
    }

    if (showOnlyAvailable) {
      rooms = rooms.filter((room) => room.status === "available");
    }

    // Sort
    rooms.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "floor") {
        return a.floor - b.floor;
      } else if (sortBy === "comfort") {
        const scoreA =
          (a.status === "available" ? 3 : 0) + (a.conditions.co2 < 1000 ? 1 : 0);
        const scoreB =
          (b.status === "available" ? 3 : 0) + (b.conditions.co2 < 1000 ? 1 : 0);
        return scoreB - scoreA;
      }
      return 0;
    });

    return rooms;
  }, [selectedBuilding, selectedFloor, showOnlyAvailable, sortBy]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Salles</h1>
        <p className="text-muted-foreground">
          Trouvez une salle confortable et disponible
        </p>
      </div>

      {/* Filters and controls */}
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
                  {buildings.map((building) => (
                    <SelectItem key={building} value={building}>
                      {building}
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

      {/* View toggle */}
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

      {/* Rooms display */}
      {filteredRooms.length > 0 ? (
        <div
          className={cn(
            "gap-4",
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col"
          )}
        >
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              id={room.id}
              name={room.name}
              floor={room.floor}
              status={room.status}
              conditions={room.conditions}
              lastUpdated={room.lastUpdated}
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
