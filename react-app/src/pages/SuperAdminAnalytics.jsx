import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
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
  const maxV = Math.max(...allVals, 1), minV = Math.min(...allVals, 0), range = maxV - minV || 1;
  const x = (i) => pad.l + (i / (labels.length - 1 || 1)) * plotW;
  const y = (v) => pad.t + plotH - ((v - minV) / range) * plotH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="an-chart-svg">
      {[...Array(5)].map((_, i) => { const yy = pad.t + (plotH / 5) * i; const val = maxV - (range / 5) * i; return (<g key={i}><line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="rgba(148,163,184,0.15)" /><text x={pad.l - 8} y={yy + 4} textAnchor="end" className="an-chart-label">{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}</text></g>); })}
      {labels.map((l, i) => { if (labels.length > 14 && i % Math.ceil(labels.length / 10) !== 0) return null; return <text key={i} x={x(i)} y={H - 5} textAnchor="middle" className="an-chart-label">{l}</text>; })}
      {datasets.map((ds, di) => { const pts = ds.values.map((v, i) => `${x(i)},${y(v)}`).join(" "); return (<g key={di}>{area && <polygon points={`${x(0)},${y(minV)} ${pts} ${x(ds.values.length - 1)},${y(minV)}`} fill={ds.color || "var(--color-primary)"} opacity="0.12" />}<polyline fill="none" stroke={ds.color || "var(--color-primary)"} strokeWidth="2.5" points={pts} />{ds.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={ds.color || "var(--color-primary)"}><title>{`${labels[i]}: ${v}`}</title></circle>)}</g>); })}
    </svg>
  );
};

const BarChart = ({ labels = [], values = [], color = "var(--color-primary)", height = 220, onBarClick }) => {
  if (!labels.length || !values.length) return <div className="an-empty">No data available</div>;
  const W = 600, H = height, pad = { t: 20, r: 20, b: 50, l: 55 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const maxV = Math.max(...values, 1);
  const barW = Math.min(plotW / labels.length * 0.6, 40), gap = plotW / labels.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="an-chart-svg">
      {[...Array(5)].map((_, i) => { const yy = pad.t + (plotH / 5) * i; const val = maxV - (maxV / 5) * i; return (<g key={i}><line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="rgba(148,163,184,0.15)" /><text x={pad.l - 8} y={yy + 4} textAnchor="end" className="an-chart-label">{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}</text></g>); })}
      {values.map((v, i) => { const bh = (v / maxV) * plotH; const bx = pad.l + gap * i + (gap - barW) / 2; const by = pad.t + plotH - bh; return (<g key={i} style={onBarClick ? { cursor: "pointer" } : {}} onClick={() => onBarClick && onBarClick(labels[i], i)}><rect x={bx} y={by} width={barW} height={bh} rx="4" fill={color} opacity="0.85"><title>{`${labels[i]}: ${v}`}</title></rect><text x={bx + barW / 2} y={H - 8} textAnchor="middle" className="an-chart-label" transform={labels.length > 10 ? `rotate(-35, ${bx + barW / 2}, ${H - 8})` : ""}>{labels[i]?.length > 8 ? labels[i].slice(0, 8) + "…" : labels[i]}</text></g>); })}
    </svg>
  );
};

const PieChart = ({ slices = [], donut = false, size = 200 }) => {
  if (!slices.length) return <div className="an-empty">No data available</div>;
  const total = slices.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 10, cx = size / 2, cy = size / 2;
  let cumAngle = -90;
  const colors = ["#38bdf8", "#a855f7", "#f59e0b", "#22c55e", "#f87171", "#818cf8", "#fb923c", "#14b8a6"];
  const arcs = slices.map((s, i) => { const angle = (s.value / total) * 360; const startRad = (cumAngle * Math.PI) / 180; const endRad = ((cumAngle + angle) * Math.PI) / 180; const large = angle > 180 ? 1 : 0; const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad); const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad); const ir = donut ? r * 0.55 : 0; const ix1 = cx + ir * Math.cos(endRad), iy1 = cy + ir * Math.sin(endRad); const ix2 = cx + ir * Math.cos(startRad), iy2 = cy + ir * Math.sin(startRad); const path = donut ? `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${ix1},${iy1} A${ir},${ir} 0 ${large} 0 ${ix2},${iy2} Z` : `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`; cumAngle += angle; return <path key={i} d={path} fill={s.color || colors[i % colors.length]} opacity="0.88"><title>{`${s.label}: ${s.value} (${((s.value / total) * 100).toFixed(1)}%)`}</title></path>; });
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
  return (<div style={{ textAlign: "center" }}><svg width="90" height="80"><circle r={r} cx="45" cy="42" fill="none" stroke="rgba(71,85,105,0.3)" strokeWidth="12" /><circle r={r} cx="45" cy="42" fill="none" stroke="#34d399" strokeWidth="10" strokeDasharray={`${pct * c} ${c}`} strokeDashoffset={-c * 0.25} strokeLinecap="round" /><text x="45" y="44" textAnchor="middle" dominantBaseline="middle" fill="#e2e8f0" style={{ fontSize: "1.4rem", fontWeight: 700 }}>{Number(value).toFixed(1)}</text></svg>{label && <div className="an-gauge-label">{label}</div>}</div>);
};

