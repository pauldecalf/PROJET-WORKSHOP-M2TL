import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function History() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Historique</h1>
        <p className="text-muted-foreground mt-2">
          Visualisez les données et tendances historiques
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Choisissez la salle, le capteur et la période</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Salle</Label>
              <Select defaultValue="101">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une salle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="101">Salle 101</SelectItem>
                  <SelectItem value="102">Salle 102</SelectItem>
                  <SelectItem value="103">Salle 103</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Capteur</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un capteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les capteurs</SelectItem>
                  <SelectItem value="temperature">Température</SelectItem>
                  <SelectItem value="co2">CO₂</SelectItem>
                  <SelectItem value="noise">Bruit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Période</Label>
              <Select defaultValue="24h">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Dernière heure</SelectItem>
                  <SelectItem value="24h">Dernières 24h</SelectItem>
                  <SelectItem value="7d">Derniers 7 jours</SelectItem>
                  <SelectItem value="30d">Dernier mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {["CO₂ (ppm)", "Température (°C)", "Bruit (dB)", "Luminosité (%)"].map((metric) => (
          <Card key={metric}>
            <CardHeader>
              <CardTitle>{metric}</CardTitle>
              <CardDescription>Tendance sur la période sélectionnée</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/60">
                <p className="text-muted-foreground">Graphique en développement</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
