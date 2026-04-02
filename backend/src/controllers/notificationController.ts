import { Response } from "express";
import pool from "../db";
import { AuthRequest } from "../types";

export const createNotification = async (userId: string | number, type: string, title: string, message: string) => {
  try {
    await pool.query(`
      INSERT INTO notifications (user_id, type, title, message, sent_at, created_at, is_read)
      VALUES ($1, $2, $3, $4, NOW(), NOW(), false)
    `, [userId, type, title, message]);
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC LIMIT 20
    `, [req.user?.id]);

    const countResult = await pool.query(`
      SELECT COUNT(*) FROM notifications
      WHERE user_id = $1 AND is_read = false
    `, [req.user?.id]);

    return res.status(200).json({
      data: {
        notifications: result.rows,
        unreadCount: parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const notificationId = req.params.id;
    const result = await pool.query(`
      UPDATE notifications SET is_read = true 
      WHERE id = $1 AND user_id = $2 RETURNING *
    `, [notificationId, req.user?.id]);

    if (result.rows.length === 0) return res.status(404).json({ message: "Notification not found" });
    return res.status(200).json({ message: "Marked as read", data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(`
      UPDATE notifications SET is_read = true 
      WHERE user_id = $1
    `, [req.user?.id]);

    return res.status(200).json({ message: "All marked as read" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
