import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = Router();

function signToken(user) {
  return jwt.sign(
    { auth_user_id: user.auth_user_id, family_id: user.family_id, role: user.role, member_id: user.member_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /auth/register — creates a Family + the first AuthUser (admin)
router.post("/register", async (req, res) => {
  const { family_name, name, email, password } = req.body;
  if (!family_name || !name || !email || !password) {
    return res.status(400).json({ error: "family_name, name, email, and password are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const family = await client.query(
      "INSERT INTO Family (family_name) VALUES ($1) RETURNING family_id, family_name",
      [family_name]
    );

    const password_hash = await bcrypt.hash(password, 10);
    const user = await client.query(
      `INSERT INTO AuthUser (name, email, password_hash, role, family_id)
       VALUES ($1, $2, $3, 'admin', $4)
       RETURNING auth_user_id, name, email, role, family_id, member_id`,
      [name, email, password_hash, family.rows[0].family_id]
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
    const result = await pool.query("SELECT * FROM AuthUser WHERE email = $1 AND status = 'active'", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

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
    const newToken = signToken({
      auth_user_id: payload.auth_user_id,
      family_id: payload.family_id,
      role: payload.role,
      member_id: payload.member_id,
    });
    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
