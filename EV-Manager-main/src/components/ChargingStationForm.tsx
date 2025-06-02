import { useState, useEffect } from "react";
import { ChargingStation, CreateChargingStationInput } from "@/types";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ChargingStationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateChargingStationInput) => void;
  station?: ChargingStation | null;
  loading?: boolean;
}

export const ChargingStationForm: React.FC<ChargingStationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  station,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateChargingStationInput>({
    name: "",
    latitude: 0,
    longitude: 0,
    status: "active",
    power_output: 50,
    connector_type: "type2",
  });

  useEffect(() => {
    if (station) {
      setFormData({
        name: station.name,
        latitude: station.latitude,
        longitude: station.longitude,
        status: station.status,
        power_output: station.power_output,
        connector_type: station.connector_type,
      });
    } else {
      setFormData({
        name: "",
        latitude: 0,
        longitude: 0,
        status: "active",
        power_output: 50,
        connector_type: "type2",
      });
    }
  }, [station, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (
    field: keyof CreateChargingStationInput,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {station ? "Edit Charging Station" : "Add New Charging Station"}
          </DialogTitle>
          <DialogDescription>
            {station
              ? "Update the charging station details below."
              : "Add a new charging station to your network."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Station Name</Label>
            <Input
              id="name"
              placeholder="e.g., Downtown Station A"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="e.g., 40.7128"
                value={formData.latitude}
                onChange={(e) =>
                  handleInputChange("latitude", parseFloat(e.target.value) || 0)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="e.g., -74.0060"
                value={formData.longitude}
                onChange={(e) =>
                  handleInputChange(
                    "longitude",
                    parseFloat(e.target.value) || 0,
                  )
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="power_output">Power Output (kW)</Label>
            <Input
              id="power_output"
              type="number"
              min="1"
              placeholder="e.g., 50"
              value={formData.power_output}
              onChange={(e) =>
                handleInputChange("power_output", parseInt(e.target.value) || 0)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Connector Type</Label>
            <Select
              value={formData.connector_type}
              onValueChange={(value) =>
                handleInputChange("connector_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="type1">Type 1</SelectItem>
                <SelectItem value="type2">Type 2</SelectItem>
                <SelectItem value="ccs">CCS</SelectItem>
                <SelectItem value="chademo">CHAdeMO</SelectItem>
                <SelectItem value="tesla">Tesla</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {station ? "Updating..." : "Creating..."}
                </>
              ) : station ? (
                "Update Station"
              ) : (
                "Create Station"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
