import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Admin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Administration</h1>
        <p className="text-muted-foreground mt-2">
          Paramètres globaux et gestion des utilisateurs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuration globale</CardTitle>
            <CardDescription>Définissez les seuils appliqués à l'ensemble du campus</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="co2-threshold">Seuil CO₂ global (ppm)</Label>
              <Input id="co2-threshold" type="number" defaultValue="1200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp-min">Température min (°C)</Label>
              <Input id="temp-min" type="number" defaultValue="18" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temp-max">Température max (°C)</Label>
              <Input id="temp-max" type="number" defaultValue="26" />
            </div>
            <Button className="w-full">Sauvegarder</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations du site</CardTitle>
            <CardDescription>Mettez à jour l'identité visuelle de la plateforme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Nom de l'établissement</Label>
              <Input id="site-name" type="text" defaultValue="Campus Principal" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input id="logo-url" type="text" placeholder="https://..." />
            </div>
            <Button className="w-full">Sauvegarder</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gestion des utilisateurs</CardTitle>
            <CardDescription>Contrôlez les accès à la plateforme RoomScan</CardDescription>
          </div>
          <Button size="sm">Ajouter un utilisateur</Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Date d'ajout</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[{ email: "admin@campus.edu", role: "Administrateur", date: "15 Oct 2024" }, { email: "supervisor@campus.edu", role: "Superviseur", date: "15 Oct 2024" }, { email: "viewer@campus.edu", role: "Lecteur", date: "20 Oct 2024" }].map((user) => (
                <TableRow key={user.email}>
                  <TableCell className="font-medium text-foreground">{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-muted-foreground">{user.date}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm">Modifier</Button>
                    <Button variant="ghost" size="sm" className="text-status-alert hover:text-status-alert">
                      Supprimer
                    </Button>
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
