import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";

/* ═══ Chart Components (reused) ═══ */
const BarChart = ({ labels = [], values = [], color = "var(--color-primary)", height = 200 }) => {
  if (!labels.length || !values.length) return <div className="an-empty">No data</div>;
  const W = 600, H = height, pad = { t: 20, r: 20, b: 50, l: 55 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const maxV = Math.max(...values, 1), barW = Math.min(plotW / labels.length * 0.6, 40), gap = plotW / labels.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="an-chart-svg">
      {[...Array(6)].map((_, i) => { const yy = pad.t + (plotH / 5) * i; const val = maxV - (maxV / 5) * i; return (<g key={i}><line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="rgba(148,163,184,0.15)" /><text x={pad.l - 8} y={yy + 4} textAnchor="end" className="an-chart-label">{Math.round(val)}</text></g>); })}
      {values.map((v, i) => { const bh = (v / maxV) * plotH; const bx = pad.l + gap * i + (gap - barW) / 2; const by = pad.t + plotH - bh; return (<g key={i}><rect x={bx} y={by} width={barW} height={bh} rx="4" fill={color} opacity="0.85"><title>{`${labels[i]}: ${v}`}</title></rect><text x={bx + barW / 2} y={H - 8} textAnchor="middle" className="an-chart-label">{labels[i]?.length > 8 ? labels[i].slice(0, 8) + "…" : labels[i]}</text></g>); })}
    </svg>
  );
};

