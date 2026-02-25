-- ============================================================
-- CrickForm SaaS Platform - Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (Extends Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'CREATOR' CHECK (role IN ('CREATOR', 'SUPER_ADMIN')),
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TOURNAMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  season TEXT,
  description TEXT,
  registration_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  last_date DATE NOT NULL,
  banner_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournaments_user_id ON tournaments(user_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_slug ON tournaments(slug);

-- ============================================================
-- PLAYERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Personal Details
  name TEXT NOT NULL,
  father_name TEXT,
  category TEXT,
  age INTEGER,
  dob DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  occupation TEXT,

  -- Contact
  mobile TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,

  -- Identity
  aadhaar TEXT,
  district TEXT,
  pin TEXT,
  address TEXT,
  social_link TEXT,

  -- Cricket Info
  tshirt_size TEXT CHECK (tshirt_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL')),
  first_preference TEXT,
  batting_arm TEXT CHECK (batting_arm IN ('Right', 'Left')),
  player_role TEXT CHECK (player_role IN ('Batsman', 'Bowler', 'All Rounder', 'Wicket Keeper')),

  -- Upload
  image_url TEXT,

  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FREE')),
  payment_id TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate registration (same mobile per tournament)
  UNIQUE(tournament_id, mobile)
);

CREATE INDEX IF NOT EXISTS idx_players_tournament_id ON players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_players_creator_id ON players(creator_id);
CREATE INDEX IF NOT EXISTS idx_players_payment_status ON players(payment_status);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  platform_commission NUMERIC(10, 2) DEFAULT 0,
  creator_earning NUMERIC(10, 2),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_tournament_id ON payments(tournament_id);
CREATE INDEX IF NOT EXISTS idx_payments_player_id ON payments(player_id);
CREATE INDEX IF NOT EXISTS idx_payments_creator_id ON payments(creator_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT := 'CREATOR';
BEGIN
  -- Assign SUPER_ADMIN role if email matches the hardcoded owner email
  IF NEW.email = 'hashimoffl1@gmail.com' THEN
    user_role := 'SUPER_ADMIN';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    user_role
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---- PROFILES POLICIES ----
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR get_user_role() = 'SUPER_ADMIN');

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid() OR get_user_role() = 'SUPER_ADMIN');

CREATE POLICY "Super admin can view all profiles"
  ON profiles FOR SELECT
  USING (get_user_role() = 'SUPER_ADMIN');

-- ---- TOURNAMENTS POLICIES ----
CREATE POLICY "Creators can manage their own tournaments"
  ON tournaments FOR ALL
  USING (user_id = auth.uid() OR get_user_role() = 'SUPER_ADMIN');

CREATE POLICY "Public can view active tournaments"
  ON tournaments FOR SELECT
  USING (is_active = TRUE);

-- ---- PLAYERS POLICIES ----
CREATE POLICY "Creators can view their own players"
  ON players FOR SELECT
  USING (creator_id = auth.uid() OR get_user_role() = 'SUPER_ADMIN');

CREATE POLICY "Creators can delete unpaid players"
  ON players FOR DELETE
  USING ((creator_id = auth.uid() AND payment_status = 'PENDING') OR get_user_role() = 'SUPER_ADMIN');

-- Public registration: allow INSERT (via service role in API)
CREATE POLICY "Service role can insert players"
  ON players FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Service role can update players"
  ON players FOR UPDATE
  USING (TRUE);

-- ---- PAYMENTS POLICIES ----
CREATE POLICY "Creators can view their own payments"
  ON payments FOR SELECT
  USING (creator_id = auth.uid() OR get_user_role() = 'SUPER_ADMIN');

CREATE POLICY "Service role can manage payments"
  ON payments FOR ALL
  USING (TRUE);

-- ============================================================
-- STORAGE
-- ============================================================
-- Run these via Supabase Dashboard → Storage → Policies
-- 1. Create a bucket called "player-images" with public = true
-- 2. Create a bucket called "tournament-banners" with public = true

-- ============================================================
-- MANUAL SUPER ADMIN SETUP
-- After running this schema:
-- 1. Create the super admin user in Supabase Auth Dashboard
--    using email: hashimoffl1@gmail.com
-- 2. The trigger will auto-assign SUPER_ADMIN role
-- 3. To manually set (if trigger doesn't run):
--    UPDATE profiles SET role = 'SUPER_ADMIN' WHERE email = 'hashimoffl1@gmail.com';
-- ============================================================
