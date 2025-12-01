import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";

const EmergencyAdmin = () => {
  const { apiBase } = useApi();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmergencies = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/emergency/getEmg`);
        const data = await res.json();
        setEmergencies(Array.isArray(data) ? data : []);
      } catch (err) {
        setEmergencies([]);
      } finally {
        setLoading(false);
      }
    };
    loadEmergencies();
  }, [apiBase]);

  return (
    <main className="page-shell fade-in">
      <section className="surface-card">
        <div className="page-header">
          <div>
            <h1>Emergency Console</h1>
            <p className="muted-text">
              View all active train emergencies reported by passengers.
            </p>
          </div>
          <Link className="btn btn-tonal" to="/admindashboard">
            Back to Dashboard
          </Link>
        </div>
        <div id="emergency-container" className="content-grid two-column">
          {loading ? (
            <p className="muted-text">Loading emergencies...</p>
          ) : emergencies.length === 0 ? (
            <p className="muted-text">No emergencies reported yet.</p>
          ) : (
            emergencies.map((emg) => (
              <article className="news-card" key={emg._id}>
                <div className="news-card__body">
                  <h3>
                    {emg.username} (User ID: {emg.userId})
                  </h3>
                  <p>Train Number: {emg.trainNumber}</p>
                  <p>Seat Number: {emg.seatNumber}</p>
                  <p>
                    Status: <strong>{emg.status}</strong>
                  </p>
                  <time>
                    Reported on{" "}
                    {emg.createdAt ? new Date(emg.createdAt).toLocaleString() : ""}
                  </time>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default EmergencyAdmin;
