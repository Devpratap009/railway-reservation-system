import { Link } from "react-router-dom";
import BookingsList from "../components/BookingsList";

export default function BookingsPage({
  bookings,
  loading,
  error,
  onCancel,
  onRefresh,
  isAdmin = false,
}) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{isAdmin ? "All Passenger Bookings" : "My Bookings"}</h1>
          <p className="subtitle">
            {isAdmin
              ? "Review passenger reservations and manage ticket status."
              : "View your reserved tickets, check their status, or cancel a booking."}
          </p>
        </div>

        <div className="booking-actions">
          <button type="button" className="btn" onClick={onRefresh}>
            Refresh
          </button>
          {!isAdmin && (
            <Link to="/book" className="btn primary">
              + Book Another Ticket
            </Link>
          )}
        </div>
      </div>

      <BookingsList
        bookings={bookings}
        loading={loading}
        error={error}
        onCancel={onCancel}
        isAdmin={isAdmin}
      />
    </div>
  );
}
