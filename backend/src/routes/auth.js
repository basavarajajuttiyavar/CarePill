import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = Router();

function signToken(user) {
  return jwt.sign(
    { auth_user_id: user.auth_user_id, family_id: user.family_id, role: user.role, member_id: user.member_id, status: user.status, invite_code: user.invite_code },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /auth/send-otp
router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "phone is required" });

  try {
    const userCheck = await pool.query("SELECT auth_user_id FROM AuthUser WHERE phone = $1", [phone]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ error: "Phone number is already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await pool.query(
      `INSERT INTO OtpVerification (phone, otp, expires_at) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (phone) DO UPDATE SET otp = $2, expires_at = $3`,
      [phone, otp, expiresAt]
    );

    // In a real app, you would use Twilio/SNS here.
    // We return it for prototype testing purposes.
    res.json({ success: true, message: "OTP sent successfully", _mock_otp: otp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not send OTP: " + err.message });
  }
});

// POST /auth/register — creates a Family + the first AuthUser (admin)
router.post("/register", async (req, res) => {
  const { family_name, name, phone, password, otp, email } = req.body;
  if (!family_name || !name || !phone || !password || !otp) {
    return res.status(400).json({ error: "family_name, name, phone, password, and otp are required" });
  }

  const client = await pool.connect();
  try {
    const otpCheck = await client.query("SELECT * FROM OtpVerification WHERE phone = $1 AND otp = $2 AND expires_at > NOW()", [phone, otp]);
    if (otpCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await client.query("BEGIN");

    const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();

    const family = await client.query(
      "INSERT INTO Family (family_name, status, invite_code) VALUES ($1, 'pending', $2) RETURNING family_id, family_name, status, invite_code",
      [family_name, inviteCode]
    );

    const password_hash = await bcrypt.hash(password, 10);
    const user = await client.query(
      `INSERT INTO AuthUser (name, email, password_hash, role, family_id, status, phone)
       VALUES ($1, $2, $3, 'admin', $4, 'pending', $5)
       RETURNING auth_user_id, name, email, role, family_id, member_id, status, phone`,
      [name, email || null, password_hash, family.rows[0].family_id, phone]
    );

    await client.query("DELETE FROM OtpVerification WHERE phone = $1", [phone]);
    await client.query("COMMIT");

    const registeredUser = { ...user.rows[0], invite_code: inviteCode };
    const token = signToken(registeredUser);
    res.status(201).json({ token, user: registeredUser, family: family.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505") {
      return res.status(409).json({ error: "An account with that phone or email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Could not register" });
  } finally {
    client.release();
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: "phone and password are required" });
  }

  try {
    const result = await pool.query(
      `SELECT u.*, f.status as family_status, f.invite_code 
       FROM AuthUser u 
       LEFT JOIN Family f ON u.family_id = f.family_id 
       WHERE u.phone = $1 AND u.status != 'rejected'`,
      [phone]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid phone number or password" });

    if (user.family_status === 'suspended') {
      return res.status(403).json({ error: "Family account is deactivated. To activate please connect with operation team archanagowdas2005@gmail.com" });
    }
    if (user.family_status === 'rejected') {
      return res.status(403).json({ error: "Your family account request was rejected." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid phone number or password" });

    await pool.query("UPDATE AuthUser SET last_login = NOW() WHERE auth_user_id = $1", [user.auth_user_id]);

    const token = signToken(user);
    res.json({
      token,
      user: {
        auth_user_id: user.auth_user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        family_id: user.family_id,
        member_id: user.member_id,
        status: user.status,
        invite_code: user.invite_code,
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
      `SELECT u.status as user_status, f.status as family_status, f.invite_code 
       FROM AuthUser u 
       LEFT JOIN Family f ON u.family_id = f.family_id 
       WHERE u.auth_user_id = $1`, 
      [payload.auth_user_id]
    );
    const userStatus = result.rows[0]?.user_status;
    const familyStatus = result.rows[0]?.family_status;
    if (!userStatus || userStatus === 'rejected' || familyStatus === 'suspended') throw new Error("Account unavailable");

    const newToken = signToken({
      auth_user_id: payload.auth_user_id,
      family_id: payload.family_id,
      role: payload.role,
      member_id: payload.member_id,
      status: result.rows[0].user_status,
      invite_code: result.rows[0].invite_code,
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
  const { name, phone, password, otp, email, family_id } = req.body; // Actually receives the invite_code in family_id
  if (!name || !phone || !password || !otp || !family_id) {
    return res.status(400).json({ error: "name, phone, password, otp, and Family ID (Invite Code) are required" });
  }

  const client = await pool.connect();
  try {
    const otpCheck = await client.query("SELECT * FROM OtpVerification WHERE phone = $1 AND otp = $2 AND expires_at > NOW()", [phone, otp]);
    if (otpCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const familyCheck = await client.query("SELECT family_id, status FROM Family WHERE invite_code = $1 OR family_id::text = $1", [family_id]);
    if (familyCheck.rows.length === 0) {
      return res.status(404).json({ error: "No family found with that Invite Code" });
    }
    if (familyCheck.rows[0].status !== 'active') {
      return res.status(403).json({ error: "This family is not active" });
    }

    const actualFamilyId = familyCheck.rows[0].family_id;
    const password_hash = await bcrypt.hash(password, 10);
    const user = await client.query(
      `INSERT INTO AuthUser (name, email, password_hash, role, family_id, status, phone)
       VALUES ($1, $2, $3, 'member', $4, 'pending_member', $5)
       RETURNING auth_user_id, name, email, role, family_id, status`,
      [name, email || null, password_hash, actualFamilyId, phone]
    );

    await client.query("DELETE FROM OtpVerification WHERE phone = $1", [phone]);

    const token = signToken(user.rows[0]);
    res.status(201).json({ token, user: user.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "An account with that phone or email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Could not register member" });
  } finally {
    client.release();
  }
});

export default router;
