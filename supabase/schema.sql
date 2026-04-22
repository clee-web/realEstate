-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'agent', 'user')),
  is_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'KES',
  county TEXT NOT NULL,
  town TEXT NOT NULL,
  estate TEXT,
  property_type TEXT NOT NULL CHECK (property_type IN ('bedsitter', 'apartment', 'house', 'land', 'commercial', 'office', 'warehouse')),
  bedrooms INTEGER,
  bathrooms INTEGER,
  floor_area NUMERIC,
  land_size NUMERIC,
  latitude NUMERIC,
  longitude NUMERIC,
  contact_phone TEXT NOT NULL,
  contact_whatsapp TEXT,
  images TEXT[], -- Array of image URLs
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_boosted BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'rented', 'expired')),
  view_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inquiries table
CREATE TABLE public.inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Create indexes for better performance
CREATE INDEX idx_properties_user_id ON public.properties(user_id);
CREATE INDEX idx_properties_county ON public.properties(county);
CREATE INDEX idx_properties_town ON public.properties(town);
CREATE INDEX idx_properties_type ON public.properties(property_type);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_featured ON public.properties(is_featured);
CREATE INDEX idx_properties_created_at ON public.properties(created_at);
CREATE INDEX idx_inquiries_property_id ON public.inquiries(property_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Public properties are viewable by everyone"
  ON public.properties FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can view all properties"
  ON public.properties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can create any property"
  ON public.properties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Property owners can update their properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any property"
  ON public.properties FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Property owners can delete their properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any property"
  ON public.properties FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Inquiries policies
CREATE POLICY "Property owners can view inquiries"
  ON public.inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = inquiries.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

-- Reports policies
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Favorites policies
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-expire old listings (30 days by default)
CREATE OR REPLACE FUNCTION public.auto_expire_properties()
RETURNS void AS $$
BEGIN
  UPDATE public.properties
  SET status = 'expired'
  WHERE status = 'active'
  AND created_at < NOW() - INTERVAL '30 days'
  AND expires_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(property_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.properties
  SET view_count = view_count + 1
  WHERE id = property_id;
END;
$$ LANGUAGE plpgsql;
