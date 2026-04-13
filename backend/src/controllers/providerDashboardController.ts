import { Response } from "express";
import pool from "../db";
import { AuthRequest } from "../types";
import { createNotification } from "./notificationController";

// getMyProfile
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM provider_profiles WHERE user_id = $1`,
      [req.user?.id]
    );
    if (result.rows.length === 0) {
      // Auto-recover for existing accounts that don't have a profile yet
      const createRes = await pool.query(
        `INSERT INTO provider_profiles (user_id, business_name, description, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
        [req.user?.id, "My Business", ""]
      );
      return res.status(200).json({ data: createRes.rows[0] });
    }
    return res.status(200).json({ data: result.rows[0] });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// updateMyProfile
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { businessName, description, address, city, wilaya, category, phone, email } = req.body;
    
    await pool.query("BEGIN");
    
    if (phone || email) {
      const userUpdates = [];
      const userValues = [];
      let userIndex = 1;
      if (phone) {
        userUpdates.push(`phone = $${userIndex++}`);
        userValues.push(phone);
      }
      if (email) {
        userUpdates.push(`email = $${userIndex++}`);
        userValues.push(email);
      }
      if (userUpdates.length > 0) {
        userValues.push(req.user?.id);
        await pool.query(`UPDATE users SET ${userUpdates.join(", ")} WHERE id = $${userIndex}`, userValues);
      }
    }

    const providerUpdates = [];
    const providerValues = [];
    let pIndex = 1;

    if (businessName !== undefined) { providerUpdates.push(`business_name = $${pIndex++}`); providerValues.push(businessName); }
    if (description !== undefined) { providerUpdates.push(`description = $${pIndex++}`); providerValues.push(description); }
    if (address !== undefined) { providerUpdates.push(`address = $${pIndex++}`); providerValues.push(address); }
    if (city !== undefined) { providerUpdates.push(`city = $${pIndex++}`); providerValues.push(city); }
    if (wilaya !== undefined) { providerUpdates.push(`wilaya = $${pIndex++}`); providerValues.push(wilaya); }
    if (category !== undefined) { providerUpdates.push(`category = $${pIndex++}`); providerValues.push(category); }

    let profileResult: any;
    if (providerUpdates.length > 0) {
      providerUpdates.push(`updated_at = NOW()`);
      providerValues.push(req.user?.id);
      profileResult = await pool.query(
        `UPDATE provider_profiles SET ${providerUpdates.join(", ")} WHERE user_id = $${pIndex} RETURNING *`,
        providerValues
      );
    } else {
      profileResult = await pool.query(`SELECT * FROM provider_profiles WHERE user_id = $1`, [req.user?.id]);
    }

    await pool.query("COMMIT");
    return res.status(200).json({ message: "Profile updated", data: profileResult.rows[0] });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    await pool.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// getMyBookings
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id, a.status, a.notes, a.created_at,
        u.first_name, u.last_name, u.phone AS user_phone,
        s.name AS service_name, s.duration, s.price,
        ts.start_time, ts.end_time
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN services s ON a.service_id = s.id
      JOIN time_slots ts ON a.time_slot_id = ts.id
      JOIN provider_profiles pp ON ts.provider_id = pp.id
      WHERE pp.user_id = $1
      ORDER BY ts.start_time DESC
    `, [req.user?.id]);
    return res.status(200).json({ data: result.rows });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// updateBookingStatus
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const appointmentId = req.params.id;
    const { status } = req.body; 

    const apptCheck = await pool.query(`
      SELECT a.id, a.status, a.time_slot_id, a.user_id
      FROM appointments a
      JOIN time_slots ts ON a.time_slot_id = ts.id
      JOIN provider_profiles pp ON ts.provider_id = pp.id
      WHERE a.id = $1 AND pp.user_id = $2
    `, [appointmentId, req.user?.id]);

    if (apptCheck.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const currentStatus = apptCheck.rows[0].status;
    const timeSlotId = apptCheck.rows[0].time_slot_id;

    const isValidTransition = 
      (currentStatus === 'PENDING' && (status === 'CONFIRMED' || status === 'CANCELLED')) ||
      (currentStatus === 'CONFIRMED' && (status === 'COMPLETED' || status === 'CANCELLED'));

    if (!isValidTransition) {
      return res.status(400).json({ message: `Invalid status transition from ${currentStatus} to ${status}` });
    }

    await pool.query("BEGIN");
    
    const result = await pool.query(
      `UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, appointmentId]
    );

    if (status === 'CANCELLED') {
      await pool.query(`UPDATE time_slots SET status = 'AVAILABLE', updated_at = NOW() WHERE id = $1`, [timeSlotId]);
    } else if (status === 'CONFIRMED') {
      await pool.query(`UPDATE time_slots SET status = 'BOOKED', updated_at = NOW() WHERE id = $1`, [timeSlotId]);
    }

    await pool.query("COMMIT");

    try {
      await createNotification(
        apptCheck.rows[0].user_id,
        "BOOKING_UPDATE",
        "Appointment Update",
        `Your appointment status has been updated to ${status}.`
      );
    } catch (err) {
      console.error("Failed to send notification:", err);
    }

    return res.status(200).json({ message: "Status updated", data: result.rows[0] });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    await pool.query("ROLLBACK");
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// getMySlots
export const getMySlots = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM time_slots
      WHERE provider_id = (
        SELECT id FROM provider_profiles WHERE user_id = $1
      )
      ORDER BY start_time ASC
    `, [req.user?.id]);
    return res.status(200).json({ data: result.rows });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// createSlot
export const createSlot = async (req: AuthRequest, res: Response) => {
  try {
    const { startTime, endTime } = req.body;
    
    if (new Date(startTime) <= new Date()) {
      return res.status(400).json({ message: "startTime must be in the future" });
    }
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ message: "endTime must be after startTime" });
    }

    const providerResult = await pool.query(`SELECT id FROM provider_profiles WHERE user_id = $1`, [req.user?.id]);
    if (providerResult.rows.length === 0) return res.status(404).json({ message: "Provider profile not found" });
    const providerId = providerResult.rows[0].id;

    const overlapCheck = await pool.query(`
      SELECT id FROM time_slots 
      WHERE provider_id = $1 AND start_time < $2 AND end_time > $3
    `, [providerId, endTime, startTime]);

    if (overlapCheck.rows.length > 0) {
      return res.status(409).json({ message: "Overlapping slot found" });
    }

    const result = await pool.query(`
      INSERT INTO time_slots (provider_id, start_time, end_time, status, capacity, created_at, updated_at)
      VALUES ($1, $2, $3, 'AVAILABLE', 1, NOW(), NOW()) RETURNING *
    `, [providerId, startTime, endTime]);

    return res.status(201).json({ message: "Slot created", data: result.rows[0] });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// createBulkSlots
export const createBulkSlots = async (req: AuthRequest, res: Response) => {
  try {
    const { dates, startHour, endHour, intervalMinutes } = req.body;
    
    const providerResult = await pool.query(`SELECT id FROM provider_profiles WHERE user_id = $1`, [req.user?.id]);
    if (providerResult.rows.length === 0) return res.status(404).json({ message: "Provider not found" });
    const providerId = providerResult.rows[0].id;

    let created = 0;
    let skipped = 0;
    const slots = [];

    for (const d of dates) {
      const [year, month, day] = d.split('-');
      let currentHour = startHour;
      let currentMinute = 0;

      while (currentHour < endHour) {
        const slotStart = new Date(Number(year), Number(month) - 1, Number(day), currentHour, currentMinute, 0);
        let nextMinute = currentMinute + intervalMinutes;
        let nextHour = currentHour + Math.floor(nextMinute / 60);
        nextMinute = nextMinute % 60;
        
        const slotEnd = new Date(Number(year), Number(month) - 1, Number(day), nextHour, nextMinute, 0);

        if (slotEnd > new Date(Number(year), Number(month) - 1, Number(day), endHour, 0, 0)) {
           break;
        }

        const overlapCheck = await pool.query(`
          SELECT id FROM time_slots 
          WHERE provider_id = $1 AND start_time < $2 AND end_time > $3
        `, [providerId, slotEnd.toISOString(), slotStart.toISOString()]);

        if (overlapCheck.rows.length > 0) {
          skipped++;
        } else {
          const result = await pool.query(`
            INSERT INTO time_slots (provider_id, start_time, end_time, status, capacity, created_at, updated_at)
            VALUES ($1, $2, $3, 'AVAILABLE', 1, NOW(), NOW()) RETURNING *
          `, [providerId, slotStart.toISOString(), slotEnd.toISOString()]);
          slots.push(result.rows[0]);
          created++;
        }

        currentHour = nextHour;
        currentMinute = nextMinute;
      }
    }

    return res.status(201).json({ message: "Bulk slots processed", data: { created, skipped, slots } });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// deleteSlot
export const deleteSlot = async (req: AuthRequest, res: Response) => {
  try {
    const slotId = req.params.id;
    
    const slotCheck = await pool.query(`
      SELECT ts.id, ts.status FROM time_slots ts
      JOIN provider_profiles pp ON ts.provider_id = pp.id
      WHERE ts.id = $1 AND pp.user_id = $2
    `, [slotId, req.user?.id]);

    if (slotCheck.rows.length === 0) return res.status(404).json({ message: "Slot not found" });

    if (slotCheck.rows[0].status === 'BOOKED') {
      return res.status(400).json({ message: "Cannot delete a booked slot" });
    }

    await pool.query(`DELETE FROM time_slots WHERE id = $1`, [slotId]);
    return res.status(200).json({ message: "Slot deleted" });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// getMyServices
export const getMyServices = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM services
      WHERE provider_id = (
        SELECT id FROM provider_profiles WHERE user_id = $1
      )
      ORDER BY name ASC
    `, [req.user?.id]);
    return res.status(200).json({ data: result.rows });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// createService
