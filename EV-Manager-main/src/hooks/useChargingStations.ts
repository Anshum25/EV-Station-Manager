import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  ChargingStation,
  CreateChargingStationInput,
  UpdateChargingStationInput,
  ChargingStationFilters,
} from "@/types";
import { toast } from "sonner";

export const useChargingStations = (filters?: ChargingStationFilters) => {
  return useQuery({
    queryKey: ["charging-stations", filters],
    queryFn: async () => {
      let query = supabase
        .from("charging_stations")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters?.connector_type && filters.connector_type !== "all") {
        query = query.eq("connector_type", filters.connector_type);
      }

      if (filters?.power_output_min) {
        query = query.gte("power_output", filters.power_output_min);
      }

      if (filters?.power_output_max) {
        query = query.lte("power_output", filters.power_output_max);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as ChargingStation[];
    },
  });
};

export const useChargingStation = (id: string) => {
  return useQuery({
    queryKey: ["charging-station", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("charging_stations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return data as ChargingStation;
    },
    enabled: !!id,
  });
};

export const useCreateChargingStation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateChargingStationInput) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("charging_stations")
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as ChargingStation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charging-stations"] });
      toast.success("Charging station created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create charging station");
    },
  });
};

export const useUpdateChargingStation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateChargingStationInput) => {
      const { data, error } = await supabase
        .from("charging_stations")
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as ChargingStation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charging-stations"] });
      toast.success("Charging station updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update charging station");
    },
  });
};

export const useDeleteChargingStation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("charging_stations")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charging-stations"] });
      toast.success("Charging station deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete charging station");
    },
  });
};
