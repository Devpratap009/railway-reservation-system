import { useState } from "react";
import { trainAPI } from "../api/axios";

export default function AddTrainForm({ onTrainAdded }) {
  const [form, setForm] = useState({
    name: "",
    source: "",
    destination: "",
    totalSeats: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const res = await trainAPI.add({
        name: form.name,
        source: form.source,
        destination: form.destination,
        totalSeats: Number(form.totalSeats),
      });
      setMessage(`Train "${res.data.name}" added (Train ID: #${res.data.trainId}).`);
      setForm({ name: "", source: "", destination: "", totalSeats: "" });
      if (onTrainAdded) onTrainAdded(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add train");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card form-grid">
      <h2>Add New Train</h2>

      <label>
        Train Name
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g., Rajdhani Express"
          required
        />
      </label>

      <label>
        Source Station
        <input
          type="text"
          name="source"
          value={form.source}
          onChange={handleChange}
          placeholder="e.g., Delhi"
          required
        />
      </label>

      <label>
        Destination Station
        <input
          type="text"
          name="destination"
          value={form.destination}
          onChange={handleChange}
          placeholder="e.g., Mumbai"
          required
        />
      </label>

      <label>
        Total Seats
        <input
          type="number"
          name="totalSeats"
          min="1"
          value={form.totalSeats}
          onChange={handleChange}
          placeholder="e.g., 100"
          required
        />
      </label>

      <button type="submit" className="btn primary" disabled={submitting}>
        {submitting ? "Adding..." : "Add Train"}
      </button>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </form>
  );
}