export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, duration, price } = req.body;
    if (!name || !duration) return res.status(400).json({ message: "name and duration required" });

    const providerResult = await pool.query(`SELECT id FROM provider_profiles WHERE user_id = $1`, [req.user?.id]);
    if (providerResult.rows.length === 0) return res.status(404).json({ message: "Provider not found" });
    const providerId = providerResult.rows[0].id;

    const result = await pool.query(`
      INSERT INTO services (provider_id, name, description, duration, price, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW()) RETURNING *
    `, [providerId, name, description || null, duration, price || 0]);

    return res.status(201).json({ message: "Service created", data: result.rows[0] });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// updateService
export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const serviceId = req.params.id;
    const { name, description, duration, price, isActive } = req.body;

    const serviceCheck = await pool.query(`
      SELECT s.id FROM services s
      JOIN provider_profiles pp ON s.provider_id = pp.id
      WHERE s.id = $1 AND pp.user_id = $2
    `, [serviceId, req.user?.id]);

    if (serviceCheck.rows.length === 0) return res.status(404).json({ message: "Service not found" });

    const updates = [];
    const values = [];
    let i = 1;
    if (name !== undefined) { updates.push(`name = $${i++}`); values.push(name); }
    if (description !== undefined) { updates.push(`description = $${i++}`); values.push(description); }
    if (duration !== undefined) { updates.push(`duration = $${i++}`); values.push(duration); }
    if (price !== undefined) { updates.push(`price = $${i++}`); values.push(price); }
    if (isActive !== undefined) { updates.push(`is_active = $${i++}`); values.push(isActive); }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`);
      values.push(serviceId);
      const result = await pool.query(
        `UPDATE services SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`,
        values
      );
      return res.status(200).json({ message: "Service updated", data: result.rows[0] });
    }
    
    return res.status(400).json({ message: "No fields provided to update" });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// deleteService
export const deleteService = async (req: AuthRequest, res: Response) => {
  try {
    const serviceId = req.params.id;

    const serviceCheck = await pool.query(`
      SELECT s.id FROM services s
      JOIN provider_profiles pp ON s.provider_id = pp.id
      WHERE s.id = $1 AND pp.user_id = $2
    `, [serviceId, req.user?.id]);

    if (serviceCheck.rows.length === 0) return res.status(404).json({ message: "Service not found" });

    const checkAppts = await pool.query(`
      SELECT COUNT(*) FROM appointments 
      WHERE service_id = $1 AND status NOT IN ('CANCELLED')
    `, [serviceId]);

    if (parseInt(checkAppts.rows[0].count) > 0) {
      return res.status(400).json({ message: "Cannot delete service with existing bookings" });
    }

    await pool.query(`DELETE FROM services WHERE id = $1`, [serviceId]);
    return res.status(200).json({ message: "Service deleted" });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// getMyAnalytics
export const getMyAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const [q1, q2, q3, q4] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) as total_bookings,
          COUNT(*) FILTER (WHERE a.status = 'CANCELLED') as cancelled,
          SUM(s.price) FILTER (WHERE a.status = 'COMPLETED') as revenue
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        JOIN time_slots ts ON a.time_slot_id = ts.id
        JOIN provider_profiles pp ON ts.provider_id = pp.id
        WHERE pp.user_id = $1
        AND DATE_TRUNC('month', a.created_at) = DATE_TRUNC('month', NOW())
      `, [userId]),
      pool.query(`
        SELECT DATE(ts.start_time) as date, COUNT(*) as count
        FROM appointments a
        JOIN time_slots ts ON a.time_slot_id = ts.id
        JOIN provider_profiles pp ON ts.provider_id = pp.id
        WHERE pp.user_id = $1
        AND ts.start_time >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(ts.start_time)
        ORDER BY date ASC
      `, [userId]),
      pool.query(`
        SELECT EXTRACT(HOUR FROM ts.start_time)::int as hour,
               COUNT(*) as count
        FROM appointments a
        JOIN time_slots ts ON a.time_slot_id = ts.id
        JOIN provider_profiles pp ON ts.provider_id = pp.id
        WHERE pp.user_id = $1
        GROUP BY hour ORDER BY hour ASC
      `, [userId]),
      pool.query(`
        SELECT s.name, COUNT(*) as bookings,
               SUM(s.price) as revenue
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        JOIN time_slots ts ON a.time_slot_id = ts.id
        JOIN provider_profiles pp ON ts.provider_id = pp.id
        WHERE pp.user_id = $1
        GROUP BY s.name ORDER BY bookings DESC LIMIT 5
      `, [userId])
    ]);

    const stats = q1.rows[0] || {};
    const cancellationRate = parseInt(stats.total_bookings || '0') > 0 
      ? (parseInt(stats.cancelled || '0') / parseInt(stats.total_bookings || '1')) * 100 
      : 0;

    return res.status(200).json({
      data: {
        thisMonth: {
          totalBookings: parseInt(stats.total_bookings || '0'),
          cancelled: parseInt(stats.cancelled || '0'),
          revenue: parseFloat(stats.revenue || '0'),
          cancellationRate,
        },
        bookingsPerDay: q2.rows,
        bookingsPerHour: q3.rows,
        topServices: q4.rows
      }
    });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// getPeakHours
