import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://railway-reservation-system-1-3ywh.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("railpulse_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

export const trainAPI = {
  getAll: (params = {}) => api.get("/trains", { params }),
  add: (data) => api.post("/trains", data),
  checkAvailability: (trainId) => api.get(`/trains/${trainId}/availability`),
};

export const ticketAPI = {
  getAll: () => api.get("/tickets"),
  book: (data) => api.post("/tickets/book", data),
  cancel: (ticketId) => api.patch(`/tickets/${ticketId}/cancel`),
};

export default api;
