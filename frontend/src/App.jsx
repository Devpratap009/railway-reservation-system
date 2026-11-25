import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import BookTicketPage from "./pages/BookTicketPage";
import BookingsPage from "./pages/BookingsPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useAuth } from "./context/authContext";
import { ticketAPI } from "./api/axios";

function App() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [bookingsOwnerId, setBookingsOwnerId] = useState("");
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [refreshTrainsKey, setRefreshTrainsKey] = useState(0);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoadingBookings(true);
    setBookingsError("");
    try {
      const res = await ticketAPI.getAll();
      setBookings(Array.isArray(res.data) ? res.data : res.data.tickets || []);
      setBookingsOwnerId(user.id);
    } catch (err) {
      setBookingsError(err.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoadingBookings(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;

    let active = true;
    ticketAPI.getAll()
      .then((res) => {
        if (active) {
          setBookings(Array.isArray(res.data) ? res.data : res.data.tickets || []);
          setBookingsOwnerId(user.id);
          setBookingsError("");
        }
      })
      .catch((err) => {
        if (active) {
          setBookingsError(err.response?.data?.message || "Failed to load bookings.");
        }
      })
      .finally(() => {
        if (active) setLoadingBookings(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleBooked = useCallback(async () => {
    setRefreshTrainsKey((current) => current + 1);
    await fetchBookings();
  }, [fetchBookings]);

  const handleCancelTicket = useCallback(async (ticketId) => {
    try {
      await ticketAPI.cancel(ticketId);
      setRefreshTrainsKey((current) => current + 1);
      await fetchBookings();
    } catch (err) {
      setBookingsError(err.response?.data?.message || "Could not cancel this ticket.");
    }
  }, [fetchBookings]);

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage refreshKey={refreshTrainsKey} />} />
          <Route
            path="/book"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <BookTicketPage onBooked={handleBooked} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]}>
                <BookingsPage
                  bookings={bookingsOwnerId === user?.id ? bookings : []}
                  loading={loadingBookings}
                  error={bookingsOwnerId === user?.id ? bookingsError : ""}
                  onCancel={handleCancelTicket}
                  onRefresh={fetchBookings}
                  isAdmin={user?.role === "admin"}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login/user" element={<LoginPage role="user" />} />
          <Route path="/login/admin" element={<LoginPage role="admin" />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<Navigate to="/login/user" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
