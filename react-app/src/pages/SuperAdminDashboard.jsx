import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { clearSuperAdminToken } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";

const SuperAdminDashboard = () => {
  const { apiBase } = useApi();
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [systemStats, setSystemStats] = useState(null);
  const [trainsStats, setTrainsStats] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [complaintAnalysis, setComplaintAnalysis] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadAllData();
  }, [apiBase]);

  const logout = async () => {
    try {
      await axios.post(`${apiBase}/admin/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    dispatch(clearSuperAdminToken());
    navigate("/superadmin-login");
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [sysRes, trainsRes, perfRes, complRes, usersRes, staffRes] = await Promise.all([
        fetch(`${apiBase}/superadmin/stats/system`, { credentials: "include" }),
        fetch(`${apiBase}/superadmin/stats/trains`, { credentials: "include" }),
        fetch(`${apiBase}/superadmin/stats/performance`, { credentials: "include" }),
        fetch(`${apiBase}/superadmin/stats/complaints-analysis`, { credentials: "include" }),
        fetch(`${apiBase}/superadmin/users?limit=100`, { credentials: "include" }),
        fetch(`${apiBase}/superadmin/staff?limit=100`, { credentials: "include" }),
      ]);

      if (sysRes.ok) setSystemStats((await sysRes.json()).data);
      if (trainsRes.ok) setTrainsStats((await trainsRes.json()).data);
      if (perfRes.ok) setPerformanceMetrics((await perfRes.json()).data);
      if (complRes.ok) setComplaintAnalysis((await complRes.json()).data);
      if (usersRes.ok) setAllUsers((await usersRes.json()).data);
      if (staffRes.ok) setAllStaff((await staffRes.json()).data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>SuperAdmin Dashboard</h1>
            <p className="muted-text">System-wide analytics and management</p>
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
            <button className="btn btn-tonal" onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="divider"></div>

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "2px solid #e0e0e0", paddingBottom: "1rem" }}>
          {["overview", "trains", "performance", "complaints", "users", "staff"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: activeTab === tab ? "#2196F3" : "transparent",
                color: activeTab === tab ? "#fff" : "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="muted-text">Loading system data...</p>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && systemStats && (
              <article className="surface-card compact">
                <h3>System Overview</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                  <StatCard label="Total Users" value={systemStats.users} />
                  <StatCard label="Total Staff" value={systemStats.staff} />
                  <StatCard label="Total Trains" value={systemStats.trains} />
                  <StatCard label="Total Complaints" value={systemStats.complaints.total} />
                  <StatCard label="Pending Complaints" value={systemStats.complaints.pending} color="#ff9800" />
                  <StatCard label="Resolved Complaints" value={systemStats.complaints.resolved} color="#4caf50" />
                  <StatCard label="Total Orders" value={systemStats.orders.total} />
                  <StatCard label="Delivered Orders" value={systemStats.orders.delivered} color="#4caf50" />
                  <StatCard label="Pending Orders" value={systemStats.orders.pending} color="#ff9800" />
                  <StatCard label="Cancelled Orders" value={systemStats.orders.cancelled} color="#f44336" />
                  <StatCard label="Total Emergencies" value={systemStats.emergencies.total} />
                  <StatCard label="Total Lost & Found" value={systemStats.lostNFound.total} />
                </div>
              </article>
            )}

            {/* Trains Stats Tab */}
            {activeTab === "trains" && (
              <article className="surface-card compact">
                <h3>Statistics by Train</h3>
                <div style={{ overflowX: "auto", marginTop: "1rem" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #ddd" }}>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>Train</th>
                        <th style={{ padding: "0.75rem", textAlign: "center" }}>Users</th>
                        <th style={{ padding: "0.75rem", textAlign: "center" }}>Staff</th>
                        <th style={{ padding: "0.75rem", textAlign: "center" }}>Complaints</th>
                        <th style={{ padding: "0.75rem", textAlign: "center" }}>Orders</th>
                        <th style={{ padding: "0.75rem", textAlign: "center" }}>Emergencies</th>
                        <th style={{ padding: "0.75rem", textAlign: "center" }}>Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainsStats.map((train, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "0.75rem", fontWeight: "600" }}>{train.trainNumber}</td>
                          <td style={{ padding: "0.75rem", textAlign: "center" }}>{train.users}</td>
                          <td style={{ padding: "0.75rem", textAlign: "center" }}>{train.staff}</td>
                          <td style={{ padding: "0.75rem", textAlign: "center" }}>{train.complaints.total}</td>
                          <td style={{ padding: "0.75rem", textAlign: "center" }}>{train.orders.total}</td>
                          <td style={{ padding: "0.75rem", textAlign: "center" }}>{train.emergencies.total}</td>
                          <td style={{ padding: "0.75rem", textAlign: "center" }}>{train.feedback}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            )}

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <article className="surface-card compact">
                <h3>Performance Metrics</h3>
                <div style={{ overflowX: "auto", marginTop: "1rem" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #ddd" }}>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>Train</th>
                        <th style={{ padding: "0.75rem", textAlign: "center" }}>Complaint Resolution %</th>
                        <th style={{ padding: "0.75rem", textAlign: "center" }}>Order Delivery %</th>
                        <th style={{ padding: "0.75rem", textAlign: "center" }}>Avg Order Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceMetrics.map((metric, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "0.75rem", fontWeight: "600" }}>{metric.trainNumber}</td>
                          <td style={{ padding: "0.75rem", textAlign: "center" }}>
                            <span style={{ color: metric.complaintResolutionRate > 70 ? "#4caf50" : "#ff9800" }}>
                              {metric.complaintResolutionRate.toFixed(2)}%
                            </span>
                          </td>
                          <td style={{ padding: "0.75rem", textAlign: "center" }}>
                            <span style={{ color: metric.orderDeliveryRate > 80 ? "#4caf50" : "#ff9800" }}>
                              {metric.orderDeliveryRate.toFixed(2)}%
                            </span>
                          </td>
                          <td style={{ padding: "0.75rem", textAlign: "center" }}>₹{metric.averageOrderValue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            )}

            {/* Complaints Analysis Tab */}
            {activeTab === "complaints" && (
              <article className="surface-card compact">
                <h3>Complaint Analysis by Domain</h3>
                {complaintAnalysis.map((train, idx) => (
                  <div key={idx} style={{ marginBottom: "2rem" }}>
                    <h4 style={{ color: "#1976d2" }}>{train.trainNumber}</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                      {train.domains.map((domain, dIdx) => (
                        <div key={dIdx} style={{ 
                          padding: "1rem", 
                          backgroundColor: "#f5f5f5", 
                          borderRadius: "8px",
                          border: `2px solid ${domain.resolved > 0 ? "#4caf50" : "#ff9800"}`
                        }}>
                          <strong>{domain.domain}</strong>
                          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>
                            Total: {domain.total} | Resolved: {domain.resolved} | Pending: {domain.pending}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </article>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <article className="surface-card compact">
                <h3>All Users ({allUsers.length})</h3>
                <div style={{ overflowX: "auto", marginTop: "1rem" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #ddd" }}>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>Name</th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>Email</th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>PNR</th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>Train</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.slice(0, 20).map((user, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "0.75rem" }}>{user.name}</td>
                          <td style={{ padding: "0.75rem" }}>{user.email}</td>
                          <td style={{ padding: "0.75rem" }}>{user.pnr}</td>
                          <td style={{ padding: "0.75rem" }}>
                            <span style={{ 
                              backgroundColor: "#e3f2fd", 
                              color: "#1976d2",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "0.85rem"
                            }}>
                              {user.trainNumber}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allUsers.length > 20 && <p className="muted-text">Showing 20 of {allUsers.length} users</p>}
                </div>
              </article>
            )}

            {/* Staff Tab */}
            {activeTab === "staff" && (
              <article className="surface-card compact">
                <h3>All Staff ({allStaff.length})</h3>
                <div style={{ overflowX: "auto", marginTop: "1rem" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #ddd" }}>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>Name</th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>Role</th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>Email</th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>Train</th>
                        <th style={{ padding: "0.75rem", textAlign: "left" }}>Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allStaff.slice(0, 20).map((staff, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "0.75rem" }}>{staff.name}</td>
                          <td style={{ padding: "0.75rem" }}>
                            <span style={{ 
                              backgroundColor: "#fff3e0", 
                              color: "#e65100",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "0.85rem",
                              textTransform: "capitalize"
                            }}>
                              {staff.role}
                            </span>
                          </td>
                          <td style={{ padding: "0.75rem" }}>{staff.email}</td>
                          <td style={{ padding: "0.75rem" }}>
                            <span style={{ 
                              backgroundColor: "#e8f5e9", 
                              color: "#2e7d32",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "0.85rem"
                            }}>
                              {staff.trainNumber}
                            </span>
                          </td>
                          <td style={{ padding: "0.75rem" }}>{staff.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {allStaff.length > 20 && <p className="muted-text">Showing 20 of {allStaff.length} staff members</p>}
                </div>
              </article>
            )}
          </>
        )}
      </section>
    </main>
  );
};

// Helper component for stat cards
const StatCard = ({ label, value, color = "#2196F3" }) => (
  <div style={{
    padding: "1.5rem",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    borderLeft: `4px solid ${color}`,
    textAlign: "center"
  }}>
    <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem" }}>{label}</p>
    <h3 style={{ margin: "0", color, fontSize: "2rem", fontWeight: "700" }}>{value}</h3>
  </div>
);

export default SuperAdminDashboard;
