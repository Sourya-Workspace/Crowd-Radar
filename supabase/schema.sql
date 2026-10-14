-- ==============================================================================
-- CrowdWise AI: PostgreSQL Database Schema & Row-Level-Security (RLS) Policies
-- Designed for Supabase / PostgreSQL 15+
-- ==============================================================================

-- 1. Profiles Table (Auth integration)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'tourist' CHECK (role IN ('tourist', 'authority', 'admin')),
  agency_department TEXT,
  badge_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Destinations Table
CREATE TABLE IF NOT EXISTS public.destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  region TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Temples & Religious',
    'Beaches',
    'Hill Stations',
    'Historical Monuments',
    'Nature & Wildlife',
    'Museums & Cultural'
  )),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  current_visitors INTEGER NOT NULL DEFAULT 0 CHECK (current_visitors >= 0),
  occupancy_percentage INTEGER GENERATED ALWAYS AS (
    LEAST(100, GREATEST(0, ROUND((current_visitors::numeric / capacity::numeric) * 100)))
  ) STORED,
  crowd_level TEXT NOT NULL CHECK (crowd_level IN ('low', 'moderate', 'high', 'very_high')),
  rating NUMERIC(2,1) DEFAULT 4.5,
  reviews_count INTEGER DEFAULT 0,
  wait_time_minutes INTEGER DEFAULT 15,
  nearest_parking_name TEXT,
  nearest_parking_available INTEGER DEFAULT 0,
  nearest_parking_capacity INTEGER DEFAULT 0,
  data_source TEXT DEFAULT 'Simulated Demo Feed',
  peak_hours TEXT,
  best_time_to_visit TEXT,
  entry_fee TEXT,
  opening_hours TEXT,
  is_alternative_to TEXT REFERENCES public.destinations(id) ON DELETE SET NULL,
  alternative_reason TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crowd Observations (Time-series log)
CREATE TABLE IF NOT EXISTS public.crowd_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id TEXT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  visitor_count INTEGER NOT NULL CHECK (visitor_count >= 0),
  occupancy_percentage INTEGER NOT NULL,
  crowd_level TEXT NOT NULL,
  data_source TEXT NOT NULL,
  sensor_id TEXT,
  confidence NUMERIC(3,2) DEFAULT 0.90,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Historical Visitors Table
CREATE TABLE IF NOT EXISTS public.historical_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id TEXT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  day_of_week TEXT NOT NULL,
  hour_of_day INTEGER NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
  visitor_count INTEGER NOT NULL,
  weather_condition TEXT,
  temperature_celsius NUMERIC(3,1),
  is_holiday BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Parking Facilities Table
CREATE TABLE IF NOT EXISTS public.parking_facilities (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  total_spaces INTEGER NOT NULL CHECK (total_spaces > 0),
  occupied_spaces INTEGER NOT NULL DEFAULT 0 CHECK (occupied_spaces >= 0),
  available_spaces INTEGER GENERATED ALWAYS AS (GREATEST(0, total_spaces - occupied_spaces)) STORED,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'limited', 'full')),
  hourly_rate TEXT,
  is_covered BOOLEAN DEFAULT FALSE,
  has_ev_charging BOOLEAN DEFAULT FALSE,
  walking_distance_minutes INTEGER DEFAULT 5,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Parking Observations Table
CREATE TABLE IF NOT EXISTS public.parking_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id TEXT NOT NULL REFERENCES public.parking_facilities(id) ON DELETE CASCADE,
  occupied_spaces INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Crowd Forecasts Table
CREATE TABLE IF NOT EXISTS public.crowd_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id TEXT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  forecast_target_time TIMESTAMPTZ NOT NULL,
  predicted_visitors INTEGER NOT NULL,
  predicted_occupancy INTEGER NOT NULL,
  predicted_crowd_level TEXT NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 0.92,
  model_name TEXT DEFAULT 'Diurnal-Baseline-MovingAverage',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  destination_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  occupancy_percentage INTEGER NOT NULL,
  recommended_action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved')),
  incident_notes TEXT,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Alert Updates Table (Audit trail)
CREATE TABLE IF NOT EXISTS public.alert_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id TEXT NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  change_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_categories TEXT[] DEFAULT '{}',
  max_distance_km INTEGER DEFAULT 50,
  max_acceptable_crowd TEXT DEFAULT 'high',
  family_friendly BOOLEAN DEFAULT TRUE,
  notify_crowd_alerts BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Indexes for High Performance Querying
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_destinations_category ON public.destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_city ON public.destinations(city);
CREATE INDEX IF NOT EXISTS idx_destinations_crowd_level ON public.destinations(crowd_level);
CREATE INDEX IF NOT EXISTS idx_crowd_obs_dest_time ON public.crowd_observations(destination_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_hist_visitors_dest ON public.historical_visitors(destination_id, day_of_week, hour_of_day);
CREATE INDEX IF NOT EXISTS idx_alerts_status_sev ON public.alerts(status, severity);

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Public Read Permissions
CREATE POLICY "Public Read Destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Public Read Observations" ON public.crowd_observations FOR SELECT USING (true);
CREATE POLICY "Public Read Historical" ON public.historical_visitors FOR SELECT USING (true);
CREATE POLICY "Public Read Parking" ON public.parking_facilities FOR SELECT USING (true);
CREATE POLICY "Public Read Forecasts" ON public.crowd_forecasts FOR SELECT USING (true);
CREATE POLICY "Public Read Alerts" ON public.alerts FOR SELECT USING (true);

-- Authority/Admin Only Update Permissions
CREATE POLICY "Authority Manage Alerts" ON public.alerts FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('authority', 'admin')));

CREATE POLICY "Authority Insert Alert Updates" ON public.alert_updates FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('authority', 'admin')));

CREATE POLICY "User Manage Own Preferences" ON public.user_preferences FOR ALL TO authenticated
USING (auth.uid() = user_id);
