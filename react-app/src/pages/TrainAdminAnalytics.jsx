import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";

/* ═══════════════════════════════════════════════════════════════════
   PURE-SVG CHART COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

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
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="an-chart-svg">
      {[...Array(5)].map((_, i) => {
        const yy = pad.t + (plotH / 5) * i;
        const val = maxV - (range / 5) * i;
        return (<g key={i}><line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="rgba(148,163,184,0.15)" /><text x={pad.l - 8} y={yy + 4} textAnchor="end" className="an-chart-label">{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}</text></g>);
      })}
      {labels.map((l, i) => {
        if (labels.length > 14 && i % Math.ceil(labels.length / 10) !== 0) return null;
        return <text key={i} x={x(i)} y={H - 5} textAnchor="middle" className="an-chart-label">{l}</text>;
      })}
      {datasets.map((ds, di) => {
        const pts = ds.values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
        return (<g key={di}>{area && <polygon points={`${x(0)},${y(minV)} ${pts} ${x(ds.values.length - 1)},${y(minV)}`} fill={ds.color || "var(--color-primary)"} opacity="0.12" />}<polyline fill="none" stroke={ds.color || "var(--color-primary)"} strokeWidth="2.5" points={pts} />{ds.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={ds.color || "var(--color-primary)"}><title>{`${labels[i]}: ${v}`}</title></circle>)}</g>);
      })}
    </svg>
  );
};

const BarChart = ({ labels = [], values = [], color = "var(--color-primary)", height = 220, onBarClick }) => {
  if (!labels.length || !values.length) return <div className="an-empty">No data available</div>;
  const W = 600, H = height, pad = { t: 20, r: 20, b: 50, l: 55 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const maxV = Math.max(...values, 1);
  const barW = Math.min(plotW / labels.length * 0.6, 40);
  const gap = plotW / labels.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="an-chart-svg">
      {[...Array(5)].map((_, i) => {
        const yy = pad.t + (plotH / 5) * i;
        const val = maxV - (maxV / 5) * i;
        return (<g key={i}><line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="rgba(148,163,184,0.15)" /><text x={pad.l - 8} y={yy + 4} textAnchor="end" className="an-chart-label">{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}</text></g>);
      })}
      {values.map((v, i) => {
        const bh = (v / maxV) * plotH;
        const bx = pad.l + gap * i + (gap - barW) / 2;
        const by = pad.t + plotH - bh;
        return (<g key={i} style={onBarClick ? { cursor: "pointer" } : {}} onClick={() => onBarClick && onBarClick(labels[i], i)}><rect x={bx} y={by} width={barW} height={bh} rx="4" fill={color} opacity="0.85"><title>{`${labels[i]}: ${v}`}</title></rect><text x={bx + barW / 2} y={H - 8} textAnchor="middle" className="an-chart-label" transform={labels.length > 10 ? `rotate(-35, ${bx + barW / 2}, ${H - 8})` : ""}>{labels[i]?.length > 8 ? labels[i].slice(0, 8) + "…" : labels[i]}</text></g>);
      })}
    </svg>
  );
};

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
    const path = donut ? `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${ix1},${iy1} A${ir},${ir} 0 ${large} 0 ${ix2},${iy2} Z` : `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
    cumAngle += angle;
    return <path key={i} d={path} fill={s.color || colors[i % colors.length]} opacity="0.88"><title>{`${s.label}: ${s.value} (${((s.value / total) * 100).toFixed(1)}%)`}</title></path>;
  });
  return (
    <div className="an-pie-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>{arcs}</svg>
      <div className="an-pie-legend">{slices.map((s, i) => <div key={i} className="an-legend-item"><span className="an-legend-dot" style={{ background: s.color || colors[i % colors.length] }} /><span>{s.label}</span><strong>{((s.value / total) * 100).toFixed(1)}%</strong></div>)}</div>
    </div>
  );
};

const Gauge = ({ value, max = 5, label = "" }) => {
  if (value == null) return <div className="an-empty">No data</div>;
  const clamped = Math.max(0, Math.min(max, Number(value)));
  const r = 36, c = 2 * Math.PI * r, pct = clamped / max;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="90" height="80"><circle r={r} cx="45" cy="42" fill="none" stroke="rgba(71,85,105,0.3)" strokeWidth="12" /><circle r={r} cx="45" cy="42" fill="none" stroke="#34d399" strokeWidth="10" strokeDasharray={`${pct * c} ${c}`} strokeDashoffset={-c * 0.25} strokeLinecap="round" /><text x="45" y="44" textAnchor="middle" dominantBaseline="middle" fill="#e2e8f0" style={{ fontSize: "1.4rem", fontWeight: 700 }}>{Number(value).toFixed(1)}</text></svg>
      {label && <div className="an-gauge-label">{label}</div>}
    </div>
  );
};

const StackedBarChart = ({ labels = [], stacks = [], height = 220 }) => {
  if (!labels.length || !stacks.length) return <div className="an-empty">No data available</div>;
  const W = 600, H = height, pad = { t: 20, r: 20, b: 50, l: 55 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const colors = ["#38bdf8", "#a855f7", "#f59e0b", "#22c55e", "#f87171", "#818cf8"];
  const totals = labels.map((_, li) => stacks.reduce((s, st) => s + (st.values[li] || 0), 0));
  const maxV = Math.max(...totals, 1);
  const barW = Math.min(plotW / labels.length * 0.6, 40);
  const gap = plotW / labels.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="an-chart-svg">
      {[...Array(5)].map((_, i) => { const yy = pad.t + (plotH / 5) * i; const val = maxV - (maxV / 5) * i; return (<g key={i}><line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="rgba(148,163,184,0.15)" /><text x={pad.l - 8} y={yy + 4} textAnchor="end" className="an-chart-label">{Math.round(val)}</text></g>); })}
      {labels.map((l, li) => {
        let cumH = 0;
        const bx = pad.l + gap * li + (gap - barW) / 2;
        return (<g key={li}>{stacks.map((st, si) => { const v = st.values[li] || 0; const bh = (v / maxV) * plotH; const by = pad.t + plotH - cumH - bh; cumH += bh; return <rect key={si} x={bx} y={by} width={barW} height={bh} rx="2" fill={colors[si % colors.length]} opacity="0.85"><title>{`${l} - ${st.name}: ${v}`}</title></rect>; })}<text x={bx + barW / 2} y={H - 8} textAnchor="middle" className="an-chart-label">{l?.length > 8 ? l.slice(0, 8) + "…" : l}</text></g>);
      })}
      <g transform={`translate(${W - pad.r + 5}, ${pad.t})`}>{stacks.map((st, i) => <g key={i} transform={`translate(0, ${i * 16})`}><rect width="10" height="10" rx="2" fill={colors[i % colors.length]} /><text x="14" y="9" className="an-chart-label" style={{ fontSize: "9px" }}>{st.name}</text></g>)}</g>
    </svg>
  );
};

const HeatMap = ({ data = [], xLabels = [], yLabels = [], colorScale = ["#1e293b", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444"] }) => {
  if (!data.length || !xLabels.length || !yLabels.length) return <div className="an-empty">No data available</div>;
  const maxV = Math.max(...data.flat(), 1);
  const cellW = 36, cellH = 24, padL = 50, padT = 25;
  const getColor = (v) => { const idx = Math.min(Math.floor((v / maxV) * (colorScale.length - 1)), colorScale.length - 1); return colorScale[idx]; };
  return (
    <svg viewBox={`0 0 ${padL + xLabels.length * cellW + 10} ${padT + yLabels.length * cellH + 10}`} className="an-chart-svg">
      {xLabels.map((l, i) => <text key={i} x={padL + i * cellW + cellW / 2} y={padT - 6} textAnchor="middle" className="an-chart-label" style={{ fontSize: "8px" }}>{l}</text>)}
      {yLabels.map((l, yi) => (<g key={yi}><text x={padL - 5} y={padT + yi * cellH + cellH / 2 + 3} textAnchor="end" className="an-chart-label" style={{ fontSize: "8px" }}>{l}</text>{xLabels.map((_, xi) => <rect key={xi} x={padL + xi * cellW} y={padT + yi * cellH} width={cellW - 2} height={cellH - 2} rx="3" fill={getColor(data[yi]?.[xi] || 0)} opacity="0.9"><title>{`${yLabels[yi]} ${xLabels[xi]}: ${data[yi]?.[xi] || 0}`}</title></rect>)}</g>))}
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   UTILITY HELPERS
   ═══════════════════════════════════════════════════════════════════ */