const StackedBarChart = ({ labels = [], stacks = [], height = 220 }) => {
  if (!labels.length || !stacks.length) return <div className="an-empty">No data available</div>;
  const W = 600, H = height, pad = { t: 20, r: 20, b: 50, l: 55 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const colors = ["#38bdf8", "#a855f7", "#f59e0b", "#22c55e", "#f87171", "#818cf8"];
  const totals = labels.map((_, li) => stacks.reduce((s, st) => s + (st.values[li] || 0), 0));
  const maxV = Math.max(...totals, 1);
  const barW = Math.min(plotW / labels.length * 0.6, 40), gap = plotW / labels.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="an-chart-svg">
      {[...Array(5)].map((_, i) => { const yy = pad.t + (plotH / 5) * i; const val = maxV - (maxV / 5) * i; return (<g key={i}><line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="rgba(148,163,184,0.15)" /><text x={pad.l - 8} y={yy + 4} textAnchor="end" className="an-chart-label">{Math.round(val)}</text></g>); })}
      {labels.map((l, li) => { let cumH = 0; const bx = pad.l + gap * li + (gap - barW) / 2; return (<g key={li}>{stacks.map((st, si) => { const v = st.values[li] || 0; const bh = (v / maxV) * plotH; const by = pad.t + plotH - cumH - bh; cumH += bh; return <rect key={si} x={bx} y={by} width={barW} height={bh} rx="2" fill={colors[si % colors.length]} opacity="0.85"><title>{`${l} - ${st.name}: ${v}`}</title></rect>; })}<text x={bx + barW / 2} y={H - 8} textAnchor="middle" className="an-chart-label">{l?.length > 8 ? l.slice(0, 8) + "…" : l}</text></g>); })}
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
   ZOOMABLE BAR CHART — click month→weeks, click week→days
   ═══════════════════════════════════════════════════════════════════ */
const ZoomableBarChart = ({ monthData = {}, weekData = {}, dayData = {}, color = "var(--color-primary)", height = 240, title = "" }) => {
  const [level, setLevel] = useState("month");
  const [selectedKey, setSelectedKey] = useState(null);

  const getData = () => {
    if (level === "month") return monthData;
    if (level === "week" && selectedKey && weekData[selectedKey]) return weekData[selectedKey];
    if (level === "day" && selectedKey && dayData[selectedKey]) return dayData[selectedKey];
    return monthData;
  };

  const current = getData();
  const labels = Object.keys(current);
  const values = Object.values(current);

  const handleClick = (label) => {
    if (level === "month") {
      setSelectedKey(label);
      setLevel("week");
    } else if (level === "week") {
      setSelectedKey(label);
      setLevel("day");
    }
  };

  const handleBack = () => {
    if (level === "day") setLevel("week");
    else if (level === "week") setLevel("month");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {level === "month" ? "Monthly view — click a bar to zoom to weeks" : level === "week" ? `Weeks in ${selectedKey} — click to zoom to days` : `Days in ${selectedKey}`}
        </span>
        {level !== "month" && <button className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }} onClick={handleBack}>← Back</button>}
      </div>
      <BarChart labels={labels} values={values} color={color} height={height} onBarClick={level !== "day" ? handleClick : undefined} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   UTILITY HELPERS
   ═══════════════════════════════════════════════════════════════════ */
const fmt = (n) => (n >= 100000 ? `${(n / 100000).toFixed(2)}L` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : Number(n).toFixed(0));
const fmtCur = (n) => `₹${fmt(n)}`;
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) : "0.0");
const dayKey = (d) => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth() + 1}`; };
const weekKey = (d) => { const dt = new Date(d); const oneJan = new Date(dt.getFullYear(), 0, 1); const w = Math.ceil(((dt - oneJan) / 86400000 + oneJan.getDay() + 1) / 7); return `W${w}`; };
const monthKey = (d) => new Date(d).toLocaleString("default", { month: "short" });
const hourKey = (d) => `${new Date(d).getHours()}:00`;
const dowKey = (d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(d).getDay()];
const yearMonthKey = (d) => { const dt = new Date(d); return `${dt.toLocaleString("default", { month: "short" })}'${String(dt.getFullYear()).slice(2)}`; };

