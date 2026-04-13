// bookingController.ts — handles appointment booking logic
import { Request, Response } from "express";
import pool from "../db";
import { AuthRequest } from "../types";
import { createNotification } from "./notificationController";

// ============================================================
// BOOK AN APPOINTMENT
// POST /api/bookings
// Protected — requires login
// ============================================================
export const createBooking = async (req: AuthRequest, res: Response) => {
  // Get logged-in user's ID from JWT (set by authenticate middleware)
  const userId = req.user!.id;
  const { timeSlotId, serviceId, notes } = req.body;

  // Validate required fields
  if (!timeSlotId || !serviceId) {
    res.status(400).json({ message: "timeSlotId and serviceId are required" });
    return;
  }

  try {
    // STEP 1: Check if the time slot exists and is available
    const slotResult = await pool.query(
      `SELECT * FROM time_slots WHERE id = $1`,
      [timeSlotId]
    );

    if (slotResult.rows.length === 0) {
      res.status(404).json({ message: "Time slot not found" });
      return;
    }

    const slot = slotResult.rows[0];

    // Check if slot is still available
    if (slot.status !== "AVAILABLE") {
      res.status(409).json({
        message: "This time slot is no longer available. Please choose another."
      });
      return;
    }

    // Check slot is in the future
    if (new Date(slot.start_time) <= new Date()) {
      res.status(400).json({ message: "Cannot book a past time slot" });
      return;
    }

    // STEP 2: Verify the service exists and belongs to same provider
    const serviceResult = await pool.query(
      `SELECT * FROM services WHERE id = $1 AND is_active = true`,
      [serviceId]
    );

    if (serviceResult.rows.length === 0) {
      res.status(404).json({ message: "Service not found" });
      return;
    }

    // Make sure service and slot belong to same provider
    if (serviceResult.rows[0].provider_id !== slot.provider_id) {
      res.status(400).json({
        message: "Service and time slot belong to different providers"
      });
      return;
    }

    // STEP 3: Check user doesn't already have a booking at this time
    // This prevents a user from double-booking themselves
    const conflictResult = await pool.query(
      `SELECT a.id FROM appointments a
       JOIN time_slots ts ON a.time_slot_id = ts.id
       WHERE a.user_id = $1
       AND a.status NOT IN ('CANCELLED')
       AND ts.start_time < $2
       AND ts.end_time > $3`,
      [userId, slot.end_time, slot.start_time]
    );

    if (conflictResult.rows.length > 0) {
      res.status(409).json({
        message: "You already have an appointment at this time"
      });
      return;
    }

    // STEP 4: Create the appointment + update slot status
    // We use a TRANSACTION — both queries must succeed or both fail
    // This prevents: appointment created but slot still shows AVAILABLE
    await pool.query("BEGIN");

    try {
      // Create the appointment
      const appointmentResult = await pool.query(
        `INSERT INTO appointments (user_id, service_id, time_slot_id, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, serviceId, timeSlotId, notes || null]
      );

      // Update slot status to BOOKED
      await pool.query(
        `UPDATE time_slots SET status = 'BOOKED', updated_at = NOW()
         WHERE id = $1`,
        [timeSlotId]
      );

      // Both succeeded — commit the transaction
      await pool.query("COMMIT");

      res.status(201).json({
        message: "Appointment booked successfully!",
        appointment: appointmentResult.rows[0],
      });

      try {
        const providerUserResult = await pool.query(
            `SELECT user_id FROM provider_profiles WHERE id = $1`,
            [slot.provider_id]
        );
        if (providerUserResult.rows.length > 0) {
            await createNotification(
                providerUserResult.rows[0].user_id,
                "BOOKING_NEW",
                "New Appointment Request",
                `You have a new appointment request for ${serviceResult.rows[0].name}.`
            );
        }
      } catch (err) {
        console.error("Failed to send notification:", err);
      }

    } catch (innerError) {
      // Something went wrong — rollback BOTH changes
      await pool.query("ROLLBACK");
      throw innerError;
    }

  } catch (error) {
    console.error("createBooking error:", error);
    res.status(500).json({ message: "Server error during booking" });
  }
};

// ============================================================
// GET MY APPOINTMENTS
// GET /api/bookings/my
// Protected — returns appointments for logged-in user
// ============================================================
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const result = await pool.query(
      `SELECT
        a.id,
        a.status,
        a.notes,
        a.created_at,
        s.name AS service_name,
        s.duration AS service_duration,
        s.price AS service_price,
        pp.business_name AS provider_name,
        pp.address AS provider_address,
        pp.city AS provider_city,
        ts.start_time,
        ts.end_time
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       JOIN time_slots ts ON a.time_slot_id = ts.id
       JOIN provider_profiles pp ON ts.provider_id = pp.id
       WHERE a.user_id = $1
       ORDER BY ts.start_time DESC`,
      [userId]
    );

    res.json({
      count: result.rows.length,
      appointments: result.rows,
    });
  } catch (error) {
    console.error("getMyBookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// CANCEL APPOINTMENT
// PUT /api/bookings/:id/cancel
// Protected — user can only cancel their own appointments
// ============================================================
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    // Find the appointment — make sure it belongs to this user
    const appointmentResult = await pool.query(
      `SELECT a.*, ts.start_time, ts.provider_id FROM appointments a
       JOIN time_slots ts ON a.time_slot_id = ts.id
       WHERE a.id = $1 AND a.user_id = $2`,
      [id, userId]
    );

    if (appointmentResult.rows.length === 0) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    const appointment = appointmentResult.rows[0];

    // Can't cancel already cancelled or completed appointments
    if (["CANCELLED", "COMPLETED"].includes(appointment.status)) {
      res.status(400).json({
        message: `Cannot cancel an appointment that is ${appointment.status}`
      });
      return;
    }

    // Can't cancel if appointment is in less than 1 hour
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    if (new Date(appointment.start_time) <= oneHourFromNow) {
      res.status(400).json({
        message: "Cannot cancel appointment less than 1 hour before start time"
      });
      return;
    }

    // Use transaction — update both appointment and slot together
    await pool.query("BEGIN");

    try {
      // Update appointment status
      await pool.query(
        `UPDATE appointments SET status = 'CANCELLED', updated_at = NOW()
         WHERE id = $1`,
        [id]
      );

      // Free up the time slot again
      await pool.query(
        `UPDATE time_slots SET status = 'AVAILABLE', updated_at = NOW()
         WHERE id = $1`,
        [appointment.time_slot_id]
      );

      await pool.query("COMMIT");

      res.json({ message: "Appointment cancelled successfully" });

      try {
        const providerUserResult = await pool.query(
            `SELECT user_id FROM provider_profiles WHERE id = $1`,
            [appointment.provider_id]
        );
        if (providerUserResult.rows.length > 0) {
            await createNotification(
                providerUserResult.rows[0].user_id,
                "BOOKING_CANCELLED",
                "Appointment Cancelled",
                `An appointment on ${new Date(appointment.start_time).toLocaleDateString()} has been cancelled by the customer.`
            );
        }
      } catch (err) {
        console.error("Failed to send notification:", err);
      }

    } catch (innerError) {
      await pool.query("ROLLBACK");
      throw innerError;
    }

  } catch (error) {
    console.error("cancelBooking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================================
// SUBMIT REVIEW
// PUT /api/bookings/:id/review
// Protected
// ============================================================
export const submitReview = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { rating, review } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const appointmentResult = await pool.query(
      `SELECT * FROM appointments WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointment = appointmentResult.rows[0];

    if (appointment.status !== "COMPLETED") {
      return res.status(400).json({ message: "Can only review completed appointments" });
    }

    if (appointment.rating !== null) {
      return res.status(400).json({ message: "Already reviewed" });
    }

    await pool.query("BEGIN");

    await pool.query(
      `UPDATE appointments SET rating = $1, review = $2, updated_at = NOW() WHERE id = $3`,
      [rating, review || null, id]
    );

    const serviceResult = await pool.query(
      `SELECT provider_id FROM services WHERE id = $1`,
      [appointment.service_id]
    );
    const providerId = serviceResult.rows[0].provider_id;

    const avgQuery = await pool.query(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
      FROM appointments
      WHERE service_id IN (
        SELECT id FROM services WHERE provider_id = $1
      ) AND rating IS NOT NULL
    `, [providerId]);
    
    const { avg_rating, total_reviews } = avgQuery.rows[0];

    await pool.query(
      `UPDATE provider_profiles SET avg_rating = $1, total_reviews = $2, updated_at = NOW() WHERE id = $3`,
      [parseFloat(avg_rating).toFixed(2), parseInt(total_reviews), providerId]
    );

    await pool.query("COMMIT");

    return res.status(200).json({ message: "Review submitted successfully" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("submitReview error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};