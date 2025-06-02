import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useChargingStations,
  useCreateChargingStation,
  useUpdateChargingStation,
  useDeleteChargingStation,
} from "@/hooks/useChargingStations";
import {
  ChargingStation,
  ChargingStationFilters,
  CreateChargingStationInput,
} from "@/types";
import { ChargingStationCard } from "@/components/ChargingStationCard";
import { ChargingStationForm } from "@/components/ChargingStationForm";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Filter,
  Map,
  LogOut,
  User,
  Zap,
  Search,
  MapPin,
  Power,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [filters, setFilters] = useState<ChargingStationFilters>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<ChargingStation | null>(
    null,
  );
  const [deleteStationId, setDeleteStationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: stations = [],
    isLoading,
    error,
  } = useChargingStations(filters);
  const createMutation = useCreateChargingStation();
  const updateMutation = useUpdateChargingStation();
  const deleteMutation = useDeleteChargingStation();

  const filteredStations = stations.filter((station) =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateStation = async (data: CreateChargingStationInput) => {
    await createMutation.mutateAsync(data);
    setIsFormOpen(false);
  };

  const handleUpdateStation = async (data: CreateChargingStationInput) => {
    if (editingStation) {
      await updateMutation.mutateAsync({ id: editingStation.id, ...data });
      setEditingStation(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteStation = async () => {
    if (deleteStationId) {
      await deleteMutation.mutateAsync(deleteStationId);
      setDeleteStationId(null);
    }
  };

  const handleEditStation = (station: ChargingStation) => {
    setEditingStation(station);
    setIsFormOpen(true);
  };

  const handleShowOnMap = (latitude: number, longitude: number) => {
    navigate(`/map?lat=${latitude}&lng=${longitude}`);
  };

  const activeStations = stations.filter((s) => s.status === "active").length;
  const totalPowerOutput = stations.reduce((sum, s) => sum + s.power_output, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                ChargePoint Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                {user?.email}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/map")}
              >
                <Map className="h-4 w-4 mr-2" />
                Map View
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Stations
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Stations
              </CardTitle>
              <Power className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {activeStations}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Power Output
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPowerOutput} kW</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Charging Stations
            </h2>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Station
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search stations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value === "all" ? undefined : (value as any),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Connector Type</Label>
              <Select
                value={filters.connector_type || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    connector_type:
                      value === "all" ? undefined : (value as any),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="type1">Type 1</SelectItem>
                  <SelectItem value="type2">Type 2</SelectItem>
                  <SelectItem value="ccs">CCS</SelectItem>
                  <SelectItem value="chademo">CHAdeMO</SelectItem>
                  <SelectItem value="tesla">Tesla</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-power">Min Power (kW)</Label>
              <Input
                id="min-power"
                type="number"
                placeholder="0"
                value={filters.power_output_min || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    power_output_min: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-power">Max Power (kW)</Label>
              <Input
                id="max-power"
                type="number"
                placeholder="1000"
                value={filters.power_output_max || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    power_output_max: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Stations Grid */}
        {filteredStations.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No charging stations found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.keys(filters).length > 0
                ? "Try adjusting your search or filters"
                : "Get started by adding your first charging station"}
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Station
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map((station) => (
              <ChargingStationCard
                key={station.id}
                station={station}
                onEdit={handleEditStation}
                onDelete={setDeleteStationId}
                onShowOnMap={handleShowOnMap}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <ChargingStationForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStation(null);
        }}
        onSubmit={editingStation ? handleUpdateStation : handleCreateStation}
        station={editingStation}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteStationId}
        onOpenChange={() => setDeleteStationId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Charging Station</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this charging station? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStation}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
