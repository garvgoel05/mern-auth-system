import jwt from "jsonwebtoken";

// Protects routes by verifying the short-lived access token
// sent in the Authorization header as "Bearer <token>".
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No access token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    // Expired or invalid access token -> client should call /refresh
    return res.status(401).json({ message: "Access token invalid or expired" });
  }
};
