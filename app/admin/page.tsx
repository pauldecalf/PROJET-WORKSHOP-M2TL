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
};

export default function AdminPage() {
  const { data: logsRes } = useSWR("/api/history", fetcher);
  const logs: AuditLog[] = logsRes?.data ?? [];

  const { data: devicesRes } = useSWR("/api/devices", fetcher);
  const devices: Device[] = devicesRes?.data ?? [];

  const DeviceRow = ({ device }: { device: Device }) => {
    const isOnline = device.status === "ONLINE";
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
        <CardHeader>
          <CardTitle>Logs récents</CardTitle>
          <CardDescription>Dernières actions (200 max)</CardDescription>
        </CardHeader>
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
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Aucun log pour le moment
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
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

