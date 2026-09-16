import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = Router();

function signToken(user) {
  return jwt.sign(
    { auth_user_id: user.auth_user_id, family_id: user.family_id, role: user.role, member_id: user.member_id, status: user.status },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /auth/register — creates a Family + the first AuthUser (admin)
router.post("/register", async (req, res) => {
  const { family_name, name, email, password, phone } = req.body;
  if (!family_name || !name || !email || !password) {
    return res.status(400).json({ error: "family_name, name, email, and password are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const family = await client.query(
      "INSERT INTO Family (family_name, status) VALUES ($1, 'pending') RETURNING family_id, family_name, status",
      [family_name]
    );

    const password_hash = await bcrypt.hash(password, 10);
    const user = await client.query(
      `INSERT INTO AuthUser (name, email, password_hash, role, family_id, status, phone)
       VALUES ($1, $2, $3, 'admin', $4, 'pending', $5)
       RETURNING auth_user_id, name, email, role, family_id, member_id, status, phone`,
      [name, email, password_hash, family.rows[0].family_id, phone || null]
    );

    await client.query("COMMIT");

    const token = signToken(user.rows[0]);
    res.status(201).json({ token, user: user.rows[0], family: family.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505") {
      return res.status(409).json({ error: "An account with that email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Could not register" });
  } finally {
    client.release();
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  try {
    const result = await pool.query(
      `SELECT u.*, f.status as family_status 
       FROM AuthUser u 
       LEFT JOIN Family f ON u.family_id = f.family_id 
       WHERE u.email = $1 AND u.status != 'rejected'`,
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    if (user.status === 'suspended' || user.family_status === 'suspended') {
      return res.status(403).json({ error: "Your family account has been suspended by the Super Admin." });
    }
    if (user.family_status === 'rejected') {
      return res.status(403).json({ error: "Your family account request was rejected." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    await pool.query("UPDATE AuthUser SET last_login = NOW() WHERE auth_user_id = $1", [user.auth_user_id]);

    const token = signToken(user);
    res.json({
      token,
      user: {
        auth_user_id: user.auth_user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        family_id: user.family_id,
        member_id: user.member_id,
        status: user.status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not log in" });
  }
});

// POST /auth/refresh — reissues a token for an already-valid session
router.post("/refresh", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "token is required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    const result = await pool.query(
      `SELECT u.status as user_status, f.status as family_status 
       FROM AuthUser u 
       LEFT JOIN Family f ON u.family_id = f.family_id 
       WHERE u.auth_user_id = $1`, 
      [payload.auth_user_id]
    );
    const userStatus = result.rows[0]?.user_status;
    const familyStatus = result.rows[0]?.family_status;
    if (!userStatus || userStatus === 'suspended' || userStatus === 'rejected' || familyStatus === 'suspended') throw new Error("Account unavailable");

    const newToken = signToken({
      auth_user_id: payload.auth_user_id,
      family_id: payload.family_id,
      role: payload.role,
      member_id: payload.member_id,
      status: result.rows[0].status,
    });
    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET /auth/families — list active families for member registration
router.get("/families", async (req, res) => {
  try {
    const result = await pool.query("SELECT family_id, family_name FROM Family WHERE status = 'active' ORDER BY family_name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load families" });
  }
});

// POST /auth/register-member — member requests to join a family
router.post("/register-member", async (req, res) => {
  const { name, email, password, phone, family_id } = req.body;
  if (!name || !email || !password || !family_id) {
    return res.status(400).json({ error: "name, email, password, and family_id are required" });
  }

  const client = await pool.connect();
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const user = await client.query(
      `INSERT INTO AuthUser (name, email, password_hash, role, family_id, status, phone)
       VALUES ($1, $2, $3, 'member', $4, 'pending_member', $5)
       RETURNING auth_user_id, name, email, role, family_id, status`,
      [name, email, password_hash, family_id, phone || null]
    );

    const token = signToken(user.rows[0]);
    res.status(201).json({ token, user: user.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "An account with that email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Could not register member" });
  } finally {
    client.release();
  }
});

export default router;
