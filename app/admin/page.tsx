"use client";

import { useState, useTransition } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Radio } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useSWRConfig } from "swr";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
} from "recharts";

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json());

type AuditLog = {
  _id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
  createdAt?: string;
};

type Device = {
  _id: string;
  name?: string;
  serialNumber: string;
  roomId?: { name?: string };
  status?: string;
  batteryLevel?: number;
  lastSeenAt?: string;
  isPoweredOn?: boolean;
  configStatus?: string;
};

export default function AdminPage() {
  const { mutate } = useSWRConfig();
  const {
    data: logsRes,
    isLoading: logsLoading,
    error: logsError,
  } = useSWR("/api/history", fetcher);
  const logs: AuditLog[] = logsRes?.data ?? [];

  const { data: devicesRes } = useSWR("/api/devices", fetcher);
  const devices: Device[] = devicesRes?.data ?? [];
  const { data: buildingsRes } = useSWR("/api/buildings", fetcher);
  const buildings: { _id: string; name: string }[] = buildingsRes?.data ?? [];
  const { data: roomsRes } = useSWR("/api/rooms", fetcher);

  const logsSeries = logs
    .map((l) => ({
      date: l.createdAt ? new Date(l.createdAt) : null,
    }))
    .filter((l) => l.date)
    .reduce<Record<string, number>>((acc, curr) => {
      const key = curr.date!.toISOString().slice(0, 10);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  const logsChartData = Object.entries(logsSeries)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Form states
  const [buildingForm, setBuildingForm] = useState({
    name: "",
    address: "",
    totalFloors: 5,
    message: "",
    error: "",
    pending: false,
  });
  const [roomForm, setRoomForm] = useState({
    buildingId: "",
    name: "",
    floor: 1,
    message: "",
    error: "",
    pending: false,
  });
  const [deviceForm, setDeviceForm] = useState({
    serialNumber: "",
    name: "",
    roomId: "",
    message: "",
    error: "",
    pending: false,
  });

  const submitBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuildingForm((f) => ({ ...f, pending: true, error: "", message: "" }));
    try {
      const res = await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: buildingForm.name,
          address: buildingForm.address || undefined,
          totalFloors: buildingForm.totalFloors || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Erreur lors de la création du bâtiment");
      }
      setBuildingForm((f) => ({
        ...f,
        pending: false,
        message: "Bâtiment créé",
      }));
      mutate("/api/buildings");
    } catch (err: any) {
      setBuildingForm((f) => ({ ...f, pending: false, error: err.message }));
    }
  };

  const submitRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomForm((f) => ({ ...f, pending: true, error: "", message: "" }));
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingId: roomForm.buildingId,
          name: roomForm.name,
          floor: roomForm.floor,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Erreur lors de la création de la salle");
      }
      setRoomForm((f) => ({
        ...f,
        pending: false,
        message: "Salle créée",
      }));
      mutate("/api/rooms");
    } catch (err: any) {
      setRoomForm((f) => ({ ...f, pending: false, error: err.message }));
    }
  };

  const submitDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeviceForm((f) => ({ ...f, pending: true, error: "", message: "" }));
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serialNumber: deviceForm.serialNumber,
          name: deviceForm.name || undefined,
          roomId: deviceForm.roomId || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Erreur lors de la création du capteur");
      }
      setDeviceForm((f) => ({
        serialNumber: "",
        name: "",
        roomId: "",
        pending: false,
        message: "Capteur créé",
        error: "",
      }));
      mutate("/api/devices");
    } catch (err: any) {
      setDeviceForm((f) => ({ ...f, pending: false, error: err.message }));
    }
  };

  const DeviceRow = ({ device }: { device: Device }) => {
    const isOnline = device.status === "ONLINE";
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
      name: device.name ?? "",
      status: device.status ?? "UNKNOWN",
      configStatus: device.configStatus ?? "PENDING",
      batteryLevel: device.batteryLevel ?? "",
      isPoweredOn: device.isPoweredOn ?? true,
    });

    const handleSubmit = async () => {
      startTransition(async () => {
        await fetch(`/api/devices/by-id/${device._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            status: form.status,
            configStatus: form.configStatus,
            batteryLevel: form.batteryLevel === "" ? undefined : Number(form.batteryLevel),
            isPoweredOn: form.isPoweredOn,
          }),
        });
        setOpen(false);
      });
    };

    return (
      <TableRow key={device._id}>
        <TableCell className="font-medium text-foreground">{device.name ?? "—"}</TableCell>
        <TableCell className="font-mono text-muted-foreground">{device.serialNumber}</TableCell>
        <TableCell>{device.roomId?.name ?? "Non affecté"}</TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className={
              isOnline
                ? "border-status-available/40 bg-status-available/10 text-status-available"
                : "border-status-alert/40 bg-status-alert/10 text-status-alert"
            }
          >
            {isOnline ? "En ligne" : device.status ?? "Inconnu"}
          </Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {device.batteryLevel != null ? `${device.batteryLevel}%` : "—"}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : "—"}
        </TableCell>
        <TableCell className="text-right">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">Modifier</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurer le device</DialogTitle>
                <DialogDescription>Mettre à jour les informations du capteur.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONLINE">ONLINE</SelectItem>
                      <SelectItem value="OFFLINE">OFFLINE</SelectItem>
                      <SelectItem value="ERROR">ERROR</SelectItem>
                      <SelectItem value="UNKNOWN">UNKNOWN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statut config</Label>
                  <Select
                    value={form.configStatus}
                    onValueChange={(v) => setForm((f) => ({ ...f, configStatus: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Statut config" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                      <SelectItem value="CONFIGURED">CONFIGURED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Niveau batterie (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.batteryLevel}
                    onChange={(e) => setForm((f) => ({ ...f, batteryLevel: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    id="powered"
                    checked={form.isPoweredOn}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isPoweredOn: v }))}
                  />
                  <Label htmlFor="powered">Alimenté</Label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={isPending}>
                  {isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administration</h1>
          <p className="text-muted-foreground mt-2">
            Supervision des logs et ressources
          </p>
        </div>
        <Link
          href="/history"
          className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
        >
          Voir l'historique complet
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration des capteurs</CardTitle>
          <CardDescription>Définir les seuils et options globales</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Seuil CO₂ (ppm)</Label>
            <Input defaultValue="1200" type="number" />
          </div>
          <div className="space-y-2">
            <Label>Température min (°C)</Label>
            <Input defaultValue="18" type="number" />
          </div>
          <div className="space-y-2">
            <Label>Température max (°C)</Label>
            <Input defaultValue="26" type="number" />
          </div>
          <div className="space-y-2">
            <Label>Luminosité min (%)</Label>
            <Input defaultValue="30" type="number" />
          </div>
          <div className="space-y-2">
            <Label>Niveau sonore max (dB)</Label>
            <Input defaultValue="65" type="number" />
          </div>
          <div className="space-y-2">
            <Label>Intervalle de mesure (s)</Label>
            <Input defaultValue="60" type="number" />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button>Enregistrer</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Création rapide</CardTitle>
          <CardDescription>Ajouter un bâtiment, une salle ou un capteur</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <form className="space-y-3" onSubmit={submitBuilding}>
            <p className="text-sm font-medium text-foreground">Nouveau bâtiment</p>
            <div className="space-y-2">
              <Label>Nom du bâtiment</Label>
              <Input
                placeholder="Bâtiment A"
                value={buildingForm.name}
                onChange={(e) => setBuildingForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                placeholder="123 Rue ..."
                value={buildingForm.address}
                onChange={(e) => setBuildingForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Étages totaux</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={buildingForm.totalFloors}
                onChange={(e) =>
                  setBuildingForm((f) => ({
                    ...f,
                    totalFloors: Number(e.target.value),
                  }))
                }
              />
            </div>
            {buildingForm.error && (
              <p className="text-sm text-red-600">{buildingForm.error}</p>
            )}
            {buildingForm.message && (
              <p className="text-sm text-green-600">{buildingForm.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={buildingForm.pending}>
              {buildingForm.pending ? "Création..." : "Créer le bâtiment"}
            </Button>
          </form>

          <form className="space-y-3" onSubmit={submitRoom}>
            <p className="text-sm font-medium text-foreground">Nouvelle salle</p>
            <div className="space-y-2">
              <Label>Bâtiment</Label>
              <Select
                value={roomForm.buildingId}
                onValueChange={(v) => setRoomForm((f) => ({ ...f, buildingId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un bâtiment" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((b) => (
                    <SelectItem key={b._id} value={b._id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nom de la salle</Label>
              <Input
                placeholder="Salle 101"
                value={roomForm.name}
                onChange={(e) => setRoomForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Étage</Label>
              <Input
                type="number"
                value={roomForm.floor}
                onChange={(e) => setRoomForm((f) => ({ ...f, floor: Number(e.target.value) }))}
              />
            </div>
            {roomForm.error && (
              <p className="text-sm text-red-600">{roomForm.error}</p>
            )}
            {roomForm.message && (
              <p className="text-sm text-green-600">{roomForm.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={roomForm.pending}>
              {roomForm.pending ? "Création..." : "Créer la salle"}
            </Button>
          </form>

          <form className="space-y-3" onSubmit={submitDevice}>
            <p className="text-sm font-medium text-foreground">Nouveau capteur</p>
            <div className="space-y-2">
              <Label>Numéro de série</Label>
              <Input
                placeholder="ESP32-001"
                value={deviceForm.serialNumber}
                onChange={(e) => setDeviceForm((f) => ({ ...f, serialNumber: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                placeholder="Capteur Salle 101"
                value={deviceForm.name}
                onChange={(e) => setDeviceForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Salle</Label>
              <Select
                value={deviceForm.roomId}
                onValueChange={(v) => setDeviceForm((f) => ({ ...f, roomId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une salle" />
                </SelectTrigger>
                <SelectContent>
                  {(roomsRes?.data ?? []).map((r: any) => (
                    <SelectItem key={r._id} value={r._id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {deviceForm.error && (
              <p className="text-sm text-red-600">{deviceForm.error}</p>
            )}
            {deviceForm.message && (
              <p className="text-sm text-green-600">{deviceForm.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={deviceForm.pending}>
              {deviceForm.pending ? "Création..." : "Créer le capteur"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Capteurs (accès admin)</CardTitle>
            <CardDescription>Gestion et consultation des devices</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Numéro de série</TableHead>
                <TableHead>Salle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Batterie</TableHead>
                <TableHead>Dernier contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Aucun device
                  </TableCell>
                </TableRow>
              )}
              {devices.map((d) => (
                <DeviceRow key={d._id} device={d} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Logs récents</CardTitle>
            <CardDescription>Dernières actions (200 max)</CardDescription>
          </div>
          <Link
            href="/history"
            className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Voir l'historique complet
          </Link>
        </CardHeader>
        {logsChartData.length > 0 && (
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={logsChartData}>
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <ReTooltip />
                  <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        )}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entité</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Chargement des logs...
                  </TableCell>
                </TableRow>
              )}
              {logsError && !logsLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-red-500">
                    Erreur de chargement des logs
                  </TableCell>
                </TableRow>
              )}
              {!logsLoading && !logsError && logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Aucun log pour le moment
                  </TableCell>
                </TableRow>
              )}
              {!logsLoading && !logsError &&
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium text-foreground">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.entityType ?? "—"}
                      {log.entityId ? ` / ${log.entityId}` : ""}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.details ? (
                        <pre className="whitespace-pre-wrap text-xs">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

