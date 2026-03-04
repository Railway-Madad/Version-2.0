import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { clearAdminToken } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";

const AdminDashboard = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const adminTrainNo = useSelector((state) => state.auth.adminTrainNo);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [apiBase, adminTrainNo]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const url = adminTrainNo 
        ? `${apiBase}/admin/train-statistics?trainNo=${adminTrainNo}`
        : `${apiBase}/admin/train-statistics`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${apiBase}/admin/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    dispatch(clearAdminToken());
    navigate("/adminlogin");
  };

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Administrator Dashboard</h1>
            <p className="muted-text">
              Train: <strong>{adminTrainNo || stats?.trainNo || "—"}</strong>
            </p>
          </div>
          <div className="dashboard-actions" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={toggleTheme} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
              {theme === "light" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              )}
            </button>
            <Link className="btn btn-ghost" to="/">Home</Link>
            <Link className="btn btn-tonal" to="/adminregister">Register Admin</Link>
            <Link className="btn btn-tonal" to="/staff_register">Register Staff</Link>
            <button className="btn btn-tonal" onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="divider"></div>

        {/* Stats Cards */}
        {loading ? (
          <p className="muted-text">Loading dashboard…</p>
        ) : stats ? (
          <>
            {/* Main Overview Stats */}
            <div className="link-grid" style={{ marginBottom: "2rem" }}>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#2196F3" }}>{stats.users || 0}</strong>
                <span>Users on Train</span>
              </div>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#FF9800" }}>{stats.staff || 0}</strong>
                <span>Staff Members</span>
              </div>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#F44336" }}>{stats.complaints.pending || 0}</strong>
                <span>Pending Complaints</span>
              </div>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#4CAF50" }}>{stats.complaints.resolved || 0}</strong>
                <span>Resolved Complaints</span>
              </div>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#FF5722" }}>{stats.complaints.total || 0}</strong>
                <span>Total Complaints</span>
              </div>
            </div>

            {/* Food Orders Stats */}
            <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Orders Overview</h3>
            <div className="link-grid" style={{ marginBottom: "2rem" }}>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#2196F3" }}>{stats.orders.total || 0}</strong>
                <span>Total Orders</span>
              </div>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#FF9800" }}>{stats.orders.pending || 0}</strong>
                <span>Pending Orders</span>
              </div>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#4CAF50" }}>{stats.orders.delivered || 0}</strong>
                <span>Delivered Orders</span>
              </div>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#9C27B0" }}>{stats.orders.cancelled || 0}</strong>
                <span>Cancelled Orders</span>
              </div>
            </div>

            {/* Emergencies Stats */}
            <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Emergencies & Safety</h3>
            <div className="link-grid" style={{ marginBottom: "2rem" }}>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#F44336" }}>{stats.emergencies.total || 0}</strong>
                <span>Total Emergencies</span>
              </div>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#FF9800" }}>{stats.emergencies.pending || 0}</strong>
                <span>Pending Response</span>
              </div>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#4CAF50" }}>{stats.emergencies.responded || 0}</strong>
                <span>Responded</span>
              </div>
            </div>

            {/* Lost & Found Stats */}
            <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Lost & Found</h3>
            <div className="link-grid" style={{ marginBottom: "2rem" }}>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#2196F3" }}>{stats.lostNFound.total || 0}</strong>
                <span>Total Cases</span>
              </div>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#FF9800" }}>{stats.lostNFound.lost || 0}</strong>
                <span>Lost Items</span>
              </div>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#4CAF50" }}>{stats.lostNFound.found || 0}</strong>
                <span>Found Items</span>
              </div>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#673AB7" }}>{stats.lostNFound.claimed || 0}</strong>
                <span>Claimed</span>
              </div>
            </div>

            {/* Feedback Stats */}
            <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Passenger Feedback</h3>
            <div className="link-grid" style={{ marginBottom: "2rem" }}>
              <div className="link-tile" style={{ cursor: "default" }}>
                <strong style={{ fontSize: "2rem", color: "#2196F3" }}>{stats.feedback || 0}</strong>
                <span>Total Feedback Received</span>
              </div>
            </div>
          </>
        ) : null}

        <h2 className="card-section-title">Control Centre</h2>
        <p>Manage all operations for your train from one place.</p>

        <div className="link-grid">
          <Link className="link-tile" to="/admin-staff">
            <strong>Staff Management</strong>
            <span>View, edit & send commands to staff on your train</span>
          </Link>
          <Link className="link-tile" to="/admin-complaints">
            <strong>Train Complaints</strong>
            <span>View and resolve complaints for your train</span>
          </Link>
          <Link className="link-tile" to="/admin-orders">
            <strong>Catering Orders</strong>
            <span>Track all food orders on your train</span>
          </Link>
          <Link className="link-tile" to="/admin-trains">
            <strong>Train Management</strong>
            <span>Add new train numbers to the system</span>
          </Link>
          <Link className="link-tile" to="/foodadmin">
            <strong>Food Menu Management</strong>
            <span>Update offerings, track orders, and analyse performance</span>
          </Link>
          <Link className="link-tile" to="/admin-news">
            <strong>Publish News &amp; Alerts</strong>
            <span>Share critical updates with passengers instantly</span>
          </Link>
          <Link className="link-tile" to="/adminfeedback">
            <strong>Review Feedback</strong>
            <span>Monitor comments and close the loop with teams</span>
          </Link>
          <Link className="link-tile" to="/emergency-admin">
            <strong>Emergency Management</strong>
            <span>See all emergencies</span>
          </Link>
          <Link className="link-tile" to="/dashboard">
            <strong>Operations Dashboard</strong>
            <span>Track stock, reports, and advanced analytics</span>
          </Link>
          <Link className="link-tile" to="/train-admin-analytics">
            <strong>Analytics Dashboard</strong>
            <span>60+ real-time analytics — orders, complaints, food, users, emergencies &amp; more</span>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
