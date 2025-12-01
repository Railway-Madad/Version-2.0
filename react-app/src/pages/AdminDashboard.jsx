import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearAdminToken } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";

const TinyLineGraph = ({ labels = [], values = [], color }) => {
  if (!labels.length || !values.length) {
    return <div className="muted-text">No data.</div>;
  }
  const W = 180;
  const H = 55;
  const mT = 10;
  const mB = 22;
  const maxVal = Math.max(...values) || 1;
  const points = values.map(
    (v, i) => `${9 + (W - 18) / (values.length - 1 || 1) * i},${H - mB - (v / maxVal) * (H - mB - mT) + mT}`
  );
  const dots = values.map((_, i) => {
    const x = 9 + ((W - 18) / (values.length - 1 || 1)) * i;
    const y = H - mB - (values[i] / maxVal) * (H - mB - mT) + mT;
    return <circle key={i} cx={x} cy={y} r="2.8" fill={color} />;
  });
  const xLabels = labels.map((d, i) => {
    const x = 9 + ((W - 18) / (values.length - 1 || 1)) * i;
    return (
      <text key={d + i} x={x} y={H} style={{ fontSize: "9px", fill: "#a5b4fc" }}>
        {d.split("/").slice(0, 2).join("/")}
      </text>
    );
  });

  return (
    <svg width={W} height={H} style={{ width: "100%" }}>
      <polyline fill="none" stroke={color} strokeWidth="3" points={points.join(" ")} />
      {dots}
      {xLabels}
    </svg>
  );
};

const TinyBarGraph = ({ labels = [], values = [], color }) => {
  if (!labels.length || !values.length) {
    return <div className="muted-text">No data.</div>;
  }
  const W = 185;
  const H = 50;
  const maxVal = Math.max(...values) || 1;
  return (
    <svg width={W} height={H} style={{ width: "100%" }}>
      {values.map((val, i) => (
        <rect
          key={i}
          x={14 + i * 23}
          y={H - ((val / maxVal) * 36 + 6)}
          width="17"
          rx="4"
          height={(val / maxVal) * 36 + 1}
          fill={color}
        />
      ))}
      {labels.map((l, i) => (
        <text
          key={l + i}
          x={22 + i * 23}
          y={H}
          style={{ fontSize: "9px", fill: "#a5b4fc" }}
        >
          {`${l[0].toUpperCase()}${l.slice(1, 6)}`}
        </text>
      ))}
    </svg>
  );
};

const Gauge = ({ value }) => {
  if (value == null) {
    return <div className="muted-text">No feedback data.</div>;
  }
  const clamped = Math.max(1, Math.min(5, Number(value)));
  const r = 27;
  const c = 2 * Math.PI * r;
  const vP = ((clamped - 1) / 4) * c;
  return (
    <svg width="70" height="64">
      <circle r={r} cx="35" cy="36" fill="none" stroke="#475569" strokeWidth="14" />
      <circle
        r={r}
        cx="35"
        cy="36"
        fill="none"
        stroke="#34d399"
        strokeWidth="10"
        strokeDasharray={`${vP} ${c}`}
        strokeDashoffset="-12"
      />
      <text
        x="35"
        y="37"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#e2e8f0"
        style={{ fontSize: "1.7rem", fontWeight: 600 }}
      >
        {clamped.toFixed(1)}
      </text>
    </svg>
  );
};

