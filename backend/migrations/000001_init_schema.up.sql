-- Schema Init PORPROV XIII Kalimantan Tengah 2026

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Kontingen (13 Kabupaten + 1 Kota)
CREATE TABLE IF NOT EXISTS contingents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Master Cabang Olahraga
DO $$ BEGIN
    CREATE TYPE sport_category_enum AS ENUM ('Utama', 'Eksebisi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) UNIQUE NOT NULL,
    category sport_category_enum NOT NULL DEFAULT 'Utama',
    icon_symbol VARCHAR(10),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nomor Pertandingan
CREATE TABLE IF NOT EXISTS sport_events (
    id SERIAL PRIMARY KEY,
    sport_id INT NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Men', 'Women', 'Mixed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Master Venue
CREATE TABLE IF NOT EXISTS venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    address TEXT,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Master Atlet & Official
CREATE TABLE IF NOT EXISTS athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contingent_id INT NOT NULL REFERENCES contingents(id),
    sport_id INT NOT NULL REFERENCES sports(id),
    nik VARCHAR(16) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    birth_date DATE,
    gender VARCHAR(1) CHECK (gender IN ('M', 'F')),
    photo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Jadwal & Pertandingan
DO $$ BEGIN
    CREATE TYPE match_status_enum AS ENUM ('SCHEDULED', 'ONGOING', 'FINISHED', 'POSTPONED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id INT NOT NULL REFERENCES sport_events(id),
    venue_id INT NOT NULL REFERENCES venues(id),
    title VARCHAR(200) NOT NULL,
    round_name VARCHAR(50),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status match_status_enum DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_participants (
    id SERIAL PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    contingent_id INT NOT NULL REFERENCES contingents(id),
    athlete_id UUID REFERENCES athletes(id),
    score VARCHAR(50),
    is_winner BOOLEAN DEFAULT FALSE
);

-- 6. Medali
DO $$ BEGIN
    CREATE TYPE medal_type_enum AS ENUM ('GOLD', 'SILVER', 'BRONZE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS medals (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL REFERENCES sport_events(id),
    contingent_id INT NOT NULL REFERENCES contingents(id),
    athlete_id UUID REFERENCES athletes(id),
    medal_type medal_type_enum NOT NULL,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_event_medal UNIQUE (event_id, medal_type)
);

-- 7. View Klasemen Medali Realtime
CREATE OR REPLACE VIEW v_medal_standings AS
SELECT 
    c.id AS contingent_id,
    c.name AS contingent_name,
    c.short_code,
    c.logo_url,
    COUNT(m.id) FILTER (WHERE m.medal_type = 'GOLD') AS gold,
    COUNT(m.id) FILTER (WHERE m.medal_type = 'SILVER') AS silver,
    COUNT(m.id) FILTER (WHERE m.medal_type = 'BRONZE') AS bronze,
    COUNT(m.id) AS total_medals
FROM contingents c
LEFT JOIN medals m ON c.id = m.contingent_id
GROUP BY c.id, c.name, c.short_code, c.logo_url
ORDER BY gold DESC, silver DESC, bronze DESC, total_medals DESC;
