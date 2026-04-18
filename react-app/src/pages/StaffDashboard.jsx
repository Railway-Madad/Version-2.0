import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { clearStaffToken } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";
import "./StaffDashboard.css";

/* ═══════════════════════════════════════════════════════════
   ICON COMPONENTS
   ═══════════════════════════════════════════════════════════ */
const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Complaints: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Notices: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Train: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/>
      <path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/>
      <path d="M8 15h0"/><path d="M16 15h0"/>
    </svg>
  ),
  Sun: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  ),
  Moon: () => (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Image: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════
   NAVIGATION ITEMS
   ═══════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: "home", label: "Dashboard", icon: Icons.Dashboard },
  { id: "complaints", label: "My Complaints", icon: Icons.Complaints },
  { id: "notices", label: "Admin Notices", icon: Icons.Notices },
];

/* ═══════════════════════════════════════════════════════════
   MAIN STAFF DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════ */
const StaffDashboard = () => {
  const BATCH_SIZE = 25;
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isAuthenticated = useSelector((state) => state.auth.isStaffAuthenticated);
  const staffTrainNo = useSelector((state) => state.auth.staffTrainNo);

  // UI State
  const [activeSection, setActiveSection] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [staff, setStaff] = useState(null);
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [commands, setCommands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [complaintsTab, setComplaintsTab] = useState("pending");

  // Modal states
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionDetails, setResolutionDetails] = useState("");

  /* ── FETCH FUNCTIONS ── */
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/staff/profile`, { credentials: "include" });
      if (!res.ok) throw new Error("Auth failed");
      const data = await res.json();
      setStaff(data.staff);
    } catch (err) {
      dispatch(clearStaffToken());
      navigate("/staff_login");
    }
  }, [apiBase, dispatch, navigate]);

  const fetchAllBatches = useCallback(async (url, options = {}, extractor) => {
    const getItems = extractor || ((payload) => {
      if (Array.isArray(payload)) return payload;
      return payload?.data || payload?.items || payload?.complaints || [];
    });

    let page = 1;
    let hasMore = true;
    const seen = new Set();
    const merged = [];

    while (hasMore && page <= 200) {
      const sep = url.includes("?") ? "&" : "?";
      const res = await fetch(`${url}${sep}page=${page}`, options);
      if (!res.ok) throw new Error(`Failed request: ${res.status}`);
      const payload = await res.json();
      const batch = getItems(payload) || [];

      let newCount = 0;
      for (const item of batch) {
        const key = item?._id || `${page}-${newCount}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(item);
          newCount += 1;
        }
      }

      const responseHasMore = typeof payload?.hasMore === "boolean" ? payload.hasMore : null;
      hasMore = responseHasMore !== null ? responseHasMore : batch.length === BATCH_SIZE;
      if (newCount === 0) break;
      page += 1;
    }

    return merged;
  }, [BATCH_SIZE]);

  const fetchComplaints = useCallback(async () => {
    try {
      const complaints = await fetchAllBatches(
        `${apiBase}/staff/complaints`,
        { credentials: "include" },
        (payload) => payload?.complaints || payload?.data || []
      );

      // Process resolved complaints to get resolver names
      const resolvedList = await Promise.all(
        complaints
          .filter((c) => c.status === "Resolved" || c.status === "AwaitingConfirmation")
          .map(async (complaint) => {
            if (complaint.resolvedBy) {
              try {
                const staffRes = await fetch(`${apiBase}/staff/getname/${complaint.resolvedBy}`, { credentials: "include" });
                if (staffRes.ok) {
                  const staffData = await staffRes.json();
                  return { ...complaint, resolvedByName: staffData.staff?.name || "N/A" };
                }
              } catch {
                return { ...complaint, resolvedByName: "N/A" };
              }
            }
            return { ...complaint, resolvedByName: "N/A" };
          })
      );

      setPendingComplaints(complaints.filter((c) => c.status !== "Resolved" && c.status !== "AwaitingConfirmation"));
      setResolvedComplaints(resolvedList);
    } catch (err) {
      console.error(err);
      setPendingComplaints([]);
      setResolvedComplaints([]);
    }
  }, [apiBase, fetchAllBatches]);

  const fetchCommands = useCallback(async () => {
    try {
      const allCommands = await fetchAllBatches(`${apiBase}/staff/commands`, { credentials: "include" });
      setCommands(allCommands);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase, fetchAllBatches]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/staff_login");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchComplaints(), fetchCommands()]);
      setLoading(false);
    };
    loadData();
  }, [isAuthenticated, navigate, fetchProfile, fetchComplaints, fetchCommands]);

  /* ── ACTIONS ── */
  const logout = async () => {
    try {
      await axios.post(`${apiBase}/staff/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
    dispatch(clearStaffToken());
    navigate("/staff_login");
  };

  const openResolveModal = (complaint) => {
    setSelectedComplaint(complaint);
    setResolutionDetails("");
    setShowResolveModal(true);
  };

  const resolveComplaint = async () => {
    if (!resolutionDetails.trim()) {
      alert("Resolution details are required.");
      return;
    }
    try {
      const res = await fetch(`${apiBase}/staff/complaints/${selectedComplaint._id}/resolve`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolutionDetails }),
      });
      if (res.ok) {
        setShowResolveModal(false);
        setSelectedComplaint(null);
        fetchComplaints();
        alert("Complaint resolved successfully");
      } else {
        alert("Failed to resolve complaint");
      }
    } catch (err) {
      alert("Error resolving complaint");
    }
  };

  const markCommandRead = async (id) => {
    try {
      await fetch(`${apiBase}/staff/commands/${id}/read`, { method: "PUT", credentials: "include" });
      fetchCommands();
    } catch (err) {
      console.error(err);
    }
  };

  /* ── COMPUTED DATA ── */
  const filteredPending = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return pendingComplaints.filter(
      (c) =>
        c.username?.toLowerCase().includes(term) ||
        c.pnr?.toLowerCase().includes(term) ||
        c.issueDomain?.toLowerCase().includes(term) ||
        c.status?.toLowerCase().includes(term)
    );
  }, [pendingComplaints, searchTerm]);

  const filteredResolved = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return resolvedComplaints.filter(
      (c) =>
        c.username?.toLowerCase().includes(term) ||
        c.pnr?.toLowerCase().includes(term) ||
        c.issueDomain?.toLowerCase().includes(term) ||
        c.status?.toLowerCase().includes(term) ||
        c.resolvedByName?.toLowerCase().includes(term)
    );
  }, [resolvedComplaints, searchTerm]);

  const unreadCount = useMemo(() => commands.filter((c) => !c.isRead).length, [commands]);

  const complaintStats = useMemo(() => ({
    total: pendingComplaints.length + resolvedComplaints.length,
    pending: pendingComplaints.length,
    resolved: resolvedComplaints.filter((c) => c.status === "Resolved").length,
    awaiting: resolvedComplaints.filter((c) => c.status === "AwaitingConfirmation").length,
  }), [pendingComplaints, resolvedComplaints]);

  const getRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER FUNCTIONS
     ═══════════════════════════════════════════════════════════ */

  const renderHome = () => (
    <div className="sd-home">
      <div className="sd-welcome-card">
        <div className="sd-welcome-content">
          <h1>Welcome, {staff?.name || "Staff"}!</h1>
          <p>Train #{staffTrainNo || "N/A"} • {staff?.role} Department</p>
        </div>
        <div className="sd-welcome-icon">
          <Icons.Train />
        </div>
      </div>

      <div className="sd-stats-row">
        <div className="sd-stat-box" onClick={() => setActiveSection("complaints")}>
          <div className="icon total">
            <Icons.Complaints />
          </div>
          <div className="info">
            <span className="value">{complaintStats.total}</span>
            <span className="label">Total Assigned</span>
          </div>
        </div>
        <div className="sd-stat-box" onClick={() => { setActiveSection("complaints"); setComplaintsTab("pending"); }}>
          <div className="icon pending">
            <Icons.Clock />
          </div>
          <div className="info">
            <span className="value">{complaintStats.pending}</span>
            <span className="label">Pending</span>
          </div>
        </div>
        <div className="sd-stat-box">
          <div className="icon awaiting">
            <Icons.Clock />
          </div>
          <div className="info">
            <span className="value">{complaintStats.awaiting}</span>
            <span className="label">Awaiting Confirmation</span>
          </div>
        </div>
        <div className="sd-stat-box" onClick={() => { setActiveSection("complaints"); setComplaintsTab("resolved"); }}>
          <div className="icon resolved">
            <Icons.Check />
          </div>
          <div className="info">
            <span className="value">{complaintStats.resolved}</span>
            <span className="label">Resolved</span>
          </div>
        </div>
      </div>

      {/* Pending Complaints Quick View */}
      <div className="sd-table-container">
        <div className="sd-table-header">
          <h3>Pending Complaints <span className="count">({pendingComplaints.length})</span></h3>
          <button className="sd-btn sd-btn-primary sd-btn-sm" onClick={() => setActiveSection("complaints")}>
            View All
          </button>
        </div>
        {pendingComplaints.length === 0 ? (
          <div className="sd-empty">
            <Icons.Check />
            <h3>All caught up!</h3>
            <p>No pending complaints assigned to you.</p>
          </div>
        ) : (
          <>
            <div className="sd-table-wrap">
              <table className="sd-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>User</th>
                    <th>Description</th>
                    <th>Train</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingComplaints.slice(0, 5).map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div className={`sd-cell-image ${!c.linkurl ? "empty" : ""}`}>
                          {c.linkurl ? <img src={c.linkurl} alt="Complaint" /> : <Icons.Image />}
                        </div>
                      </td>
                      <td>
                        <div className="sd-cell-meta">
                          <span className="sd-cell-primary">{c.username}</span>
                          <span className="secondary">PNR: {c.pnr}</span>
                        </div>
                      </td>
                      <td>
                        <div className="sd-cell-description" title={c.description}>{c.description}</div>
                      </td>
                      <td>
                        <span className="sd-train-badge">🚆 {c.trainNumber || "N/A"}</span>
                      </td>
                      <td>
                        <span className="sd-badge pending">{c.status}</span>
                      </td>
                      <td>{getRelativeTime(c.createdAt)}</td>
                      <td>
                        <button className="sd-btn sd-btn-success sd-btn-sm" onClick={() => openResolveModal(c)}>
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pendingComplaints.length > 5 && (
              <div className="sd-table-footer">
                +{pendingComplaints.length - 5} more complaints
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Notices */}
      {commands.length > 0 && (
        <div className="sd-table-container" style={{ marginTop: "24px" }}>
          <div className="sd-table-header">
            <h3>Recent Notices <span className="count">({unreadCount} unread)</span></h3>
            <button className="sd-btn sd-btn-sm" onClick={() => setActiveSection("notices")}>
              View All
            </button>
          </div>
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {commands.slice(0, 3).map((cmd) => (
              <div key={cmd._id} className={`sd-notice-card ${!cmd.isRead ? "unread" : ""}`}>
                <div className="sd-notice-header">
                  <h4 className="sd-notice-title">{cmd.title}</h4>
                  <span className={`sd-notice-priority ${cmd.priority}`}>{cmd.priority}</span>
                </div>
                <p className="sd-notice-message">{cmd.message}</p>
                <div className="sd-notice-footer">
                  <span className="sd-notice-time">{getRelativeTime(cmd.createdAt)}</span>
                  {!cmd.isRead && (
                    <button className="sd-btn sd-btn-sm" onClick={() => markCommandRead(cmd._id)}>
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderComplaints = () => {
    const displayComplaints = complaintsTab === "pending" ? filteredPending : filteredResolved;

    return (
      <div className="sd-complaints">
        <div className="sd-section-header">
          <div>
            <h2>My Complaints</h2>
            <p className="sd-subtitle">Complaints assigned to the {staff?.role} department</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="sd-stats-row">
          <div className="sd-stat-box">
            <div className="icon total"><Icons.Complaints /></div>
            <div className="info">
              <span className="value">{complaintStats.total}</span>
              <span className="label">Total Assigned</span>
            </div>
          </div>
          <div className="sd-stat-box">
            <div className="icon pending"><Icons.Clock /></div>
            <div className="info">
              <span className="value">{complaintStats.pending}</span>
              <span className="label">Pending</span>
            </div>
          </div>
          <div className="sd-stat-box">
            <div className="icon awaiting"><Icons.Clock /></div>
            <div className="info">
              <span className="value">{complaintStats.awaiting}</span>
              <span className="label">Awaiting Confirmation</span>
            </div>
          </div>
          <div className="sd-stat-box">
            <div className="icon resolved"><Icons.Check /></div>
            <div className="info">
              <span className="value">{complaintStats.resolved}</span>
              <span className="label">Resolved</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sd-tabs">
          <button className={`sd-tab ${complaintsTab === "pending" ? "active" : ""}`} onClick={() => setComplaintsTab("pending")}>
            Pending ({pendingComplaints.length})
          </button>
          <button className={`sd-tab ${complaintsTab === "resolved" ? "active" : ""}`} onClick={() => setComplaintsTab("resolved")}>
            Resolved ({resolvedComplaints.length})
          </button>
        </div>

        {/* Table */}
        <div className="sd-table-container">
          <div className="sd-table-header">
            <h3>{complaintsTab === "pending" ? "Pending" : "Resolved"} Complaints</h3>
            <div className="sd-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {displayComplaints.length === 0 ? (
            <div className="sd-empty">
              <Icons.Complaints />
              <h3>No {complaintsTab} complaints</h3>
              <p>{complaintsTab === "pending" ? "All complaints have been resolved!" : "No resolved complaints yet."}</p>
            </div>
          ) : (
            <>
              <div className="sd-table-wrap">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>User</th>
                      <th>Description</th>
                      <th>Details</th>
                      <th>Train</th>
                      <th>Status</th>
                      <th>Time</th>
                      <th>{complaintsTab === "pending" ? "Action" : "Resolved By"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayComplaints.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <div className={`sd-cell-image ${!c.linkurl ? "empty" : ""}`}>
                            {c.linkurl ? <img src={c.linkurl} alt="Complaint" /> : <Icons.Image />}
                          </div>
                        </td>
                        <td>
                          <div className="sd-cell-meta">
                            <span className="sd-cell-primary">{c.username}</span>
                            <span className="secondary">PNR: {c.pnr}</span>
                          </div>
                        </td>
                        <td>
                          <div className="sd-cell-description" title={c.description}>{c.description}</div>
                        </td>
                        <td>
                          <div className="sd-cell-meta">
                            <span className="sd-badge domain">{c.issueDomain}</span>
                            <span className="secondary">Seat: {c.seatNumber || "N/A"}</span>
                          </div>
                        </td>
                        <td>
                          <span className="sd-train-badge">🚆 {c.trainNumber || "N/A"}</span>
                        </td>
                        <td>
                          <span className={`sd-badge ${c.status?.toLowerCase().replace("awaitingconfirmation", "awaiting")}`}>
                            {c.status === "AwaitingConfirmation" ? "Awaiting" : c.status}
                          </span>
                        </td>
                        <td>{getRelativeTime(c.createdAt)}</td>
                        <td>
                          {complaintsTab === "pending" ? (
                            <button className="sd-btn sd-btn-success sd-btn-sm" onClick={() => openResolveModal(c)}>
                              Resolve
                            </button>
                          ) : (
                            <span>{c.resolvedByName || "N/A"}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="sd-table-footer">
                Showing {displayComplaints.length} complaint{displayComplaints.length !== 1 ? "s" : ""}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderNotices = () => (
    <div className="sd-notices">
      <div className="sd-section-header">
        <div>
          <h2>Admin Notices</h2>
          <p className="sd-subtitle">Important updates and commands from administration</p>
        </div>
      </div>

      {commands.length === 0 ? (
        <div className="sd-empty">
          <Icons.Notices />
          <h3>No notices yet</h3>
          <p>You haven't received any notices from admin.</p>
        </div>
      ) : (
        <div className="sd-notices-grid">
          {commands.map((cmd) => (
            <div key={cmd._id} className={`sd-notice-card ${!cmd.isRead ? "unread" : ""}`}>
              <div className="sd-notice-header">
                <h4 className="sd-notice-title">{cmd.title}</h4>
                <span className={`sd-notice-priority ${cmd.priority}`}>{cmd.priority}</span>
              </div>
              <p className="sd-notice-message">{cmd.message}</p>
              <div className="sd-notice-footer">
                <span className="sd-notice-time">{new Date(cmd.createdAt).toLocaleString()}</span>
                {!cmd.isRead && (
                  <button className="sd-btn sd-btn-sm" onClick={() => markCommandRead(cmd._id)}>
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="sd-loading">
          <div className="sd-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      );
    }

    switch (activeSection) {
      case "home": return renderHome();
      case "complaints": return renderComplaints();
      case "notices": return renderNotices();
      default: return renderHome();
    }
  };

  /* ═══════════════════════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className={`staff-dashboard ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="sd-sidebar">
        <div className="sd-sidebar-header">
          <div className="sd-logo">
            <Icons.Train />
            {!sidebarCollapsed && (
              <div className="sd-logo-text">
                <span>Staff Portal</span>
                <span className="sd-role-badge">{staff?.role || "Loading..."}</span>
              </div>
            )}
          </div>
          <button className="sd-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Icons.Menu />
          </button>
        </div>

        <nav className="sd-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`sd-nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => setActiveSection(item.id)}
              title={item.label}
            >
              <item.icon />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {item.id === "notices" && unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sd-sidebar-footer">
          <button className="sd-nav-item" onClick={toggleTheme} title={theme === "light" ? "Dark Mode" : "Light Mode"}>
            {theme === "light" ? <Icons.Moon /> : <Icons.Sun />}
            {!sidebarCollapsed && <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>}
          </button>
          <button className="sd-nav-item logout" onClick={logout} title="Logout">
            <Icons.Logout />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="sd-main">
        <div className="sd-content-area">
          {renderContent()}
        </div>
      </main>

      {/* Resolve Modal */}
      {showResolveModal && selectedComplaint && (
        <div className="sd-modal-overlay" onClick={() => setShowResolveModal(false)}>
          <div className="sd-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Resolve Complaint</h3>
            <p style={{ color: "var(--sd-text-muted)", marginBottom: "16px" }}>
              Complaint from <strong>{selectedComplaint.username}</strong> • PNR: {selectedComplaint.pnr}
            </p>
            <div className="sd-form-group">
              <label>Resolution Details</label>
              <textarea
                rows={4}
                value={resolutionDetails}
                onChange={(e) => setResolutionDetails(e.target.value)}
                placeholder="Describe how the complaint was resolved..."
              />
            </div>
            <div className="sd-modal-actions">
              <button className="sd-btn sd-btn-success" onClick={resolveComplaint}>
                <Icons.Check /> Resolve
              </button>
              <button className="sd-btn" onClick={() => setShowResolveModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