export const getPeakHours = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const [q1, q2] = await Promise.all([
      pool.query(`
        SELECT EXTRACT(HOUR FROM ts.start_time)::int as hour,
               COUNT(*) as count
        FROM appointments a
        JOIN time_slots ts ON a.time_slot_id = ts.id
        JOIN provider_profiles pp ON ts.provider_id = pp.id
        WHERE pp.user_id = $1
        AND a.status NOT IN ('CANCELLED')
        GROUP BY hour ORDER BY hour
      `, [userId]),
      pool.query(`
        SELECT TO_CHAR(ts.start_time, 'Day') as day,
               EXTRACT(DOW FROM ts.start_time)::int as day_num,
               COUNT(*) as count
        FROM appointments a
        JOIN time_slots ts ON a.time_slot_id = ts.id
        JOIN provider_profiles pp ON ts.provider_id = pp.id
        WHERE pp.user_id = $1
        AND a.status NOT IN ('CANCELLED')
        GROUP BY day, day_num ORDER BY day_num
      `, [userId])
    ]);

    const byHourRaw = q1.rows;
    const byDayRaw = q2.rows;

    const avgHour = byHourRaw.reduce((sum, curr) => sum + parseInt(curr.count), 0) / (byHourRaw.length || 1);
    const avgDay = byDayRaw.reduce((sum, curr) => sum + parseInt(curr.count), 0) / (byDayRaw.length || 1);

    let busiestHour = null;
    let busiestDay = null;
    let maxHourCount = -1;
    let maxDayCount = -1;

    const byHour = byHourRaw.map(h => {
       const count = parseInt(h.count);
       if (count > maxHourCount) { maxHourCount = count; busiestHour = h.hour; }
       return { hour: h.hour, count, isPeak: count > avgHour };
    });

    const byDay = byDayRaw.map(d => {
       const count = parseInt(d.count);
       if (count > maxDayCount) { maxDayCount = count; busiestDay = d.day.trim(); }
       return { day: d.day.trim(), count, isPeak: count > avgDay };
    });

    return res.status(200).json({
      data: {
        byHour,
        byDay,
        busiestHour,
        busiestDay
      }
    });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};

