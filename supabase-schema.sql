-- =============================================
-- BEERBACK · Supabase Database Schema
-- Version 1.0 · Mai 2026
-- =============================================
--
-- Ausführen in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
--
-- Reihenfolge: Erst Tabellen, dann Indizes, dann RLS-Policies
-- =============================================

-- =============================================
-- TABELLEN
-- =============================================

-- USERS (erweitert auth.users von Supabase)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudonym VARCHAR(50) NOT NULL UNIQUE,
  avatar_color VARCHAR(7) DEFAULT '#d4a017',
  birthdate DATE NOT NULL,
  age_verified BOOLEAN DEFAULT FALSE,
  agb_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,

  -- Hopfen-Konto
  current_hopfen INTEGER DEFAULT 0,
  total_hopfen_earned INTEGER DEFAULT 0,
  total_hopfen_spent INTEGER DEFAULT 0,

  -- Level
  level VARCHAR(30) DEFAULT 'Bier-Lehrling',

  -- Streak (App-Öffnung, NICHT Trinken)
  streak_days INTEGER DEFAULT 0,
  last_app_open DATE,

  -- Selbst-Pause (Schutzfunktion)
  paused_until DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT pseudonym_length CHECK (char_length(pseudonym) >= 3),
  CONSTRAINT age_check CHECK (birthdate <= CURRENT_DATE - INTERVAL '18 years')
);

-- BEER_STYLES (Lookup für Vielfalt-Tracking)
CREATE TABLE public.beer_styles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(30),
  description TEXT
);

-- Initial-Daten
INSERT INTO public.beer_styles (name, category) VALUES
  ('Pilsner', 'Lager'),
  ('Helles', 'Lager'),
  ('Dunkles', 'Lager'),
  ('Märzen', 'Lager'),
  ('Bockbier', 'Lager'),
  ('Weizen', 'Weißbier'),
  ('Hefeweizen', 'Weißbier'),
  ('Kristallweizen', 'Weißbier'),
  ('Dunkles Weizen', 'Weißbier'),
  ('Pale Ale', 'Ale'),
  ('IPA', 'Ale'),
  ('Double IPA', 'Ale'),
  ('NEIPA', 'Ale'),
  ('Stout', 'Ale'),
  ('Imperial Stout', 'Ale'),
  ('Porter', 'Ale'),
  ('Berliner Weisse', 'Sauerbier'),
  ('Gose', 'Sauerbier'),
  ('Lambic', 'Sauerbier'),
  ('Saison', 'Ale'),
  ('Trappist', 'Spezial'),
  ('Kölsch', 'Lager'),
  ('Altbier', 'Ale'),
  ('Rauchbier', 'Spezial'),
  ('Kellerbier', 'Lager'),
  ('Zwickelbier', 'Lager'),
  ('Schwarzbier', 'Lager'),
  ('Doppelbock', 'Lager'),
  ('Eisbock', 'Lager'),
  ('Maibock', 'Lager');

-- PARTNER_VENUES (Partner-Bars/Restaurants)
CREATE TABLE public.partner_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  address TEXT,
  city VARCHAR(50),
  country VARCHAR(50) DEFAULT 'Deutschland',
  owner_email VARCHAR(255),
  owner_user_id UUID REFERENCES public.profiles(id),

  -- GPS für Geofencing
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  geofence_radius_m INTEGER DEFAULT 75,

  -- Status
  active BOOLEAN DEFAULT TRUE,
  subscription_tier VARCHAR(20) DEFAULT 'pilot',  -- pilot, basic, premium
  subscription_until DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BEERS (jedes geloggte Bier eines Users)
CREATE TABLE public.beers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  name VARCHAR(150) NOT NULL,
  style_id INTEGER REFERENCES public.beer_styles(id),
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  note TEXT,
  photo_url TEXT,

  -- Location (entweder Partner-Bar ODER Freitext)
  partner_venue_id UUID REFERENCES public.partner_venues(id),
  location_freetext VARCHAR(150),
  city VARCHAR(50),
  country VARCHAR(50),

  -- GPS (nur wenn User Standort freigegeben)
  gps_lat DECIMAL(9, 6),
  gps_lng DECIMAL(9, 6),
  geo_verified BOOLEAN DEFAULT FALSE,  -- TRUE wenn im Partner-Geofence

  -- Hopfen die für dieses Bier vergeben wurden (für Audit)
  hopfen_earned INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DRINKS (Wasser-Logs für Pause-Belohnung)
