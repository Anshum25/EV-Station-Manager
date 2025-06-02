-- Enable RLS (Row Level Security)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create charging_stations table
CREATE TABLE IF NOT EXISTS public.charging_stations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive')) NOT NULL DEFAULT 'active',
    power_output INTEGER NOT NULL CHECK (power_output > 0),
    connector_type TEXT CHECK (connector_type IN ('type1', 'type2', 'ccs', 'chademo', 'tesla')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_charging_stations_user_id ON public.charging_stations(user_id);
CREATE INDEX IF NOT EXISTS idx_charging_stations_status ON public.charging_stations(status);
CREATE INDEX IF NOT EXISTS idx_charging_stations_location ON public.charging_stations(latitude, longitude);

-- Enable RLS on charging_stations table
ALTER TABLE public.charging_stations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own charging stations
CREATE POLICY "Users can view own charging stations" ON public.charging_stations
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own charging stations
CREATE POLICY "Users can insert own charging stations" ON public.charging_stations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own charging stations
CREATE POLICY "Users can update own charging stations" ON public.charging_stations
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own charging stations
CREATE POLICY "Users can delete own charging stations" ON public.charging_stations
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_charging_stations_updated_at ON public.charging_stations;
CREATE TRIGGER trigger_charging_stations_updated_at
    BEFORE UPDATE ON public.charging_stations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
