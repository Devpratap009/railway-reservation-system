import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://railway-reservation-system-1-3ywh.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

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