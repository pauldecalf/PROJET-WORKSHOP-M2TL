 "use client";

import useSWR from "swr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
              {devices.map((device: any) => {
                const status = mapDeviceStatusToBadge(device.status);
                const { latest } = useLatestDeviceData(device._id);
                return (
                  <TableRow key={device._id}>
                    <TableCell className="font-medium text-foreground">{device.name ?? "—"}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{device.serialNumber}</TableCell>
                    <TableCell>{device.roomId?.name ?? "Non affecté"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={status.className}>{status.label}</Badge>
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
                      <Button variant="ghost" size="sm">Configurer</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
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
