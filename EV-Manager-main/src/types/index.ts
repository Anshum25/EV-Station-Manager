export interface ChargingStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: "active" | "inactive";
  power_output: number;
  connector_type: "type1" | "type2" | "ccs" | "chademo" | "tesla";
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreateChargingStationInput {
  name: string;
  latitude: number;
  longitude: number;
  status: "active" | "inactive";
  power_output: number;
  connector_type: "type1" | "type2" | "ccs" | "chademo" | "tesla";
}

export interface UpdateChargingStationInput
  extends Partial<CreateChargingStationInput> {
  id: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface ChargingStationFilters {
  status?: "active" | "inactive" | "all";
  connector_type?: "type1" | "type2" | "ccs" | "chademo" | "tesla" | "all";
  power_output_min?: number;
  power_output_max?: number;
}
