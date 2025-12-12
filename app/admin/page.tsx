"use client";

import { useState, useTransition, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Radio, Settings2, Power, PowerOff, ArrowLeft, Home, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useSWRConfig } from "swr";
import { AlertTriangle } from "lucide-react";
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
  roomId?: { _id?: string; name?: string; buildingId?: { _id: string; name?: string } };
  status?: string;
  batteryLevel?: number;
  lastSeenAt?: string;
  isPoweredOn?: boolean;
  configStatus?: string;
};

function AdminPageContent() {
  const { mutate } = useSWRConfig();
  const {
    data: logsRes,
    isLoading: logsLoading,
    error: logsError,
  } = useSWR("/api/history", fetcher);
  const logs: AuditLog[] = logsRes?.data ?? [];

  const { data: devicesRes } = useSWR("/api/devices", fetcher);
  const devices: Device[] = devicesRes?.data ?? [];
  const devicesOnline = devices.filter((d) => d.status === "ONLINE").length;
  const scannedDevices = devices.filter((d) => d.configStatus === "SCAN_BY_CARD");
  const { data: buildingsRes } = useSWR("/api/buildings", fetcher);
  const buildings: { _id: string; name: string; address?: string; totalFloors?: number }[] = buildingsRes?.data ?? [];
  const { data: roomsRes } = useSWR("/api/rooms", fetcher);
  const rooms: { _id: string; name: string; buildingId?: { _id: string; name: string }; floor?: number; currentStatus?: string }[] =
    roomsRes?.data ?? [];
  
  // KPIs pour les statistiques
  const kpis = [
    { label: "Salles totales", value: rooms.length.toString() },
    { label: "Capteurs en ligne", value: devicesOnline.toString() },
    { label: "Capteurs totaux", value: devices.length.toString() },
    { label: "Alertes actives", value: scannedDevices.length.toString() },
  ];

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


  const QuickDeviceAction = ({ device }: { device: Device }) => {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const currentRoom = rooms.find(
      (r) =>
        r._id === (device.roomId as any)?._id ||
        r._id === (device.roomId as any)
    );
    const initialBuildingId =
      (currentRoom?.buildingId as any)?._id || (currentRoom?.buildingId as any) || "";
    const [form, setForm] = useState({
      name: device.name ?? "",
      status: device.status ?? "UNKNOWN",
      configStatus: device.configStatus ?? "PENDING",
      batteryLevel: device.batteryLevel ?? "",
      isPoweredOn: device.isPoweredOn ?? true,
      buildingId: initialBuildingId,
      roomId: currentRoom?._id ?? "",
    });

    const handleSubmit = async () => {
      startTransition(async () => {
        await fetch(`/api/devices/by-id/${device._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            status: form.status,
            configStatus: device.configStatus === "SCAN_BY_CARD" ? "CONFIGURED" : form.configStatus,
            batteryLevel: form.batteryLevel === "" ? undefined : Number(form.batteryLevel),
            isPoweredOn: form.isPoweredOn,
            roomId: form.roomId || undefined,
          }),
        });
        setOpen(false);
        mutate("/api/devices");
      });
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">Configurer</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurer le device</DialogTitle>
            <DialogDescription>
              Mettre à jour les informations du capteur scanné.
            </DialogDescription>
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
              <Label>Bâtiment</Label>
              <Select
                value={form.buildingId}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    buildingId: v,
                    roomId: "",
                  }))
                }
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
              <Label>Salle</Label>
              <Select
                value={form.roomId}
                onValueChange={(v) => setForm((f) => ({ ...f, roomId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une salle" />
                </SelectTrigger>
                <SelectContent>
                  {rooms
                    .filter((r) =>
                      form.buildingId ? ((r.buildingId as any)?._id || (r.buildingId as any)) === form.buildingId : true
                    )
                    .map((r) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.name} {r.buildingId?.name ? `- ${r.buildingId.name}` : ""}{" "}
                        {r.floor !== undefined ? `(Étage ${r.floor})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="SCAN_BY_CARD">SCAN_BY_CARD</SelectItem>
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
                id={`powered-${device._id}`}
                checked={form.isPoweredOn}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isPoweredOn: v }))}
              />
              <Label htmlFor={`powered-${device._id}`}>Alimenté</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      const res = await fetch(`/api/devices/by-id/${deviceId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate("/api/devices");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du device:", error);
    }
  };

  const handleDeleteBuilding = async (buildingId: string) => {
    try {
      const res = await fetch(`/api/buildings/by-id/${buildingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate("/api/buildings");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du bâtiment:", error);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const res = await fetch(`/api/rooms/by-id/${roomId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate("/api/rooms");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la salle:", error);
    }
  };

  // Composant Dialog pour éditer un bâtiment
  const EditBuildingDialog = ({ building }: { building: { _id: string; name: string; address?: string; totalFloors?: number } }) => {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
      name: building.name || "",
      address: building.address || "",
      totalFloors: building.totalFloors?.toString() || "",
    });

    // Réinitialiser le formulaire quand le dialog s'ouvre
    useEffect(() => {
      if (open) {
        setForm({
          name: building.name || "",
          address: building.address || "",
          totalFloors: building.totalFloors?.toString() || "",
        });
      }
    }, [open, building]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      startTransition(async () => {
        const res = await fetch(`/api/buildings/by-id/${building._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name || undefined,
            address: form.address || undefined,
            totalFloors: form.totalFloors === "" ? undefined : Number(form.totalFloors),
          }),
        });
        if (res.ok) {
          mutate("/api/buildings");
          setOpen(false);
        }
      });
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">Modifier</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier "{building.name}"</DialogTitle>
            <DialogDescription>Mettre à jour les informations du bâtiment</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Optionnel"
              />
            </div>
            <div className="space-y-2">
              <Label>Étages totaux</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.totalFloors}
                onChange={(e) => setForm((f) => ({ ...f, totalFloors: e.target.value }))}
                placeholder="Optionnel"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  // Composant Dialog pour éditer une salle
  const CreateBuildingDialog = () => {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
      name: "",
      address: "",
      totalFloors: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      startTransition(async () => {
        const res = await fetch("/api/buildings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            address: form.address || undefined,
            totalFloors: form.totalFloors === "" ? undefined : Number(form.totalFloors),
          }),
        });
        if (res.ok) {
          mutate("/api/buildings");
          setForm({ name: "", address: "", totalFloors: "" });
          setOpen(false);
        }
      });
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Nouveau bâtiment
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un bâtiment</DialogTitle>
            <DialogDescription>Ajouter un nouveau bâtiment au campus</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du bâtiment *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Bâtiment A"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="123 Rue de l'Université"
              />
            </div>
            <div className="space-y-2">
              <Label>Étages totaux</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.totalFloors}
                onChange={(e) => setForm((f) => ({ ...f, totalFloors: e.target.value }))}
                placeholder="5"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const CreateRoomDialog = () => {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
      buildingId: "",
      name: "",
      floor: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      startTransition(async () => {
        const res = await fetch("/api/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buildingId: form.buildingId,
            name: form.name,
            floor: form.floor === "" ? undefined : Number(form.floor),
          }),
        });
        if (res.ok) {
          mutate("/api/rooms");
          setForm({ buildingId: "", name: "", floor: "" });
          setOpen(false);
        }
      });
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" variant="outline">
            <Settings2 className="h-4 w-4 mr-2" />
            Nouvelle salle
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une salle</DialogTitle>
            <DialogDescription>Ajouter une nouvelle salle à un bâtiment</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Bâtiment *</Label>
              <Select
                value={form.buildingId}
                onValueChange={(v) => setForm((f) => ({ ...f, buildingId: v }))}
                required
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
              <Label>Nom de la salle *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Salle 101"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Étage</Label>
              <Input
                type="number"
                value={form.floor}
                onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                placeholder="1"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const CreateDeviceDialog = () => {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
      serialNumber: "",
      name: "",
      roomId: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      startTransition(async () => {
        const res = await fetch("/api/devices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serialNumber: form.serialNumber,
            name: form.name || undefined,
            roomId: form.roomId || undefined,
          }),
        });
        if (res.ok) {
          mutate("/api/devices");
          setForm({ serialNumber: "", name: "", roomId: "" });
          setOpen(false);
        }
      });
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" variant="outline">
            <Radio className="h-4 w-4 mr-2" />
            Nouveau capteur
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un capteur</DialogTitle>
            <DialogDescription>Ajouter un nouveau capteur/device</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Numéro de série *</Label>
              <Input
                value={form.serialNumber}
                onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
                placeholder="ESP32-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Capteur Salle 101"
              />
            </div>
            <div className="space-y-2">
              <Label>Salle</Label>
              <Select
                value={form.roomId}
                onValueChange={(v) => setForm((f) => ({ ...f, roomId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une salle" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r._id} value={r._id}>
                      {r.name} {r.buildingId?.name ? `- ${r.buildingId.name}` : ""}{" "}
                      {r.floor !== undefined ? `(Étage ${r.floor})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const EditRoomDialog = ({ room }: { room: any }) => {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [form, setForm] = useState({
      name: room.name || "",
      floor: room.floor?.toString() || "",
      currentStatus: room?.currentStatus || "",
    });

    // Réinitialiser le formulaire quand le dialog s'ouvre
    useEffect(() => {
      if (open) {
        setForm({
          name: room.name || "",
          floor: room.floor?.toString() || "",
          currentStatus: room?.currentStatus || "",
        });
      }
    }, [open, room]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      startTransition(async () => {
        const res = await fetch(`/api/rooms/by-id/${room._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name || undefined,
            floor: form.floor === "" ? undefined : Number(form.floor),
            currentStatus: form.currentStatus || undefined,
          }),
        });
        if (res.ok) {
          mutate("/api/rooms");
          setOpen(false);
        }
      });
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">Modifier</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier "{room.name}"</DialogTitle>
            <DialogDescription>Mettre à jour les informations de la salle</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Étage</Label>
              <Input
                type="number"
                value={form.floor}
                onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                placeholder="Optionnel"
              />
            </div>
            <div className="space-y-2">
              <Label>Statut courant</Label>
              <Select
                value={form.currentStatus}
                onValueChange={(v) => setForm((f) => ({ ...f, currentStatus: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                  <SelectItem value="OCCUPIED">OCCUPIED</SelectItem>
                  <SelectItem value="UNKNOWN">UNKNOWN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const DeviceRow = ({ device }: { device: Device }) => {
    const isOnline = device.status === "ONLINE";
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const currentRoom = rooms.find(
      (r) =>
        r._id === (device.roomId as any)?._id ||
        r._id === (device.roomId as any)
    );
    const initialBuildingId =
      (currentRoom?.buildingId as any)?._id || (currentRoom?.buildingId as any) || "";
    const [form, setForm] = useState({
      name: device.name ?? "",
      status: device.status ?? "UNKNOWN",
      configStatus: device.configStatus ?? "PENDING",
      batteryLevel: device.batteryLevel ?? "",
      isPoweredOn: device.isPoweredOn ?? true,
      buildingId: initialBuildingId,
      roomId: currentRoom?._id ?? "",
    });

    const handleSubmit = async () => {
      startTransition(async () => {
        const res = await fetch(`/api/devices/by-id/${device._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            status: form.status,
            configStatus: device.configStatus === "SCAN_BY_CARD" ? "CONFIGURED" : form.configStatus,
            batteryLevel: form.batteryLevel === "" ? undefined : Number(form.batteryLevel),
            isPoweredOn: form.isPoweredOn,
            roomId: form.roomId || undefined,
          }),
        });
        if (res.ok) {
          mutate("/api/devices");
          setOpen(false);
        }
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
          <div className="flex items-center justify-end gap-2">
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
              <Label>Bâtiment</Label>
              <Select
                value={form.buildingId}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    buildingId: v,
                    roomId: "",
                  }))
                }
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
              <Label>Salle</Label>
              <Select
                value={form.roomId}
                onValueChange={(v) => setForm((f) => ({ ...f, roomId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une salle" />
                </SelectTrigger>
                <SelectContent>
                  {rooms
                    .filter((r) =>
                      form.buildingId ? ((r.buildingId as any)?._id || (r.buildingId as any)) === form.buildingId : true
                    )
                    .map((r) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.name} {r.buildingId?.name ? `- ${r.buildingId.name}` : ""}{" "}
                        {r.floor !== undefined ? `(Étage ${r.floor})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="SCAN_BY_CARD">SCAN_BY_CARD</SelectItem>
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
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce capteur ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le capteur "{device.name || device.serialNumber}" sera définitivement supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteDevice(device._id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour aux salles
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-bold text-foreground">Administration</h1>
          <Link
            href="/history"
            className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Voir l'historique complet
          </Link>
        </div>
        <p className="text-muted-foreground">
          Supervision des logs et ressources
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-3xl font-bold text-foreground">{kpi.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {scannedDevices.length > 0 && (
        <Card className="border-status-alert/40 bg-status-alert/10">
          <CardHeader className="flex flex-row items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-status-alert mt-1" />
            <div>
              <CardTitle className="text-status-alert">Capteurs scannés à configurer</CardTitle>
              <CardDescription>
                Les devices en statut <span className="font-semibold text-status-alert">SCAN_BY_CARD</span> viennent d'être scannés. Ouvrez la configuration pour finaliser le provisioning.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {scannedDevices.map((d) => (
              <div
                key={d._id}
                className="rounded-md border border-status-alert/30 bg-white/60 p-3 shadow-sm dark:bg-background"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{d.name || "Capteur sans nom"}</p>
                    <p className="text-xs text-muted-foreground font-mono">{d.serialNumber}</p>
                  </div>
                  <Badge variant="outline" className="border-status-alert/40 text-status-alert">
                    SCAN_BY_CARD
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground space-y-1">
                  <p>Salle : {d.roomId?.name ?? "Non affecté"}</p>
                  <p>Statut : {d.status ?? "Inconnu"}</p>
                  <p>Vu le : {d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleString() : "—"}</p>
                </div>
                <div className="mt-3">
                  <QuickDeviceAction device={d} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
        <CardContent className="grid gap-4 md:grid-cols-3">
          <CreateBuildingDialog />
          <CreateRoomDialog />
          <CreateDeviceDialog />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modifier un bâtiment / une salle</CardTitle>
          <CardDescription>Mises à jour rapides des entités existantes</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {/* Liste des bâtiments */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Bâtiments</p>
            <div className="space-y-2">
              {buildings.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun bâtiment</p>
              ) : (
                buildings.map((building) => (
                  <div
                    key={building._id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <span className="text-sm font-medium">{building.name}</span>
                    <div className="flex gap-2">
                      <EditBuildingDialog building={building} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer "{building.name}" ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Toutes les salles associées perdront leur référence.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBuilding(building._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Liste des salles */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Salles</p>
            <div className="space-y-2">
              {rooms.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune salle</p>
              ) : (
                rooms.map((room) => (
                  <div
                    key={room._id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <div>
                      <span className="text-sm font-medium">{room.name}</span>
                      {room.buildingId?.name && (
                        <span className="text-xs text-muted-foreground ml-2">
                          - {room.buildingId.name}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <EditRoomDialog room={room} />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer "{room.name}" ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Tous les capteurs associés perdront leur référence.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteRoom(room._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
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
          {/* Message mobile */}
          <div className="md:hidden p-6 text-center">
            <p className="text-muted-foreground">
              📱 Disponible sur desktop uniquement
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Cette fonctionnalité nécessite un écran plus large
            </p>
          </div>
          {/* Tableau desktop */}
          <Table className="hidden md:table">
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
          <CardContent className="hidden md:block">
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
          {/* Message mobile */}
          <div className="md:hidden p-6 text-center">
            <p className="text-muted-foreground">
              📱 Disponible sur desktop uniquement
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Cette fonctionnalité nécessite un écran plus large
            </p>
          </div>
          {/* Tableau desktop */}
          <Table className="hidden md:table">
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

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['SUPERVISOR']}>
      <AdminPageContent />
    </ProtectedRoute>
  );
}

