// db.ts — manages our connection to PostgreSQL
// We create ONE pool and reuse it everywhere
// A "pool" is a collection of database connections
// Instead of opening/closing a connection for every request (slow),
// a pool keeps connections open and reuses them (fast)

import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Create the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // Supabase requires SSL — this encrypts the connection
    // rejectUnauthorized: false means we accept Supabase's certificate
    rejectUnauthorized: false,
  },
});

// Test the connection when the server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected successfully!");
    release(); // release the client back to the pool
  }
});

// Export the pool so other files can use it
// Usage in other files: import pool from "./db"
export default pool;