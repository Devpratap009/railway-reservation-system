export default function BookingsList({ bookings, loading, error, onCancel }) {
  if (loading) {
    return (
      <div className="card">
        <p className="subtitle">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!bookings?.length) {
    return (
      <div
        className="card"
        style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}
      >
        <h3>No bookings yet</h3>
        <p className="subtitle">
          Head over to Book Ticket to reserve seats on a train.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Train</th>
            <th>Passengers</th>
            <th>Seats</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((ticket) => {
            const status = (ticket.status || "BOOKED").toUpperCase();
            const isCancelled = status === "CANCELLED";
            const passengers =
              Array.isArray(ticket.passengerNames) && ticket.passengerNames.length
                ? ticket.passengerNames.join(", ")
                : ticket.passengerName || "—";

            return (
              <tr key={ticket._id || ticket.ticketId}>
                <td>
                  <span className="train-id-pill">
                    #{ticket.ticketId ?? ticket._id}
                  </span>
                </td>
                <td>
                  <strong>
                    {ticket.train?.name || `Train #${ticket.trainId}`}
                  </strong>
                  {ticket.train?.source && ticket.train?.destination && (
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {ticket.train.source} → {ticket.train.destination}
                    </div>
                  )}
                </td>
                <td>{passengers}</td>
                <td>
                  <strong>{ticket.seatsBooked}</strong>
                </td>
                <td>
                  <span
                    className={`badge ${isCancelled ? "cancelled" : "booked"}`}
                  >
                    {status}
                  </span>
                </td>
                <td>
                  {isCancelled ? (
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                      }}
                    >
                      Cancelled
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn danger"
                      onClick={() => onCancel(ticket.ticketId)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}