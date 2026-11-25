import User from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { createToken } from "../utils/token.js";

const publicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
});

// @route POST /api/auth/register
// Public registration always creates a regular user. Admin accounts are provisioned
// from the backend environment and cannot be created through this endpoint.
export const registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ message: "Please enter a name between 2 and 80 characters." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Password must be between 8 and 128 characters." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name,
      email,
      password: await hashPassword(password),
      role: "user",
    });

    return res.status(201).json({
      message: "Your account has been created. You can now log in.",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    return res.status(500).json({ message: "Unable to create your account right now." });
  }
};

// @route POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const requestedRole = req.body.role;

    if (!["user", "admin"].includes(requestedRole)) {
      return res.status(400).json({ message: "Choose a valid login portal." });
    }

    const user = await User.findOne({ email }).select("+password");
    const passwordMatches = user
      ? await verifyPassword(password, user.password)
      : false;

    if (!user || !passwordMatches || user.role !== requestedRole) {
      return res.status(401).json({ message: "Invalid email or password for this login portal." });
    }

    const token = createToken(user, process.env.JWT_SECRET);
    return res.status(200).json({
      message: "Login successful.",
      token,
      user: publicUser(user),
    });
  } catch {
    return res.status(500).json({ message: "Unable to log in right now. Please try again." });
  }
};

// @route GET /api/auth/me
export const getCurrentUser = (req, res) => {
  res.status(200).json({ user: publicUser(req.user) });
};