const PieChart = ({ slices = [], donut = false, size = 180 }) => {
  if (!slices.length) return <div className="an-empty">No data</div>;
  const total = slices.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 10, cx = size / 2, cy = size / 2;
  let cumAngle = -90;
  const colors = ["#38bdf8", "#a855f7", "#f59e0b", "#22c55e", "#f87171", "#818cf8", "#fb923c", "#14b8a6"];
  const arcs = slices.map((s, i) => {
    const angle = (s.value / total) * 360;
    const startRad = (cumAngle * Math.PI) / 180, endRad = ((cumAngle + angle) * Math.PI) / 180;
    const large = angle > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad);
    const ir = donut ? r * 0.55 : 0;
    const ix1 = cx + ir * Math.cos(endRad), iy1 = cy + ir * Math.sin(endRad);
    const ix2 = cx + ir * Math.cos(startRad), iy2 = cy + ir * Math.sin(startRad);
    const path = donut
      ? `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${ix1},${iy1} A${ir},${ir} 0 ${large} 0 ${ix2},${iy2} Z`
      : `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
    cumAngle += angle;
    return <path key={i} d={path} fill={s.color || colors[i % colors.length]} opacity="0.88"><title>{`${s.label}: ${s.value}`}</title></path>;
  });
  return (
    <div className="an-pie-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>{arcs}</svg>
      <div className="an-pie-legend">
        {slices.map((s, i) => (<div key={i} className="an-legend-item"><span className="an-legend-dot" style={{ background: s.color || colors[i % colors.length] }} /><span>{s.label}</span><strong>{((s.value / total) * 100).toFixed(1)}%</strong></div>))}
      </div>
    </div>
  );
};

const LineChart = ({ labels = [], datasets = [], height = 200, area = false }) => {
  if (!labels.length) return <div className="an-empty">No data</div>;
  const W = 600, H = height, pad = { t: 20, r: 20, b: 40, l: 55 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const allVals = datasets.flatMap(d => d.values);
  const maxV = Math.max(...allVals, 1), minV = Math.min(...allVals, 0), range = maxV - minV || 1;
  const x = (i) => pad.l + (i / (labels.length - 1 || 1)) * plotW;
  const y = (v) => pad.t + plotH - ((v - minV) / range) * plotH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="an-chart-svg">
      {[...Array(6)].map((_, i) => { const yy = pad.t + (plotH / 5) * i; const val = maxV - (range / 5) * i; return (<g key={i}><line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="rgba(148,163,184,0.15)" /><text x={pad.l - 8} y={yy + 4} textAnchor="end" className="an-chart-label">{Math.round(val)}</text></g>); })}
      {labels.map((l, i) => { if (labels.length > 14 && i % Math.ceil(labels.length / 10) !== 0) return null; return <text key={i} x={x(i)} y={H - 5} textAnchor="middle" className="an-chart-label">{l}</text>; })}
      {datasets.map((ds, di) => { const pts = ds.values.map((v, i) => `${x(i)},${y(v)}`).join(" "); return (<g key={di}>{area && <polygon points={`${x(0)},${y(minV)} ${pts} ${x(ds.values.length - 1)},${y(minV)}`} fill={ds.color || "var(--color-primary)"} opacity="0.12" />}<polyline fill="none" stroke={ds.color || "var(--color-primary)"} strokeWidth="2.5" points={pts} />{ds.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={ds.color || "var(--color-primary)"}><title>{`${labels[i]}: ${v}`}</title></circle>)}</g>); })}
    </svg>
  );
};

/* ═══ Helpers ═══ */
const fmtCur = (n) => `₹${n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toFixed(0)}`;
const dayKey = (d) => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth() + 1}`; };
const groupBy = (arr, keyFn) => { const m = new Map(); arr.forEach(i => { const k = keyFn(i); m.set(k, (m.get(k) || 0) + 1); }); return m; };
const groupSum = (arr, keyFn, valFn) => { const m = new Map(); arr.forEach(i => { const k = keyFn(i); m.set(k, (m.get(k) || 0) + valFn(i)); }); return m; };
const sortedEntries = (map) => { const e = [...map.entries()]; return { labels: e.map(x => x[0]), values: e.map(x => x[1]) }; };

/* ═══ MAIN ═══ */
const TrainAdminUserDetail = () => {
  const { userId } = useParams();
  const { apiBase } = useApi();
  const { theme, toggleTheme } = useTheme();
  const trainNo = useSelector((s) => s.auth.adminTrainNo);

  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [lostFound, setLostFound] = useState([]);
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      setLoading(true);
      try {
        const opts = { credentials: "include" };
        const [ordersRes, complaintsRes, emergRes, lostRes, fbRes] = await Promise.all([
          fetch(`${apiBase}/catering/all-orders`, opts).then(r => r.json()),
          fetch(`${apiBase}/complaint/`, opts).then(r => r.json()),
          fetch(`${apiBase}/emergency/getEmg`, opts).then(r => r.json()),
          fetch(`${apiBase}/lostnfound`, opts).then(r => r.json()),
          fetch(`${apiBase}/feedback`, opts).then(r => r.json()),
        ]);
        if (cancel) return;
        const allOrders = Array.isArray(ordersRes.data || ordersRes) ? ordersRes.data || ordersRes : [];
        const allComplaints = Array.isArray(complaintsRes) ? complaintsRes : [];
        const allEmerg = Array.isArray(emergRes) ? emergRes : [];
        const lostItems = lostRes.items || lostRes.data || lostRes;
        const allLF = Array.isArray(lostItems) ? lostItems : [];
        const allFB = Array.isArray(fbRes.data || fbRes) ? fbRes.data || fbRes : [];

        // Filter by userId
        setOrders(allOrders.filter(o => (o.user?._id || o.user) === userId));
        setComplaints(allComplaints.filter(c => (c.userId?._id || c.userId) === userId));
        setEmergencies(allEmerg.filter(e => (e.userId?._id || e.userId) === userId));
        setLostFound(allLF.filter(lf => (lf.userId?._id || lf.userId) === userId));
        setAllFeedbacks(allFB);
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    return () => { cancel = true; };
  }, [apiBase, userId]);

  // User identity from first available record
  const userInfo = useMemo(() => {
    const fromOrder = orders.find(o => o.user?.name || o.user?.username || o.user?.email);
    const fromComplaint = complaints.find(c => c.username);
    const fromEmerg = emergencies.find(e => e.username);
    return {
      name: fromOrder?.user?.name || fromOrder?.user?.username || fromComplaint?.username || fromEmerg?.username || "User",
      email: fromOrder?.user?.email || "",
      id: userId,
    };
  }, [orders, complaints, emergencies, userId]);

  // Analytics
  const analytics = useMemo(() => {
    const totalSpent = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const avgOrderVal = orders.length ? totalSpent / orders.length : 0;
    const cancelledOrders = orders.filter(o => (o.status || "").toLowerCase() === "cancelled").length;
    const deliveredOrders = orders.filter(o => (o.status || "").toLowerCase() === "delivered").length;

    const resolvedComplaints = complaints.filter(c => c.status === "Resolved").length;
    const pendingComplaints = complaints.filter(c => c.status === "Pending").length;

    // Food preferences
    const itemQty = new Map();
    orders.forEach(o => (o.items || []).forEach(it => {
      const name = it.foodItem?.name || "Unknown";
      itemQty.set(name, (itemQty.get(name) || 0) + (it.quantity || 1));
    }));
    const favItems = [...itemQty.entries()].sort((a, b) => b[1] - a[1]);

    // Order timeline
    const ordersByDay = groupBy(orders, o => dayKey(o.createdAt));
    const spendByDay = groupSum(orders, o => dayKey(o.createdAt), o => o.totalPrice || 0);
    const complaintsByDay = groupBy(complaints, c => dayKey(c.createdAt));

    // Order status distribution
    const orderStatusDist = groupBy(orders, o => o.status || "unknown");
    // Complaint domain distribution
    const complaintDomainDist = groupBy(complaints, c => c.issueDomain || "Other");
    // Complaint status distribution
    const complaintStatusDist = groupBy(complaints, c => c.status || "unknown");

    // Avg items per order
    const totalItems = orders.reduce((s, o) => s + (o.items || []).reduce((ss, it) => ss + (it.quantity || 1), 0), 0);

    return {
      totalSpent, avgOrderVal, cancelledOrders, deliveredOrders,
      totalOrders: orders.length, totalComplaints: complaints.length,
      resolvedComplaints, pendingComplaints,
      totalEmergencies: emergencies.length,
      totalLostFound: lostFound.length,
      favItems: favItems.slice(0, 5),
      ordersByDay: sortedEntries(ordersByDay),
      spendByDay: sortedEntries(spendByDay),
      complaintsByDay: sortedEntries(complaintsByDay),
      orderStatusSlices: [...orderStatusDist.entries()].map(([label, value]) => ({ label, value })),
      complaintDomainSlices: [...complaintDomainDist.entries()].map(([label, value]) => ({ label, value })),
      complaintStatusSlices: [...complaintStatusDist.entries()].map(([label, value]) => ({ label, value })),
      avgItemsPerOrder: orders.length ? (totalItems / orders.length).toFixed(1) : "0",
      totalItemsOrdered: totalItems,
    };
  }, [orders, complaints, emergencies, lostFound]);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "orders", label: `Orders (${orders.length})` },
    { key: "complaints", label: `Complaints (${complaints.length})` },
    { key: "emergencies", label: `Emergencies (${emergencies.length})` },
    { key: "lostnfound", label: `Lost & Found (${lostFound.length})` },
  ];

  if (loading) {
    return (
      <main className="page-shell fade-in">
        <section className="surface-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="an-spinner" /><p className="muted-text" style={{ marginTop: "1rem" }}>Loading user data…</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell fade-in an-page">
      {/* Header */}
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>{userInfo.name}</h1>
            <p className="muted-text">
              {userInfo.email && <>{userInfo.email} · </>}
              User ID: {userInfo.id?.slice(-8)} · Train #{trainNo}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn btn-ghost" onClick={toggleTheme}>{theme === "light" ? "🌙" : "☀️"}</button>
            <Link className="btn btn-ghost" to="/admin-users">← Back to Users</Link>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="surface-card an-section">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t.key} className={`btn ${activeTab === t.key ? "" : "btn-ghost"}`} onClick={() => setActiveTab(t.key)} style={{ fontSize: "0.85rem" }}>
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* ═══ OVERVIEW TAB ═══ */}
      {activeTab === "overview" && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">User Summary</h2>
            <div className="an-kpi-grid">
              <div className="an-kpi"><span className="an-kpi-val">{analytics.totalOrders}</span><span className="an-kpi-lbl">Total Orders</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(analytics.totalSpent)}</span><span className="an-kpi-lbl">Total Spent</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(analytics.avgOrderVal)}</span><span className="an-kpi-lbl">Avg Order Value</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{analytics.deliveredOrders}</span><span className="an-kpi-lbl">Delivered</span></div>
              <div className="an-kpi an-kpi-warn"><span className="an-kpi-val">{analytics.cancelledOrders}</span><span className="an-kpi-lbl">Cancelled</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{analytics.avgItemsPerOrder}</span><span className="an-kpi-lbl">Avg Items/Order</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{analytics.totalComplaints}</span><span className="an-kpi-lbl">Complaints</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{analytics.resolvedComplaints}</span><span className="an-kpi-lbl">Resolved</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{analytics.pendingComplaints}</span><span className="an-kpi-lbl">Pending</span></div>
              <div className="an-kpi an-kpi-warn"><span className="an-kpi-val">{analytics.totalEmergencies}</span><span className="an-kpi-lbl">Emergencies</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{analytics.totalLostFound}</span><span className="an-kpi-lbl">Lost & Found</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{analytics.totalItemsOrdered}</span><span className="an-kpi-lbl">Items Ordered</span></div>
            </div>
          </section>

          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">Orders per Day</h2>
              <BarChart labels={analytics.ordersByDay.labels} values={analytics.ordersByDay.values} color="var(--color-primary)" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">Spending per Day</h2>
              <LineChart labels={analytics.spendByDay.labels} datasets={[{ values: analytics.spendByDay.values, color: "#22c55e" }]} area />
            </section>
          </div>

          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">Order Status</h2>
              <PieChart slices={analytics.orderStatusSlices} donut />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">Complaint Domains</h2>
              <PieChart slices={analytics.complaintDomainSlices} />
            </section>
          </div>

          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">Complaint Status</h2>
              <PieChart slices={analytics.complaintStatusSlices} donut />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">Favourite Food Items</h2>
              {analytics.favItems.length > 0 ? (
                <BarChart labels={analytics.favItems.map(([n]) => n)} values={analytics.favItems.map(([, v]) => v)} color="#f59e0b" height={180} />
              ) : <div className="an-empty">No order data</div>}
            </section>
          </div>

          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">Complaints per Day</h2>
              <LineChart labels={analytics.complaintsByDay.labels} datasets={[{ values: analytics.complaintsByDay.values, color: "#f87171" }]} area />
            </section>
            <section className="surface-card an-section" />
          </div>
        </>
      )}

      {/* ═══ ORDERS TAB ═══ */}
      {activeTab === "orders" && (
        <section className="surface-card an-section">
          <h2 className="an-section-title">Order History</h2>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Address</th></tr></thead>
              <tbody>
                {orders.length === 0 ? <tr><td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>No orders</td></tr> :
                  orders.map((o, i) => (
                    <tr key={o._id || i}>
                      <td style={{ fontSize: "0.85rem" }}>{new Date(o.createdAt).toLocaleString()}</td>
                      <td>{(o.items || []).map(it => `${it.foodItem?.name || "?"} ×${it.quantity}`).join(", ")}</td>
                      <td><strong>{fmtCur(o.totalPrice || 0)}</strong></td>
                      <td><span className="badge" style={{ background: o.status === "delivered" ? "#22c55e22" : o.status === "cancelled" ? "#f8717122" : "#38bdf822", color: o.status === "delivered" ? "#22c55e" : o.status === "cancelled" ? "#f87171" : "#38bdf8" }}>{o.status}</span></td>
                      <td style={{ fontSize: "0.85rem" }}>{o.deliveryAddress || "—"}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ═══ COMPLAINTS TAB ═══ */}
      {activeTab === "complaints" && (
        <section className="surface-card an-section">
          <h2 className="an-section-title">Complaint History</h2>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>PNR</th><th>Domain</th><th>Description</th><th>Status</th></tr></thead>
              <tbody>
                {complaints.length === 0 ? <tr><td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>No complaints</td></tr> :
                  complaints.map((c, i) => (
                    <tr key={c._id || i}>
                      <td style={{ fontSize: "0.85rem" }}>{new Date(c.createdAt).toLocaleString()}</td>
                      <td>{c.pnr || "—"}</td>
                      <td><span className="badge">{c.issueDomain}</span></td>
                      <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.description}</td>
                      <td><span className="badge" style={{ background: c.status === "Resolved" ? "#22c55e22" : c.status === "Important" ? "#f8717122" : "#f59e0b22", color: c.status === "Resolved" ? "#22c55e" : c.status === "Important" ? "#f87171" : "#f59e0b" }}>{c.status}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ═══ EMERGENCIES TAB ═══ */}
      {activeTab === "emergencies" && (
        <section className="surface-card an-section">
          <h2 className="an-section-title">Emergency History</h2>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Seat</th><th>Status</th></tr></thead>
              <tbody>
                {emergencies.length === 0 ? <tr><td colSpan="3" style={{ textAlign: "center", padding: "2rem" }}>No emergencies</td></tr> :
                  emergencies.map((e, i) => (
                    <tr key={e._id || i}>
                      <td>{new Date(e.createdAt).toLocaleString()}</td>
                      <td>{e.seatNumber || "—"}</td>
                      <td><span className="badge" style={{ background: e.status === "Active" ? "#f8717122" : "#22c55e22", color: e.status === "Active" ? "#f87171" : "#22c55e" }}>{e.status}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ═══ LOST & FOUND TAB ═══ */}
      {activeTab === "lostnfound" && (
        <section className="surface-card an-section">
          <h2 className="an-section-title">Lost & Found History</h2>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Location</th><th>Status</th></tr></thead>
              <tbody>
                {lostFound.length === 0 ? <tr><td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>No items</td></tr> :
                  lostFound.map((lf, i) => (
                    <tr key={lf._id || i}>
                      <td style={{ fontSize: "0.85rem" }}>{new Date(lf.createdAt).toLocaleString()}</td>
                      <td>{lf.title}</td>
                      <td><span className="badge">{lf.category}</span></td>
                      <td>{lf.location || "—"}</td>
                      <td><span className="badge" style={{ background: lf.status === "Resolved" ? "#22c55e22" : "#f59e0b22", color: lf.status === "Resolved" ? "#22c55e" : "#f59e0b" }}>{lf.status}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
};

export default TrainAdminUserDetail;
