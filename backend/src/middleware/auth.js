import jwt from "jsonwebtoken";

// Verifies the JWT and attaches { auth_user_id, family_id, role, member_id }
// to req.user. Every downstream route reads family_id from req.user —
// never from a client-supplied parameter (TRD Section 4 & 6).
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Restricts a mutating route to family admins (TRD Section 6: role checks
// enforced server-side, not just hidden in the UI).
export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Requires admin privileges" });
  }
  next();
}

export function requireSuperAdmin(req, res, next) {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({ error: "Requires super admin privileges" });
  }
  next();
}
