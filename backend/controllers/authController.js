import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";

const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, keep in sync with REFRESH_EXPIRY

const signAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_EXPIRY,
  });

const signRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  });

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const cookieOptions = {
  httpOnly: true, // JS on the page can't read it -> mitigates XSS token theft
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "strict", // mitigates CSRF
  maxAge: REFRESH_EXPIRY_MS,
  path: "/api/auth", // only sent to auth routes (refresh/logout)
};

// Attach a new refresh token to the user's session list and set the cookie
const issueRefreshToken = async (user, res) => {
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
  });
  // Keep the list tidy: drop expired tokens
  user.refreshTokens = user.refreshTokens.filter(
    (rt) => rt.expiresAt > new Date()
  );
  await user.save();
  res.cookie("refreshToken", refreshToken, cookieOptions);
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    const accessToken = signAccessToken(user._id);
    await issueRefreshToken(user, res);

    return res.status(201).json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during signup" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      // Same message for both cases: don't reveal which part was wrong
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = signAccessToken(user._id);
    await issueRefreshToken(user, res);

    return res.json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Refresh token invalid or expired" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    const tokenHash = hashToken(token);
    const storedEntry = user.refreshTokens.find(
      (rt) => rt.tokenHash === tokenHash
    );

    if (!storedEntry) {
      // Token not in the allow-list: either it was already used/rotated,
      // or logged out, or this is a replayed/stolen token.
      // Defensive move: revoke all sessions for this user.
      user.refreshTokens = [];
      await user.save();
      res.clearCookie("refreshToken", { path: "/api/auth" });
      return res.status(403).json({ message: "Refresh token reuse detected, please log in again" });
    }

    // Rotate: remove the used token, issue a brand new one
    user.refreshTokens = user.refreshTokens.filter(
      (rt) => rt.tokenHash !== tokenHash
    );
    await user.save();

    const accessToken = signAccessToken(user._id);
    await issueRefreshToken(user, res);

    return res.json({ accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during refresh" });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const tokenHash = hashToken(token);
      await User.updateOne(
        { "refreshTokens.tokenHash": tokenHash },
        { $pull: { refreshTokens: { tokenHash } } }
      );
    }
    res.clearCookie("refreshToken", { path: "/api/auth" });
    return res.json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during logout" });
  }
};

export const me = async (req, res) => {
  const user = await User.findById(req.userId).select("-password -refreshTokens");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
};
