import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";

const AdminFeedback = () => {
  const { apiBase } = useApi();
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const res = await fetch(`${apiBase}/feedback/stats`);
      if (res.status === 401) {
        window.location.href = "/adminlogin";
        return;
      }
      const data = await res.json();
      setStats(data.stats || data);
    };
    const loadFeedbacks = async () => {
      try {
        const res = await fetch(`${apiBase}/feedback`);
        if (res.status === 401) {
          window.location.href = "/adminlogin";
          return;
        }
        const data = await res.json();
        setFeedbacks(data.data || []);
      } catch (err) {
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
    loadFeedbacks();
  }, [apiBase]);

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Feedback Intelligence</h1>
            <p className="muted-text">
              Track sentiment across journeys and identify areas that need attention.
            </p>
          </div>
          <Link className="btn btn-tonal" to="/admindashboard">
            Back to Dashboard
          </Link>
        </div>

        <div id="stats" className="content-grid two-column">
          {stats ? (
            <>
              <article className="link-tile">
                <span className="badge">Overview</span>
                <strong>Total Feedbacks</strong>
                <p>{stats.totalFeedbacks}</p>
              </article>
              <article className="link-tile">
                <span className="badge">Satisfaction</span>
                <strong>Average Rating</strong>
                <p>
                  {stats.averageRating} &#9733;
                </p>
              </article>
            </>
          ) : (
            <p className="muted-text">Loading stats...</p>
          )}
        </div>
      </section>

      <section className="surface-card">
        <div className="page-header">
          <div>
            <h2>Latest Feedback</h2>
            <p className="muted-text">
              Every submission includes the passenger's comments and rating.
            </p>
          </div>
        </div>
        <div id="feedbacks" className="stack">
          {loading ? (
            <p className="muted-text">Loading feedback...</p>
          ) : feedbacks.length === 0 ? (
            <p className="muted-text">No feedback received yet.</p>
          ) : (
            feedbacks.map((fb) => (
              <article className="list-card-item" key={fb._id}>
                <div className="actions-inline" style={{ justifyContent: "space-between" }}>
                  <div>
                    <h3>
                      {fb.name} <span className="muted-text">({fb.email})</span>
                    </h3>
                  </div>
                  <span className="badge-accent">Rating: {fb.rating} &#9733;</span>
                </div>
                <p>{fb.comment}</p>
                <p className="muted-text">
                  {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ""}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default AdminFeedback;
