"use client";

import { useMemo, useState, useTransition } from "react";
import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const mapDeviceStatusToBadge = (status: string | undefined) => {
  const isOnline = status === "ONLINE";
  return {
    label:
      status === "ONLINE" ? "En ligne" :
      status === "OFFLINE" ? "Hors ligne" :
      status === "ERROR" ? "Erreur" : "Inconnu",
    className: isOnline
      ? "border-status-available/40 bg-status-available/10 text-status-available"
      : "border-status-alert/40 bg-status-alert/10 text-status-alert",
  };
};

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json());

function useLatestDeviceData(deviceId: string | undefined) {
  const { data, error, isLoading } = useSWR(
    deviceId ? `/api/devices/by-id/${deviceId}/data?limit=1` : null,
    fetcher
  );
  const latest = data?.data?.[0];
  return { latest, isLoading, error };
}

function DeviceRow({ device }: { device: any }) {
  const status = mapDeviceStatusToBadge(device.status);
  const { latest } = useLatestDeviceData(device._id);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: device.name ?? "",
    status: device.status ?? "UNKNOWN",
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
        <Badge variant="outline" className={status.className}>{status.label}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {device.batteryLevel != null ? `${device.batteryLevel}%` : "—"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {latest
          ? `${latest.temperature ?? "—"}°C / ${latest.co2 ?? "—"} ppm`
          : "—"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {latest?.measuredAt
          ? new Date(latest.measuredAt).toLocaleString()
          : "—"}
      </TableCell>
      <TableCell className="text-right">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">Configurer</Button>
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
}

export default function Devices() {
  const { data: devicesRes, isLoading } = useSWR("/api/devices", fetcher);
  const devices = devicesRes?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Capteurs</h1>
        <p className="text-muted-foreground mt-2">
          Gestion et configuration des devices de mesure
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des capteurs</CardTitle>
          <CardDescription>Suivi en direct des devices connectés</CardDescription>
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
                <TableHead>Temp / CO₂</TableHead>
                <TableHead>Mesure</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Chargement...
                  </TableCell>
                </TableRow>
              )}
              {devices.map((device: any) => (
                <DeviceRow key={device._id} device={device} />
              ))}
              {!isLoading && devices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aucun device trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
