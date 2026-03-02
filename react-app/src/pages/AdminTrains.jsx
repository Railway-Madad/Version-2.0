import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";

const AdminTrains = () => {
  const { apiBase } = useApi();

  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTrainNo, setNewTrainNo] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const fetchTrains = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/trains`);
      const data = await res.json();
      if (data.success) setTrains(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchTrains();
  }, [fetchTrains]);

  const addTrain = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!newTrainNo.trim()) {
      setMessage("Train number is required");
      setIsError(true);
      return;
    }
    try {
      const res = await fetch(`${apiBase}/admin/trains`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainNumber: newTrainNo.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Train added successfully!");
        setIsError(false);
        setNewTrainNo("");
        fetchTrains();
      } else {
        setMessage(data.message || "Failed to add train");
        setIsError(true);
      }
    } catch (err) {
      setMessage("Error adding train");
      setIsError(true);
    }
  };

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Train Management</h1>
            <p className="muted-text">{trains.length} trains in the system</p>
          </div>
          <Link className="btn btn-ghost" to="/admindashboard">Back</Link>
        </div>
        <div className="divider"></div>

        {/* Add train form */}
        <form onSubmit={addTrain} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <div className="input-group" style={{ flex: 1, minWidth: "200px" }}>
            <label htmlFor="newTrain">New Train Number</label>
            <input
              id="newTrain"
              type="text"
              placeholder="e.g. 12156"
              value={newTrainNo}
              onChange={(e) => setNewTrainNo(e.target.value)}
            />
          </div>
          <button className="btn" type="submit">Add Train</button>
        </form>
        {message && (
          <p style={{ color: isError ? "#f44336" : "#4caf50", marginBottom: "1rem" }}>{message}</p>
        )}

        {loading ? (
          <p>Loading…</p>
        ) : trains.length === 0 ? (
          <p className="muted-text">No trains in the system yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Train Number</th>
                </tr>
              </thead>
              <tbody>
                {trains.map((t, i) => (
                  <tr key={t.id}>
                    <td>{i + 1}</td>
                    <td>{t.trainNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminTrains;
