import { io } from "socket.io-client";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  "https://railway-reservation-system-1-3ywh.onrender.com/api";

const defaultSocketUrl = apiBaseUrl.replace(/\/api\/?$/, "");
const socketUrl = import.meta.env.VITE_SOCKET_URL || defaultSocketUrl;

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });
  }

  return socket;
};
