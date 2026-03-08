// providerController.ts — handles everything related to browsing providers
import { Request, Response } from "express";
import pool from "../db";

// ============================================================
// GET ALL PROVIDERS
// GET /api/providers
// Public — no token needed
// Supports search + filter by city and category
// ============================================================
export const getProviders = async (req: Request, res: Response) => {
  try {
    // Query parameters for filtering
    // Example: /api/providers?city=Alger&category=Medical&search=clinic
    const { city, category, search } = req.query;

    // We build the query dynamically based on filters
    // $1, $2... are placeholders — values are passed separately
    // This prevents SQL injection
    let query = `
      SELECT 
        pp.id,
        pp.business_name,
        pp.description,
        pp.address,
        pp.city,
        pp.wilaya,
        pp.category,
        pp.avg_rating,
        pp.total_reviews,
        u.first_name,
        u.last_name
      FROM provider_profiles pp
      JOIN users u ON pp.user_id = u.id
      WHERE pp.is_verified = true
      AND u.is_active = true
    `;

    // Values array — matches the $1, $2 placeholders
    const values: any[] = [];
    let paramCount = 1;

    // Dynamically add filters if they exist
    if (city) {
      query += ` AND LOWER(pp.city) = LOWER($${paramCount})`;
      values.push(city);
      paramCount++;
    }

    if (category) {
      query += ` AND LOWER(pp.category) = LOWER($${paramCount})`;
      values.push(category);
      paramCount++;
    }

    if (search) {
      // ILIKE = case-insensitive LIKE in PostgreSQL
      // % means "anything before or after"
      query += ` AND (
        pp.business_name ILIKE $${paramCount} OR
        pp.description ILIKE $${paramCount} OR
        pp.category ILIKE $${paramCount}
      )`;
      values.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY pp.avg_rating DESC NULLS LAST`;

    const result = await pool.query(query, values);

    res.json({
      count: result.rows.length,
      providers: result.rows,
    });
  } catch (error) {
    console.error("getProviders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// GET SINGLE PROVIDER WITH SERVICES
// GET /api/providers/:id
// ============================================================
export const getProviderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Get provider details
    const providerResult = await pool.query(
      `SELECT 
        pp.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
       FROM provider_profiles pp
       JOIN users u ON pp.user_id = u.id
       WHERE pp.id = $1 AND pp.is_verified = true`,
      [id]
    );

    if (providerResult.rows.length === 0) {
      res.status(404).json({ message: "Provider not found" });
      return;
    }

    // Get this provider's services
    const servicesResult = await pool.query(
      `SELECT id, name, description, duration, price
       FROM services
       WHERE provider_id = $1 AND is_active = true
       ORDER BY name`,
      [id]
    );

    // Combine provider + services into one response
    const provider = {
      ...providerResult.rows[0],
      services: servicesResult.rows,
    };

    res.json({ provider });
  } catch (error) {
    console.error("getProviderById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// GET AVAILABLE TIME SLOTS FOR A PROVIDER
// GET /api/providers/:id/slots?date=2026-02-20
// ============================================================
export const getProviderSlots = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date } = req.query;

  try {
    let query = `
      SELECT 
        id,
        start_time,
        end_time,
        status,
        capacity
      FROM time_slots
      WHERE provider_id = $1
      AND status = 'AVAILABLE'
      AND start_time > NOW()
    `;

    const values: any[] = [id];

    // If date filter provided, show only slots for that day
    if (date) {
      query += ` AND DATE(start_time) = $2`;
      values.push(date);
    }

    query += ` ORDER BY start_time ASC`;

    const result = await pool.query(query, values);

    res.json({
      count: result.rows.length,
      slots: result.rows,
    });
  } catch (error) {
    console.error("getProviderSlots error:", error);
    res.status(500).json({ message: "Server error" });
  }
};