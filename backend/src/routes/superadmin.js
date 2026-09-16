import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, requireSuperAdmin } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireSuperAdmin);

// GET /superadmin/stats — Overview dashboard metrics
router.get("/stats", async (req, res) => {
  try {
    const activeFamilies = await pool.query("SELECT COUNT(*) FROM Family WHERE status = 'active'");
    const pendingRequests = await pool.query("SELECT COUNT(*) FROM Family WHERE status = 'pending'");
    const totalUsers = await pool.query("SELECT COUNT(*) FROM FamilyMember");
    const totalPrescriptions = await pool.query("SELECT COUNT(*) FROM Medicine");
    const recentActivity = await pool.query("SELECT family_name, created_at, status FROM Family ORDER BY created_at DESC LIMIT 5");

    res.json({
      activeFamilies: parseInt(activeFamilies.rows[0].count),
      pendingRequests: parseInt(pendingRequests.rows[0].count),
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalPrescriptions: parseInt(totalPrescriptions.rows[0].count),
      recentActivity: recentActivity.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load stats" });
  }
});

// GET /superadmin/families — All families for directory
router.get("/families", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.family_id, f.family_name, f.created_at, f.status,
              a.name AS admin_name, a.email, a.phone,
              (SELECT COUNT(*) FROM FamilyMember fm WHERE fm.family_id = f.family_id) AS member_count
       FROM Family f
       LEFT JOIN AuthUser a ON a.family_id = f.family_id AND a.role = 'admin'
       ORDER BY f.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load families" });
  }
});

// POST /superadmin/families/:id/suspend — Suspend active family
router.post("/families/:id/suspend", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE Family SET status = 'suspended' WHERE family_id = $1", [id]);
    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not suspend family" });
  } finally {
    client.release();
  }
});

// POST /superadmin/families/:id/reactivate — Reactivate suspended family
router.post("/families/:id/reactivate", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE Family SET status = 'active' WHERE family_id = $1", [id]);
    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not reactivate family" });
  } finally {
    client.release();
  }
});

// DELETE /superadmin/families/:id — Hard delete a family
router.delete("/families/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // ON DELETE CASCADE should ideally handle related tables, but since we didn't add it in schema, we'll manually delete.
    await pool.query("DELETE FROM DoseLog WHERE medicine_id IN (SELECT medicine_id FROM Medicine WHERE member_id IN (SELECT member_id FROM FamilyMember WHERE family_id = $1))", [id]);
    await pool.query("DELETE FROM Medicine WHERE member_id IN (SELECT member_id FROM FamilyMember WHERE family_id = $1)", [id]);
    await pool.query("DELETE FROM FamilyMember WHERE family_id = $1", [id]);
    await pool.query("DELETE FROM AuthUser WHERE family_id = $1", [id]);
    await pool.query("DELETE FROM Family WHERE family_id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete family" });
  }
});

// GET /superadmin/requests — Get pending family requests
router.get("/requests", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.family_id, f.family_name, f.created_at,
              a.auth_user_id, a.name AS admin_name, a.email, a.phone,
              (SELECT COUNT(*) FROM FamilyMember fm WHERE fm.family_id = f.family_id) AS member_count
       FROM Family f
       JOIN AuthUser a ON a.family_id = f.family_id AND a.role = 'admin'
       WHERE f.status = 'pending'
       ORDER BY f.created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load requests" });
  }
});

// POST /superadmin/requests/:id/approve
router.post("/requests/:id/approve", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE Family SET status = 'active' WHERE family_id = $1", [id]);
    await client.query("UPDATE AuthUser SET status = 'active' WHERE family_id = $1 AND role = 'admin'", [id]);
    await client.query("COMMIT");
    res.status(200).json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not approve request" });
  } finally {
    client.release();
  }
});

// POST /superadmin/requests/:id/reject
router.post("/requests/:id/reject", async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("UPDATE Family SET status = 'rejected' WHERE family_id = $1", [id]);
    await client.query("UPDATE AuthUser SET status = 'rejected' WHERE family_id = $1 AND role = 'admin'", [id]);
    await client.query("COMMIT");
    res.status(200).json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not reject request" });
  } finally {
    client.release();
  }
});

export default router;