const fmt = (n) => (n >= 100000 ? `${(n / 100000).toFixed(2)}L` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toFixed(0));
const fmtCur = (n) => `₹${fmt(n)}`;
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) : "0.0");
const dayKey = (d) => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth() + 1}`; };
const weekKey = (d) => { const dt = new Date(d); const oneJan = new Date(dt.getFullYear(), 0, 1); const w = Math.ceil(((dt - oneJan) / 86400000 + oneJan.getDay() + 1) / 7); return `W${w}`; };
const monthKey = (d) => new Date(d).toLocaleString("default", { month: "short" });
const hourKey = (d) => `${new Date(d).getHours()}:00`;
const dowKey = (d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(d).getDay()];

const groupBy = (arr, keyFn) => { const m = new Map(); arr.forEach((it) => { const k = keyFn(it); m.set(k, (m.get(k) || 0) + 1); }); return m; };
const groupSum = (arr, keyFn, valFn) => { const m = new Map(); arr.forEach((it) => { const k = keyFn(it); m.set(k, (m.get(k) || 0) + valFn(it)); }); return m; };
const sortedEntries = (map) => { const e = [...map.entries()]; return { labels: e.map((x) => x[0]), values: e.map((x) => x[1]) }; };
const topN = (map, n = 5) => { const e = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n); return { labels: e.map((x) => x[0]), values: e.map((x) => x[1]) }; };
const bottomN = (map, n = 5) => { const e = [...map.entries()].sort((a, b) => a[1] - b[1]).slice(0, n); return { labels: e.map((x) => x[0]), values: e.map((x) => x[1]) }; };
const median = (arr) => { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const stdDev = (arr) => { if (arr.length < 2) return 0; const avg = arr.reduce((s, v) => s + v, 0) / arr.length; return Math.sqrt(arr.reduce((s, v) => s + (v - avg) ** 2, 0) / arr.length); };
const growthPct = (arr) => { if (arr.length < 2) return "N/A"; const prev = arr[arr.length - 2]; const cur = arr[arr.length - 1]; return prev ? `${(((cur - prev) / prev) * 100).toFixed(1)}%` : "N/A"; };

const SECTIONS = ["All", "Revenue", "Orders", "Food", "Complaints", "Emergency", "Lost & Found", "Users", "Feedback", "Staff"];

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
const TrainAdminAnalytics = () => {
  const { apiBase } = useApi();
  const { theme, toggleTheme } = useTheme();
  const trainNo = useSelector((s) => s.auth.adminTrainNo);

  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [lostFound, setLostFound] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [section, setSection] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null); // for user detail modal

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        /* Use all-* endpoints (no backend train filtering) — filter on frontend instead.
           This avoids train-number format mismatches on the backend side. */
        const [ordRes, compRes, fbsRes, fbRes, foodRes, emgRes, lnfRes, staffRes] = await Promise.all([
          fetch(`${apiBase}/admin/all-orders`, { credentials: "include" }).then((r) => r.json()),
          fetch(`${apiBase}/admin/all-complaints`, { credentials: "include" }).then((r) => r.json()),
          fetch(`${apiBase}/feedback/stats`, { credentials: "include" }).then((r) => r.json()),
          fetch(`${apiBase}/feedback`, { credentials: "include" }).then((r) => r.json()),
          fetch(`${apiBase}/food`, { credentials: "include" }).then((r) => r.json()),
          fetch(`${apiBase}/emergency/getEmg`, { credentials: "include" }).then((r) => r.json()).catch(() => []),
          fetch(`${apiBase}/admin/all-lostnfound`, { credentials: "include" }).then((r) => r.json()).catch(() => ({ data: [] })),
          fetch(`${apiBase}/admin/all-staff`, { credentials: "include" }).then((r) => r.json()).catch(() => ({ data: [] })),
        ]);
        if (cancel) return;
        const rawOrders = Array.isArray(ordRes.data) ? ordRes.data : Array.isArray(ordRes) ? ordRes : [];
        const rawComplaints = Array.isArray(compRes.data) ? compRes.data : Array.isArray(compRes) ? compRes : [];
        const rawEmergencies = Array.isArray(emgRes) ? emgRes : Array.isArray(emgRes?.data) ? emgRes.data : [];
        const rawLnf = Array.isArray(lnfRes.data) ? lnfRes.data : Array.isArray(lnfRes?.items) ? lnfRes.items : Array.isArray(lnfRes) ? lnfRes : [];
        const rawStaff = Array.isArray(staffRes.data) ? staffRes.data : Array.isArray(staffRes) ? staffRes : [];

        /* Frontend train-number filter — flexible matching */
        const tn = trainNo ? String(trainNo).trim().toLowerCase() : "";
        const matchTrain = (val) => {
          if (!tn) return true;
          const v = String(val || "").trim().toLowerCase();
          return v === tn || v.includes(tn) || tn.includes(v);
        };

        setOrders(tn ? rawOrders.filter((o) => matchTrain(o.trainNumber)) : rawOrders);
        setComplaints(tn ? rawComplaints.filter((c) => matchTrain(c.trainNumber)) : rawComplaints);
        setEmergencies(tn ? rawEmergencies.filter((e) => matchTrain(e.trainNumber)) : rawEmergencies);
        setLostFound(tn ? rawLnf.filter((l) => matchTrain(l.trainNumber)) : rawLnf);
        setStaff(tn ? rawStaff.filter((s) => matchTrain(s.trainNumber)) : rawStaff);
        setFeedbackStats(fbsRes.stats || fbsRes || null);
        setAllFeedbacks(Array.isArray(fbRes.data || fbRes) ? fbRes.data || fbRes : []);
        setMenuItems(Array.isArray(foodRes.data || foodRes) ? foodRes.data || foodRes : []);
      } catch (err) {
        if (!cancel) setError("Failed to load analytics data.");
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    return () => { cancel = true; };
  }, [apiBase, trainNo]);

  /* ═══ show helper — decides if a section is visible ═══ */
  const show = useCallback((s) => section === "All" || section === s, [section]);

  /* ═══════════════════════════════════════════════════════════════
     COMPUTED ANALYTICS
     ═══════════════════════════════════════════════════════════════ */

  /* ── Revenue Analytics ── */
  const revenue = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const cancelled = orders.filter((o) => (o.status || "").toLowerCase() === "cancelled");
    const cancelledRev = cancelled.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const netRevenue = totalRevenue - cancelledRev;
    const delivered = orders.filter((o) => (o.status || "").toLowerCase() === "delivered");
    const deliveredRev = delivered.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const orderValues = orders.map((o) => o.totalPrice || 0).filter((v) => v > 0);
    const medianOV = median(orderValues);
    const stdDevOV = stdDev(orderValues);
    const avgOV = orders.length ? totalRevenue / orders.length : 0;
    const maxOV = orderValues.length ? Math.max(...orderValues) : 0;
    const minOV = orderValues.length ? Math.min(...orderValues) : 0;

    const byDay = groupSum(orders, (o) => dayKey(o.createdAt), (o) => o.totalPrice || 0);
    const byWeek = groupSum(orders, (o) => weekKey(o.createdAt), (o) => o.totalPrice || 0);
    const byMonth = groupSum(orders, (o) => monthKey(o.createdAt), (o) => o.totalPrice || 0);
    const byDow = groupSum(orders, (o) => dowKey(o.createdAt), (o) => o.totalPrice || 0);
    const top5Days = topN(byDay, 5);

    const tiers = { "₹0-100": 0, "₹100-300": 0, "₹300-500": 0, "₹500-1000": 0, "₹1000+": 0 };
    orderValues.forEach((v) => { if (v < 100) tiers["₹0-100"]++; else if (v < 300) tiers["₹100-300"]++; else if (v < 500) tiers["₹300-500"]++; else if (v < 1000) tiers["₹500-1000"]++; else tiers["₹1000+"]++; });

    return {
      totalRevenue, cancelledRev, netRevenue, deliveredRev,
      avgOV, medianOV, stdDevOV, maxOV, minOV,
      byDay: sortedEntries(byDay), byWeek: sortedEntries(byWeek), byMonth: sortedEntries(byMonth),
      byDow: sortedEntries(byDow), top5Days,
      tiers: Object.entries(tiers).map(([label, value]) => ({ label, value })),
      refundPct: pct(cancelledRev, totalRevenue),
      dayGrowth: growthPct([...byDay.values()]),
      weekGrowth: growthPct([...byWeek.values()]),
    };
  }, [orders]);

  /* ── Order Analytics ── */
  const orderStats = useMemo(() => {
    const total = orders.length;
    const byStatus = groupBy(orders, (o) => o.status || "unknown");
    const byDay = groupBy(orders, (o) => dayKey(o.createdAt));
    const byWeek = groupBy(orders, (o) => weekKey(o.createdAt));
    const byMonth = groupBy(orders, (o) => monthKey(o.createdAt));
    const byHour = groupBy(orders, (o) => hourKey(o.createdAt));
    const byDow = groupBy(orders, (o) => dowKey(o.createdAt));

    const peakHour = byHour.size ? [...byHour.entries()].sort((a, b) => b[1] - a[1])[0] : null;
    const peakDay = byDow.size ? [...byDow.entries()].sort((a, b) => b[1] - a[1])[0] : null;
    const avgPerDay = byDay.size ? (total / byDay.size).toFixed(1) : "0";

    const userOrders = {};
    orders.forEach((o) => { const uid = o.user?._id || o.user; if (uid) userOrders[uid] = (userOrders[uid] || 0) + 1; });
    const uniqueUsers = Object.keys(userOrders).length;
    const returningUsers = Object.values(userOrders).filter((c) => c > 1).length;
    const singleOrderUsers = uniqueUsers - returningUsers;
    const avgOrdersPerUser = uniqueUsers ? (total / uniqueUsers).toFixed(1) : "0";

    const freqDist = {};
    Object.values(userOrders).forEach((c) => { const bucket = c >= 10 ? "10+" : String(c); freqDist[bucket] = (freqDist[bucket] || 0) + 1; });

    const pending = orders.filter((o) => (o.status || "").toLowerCase() === "pending").length;
    const preparing = orders.filter((o) => (o.status || "").toLowerCase() === "preparing").length;
    const outForDelivery = orders.filter((o) => (o.status || "").toLowerCase().includes("out for")).length;
    const delivered = orders.filter((o) => (o.status || "").toLowerCase() === "delivered").length;
    const cancelledCount = orders.filter((o) => (o.status || "").toLowerCase() === "cancelled").length;
    const cancellationRate = pct(cancelledCount, total);
    const fulfillmentRate = pct(delivered, total);

    return {
      total, byStatus: sortedEntries(byStatus), byDay: sortedEntries(byDay),
      byWeek: sortedEntries(byWeek), byMonth: sortedEntries(byMonth),
      byHour: sortedEntries(byHour), byDow: sortedEntries(byDow),
      peakHour: peakHour ? peakHour[0] : "N/A", peakDay: peakDay ? peakDay[0] : "N/A",
      avgPerDay, uniqueUsers, returningUsers, singleOrderUsers, avgOrdersPerUser,
      freqDist: Object.entries(freqDist).map(([label, value]) => ({ label, value })),
      pending, preparing, outForDelivery, delivered, cancelledCount,
      cancellationRate, fulfillmentRate,
      dodGrowth: growthPct([...byDay.values()]),
      wowGrowth: growthPct([...byWeek.values()]),
      momGrowth: growthPct([...byMonth.values()]),
      statusSlices: [...byStatus.entries()].map(([label, value]) => ({ label, value })),
    };
  }, [orders]);

  /* ── Food Analytics ── */
  const food = useMemo(() => {
    const allItems = [];
    orders.forEach((o) => {
      (o.items || []).forEach((it) => {
        allItems.push({
          name: it.foodItem?.name || "Unknown",
          category: menuItems.find((m) => m._id === (it.foodItem?._id || it.foodItem))?.category || "Other",
          qty: it.quantity || 1,
          revenue: (it.priceAtOrder || it.foodItem?.price || 0) * (it.quantity || 1),
          date: o.createdAt,
        });
      });
    });
    const itemQty = new Map(); const itemRev = new Map(); const catQty = new Map(); const catRev = new Map();
    allItems.forEach((it) => {
      itemQty.set(it.name, (itemQty.get(it.name) || 0) + it.qty);
      itemRev.set(it.name, (itemRev.get(it.name) || 0) + it.revenue);
      catQty.set(it.category, (catQty.get(it.category) || 0) + it.qty);
      catRev.set(it.category, (catRev.get(it.category) || 0) + it.revenue);
    });

    const top5 = topN(itemQty, 5); const bottom5 = bottomN(itemQty, 5);
    const top5Rev = topN(itemRev, 5);
    const totalItems = allItems.reduce((s, it) => s + it.qty, 0);
    const uniqueItems = itemQty.size;
    const avgItemsPerOrder = orders.length ? (totalItems / orders.length).toFixed(1) : "0";
    const avgRevPerItem = uniqueItems ? (allItems.reduce((s, it) => s + it.revenue, 0) / totalItems).toFixed(0) : "0";

    const byDay = groupSum(allItems, (it) => dayKey(it.date), (it) => it.qty);
    const revByDay = groupSum(allItems, (it) => dayKey(it.date), (it) => it.revenue);
    const byDow = groupSum(allItems, (it) => dowKey(it.date), (it) => it.qty);

    const itemRanking = [...itemQty.entries()].sort((a, b) => b[1] - a[1]).map(([name, qty], idx) => ({
      rank: idx + 1, name, qty, revenue: itemRev.get(name) || 0,
    }));

    const catStackLabels = [...catQty.keys()];
    const dayLabels = sortedEntries(byDay).labels;
    const catByDayStacks = catStackLabels.map((cat) => {
      const catItems = allItems.filter((it) => it.category === cat);
      const catByDay = groupSum(catItems, (it) => dayKey(it.date), (it) => it.qty);
      return { name: cat, values: dayLabels.map((d) => catByDay.get(d) || 0) };
    });

    return {
      top5, bottom5, top5Rev, totalItems, uniqueItems, avgItemsPerOrder, avgRevPerItem,
      byDay: sortedEntries(byDay), revByDay: sortedEntries(revByDay), byDow: sortedEntries(byDow),
      catQtySlices: [...catQty.entries()].map(([label, value]) => ({ label, value })),
      catRevSlices: [...catRev.entries()].map(([label, value]) => ({ label, value })),
      itemRanking, mostOrdered: top5.labels[0] || "N/A", leastOrdered: bottom5.labels[0] || "N/A",
      catStackLabels: dayLabels, catByDayStacks,
    };
  }, [orders, menuItems]);

  /* ── Complaint Analytics ── */
  const comp = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter((c) => (c.status || "").toLowerCase() === "resolved").length;
    const pending = complaints.filter((c) => (c.status || "").toLowerCase() === "pending").length;
    const important = complaints.filter((c) => (c.status || "").toLowerCase() === "important").length;
    const awaiting = complaints.filter((c) => (c.status || "").toLowerCase().includes("awaiting")).length;
    const resolutionRate = pct(resolved, total);

    const byDomain = groupBy(complaints, (c) => c.issueDomain || "Other");
    const byStatus = groupBy(complaints, (c) => c.status || "Unknown");
    const byDay = groupBy(complaints, (c) => dayKey(c.createdAt));
    const byWeek = groupBy(complaints, (c) => weekKey(c.createdAt));
    const byDow = groupBy(complaints, (c) => dowKey(c.createdAt));

    const byBogie = groupBy(complaints.filter((c) => c.bogieNumber), (c) => `B${c.bogieNumber}`);
    const topBogies = topN(byBogie, 5);

    const resolvedComplaints = complaints.filter((c) => c.resolvedAt && c.createdAt);
    const resolutionTimes = resolvedComplaints.map((c) => (new Date(c.resolvedAt) - new Date(c.createdAt)) / 3600000);
    const avgResolutionHrs = resolutionTimes.length ? (resolutionTimes.reduce((s, v) => s + v, 0) / resolutionTimes.length).toFixed(1) : "N/A";
    const medianResolutionHrs = resolutionTimes.length ? median(resolutionTimes).toFixed(1) : "N/A";
    const minResolutionHrs = resolutionTimes.length ? Math.min(...resolutionTimes).toFixed(1) : "N/A";
    const maxResolutionHrs = resolutionTimes.length ? Math.max(...resolutionTimes).toFixed(1) : "N/A";

    const userComplaints = {};
    complaints.forEach((c) => { const uid = c.userId || c.username; if (uid) userComplaints[uid] = (userComplaints[uid] || 0) + 1; });
    const repeatComplainers = Object.values(userComplaints).filter((c) => c > 1).length;

    const domainByDayLabels = sortedEntries(byDay).labels;
    const domains = [...byDomain.keys()];
    const domainStacks = domains.map((dom) => {
      const domComplaints = complaints.filter((c) => (c.issueDomain || "Other") === dom);
      const domByDay = groupBy(domComplaints, (c) => dayKey(c.createdAt));
      return { name: dom, values: domainByDayLabels.map((d) => domByDay.get(d) || 0) };
    });

    return {
      total, resolved, pending, important, awaiting, resolutionRate,
      byDomain: sortedEntries(byDomain), byStatus: sortedEntries(byStatus), byDay: sortedEntries(byDay),
      byWeek: sortedEntries(byWeek), byDow: sortedEntries(byDow), topBogies,
      avgResolutionHrs, medianResolutionHrs, minResolutionHrs, maxResolutionHrs,
      repeatComplainers,
      domainSlices: [...byDomain.entries()].map(([label, value]) => ({ label, value })),
      statusSlices: [...byStatus.entries()].map(([label, value]) => ({ label, value })),
      domainStackLabels: domainByDayLabels, domainStacks,
    };
  }, [complaints]);

  /* ── Emergency Analytics ── */
  const emg = useMemo(() => {
    const total = emergencies.length;
    const active = emergencies.filter((e) => (e.status || "").toLowerCase() === "active").length;
    const byDay = groupBy(emergencies, (e) => dayKey(e.createdAt));
    const byHour = groupBy(emergencies, (e) => hourKey(e.createdAt));
    const byDow = groupBy(emergencies, (e) => dowKey(e.createdAt));
    const bySeat = groupBy(emergencies.filter((e) => e.seatNumber), (e) => `Seat ${e.seatNumber}`);
    const topSeats = topN(bySeat, 5);
    const peakHour = byHour.size ? [...byHour.entries()].sort((a, b) => b[1] - a[1])[0] : null;

    const hours = [...Array(24)].map((_, i) => `${i}:00`);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const heatData = days.map((day) => hours.map((hr) => emergencies.filter((e) => { const d = new Date(e.createdAt); return dowKey(e.createdAt) === day && hourKey(e.createdAt) === hr; }).length));

    return {
      total, active,
      byDay: sortedEntries(byDay), byHour: sortedEntries(byHour), byDow: sortedEntries(byDow),
      topSeats, peakHour: peakHour ? peakHour[0] : "N/A",
      heatData, heatXLabels: hours.filter((_, i) => i % 3 === 0), heatYLabels: days,
      heatDataFiltered: days.map((day) => hours.filter((_, i) => i % 3 === 0).map((hr) => emergencies.filter((e) => dowKey(e.createdAt) === day && hourKey(e.createdAt) === hr).length)),
    };
  }, [emergencies]);

  /* ── Lost & Found Analytics ── */
  const lnf = useMemo(() => {
    const total = lostFound.length;
    const lost = lostFound.filter((l) => (l.category || "").toLowerCase() === "lost").length;
    const found = lostFound.filter((l) => (l.category || "").toLowerCase() === "found").length;
    const open = lostFound.filter((l) => (l.status || "").toLowerCase() === "open").length;
    const resolved = lostFound.filter((l) => (l.status || "").toLowerCase() === "resolved").length;
    const resolutionRate = pct(resolved, total);

    const byDay = groupBy(lostFound, (l) => dayKey(l.createdAt));
    const byCategory = groupBy(lostFound, (l) => l.category || "Unknown");
    const byStatus = groupBy(lostFound, (l) => l.status || "Unknown");
    const byLocation = groupBy(lostFound.filter((l) => l.location), (l) => l.location);
    const topLocations = topN(byLocation, 5);

    return {
      total, lost, found, open, resolved, resolutionRate,
      byDay: sortedEntries(byDay), topLocations,
      categorySlices: [...byCategory.entries()].map(([label, value]) => ({ label, value })),
      statusSlices: [...byStatus.entries()].map(([label, value]) => ({ label, value })),
    };
  }, [lostFound]);

  /* ── Feedback Analytics ── */
  const fb = useMemo(() => {
    const total = allFeedbacks.length;
    const avgRating = total ? (allFeedbacks.reduce((s, f) => s + (f.rating || 0), 0) / total).toFixed(2) : "0";
    const ratingDist = [1, 2, 3, 4, 5].map((r) => ({ label: `${r}★`, value: allFeedbacks.filter((f) => Math.round(f.rating) === r).length }));
    const byDay = groupBy(allFeedbacks, (f) => dayKey(f.createdAt));
    const positive = allFeedbacks.filter((f) => f.rating >= 4).length;
    const negative = allFeedbacks.filter((f) => f.rating <= 2).length;
    const neutral = allFeedbacks.filter((f) => f.rating === 3).length;
    const nps = total ? (((positive - negative) / total) * 100).toFixed(1) : "0";
    const csatPct = pct(positive, total);

    const byDow = groupBy(allFeedbacks, (f) => dowKey(f.createdAt));

    return {
      total, avgRating, ratingDist, byDay: sortedEntries(byDay),
      positive, negative, neutral, nps, csatPct,
      sentimentSlices: [
        { label: "Positive (4-5)", value: positive, color: "#22c55e" },
        { label: "Neutral (3)", value: neutral, color: "#f59e0b" },
        { label: "Negative (1-2)", value: negative, color: "#f87171" },
      ],
      byDow: sortedEntries(byDow),
    };
  }, [allFeedbacks]);

  /* ── User Spending Analytics ── */
  const users = useMemo(() => {
    const userMap = {};
    orders.forEach((o) => {
      const uid = o.user?._id || o.user || "unknown";
      if (!userMap[uid]) userMap[uid] = { orders: 0, spent: 0, items: 0 };
      userMap[uid].orders++;
      userMap[uid].spent += o.totalPrice || 0;
      userMap[uid].items += (o.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
    });
    const users = Object.values(userMap);
    const spendTiers = { "₹0-500": 0, "₹500-2k": 0, "₹2k-5k": 0, "₹5k-10k": 0, "₹10k+": 0 };
    users.forEach((u) => { if (u.spent < 500) spendTiers["₹0-500"]++; else if (u.spent < 2000) spendTiers["₹500-2k"]++; else if (u.spent < 5000) spendTiers["₹2k-5k"]++; else if (u.spent < 10000) spendTiers["₹5k-10k"]++; else spendTiers["₹10k+"]++; });

    const topSpenders = Object.entries(userMap).sort((a, b) => b[1].spent - a[1].spent).slice(0, 5);
    const avgSpendPerUser = users.length ? (users.reduce((s, u) => s + u.spent, 0) / users.length).toFixed(0) : "0";
    const avgItemsPerUser = users.length ? (users.reduce((s, u) => s + u.items, 0) / users.length).toFixed(1) : "0";

    const activityByHour = groupBy(orders, (o) => hourKey(o.createdAt));
    const activityByDow = groupBy(orders, (o) => dowKey(o.createdAt));

    return {
      total: users.length,
      spendTierSlices: Object.entries(spendTiers).map(([label, value]) => ({ label, value })),
      topSpenders: { labels: topSpenders.map(([id]) => id.slice(-6)), values: topSpenders.map(([, v]) => v.spent) },
      avgSpendPerUser, avgItemsPerUser,
      activityByHour: sortedEntries(activityByHour),
      activityByDow: sortedEntries(activityByDow),
    };
  }, [orders]);

  /* ── Staff Analytics ── */
  const staffStats = useMemo(() => {
    const total = staff.length;
    const byRole = groupBy(staff, (s) => s.role || "Unknown");
    return {
      total,
      roleSlices: [...byRole.entries()].map(([label, value]) => ({ label, value })),
      byRole: sortedEntries(byRole),
    };
  }, [staff]);

  /* ── Active Users — assembled from orders, complaints, emergencies, lost&found ── */
  const activeUsers = useMemo(() => {
    const map = {};
    const ensure = (uid, name, email) => {
      if (!uid || uid === "unknown") return;
      if (!map[uid]) map[uid] = { id: uid, name: name || "—", email: email || "—", orders: [], complaints: [], emergencies: [], lostFound: [], totalSpent: 0, firstSeen: null, lastSeen: null };
      if (name && name !== "—") map[uid].name = name;
      if (email && email !== "—") map[uid].email = email;
    };
    const updateTime = (uid, dateStr) => {
      if (!uid || !dateStr || !map[uid]) return;
      const d = new Date(dateStr);
      if (!map[uid].firstSeen || d < map[uid].firstSeen) map[uid].firstSeen = d;
      if (!map[uid].lastSeen || d > map[uid].lastSeen) map[uid].lastSeen = d;
    };
    orders.forEach((o) => {
      const uid = o.user?._id || o.user;
      ensure(uid, o.user?.name || o.user?.username, o.user?.email);
      if (map[uid]) { map[uid].orders.push(o); map[uid].totalSpent += o.totalPrice || 0; updateTime(uid, o.createdAt); }
    });
    complaints.forEach((c) => {
      const uid = c.userId || c.user;
      ensure(uid, c.username, null);
      if (map[uid]) { map[uid].complaints.push(c); updateTime(uid, c.createdAt); }
    });
    emergencies.forEach((e) => {
      const uid = e.userId || e.user;
      ensure(uid, e.username, null);
      if (map[uid]) { map[uid].emergencies.push(e); updateTime(uid, e.createdAt); }
    });
    lostFound.forEach((l) => {
      const uid = l.userId || l.user;
      ensure(uid, null, null);
      if (map[uid]) { map[uid].lostFound.push(l); updateTime(uid, l.createdAt); }
    });
    return Object.values(map).sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
  }, [orders, complaints, emergencies, lostFound]);

  /* counter for numbered analytics */
  let aNum = 0;
  const an = () => ++aNum;

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  if (loading) return (
    <main className="page-shell fade-in"><section className="surface-card" style={{ textAlign: "center", padding: "4rem 2rem" }}><div className="an-spinner" /><p className="muted-text" style={{ marginTop: "1rem" }}>Loading analytics…</p></section></main>
  );

  if (error) return (
    <main className="page-shell fade-in"><section className="surface-card" style={{ textAlign: "center", padding: "4rem 2rem" }}><p style={{ color: "var(--color-danger)", fontWeight: 600 }}>{error}</p><button className="btn" onClick={() => window.location.reload()} style={{ marginTop: "1rem" }}>Retry</button></section></main>
  );

  return (
    <main className="page-shell fade-in an-page">
      {/* Header */}
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Analytics Dashboard — {trainNo || "All"}</h1>
            <p className="muted-text">60+ real-time metrics for Train {trainNo || "system"}</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn btn-ghost" onClick={toggleTheme} title="Toggle theme">{theme === "light" ? "🌙" : "☀️"}</button>
            <Link className="btn btn-ghost" to="/admindashboard">← Dashboard</Link>
          </div>
        </div>
      </section>

      {/* Section Nav */}
      <section className="surface-card" style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {SECTIONS.map((s) => (
            <button key={s} className={`btn ${section === s ? "" : "btn-ghost"}`} onClick={() => setSection(s)} style={section === s ? { fontWeight: 700 } : {}}>{s}</button>
          ))}
        </div>
      </section>

      {/* ═══════════ REVENUE SECTION ═══════════ */}
      {show("Revenue") && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">Revenue Overview</h2>
            <div className="an-kpi-grid">
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(revenue.totalRevenue)}</span><span className="an-kpi-lbl">#{an()} Total Revenue</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(revenue.netRevenue)}</span><span className="an-kpi-lbl">#{an()} Net Revenue</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(revenue.deliveredRev)}</span><span className="an-kpi-lbl">#{an()} Delivered Revenue</span></div>
              <div className="an-kpi an-kpi-warn"><span className="an-kpi-val">{fmtCur(revenue.cancelledRev)}</span><span className="an-kpi-lbl">#{an()} Cancelled Revenue</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{revenue.refundPct}%</span><span className="an-kpi-lbl">#{an()} Refund Impact</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(revenue.avgOV)}</span><span className="an-kpi-lbl">#{an()} Avg Order Value</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(revenue.medianOV)}</span><span className="an-kpi-lbl">#{an()} Median Order Value</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(revenue.stdDevOV)}</span><span className="an-kpi-lbl">#{an()} Std Dev (Order Val)</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(revenue.maxOV)}</span><span className="an-kpi-lbl">#{an()} Max Order Value</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(revenue.minOV)}</span><span className="an-kpi-lbl">#{an()} Min Order Value</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Revenue per Day <span className="badge">{revenue.dayGrowth} DoD</span></h2>
              <LineChart labels={revenue.byDay.labels} datasets={[{ values: revenue.byDay.values, color: "#22c55e" }]} area />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Revenue per Week <span className="badge">{revenue.weekGrowth} WoW</span></h2>
              <BarChart labels={revenue.byWeek.labels} values={revenue.byWeek.values} color="#818cf8" />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Revenue per Month</h2>
              <BarChart labels={revenue.byMonth.labels} values={revenue.byMonth.values} color="#a855f7" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Revenue by Day of Week</h2>
              <BarChart labels={revenue.byDow.labels} values={revenue.byDow.values} color="#f59e0b" />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top 5 Revenue Days</h2>
              <BarChart labels={revenue.top5Days.labels} values={revenue.top5Days.values} color="#22c55e" height={180} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Order Value Distribution</h2>
              <PieChart slices={revenue.tiers} donut />
            </section>
          </div>
        </>
      )}

      {/* ═══════════ ORDERS SECTION ═══════════ */}
      {show("Orders") && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">Order Overview</h2>
            <div className="an-kpi-grid">
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.total}</span><span className="an-kpi-lbl">#{an()} Total Orders</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.delivered}</span><span className="an-kpi-lbl">#{an()} Delivered</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.pending}</span><span className="an-kpi-lbl">#{an()} Pending</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.preparing}</span><span className="an-kpi-lbl">#{an()} Preparing</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.outForDelivery}</span><span className="an-kpi-lbl">#{an()} Out for Delivery</span></div>
              <div className="an-kpi an-kpi-warn"><span className="an-kpi-val">{orderStats.cancelledCount}</span><span className="an-kpi-lbl">#{an()} Cancelled</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.fulfillmentRate}%</span><span className="an-kpi-lbl">#{an()} Fulfillment Rate</span></div>
              <div className="an-kpi an-kpi-warn"><span className="an-kpi-val">{orderStats.cancellationRate}%</span><span className="an-kpi-lbl">#{an()} Cancellation Rate</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.avgPerDay}</span><span className="an-kpi-lbl">#{an()} Avg Orders/Day</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.peakHour}</span><span className="an-kpi-lbl">#{an()} Peak Hour</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.peakDay}</span><span className="an-kpi-lbl">#{an()} Peak Day</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.avgOrdersPerUser}</span><span className="an-kpi-lbl">#{an()} Avg Orders/User</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Orders per Day <span className="badge">{orderStats.dodGrowth} DoD</span></h2>
              <BarChart labels={orderStats.byDay.labels} values={orderStats.byDay.values} color="var(--color-primary)" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Orders per Week <span className="badge">{orderStats.wowGrowth} WoW</span></h2>
              <BarChart labels={orderStats.byWeek.labels} values={orderStats.byWeek.values} color="#818cf8" />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Orders per Month <span className="badge">{orderStats.momGrowth} MoM</span></h2>
              <BarChart labels={orderStats.byMonth.labels} values={orderStats.byMonth.values} color="#a855f7" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Order Status Distribution</h2>
              <PieChart slices={orderStats.statusSlices} donut />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Orders by Hour of Day</h2>
              <BarChart labels={orderStats.byHour.labels} values={orderStats.byHour.values} color="#14b8a6" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Orders by Day of Week</h2>
              <BarChart labels={orderStats.byDow.labels} values={orderStats.byDow.values} color="#06b6d4" />
            </section>
          </div>
          <section className="surface-card an-section">
            <h2 className="an-section-title">#{an()} User Order Frequency Distribution</h2>
            <PieChart slices={orderStats.freqDist} />
          </section>
        </>
      )}

      {/* ═══════════ FOOD SECTION ═══════════ */}
      {show("Food") && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">Food Overview</h2>
            <div className="an-kpi-grid">
              <div className="an-kpi"><span className="an-kpi-val">{food.totalItems}</span><span className="an-kpi-lbl">#{an()} Total Items Sold</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{food.uniqueItems}</span><span className="an-kpi-lbl">#{an()} Unique Items</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{food.avgItemsPerOrder}</span><span className="an-kpi-lbl">#{an()} Avg Items/Order</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(Number(food.avgRevPerItem))}</span><span className="an-kpi-lbl">#{an()} Avg Rev/Item</span></div>
              <div className="an-kpi"><span className="an-kpi-val" title={food.mostOrdered}>{food.mostOrdered.length > 12 ? food.mostOrdered.slice(0, 12) + "…" : food.mostOrdered}</span><span className="an-kpi-lbl">#{an()} Most Ordered</span></div>
              <div className="an-kpi"><span className="an-kpi-val" title={food.leastOrdered}>{food.leastOrdered.length > 12 ? food.leastOrdered.slice(0, 12) + "…" : food.leastOrdered}</span><span className="an-kpi-lbl">#{an()} Least Ordered</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top 5 Food Items (Qty)</h2>
              <BarChart labels={food.top5.labels} values={food.top5.values} color="#f59e0b" height={200} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top 5 Food Items (Revenue)</h2>
              <BarChart labels={food.top5Rev.labels} values={food.top5Rev.values} color="#22c55e" height={200} />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Bottom 5 Food Items</h2>
              <BarChart labels={food.bottom5.labels} values={food.bottom5.values} color="#f87171" height={200} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Category Distribution (Qty)</h2>
              <PieChart slices={food.catQtySlices} />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Category Revenue Distribution</h2>
              <PieChart slices={food.catRevSlices} donut />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Food Sales Trend (Qty/Day)</h2>
              <LineChart labels={food.byDay.labels} datasets={[{ values: food.byDay.values, color: "#fb923c" }]} area />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Food Revenue per Day</h2>
              <LineChart labels={food.revByDay.labels} datasets={[{ values: food.revByDay.values, color: "#a855f7" }]} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Food Sales by Day of Week</h2>
              <BarChart labels={food.byDow.labels} values={food.byDow.values} color="#38bdf8" />
            </section>
          </div>
          {food.catByDayStacks.length > 0 && (
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Category Sales Stacked (Daily)</h2>
              <StackedBarChart labels={food.catStackLabels} stacks={food.catByDayStacks} />
            </section>
          )}
          <section className="surface-card an-section">
            <h2 className="an-section-title">#{an()} Full Item Ranking</h2>
            <div className="table-wrapper"><table><thead><tr><th>#</th><th>Item</th><th>Qty Sold</th><th>Revenue</th></tr></thead><tbody>
              {food.itemRanking.length === 0 ? <tr><td colSpan="4" style={{ textAlign: "center", padding: "1.5rem" }}>No data</td></tr> : food.itemRanking.slice(0, 15).map((r) => <tr key={r.rank}><td><strong>{r.rank}</strong></td><td>{r.name}</td><td>{r.qty}</td><td>{fmtCur(r.revenue)}</td></tr>)}
            </tbody></table></div>
          </section>
        </>
      )}

      {/* ═══════════ COMPLAINTS SECTION ═══════════ */}
      {show("Complaints") && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">Complaint Overview</h2>
            <div className="an-kpi-grid">
              <div className="an-kpi"><span className="an-kpi-val">{comp.total}</span><span className="an-kpi-lbl">#{an()} Total Complaints</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.resolved}</span><span className="an-kpi-lbl">#{an()} Resolved</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.pending}</span><span className="an-kpi-lbl">#{an()} Pending</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.important}</span><span className="an-kpi-lbl">#{an()} Important</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.awaiting}</span><span className="an-kpi-lbl">#{an()} Awaiting Confirm</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.resolutionRate}%</span><span className="an-kpi-lbl">#{an()} Resolution Rate</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.avgResolutionHrs}h</span><span className="an-kpi-lbl">#{an()} Avg Resolution Time</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.medianResolutionHrs}h</span><span className="an-kpi-lbl">#{an()} Median Resolution</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.minResolutionHrs}h</span><span className="an-kpi-lbl">#{an()} Min Resolution</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.maxResolutionHrs}h</span><span className="an-kpi-lbl">#{an()} Max Resolution</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.repeatComplainers}</span><span className="an-kpi-lbl">#{an()} Repeat Complainers</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Complaints by Domain</h2>
              <PieChart slices={comp.domainSlices} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Complaints by Status</h2>
              <PieChart slices={comp.statusSlices} donut />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Complaints per Day</h2>
              <LineChart labels={comp.byDay.labels} datasets={[{ values: comp.byDay.values, color: "#f87171" }]} area />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Complaints per Week</h2>
              <BarChart labels={comp.byWeek.labels} values={comp.byWeek.values} color="#a855f7" />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Complaints by Day of Week</h2>
              <BarChart labels={comp.byDow.labels} values={comp.byDow.values} color="#818cf8" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top 5 Complaint Bogies</h2>
              <BarChart labels={comp.topBogies.labels} values={comp.topBogies.values} color="#ef4444" height={180} />
            </section>
          </div>
          {comp.domainStacks.length > 0 && (
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Domain Complaints Stacked (Daily)</h2>
              <StackedBarChart labels={comp.domainStackLabels} stacks={comp.domainStacks} />
            </section>
          )}
        </>
      )}

      {/* ═══════════ EMERGENCY SECTION ═══════════ */}
      {show("Emergency") && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">Emergency Overview</h2>
            <div className="an-kpi-grid">
              <div className="an-kpi"><span className="an-kpi-val">{emg.total}</span><span className="an-kpi-lbl">#{an()} Total Emergencies</span></div>
              <div className="an-kpi an-kpi-warn"><span className="an-kpi-val">{emg.active}</span><span className="an-kpi-lbl">#{an()} Active Now</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{emg.peakHour}</span><span className="an-kpi-lbl">#{an()} Peak Hour</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Emergencies per Day</h2>
              <LineChart labels={emg.byDay.labels} datasets={[{ values: emg.byDay.values, color: "#ef4444" }]} area />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Emergencies by Hour</h2>
              <BarChart labels={emg.byHour.labels} values={emg.byHour.values} color="#f87171" />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Emergencies by Day of Week</h2>
              <BarChart labels={emg.byDow.labels} values={emg.byDow.values} color="#fb923c" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top Emergency Seats</h2>
              <BarChart labels={emg.topSeats.labels} values={emg.topSeats.values} color="#ef4444" height={180} />
            </section>
          </div>
          <section className="surface-card an-section">
            <h2 className="an-section-title">#{an()} Emergency Activity Heatmap (Day × Hour)</h2>
            <HeatMap data={emg.heatDataFiltered} xLabels={emg.heatXLabels} yLabels={emg.heatYLabels} />
          </section>
        </>
      )}

      {/* ═══════════ LOST & FOUND SECTION ═══════════ */}
      {show("Lost & Found") && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">Lost & Found Overview</h2>
            <div className="an-kpi-grid">
              <div className="an-kpi"><span className="an-kpi-val">{lnf.total}</span><span className="an-kpi-lbl">#{an()} Total Reports</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{lnf.lost}</span><span className="an-kpi-lbl">#{an()} Lost Items</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{lnf.found}</span><span className="an-kpi-lbl">#{an()} Found Items</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{lnf.open}</span><span className="an-kpi-lbl">#{an()} Open Cases</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{lnf.resolved}</span><span className="an-kpi-lbl">#{an()} Resolved Cases</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{lnf.resolutionRate}%</span><span className="an-kpi-lbl">#{an()} Resolution Rate</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Lost vs Found</h2>
              <PieChart slices={lnf.categorySlices} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Status Distribution</h2>
              <PieChart slices={lnf.statusSlices} donut />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Reports per Day</h2>
              <LineChart labels={lnf.byDay.labels} datasets={[{ values: lnf.byDay.values, color: "#8b5cf6" }]} area />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top Locations</h2>
              <BarChart labels={lnf.topLocations.labels} values={lnf.topLocations.values} color="#06b6d4" height={180} />
            </section>
          </div>
        </>
      )}

      {/* ═══════════ USERS SECTION ═══════════ */}
      {show("Users") && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">User Overview</h2>
            <div className="an-kpi-grid">
              <div className="an-kpi"><span className="an-kpi-val">{users.total}</span><span className="an-kpi-lbl">#{an()} Unique Users</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{activeUsers.length}</span><span className="an-kpi-lbl">#{an()} Active Users (Train)</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.returningUsers}</span><span className="an-kpi-lbl">#{an()} Returning Users</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.singleOrderUsers}</span><span className="an-kpi-lbl">#{an()} Single-Order Users</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(Number(users.avgSpendPerUser))}</span><span className="an-kpi-lbl">#{an()} Avg Spend/User</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{users.avgItemsPerUser}</span><span className="an-kpi-lbl">#{an()} Avg Items/User</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} User Spending Tiers</h2>
              <PieChart slices={users.spendTierSlices} donut />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top 5 Spenders</h2>
              <BarChart labels={users.topSpenders.labels} values={users.topSpenders.values} color="#22c55e" height={180} />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Activity by Hour</h2>
              <BarChart labels={users.activityByHour.labels} values={users.activityByHour.values} color="#818cf8" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Activity by Day of Week</h2>
              <BarChart labels={users.activityByDow.labels} values={users.activityByDow.values} color="#14b8a6" />
            </section>
          </div>
          <section className="surface-card an-section">
            <h2 className="an-section-title">#{an()} Returning vs New Users</h2>
            <PieChart slices={[{ label: "Returning", value: orderStats.returningUsers, color: "#38bdf8" }, { label: "New", value: orderStats.singleOrderUsers, color: "#a855f7" }]} donut size={180} />
          </section>

          {/* ── Active Users Table ── */}
          <section className="surface-card an-section">
            <h2 className="an-section-title">#{an()} All Users</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name / Username</th>
                    <th>Email</th>
                    <th>Orders</th>
                    <th>Spent</th>
                    <th>Complaints</th>
                    <th>Emergencies</th>
                    <th>Lost&amp;Found</th>
                    <th>Last Active</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.length === 0 ? (
                    <tr><td colSpan="10" style={{ textAlign: "center", padding: "2rem" }}>No active users found for this train.</td></tr>
                  ) : activeUsers.map((u, idx) => (
                    <tr key={u.id}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.orders.length}</td>
                      <td>{fmtCur(u.totalSpent)}</td>
                      <td>{u.complaints.length}</td>
                      <td>{u.emergencies.length}</td>
                      <td>{u.lostFound.length}</td>
                      <td>{u.lastSeen ? u.lastSeen.toLocaleDateString() : "—"}</td>
                      <td>
                        <button
                          className="btn btn-ghost"
                          style={{ fontSize: "0.82rem", padding: "0.3rem 0.75rem", borderRadius: "6px", background: "rgba(56,189,248,0.12)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.25)", cursor: "pointer", whiteSpace: "nowrap" }}
                          onClick={() => setSelectedUser(u)}
                        >View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ═══════════ USER DETAIL MODAL ═══════════ */}
      {selectedUser && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            style={{ background: "var(--surface-1, #0f172a)", borderRadius: "1rem", maxWidth: "720px", width: "100%", maxHeight: "85vh", overflow: "auto", padding: "2rem", border: "1px solid var(--border, #334155)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem" }}>👤 {selectedUser.name}</h2>
                <p className="muted-text" style={{ margin: "0.25rem 0 0" }}>{selectedUser.email} &nbsp;·&nbsp; ID: …{selectedUser.id.slice(-8)}</p>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setSelectedUser(null)}
                style={{ fontSize: "1.3rem", padding: "0.25rem 0.65rem", lineHeight: 1 }}
              >✕</button>
            </div>

            {/* Summary KPIs */}
            <div className="an-kpi-grid" style={{ marginBottom: "1.5rem" }}>
              <div className="an-kpi"><span className="an-kpi-val">{selectedUser.orders.length}</span><span className="an-kpi-lbl">Orders</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(selectedUser.totalSpent)}</span><span className="an-kpi-lbl">Total Spent</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{selectedUser.complaints.length}</span><span className="an-kpi-lbl">Complaints</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{selectedUser.emergencies.length}</span><span className="an-kpi-lbl">Emergencies</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{selectedUser.lostFound.length}</span><span className="an-kpi-lbl">Lost & Found</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{selectedUser.firstSeen ? selectedUser.firstSeen.toLocaleDateString() : "—"}</span><span className="an-kpi-lbl">First Active</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{selectedUser.lastSeen ? selectedUser.lastSeen.toLocaleDateString() : "—"}</span><span className="an-kpi-lbl">Last Active</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{selectedUser.orders.length ? fmtCur(selectedUser.totalSpent / selectedUser.orders.length) : "—"}</span><span className="an-kpi-lbl">Avg Order Value</span></div>
            </div>

            {/* ── Orders Detail ── */}
            {selectedUser.orders.length > 0 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem", borderBottom: "1px solid var(--border, #334155)", paddingBottom: "0.4rem" }}>🛒 Orders ({selectedUser.orders.length})</h3>
                <div className="table-wrapper"><table>
                  <thead><tr><th>Date</th><th>Status</th><th>Items</th><th>Amount</th><th>Address</th></tr></thead>
                  <tbody>
                    {selectedUser.orders.slice(0, 20).map((o, i) => (
                      <tr key={i}>
                        <td style={{ whiteSpace: "nowrap" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td><span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", background: (o.status || "").toLowerCase() === "delivered" ? "rgba(34,197,94,0.15)" : (o.status || "").toLowerCase() === "cancelled" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", color: (o.status || "").toLowerCase() === "delivered" ? "#22c55e" : (o.status || "").toLowerCase() === "cancelled" ? "#ef4444" : "#f59e0b" }}>{o.status}</span></td>
                        <td>{(o.items || []).map((it) => `${it.foodItem?.name || "item"} ×${it.quantity}`).join(", ") || "—"}</td>
                        <td style={{ fontWeight: 600 }}>{fmtCur(o.totalPrice || 0)}</td>
                        <td style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.deliveryAddress || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
                {selectedUser.orders.length > 20 && <p className="muted-text" style={{ fontSize: "0.8rem", marginTop: "0.3rem" }}>Showing 20 of {selectedUser.orders.length} orders</p>}
              </div>
            )}

            {/* ── Complaints Detail ── */}
            {selectedUser.complaints.length > 0 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem", borderBottom: "1px solid var(--border, #334155)", paddingBottom: "0.4rem" }}>📋 Complaints ({selectedUser.complaints.length})</h3>
                <div className="table-wrapper"><table>
                  <thead><tr><th>Date</th><th>Domain</th><th>Status</th><th>PNR</th><th>Bogie/Seat</th><th>Description</th></tr></thead>
                  <tbody>
                    {selectedUser.complaints.slice(0, 20).map((c, i) => (
                      <tr key={i}>
                        <td style={{ whiteSpace: "nowrap" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>{c.issueDomain || "—"}</td>
                        <td><span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", background: (c.status || "").toLowerCase() === "resolved" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", color: (c.status || "").toLowerCase() === "resolved" ? "#22c55e" : "#f59e0b" }}>{c.status}</span></td>
                        <td>{c.pnr || "—"}</td>
                        <td>{c.bogieNumber || "—"}/{c.seatNumber || "—"}</td>
                        <td style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.description}>{c.description || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            )}

            {/* ── Emergencies Detail ── */}
            {selectedUser.emergencies.length > 0 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem", borderBottom: "1px solid var(--border, #334155)", paddingBottom: "0.4rem" }}>🚨 Emergencies ({selectedUser.emergencies.length})</h3>
                <div className="table-wrapper"><table>
                  <thead><tr><th>Date</th><th>Train</th><th>Seat</th><th>Status</th></tr></thead>
                  <tbody>
                    {selectedUser.emergencies.map((e, i) => (
                      <tr key={i}>
                        <td style={{ whiteSpace: "nowrap" }}>{new Date(e.createdAt).toLocaleDateString()}</td>
                        <td>{e.trainNumber}</td>
                        <td>{e.seatNumber || "—"}</td>
                        <td><span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", background: (e.status || "").toLowerCase() === "active" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", color: (e.status || "").toLowerCase() === "active" ? "#ef4444" : "#22c55e" }}>{e.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            )}

            {/* ── Lost & Found Detail ── */}
            {selectedUser.lostFound.length > 0 && (
              <div style={{ marginBottom: "0.5rem" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem", borderBottom: "1px solid var(--border, #334155)", paddingBottom: "0.4rem" }}>🔍 Lost & Found ({selectedUser.lostFound.length})</h3>
                <div className="table-wrapper"><table>
                  <thead><tr><th>Date</th><th>Type</th><th>Title</th><th>Location</th><th>Status</th></tr></thead>
                  <tbody>
                    {selectedUser.lostFound.map((l, i) => (
                      <tr key={i}>
                        <td style={{ whiteSpace: "nowrap" }}>{new Date(l.date || l.createdAt).toLocaleDateString()}</td>
                        <td>{l.category}</td>
                        <td>{l.title || "—"}</td>
                        <td>{l.location || "—"}</td>
                        <td><span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem", background: (l.status || "").toLowerCase() === "resolved" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", color: (l.status || "").toLowerCase() === "resolved" ? "#22c55e" : "#f59e0b" }}>{l.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table></div>
              </div>
            )}

            {/* No activity fallback */}
            {selectedUser.orders.length === 0 && selectedUser.complaints.length === 0 && selectedUser.emergencies.length === 0 && selectedUser.lostFound.length === 0 && (
              <p className="muted-text" style={{ textAlign: "center", padding: "2rem 0" }}>No detailed activity data available for this user.</p>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ FEEDBACK SECTION ═══════════ */}
      {show("Feedback") && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">Feedback Overview</h2>
            <div className="an-kpi-grid" style={{ alignItems: "center" }}>
              <div className="an-kpi"><span className="an-kpi-val">{fb.total}</span><span className="an-kpi-lbl">#{an()} Total Feedbacks</span></div>
              <Gauge value={fb.avgRating} label={`#${an()} Avg Rating`} />
              <div className="an-kpi"><span className="an-kpi-val">{fb.nps}</span><span className="an-kpi-lbl">#{an()} NPS Score</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fb.csatPct}%</span><span className="an-kpi-lbl">#{an()} CSAT %</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fb.positive}</span><span className="an-kpi-lbl">#{an()} Positive</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fb.neutral}</span><span className="an-kpi-lbl">#{an()} Neutral</span></div>
              <div className="an-kpi an-kpi-warn"><span className="an-kpi-val">{fb.negative}</span><span className="an-kpi-lbl">#{an()} Negative</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Rating Distribution</h2>
              <BarChart labels={fb.ratingDist.map((r) => r.label)} values={fb.ratingDist.map((r) => r.value)} color="#facc15" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Sentiment Split</h2>
              <PieChart slices={fb.sentimentSlices} donut />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Feedback Over Time</h2>
              <LineChart labels={fb.byDay.labels} datasets={[{ values: fb.byDay.values, color: "#34d399" }]} area />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Feedback by Day of Week</h2>
              <BarChart labels={fb.byDow.labels} values={fb.byDow.values} color="#06b6d4" />
            </section>
          </div>
        </>
      )}

      {/* ═══════════ STAFF SECTION ═══════════ */}
      {show("Staff") && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">Staff Overview</h2>
            <div className="an-kpi-grid">
              <div className="an-kpi"><span className="an-kpi-val">{staffStats.total}</span><span className="an-kpi-lbl">#{an()} Total Staff</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Staff by Role</h2>
              <PieChart slices={staffStats.roleSlices} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Role Distribution</h2>
              <BarChart labels={staffStats.byRole.labels} values={staffStats.byRole.values} color="#818cf8" height={180} />
            </section>
          </div>
        </>
      )}

      {/* Analytics counter */}
      <section className="surface-card" style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <p className="muted-text">Showing <strong>{aNum}</strong> analytics {section !== "All" && `in ${section} section`} — powered by live database</p>
      </section>
    </main>
  );
};

export default TrainAdminAnalytics;