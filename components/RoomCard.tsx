import { Thermometer, Wind, Volume2, Sun, AlertCircle, CheckCircle2, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface RoomConditions {
  temperature: number;
  co2: number;
  noise?: number;
  brightness?: number;
}

interface RoomCardProps {
  id: string;
  name: string;
  floor: number;
  status: "available" | "occupied" | "alert";
  conditions: RoomConditions;
  lastUpdated?: string;
  actualStatus?: string;
  timeseries?: React.ReactNode;
}

export function RoomCard({
  id,
  name,
  floor,
  status,
  actualStatus,
  conditions,
  lastUpdated,
  timeseries,
}: RoomCardProps) {
  const statusConfig = {
    available: {
      className: "bg-status-available text-status-available-foreground",
      label: "Disponible",
      icon: CheckCircle2,
    },
    occupied: {
      className: "bg-status-alert text-status-alert-foreground",
      label: "Occupée",
      icon: AlertCircle,
    },
    alert: {
      className: "bg-status-attention text-status-attention-foreground",
      label: "Attention",
      icon: AlertCircle,
    },
  } as const;

  const config = statusConfig[status];

  const getComfortLevel = () => {
    let score = 0;
    if (conditions.temperature >= 19 && conditions.temperature <= 25) score++;
    if (conditions.co2 < 1000) score++;
    if (!conditions.noise || conditions.noise < 60) score++;
    if (!conditions.brightness || conditions.brightness > 50) score++;
    return score;
  };

  const comfortLevel = getComfortLevel();
  const comfortEmoji = comfortLevel >= 3 ? "😊" : comfortLevel >= 2 ? "😐" : "😞";
  const StatusIcon = config.icon;

  return (
    <Card
      className="flex flex-col gap-4 shadow-sm transition-all hover:shadow-md"
      data-room-id={id}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">{name}</CardTitle>
          <CardDescription>
            Étage {floor}
            {actualStatus ? ` • ${actualStatus}` : ""}
          </CardDescription>
        </div>
        <Badge
          className={cn(
            "flex items-center gap-1 border-transparent px-3 py-1 text-xs font-semibold shadow-sm",
            config.className,
          )}
        >
          <StatusIcon className="h-4 w-4" />
          {config.label}
        </Badge>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4">
        <div className="rounded-md border bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Température</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {conditions.temperature.toFixed(1)}°C
          </p>
        </div>

        <div className="rounded-md border bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">CO₂</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-foreground">{conditions.co2} ppm</p>
          <p
            className={cn(
              "mt-0.5 text-xs font-medium",
              conditions.co2 < 1000
                ? "text-status-available"
                : conditions.co2 < 1500
                  ? "text-status-attention"
                  : "text-status-alert",
            )}
          >
            {conditions.co2 < 1000 ? "Bon" : conditions.co2 < 1500 ? "Moyen" : "Mauvais"}
          </p>
        </div>

        {conditions.noise !== undefined && (
          <div className="rounded-md border bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Bruit</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">{conditions.noise} dB</p>
          </div>
        )}

        {conditions.brightness !== undefined && (
          <div className="rounded-md border bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Luminosité</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">{conditions.brightness}%</p>
          </div>
        )}
        {timeseries && (
          <div className="col-span-2">
            {timeseries}
          </div>
        )}
      </CardContent>

      <Separator className="mx-6" />

      <CardFooter className="flex items-center justify-between pt-2">
        <div className="text-center">
          <p className="text-2xl">{comfortEmoji}</p>
          <p className="text-xs text-muted-foreground">Confort</p>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{lastUpdated}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
