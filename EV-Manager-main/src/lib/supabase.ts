import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

const supabaseUrl = "https://xlqdqwjzrzzydldydsdo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhscWRxd2p6cnp6eWRsZHlkc2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4Nzc2ODMsImV4cCI6MjA2NDQ1MzY4M30.Of10MSddqMLlM0UqeeIuxkN4IRAes6o-wNs0Q64oXvc";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
