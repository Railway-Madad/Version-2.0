import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { clearSuperAdminToken } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";

const SuperAdminDashboard = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [trains, setTrains] = useState([]);
  const [loadingTrains, setLoadingTrains] = useState(true);

  useEffect(() => {
    const loadTrains = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/trains`);
        if (res.data.success) {
          setTrains(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching trains:", err);
      } finally {
        setLoadingTrains(false);
      }
    };
    loadTrains();
  }, [apiBase]);

  const logout = async () => {
    try {
      await axios.post(`${apiBase}/admin/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
    dispatch(clearSuperAdminToken());
    navigate("/admin-select");
  };

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Super Admin Dashboard</h1>
            <p className="muted-text">System-wide control — view analytics across all trains</p>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={toggleTheme} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
              {theme === "light" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              )}
            </button>
            <Link className="btn btn-ghost" to="/">Home</Link>
            <button className="btn btn-tonal" onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="divider"></div>

        <h2 className="card-section-title">Control Centre</h2>
        <p>View system-wide performance across all trains.</p>

        <div className="link-grid">
          <Link className="link-tile" to="/superadmin-analytics">
            <strong>System-Wide Analytics</strong>
            <span>Orders, revenue, complaints, feedback — all trains combined</span>
          </Link>
        </div>
      </section>

      <section className="surface-card" style={{ marginTop: "1.5rem" }}>
        <h2 className="card-section-title">Registered Trains</h2>
        {loadingTrains ? (
          <p className="muted-text">Loading trains…</p>
        ) : trains.length === 0 ? (
          <p className="muted-text">No trains registered yet.</p>
        ) : (
          <div className="an-kpi-grid" style={{ marginTop: "1rem" }}>
            {trains.map((t) => (
              <div key={t.id} className="an-kpi">
                <span className="an-kpi-val">{t.trainNumber}</span>
                <span className="an-kpi-lbl">Train</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default SuperAdminDashboard;
