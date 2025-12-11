import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AuditLog = {
  _id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
  userId?: string;
  createdAt?: string;
};

async function getLogs(): Promise<AuditLog[]> {
  const baseEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
  const base = baseEnv.endsWith("/") ? baseEnv.slice(0, -1) : baseEnv;

  const res = await fetch(`${base}/api/history`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data ?? [];
}

export default async function HistoryPage() {
  const logs = await getLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Historique</h1>
        <p className="text-muted-foreground mt-2">
          Journaux des actions et événements récents
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs</CardTitle>
          <CardDescription>Liste des actions (limitées aux entrées les plus récentes)</CardDescription>
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

