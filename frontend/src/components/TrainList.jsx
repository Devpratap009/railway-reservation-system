import { Link } from "react-router-dom";

export default function TrainList({ trains, loading, error }) {
  if (loading) {
    return (
      <div className="train-grid">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="card" style={{ height: "210px", opacity: 0.5 }}>
            <p className="subtitle">Loading route #{n}...</p>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <p className="error">{error}</p>;
  if (!trains.length) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
        <h3>No trains matched your route</h3>
        <p className="subtitle">Try clearing the source/destination filters to view all active trains.</p>
      </div>
    );
  }

  return (
    <div className="train-grid">
      {trains.map((train) => {
        const seatPercent = train.totalSeats
          ? Math.round((train.availableSeats / train.totalSeats) * 100)
          : 0;
        const isLow = seatPercent <= 25;
        const isSoldOut = train.availableSeats === 0;

        return (
          <div key={train._id || train.trainId} className="card train-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="train-id-pill">#{train.trainId}</span>
              <span className={`badge ${isSoldOut ? "cancelled" : "booked"}`}>
                {isSoldOut ? "SOLD OUT" : `${train.availableSeats} SEATS OPEN`}
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{train.name}</h3>
            </div>

            <div className="route-track">
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  From
                </div>
                <strong>{train.source}</strong>
              </div>

              <div className="route-line" />

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  To
                </div>
                <strong>{train.destination}</strong>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.84rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Seat Availability</span>
                <strong>
                  {train.availableSeats} / {train.totalSeats} ({seatPercent}%)
                </strong>
              </div>
              <div className="seat-bar-bg">
                <div
                  className={`seat-bar-fill ${isLow ? "low" : ""}`}
                  style={{ width: `${seatPercent}%` }}
                />
              </div>
            </div>

            <Link
              to={`/book?trainId=${train.trainId}`}
              className={`btn ${isSoldOut ? "" : "primary"}`}
              style={isSoldOut ? { pointerEvents: "none", opacity: 0.45 } : undefined}
            >
              {isSoldOut ? "Unavailable" : "Book Seats →"}
            </Link>
          </div>
        );
      })}
    </div>
  );
}