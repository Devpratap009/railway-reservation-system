import User from "../models/User.js";
import { verifyToken } from "../utils/token.js";

export const protect = async (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  try {
    const claims = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(claims.sub).select("_id name email role");

    if (!user) {
      return res.status(401).json({ message: "Your account is no longer available. Please log in again." });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Your session is invalid or has expired. Please log in again." });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission to access this resource." });
  }
  next();
};
