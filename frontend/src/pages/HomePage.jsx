import { useEffect, useState } from "react";
import { trainAPI } from "../api/axios";
import { getSocket } from "../realtime/socket";
import TrainList from "../components/TrainList";

export default function HomePage({ refreshKey = 0 }) {
  const [trains, setTrains] = useState([]);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveConnected, setLiveConnected] = useState(false);

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
        if (active) setLoading(false);
      }
    };

    loadInitialTrains();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    const socket = getSocket();

    const syncTrainsAfterReconnect = async () => {
      try {
        const res = await trainAPI.getAll({ source, destination });
        setTrains(res.data);
        setError(null);
      } catch {
        // Keep the last known train list if a reconnect sync cannot reach the API.
      }
    };

    const handleConnect = () => {
      setLiveConnected(true);
      syncTrainsAfterReconnect();
    };

    const handleDisconnect = () => setLiveConnected(false);

    const handleAvailabilityUpdate = (update) => {
      setTrains((currentTrains) =>
        currentTrains.map((train) =>
          Number(train.trainId) === Number(update.trainId)
            ? {
                ...train,
                availableSeats: update.availableSeats,
                totalSeats: update.totalSeats ?? train.totalSeats,
              }
            : train
        )
      );
    };

    const handleTrainCreated = (newTrain) => {
      const matchesSource = !source.trim() ||
        newTrain.source.toLowerCase().includes(source.trim().toLowerCase());
      const matchesDestination = !destination.trim() ||
        newTrain.destination.toLowerCase().includes(destination.trim().toLowerCase());

      if (!matchesSource || !matchesDestination) return;

      setTrains((currentTrains) => {
        if (currentTrains.some((train) => Number(train.trainId) === Number(newTrain.trainId))) {
          return currentTrains;
        }
        return [...currentTrains, newTrain].sort((a, b) => a.trainId - b.trainId);
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("train:availability", handleAvailabilityUpdate);
    socket.on("train:created", handleTrainCreated);

    if (socket.connected) {
      setLiveConnected(true);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("train:availability", handleAvailabilityUpdate);
      socket.off("train:created", handleTrainCreated);
    };
  }, [source, destination]);

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
        <div className="page-header-actions">
          <span
            className={`live-status ${liveConnected ? "is-connected" : "is-connecting"}`}
            role="status"
            aria-live="polite"
          >
            <span className="live-status-dot" />
            {liveConnected ? "LIVE UPDATES ON" : "CONNECTING LIVE"}
          </span>
          <button
            type="button"
            className="btn"
            onClick={() => fetchTrains({ source, destination })}
          >
            Refresh
          </button>
        </div>
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
