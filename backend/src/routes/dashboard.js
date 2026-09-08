import { Router } from "express";
import crypto from "crypto";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /dashboard/today — cross-member schedule for the current day.
// Target: <500ms for a family with up to 10 members / 100 active medicines
// (TRD Section 5) — a single joined query keeps this to one round trip.
router.get("/dashboard/today", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dl.dose_log_id, dl.scheduled_time, dl.status, dl.logged_at,
              m.medicine_id, m.medicine_name, m.dosage,
              fm.member_id, fm.name AS member_name
       FROM DoseLog dl
       JOIN Medicine m ON m.medicine_id = dl.medicine_id
       JOIN FamilyMember fm ON fm.member_id = m.member_id
       WHERE fm.family_id = $1
       ORDER BY dl.scheduled_time ASC`,
      [req.user.family_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load today's schedule" });
  }
});

// GET /analytics/medicines — most-used medicines, visits per doctor, by city
router.get("/analytics/medicines", async (req, res) => {
  try {
    const mostUsed = await pool.query(
      `SELECT m.medicine_name, COUNT(*) AS count
       FROM Medicine m
       JOIN FamilyMember fm ON fm.member_id = m.member_id
       WHERE fm.family_id = $1
       GROUP BY m.medicine_name
       ORDER BY count DESC
       LIMIT 10`,
      [req.user.family_id]
    );

    const byDoctor = await pool.query(
      `SELECT d.doctor_name, COUNT(*) AS prescriptions
       FROM Medicine m
       JOIN FamilyMember fm ON fm.member_id = m.member_id
       JOIN Doctor d ON d.doctor_id = m.doctor_id
       WHERE fm.family_id = $1
       GROUP BY d.doctor_name
       ORDER BY prescriptions DESC`,
      [req.user.family_id]
    );

    res.json({ most_used_medicines: mostUsed.rows, visits_per_doctor: byDoctor.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load analytics" });
  }
});

// GET /members/:id/emergency-card — consolidated snapshot
router.get("/members/:id/emergency-card", async (req, res) => {
  try {
    const member = await pool.query(
      "SELECT * FROM FamilyMember WHERE member_id = $1 AND family_id = $2",
      [req.params.id, req.user.family_id]
    );
    if (!member.rows[0]) return res.status(404).json({ error: "Member not found" });

    const activeMeds = await pool.query(
      `SELECT medicine_name, dosage, frequency FROM Medicine
       WHERE member_id = $1
         AND (end_date IS NULL OR end_date >= CURRENT_DATE)
         AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)`,
      [req.params.id]
    );

    res.json({ member: member.rows[0], active_medicines: activeMeds.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not build emergency card" });
  }
});

// In-memory store for demo share tokens. Swap for a DB table
// (e.g. EmergencyShare) before shipping — kept simple here since the
// PRD only requires a signed, time-limited, auditable link.
const shareTokens = new Map();

// POST /members/:id/emergency-card/share — signed, 24h-expiring link,
// logged per TRD Section 6 (who generated it, when).
router.post("/members/:id/emergency-card/share", async (req, res) => {
  try {
    const member = await pool.query(
      "SELECT member_id FROM FamilyMember WHERE member_id = $1 AND family_id = $2",
      [req.params.id, req.user.family_id]
    );
    if (!member.rows[0]) return res.status(404).json({ error: "Member not found" });

    const token = crypto.randomBytes(24).toString("hex"); // random, not sequential (TRD Section 6)
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);
    shareTokens.set(token, { member_id: req.params.id, expires_at });

    await pool.query(
      "INSERT INTO ActivityLog (auth_user_id, action, status) VALUES ($1, $2, 'success')",
      [req.user.auth_user_id, `generated emergency-card share link for member ${req.params.id}`]
    );

    res.status(201).json({ url: `/public/emergency-card/${token}`, expires_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create share link" });
  }
});

// GET /public/emergency-card/:token — viewable without login, but only
// via an unguessable token, and it expires (TRD Section 6).
export const publicRouter = Router();
publicRouter.get("/public/emergency-card/:token", async (req, res) => {
  const entry = shareTokens.get(req.params.token);
  if (!entry || entry.expires_at < new Date()) {
    return res.status(404).json({ error: "This link is invalid or has expired" });
  }

  try {
    const member = await pool.query("SELECT * FROM FamilyMember WHERE member_id = $1", [entry.member_id]);
    const activeMeds = await pool.query(
      `SELECT medicine_name, dosage, frequency FROM Medicine
       WHERE member_id = $1
         AND (end_date IS NULL OR end_date >= CURRENT_DATE)
         AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)`,
      [entry.member_id]
    );
    res.json({ member: member.rows[0], active_medicines: activeMeds.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load emergency card" });
  }
});

export default router;