CREATE TABLE public.drinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'water',  -- water, soft_drink, etc.
  partner_venue_id UUID REFERENCES public.partner_venues(id),
  hopfen_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACTIONS (Hopfen-Verlauf, alle Eingänge & Ausgaben)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  amount INTEGER NOT NULL,  -- positiv = Eingang, negativ = Ausgang
  source VARCHAR(30) NOT NULL,  -- beer_log, photo_bonus, geo_bonus, first_country, wheel, quiz, game, redemption, streak, pause_bonus, achievement
  description TEXT,

  -- Foreign Keys (optional, je nach Source)
  beer_id UUID REFERENCES public.beers(id) ON DELETE SET NULL,
  redemption_id UUID,
  quiz_session_id UUID,
  wheel_spin_id UUID,
  game_score_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DAILY_LIMITS (Tageslimits-Tracking, Schutzmechanismus)
CREATE TABLE public.daily_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  beers_logged INTEGER DEFAULT 0,
  beers_rewarded INTEGER DEFAULT 0,  -- max 3
  water_logged INTEGER DEFAULT 0,
  wheel_spun BOOLEAN DEFAULT FALSE,
  quiz_completed BOOLEAN DEFAULT FALSE,
  game_plays INTEGER DEFAULT 0,

  UNIQUE(user_id, date)
);

-- QUIZ_QUESTIONS (Wissens-Datenbank)
CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  explanation TEXT,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  category VARCHAR(30),  -- bierstil, hopfen, brauverfahren, geschichte, regional
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUIZ_SESSIONS (User-Quiz-Versuche)
CREATE TABLE public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  questions_count INTEGER DEFAULT 5,
  correct_count INTEGER DEFAULT 0,
  hopfen_earned INTEGER DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUIZ_ANSWERS (einzelne Antworten in Sessions)
CREATE TABLE public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id),
  user_answer CHAR(1),
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- WHEEL_SPINS (Glücksrad-Verlauf)
CREATE TABLE public.wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  base_amount INTEGER NOT NULL,  -- Grundgewinn (10, 25, 50, 100, 250, 500)
  multiplier DECIMAL(3, 1) DEFAULT 1.0,  -- Streak-Bonus
  final_amount INTEGER NOT NULL,
  spun_at TIMESTAMPTZ DEFAULT NOW()
);

-- GAME_SCORES (Bierglas-Master Highscores)
CREATE TABLE public.game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_type VARCHAR(30) DEFAULT 'bierglas',
  score INTEGER NOT NULL,
  hopfen_earned INTEGER DEFAULT 0,
  is_personal_best BOOLEAN DEFAULT FALSE,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- REWARDS (verfügbare Belohnungen im Marketplace)
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_venue_id UUID REFERENCES public.partner_venues(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  hopfen_cost INTEGER NOT NULL,
  category VARCHAR(30),  -- beer, food, experience, merch, shipping
  emoji VARCHAR(10),
  active BOOLEAN DEFAULT TRUE,
  stock INTEGER,  -- NULL = unbegrenzt
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REDEMPTIONS (eingelöste Belohnungen)
CREATE TABLE public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id),
  partner_venue_id UUID REFERENCES public.partner_venues(id),

  code VARCHAR(20) NOT NULL UNIQUE,
  hopfen_cost INTEGER NOT NULL,

  -- Lifecycle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,  -- 30 Min Standard
  redeemed_at TIMESTAMPTZ,
  redeemed_by_user_id UUID REFERENCES public.profiles(id),  -- Bar-Personal

  status VARCHAR(20) DEFAULT 'pending'  -- pending, redeemed, expired, cancelled
);

-- ACHIEVEMENTS (Reise-Erfolge, Sammler-Badges)
CREATE TABLE public.achievements (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  emoji VARCHAR(10),
  category VARCHAR(30),  -- travel, sortiment, social, milestone
  hopfen_reward INTEGER DEFAULT 0,
  requirement_type VARCHAR(50),  -- count_countries, count_cities, count_styles, etc.
  requirement_value INTEGER
);

-- Initial Achievements
INSERT INTO public.achievements (code, title, description, emoji, category, hopfen_reward, requirement_type, requirement_value) VALUES
  ('lokalpatriot', 'Lokalpatriot', '10 Biere im Heimatkreis', '🏠', 'travel', 200, 'count_local_beers', 10),
  ('stadt_erkunder', 'Stadt-Erkunder', '5 verschiedene Bars in einer Stadt', '🏙️', 'travel', 250, 'count_bars_one_city', 5),
  ('reise_trinker', 'Reise-Trinker', 'Biere in 5 verschiedenen Städten', '🚂', 'travel', 500, 'count_cities', 5),
  ('welten_bummler', 'Welten-Bummler', 'Biere in 3 Ländern', '✈️', 'travel', 1000, 'count_countries', 3),
  ('globaler_sucher', 'Globaler Hopfen-Sucher', 'Biere auf 3 Kontinenten', '🌍', 'travel', 2500, 'count_continents', 3),
  ('bier_atlas', 'Bier-Atlas', '50 verschiedene Städte', '📚', 'travel', 5000, 'count_cities', 50),
  ('pilsner_kenner', 'Pilsner-Kenner', '5 verschiedene Pilsner', '🌾', 'sortiment', 250, 'count_style_pilsner', 5),
  ('ipa_fan', 'IPA-Fan', '5 verschiedene IPAs', '🍺', 'sortiment', 250, 'count_style_ipa', 5),
  ('stout_lover', 'Stout-Lover', '5 verschiedene Stouts', '⚫', 'sortiment', 250, 'count_style_stout', 5),
  ('sortenkundiger', 'Sortenkundiger', '30 verschiedene Sorten', '🎓', 'milestone', 1000, 'count_unique_beers', 30),
  ('sommelier', 'Bier-Sommelier', '50 Sorten + 10 Stile', '🏆', 'milestone', 2500, 'count_sommelier', 1),
  ('braumeister', 'Braumeister', '100 Sorten + 20 Stile', '👑', 'milestone', 5000, 'count_braumeister', 1);

