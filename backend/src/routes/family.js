import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /family — current family + member list
router.get("/", async (req, res) => {
  try {
    const family = await pool.query("SELECT * FROM Family WHERE family_id = $1", [req.user.family_id]);
    const members = await pool.query(
      "SELECT * FROM FamilyMember WHERE family_id = $1 ORDER BY created_at ASC",
      [req.user.family_id]
    );
    res.json({ family: family.rows[0], members: members.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load family" });
  }
});

// POST /family/members
router.post("/members", requireAdmin, async (req, res) => {
  const {
    name, date_of_birth, gender, relationship, phone, email,
    blood_group, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone,
  } = req.body;

  if (!name) return res.status(400).json({ error: "name is required" });

  try {
    const result = await pool.query(
      `INSERT INTO FamilyMember
        (family_id, name, date_of_birth, gender, relationship, phone, email,
         blood_group, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [req.user.family_id, name, date_of_birth, gender, relationship, phone, email,
       blood_group, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create family member" });
  }
});

// GET /family/members/:id — scoped to caller's family_id
router.get("/members/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM FamilyMember WHERE member_id = $1 AND family_id = $2",
      [req.params.id, req.user.family_id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Member not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load member" });
  }
});

// PATCH /family/members/:id
router.patch("/members/:id", requireAdmin, async (req, res) => {
  const fields = [
    "name", "date_of_birth", "gender", "relationship", "phone", "email",
    "blood_group", "allergies", "chronic_conditions", "emergency_contact_name", "emergency_contact_phone",
  ];
  const updates = fields.filter((f) => f in req.body);
  if (updates.length === 0) return res.status(400).json({ error: "No updatable fields provided" });

  const setClause = updates.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = updates.map((f) => req.body[f]);

  try {
    const result = await pool.query(
      `UPDATE FamilyMember SET ${setClause}
       WHERE member_id = $${updates.length + 1} AND family_id = $${updates.length + 2}
       RETURNING *`,
      [...values, req.params.id, req.user.family_id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Member not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update member" });
  }
});

// DELETE /family/members/:id
router.delete("/members/:id", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM FamilyMember WHERE member_id = $1 AND family_id = $2 RETURNING member_id",
      [req.params.id, req.user.family_id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Member not found" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete member" });
  }
});

// GET /family/pending-members
router.get("/pending-members", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT auth_user_id, name, email, phone FROM AuthUser WHERE family_id = $1 AND status = 'pending_member'",
      [req.user.family_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load pending members" });
  }
});

// POST /family/pending-members/:id/approve
router.post("/pending-members/:id/approve", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Get the user
    const userRes = await client.query("SELECT * FROM AuthUser WHERE auth_user_id = $1 AND family_id = $2 AND status = 'pending_member'", [id, req.user.family_id]);
    if (userRes.rows.length === 0) throw new Error("Pending member not found");
    const user = userRes.rows[0];

    // Create a FamilyMember record for them
    const memberRes = await client.query(
      "INSERT INTO FamilyMember (family_id, name, email, phone) VALUES ($1, $2, $3, $4) RETURNING member_id",
      [req.user.family_id, user.name, user.email, user.phone]
    );
    const newMemberId = memberRes.rows[0].member_id;

    // Update AuthUser
    await client.query(
      "UPDATE AuthUser SET status = 'active', member_id = $1 WHERE auth_user_id = $2",
      [newMemberId, id]
    );

    await client.query("COMMIT");
    res.json({ success: true, member_id: newMemberId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not approve member" });
  } finally {
    client.release();
  }
});

// POST /family/pending-members/:id/reject
router.post("/pending-members/:id/reject", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE AuthUser SET status = 'rejected' WHERE auth_user_id = $1 AND family_id = $2 AND status = 'pending_member'",
      [id, req.user.family_id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Pending member not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not reject member" });
  }
});

export default router;
