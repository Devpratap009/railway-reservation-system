import { useEffect, useState } from "react";
import { trainAPI } from "../api/axios";
import TrainList from "../components/TrainList";

export default function HomePage() {
  const [trains, setTrains] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrains = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await trainAPI.getAll(filters);
      setTrains(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch trains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadInitialTrains = async () => {
      try {
        const res = await trainAPI.getAll();
        if (active) {
          setTrains(res.data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Failed to fetch trains");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInitialTrains();

    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrains({ source, destination });
  };

  const handleReset = () => {
    setSource("");
    setDestination("");
    fetchTrains();
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Trains & Seat Availability</h1>
          <p className="subtitle">Check routes and live seat counts before booking.</p>
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => fetchTrains({ source, destination })}
        >
          Refresh
        </button>
      </div>

      <form onSubmit={handleSearch} className="filter-bar card">
        <input
          type="text"
          placeholder="Source (e.g., Delhi)"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <input
          type="text"
          placeholder="Destination (e.g., Mumbai)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <button type="submit" className="btn primary">
          Filter
        </button>
        <button type="button" className="btn" onClick={handleReset}>
          Clear
        </button>
      </form>

      <TrainList trains={trains} loading={loading} error={error} />
    </section>
  );
}