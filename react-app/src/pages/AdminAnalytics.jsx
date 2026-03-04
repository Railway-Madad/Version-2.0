import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";

/* ═══════════════════════════════════════════════════════════
   PURE-SVG CHART COMPONENTS — no external libraries needed
   ═══════════════════════════════════════════════════════════ */

/* ── Line / Area chart ── */
const LineChart = ({ labels = [], datasets = [], height = 220, area = false }) => {
  if (!labels.length) return <div className="an-empty">No data available</div>;
  const W = 600, H = height, pad = { t: 20, r: 20, b: 40, l: 55 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const allVals = datasets.flatMap((d) => d.values);
  const maxV = Math.max(...allVals, 1);
  const minV = Math.min(...allVals, 0);
  const range = maxV - minV || 1;
  const x = (i) => pad.l + (i / (labels.length - 1 || 1)) * plotW;
  const y = (v) => pad.t + plotH - ((v - minV) / range) * plotH;
  const gridLines = 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="an-chart-svg">
      {/* grid */}
      {[...Array(gridLines + 1)].map((_, i) => {
        const yy = pad.t + (plotH / gridLines) * i;
        const val = maxV - (range / gridLines) * i;
        return (
          <g key={i}>
            <line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="rgba(148,163,184,0.15)" />
            <text x={pad.l - 8} y={yy + 4} textAnchor="end" className="an-chart-label">
              {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}
            </text>
          </g>
        );
      })}
      {/* x-axis labels */}
      {labels.map((l, i) => {
        if (labels.length > 14 && i % Math.ceil(labels.length / 10) !== 0) return null;
        return (
          <text key={i} x={x(i)} y={H - 5} textAnchor="middle" className="an-chart-label">
            {l}
          </text>
        );
      })}
      {/* datasets */}
      {datasets.map((ds, di) => {
        const pts = ds.values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
        return (
          <g key={di}>
            {area && (
              <polygon
                points={`${x(0)},${y(minV)} ${pts} ${x(ds.values.length - 1)},${y(minV)}`}
                fill={ds.color || "var(--color-primary)"}
                opacity="0.12"
              />
            )}
            <polyline fill="none" stroke={ds.color || "var(--color-primary)"} strokeWidth="2.5" points={pts} />
            {ds.values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={ds.color || "var(--color-primary)"}>
                <title>{`${labels[i]}: ${v}`}</title>
              </circle>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

/* ── Bar chart ── */
const BarChart = ({ labels = [], values = [], color = "var(--color-primary)", height = 220 }) => {
  if (!labels.length || !values.length) return <div className="an-empty">No data available</div>;
  const W = 600, H = height, pad = { t: 20, r: 20, b: 50, l: 55 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const maxV = Math.max(...values, 1);
  const barW = Math.min(plotW / labels.length * 0.6, 40);
  const gap = plotW / labels.length;
  const gridLines = 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="an-chart-svg">
      {[...Array(gridLines + 1)].map((_, i) => {
        const yy = pad.t + (plotH / gridLines) * i;
        const val = maxV - (maxV / gridLines) * i;
        return (
          <g key={i}>
            <line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="rgba(148,163,184,0.15)" />
            <text x={pad.l - 8} y={yy + 4} textAnchor="end" className="an-chart-label">
              {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}
            </text>
          </g>
        );
      })}
      {values.map((v, i) => {
        const bh = (v / maxV) * plotH;
        const bx = pad.l + gap * i + (gap - barW) / 2;
        const by = pad.t + plotH - bh;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={bh} rx="4" fill={color} opacity="0.85">
              <title>{`${labels[i]}: ${v}`}</title>
            </rect>
            <text x={bx + barW / 2} y={H - 8} textAnchor="middle" className="an-chart-label" transform={labels.length > 10 ? `rotate(-35, ${bx + barW / 2}, ${H - 8})` : ""}>
              {labels[i]?.length > 8 ? labels[i].slice(0, 8) + "…" : labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ── Pie / Donut chart ── */
const PieChart = ({ slices = [], donut = false, size = 200 }) => {
  if (!slices.length) return <div className="an-empty">No data available</div>;
  const total = slices.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 10, cx = size / 2, cy = size / 2;
  let cumAngle = -90;
  const colors = ["#38bdf8", "#a855f7", "#f59e0b", "#22c55e", "#f87171", "#818cf8", "#fb923c", "#14b8a6"];

  const arcs = slices.map((s, i) => {
    const angle = (s.value / total) * 360;
    const startRad = (cumAngle * Math.PI) / 180;
    const endRad = ((cumAngle + angle) * Math.PI) / 180;
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
    return (
      <path key={i} d={path} fill={s.color || colors[i % colors.length]} opacity="0.88">
        <title>{`${s.label}: ${s.value} (${((s.value / total) * 100).toFixed(1)}%)`}</title>
      </path>
    );
  });

  return (
    <div className="an-pie-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>{arcs}</svg>
      <div className="an-pie-legend">
        {slices.map((s, i) => (
          <div key={i} className="an-legend-item">
            <span className="an-legend-dot" style={{ background: s.color || colors[i % colors.length] }} />
            <span>{s.label}</span>
            <strong>{((s.value / total) * 100).toFixed(1)}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Gauge ── */
const Gauge = ({ value, max = 5, label = "" }) => {
  if (value == null) return <div className="an-empty">No data</div>;
  const clamped = Math.max(0, Math.min(max, Number(value)));
  const r = 36, c = 2 * Math.PI * r;
  const pct = clamped / max;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="90" height="80">
        <circle r={r} cx="45" cy="42" fill="none" stroke="rgba(71,85,105,0.3)" strokeWidth="12" />
        <circle r={r} cx="45" cy="42" fill="none" stroke="#34d399" strokeWidth="10" strokeDasharray={`${pct * c} ${c}`} strokeDashoffset={-c * 0.25} strokeLinecap="round" />
        <text x="45" y="44" textAnchor="middle" dominantBaseline="middle" fill="#e2e8f0" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
          {Number(value).toFixed(1)}
        </text>
      </svg>
      {label && <div className="an-gauge-label">{label}</div>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   HELPER UTILITIES
   ═══════════════════════════════════════════════════════════ */
const fmt = (n) => (n >= 100000 ? `${(n / 100000).toFixed(2)}L` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toFixed(0));
const fmtCur = (n) => `₹${fmt(n)}`;
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) : "0.0");
const dayKey = (d) => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth() + 1}`; };
const weekKey = (d) => { const dt = new Date(d); const oneJan = new Date(dt.getFullYear(), 0, 1); const w = Math.ceil(((dt - oneJan) / 86400000 + oneJan.getDay() + 1) / 7); return `W${w}'${String(dt.getFullYear()).slice(2)}`; };
const monthKey = (d) => { const dt = new Date(d); return `${dt.toLocaleString("default", { month: "short" })}'${String(dt.getFullYear()).slice(2)}`; };
const yearKey = (d) => String(new Date(d).getFullYear());
const hourKey = (d) => { const h = new Date(d).getHours(); return `${h}:00`; };

const isToday = (d) => { const dt = new Date(d), now = new Date(); return dt.toDateString() === now.toDateString(); };
const isThisWeek = (d) => { const dt = new Date(d), now = new Date(); const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0); return dt >= start; };

const groupBy = (arr, keyFn) => {
  const map = new Map();
  arr.forEach((item) => { const k = keyFn(item); map.set(k, (map.get(k) || 0) + 1); });
  return map;
};
const groupSum = (arr, keyFn, valFn) => {
  const map = new Map();
  arr.forEach((item) => { const k = keyFn(item); map.set(k, (map.get(k) || 0) + valFn(item)); });
  return map;
};
const sortedEntries = (map) => { const e = [...map.entries()]; return { labels: e.map((x) => x[0]), values: e.map((x) => x[1]) }; };
const topN = (map, n = 5) => { const e = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n); return { labels: e.map((x) => x[0]), values: e.map((x) => x[1]) }; };
const growthPct = (arr) => { if (arr.length < 2) return "N/A"; const prev = arr[arr.length - 2]; const cur = arr[arr.length - 1]; return prev ? `${(((cur - prev) / prev) * 100).toFixed(1)}%` : "N/A"; };

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
const AdminAnalytics = () => {
  const { apiBase } = useApi();
  const { theme, toggleTheme } = useTheme();

  /* ── raw data state ── */
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ── filters ── */
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  /* ── single fetch on mount ── */
  useEffect(() => {
    let cancel = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ordersRes, complaintsRes, fbStatsRes, fbAllRes, foodRes] = await Promise.all([
          fetch(`${apiBase}/admin/train-orders`, { credentials: "include" }).then((r) => r.json()),
          fetch(`${apiBase}/admin/train-complaints`, { credentials: "include" }).then((r) => r.json()),
          fetch(`${apiBase}/feedback/stats`, { credentials: "include" }).then((r) => r.json()),
          fetch(`${apiBase}/feedback`, { credentials: "include" }).then((r) => r.json()),
          fetch(`${apiBase}/food`, { credentials: "include" }).then((r) => r.json()),
        ]);
        if (cancel) return;
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : Array.isArray(ordersRes) ? ordersRes : []);
        setComplaints(Array.isArray(complaintsRes.data) ? complaintsRes.data : Array.isArray(complaintsRes) ? complaintsRes : []);
        setFeedbackStats(fbStatsRes.stats || fbStatsRes || null);
        setAllFeedbacks(Array.isArray(fbAllRes.data || fbAllRes) ? fbAllRes.data || fbAllRes : []);
        setMenuItems(Array.isArray(foodRes.data || foodRes) ? foodRes.data || foodRes : []);
      } catch (err) {
        if (!cancel) setError("Failed to load analytics data. Please try again.");
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    return () => { cancel = true; };
  }, [apiBase]);

  /* ═══ SECTION A: Fixed Core Metrics (always visible) ═══ */
  const coreMetrics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const cancelled = orders.filter((o) => (o.status || "").toLowerCase() === "cancelled");
    const cancelledRevenue = cancelled.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const netRevenue = totalRevenue - cancelledRevenue;
    const cancellationPct = totalOrders ? ((cancelled.length / totalOrders) * 100).toFixed(1) : "0.0";

    const todayOrders = orders.filter((o) => isToday(o.createdAt));
    const todayRevenue = todayOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const weekOrders = orders.filter((o) => isThisWeek(o.createdAt));
    const weekRevenue = weekOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);

    const userSet = new Set(orders.map((o) => o.user?._id || o.user).filter(Boolean));
    const userOrderCount = {};
    orders.forEach((o) => { const uid = o.user?._id || o.user; if (uid) userOrderCount[uid] = (userOrderCount[uid] || 0) + 1; });
    const returning = Object.values(userOrderCount).filter((c) => c > 1).length;
    const newUsers = userSet.size - returning;

    return {
      totalOrders, totalRevenue, netRevenue,
      totalFoodRevenue: totalRevenue, // all revenue is food-based in this system
      totalRefund: cancelledRevenue,
      cancellationPct,
      ordersToday: todayOrders.length, revenueToday: todayRevenue,
      ordersWeek: weekOrders.length, revenueWeek: weekRevenue,
      returning, newUsers,
    };
  }, [orders]);

  /* ═══ SECTION B: Filtered data ═══ */
  const filteredOrders = useMemo(() => {
    let list = [...orders];
    if (dateFrom) { const from = new Date(dateFrom); from.setHours(0, 0, 0, 0); list = list.filter((o) => new Date(o.createdAt) >= from); }
    if (dateTo) { const to = new Date(dateTo); to.setHours(23, 59, 59, 999); list = list.filter((o) => new Date(o.createdAt) <= to); }
    if (statusFilter !== "all") list = list.filter((o) => o.status === statusFilter);
    return list;
  }, [orders, dateFrom, dateTo, statusFilter]);

  const filteredFoodItems = useMemo(() => {
    if (categoryFilter === "all") return menuItems;
    return menuItems.filter((i) => i.category === categoryFilter);
  }, [menuItems, categoryFilter]);

  const categories = useMemo(() => [...new Set(menuItems.map((i) => i.category).filter(Boolean))], [menuItems]);
  const statuses = useMemo(() => [...new Set(orders.map((o) => o.status).filter(Boolean))], [orders]);

  /* ── Orders Analytics ── */
  const ordersAnalytics = useMemo(() => {
    const byDay = groupBy(filteredOrders, (o) => dayKey(o.createdAt));
    const byWeek = groupBy(filteredOrders, (o) => weekKey(o.createdAt));
    const byMonth = groupBy(filteredOrders, (o) => monthKey(o.createdAt));
    const byYear = groupBy(filteredOrders, (o) => yearKey(o.createdAt));
    const byHour = groupBy(filteredOrders, (o) => hourKey(o.createdAt));
    const byStatus = groupBy(filteredOrders, (o) => o.status || "unknown");
    const dayValues = [...byDay.values()];
    const weekValues = [...byWeek.values()];
    const monthValues = [...byMonth.values()];

    return {
      byDay: sortedEntries(byDay), byWeek: sortedEntries(byWeek),
      byMonth: sortedEntries(byMonth), byYear: sortedEntries(byYear),
      byHour: sortedEntries(byHour), byStatus: sortedEntries(byStatus),
      dodGrowth: growthPct(dayValues), wowGrowth: growthPct(weekValues), momGrowth: growthPct(monthValues),
    };
  }, [filteredOrders]);

  /* ── Revenue Analytics ── */
  const revenueAnalytics = useMemo(() => {
    const byDay = groupSum(filteredOrders, (o) => dayKey(o.createdAt), (o) => o.totalPrice || 0);
    const byWeek = groupSum(filteredOrders, (o) => weekKey(o.createdAt), (o) => o.totalPrice || 0);
    const byMonth = groupSum(filteredOrders, (o) => monthKey(o.createdAt), (o) => o.totalPrice || 0);
    const top5Days = topN(byDay, 5);
    const cancelledRev = filteredOrders.filter((o) => o.status === "cancelled").reduce((s, o) => s + (o.totalPrice || 0), 0);
    const totalRev = filteredOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const refundImpact = totalRev ? ((cancelledRev / totalRev) * 100).toFixed(1) : "0.0";

    return {
      byDay: sortedEntries(byDay), byWeek: sortedEntries(byWeek), byMonth: sortedEntries(byMonth),
      top5Days, refundImpact, cancelledRev, totalRev,
    };
  }, [filteredOrders]);

  /* ── Food Analytics ── */
  const foodAnalytics = useMemo(() => {
    // Flatten all order items
    const allItems = [];
    filteredOrders.forEach((o) => {
      (o.items || []).forEach((it) => {
        allItems.push({
          name: it.foodItem?.name || "Unknown",
          category: menuItems.find((m) => m._id === (it.foodItem?._id || it.foodItem))?.category || "Other",
          qty: it.quantity || 1,
          revenue: (it.priceAtOrder || 0) * (it.quantity || 1),
          date: o.createdAt,
        });
      });
    });

    const itemQty = new Map();
    const itemRev = new Map();
    const catRev = new Map();
    const catQty = new Map();
    allItems.forEach((it) => {
      itemQty.set(it.name, (itemQty.get(it.name) || 0) + it.qty);
      itemRev.set(it.name, (itemRev.get(it.name) || 0) + it.revenue);
      catRev.set(it.category, (catRev.get(it.category) || 0) + it.revenue);
      catQty.set(it.category, (catQty.get(it.category) || 0) + it.qty);
    });

    const top5 = topN(itemQty, 5);
    const bottom5 = (() => { const e = [...itemQty.entries()].sort((a, b) => a[1] - b[1]).slice(0, 5); return { labels: e.map((x) => x[0]), values: e.map((x) => x[1]) }; })();
    const mostOrdered = top5.labels[0] || "N/A";
    const leastOrdered = bottom5.labels[0] || "N/A";

    const foodByDay = groupSum(allItems, (it) => dayKey(it.date), (it) => it.qty);
    const foodRevByDay = groupSum(allItems, (it) => dayKey(it.date), (it) => it.revenue);

    const totalFoodItems = allItems.reduce((s, it) => s + it.qty, 0);
    const avgItemsPerOrder = filteredOrders.length ? (totalFoodItems / filteredOrders.length).toFixed(1) : "0";

    return {
      top5, bottom5, mostOrdered, leastOrdered,
      byDay: sortedEntries(foodByDay), revByDay: sortedEntries(foodRevByDay),
      itemRevenue: sortedEntries(itemRev),
      categoryDist: [...catQty.entries()].map(([label, value]) => ({ label, value })),
      categoryRevDist: [...catRev.entries()].map(([label, value]) => ({ label, value })),
      avgItemsPerOrder, totalFoodItems,
      itemRanking: [...itemQty.entries()].sort((a, b) => b[1] - a[1]).map(([name, qty], idx) => ({
        rank: idx + 1, name, qty, revenue: itemRev.get(name) || 0,
      })),
    };
  }, [filteredOrders, menuItems]);

  /* ── Payment Analytics (simulated from status since no payment method in schema) ── */
  const paymentAnalytics = useMemo(() => {
    const statusDist = groupBy(filteredOrders, (o) => o.status || "unknown");
    return {
      statusSlices: [...statusDist.entries()].map(([label, value]) => ({ label, value })),
    };
  }, [filteredOrders]);

  /* ── User Analytics ── */
  const userAnalytics = useMemo(() => {
    const hourDist = groupBy(orders, (o) => hourKey(o.createdAt));
    return {
      activityByHour: sortedEntries(hourDist),
      returning: coreMetrics.returning,
      newUsers: coreMetrics.newUsers,
    };
  }, [orders, coreMetrics]);

  /* ── Complaints Analytics ── */
  const complaintAnalytics = useMemo(() => {
    const byDay = groupBy(complaints, (c) => dayKey(c.createdAt));
    const byDomain = groupBy(complaints, (c) => c.issueDomain || "Other");
    const resolved = complaints.filter((c) => (c.status || "").toLowerCase() === "resolved").length;
    return {
      byDay: sortedEntries(byDay),
      domainSlices: [...byDomain.entries()].map(([label, value]) => ({ label, value })),
      total: complaints.length, resolved,
    };
  }, [complaints]);

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  if (loading) {
    return (
      <main className="page-shell fade-in">
        <section className="surface-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="an-spinner" />
          <p className="muted-text" style={{ marginTop: "1rem" }}>Loading analytics data…</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell fade-in">
        <section className="surface-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <p style={{ color: "var(--color-danger)", fontWeight: 600, fontSize: "1.1rem" }}>{error}</p>
          <button className="btn" onClick={() => window.location.reload()} style={{ marginTop: "1rem" }}>Retry</button>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell fade-in an-page">
      {/* ── Header ── */}
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Analytics Dashboard</h1>
            <p className="muted-text">Comprehensive insights from live data — all metrics are DB-driven</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn btn-ghost" onClick={toggleTheme} title={`Toggle ${theme === "light" ? "dark" : "light"} theme`}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <Link className="btn btn-ghost" to="/admindashboard">← Back</Link>
          </div>
        </div>
      </section>

      {/* ═══ SECTION A: Fixed Core Metrics ═══ */}
      <section className="surface-card an-section">
        <h2 className="an-section-title">Core Metrics <span className="badge">Always Live</span></h2>
        <div className="an-kpi-grid">
          <div className="an-kpi"><span className="an-kpi-val">{coreMetrics.totalOrders}</span><span className="an-kpi-lbl">Total Orders</span></div>
          <div className="an-kpi"><span className="an-kpi-val">{fmtCur(coreMetrics.totalRevenue)}</span><span className="an-kpi-lbl">Total Revenue</span></div>
          <div className="an-kpi"><span className="an-kpi-val">{fmtCur(coreMetrics.netRevenue)}</span><span className="an-kpi-lbl">Net Revenue</span></div>
          <div className="an-kpi"><span className="an-kpi-val">{fmtCur(coreMetrics.totalFoodRevenue)}</span><span className="an-kpi-lbl">Food Revenue</span></div>
          <div className="an-kpi"><span className="an-kpi-val">{fmtCur(coreMetrics.totalRefund)}</span><span className="an-kpi-lbl">Refund / Cancelled</span></div>
          <div className="an-kpi an-kpi-warn"><span className="an-kpi-val">{coreMetrics.cancellationPct}%</span><span className="an-kpi-lbl">Cancellation %</span></div>
          <div className="an-kpi"><span className="an-kpi-val">{coreMetrics.ordersToday}</span><span className="an-kpi-lbl">Orders Today</span></div>
          <div className="an-kpi"><span className="an-kpi-val">{fmtCur(coreMetrics.revenueToday)}</span><span className="an-kpi-lbl">Revenue Today</span></div>
          <div className="an-kpi"><span className="an-kpi-val">{coreMetrics.ordersWeek}</span><span className="an-kpi-lbl">Orders This Week</span></div>
          <div className="an-kpi"><span className="an-kpi-val">{fmtCur(coreMetrics.revenueWeek)}</span><span className="an-kpi-lbl">Revenue This Week</span></div>
          <div className="an-kpi"><span className="an-kpi-val">{coreMetrics.returning}</span><span className="an-kpi-lbl">Returning Users</span></div>
          <div className="an-kpi"><span className="an-kpi-val">{coreMetrics.newUsers}</span><span className="an-kpi-lbl">New Users</span></div>
        </div>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginTop: "1.5rem", justifyContent: "center" }}>
          <Gauge value={feedbackStats?.averageRating} label={`Avg Rating (${feedbackStats?.totalFeedbacks ?? 0} feedbacks)`} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.2rem", fontWeight: 700 }}>{complaintAnalytics.resolved}/{complaintAnalytics.total}</div>
            <div className="an-gauge-label">Complaints Resolved</div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION B: Filters ═══ */}
      <section className="surface-card an-section">
        <h2 className="an-section-title">Filters</h2>
        <div className="an-filter-bar">
          <div className="an-filter-group">
            <label>From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="an-filter-group">
            <label>To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="an-filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="an-filter-group">
            <label>Food Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-ghost" onClick={() => { setDateFrom(""); setDateTo(""); setStatusFilter("all"); setCategoryFilter("all"); }}>Reset</button>
        </div>
        <p className="muted-text" style={{ marginTop: "0.5rem" }}>Showing {filteredOrders.length} of {orders.length} orders</p>
      </section>

      {/* ═══ Orders & Revenue Graphs (Side by Side) ═══ */}
      <div className="an-two-col">
        <section className="surface-card an-section">
          <h2 className="an-section-title">Orders per Day <span className="badge">{ordersAnalytics.dodGrowth} DoD</span></h2>
          <BarChart labels={ordersAnalytics.byDay.labels} values={ordersAnalytics.byDay.values} color="var(--color-primary)" />
        </section>
        <section className="surface-card an-section">
          <h2 className="an-section-title">Revenue per Day</h2>
          <LineChart labels={revenueAnalytics.byDay.labels} datasets={[{ values: revenueAnalytics.byDay.values, color: "#22c55e" }]} />
        </section>
      </div>

      <div className="an-two-col">
        <section className="surface-card an-section">
          <h2 className="an-section-title">Orders per Week <span className="badge">{ordersAnalytics.wowGrowth} WoW</span></h2>
          <BarChart labels={ordersAnalytics.byWeek.labels} values={ordersAnalytics.byWeek.values} color="#818cf8" />
        </section>
        <section className="surface-card an-section">
          <h2 className="an-section-title">Revenue per Week</h2>
          <LineChart labels={revenueAnalytics.byWeek.labels} datasets={[{ values: revenueAnalytics.byWeek.values, color: "#f59e0b" }]} />
        </section>
      </div>

      <div className="an-two-col">
        <section className="surface-card an-section">
          <h2 className="an-section-title">Orders per Month <span className="badge">{ordersAnalytics.momGrowth} MoM</span></h2>
          <BarChart labels={ordersAnalytics.byMonth.labels} values={ordersAnalytics.byMonth.values} color="#a855f7" />
        </section>
        <section className="surface-card an-section">
          <h2 className="an-section-title">Revenue per Month</h2>
          <LineChart labels={revenueAnalytics.byMonth.labels} datasets={[{ values: revenueAnalytics.byMonth.values, color: "#38bdf8" }]} />
        </section>
      </div>

      <div className="an-two-col">
        <section className="surface-card an-section">
          <h2 className="an-section-title">Orders by Hour</h2>
          <BarChart labels={ordersAnalytics.byHour.labels} values={ordersAnalytics.byHour.values} color="#14b8a6" />
        </section>
        <section className="surface-card an-section">
          <h2 className="an-section-title">Orders by Status</h2>
          <PieChart slices={ordersAnalytics.byStatus.labels.map((l, i) => ({ label: l, value: ordersAnalytics.byStatus.values[i] }))} donut />
        </section>
      </div>

      <div className="an-two-col">
        <section className="surface-card an-section">
          <h2 className="an-section-title">Top 5 Revenue Days</h2>
          <BarChart labels={revenueAnalytics.top5Days.labels} values={revenueAnalytics.top5Days.values} color="#22c55e" height={180} />
        </section>
        <section className="surface-card an-section">
          <h2 className="an-section-title">Revenue Metrics</h2>
          <div className="an-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
            <div className="an-kpi"><span className="an-kpi-val">{fmtCur(revenueAnalytics.totalRev)}</span><span className="an-kpi-lbl">Filtered Revenue</span></div>
            <div className="an-kpi an-kpi-warn"><span className="an-kpi-val">{revenueAnalytics.refundImpact}%</span><span className="an-kpi-lbl">Refund Impact</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{fmtCur(revenueAnalytics.cancelledRev)}</span><span className="an-kpi-lbl">Cancelled Rev</span></div>
          </div>
        </section>
      </div>

      {/* ═══ Food Analytics Section ═══ */}
      <section className="surface-card an-section">
        <h2 className="an-section-title">🍽️ Food Analytics</h2>
        <div className="an-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: "1.5rem" }}>
          <div className="an-kpi"><span className="an-kpi-val">{foodAnalytics.totalFoodItems}</span><span className="an-kpi-lbl">Total Items Sold</span></div>
          <div className="an-kpi"><span className="an-kpi-val">{foodAnalytics.avgItemsPerOrder}</span><span className="an-kpi-lbl">Avg Items/Order</span></div>
          <div className="an-kpi"><span className="an-kpi-val" title={foodAnalytics.mostOrdered}>{foodAnalytics.mostOrdered.length > 14 ? foodAnalytics.mostOrdered.slice(0, 14) + "…" : foodAnalytics.mostOrdered}</span><span className="an-kpi-lbl">Most Ordered</span></div>
          <div className="an-kpi"><span className="an-kpi-val" title={foodAnalytics.leastOrdered}>{foodAnalytics.leastOrdered.length > 14 ? foodAnalytics.leastOrdered.slice(0, 14) + "…" : foodAnalytics.leastOrdered}</span><span className="an-kpi-lbl">Least Ordered</span></div>
        </div>
      </section>

      <div className="an-two-col">
        <section className="surface-card an-section">
          <h2 className="an-section-title">Top 5 Food Items</h2>
          <BarChart labels={foodAnalytics.top5.labels} values={foodAnalytics.top5.values} color="#f59e0b" height={200} />
        </section>
        <section className="surface-card an-section">
          <h2 className="an-section-title">Food Category Distribution</h2>
          <PieChart slices={foodAnalytics.categoryDist} />
        </section>
      </div>

      <div className="an-two-col">
        <section className="surface-card an-section">
          <h2 className="an-section-title">Food Sales Trend (qty/day)</h2>
          <LineChart labels={foodAnalytics.byDay.labels} datasets={[{ values: foodAnalytics.byDay.values, color: "#fb923c" }]} area />
        </section>
        <section className="surface-card an-section">
          <h2 className="an-section-title">Food Revenue per Day</h2>
          <LineChart labels={foodAnalytics.revByDay.labels} datasets={[{ values: foodAnalytics.revByDay.values, color: "#a855f7" }]} />
        </section>
      </div>

      {/* Item Ranking Table */}
      <section className="surface-card an-section">
        <h2 className="an-section-title">Item Ranking Table</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Qty Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {foodAnalytics.itemRanking.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: "center", padding: "1.5rem" }}>No food order data available</td></tr>
              ) : (
                foodAnalytics.itemRanking.slice(0, 15).map((r) => (
                  <tr key={r.rank}>
                    <td><strong>{r.rank}</strong></td>
                    <td>{r.name}</td>
                    <td>{r.qty}</td>
                    <td>{fmtCur(r.revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="an-two-col">
        <section className="surface-card an-section">
          <h2 className="an-section-title">Food Revenue by Item</h2>
          <BarChart labels={foodAnalytics.itemRevenue.labels.slice(0, 10)} values={foodAnalytics.itemRevenue.values.slice(0, 10)} color="#14b8a6" height={200} />
        </section>
        <section className="surface-card an-section">
          <h2 className="an-section-title">Category Revenue</h2>
          <PieChart slices={foodAnalytics.categoryRevDist} donut />
        </section>
      </div>

      {/* ═══ User & Complaint Analytics ═══ */}
      <div className="an-two-col">
        <section className="surface-card an-section">
          <h2 className="an-section-title">👤 User Activity by Hour</h2>
          <BarChart labels={userAnalytics.activityByHour.labels} values={userAnalytics.activityByHour.values} color="#818cf8" height={200} />
        </section>
        <section className="surface-card an-section">
          <h2 className="an-section-title">Returning vs New Users</h2>
          <PieChart slices={[
            { label: "Returning", value: userAnalytics.returning, color: "#38bdf8" },
            { label: "New", value: userAnalytics.newUsers, color: "#a855f7" },
          ]} donut size={180} />
        </section>
      </div>

      <div className="an-two-col">
        <section className="surface-card an-section">
          <h2 className="an-section-title">Complaints per Day</h2>
          <LineChart labels={complaintAnalytics.byDay.labels} datasets={[{ values: complaintAnalytics.byDay.values, color: "#f87171" }]} area />
        </section>
        <section className="surface-card an-section">
          <h2 className="an-section-title">Complaints by Domain</h2>
          <PieChart slices={complaintAnalytics.domainSlices} />
        </section>
      </div>

      {/* ═══ Feedback Breakdown ═══ */}
      <section className="surface-card an-section">
        <h2 className="an-section-title">⭐ Feedback Breakdown</h2>
        {allFeedbacks.length === 0 ? (
          <div className="an-empty">No feedback data available</div>
        ) : (
          <div className="an-two-col">
            <div>
              <h3 style={{ marginBottom: "0.75rem" }}>Rating Distribution</h3>
              <BarChart
                labels={["1★", "2★", "3★", "4★", "5★"]}
                values={[1, 2, 3, 4, 5].map((r) => allFeedbacks.filter((f) => Math.round(f.rating) === r).length)}
                color="#facc15"
                height={180}
              />
            </div>
            <div>
              <h3 style={{ marginBottom: "0.75rem" }}>Feedback Over Time</h3>
              <LineChart
                labels={sortedEntries(groupBy(allFeedbacks, (f) => dayKey(f.createdAt))).labels}
                datasets={[{ values: sortedEntries(groupBy(allFeedbacks, (f) => dayKey(f.createdAt))).values, color: "#34d399" }]}
              />
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminAnalytics;
