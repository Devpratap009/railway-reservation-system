import User from "../models/User.js";
import { hashPassword } from "./password.js";

export async function ensureAdminUser() {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD are not set. Configure them to enable the admin login.");
    return;
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
  }

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin && existingAdmin.role !== "admin") {
    throw new Error("ADMIN_EMAIL belongs to a regular user. Set a different email for the admin account.");
  }

  const passwordHash = await hashPassword(password);
  if (existingAdmin) {
    existingAdmin.name = "RailPulse Administrator";
    existingAdmin.password = passwordHash;
    await existingAdmin.save();
    console.log(`Admin account configured: ${email}`);
    return;
  }

  await User.create({
    name: "RailPulse Administrator",
    email,
    password: passwordHash,
    role: "admin",
  });
  console.log(`Admin account created: ${email}`);
}
