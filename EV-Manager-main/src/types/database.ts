export interface Database {
  public: {
    Tables: {
      charging_stations: {
        Row: {
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
        };
        Insert: {
          id?: string;
          name: string;
          latitude: number;
          longitude: number;
          status: "active" | "inactive";
          power_output: number;
          connector_type: "type1" | "type2" | "ccs" | "chademo" | "tesla";
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          latitude?: number;
          longitude?: number;
          status?: "active" | "inactive";
          power_output?: number;
          connector_type?: "type1" | "type2" | "ccs" | "chademo" | "tesla";
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
    };
  };
}
