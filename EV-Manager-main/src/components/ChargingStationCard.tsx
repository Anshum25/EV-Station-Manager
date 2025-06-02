import { ChargingStation } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Zap,
  Settings,
  Edit,
  Trash2,
  Power,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChargingStationCardProps {
  station: ChargingStation;
  onEdit: (station: ChargingStation) => void;
  onDelete: (id: string) => void;
  onShowOnMap: (latitude: number, longitude: number) => void;
}

const connectorTypeLabels = {
  type1: "Type 1",
  type2: "Type 2",
  ccs: "CCS",
  chademo: "CHAdeMO",
  tesla: "Tesla",
};

export const ChargingStationCard: React.FC<ChargingStationCardProps> = ({
  station,
  onEdit,
  onDelete,
  onShowOnMap,
}) => {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold truncate pr-2">
          {station.name}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge
            variant={station.status === "active" ? "default" : "secondary"}
            className={
              station.status === "active" ? "bg-green-500" : "bg-gray-500"
            }
          >
            <Power className="w-3 h-3 mr-1" />
            {station.status === "active" ? "Active" : "Inactive"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(station)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onShowOnMap(station.latitude, station.longitude)}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Show on Map
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(station.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>
              {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              <span className="font-medium">{station.power_output} kW</span>
            </div>
            <div className="flex items-center text-sm">
              <Settings className="w-4 h-4 mr-2 text-blue-500" />
              <span>{connectorTypeLabels[station.connector_type]}</span>
            </div>
          </div>

          <div className="pt-2 text-xs text-gray-500">
            Created: {new Date(station.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
