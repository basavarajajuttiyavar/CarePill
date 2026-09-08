import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /doctors — dedupe by name+hospital happens client-side on entry;
// this simply lists the shared doctor directory.
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Doctor ORDER BY doctor_name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load doctors" });
  }
});

// POST /doctors
router.post("/", async (req, res) => {
  const { doctor_name, specialization, hospital, clinic, city, state, phone } = req.body;
  if (!doctor_name) return res.status(400).json({ error: "doctor_name is required" });

  try {
    const result = await pool.query(
      `INSERT INTO Doctor (doctor_name, specialization, hospital, clinic, city, state, phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [doctor_name, specialization, hospital, clinic, city, state, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create doctor" });
  }
});

// GET /doctors/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Doctor WHERE doctor_id = $1", [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: "Doctor not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load doctor" });
  }
});

export default router;
