import { Server } from "socket.io";

let io;

export const initializeSocket = (httpServer) => {
  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
    : "*";

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`Realtime client connected: ${socket.id}`);
    socket.on("disconnect", () => {
      console.log(`Realtime client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const emitTrainAvailability = (train) => {
  if (!io || !train) return;

  io.emit("train:availability", {
    trainId: train.trainId,
    availableSeats: train.availableSeats,
    totalSeats: train.totalSeats,
    updatedAt: new Date().toISOString(),
  });
};

export const emitTrainCreated = (train) => {
  if (!io || !train) return;

  io.emit("train:created", {
    _id: train._id,
    trainId: train.trainId,
    name: train.name,
    source: train.source,
    destination: train.destination,
    totalSeats: train.totalSeats,
    availableSeats: train.availableSeats,
  });
};
