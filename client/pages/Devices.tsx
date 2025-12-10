import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Devices() {
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
                <TableHead>Dernier contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[{ name: "Capteur Salle 101", serial: "ESP-751FB608", room: "Salle 101", status: "En ligne", lastContact: "À l'instant" }, { name: "Capteur Salle 102", serial: "ESP-8A2C3456", room: "Salle 102", status: "En ligne", lastContact: "Il y a 30s" }, { name: "Capteur Salle 103", serial: "ESP-D4E5F789", room: "Salle 103", status: "En ligne", lastContact: "Il y a 1m" }, { name: "Capteur Salle 105", serial: "ESP-A1B2C3D4", room: "Salle 105", status: "Hors ligne", lastContact: "Il y a 2h" }].map((device) => (
                <TableRow key={device.serial}>
                  <TableCell className="font-medium text-foreground">{device.name}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{device.serial}</TableCell>
                  <TableCell>{device.room}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={device.status === "En ligne"
                        ? "border-status-available/40 bg-status-available/10 text-status-available"
                        : "border-status-alert/40 bg-status-alert/10 text-status-alert"}
                    >
                      {device.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{device.lastContact}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Configurer</Button>
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
