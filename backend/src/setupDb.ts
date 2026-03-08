// setupDb.ts — creates all our tables in Supabase
// We run this ONCE to set up the database structure
// This replaces what Prisma's migration would have done

import pool from "./db";

const setupDatabase = async () => {
  try {
    console.log("🔧 Setting up database tables...");

    // We use a "transaction" — either ALL tables are created or NONE
    // This prevents partial setups if something goes wrong midway
    await pool.query(`

      -- ENUMS (fixed value lists)
      -- PostgreSQL supports custom types called enums
      
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('USER', 'PROVIDER', 'ADMIN');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      DO $$ BEGIN
        CREATE TYPE slot_status AS ENUM ('AVAILABLE', 'BOOKED', 'BLOCKED');
        EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;

      -- USERS TABLE
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email       VARCHAR(255) UNIQUE NOT NULL,
        password    VARCHAR(255) NOT NULL,
        first_name  VARCHAR(100) NOT NULL,
        last_name   VARCHAR(100) NOT NULL,
        phone       VARCHAR(20),
        role        user_role DEFAULT 'USER',
        is_active   BOOLEAN DEFAULT true,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      );

      -- PROVIDER PROFILES TABLE
      CREATE TABLE IF NOT EXISTS provider_profiles (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        description   TEXT,
        address       VARCHAR(255),
        city          VARCHAR(100),
        wilaya        VARCHAR(100),
        category      VARCHAR(100),
        is_verified   BOOLEAN DEFAULT false,
        avg_rating    FLOAT,
        total_reviews INT DEFAULT 0,
        created_at    TIMESTAMP DEFAULT NOW(),
        updated_at    TIMESTAMP DEFAULT NOW()
      );

      -- SERVICES TABLE
      CREATE TABLE IF NOT EXISTS services (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
        name        VARCHAR(255) NOT NULL,
        description TEXT,
        duration    INT NOT NULL,
        price       FLOAT,
        is_active   BOOLEAN DEFAULT true,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      );

      -- TIME SLOTS TABLE
      CREATE TABLE IF NOT EXISTS time_slots (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
        start_time  TIMESTAMP NOT NULL,
        end_time    TIMESTAMP NOT NULL,
        status      slot_status DEFAULT 'AVAILABLE',
        capacity    INT DEFAULT 1,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      );

      -- APPOINTMENTS TABLE
      -- timeSlotId is UNIQUE — this prevents double booking at database level!
      CREATE TABLE IF NOT EXISTS appointments (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        service_id   UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        time_slot_id UUID UNIQUE NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
        status       appointment_status DEFAULT 'PENDING',
        notes        TEXT,
        rating       INT CHECK (rating >= 1 AND rating <= 5),
        review       TEXT,
        created_at   TIMESTAMP DEFAULT NOW(),
        updated_at   TIMESTAMP DEFAULT NOW()
      );

      -- NOTIFICATIONS TABLE
      CREATE TABLE IF NOT EXISTS notifications (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type       VARCHAR(50) NOT NULL,
        title      VARCHAR(255) NOT NULL,
        message    TEXT NOT NULL,
        is_read    BOOLEAN DEFAULT false,
        sent_at    TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

    `);

    console.log("✅ All tables created successfully!");
    process.exit(0); // exit after setup is done

  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
};

setupDatabase();