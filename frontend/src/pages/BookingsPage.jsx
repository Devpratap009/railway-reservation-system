import { Link } from "react-router-dom";
import BookingsList from "../components/BookingsList";

export default function BookingsPage({
  bookings,
  loading,
  error,
  onCancel,
  onRefresh,
}) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Bookings</h1>
          <p className="subtitle">
            View all booked tickets, check their status, or cancel to release seats.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.65rem" }}>
          <button type="button" className="btn" onClick={onRefresh}>
            Refresh
          </button>
          <Link to="/book" className="btn primary">
            + Book Another Ticket
          </Link>
        </div>
      </div>

      <BookingsList
        bookings={bookings}
        loading={loading}
        error={error}
        onCancel={onCancel}
      />
    </div>
  );
}