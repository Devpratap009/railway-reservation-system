import { createServer } from "node:http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { initializeSocket } from "./config/socket.js";
import authRoutes from "./routes/authRoutes.js";
import trainRoutes from "./routes/trainRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import { ensureAdminUser } from "./utils/seedAdmin.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Railway Reservation API is running with realtime seat updates...");
});

app.use("/api/auth", authRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/tickets", ticketRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set in backend/.env and contain at least 32 characters.");
  }

  await connectDB();
  await ensureAdminUser();
  initializeSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Realtime seat availability is enabled.");
  });
}

startServer().catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
});