// getAISuggestions
export const getAISuggestions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const suggestions = [];

    const [statsResult, byDayResult, unbookedResult, next7DaysResult] = await Promise.all([
      pool.query(`
        SELECT COUNT(*) as total,
               COUNT(*) FILTER(WHERE a.status = 'CANCELLED') as cancelled
        FROM appointments a
        JOIN time_slots ts ON a.time_slot_id = ts.id
        JOIN provider_profiles pp ON ts.provider_id = pp.id
        WHERE pp.user_id = $1
      `, [userId]),
      pool.query(`
        SELECT TO_CHAR(ts.start_time, 'Day') as day,
               COUNT(*) as count,
               COUNT(*) FILTER (WHERE a.status = 'CANCELLED') as cancellations
        FROM appointments a
        JOIN time_slots ts ON a.time_slot_id = ts.id
        JOIN provider_profiles pp ON ts.provider_id = pp.id
        WHERE pp.user_id = $1
        GROUP BY day
      `, [userId]),
      pool.query(`
        SELECT EXTRACT(HOUR FROM start_time)::int as hour, count(*) as count
        FROM time_slots ts
        JOIN provider_profiles pp ON ts.provider_id = pp.id
        WHERE pp.user_id = $1 AND ts.status = 'AVAILABLE'
        AND start_time < NOW()
        GROUP BY hour
      `, [userId]),
      pool.query(`
        SELECT COUNT(*) as count FROM time_slots ts
        JOIN provider_profiles pp ON ts.provider_id = pp.id
        WHERE pp.user_id = $1
        AND ts.status = 'AVAILABLE'
        AND start_time > NOW()
        AND start_time <= NOW() + INTERVAL '7 days'
      `, [userId])
    ]);

    const totalAppts = parseInt(statsResult.rows[0].total || '0');
    const cancelledAppts = parseInt(statsResult.rows[0].cancelled || '0');
    const cancellationRate = totalAppts > 0 ? (cancelledAppts / totalAppts) * 100 : 0;

    if (cancellationRate > 20) {
      suggestions.push({
        type: "warning",
        message: `Your cancellation rate is ${cancellationRate.toFixed(1)}%. Consider sending reminders 24h before appointments to reduce no-shows.`
      });
    }

    if (byDayResult.rows.length > 0) {
      let mostCancelledDay = null;
      let maxCancellations = -1;
      let busiestDay = null;
      let maxCount = -1;

      for (const d of byDayResult.rows) {
        const c = parseInt(d.cancellations);
        const count = parseInt(d.count);
        if (c > maxCancellations) { maxCancellations = c; mostCancelledDay = d.day.trim(); }
        if (count > maxCount) { maxCount = count; busiestDay = d.day.trim(); }
      }

      const avgSlotsRaw = byDayResult.rows.reduce((s, d) => s + parseInt(d.count), 0) / byDayResult.rows.length;

      if (maxCancellations > 0 && maxCancellations > (totalAppts * 0.1)) {
        suggestions.push({
          type: "tip",
          message: `Most cancellations happen on ${mostCancelledDay}. Consider overbooking by 1 extra slot on that day.`
        });
      }

      if (busiestDay && maxCount < avgSlotsRaw) {
         suggestions.push({
           type: "tip",
           message: `${busiestDay} is your busiest day but has fewer available slots than average. Add more slots to maximize bookings.`
         });
      }
    }

    if (unbookedResult.rows.length > 0) {
       const neverBooked = unbookedResult.rows.sort((a,b) => parseInt(b.count) - parseInt(a.count))[0];
       if (neverBooked && parseInt(neverBooked.count) > 0) {
          suggestions.push({
            type: "insight",
            message: `Your ${neverBooked.hour}:00 slots are never booked. Consider removing them to keep your calendar clean.`
          });
       }
    }

    if (parseInt(next7DaysResult.rows[0].count) === 0) {
      suggestions.push({
        type: "warning",
        message: "You have no available slots for the next 7 days. Add slots now to accept new bookings."
      });
    }

    return res.status(200).json({ data: { suggestions, generatedAt: new Date() } });
  } catch (error: any) {
    require('fs').writeFileSync('/tmp/backend_err.txt', 'Payload: ' + JSON.stringify(req.body) + '\nError: ' + String(error.message));
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
};