-- USER_ACHIEVEMENTS (welcher User welche Achievement freigeschaltet hat)
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES public.achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

-- =============================================
-- INDIZES für Performance
-- =============================================

CREATE INDEX idx_beers_user_id ON public.beers(user_id);
CREATE INDEX idx_beers_created_at ON public.beers(created_at DESC);
CREATE INDEX idx_beers_partner_venue ON public.beers(partner_venue_id);
CREATE INDEX idx_beers_country ON public.beers(country);
CREATE INDEX idx_beers_city ON public.beers(city);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

CREATE INDEX idx_daily_limits_user_date ON public.daily_limits(user_id, date);

CREATE INDEX idx_redemptions_user_id ON public.redemptions(user_id);
CREATE INDEX idx_redemptions_code ON public.redemptions(code);
CREATE INDEX idx_redemptions_status ON public.redemptions(status);

CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles sind für Owner sichtbar" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles können vom Owner editiert werden" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles können angelegt werden" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Beers
ALTER TABLE public.beers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Beers sind für Owner sichtbar" ON public.beers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Beers können vom Owner angelegt werden" ON public.beers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Beers können vom Owner editiert werden" ON public.beers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Beers können vom Owner gelöscht werden" ON public.beers
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions (read-only für User)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transactions sind für Owner sichtbar" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Daily Limits
ALTER TABLE public.daily_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily Limits Owner-Sicht" ON public.daily_limits
  FOR ALL USING (auth.uid() = user_id);

-- Quiz Sessions / Wheel Spins / Game Scores
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quiz Sessions Owner" ON public.quiz_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Wheel Spins Owner" ON public.wheel_spins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Game Scores Owner" ON public.game_scores FOR ALL USING (auth.uid() = user_id);

-- Public-Lesbar
ALTER TABLE public.beer_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Beer Styles public" ON public.beer_styles FOR SELECT USING (true);
CREATE POLICY "Active Partner Venues public" ON public.partner_venues FOR SELECT USING (active = true);
CREATE POLICY "Active Rewards public" ON public.rewards FOR SELECT USING (active = true);
CREATE POLICY "Achievements public" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Active Quiz Questions public" ON public.quiz_questions FOR SELECT USING (active = true);

-- User Achievements (eigene sichtbar)
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User Achievements Owner" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);

-- Redemptions (eigene sichtbar, Bars dürfen einlösen)
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Redemptions Owner-Lesen" ON public.redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Redemptions Owner-Anlegen" ON public.redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- STORAGE BUCKETS (in Supabase Dashboard manuell anlegen)
-- =============================================
--
-- Bucket: "beer-photos" (public)
--   Erlaubte MIME: image/jpeg, image/png, image/webp
--   Max Size: 5MB
--   Policy: User darf nur in seinen Ordner uploaden (user_id/bilder.jpg)
--
-- =============================================
-- HILFREICHE FUNKTIONEN
-- =============================================

-- Aktualisiert updated_at automatisch
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_partner_venues_updated
  BEFORE UPDATE ON public.partner_venues
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Hopfen-Saldo nach Transaction aktualisieren
CREATE OR REPLACE FUNCTION public.update_hopfen_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.amount > 0 THEN
    UPDATE public.profiles
    SET current_hopfen = current_hopfen + NEW.amount,
        total_hopfen_earned = total_hopfen_earned + NEW.amount
    WHERE id = NEW.user_id;
  ELSE
    UPDATE public.profiles
    SET current_hopfen = current_hopfen + NEW.amount,
        total_hopfen_spent = total_hopfen_spent + ABS(NEW.amount)
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_transaction_created
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_hopfen_balance();

-- =============================================
-- FERTIG! Nächste Schritte:
-- =============================================
--
-- 1. Storage Bucket "beer-photos" im Dashboard anlegen
-- 2. Auth-Anbieter aktivieren (Email Magic Link)
-- 3. Erste Test-Daten einfügen (Faustfood als Partner-Venue)
-- 4. Quiz-Fragen importieren (separater CSV-Import)
--
-- =============================================