const AdminDashboard = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const adminToken = useSelector((state) => state.auth.adminToken);

  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [importantComplaints, setImportantComplaints] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadOrders(),
        loadComplaints(),
        loadImportantComplaints(),
        loadFeedbackStats(),
      ]);
      setLoading(false);
    };
    if (adminToken) {
      loadData();
    }
  }, [adminToken, apiBase]);

  const loadOrders = async () => {
    try {
      const res = await fetch(`${apiBase}/catering/all-orders`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      const result = data.data || data || [];
      setOrders(Array.isArray(result) ? result : []);
    } catch (err) {
      setOrders([]);
    }
  };

  const loadComplaints = async () => {
    try {
      const res = await fetch(`${apiBase}/complaint/api/complaintsRES`, {
        headers: { Authorization: `Bearer ${adminToken}` },
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
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      setImportantComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setImportantComplaints([]);
    }
  };

  const loadFeedbackStats = async () => {
    try {
      const res = await fetch(`${apiBase}/feedback/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      setFeedbackStats(data.stats || data);
    } catch (err) {
      setFeedbackStats(null);
    }
  };

  const resolveComplaint = async (id) => {
    const confirmed = window.confirm("Mark this complaint as resolved?");
    if (!confirmed) return;
    try {
      const res = await fetch(`${apiBase}/complaint/api/complaints/resolve/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminToken}`,
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

  const logout = () => {
    dispatch(clearAdminToken());
    navigate("/adminlogin");
  };

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
    [orders]
  );
  const resolvedCount = useMemo(
    () =>
      complaints.filter((c) => (c.status || "").toLowerCase() === "resolved").length,
    [complaints]
  );
  const totalComplaints = complaints.length || 1;

  const revenueByDay = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const d = new Date(o.createdAt).toLocaleDateString();
      map[d] = (map[d] || 0) + (o.totalPrice || 0);
    });
    return map;
  }, [orders]);

  const ordersByDay = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const d = new Date(o.createdAt).toLocaleDateString();
      map[d] = (map[d] || 0) + 1;
    });
    return map;
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      map[o.status] = (map[o.status] || 0) + 1;
    });
    return map;
  }, [orders]);

  const complaintsByDay = useMemo(() => {
    const map = {};
    complaints.forEach((c) => {
      const d = new Date(c.createdAt).toLocaleDateString();
      map[d] = (map[d] || 0) + 1;
    });
    return map;
  }, [complaints]);

  const complaintsByDomain = useMemo(() => {
    const map = {};
    complaints.forEach((c) => {
      if (c.issueDomain) {
        map[c.issueDomain] = (map[c.issueDomain] || 0) + 1;
      }
    });
    return map;
  }, [complaints]);

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
            <Link className="btn btn-ghost" to="/">
              Home
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
        </div>
      </section>

      <section className="surface-card" style={{ marginTop: "2rem" }}>
        <div className="page-header">
          <div>
            <h2>Platform Insights</h2>
            <p className="muted-text">Key metrics and activity visualizations</p>
          </div>
        </div>

        <div
          className="content-grid four-column"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div className="link-tile">
            <strong>Revenue</strong>
            <p id="ad-revenue">&#8377;{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="link-tile">
            <strong>Orders</strong>
            <p id="ad-orders">{orders.length}</p>
          </div>
          <div className="link-tile">
            <strong>Users</strong>
            <p id="ad-users">N/A</p>
          </div>
          <div className="link-tile">
            <strong>Complaints</strong>
            <p id="ad-complaints">{complaints.length}</p>
          </div>
          <div className="link-tile">
            <strong>Resolved Pie</strong>
            <svg height="66" width="54">
              <circle
                id="pie-resolved"
                r="18"
                cx="26"
                cy="33"
                fill="none"
                stroke="#34d399"
                strokeWidth="15"
                strokeDasharray={`${resolvedCount} ${Math.max(
                  totalComplaints - resolvedCount,
                  1
                )}`}
              />
            </svg>
          </div>
        </div>
        <div
          className="content-grid two-column"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "2rem",
          }}
        >
          <article className="link-tile" style={{ overflow: "visible" }}>
            <span className="badge">Revenue Trend</span>
            <strong>Revenue per Day</strong>
            <div
              id="graph-revenue"
              style={{ margin: "0.5rem 0 0.7rem 0", minHeight: "80px", width: "100%" }}
            >
              <TinyLineGraph
                labels={Object.keys(revenueByDay)}
                values={Object.values(revenueByDay)}
                color="var(--color-primary)"
              />
            </div>
          </article>

          <article className="link-tile">
            <span className="badge">Orders</span>
            <strong>Orders by Status</strong>
            <div id="graph-orders-status" style={{ marginTop: "0.5rem", height: "110px" }}>
              <TinyBarGraph
                labels={Object.keys(ordersByStatus)}
                values={Object.values(ordersByStatus)}
                color="var(--color-primary-dark)"
              />
            </div>
          </article>

          <article className="link-tile">
            <span className="badge">Orders</span>
            <strong>Orders per Day</strong>
            <div id="graph-orders-day" style={{ marginTop: "0.5rem", height: "100px" }}>
              <TinyBarGraph
                labels={Object.keys(ordersByDay)}
                values={Object.values(ordersByDay)}
                color="var(--color-accent)"
              />
            </div>
          </article>

          <article className="link-tile">
            <span className="badge">Complaints</span>
            <strong>Complaints per Day</strong>
            <div id="graph-complaints-day" style={{ marginTop: "0.5rem", height: "90px" }}>
              <TinyLineGraph
                labels={Object.keys(complaintsByDay)}
                values={Object.values(complaintsByDay)}
                color="#f87171"
              />
            </div>
          </article>

          <article className="link-tile">
            <span className="badge">Complaints</span>
            <strong>Complaints by Domain</strong>
            <div id="graph-complaints-domain" style={{ marginTop: "0.5rem", height: "110px" }}>
              {Object.keys(complaintsByDomain).length ? (
                <TinyBarGraph
                  labels={Object.keys(complaintsByDomain)}
                  values={Object.values(complaintsByDomain)}
                  color="#a855f7"
                />
              ) : (
                <div className="muted-text">Domain data unavailable.</div>
              )}
            </div>
          </article>

          <article className="link-tile">
            <span className="badge">Feedback</span>
            <strong>Average Feedback Rating</strong>
            <div
              id="graph-feedback-rating"
              style={{
                marginTop: "0.8rem",
                height: "90px",
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Gauge value={feedbackStats?.averageRating} />
            </div>
            <p
              id="feedback-total-msg"
              style={{
                marginTop: "0.3rem",
                fontSize: "0.95rem",
                color: "var(--color-muted)",
              }}
            >
              {feedbackStats?.totalFeedbacks != null
                ? `Total feedback: ${feedbackStats.totalFeedbacks}`
                : ""}
            </p>
          </article>
        </div>
      </section>

      <section className="surface-card" style={{ marginTop: "2rem" }}>
        <h2>Important Complaints</h2>
        <table
          id="complaintsTable"
          style={{
            display: "table",
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ddd" }}>
                PNR
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ddd" }}>
                Description
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ddd" }}>
                Bogie
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ddd" }}>
                Seat
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ddd" }}>
                Domain
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ddd" }}>
                Status
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ddd" }}>
                Created At
              </th>
              <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ddd" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody id="complaintsBody">
            {loading ? (
              <tr>
                <td colSpan="8" style={{ padding: "1rem", textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : importantComplaints.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: "1rem", textAlign: "center" }}>
                  No important complaints found.
                </td>
              </tr>
            ) : (
              importantComplaints.map((c) => {
                const createdAt = c.createdAt ? new Date(c.createdAt).toLocaleString() : "N/A";
                const bgColor = c.status === "Resolved" ? "#d4edda" : "#f8d7da";
                return (
                  <tr key={c._id} id={`complaint-${c._id}`}>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid #ddd" }}>
                      {c.pnr || "-"}
                    </td>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid #ddd" }}>
                      {c.description || "-"}
                    </td>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid #ddd" }}>
                      {c.bogieNumber || "-"}
                    </td>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid #ddd" }}>
                      {c.seatNumber || "-"}
                    </td>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid #ddd" }}>
                      {c.issueDomain || "-"}
                    </td>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid #ddd" }}>
                      {c.status || "-"}
                    </td>
                    <td style={{ padding: "0.75rem", borderBottom: "1px solid #ddd" }}>
                      {createdAt}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem",
                        borderBottom: "1px solid #ddd",
                        backgroundColor: bgColor,
                      }}
                    >
                      <button
                        className="resolve-btn"
                        disabled={c.status === "Resolved"}
                        style={{
                          padding: "0.5rem 1rem",
                          cursor: c.status === "Resolved" ? "not-allowed" : "pointer",
                          border: "none",
                          borderRadius: "4px",
                          background: "#4f46e5",
                          color: "white",
                        }}
                        onClick={() => resolveComplaint(c._id)}
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default AdminDashboard;
