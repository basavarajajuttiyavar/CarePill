import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// Confirms a member belongs to the caller's family before touching their
// medicines — this is the "no cross-family reads" rule from TRD Section 4.
async function assertMemberInFamily(memberId, familyId) {
  const result = await pool.query(
    "SELECT member_id FROM FamilyMember WHERE member_id = $1 AND family_id = $2",
    [memberId, familyId]
  );
  return !!result.rows[0];
}

// GET /members/:id/medicines?status=active|past
router.get("/members/:id/medicines", async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  if (!(await assertMemberInFamily(id, req.user.family_id))) {
    return res.status(404).json({ error: "Member not found" });
  }

  try {
    let query = "SELECT * FROM Medicine WHERE member_id = $1";
    const params = [id];

    if (status === "active") {
      query += " AND (end_date IS NULL OR end_date >= CURRENT_DATE) AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)";
    } else if (status === "past") {
      query += " AND (end_date < CURRENT_DATE OR expiry_date < CURRENT_DATE)";
    }
    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load medicines" });
  }
});

// POST /medicines
router.post("/medicines", requireAdmin, async (req, res) => {
  const {
    member_id, medicine_name, medicine_type, dosage, frequency, quantity,
    reason, start_date, end_date, expiry_date, prescription_type, doctor_id, notes,
  } = req.body;

  if (!member_id || !medicine_name) {
    return res.status(400).json({ error: "member_id and medicine_name are required" });
  }
  if (!(await assertMemberInFamily(member_id, req.user.family_id))) {
    return res.status(404).json({ error: "Member not found" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Medicine
        (member_id, medicine_name, medicine_type, dosage, frequency, quantity, reason,
         start_date, end_date, expiry_date, prescription_type, doctor_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [member_id, medicine_name, medicine_type, dosage, frequency, quantity, reason,
       start_date, end_date, expiry_date, prescription_type || "self", doctor_id || null, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create medicine" });
  }
});

// GET /medicines/:id
router.get("/medicines/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.* FROM Medicine m
       JOIN FamilyMember fm ON fm.member_id = m.member_id
       WHERE m.medicine_id = $1 AND fm.family_id = $2`,
      [req.params.id, req.user.family_id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Medicine not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load medicine" });
  }
});

// PATCH /medicines/:id
router.patch("/medicines/:id", requireAdmin, async (req, res) => {
  const fields = [
    "medicine_name", "medicine_type", "dosage", "frequency", "quantity", "reason",
    "start_date", "end_date", "expiry_date", "prescription_type", "doctor_id", "notes",
  ];
  const updates = fields.filter((f) => f in req.body);
  if (updates.length === 0) return res.status(400).json({ error: "No updatable fields provided" });

  const setClause = updates.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = updates.map((f) => req.body[f]);

  try {
    const result = await pool.query(
      `UPDATE Medicine m SET ${setClause}
       FROM FamilyMember fm
       WHERE m.member_id = fm.member_id
         AND m.medicine_id = $${updates.length + 1}
         AND fm.family_id = $${updates.length + 2}
       RETURNING m.*`,
      [...values, req.params.id, req.user.family_id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Medicine not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update medicine" });
  }
});

// DELETE /medicines/:id
router.delete("/medicines/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM Medicine m USING FamilyMember fm
       WHERE m.member_id = fm.member_id
         AND m.medicine_id = $1
         AND fm.family_id = $2
       RETURNING m.medicine_id`,
      [req.params.id, req.user.family_id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Medicine not found" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete medicine" });
  }
});

// POST /medicines/:id/dose-log — mark taken/missed/skipped
router.post("/medicines/:id/dose-log", async (req, res) => {
  const { status, scheduled_time } = req.body;
  if (!status || !scheduled_time) {
    return res.status(400).json({ error: "status and scheduled_time are required" });
  }

  try {
    const owns = await pool.query(
      `SELECT m.medicine_id FROM Medicine m
       JOIN FamilyMember fm ON fm.member_id = m.member_id
       WHERE m.medicine_id = $1 AND fm.family_id = $2`,
      [req.params.id, req.user.family_id]
    );
    if (!owns.rows[0]) return res.status(404).json({ error: "Medicine not found" });

    const result = await pool.query(
      `INSERT INTO DoseLog (medicine_id, scheduled_time, status, logged_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [req.params.id, scheduled_time, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not log dose" });
  }
});

// GET /medicines/:id/dose-log
router.get("/medicines/:id/dose-log", async (req, res) => {
  try {
    const owns = await pool.query(
      `SELECT m.medicine_id FROM Medicine m
       JOIN FamilyMember fm ON fm.member_id = m.member_id
       WHERE m.medicine_id = $1 AND fm.family_id = $2`,
      [req.params.id, req.user.family_id]
    );
    if (!owns.rows[0]) return res.status(404).json({ error: "Medicine not found" });

    const result = await pool.query(
      "SELECT * FROM DoseLog WHERE medicine_id = $1 ORDER BY scheduled_time ASC",
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load dose log" });
  }
});

export default router;
