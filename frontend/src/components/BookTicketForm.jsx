import { useEffect, useState } from "react";
import { ticketAPI, trainAPI } from "../api/axios";

export default function BookTicketForm({ initialTrainId = "", onBooked }) {
  const [trains, setTrains] = useState([]);
  const [trainId, setTrainId] = useState(String(initialTrainId));
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [passengerNames, setPassengerNames] = useState([""]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadTrains = async () => {
    try {
      const res = await trainAPI.getAll();
      setTrains(res.data);
      if (!initialTrainId && res.data.length > 0 && !trainId) {
        setTrainId(String(res.data[0].trainId));
      }
    } catch {
      setError("Could not load trains");
    }
  };

  useEffect(() => {
    let active = true;

    const fetchInitialTrains = async () => {
      try {
        const res = await trainAPI.getAll();
        if (active) {
          setTrains(res.data);
          if (!initialTrainId && res.data.length > 0) {
            setTrainId((prev) => prev || String(res.data[0].trainId));
          }
        }
      } catch {
        if (active) {
          setError("Could not load trains");
        }
      }
    };

    fetchInitialTrains();

    return () => {
      active = false;
    };
  }, [initialTrainId]);

  const handleSeatCountChange = (e) => {
    const count = Math.max(1, Number(e.target.value) || 1);
    setSeatsToBook(count);
    setPassengerNames((prev) => {
      if (prev.length === count) return prev;
      if (prev.length < count) {
        return [...prev, ...Array(count - prev.length).fill("")];
      }
      return prev.slice(0, count);
    });
  };

  const handlePassengerNameChange = (index, value) => {
    setPassengerNames((prev) =>
      prev.map((name, i) => (i === index ? value : name))
    );
  };

  const selectedTrain = trains.find((t) => String(t.trainId) === String(trainId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const count = Number(seatsToBook);
    const cleanedNames = passengerNames.map((n) => n.trim());

    if (cleanedNames.length !== count || cleanedNames.some((n) => !n)) {
      setError(`Please enter all ${count} passenger name(s) — one per seat.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await ticketAPI.book({
        trainId: Number(trainId),
        passengerNames: cleanedNames,
        seatsToBook: count,
      });
      setMessage(
        `Booked! Ticket ID: #${res.data.ticket.ticketId} for ${cleanedNames.join(", ")} (${count} seat(s)).`
      );
      setSeatsToBook(1);
      setPassengerNames([""]);
      await loadTrains();
      if (onBooked) onBooked(res.data.ticket);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card form-grid">
      <h2>Book Train Ticket</h2>

      <label>
        Select Train
        <select
          value={trainId}
          onChange={(e) => setTrainId(e.target.value)}
          required
        >
          <option value="">-- Choose a train --</option>
          {trains.map((t) => (
            <option key={t._id || t.trainId} value={t.trainId}>
              #{t.trainId} — {t.name} ({t.source} → {t.destination}) | {t.availableSeats} seats left
            </option>
          ))}
        </select>
      </label>

      {selectedTrain && (
        <p className="info-banner">
          Available Seats on <strong>{selectedTrain.name}</strong>:{" "}
          <strong>{selectedTrain.availableSeats}</strong> / {selectedTrain.totalSeats}
        </p>
      )}

      <label>
        Seats to Book
        <input
          type="number"
          min="1"
          max={selectedTrain ? selectedTrain.availableSeats : undefined}
          value={seatsToBook}
          onChange={handleSeatCountChange}
          required
        />
      </label>

      <div className="form-grid">
        {passengerNames.map((name, index) => (
          <label key={index}>
            Passenger {index + 1} Name (Seat {index + 1})
            <input
              type="text"
              value={name}
              onChange={(e) => handlePassengerNameChange(index, e.target.value)}
              placeholder={`Enter name for passenger ${index + 1}`}
              required
            />
          </label>
        ))}
      </div>

      <button
        type="submit"
        className="btn primary"
        disabled={submitting || !trains.length}
      >
        {submitting ? "Booking..." : "Confirm Booking"}
      </button>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
}