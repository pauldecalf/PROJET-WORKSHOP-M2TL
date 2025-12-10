import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble du système de monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[{ label: "Salles totales", value: "42" }, { label: "Capteurs en ligne", value: "38" }, { label: "Salles confortables", value: "28" }, { label: "Alertes actives", value: "4" }].map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-3xl font-bold text-foreground">{kpi.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan du bâtiment</CardTitle>
          <CardDescription>Visualisation des zones surveillées</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-muted/60">
            <p className="text-muted-foreground">Plan du bâtiment (en développement)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Derniers événements</CardTitle>
          <CardDescription>Résumé des alertes et changements récents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {["Salle 202: CO₂ > 1200 ppm (il y a 3 min)", "Capteur Salle 105: En ligne (il y a 2 min)", "Salle 301: Température anormale (il y a 5 min)"].map((event) => (
            <div key={event} className="flex items-start gap-3 pb-3 last:pb-0">
              <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
              <p className="text-sm text-foreground">{event}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