const groupBy = (arr, keyFn) => { const m = new Map(); arr.forEach((it) => { const k = keyFn(it); m.set(k, (m.get(k) || 0) + 1); }); return m; };
const groupSum = (arr, keyFn, valFn) => { const m = new Map(); arr.forEach((it) => { const k = keyFn(it); m.set(k, (m.get(k) || 0) + valFn(it)); }); return m; };
const sortedEntries = (map) => { const e = [...map.entries()]; return { labels: e.map((x) => x[0]), values: e.map((x) => x[1]) }; };
const topN = (map, n = 5) => { const e = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n); return { labels: e.map((x) => x[0]), values: e.map((x) => x[1]) }; };
const bottomN = (map, n = 5) => { const e = [...map.entries()].sort((a, b) => a[1] - b[1]).slice(0, n); return { labels: e.map((x) => x[0]), values: e.map((x) => x[1]) }; };
const median = (arr) => { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const stdDev = (arr) => { if (arr.length < 2) return 0; const avg = arr.reduce((s, v) => s + v, 0) / arr.length; return Math.sqrt(arr.reduce((s, v) => s + (v - avg) ** 2, 0) / arr.length); };
const growthPct = (arr) => { if (arr.length < 2) return "N/A"; const prev = arr[arr.length - 2]; const cur = arr[arr.length - 1]; return prev ? `${(((cur - prev) / prev) * 100).toFixed(1)}%` : "N/A"; };

const SECTIONS = ["All", "Overview", "Revenue", "Orders", "Food", "Complaints", "Emergency", "Lost & Found", "Users", "Feedback", "Staff", "Cross-Train"];

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
const SuperAdminAnalytics = () => {
  const { apiBase } = useApi();
  const { theme, toggleTheme } = useTheme();

  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [allFeedbacks, setAllFeedbacks] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [lostFound, setLostFound] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [section, setSection] = useState("All");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [trainFilter, setTrainFilter] = useState("all");

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
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
        setOrders(Array.isArray(ordRes.data) ? ordRes.data : Array.isArray(ordRes) ? ordRes : []);
        setComplaints(Array.isArray(compRes.data) ? compRes.data : Array.isArray(compRes) ? compRes : []);
        setFeedbackStats(fbsRes.stats || fbsRes || null);
        setAllFeedbacks(Array.isArray(fbRes.data || fbRes) ? fbRes.data || fbRes : []);
        setMenuItems(Array.isArray(foodRes.data || foodRes) ? foodRes.data || foodRes : []);
        setEmergencies(Array.isArray(emgRes) ? emgRes : Array.isArray(emgRes?.data) ? emgRes.data : []);
        setLostFound(Array.isArray(lnfRes.data) ? lnfRes.data : Array.isArray(lnfRes) ? lnfRes : []);
        setStaffList(Array.isArray(staffRes.data) ? staffRes.data : Array.isArray(staffRes) ? staffRes : []);
      } catch (err) {
        if (!cancel) setError("Failed to load analytics data.");
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    return () => { cancel = true; };
  }, [apiBase]);

  /* ── Date + Train filter ── */
  const inRange = useCallback((dateStr) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(new Date(dateTo).setHours(23, 59, 59, 999))) return false;
    return true;
  }, [dateFrom, dateTo]);

  const matchTrain = useCallback((tn) => trainFilter === "all" || String(tn) === String(trainFilter), [trainFilter]);

  const fo = useMemo(() => orders.filter((o) => inRange(o.createdAt) && matchTrain(o.trainNumber)), [orders, inRange, matchTrain]);
  const fc = useMemo(() => complaints.filter((c) => inRange(c.createdAt) && matchTrain(c.trainNumber)), [complaints, inRange, matchTrain]);
  const ff = useMemo(() => allFeedbacks.filter((f) => inRange(f.createdAt)), [allFeedbacks, inRange]);
  const fe = useMemo(() => emergencies.filter((e) => inRange(e.createdAt) && matchTrain(e.trainNumber)), [emergencies, inRange, matchTrain]);
  const fl = useMemo(() => lostFound.filter((l) => inRange(l.createdAt) && matchTrain(l.trainNumber)), [lostFound, inRange, matchTrain]);
  const fs = useMemo(() => staffList.filter((s) => matchTrain(s.trainNumber)), [staffList, matchTrain]);

  const trainSet = useMemo(() => {
    const s = new Set();
    orders.forEach((o) => { if (o.trainNumber) s.add(String(o.trainNumber)); });
    complaints.forEach((c) => { if (c.trainNumber) s.add(String(c.trainNumber)); });
    emergencies.forEach((e) => { if (e.trainNumber) s.add(String(e.trainNumber)); });
    return [...s].sort();
  }, [orders, complaints, emergencies]);

  const show = useCallback((s) => section === "All" || section === s, [section]);

  /* ═══════════════════════════════════════════════════════════════
     COMPUTED ANALYTICS
     ═══════════════════════════════════════════════════════════════ */

  /* ── System Overview ── */
  const overview = useMemo(() => {
    const totalOrders = fo.length;
    const totalRevenue = fo.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const cancelled = fo.filter((o) => (o.status || "").toLowerCase() === "cancelled");
    const cancelledRev = cancelled.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const netRevenue = totalRevenue - cancelledRev;
    const delivered = fo.filter((o) => (o.status || "").toLowerCase() === "delivered").length;
    const pending = fo.filter((o) => (o.status || "").toLowerCase() === "pending").length;
    const avgOV = totalOrders ? totalRevenue / totalOrders : 0;
    const orderValues = fo.map((o) => o.totalPrice || 0).filter((v) => v > 0);
    const medianOV = median(orderValues);
    const maxOV = orderValues.length ? Math.max(...orderValues) : 0;

    const userSet = new Set(fo.map((o) => o.user?._id || o.user).filter(Boolean));
    const userOrderCount = {};
    fo.forEach((o) => { const uid = o.user?._id || o.user; if (uid) userOrderCount[uid] = (userOrderCount[uid] || 0) + 1; });
    const returning = Object.values(userOrderCount).filter((c) => c > 1).length;

    return {
      totalOrders, totalRevenue, netRevenue, cancelledRev,
      cancellationPct: pct(cancelled.length, totalOrders),
      delivered, pending, avgOV, medianOV, maxOV,
      uniqueUsers: userSet.size, returningUsers: returning,
      newUsers: userSet.size - returning,
      activeTrains: trainSet.length,
      totalComplaints: fc.length, totalEmergencies: fe.length,
      totalFeedbacks: ff.length, totalLnf: fl.length, totalStaff: fs.length,
      avgRating: ff.length ? (ff.reduce((s, f) => s + (f.rating || 0), 0) / ff.length).toFixed(2) : "N/A",
    };
  }, [fo, fc, fe, ff, fl, fs, trainSet]);

  /* ── Revenue Analytics ── */
  const revenue = useMemo(() => {
    const byDay = groupSum(fo, (o) => dayKey(o.createdAt), (o) => o.totalPrice || 0);
    const byWeek = groupSum(fo, (o) => weekKey(o.createdAt), (o) => o.totalPrice || 0);
    const byMonth = groupSum(fo, (o) => monthKey(o.createdAt), (o) => o.totalPrice || 0);
    const byDow = groupSum(fo, (o) => dowKey(o.createdAt), (o) => o.totalPrice || 0);
    const byHour = groupSum(fo, (o) => hourKey(o.createdAt), (o) => o.totalPrice || 0);
    const top5Days = topN(byDay, 5);

    const byTrain = {};
    fo.forEach((o) => { const t = o.trainNumber || "Unknown"; byTrain[t] = (byTrain[t] || 0) + (o.totalPrice || 0); });
    const trainRevSlices = Object.entries(byTrain).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label: `T-${label}`, value }));

    const orderValues = fo.map((o) => o.totalPrice || 0).filter((v) => v > 0);
    const tiers = { "0-100": 0, "100-300": 0, "300-500": 0, "500-1k": 0, "1k+": 0 };
    orderValues.forEach((v) => { if (v < 100) tiers["0-100"]++; else if (v < 300) tiers["100-300"]++; else if (v < 500) tiers["300-500"]++; else if (v < 1000) tiers["500-1k"]++; else tiers["1k+"]++; });

    // Build zoomable data for revenue
    const monthMap = {};
    fo.forEach((o) => {
      const dt = new Date(o.createdAt);
      const mKey = monthKey(o.createdAt);
      const wKey = weekKey(o.createdAt);
      const dKey = dayKey(o.createdAt);
      if (!monthMap[mKey]) monthMap[mKey] = {};
      if (!monthMap[mKey][wKey]) monthMap[mKey][wKey] = {};
      monthMap[mKey][wKey][dKey] = (monthMap[mKey][wKey][dKey] || 0) + (o.totalPrice || 0);
    });
    const zoomMonth = {};
    Object.entries(monthMap).forEach(([m, weeks]) => { zoomMonth[m] = Object.values(weeks).reduce((s, days) => s + Object.values(days).reduce((a, v) => a + v, 0), 0); });
    const zoomWeek = {};
    Object.entries(monthMap).forEach(([m, weeks]) => { zoomWeek[m] = {}; Object.entries(weeks).forEach(([w, days]) => { zoomWeek[m][w] = Object.values(days).reduce((a, v) => a + v, 0); }); });
    const zoomDay = {};
    Object.entries(monthMap).forEach(([m, weeks]) => { Object.entries(weeks).forEach(([w, days]) => { zoomDay[w] = days; }); });

    return {
      byDay: sortedEntries(byDay), byWeek: sortedEntries(byWeek), byMonth: sortedEntries(byMonth),
      byDow: sortedEntries(byDow), byHour: sortedEntries(byHour), top5Days,
      trainRevSlices,
      tierSlices: Object.entries(tiers).map(([label, value]) => ({ label, value })),
      stdDevOV: stdDev(orderValues),
      dayGrowth: growthPct([...byDay.values()]),
      weekGrowth: growthPct([...byWeek.values()]),
      monthGrowth: growthPct([...byMonth.values()]),
      zoomMonth, zoomWeek, zoomDay,
    };
  }, [fo]);

  /* ── Order Analytics ── */
  const orderStats = useMemo(() => {
    const total = fo.length;
    const byStatus = groupBy(fo, (o) => o.status || "unknown");
    const byDay = groupBy(fo, (o) => dayKey(o.createdAt));
    const byWeek = groupBy(fo, (o) => weekKey(o.createdAt));
    const byMonth = groupBy(fo, (o) => monthKey(o.createdAt));
    const byHour = groupBy(fo, (o) => hourKey(o.createdAt));
    const byDow = groupBy(fo, (o) => dowKey(o.createdAt));
    const byTrain = groupBy(fo, (o) => o.trainNumber || "Unknown");

    const peakHour = byHour.size ? [...byHour.entries()].sort((a, b) => b[1] - a[1])[0] : null;
    const peakDay = byDow.size ? [...byDow.entries()].sort((a, b) => b[1] - a[1])[0] : null;
    const avgPerDay = byDay.size ? (total / byDay.size).toFixed(1) : "0";

    const delivered = fo.filter((o) => (o.status || "").toLowerCase() === "delivered").length;
    const cancelled = fo.filter((o) => (o.status || "").toLowerCase() === "cancelled").length;

    // Build zoomable order data
    const monthMap = {};
    fo.forEach((o) => { const m = monthKey(o.createdAt); const w = weekKey(o.createdAt); const d = dayKey(o.createdAt); if (!monthMap[m]) monthMap[m] = {}; if (!monthMap[m][w]) monthMap[m][w] = {}; monthMap[m][w][d] = (monthMap[m][w][d] || 0) + 1; });
    const zoomMonth = {};
    Object.entries(monthMap).forEach(([m, weeks]) => { zoomMonth[m] = Object.values(weeks).reduce((s, days) => s + Object.values(days).reduce((a, v) => a + v, 0), 0); });
    const zoomWeek = {};
    Object.entries(monthMap).forEach(([m, weeks]) => { zoomWeek[m] = {}; Object.entries(weeks).forEach(([w, days]) => { zoomWeek[m][w] = Object.values(days).reduce((a, v) => a + v, 0); }); });
    const zoomDay = {};
    Object.entries(monthMap).forEach(([m, weeks]) => { Object.entries(weeks).forEach(([w, days]) => { zoomDay[w] = days; }); });

    return {
      total, byStatus: sortedEntries(byStatus), byDay: sortedEntries(byDay),
      byWeek: sortedEntries(byWeek), byMonth: sortedEntries(byMonth),
      byHour: sortedEntries(byHour), byDow: sortedEntries(byDow),
      byTrain: sortedEntries(byTrain),
      peakHour: peakHour ? peakHour[0] : "N/A", peakDay: peakDay ? peakDay[0] : "N/A",
      avgPerDay, delivered, cancelled,
      fulfillmentRate: pct(delivered, total),
      cancellationRate: pct(cancelled, total),
      statusSlices: [...byStatus.entries()].map(([label, value]) => ({ label, value })),
      trainSlices: [...byTrain.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label: `T-${label}`, value })),
      dodGrowth: growthPct([...byDay.values()]),
      wowGrowth: growthPct([...byWeek.values()]),
      momGrowth: growthPct([...byMonth.values()]),
      zoomMonth, zoomWeek, zoomDay,
    };
  }, [fo]);

  /* ── Food Analytics ── */
  const food = useMemo(() => {
    const allItems = [];
    fo.forEach((o) => {
      (o.items || []).forEach((it) => {
        allItems.push({
          name: it.foodItem?.name || "Unknown",
          category: menuItems.find((m) => m._id === (it.foodItem?._id || it.foodItem))?.category || "Other",
          qty: it.quantity || 1,
          revenue: (it.priceAtOrder || it.foodItem?.price || 0) * (it.quantity || 1),
          date: o.createdAt,
          train: o.trainNumber,
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

    const top5 = topN(itemQty, 5); const bottom5 = bottomN(itemQty, 5); const top5Rev = topN(itemRev, 5);
    const totalItems = allItems.reduce((s, it) => s + it.qty, 0);
    const uniqueItems = itemQty.size;
    const avgItemsPerOrder = fo.length ? (totalItems / fo.length).toFixed(1) : "0";

    const byDay = groupSum(allItems, (it) => dayKey(it.date), (it) => it.qty);
    const byDow = groupSum(allItems, (it) => dowKey(it.date), (it) => it.qty);
    const revByDay = groupSum(allItems, (it) => dayKey(it.date), (it) => it.revenue);

    // Food by train
    const itemByTrain = {};
    allItems.forEach((it) => { const t = it.train || "Unknown"; if (!itemByTrain[t]) itemByTrain[t] = {}; itemByTrain[t][it.name] = (itemByTrain[t][it.name] || 0) + it.qty; });
    const trainFoodLabels = Object.keys(itemByTrain).sort().slice(0, 8);
    const topItems = top5.labels;
    const trainFoodStacks = topItems.map((item) => ({
      name: item.length > 12 ? item.slice(0, 12) + "…" : item,
      values: trainFoodLabels.map((t) => itemByTrain[t]?.[item] || 0),
    }));

    const itemRanking = [...itemQty.entries()].sort((a, b) => b[1] - a[1]).map(([name, qty], idx) => ({ rank: idx + 1, name, qty, revenue: itemRev.get(name) || 0 }));

    return {
      top5, bottom5, top5Rev, totalItems, uniqueItems, avgItemsPerOrder,
      byDay: sortedEntries(byDay), revByDay: sortedEntries(revByDay), byDow: sortedEntries(byDow),
      catQtySlices: [...catQty.entries()].map(([label, value]) => ({ label, value })),
      catRevSlices: [...catRev.entries()].map(([label, value]) => ({ label, value })),
      trainFoodLabels: trainFoodLabels.map((t) => `T-${t}`), trainFoodStacks,
      itemRanking,
      mostOrdered: top5.labels[0] || "N/A", leastOrdered: bottom5.labels[0] || "N/A",
    };
  }, [fo, menuItems]);

  /* ── Complaint Analytics ── */
  const comp = useMemo(() => {
    const total = fc.length;
    const resolved = fc.filter((c) => (c.status || "").toLowerCase() === "resolved").length;
    const pending = fc.filter((c) => (c.status || "").toLowerCase() === "pending").length;
    const important = fc.filter((c) => (c.status || "").toLowerCase() === "important").length;
    const awaiting = fc.filter((c) => (c.status || "").toLowerCase().includes("awaiting")).length;

    const byDomain = groupBy(fc, (c) => c.issueDomain || "Other");
    const byStatus = groupBy(fc, (c) => c.status || "Unknown");
    const byDay = groupBy(fc, (c) => dayKey(c.createdAt));
    const byWeek = groupBy(fc, (c) => weekKey(c.createdAt));
    const byDow = groupBy(fc, (c) => dowKey(c.createdAt));
    const byTrain = groupBy(fc, (c) => c.trainNumber || "Unknown");
    const byBogie = groupBy(fc.filter((c) => c.bogieNumber), (c) => `B${c.bogieNumber}`);
    const topBogies = topN(byBogie, 5);
    const topTrains = topN(byTrain, 8);

    const resolvedComplaints = fc.filter((c) => c.resolvedAt && c.createdAt);
    const resTimes = resolvedComplaints.map((c) => (new Date(c.resolvedAt) - new Date(c.createdAt)) / 3600000);
    const avgResHrs = resTimes.length ? (resTimes.reduce((s, v) => s + v, 0) / resTimes.length).toFixed(1) : "N/A";
    const medResHrs = resTimes.length ? median(resTimes).toFixed(1) : "N/A";

    const userComplaints = {};
    fc.forEach((c) => { const uid = c.userId || c.username; if (uid) userComplaints[uid] = (userComplaints[uid] || 0) + 1; });
    const repeatComplainers = Object.values(userComplaints).filter((c) => c > 1).length;

    // Domain by train stacked
    const domains = [...byDomain.keys()];
    const trainLabels = topTrains.labels.slice(0, 6);
    const domainByTrainStacks = domains.map((dom) => {
      const domByTrain = groupBy(fc.filter((c) => (c.issueDomain || "Other") === dom), (c) => c.trainNumber || "Unknown");
      return { name: dom, values: trainLabels.map((t) => domByTrain.get(t) || 0) };
    });

    return {
      total, resolved, pending, important, awaiting,
      resolutionRate: pct(resolved, total),
      byDomain: sortedEntries(byDomain), byStatus: sortedEntries(byStatus),
      byDay: sortedEntries(byDay), byWeek: sortedEntries(byWeek), byDow: sortedEntries(byDow),
      byTrain: sortedEntries(byTrain), topBogies, topTrains,
      avgResHrs, medResHrs, repeatComplainers,
      domainSlices: [...byDomain.entries()].map(([label, value]) => ({ label, value })),
      statusSlices: [...byStatus.entries()].map(([label, value]) => ({ label, value })),
      trainLabels: trainLabels.map((t) => `T-${t}`), domainByTrainStacks,
    };
  }, [fc]);

  /* ── Emergency Analytics ── */
  const emg = useMemo(() => {
    const total = fe.length;
    const active = fe.filter((e) => (e.status || "").toLowerCase() === "active").length;
    const byDay = groupBy(fe, (e) => dayKey(e.createdAt));
    const byHour = groupBy(fe, (e) => hourKey(e.createdAt));
    const byDow = groupBy(fe, (e) => dowKey(e.createdAt));
    const byTrain = groupBy(fe, (e) => e.trainNumber || "Unknown");
    const topTrains = topN(byTrain, 8);
    const peakHour = byHour.size ? [...byHour.entries()].sort((a, b) => b[1] - a[1])[0] : null;

    const hours = [...Array(24)].map((_, i) => `${i}:00`);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const heatData = days.map((day) => hours.filter((_, i) => i % 3 === 0).map((hr) => fe.filter((e) => dowKey(e.createdAt) === day && hourKey(e.createdAt) === hr).length));

    return {
      total, active, peakHour: peakHour ? peakHour[0] : "N/A",
      byDay: sortedEntries(byDay), byHour: sortedEntries(byHour), byDow: sortedEntries(byDow),
      topTrains, trainSlices: [...byTrain.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label: `T-${label}`, value })),
      heatData, heatXLabels: hours.filter((_, i) => i % 3 === 0), heatYLabels: days,
    };
  }, [fe]);

  /* ── Lost & Found Analytics ── */
  const lnf = useMemo(() => {
    const total = fl.length;
    const lost = fl.filter((l) => (l.category || "").toLowerCase() === "lost").length;
    const found = fl.filter((l) => (l.category || "").toLowerCase() === "found").length;
    const open = fl.filter((l) => (l.status || "").toLowerCase() === "open").length;
    const resolved = fl.filter((l) => (l.status || "").toLowerCase() === "resolved").length;
    const byDay = groupBy(fl, (l) => dayKey(l.createdAt));
    const byTrain = groupBy(fl, (l) => l.trainNumber || "Unknown");
    const byLocation = groupBy(fl.filter((l) => l.location), (l) => l.location);
    const topLocations = topN(byLocation, 5);
    const topTrains = topN(byTrain, 8);

    return {
      total, lost, found, open, resolved,
      resolutionRate: pct(resolved, total),
      byDay: sortedEntries(byDay), topLocations, topTrains,
      categorySlices: [{ label: "Lost", value: lost }, { label: "Found", value: found }],
      statusSlices: [{ label: "Open", value: open }, { label: "Resolved", value: resolved }],
      trainSlices: [...byTrain.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label: `T-${label}`, value })),
    };
  }, [fl]);

  /* ── Feedback Analytics ── */
  const fb = useMemo(() => {
    const total = ff.length;
    const avgRating = total ? (ff.reduce((s, f) => s + (f.rating || 0), 0) / total).toFixed(2) : "0";
    const ratingDist = [1, 2, 3, 4, 5].map((r) => ({ label: `${r}★`, value: ff.filter((f) => Math.round(f.rating) === r).length }));
    const byDay = groupBy(ff, (f) => dayKey(f.createdAt));
    const byDow = groupBy(ff, (f) => dowKey(f.createdAt));
    const positive = ff.filter((f) => f.rating >= 4).length;
    const negative = ff.filter((f) => f.rating <= 2).length;
    const neutral = ff.filter((f) => f.rating === 3).length;
    const nps = total ? (((positive - negative) / total) * 100).toFixed(1) : "0";
    const csatPct = pct(positive, total);

    return {
      total, avgRating, ratingDist, byDay: sortedEntries(byDay), byDow: sortedEntries(byDow),
      positive, negative, neutral, nps, csatPct,
      sentimentSlices: [
        { label: "Positive (4-5)", value: positive, color: "#22c55e" },
        { label: "Neutral (3)", value: neutral, color: "#f59e0b" },
        { label: "Negative (1-2)", value: negative, color: "#f87171" },
      ],
    };
  }, [ff]);

  /* ── User Analytics ── */
  const users = useMemo(() => {
    const userMap = {};
    fo.forEach((o) => {
      const uid = o.user?._id || o.user || "unknown";
      if (!userMap[uid]) userMap[uid] = { orders: 0, spent: 0, items: 0, trains: new Set() };
      userMap[uid].orders++;
      userMap[uid].spent += o.totalPrice || 0;
      userMap[uid].items += (o.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
      if (o.trainNumber) userMap[uid].trains.add(String(o.trainNumber));
    });
    const usersArr = Object.values(userMap);
    const total = usersArr.length;
    const returning = usersArr.filter((u) => u.orders > 1).length;
    const multiTrain = usersArr.filter((u) => u.trains.size > 1).length;
    const avgSpend = total ? (usersArr.reduce((s, u) => s + u.spent, 0) / total).toFixed(0) : "0";
    const avgOrders = total ? (usersArr.reduce((s, u) => s + u.orders, 0) / total).toFixed(1) : "0";

    const spendTiers = { "0-500": 0, "500-2k": 0, "2k-5k": 0, "5k-10k": 0, "10k+": 0 };
    usersArr.forEach((u) => { if (u.spent < 500) spendTiers["0-500"]++; else if (u.spent < 2000) spendTiers["500-2k"]++; else if (u.spent < 5000) spendTiers["2k-5k"]++; else if (u.spent < 10000) spendTiers["5k-10k"]++; else spendTiers["10k+"]++; });

    const topSpenders = Object.entries(userMap).sort((a, b) => b[1].spent - a[1].spent).slice(0, 5);

    const actByHour = groupBy(fo, (o) => hourKey(o.createdAt));
    const actByDow = groupBy(fo, (o) => dowKey(o.createdAt));

    // User distribution by train
    const trainUsers = {};
    fo.forEach((o) => { const t = o.trainNumber || "Unknown"; if (!trainUsers[t]) trainUsers[t] = new Set(); trainUsers[t].add(o.user?._id || o.user); });
    const usersByTrain = Object.entries(trainUsers).map(([label, set]) => ({ label: `T-${label}`, value: set.size })).sort((a, b) => b.value - a.value).slice(0, 8);

    return {
      total, returning, newUsers: total - returning, multiTrain,
      avgSpend, avgOrders,
      spendTierSlices: Object.entries(spendTiers).map(([label, value]) => ({ label, value })),
      topSpenders: { labels: topSpenders.map(([id]) => id.slice(-6)), values: topSpenders.map(([, v]) => v.spent) },
      actByHour: sortedEntries(actByHour), actByDow: sortedEntries(actByDow),
      usersByTrain,
    };
  }, [fo]);

  /* ── Staff Analytics ── */
  const staffStats = useMemo(() => {
    const total = fs.length;
    const byRole = groupBy(fs, (s) => s.role || "Unknown");
    const byTrain = groupBy(fs, (s) => s.trainNumber || "Unknown");
    return {
      total, byRole: sortedEntries(byRole), byTrain: sortedEntries(byTrain),
      roleSlices: [...byRole.entries()].map(([label, value]) => ({ label, value })),
      trainSlices: [...byTrain.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label: `T-${label}`, value })),
    };
  }, [fs]);

  /* ── Cross-Train Comparison ── */
  const crossTrain = useMemo(() => {
    const trainData = {};
    trainSet.forEach((t) => {
      const tOrders = fo.filter((o) => String(o.trainNumber) === t);
      const tComplaints = fc.filter((c) => String(c.trainNumber) === t);
      const tEmergencies = fe.filter((e) => String(e.trainNumber) === t);
      const tLnf = fl.filter((l) => String(l.trainNumber) === t);
      const tStaff = fs.filter((s) => String(s.trainNumber) === t);
      trainData[t] = {
        orders: tOrders.length,
        revenue: tOrders.reduce((s, o) => s + (o.totalPrice || 0), 0),
        complaints: tComplaints.length,
        resolved: tComplaints.filter((c) => (c.status || "").toLowerCase() === "resolved").length,
        emergencies: tEmergencies.length,
        lnf: tLnf.length,
        staff: tStaff.length,
        avgOV: tOrders.length ? (tOrders.reduce((s, o) => s + (o.totalPrice || 0), 0) / tOrders.length).toFixed(0) : 0,
      };
    });

    const labels = trainSet.slice(0, 10).map((t) => `T-${t}`);
    const orderVals = trainSet.slice(0, 10).map((t) => trainData[t]?.orders || 0);
    const revVals = trainSet.slice(0, 10).map((t) => trainData[t]?.revenue || 0);
    const compVals = trainSet.slice(0, 10).map((t) => trainData[t]?.complaints || 0);
    const emgVals = trainSet.slice(0, 10).map((t) => trainData[t]?.emergencies || 0);

    // stacked: orders + complaints + emergencies by train
    const activityStacks = [
      { name: "Orders", values: orderVals },
      { name: "Complaints", values: compVals },
      { name: "Emergencies", values: emgVals },
    ];

    return { labels, trainData, orderVals, revVals, compVals, emgVals, activityStacks };
  }, [trainSet, fo, fc, fe, fl, fs]);

  let aNum = 0;
  const an = () => ++aNum;

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  if (loading) return (
    <main className="page-shell fade-in"><section className="surface-card" style={{ textAlign: "center", padding: "4rem 2rem" }}><div className="an-spinner" /><p className="muted-text" style={{ marginTop: "1rem" }}>Loading system analytics…</p></section></main>
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
            <h1>System-Wide Analytics</h1>
            <p className="muted-text">100+ metrics across all {trainSet.length} trains — live data</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn btn-ghost" onClick={toggleTheme} title="Toggle theme">{theme === "light" ? "🌙" : "☀️"}</button>
            <Link className="btn btn-ghost" to="/superadmin-dashboard">← Dashboard</Link>
          </div>
        </div>
      </section>

      {/* Section Nav */}
      <section className="surface-card" style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {SECTIONS.map((s) => <button key={s} className={`btn ${section === s ? "" : "btn-ghost"}`} onClick={() => setSection(s)} style={section === s ? { fontWeight: 700 } : {}}>{s}</button>)}
        </div>
      </section>

      {/* Filters */}
      <section className="surface-card" style={{ marginTop: "1rem" }}>
        <h3 className="an-section-title">Filters</h3>
        <div className="an-filter-bar">
          <div className="an-filter-group"><label>From</label><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
          <div className="an-filter-group"><label>To</label><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
          <div className="an-filter-group"><label>Train</label><select value={trainFilter} onChange={(e) => setTrainFilter(e.target.value)}><option value="all">All Trains</option>{trainSet.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          <button className="btn btn-ghost" onClick={() => { setDateFrom(""); setDateTo(""); setTrainFilter("all"); }}>Reset</button>
        </div>
        <p className="muted-text" style={{ marginTop: "0.5rem" }}>Showing {fo.length} orders, {fc.length} complaints, {fe.length} emergencies across {trainFilter === "all" ? trainSet.length : 1} train(s)</p>
      </section>

      {/* ═══════════ OVERVIEW SECTION ═══════════ */}
      {show("Overview") && (
        <section className="surface-card an-section">
          <h2 className="an-section-title">System Overview</h2>
          <div className="an-kpi-grid">
            <div className="an-kpi"><span className="an-kpi-val">{overview.activeTrains}</span><span className="an-kpi-lbl">#{an()} Active Trains</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{fmt(overview.totalOrders)}</span><span className="an-kpi-lbl">#{an()} Total Orders</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{fmtCur(overview.totalRevenue)}</span><span className="an-kpi-lbl">#{an()} Total Revenue</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{fmtCur(overview.netRevenue)}</span><span className="an-kpi-lbl">#{an()} Net Revenue</span></div>
            <div className="an-kpi an-kpi-warn"><span className="an-kpi-val">{fmtCur(overview.cancelledRev)}</span><span className="an-kpi-lbl">#{an()} Cancelled Revenue</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{overview.cancellationPct}%</span><span className="an-kpi-lbl">#{an()} Cancellation %</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{fmtCur(overview.avgOV)}</span><span className="an-kpi-lbl">#{an()} Avg Order Value</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{fmtCur(overview.medianOV)}</span><span className="an-kpi-lbl">#{an()} Median Order</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{fmtCur(overview.maxOV)}</span><span className="an-kpi-lbl">#{an()} Max Order</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{overview.delivered}</span><span className="an-kpi-lbl">#{an()} Delivered</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{overview.pending}</span><span className="an-kpi-lbl">#{an()} Pending</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{overview.uniqueUsers}</span><span className="an-kpi-lbl">#{an()} Unique Users</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{overview.returningUsers}</span><span className="an-kpi-lbl">#{an()} Returning Users</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{overview.newUsers}</span><span className="an-kpi-lbl">#{an()} New Users</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{overview.totalComplaints}</span><span className="an-kpi-lbl">#{an()} Complaints</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{overview.totalEmergencies}</span><span className="an-kpi-lbl">#{an()} Emergencies</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{overview.totalFeedbacks}</span><span className="an-kpi-lbl">#{an()} Feedbacks</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{overview.totalLnf}</span><span className="an-kpi-lbl">#{an()} Lost & Found</span></div>
            <div className="an-kpi"><span className="an-kpi-val">{overview.totalStaff}</span><span className="an-kpi-lbl">#{an()} Total Staff</span></div>
            <Gauge value={overview.avgRating !== "N/A" ? overview.avgRating : 0} label={`#${an()} Avg Rating`} />
          </div>
        </section>
      )}

      {/* ═══════════ REVENUE SECTION ═══════════ */}
      {show("Revenue") && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">Revenue Deep Dive</h2>
            <div className="an-kpi-grid">
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(overview.totalRevenue)}</span><span className="an-kpi-lbl">#{an()} Total Revenue</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(overview.netRevenue)}</span><span className="an-kpi-lbl">#{an()} Net Revenue</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(revenue.stdDevOV)}</span><span className="an-kpi-lbl">#{an()} Std Dev (OV)</span></div>
            </div>
          </section>
          <section className="surface-card an-section">
            <h2 className="an-section-title">#{an()} Zoomable Revenue (Month → Week → Day)</h2>
            <ZoomableBarChart monthData={revenue.zoomMonth} weekData={revenue.zoomWeek} dayData={revenue.zoomDay} color="#22c55e" title="Revenue" />
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
              <h2 className="an-section-title">#{an()} Revenue per Month <span className="badge">{revenue.monthGrowth} MoM</span></h2>
              <BarChart labels={revenue.byMonth.labels} values={revenue.byMonth.values} color="#a855f7" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Revenue by Day of Week</h2>
              <BarChart labels={revenue.byDow.labels} values={revenue.byDow.values} color="#f59e0b" />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Revenue by Hour</h2>
              <BarChart labels={revenue.byHour.labels} values={revenue.byHour.values} color="#14b8a6" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top 5 Revenue Days</h2>
              <BarChart labels={revenue.top5Days.labels} values={revenue.top5Days.values} color="#22c55e" height={180} />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Revenue Share by Train</h2>
              <PieChart slices={revenue.trainRevSlices} donut />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Order Value Distribution</h2>
              <PieChart slices={revenue.tierSlices} />
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
              <div className="an-kpi an-kpi-warn"><span className="an-kpi-val">{orderStats.cancelled}</span><span className="an-kpi-lbl">#{an()} Cancelled</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.fulfillmentRate}%</span><span className="an-kpi-lbl">#{an()} Fulfillment Rate</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.cancellationRate}%</span><span className="an-kpi-lbl">#{an()} Cancel Rate</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.avgPerDay}</span><span className="an-kpi-lbl">#{an()} Avg/Day</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.peakHour}</span><span className="an-kpi-lbl">#{an()} Peak Hour</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{orderStats.peakDay}</span><span className="an-kpi-lbl">#{an()} Peak Day</span></div>
            </div>
          </section>
          <section className="surface-card an-section">
            <h2 className="an-section-title">#{an()} Zoomable Orders (Month → Week → Day)</h2>
            <ZoomableBarChart monthData={orderStats.zoomMonth} weekData={orderStats.zoomWeek} dayData={orderStats.zoomDay} color="var(--color-primary)" />
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Orders per Day <span className="badge">{orderStats.dodGrowth}</span></h2>
              <BarChart labels={orderStats.byDay.labels} values={orderStats.byDay.values} color="var(--color-primary)" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Orders per Week <span className="badge">{orderStats.wowGrowth}</span></h2>
              <BarChart labels={orderStats.byWeek.labels} values={orderStats.byWeek.values} color="#818cf8" />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Orders per Month <span className="badge">{orderStats.momGrowth}</span></h2>
              <BarChart labels={orderStats.byMonth.labels} values={orderStats.byMonth.values} color="#a855f7" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Status Distribution</h2>
              <PieChart slices={orderStats.statusSlices} donut />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Orders by Hour</h2>
              <BarChart labels={orderStats.byHour.labels} values={orderStats.byHour.values} color="#14b8a6" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Orders by Day of Week</h2>
              <BarChart labels={orderStats.byDow.labels} values={orderStats.byDow.values} color="#06b6d4" />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Orders by Train</h2>
              <PieChart slices={orderStats.trainSlices} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Orders by Train (Bar)</h2>
              <BarChart labels={orderStats.byTrain.labels.slice(0, 10).map((t) => `T-${t}`)} values={orderStats.byTrain.values.slice(0, 10)} color="#fb923c" />
            </section>
          </div>
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
              <div className="an-kpi"><span className="an-kpi-val" title={food.mostOrdered}>{food.mostOrdered.length > 12 ? food.mostOrdered.slice(0, 12) + "…" : food.mostOrdered}</span><span className="an-kpi-lbl">#{an()} #1 Item</span></div>
              <div className="an-kpi"><span className="an-kpi-val" title={food.leastOrdered}>{food.leastOrdered.length > 12 ? food.leastOrdered.slice(0, 12) + "…" : food.leastOrdered}</span><span className="an-kpi-lbl">#{an()} Least Popular</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top 5 Items (Qty)</h2>
              <BarChart labels={food.top5.labels} values={food.top5.values} color="#f59e0b" height={200} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top 5 Items (Revenue)</h2>
              <BarChart labels={food.top5Rev.labels} values={food.top5Rev.values} color="#22c55e" height={200} />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Bottom 5 Items</h2>
              <BarChart labels={food.bottom5.labels} values={food.bottom5.values} color="#f87171" height={200} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Category Distribution</h2>
              <PieChart slices={food.catQtySlices} />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Category Revenue</h2>
              <PieChart slices={food.catRevSlices} donut />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Food Sales Trend</h2>
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
          {food.trainFoodStacks.length > 0 && (
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top Items by Train (Stacked)</h2>
              <StackedBarChart labels={food.trainFoodLabels} stacks={food.trainFoodStacks} />
            </section>
          )}
          <section className="surface-card an-section">
            <h2 className="an-section-title">#{an()} Full Item Ranking</h2>
            <div className="table-wrapper"><table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Revenue</th></tr></thead><tbody>
              {food.itemRanking.length === 0 ? <tr><td colSpan="4" style={{ textAlign: "center", padding: "1.5rem" }}>No data</td></tr> : food.itemRanking.slice(0, 20).map((r) => <tr key={r.rank}><td><strong>{r.rank}</strong></td><td>{r.name}</td><td>{r.qty}</td><td>{fmtCur(r.revenue)}</td></tr>)}
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
              <div className="an-kpi"><span className="an-kpi-val">{comp.total}</span><span className="an-kpi-lbl">#{an()} Total</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.resolved}</span><span className="an-kpi-lbl">#{an()} Resolved</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.pending}</span><span className="an-kpi-lbl">#{an()} Pending</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.important}</span><span className="an-kpi-lbl">#{an()} Important</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.awaiting}</span><span className="an-kpi-lbl">#{an()} Awaiting</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.resolutionRate}%</span><span className="an-kpi-lbl">#{an()} Resolution Rate</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.avgResHrs}h</span><span className="an-kpi-lbl">#{an()} Avg Resolution</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.medResHrs}h</span><span className="an-kpi-lbl">#{an()} Median Resolution</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{comp.repeatComplainers}</span><span className="an-kpi-lbl">#{an()} Repeat Complainers</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} By Domain</h2>
              <PieChart slices={comp.domainSlices} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} By Status</h2>
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
              <h2 className="an-section-title">#{an()} By Day of Week</h2>
              <BarChart labels={comp.byDow.labels} values={comp.byDow.values} color="#818cf8" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top Complaint Bogies</h2>
              <BarChart labels={comp.topBogies.labels} values={comp.topBogies.values} color="#ef4444" height={180} />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Complaints by Train</h2>
              <BarChart labels={comp.topTrains.labels.map((t) => `T-${t}`)} values={comp.topTrains.values} color="#f87171" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Per-Train Breakdown</h2>
              <div className="table-wrapper"><table><thead><tr><th>Train</th><th>Total</th></tr></thead><tbody>{comp.byTrain.labels.map((t, i) => <tr key={t}><td>{t}</td><td>{comp.byTrain.values[i]}</td></tr>)}</tbody></table></div>
            </section>
          </div>
          {comp.domainByTrainStacks.length > 0 && (
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Domain × Train (Stacked)</h2>
              <StackedBarChart labels={comp.trainLabels} stacks={comp.domainByTrainStacks} />
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
              <div className="an-kpi"><span className="an-kpi-val">{emg.total}</span><span className="an-kpi-lbl">#{an()} Total</span></div>
              <div className="an-kpi an-kpi-warn"><span className="an-kpi-val">{emg.active}</span><span className="an-kpi-lbl">#{an()} Active</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{emg.peakHour}</span><span className="an-kpi-lbl">#{an()} Peak Hour</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Per Day</h2>
              <LineChart labels={emg.byDay.labels} datasets={[{ values: emg.byDay.values, color: "#ef4444" }]} area />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} By Hour</h2>
              <BarChart labels={emg.byHour.labels} values={emg.byHour.values} color="#f87171" />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} By Day of Week</h2>
              <BarChart labels={emg.byDow.labels} values={emg.byDow.values} color="#fb923c" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} By Train</h2>
              <PieChart slices={emg.trainSlices} />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top Emergency Trains</h2>
              <BarChart labels={emg.topTrains.labels.map((t) => `T-${t}`)} values={emg.topTrains.values} color="#ef4444" height={180} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Activity Heatmap (Day × Hour)</h2>
              <HeatMap data={emg.heatData} xLabels={emg.heatXLabels} yLabels={emg.heatYLabels} />
            </section>
          </div>
        </>
      )}

      {/* ═══════════ LOST & FOUND SECTION ═══════════ */}
      {show("Lost & Found") && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">Lost & Found Overview</h2>
            <div className="an-kpi-grid">
              <div className="an-kpi"><span className="an-kpi-val">{lnf.total}</span><span className="an-kpi-lbl">#{an()} Total</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{lnf.lost}</span><span className="an-kpi-lbl">#{an()} Lost</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{lnf.found}</span><span className="an-kpi-lbl">#{an()} Found</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{lnf.open}</span><span className="an-kpi-lbl">#{an()} Open</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{lnf.resolved}</span><span className="an-kpi-lbl">#{an()} Resolved</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{lnf.resolutionRate}%</span><span className="an-kpi-lbl">#{an()} Resolution Rate</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Lost vs Found</h2>
              <PieChart slices={lnf.categorySlices} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Status</h2>
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
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} By Train</h2>
              <PieChart slices={lnf.trainSlices} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Top L&F Trains</h2>
              <BarChart labels={lnf.topTrains.labels.map((t) => `T-${t}`)} values={lnf.topTrains.values} color="#8b5cf6" height={180} />
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
              <div className="an-kpi"><span className="an-kpi-val">{users.returning}</span><span className="an-kpi-lbl">#{an()} Returning</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{users.newUsers}</span><span className="an-kpi-lbl">#{an()} New</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{users.multiTrain}</span><span className="an-kpi-lbl">#{an()} Multi-Train Users</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fmtCur(Number(users.avgSpend))}</span><span className="an-kpi-lbl">#{an()} Avg Spend</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{users.avgOrders}</span><span className="an-kpi-lbl">#{an()} Avg Orders/User</span></div>
            </div>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Spending Tiers</h2>
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
              <BarChart labels={users.actByHour.labels} values={users.actByHour.values} color="#818cf8" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Activity by Day of Week</h2>
              <BarChart labels={users.actByDow.labels} values={users.actByDow.values} color="#14b8a6" />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Returning vs New</h2>
              <PieChart slices={[{ label: "Returning", value: users.returning, color: "#38bdf8" }, { label: "New", value: users.newUsers, color: "#a855f7" }]} donut size={180} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Users by Train</h2>
              <PieChart slices={users.usersByTrain} />
            </section>
          </div>
        </>
      )}

      {/* ═══════════ FEEDBACK SECTION ═══════════ */}
      {show("Feedback") && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">Feedback Overview</h2>
            <div className="an-kpi-grid" style={{ alignItems: "center" }}>
              <div className="an-kpi"><span className="an-kpi-val">{fb.total}</span><span className="an-kpi-lbl">#{an()} Total</span></div>
              <Gauge value={fb.avgRating} label={`#${an()} Avg Rating`} />
              <div className="an-kpi"><span className="an-kpi-val">{fb.nps}</span><span className="an-kpi-lbl">#{an()} NPS</span></div>
              <div className="an-kpi"><span className="an-kpi-val">{fb.csatPct}%</span><span className="an-kpi-lbl">#{an()} CSAT</span></div>
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
              <h2 className="an-section-title">#{an()} By Day of Week</h2>
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
              <h2 className="an-section-title">#{an()} By Role</h2>
              <PieChart slices={staffStats.roleSlices} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Role Distribution</h2>
              <BarChart labels={staffStats.byRole.labels} values={staffStats.byRole.values} color="#818cf8" height={180} />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Staff by Train</h2>
              <PieChart slices={staffStats.trainSlices} />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Staff Distribution (Bar)</h2>
              <BarChart labels={staffStats.byTrain.labels.slice(0, 10).map((t) => `T-${t}`)} values={staffStats.byTrain.values.slice(0, 10)} color="#14b8a6" />
            </section>
          </div>
        </>
      )}

      {/* ═══════════ CROSS-TRAIN COMPARISON ═══════════ */}
      {show("Cross-Train") && (
        <>
          <section className="surface-card an-section">
            <h2 className="an-section-title">Cross-Train Comparison</h2>
            <p className="muted-text">Comparing metrics across up to 10 trains</p>
          </section>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Orders by Train</h2>
              <BarChart labels={crossTrain.labels} values={crossTrain.orderVals} color="var(--color-primary)" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Revenue by Train</h2>
              <BarChart labels={crossTrain.labels} values={crossTrain.revVals} color="#22c55e" />
            </section>
          </div>
          <div className="an-two-col">
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Complaints by Train</h2>
              <BarChart labels={crossTrain.labels} values={crossTrain.compVals} color="#f87171" />
            </section>
            <section className="surface-card an-section">
              <h2 className="an-section-title">#{an()} Emergencies by Train</h2>
              <BarChart labels={crossTrain.labels} values={crossTrain.emgVals} color="#ef4444" />
            </section>
          </div>
          <section className="surface-card an-section">
            <h2 className="an-section-title">#{an()} Activity Stacked (Orders + Complaints + Emergencies)</h2>
            <StackedBarChart labels={crossTrain.labels} stacks={crossTrain.activityStacks} />
          </section>
          <section className="surface-card an-section">
            <h2 className="an-section-title">#{an()} Full Train Performance Table</h2>
            <div className="table-wrapper"><table><thead><tr><th>Train</th><th>Orders</th><th>Revenue</th><th>Avg OV</th><th>Complaints</th><th>Resolved</th><th>Emergencies</th><th>L&F</th><th>Staff</th></tr></thead><tbody>
              {trainSet.map((t) => { const d = crossTrain.trainData[t] || {}; return (<tr key={t}><td><strong>{t}</strong></td><td>{d.orders || 0}</td><td>{fmtCur(d.revenue || 0)}</td><td>{fmtCur(Number(d.avgOV) || 0)}</td><td>{d.complaints || 0}</td><td>{d.resolved || 0}</td><td>{d.emergencies || 0}</td><td>{d.lnf || 0}</td><td>{d.staff || 0}</td></tr>); })}
            </tbody></table></div>
          </section>
        </>
      )}

      {/* Total analytics counter */}
      <section className="surface-card" style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <p className="muted-text">Showing <strong>{aNum}</strong> analytics{section !== "All" ? ` in ${section}` : ""} across {trainSet.length} trains — powered by live database</p>
      </section>
    </main>
  );
};

export default SuperAdminAnalytics;