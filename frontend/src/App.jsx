import { useCallback, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import BookTicketPage from "./pages/BookTicketPage";
import BookingsPage from "./pages/BookingsPage";
import AdminPage from "./pages/AdminPage";

const API_BASE = "http://localhost:5000/api";

export default function App() {
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [refreshTrainsKey, setRefreshTrainsKey] = useState(0);

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    setBookingsError("");
    try {
      const res = await fetch(`${API_BASE}/tickets`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load bookings");
      }
      setBookings(Array.isArray(data) ? data : data.tickets || []);
    } catch (err) {
      setBookingsError(err.message || "Error loading bookings");
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadInitialBookings = async () => {
      try {
        const res = await fetch(`${API_BASE}/tickets`);
        const data = await res.json();
        if (!active) return;
        if (!res.ok) {
          throw new Error(data.message || "Failed to load bookings");
        }
        setBookings(Array.isArray(data) ? data : data.tickets || []);
        setBookingsError("");
      } catch (err) {
        if (active) {
          setBookingsError(err.message || "Error loading bookings");
        }
      } finally {
        if (active) {
          setLoadingBookings(false);
        }
      }
    };

    loadInitialBookings();

    return () => {
      active = false;
    };
  }, []);

  const handleBooked = useCallback(async () => {
    setRefreshTrainsKey((prev) => prev + 1);
    await fetchBookings();
  }, [fetchBookings]);

  const handleCancelTicket = useCallback(
    async (ticketId) => {
      try {
        const res = await fetch(`${API_BASE}/tickets/${ticketId}/cancel`, {
          method: "PATCH",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to cancel ticket");
        }
        setRefreshTrainsKey((prev) => prev + 1);
        await fetchBookings();
      } catch (err) {
        setBookingsError(err.message || "Could not cancel ticket");
      }
    },
    [fetchBookings]
  );

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage refreshKey={refreshTrainsKey} />} />
          <Route path="/book" element={<BookTicketPage onBooked={handleBooked} />} />
          <Route
            path="/bookings"
            element={
              <BookingsPage
                bookings={bookings}
                loading={loadingBookings}
                error={bookingsError}
                onCancel={handleCancelTicket}
                onRefresh={fetchBookings}
              />
            }
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<HomePage refreshKey={refreshTrainsKey} />} />
        </Routes>
      </main>
    </>
  );
}