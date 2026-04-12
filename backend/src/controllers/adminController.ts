import { Response } from "express";
import pool from "../db";
import { AuthRequest } from "../types";

export const getPlatformStats = async (req: AuthRequest, res: Response) => {
  try {
    const [uAll, pAll, pVerified, pUnverified, aAll, aToday, aMonth, revCompleted] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'USER'`),
      pool.query(`SELECT COUNT(*) FROM provider_profiles`),
      pool.query(`SELECT COUNT(*) FROM provider_profiles WHERE is_verified = true`),
      pool.query(`SELECT COUNT(*) FROM provider_profiles WHERE is_verified = false`),
      pool.query(`SELECT COUNT(*) FROM appointments`),
      pool.query(`SELECT COUNT(*) FROM appointments WHERE DATE(created_at) = CURRENT_DATE`),
      pool.query(`SELECT COUNT(*) FROM appointments WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)`),
      pool.query(`
        SELECT SUM(s.price) 
        FROM appointments a 
        JOIN services s ON a.service_id = s.id 
        WHERE a.status = 'COMPLETED'
      `)
    ]);

    return res.status(200).json({
      data: {
        users: parseInt(uAll.rows[0].count),
        providers: parseInt(pAll.rows[0].count),
        verifiedProviders: parseInt(pVerified.rows[0].count),
        unverifiedProviders: parseInt(pUnverified.rows[0].count),
        totalAppointments: parseInt(aAll.rows[0].count),
        appointmentsToday: parseInt(aToday.rows[0].count),
        appointmentsThisMonth: parseInt(aMonth.rows[0].count),
        totalRevenue: parseFloat(revCompleted.rows[0].sum || '0')
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const isActive = req.query.isActive as string;

    let whereClauses = [];
    let values = [];
    let i = 1;

    if (search) {
      whereClauses.push(`(email ILIKE $${i} OR first_name ILIKE $${i} OR last_name ILIKE $${i})`);
      values.push(`%${search}%`);
      i++;
    }
    if (role) {
      whereClauses.push(`role = $${i++}`);
      values.push(role);
    }
    if (isActive !== undefined) {
      whereClauses.push(`is_active = $${i++}`);
      values.push(isActive === 'true');
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const offset = (page - 1) * 20;

    const countQuery = await pool.query(`SELECT COUNT(*) FROM users ${whereString}`, values);
    const totalCount = parseInt(countQuery.rows[0].count);

    const usersQuery = await pool.query(`
      SELECT id, email, first_name, last_name, phone, role, is_active, created_at 
      FROM users ${whereString} 
      ORDER BY created_at DESC 
      LIMIT 20 OFFSET ${offset}
    `, values);

    return res.status(200).json({
      data: {
        users: usersQuery.rows,
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / 20)
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;

    if (req.user?.id === userId) {
      return res.status(400).json({ message: "Cannot deactivate yourself" });
    }

    const result = await pool.query(
      `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [isActive, userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "User status updated", data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllProviders = async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string; // pending|verified|suspended

    let whereClause = "";
    if (status === 'pending') {
      whereClause = "WHERE pp.is_verified = false AND u.is_active = true";
    } else if (status === 'verified') {
      whereClause = "WHERE pp.is_verified = true AND u.is_active = true";
    } else if (status === 'suspended') {
      whereClause = "WHERE u.is_active = false";
    }

    const query = `
      SELECT pp.*, u.first_name, u.last_name, u.email, u.phone, u.is_active
      FROM provider_profiles pp 
      JOIN users u ON pp.user_id = u.id
      ${whereClause}
      ORDER BY pp.created_at DESC
    `;

    const result = await pool.query(query);
    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyProvider = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.params.id;

    await pool.query("BEGIN");
    
    const result = await pool.query(
      `UPDATE provider_profiles SET is_verified = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [providerId]
    );

    if (result.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "Provider not found" });
    }

    const userId = result.rows[0].user_id;
    await pool.query(`UPDATE users SET is_active = true WHERE id = $1`, [userId]);

    await pool.query("COMMIT");
    return res.status(200).json({ message: "Provider verified", data: result.rows[0] });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const suspendProvider = async (req: AuthRequest, res: Response) => {
  try {
    const providerId = req.params.id;

    await pool.query("BEGIN");

    const result = await pool.query(
      `UPDATE provider_profiles SET is_verified = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [providerId]
    );

    if (result.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "Provider not found" });
    }

    const userId = result.rows[0].user_id;
    await pool.query(`UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1`, [userId]);

    await pool.query("COMMIT");
    return res.status(200).json({ message: "Provider suspended", data: result.rows[0] });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const status = req.query.status as string;

    let whereClause = "";
    let values: any[] = [];
    if (status) {
      whereClause = "WHERE a.status = $1";
      values.push(status);
    }

    const offset = (page - 1) * 20;

    const countQuery = await pool.query(`SELECT COUNT(*) FROM appointments a ${whereClause}`, values);
    const totalCount = parseInt(countQuery.rows[0].count);

    const dataQuery = await pool.query(`
      SELECT a.*, u.first_name, u.last_name, u.email,
        s.name as service_name, pp.business_name,
        ts.start_time, ts.end_time
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN services s ON a.service_id = s.id
      JOIN time_slots ts ON a.time_slot_id = ts.id
      JOIN provider_profiles pp ON ts.provider_id = pp.id
      ${whereClause}
      ORDER BY ts.start_time DESC
      LIMIT 20 OFFSET ${offset}
    `, values);

    return res.status(200).json({
      data: {
        bookings: dataQuery.rows,
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / 20)
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPlatformAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const [q1, q2, q3, q4, q5] = await Promise.all([
      pool.query(`
        SELECT DATE(ts.start_time) as date, COUNT(*) as count
        FROM appointments a
        JOIN time_slots ts ON a.time_slot_id = ts.id
        WHERE ts.start_time >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(ts.start_time) ORDER BY date ASC
      `),
      pool.query(`
        SELECT pp.category, COUNT(*) as count
        FROM appointments a
        JOIN time_slots ts ON a.time_slot_id = ts.id
        JOIN provider_profiles pp ON ts.provider_id = pp.id
        GROUP BY pp.category
      `),
      pool.query(`
        SELECT TO_CHAR(created_at, 'Mon YYYY') as month,
               COUNT(*) as count
        FROM users WHERE role = 'USER'
        AND created_at >= NOW() - INTERVAL '6 months'
        GROUP BY month, DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      `),
      pool.query(`SELECT status, COUNT(*) as count FROM appointments GROUP BY status`),
      pool.query(`
        SELECT pp.business_name, COUNT(*) as bookings,
               SUM(s.price) as revenue
        FROM appointments a
        JOIN time_slots ts ON a.time_slot_id = ts.id
        JOIN provider_profiles pp ON ts.provider_id = pp.id
        JOIN services s ON a.service_id = s.id
        WHERE a.status = 'COMPLETED'
        GROUP BY pp.business_name
        ORDER BY bookings DESC LIMIT 10
      `)
    ]);

    return res.status(200).json({
      data: {
        bookingsPerDay: q1.rows,
        bookingsByCategory: q2.rows,
        userGrowth: q3.rows,
        statusDistribution: q4.rows,
        topProviders: q5.rows
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
