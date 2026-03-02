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
  const isAuthenticated = useSelector((state) => state.auth.isAdminAuthenticated);

  const [complaints, setComplaints] = useState([]);
  const [importantComplaints, setImportantComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadComplaints(),
        loadImportantComplaints(),
      ]);
      setLoading(false);
    };
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, apiBase]);

  const loadComplaints = async () => {
    try {
      const res = await fetch(`${apiBase}/complaint/api/complaintsRES`, {
        credentials: 'include'
      });
      const data = await res.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setComplaints([]);
    }
  };

  const loadImportantComplaints = async () => {
    try {
      const res = await fetch(`${apiBase}/complaint/api/complaintsIMP`, {
        credentials: 'include'
      });
      const data = await res.json();
      setImportantComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setImportantComplaints([]);
    }
  };

  const resolveComplaint = async (id) => {
    const confirmed = window.confirm("Mark this complaint as resolved?");
    if (!confirmed) return;
    try {
      const res = await fetch(`${apiBase}/complaint/api/complaints/resolve/${id}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to resolve complaint");
      }
      await loadImportantComplaints();
      await loadComplaints();
      alert("Complaint resolved successfully");
    } catch (err) {
      alert(`Resolve failed: ${err.message}`);
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
            <p id="welcome" className="muted-text">
              Welcome back, Admin!
            </p>
          </div>
          <div
            className="dashboard-actions"
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <button className="btn btn-ghost" onClick={toggleTheme} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
              {theme === "light" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              )}
            </button>
            <Link className="btn btn-ghost" to="/">
              Home
            </Link>
            <Link className="btn btn-tonal" to="/staff_register">
              Register Staff
            </Link>
            <button className="btn btn-tonal" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <div className="divider"></div>

        <h2 className="card-section-title">Control Centre</h2>
        <p>Manage railway operations and keep every passenger interaction on track.</p>

        <div className="link-grid">
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
            <span>see all emergencies</span>
          </Link>
          <Link className="link-tile" to="/dashboard">
            <strong>Operations Dashboard</strong>
            <span>Track stock, reports, and advanced analytics</span>
          </Link>
          <Link className="link-tile" to="/admin-analytics">
            <strong>Analytics Dashboard</strong>
            <span>Charts, graphs, revenue trends &amp; advanced analytics</span>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
