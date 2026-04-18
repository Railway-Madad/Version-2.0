import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { clearSuperAdminToken } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";
import "./SuperAdminDashboard.css";

/* ═══════════════════════════════════════════════════════════════════
   ICONS - SVG Components
   ═══════════════════════════════════════════════════════════════════ */
const Icons = {
  Dashboard: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Analytics: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Staff: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><circle cx="19" cy="11" r="2"/><path d="M19 8v1"/><path d="M19 13v1"/></svg>,
  Admin: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Complaints: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Emergency: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  LostFound: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Orders: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Feedback: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Train: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/><path d="M8 19l-2 3"/><path d="M18 22l-2-3"/></svg>,
  Moon: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Sun: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Logout: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Menu: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Close: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  RefreshCw: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  TrendUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
};

/* ═══════════════════════════════════════════════════════════════════
   CHART COMPONENTS - Pure SVG
   ═══════════════════════════════════════════════════════════════════ */
const LineChart = ({ labels = [], datasets = [], height = 200, area = false }) => {
  if (!labels.length) return <div className="sa-chart-empty">No data available</div>;
  const W = 500, H = height, pad = { t: 20, r: 20, b: 35, l: 50 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const allVals = datasets.flatMap((d) => d.values);
  const maxV = Math.max(...allVals, 1), minV = Math.min(...allVals, 0), range = maxV - minV || 1;
  const x = (i) => pad.l + (i / (labels.length - 1 || 1)) * plotW;
  const y = (v) => pad.t + plotH - ((v - minV) / range) * plotH;
  
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sa-chart-svg">
      {[...Array(5)].map((_, i) => { 
        const yy = pad.t + (plotH / 4) * i; 
        const val = maxV - (range / 4) * i; 
        return (
          <g key={i}>
            <line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="var(--chart-grid)" strokeDasharray="3,3" />
            <text x={pad.l - 8} y={yy + 4} textAnchor="end" className="sa-chart-label">
              {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}
            </text>
          </g>
        ); 
      })}
      {labels.map((l, i) => { 
        if (labels.length > 10 && i % Math.ceil(labels.length / 6) !== 0) return null; 
        return <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="sa-chart-label">{l}</text>; 
      })}
      {datasets.map((ds, di) => { 
        const pts = ds.values.map((v, i) => `${x(i)},${y(v)}`).join(" "); 
        return (
          <g key={di}>
            {area && <polygon points={`${x(0)},${y(minV)} ${pts} ${x(ds.values.length - 1)},${y(minV)}`} fill={ds.color || "var(--color-primary)"} opacity="0.15" />}
            <polyline fill="none" stroke={ds.color || "var(--color-primary)"} strokeWidth="2.5" points={pts} />
            {ds.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="4" fill={ds.color || "var(--color-primary)"} className="sa-chart-dot"><title>{`${labels[i]}: ${v}`}</title></circle>)}
          </g>
        ); 
      })}
    </svg>
  );
};

const BarChart = ({ labels = [], values = [], color = "var(--color-primary)", height = 200 }) => {
  if (!labels.length || !values.length) return <div className="sa-chart-empty">No data available</div>;
  const W = 500, H = height, pad = { t: 20, r: 20, b: 40, l: 50 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const maxV = Math.max(...values, 1);
  const barW = Math.min(plotW / labels.length * 0.6, 35), gap = plotW / labels.length;
  
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sa-chart-svg">
      {[...Array(5)].map((_, i) => { 
        const yy = pad.t + (plotH / 4) * i; 
        const val = maxV - (maxV / 4) * i; 
        return (
          <g key={i}>
            <line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="var(--chart-grid)" strokeDasharray="3,3" />
            <text x={pad.l - 8} y={yy + 4} textAnchor="end" className="sa-chart-label">
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
            <rect x={bx} y={by} width={barW} height={bh} rx="4" fill={color} opacity="0.85" className="sa-bar">
              <title>{`${labels[i]}: ${v}`}</title>
            </rect>
            <text x={bx + barW / 2} y={H - 6} textAnchor="middle" className="sa-chart-label" transform={labels.length > 6 ? `rotate(-25, ${bx + barW / 2}, ${H - 6})` : ""}>
              {labels[i]?.length > 6 ? labels[i].slice(0, 6) + "…" : labels[i]}
            </text>
          </g>
        ); 
      })}
    </svg>
  );
};

const DonutChart = ({ slices = [], size = 180 }) => {
  if (!slices.length) return <div className="sa-chart-empty">No data</div>;
  const total = slices.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 15, cx = size / 2, cy = size / 2;
  const ir = r * 0.6;
  let cumAngle = -90;
  const colors = ["#38bdf8", "#a855f7", "#22c55e", "#f59e0b", "#f87171", "#818cf8", "#14b8a6", "#fb923c"];
  
  const arcs = slices.map((s, i) => { 
    const angle = (s.value / total) * 360; 
    const startRad = (cumAngle * Math.PI) / 180; 
    const endRad = ((cumAngle + angle) * Math.PI) / 180; 
    const large = angle > 180 ? 1 : 0; 
    const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad); 
    const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad); 
    const ix1 = cx + ir * Math.cos(endRad), iy1 = cy + ir * Math.sin(endRad); 
    const ix2 = cx + ir * Math.cos(startRad), iy2 = cy + ir * Math.sin(startRad); 
    const path = `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${ix1},${iy1} A${ir},${ir} 0 ${large} 0 ${ix2},${iy2} Z`; 
    cumAngle += angle; 
    return <path key={i} d={path} fill={s.color || colors[i % colors.length]} opacity="0.9" className="sa-pie-slice"><title>{`${s.label}: ${s.value} (${((s.value / total) * 100).toFixed(1)}%)`}</title></path>; 
  });
  
  return (
    <div className="sa-donut-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>{arcs}</svg>
      <div className="sa-donut-legend">
        {slices.map((s, i) => (
          <div key={i} className="sa-legend-item">
            <span className="sa-legend-dot" style={{ background: s.color || colors[i % colors.length] }} />
            <span className="sa-legend-label">{s.label}</span>
            <span className="sa-legend-value">{((s.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MiniGauge = ({ value, max = 100, label = "", color = "#22c55e" }) => {
  const pct = Math.min(value / max, 1);
  const r = 32, c = 2 * Math.PI * r * 0.75;
  return (
    <div className="sa-gauge">
      <svg width="80" height="60" viewBox="0 0 80 60">
        <path d="M 8 52 A 32 32 0 1 1 72 52" fill="none" stroke="var(--chart-grid)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 8 52 A 32 32 0 1 1 72 52" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${pct * c} ${c}`} />
        <text x="40" y="42" textAnchor="middle" className="sa-gauge-value">{value.toFixed(1)}</text>
      </svg>
      {label && <div className="sa-gauge-label">{label}</div>}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════════ */
const fmt = (n) => (n >= 100000 ? `${(n / 100000).toFixed(2)}L` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : Number(n).toFixed(0));
const fmtCur = (n) => `₹${fmt(n)}`;
const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) : "0.0");
const dayKey = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
const monthKey = (d) => new Date(d).toLocaleString("default", { month: "short" });
const dowKey = (d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(d).getDay()];
const groupBy = (arr, keyFn) => { const m = new Map(); arr.forEach((it) => { const k = keyFn(it); m.set(k, (m.get(k) || 0) + 1); }); return m; };
const groupSum = (arr, keyFn, valFn) => { const m = new Map(); arr.forEach((it) => { const k = keyFn(it); m.set(k, (m.get(k) || 0) + valFn(it)); }); return m; };
const sortedEntries = (map) => { const e = [...map.entries()]; return { labels: e.map((x) => x[0]), values: e.map((x) => x[1]) }; };
const topN = (map, n = 5) => { const e = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n); return { labels: e.map((x) => x[0]), values: e.map((x) => x[1]) }; };

/* ═══════════════════════════════════════════════════════════════════
   SIDEBAR NAVIGATION ITEMS
   ═══════════════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Icons.Dashboard },
  { id: "analytics", label: "Analytics", icon: Icons.Analytics },
  { id: "trains", label: "Trains", icon: Icons.Train },
  { id: "users", label: "Passengers", icon: Icons.Users },
  { id: "staff", label: "Staff", icon: Icons.Staff },
  { id: "admins", label: "Admins", icon: Icons.Admin },
  { id: "complaints", label: "Complaints", icon: Icons.Complaints },
  { id: "emergency", label: "Emergency", icon: Icons.Emergency },
  { id: "lostnfound", label: "Lost & Found", icon: Icons.LostFound },
  { id: "orders", label: "Orders", icon: Icons.Orders },
  { id: "feedback", label: "Feedback", icon: Icons.Feedback },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
const SuperAdminDashboard = () => {
  const BATCH_SIZE = 25;
  const { apiBase } = useApi();
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Data states
  const [systemStats, setSystemStats] = useState(null);
  const [trainsStats, setTrainsStats] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [complaintAnalysis, setComplaintAnalysis] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [lostFound, setLostFound] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [trainFilter, setTrainFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  
  // User detail modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState(null);
  const [loadingUserHistory, setLoadingUserHistory] = useState(false);
  
  // Staff detail modal state
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffDetails, setStaffDetails] = useState(null);
  const [loadingStaffDetails, setLoadingStaffDetails] = useState(false);
  
  // Admin detail modal state
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminDetails, setAdminDetails] = useState(null);
  const [loadingAdminDetails, setLoadingAdminDetails] = useState(false);
  
  // Emergency detail modal state
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  useEffect(() => {
    loadAllData();
  }, [apiBase]);

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
      
      const [sysRes, trainsRes, perfRes, complAnalysisRes] = await Promise.all([
        fetch(`${apiBase}/superadmin/stats/system`, { credentials: "include" }).catch(() => null),
        fetch(`${apiBase}/superadmin/stats/trains`, { credentials: "include" }).catch(() => null),
        fetch(`${apiBase}/superadmin/stats/performance`, { credentials: "include" }).catch(() => null),
        fetch(`${apiBase}/superadmin/stats/complaints-analysis`, { credentials: "include" }).catch(() => null),
      ]);

      if (sysRes?.ok) setSystemStats((await sysRes.json()).data);
      if (trainsRes?.ok) setTrainsStats((await trainsRes.json()).data || []);
      if (perfRes?.ok) setPerformanceMetrics((await perfRes.json()).data || []);
      if (complAnalysisRes?.ok) setComplaintAnalysis((await complAnalysisRes.json()).data || []);
      const [allUsersData, allStaffData] = await Promise.all([
        fetchAllBatches(`${apiBase}/superadmin/users`, { credentials: "include" }),
        fetchAllBatches(`${apiBase}/superadmin/staff`, { credentials: "include" }),
      ]);

      setAllUsers(allUsersData);
      setAllStaff(allStaffData);
      
      // Load additional data for analytics
      const [ordersRes, complaintsRes, emgRes, lnfRes, fbRes, adminsRes] = await Promise.all([
        fetchAllBatches(`${apiBase}/admin/all-orders`, { credentials: "include" }),
        fetchAllBatches(`${apiBase}/admin/all-complaints`, { credentials: "include" }),
        fetchAllBatches(`${apiBase}/emergency/getEmg`, { credentials: "include" }),
        fetchAllBatches(`${apiBase}/admin/all-lostnfound`, { credentials: "include" }),
        fetchAllBatches(`${apiBase}/feedback`, { credentials: "include" }),
        fetchAllBatches(`${apiBase}/superadmin/admins`, { credentials: "include" }),
      ]);

      setOrders(ordersRes);
      setComplaints(complaintsRes);
      setEmergencies(emgRes);
      setLostFound(lnfRes);
      setFeedbacks(fbRes);
      setAllAdmins(adminsRes);
      
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter functions
  const inRange = useCallback((dateStr) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    if (dateRange.from && d < new Date(dateRange.from)) return false;
    if (dateRange.to && d > new Date(new Date(dateRange.to).setHours(23, 59, 59, 999))) return false;
    return true;
  }, [dateRange]);

  const matchTrain = useCallback((tn) => trainFilter === "all" || String(tn) === String(trainFilter), [trainFilter]);

  // Fetch user history when selecting a user
  const fetchUserHistory = useCallback(async (userId) => {
    if (!userId) return;
    setLoadingUserHistory(true);
    try {
      const res = await fetch(`${apiBase}/superadmin/users/${userId}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setUserHistory(data.data);
      } else {
        setUserHistory(null);
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
      setUserHistory(null);
    } finally {
      setLoadingUserHistory(false);
    }
  }, [apiBase]);

  // Handle user click to show details
  const handleUserClick = useCallback((user) => {
    setSelectedUser(user);
    fetchUserHistory(user._id);
  }, [fetchUserHistory]);

  // Close user detail panel
  const closeUserDetail = useCallback(() => {
    setSelectedUser(null);
    setUserHistory(null);
  }, []);

  // Fetch staff details when selecting a staff
  const fetchStaffDetails = useCallback(async (staffId) => {
    if (!staffId) return;
    setLoadingStaffDetails(true);
    try {
      const res = await fetch(`${apiBase}/superadmin/staff/${staffId}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setStaffDetails(data.data);
      } else {
        setStaffDetails(null);
      }
    } catch (error) {
      console.error('Error fetching staff details:', error);
      setStaffDetails(null);
    } finally {
      setLoadingStaffDetails(false);
    }
  }, [apiBase]);

  // Handle staff click to show details
  const handleStaffClick = useCallback((staff) => {
    setSelectedStaff(staff);
    fetchStaffDetails(staff._id);
  }, [fetchStaffDetails]);

  // Close staff detail panel
  const closeStaffDetail = useCallback(() => {
    setSelectedStaff(null);
    setStaffDetails(null);
  }, []);

  // Fetch admin details when selecting an admin
  const fetchAdminDetails = useCallback(async (adminId) => {
    if (!adminId) return;
    setLoadingAdminDetails(true);
    try {
      const res = await fetch(`${apiBase}/superadmin/admins/${adminId}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setAdminDetails(data.data);
      } else {
        setAdminDetails(null);
      }
    } catch (error) {
      console.error('Error fetching admin details:', error);
      setAdminDetails(null);
    } finally {
      setLoadingAdminDetails(false);
    }
  }, [apiBase]);

  // Handle admin click to show details
  const handleAdminClick = useCallback((admin) => {
    setSelectedAdmin(admin);
    fetchAdminDetails(admin._id);
  }, [fetchAdminDetails]);

  // Close admin detail panel
  const closeAdminDetail = useCallback(() => {
    setSelectedAdmin(null);
    setAdminDetails(null);
  }, []);

  // Handle emergency click to show details
  const handleEmergencyClick = useCallback((emergency) => {
    setSelectedEmergency(emergency);
  }, []);

  // Close emergency detail panel
  const closeEmergencyDetail = useCallback(() => {
    setSelectedEmergency(null);
  }, []);

  // Filtered data
  const filteredOrders = useMemo(() => orders.filter(o => inRange(o.createdAt) && matchTrain(o.trainNumber)), [orders, inRange, matchTrain]);
  const filteredComplaints = useMemo(() => complaints.filter(c => inRange(c.createdAt) && matchTrain(c.trainNumber)), [complaints, inRange, matchTrain]);
  const filteredEmergencies = useMemo(() => emergencies.filter(e => inRange(e.createdAt) && matchTrain(e.trainNumber)), [emergencies, inRange, matchTrain]);
  const filteredLostFound = useMemo(() => lostFound.filter(l => inRange(l.createdAt) && matchTrain(l.trainNumber)), [lostFound, inRange, matchTrain]);

  // Get all unique trains from data
  const trainSet = useMemo(() => {
    const s = new Set();
    trainsStats.forEach(t => s.add(String(t.trainNumber)));
    orders.forEach(o => o.trainNumber && s.add(String(o.trainNumber)));
    complaints.forEach(c => c.trainNumber && s.add(String(c.trainNumber)));
    return [...s].sort();
  }, [trainsStats, orders, complaints]);

  /* ═══════════════════════════════════════════════════════════════
     COMPUTED ANALYTICS
     ═══════════════════════════════════════════════════════════════ */
  const analytics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const deliveredOrders = filteredOrders.filter(o => (o.status || "").toLowerCase() === "delivered").length;
    const resolvedComplaints = filteredComplaints.filter(c => (c.status || "").toLowerCase() === "resolved").length;
    
    // Orders by day
    const ordersByDay = sortedEntries(groupBy(filteredOrders, o => dayKey(o.createdAt)));
    
    // Revenue by day
    const revenueByDay = sortedEntries(groupSum(filteredOrders, o => dayKey(o.createdAt), o => o.totalPrice || 0));
    
    // Orders by status
    const ordersByStatus = [...groupBy(filteredOrders, o => o.status || "unknown").entries()].map(([label, value]) => ({ label, value }));
    
    // Complaints by domain
    const complaintsByDomain = [...groupBy(filteredComplaints, c => c.issueDomain || "Other").entries()].map(([label, value]) => ({ label, value }));
    
    // Complaints by status
    const complaintsByStatus = [...groupBy(filteredComplaints, c => c.status || "unknown").entries()].map(([label, value]) => ({ label, value }));

    // Staff by role
    const staffByRole = [...groupBy(allStaff, s => s.role || "Unknown").entries()].map(([label, value]) => ({ label, value }));

    // Feedback stats
    const avgRating = feedbacks.length ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length) : 0;
    const ratingDist = [1, 2, 3, 4, 5].map(r => ({ label: `${r}★`, value: feedbacks.filter(f => Math.round(f.rating) === r).length }));

    return {
      totalRevenue,
      deliveredOrders,
      resolvedComplaints,
      ordersByDay,
      revenueByDay,
      ordersByStatus,
      complaintsByDomain,
      complaintsByStatus,
      staffByRole,
      avgRating,
      ratingDist,
    };
  }, [filteredOrders, filteredComplaints, allStaff, feedbacks]);

  /* ═══════════════════════════════════════════════════════════════
     RENDER SECTIONS
     ═══════════════════════════════════════════════════════════════ */

  const renderOverview = () => (
    <div className="sa-content-area">
      <h2 className="sa-section-title">System Overview</h2>
      
      {/* Quick Stats Grid */}
      <div className="sa-stats-grid">
        <div className="sa-stat-card blue">
          <div className="sa-stat-icon"><Icons.Users /></div>
          <div className="sa-stat-content">
            <span className="sa-stat-value">{systemStats?.users || allUsers.length}</span>
            <span className="sa-stat-label">Total Passengers</span>
          </div>
        </div>
        <div className="sa-stat-card purple">
          <div className="sa-stat-icon"><Icons.Staff /></div>
          <div className="sa-stat-content">
            <span className="sa-stat-value">{systemStats?.staff || allStaff.length}</span>
            <span className="sa-stat-label">Staff Members</span>
          </div>
        </div>
        <div className="sa-stat-card green">
          <div className="sa-stat-icon"><Icons.Train /></div>
          <div className="sa-stat-content">
            <span className="sa-stat-value">{systemStats?.trains || trainSet.length}</span>
            <span className="sa-stat-label">Active Trains</span>
          </div>
        </div>
        <div className="sa-stat-card orange">
          <div className="sa-stat-icon"><Icons.Orders /></div>
          <div className="sa-stat-content">
            <span className="sa-stat-value">{fmtCur(analytics.totalRevenue)}</span>
            <span className="sa-stat-label">Total Revenue</span>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="sa-section-grid">
        <div className="sa-card">
          <h3 className="sa-card-title">Complaints Overview</h3>
          <div className="sa-mini-stats">
            <div className="sa-mini-stat">
              <span className="sa-mini-value">{systemStats?.complaints?.total || filteredComplaints.length}</span>
              <span className="sa-mini-label">Total</span>
            </div>
            <div className="sa-mini-stat warning">
              <span className="sa-mini-value">{systemStats?.complaints?.pending || filteredComplaints.filter(c => c.status === "pending").length}</span>
              <span className="sa-mini-label">Pending</span>
            </div>
            <div className="sa-mini-stat success">
              <span className="sa-mini-value">{systemStats?.complaints?.resolved || analytics.resolvedComplaints}</span>
              <span className="sa-mini-label">Resolved</span>
            </div>
          </div>
          <DonutChart slices={analytics.complaintsByStatus} size={160} />
        </div>

        <div className="sa-card">
          <h3 className="sa-card-title">Orders Overview</h3>
          <div className="sa-mini-stats">
            <div className="sa-mini-stat">
              <span className="sa-mini-value">{systemStats?.orders?.total || filteredOrders.length}</span>
              <span className="sa-mini-label">Total</span>
            </div>
            <div className="sa-mini-stat success">
              <span className="sa-mini-value">{systemStats?.orders?.delivered || analytics.deliveredOrders}</span>
              <span className="sa-mini-label">Delivered</span>
            </div>
            <div className="sa-mini-stat warning">
              <span className="sa-mini-value">{systemStats?.orders?.pending || filteredOrders.filter(o => o.status === "pending").length}</span>
              <span className="sa-mini-label">Pending</span>
            </div>
          </div>
          <DonutChart slices={analytics.ordersByStatus} size={160} />
        </div>

        <div className="sa-card">
          <h3 className="sa-card-title">Emergency & Lost/Found</h3>
          <div className="sa-mini-stats">
            <div className="sa-mini-stat danger">
              <span className="sa-mini-value">{systemStats?.emergencies?.total || filteredEmergencies.length}</span>
              <span className="sa-mini-label">Emergencies</span>
            </div>
            <div className="sa-mini-stat">
              <span className="sa-mini-value">{systemStats?.lostNFound?.total || filteredLostFound.length}</span>
              <span className="sa-mini-label">Lost & Found</span>
            </div>
            <div className="sa-mini-stat success">
              <span className="sa-mini-value">{systemStats?.lostNFound?.claimed || filteredLostFound.filter(l => l.claimed).length}</span>
              <span className="sa-mini-label">Claimed</span>
            </div>
          </div>
          <MiniGauge value={filteredEmergencies.filter(e => e.status === "responded").length} max={filteredEmergencies.length || 1} label="Response Rate" color="#22c55e" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="sa-charts-row">
        <div className="sa-card large">
          <h3 className="sa-card-title">Orders Trend</h3>
          <LineChart labels={analytics.ordersByDay.labels.slice(-14)} datasets={[{ values: analytics.ordersByDay.values.slice(-14), color: "#38bdf8" }]} height={220} area />
        </div>
        <div className="sa-card large">
          <h3 className="sa-card-title">Revenue Trend</h3>
          <LineChart labels={analytics.revenueByDay.labels.slice(-14)} datasets={[{ values: analytics.revenueByDay.values.slice(-14), color: "#22c55e" }]} height={220} area />
        </div>
      </div>

      {/* Feedback Summary */}
      <div className="sa-card full-width">
        <h3 className="sa-card-title">Customer Feedback</h3>
        <div className="sa-feedback-summary">
          <MiniGauge value={analytics.avgRating} max={5} label="Avg Rating" color="#f59e0b" />
          <div className="sa-feedback-bars">
            {analytics.ratingDist.map((r, i) => (
              <div key={i} className="sa-rating-bar">
                <span className="sa-rating-label">{r.label}</span>
                <div className="sa-rating-track">
                  <div className="sa-rating-fill" style={{ width: `${(r.value / (feedbacks.length || 1)) * 100}%`, background: i >= 3 ? "#22c55e" : i === 2 ? "#f59e0b" : "#f87171" }} />
                </div>
                <span className="sa-rating-count">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="sa-content-area">
      <h2 className="sa-section-title">Detailed Analytics</h2>
      
      {/* Filter Bar */}
      <div className="sa-filter-bar">
        <div className="sa-filter-group">
          <label>Train</label>
          <select value={trainFilter} onChange={e => setTrainFilter(e.target.value)}>
            <option value="all">All Trains</option>
            {trainSet.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="sa-filter-group">
          <label>From</label>
          <input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} />
        </div>
        <div className="sa-filter-group">
          <label>To</label>
          <input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} />
        </div>
        <button className="sa-btn-ghost" onClick={() => { setTrainFilter("all"); setDateRange({ from: "", to: "" }); }}>Reset</button>
      </div>

      {/* KPI Summary */}
      <div className="sa-kpi-row">
        <div className="sa-kpi">
          <span className="sa-kpi-value">{filteredOrders.length}</span>
          <span className="sa-kpi-label">Orders</span>
        </div>
        <div className="sa-kpi">
          <span className="sa-kpi-value">{fmtCur(analytics.totalRevenue)}</span>
          <span className="sa-kpi-label">Revenue</span>
        </div>
        <div className="sa-kpi">
          <span className="sa-kpi-value">{filteredComplaints.length}</span>
          <span className="sa-kpi-label">Complaints</span>
        </div>
        <div className="sa-kpi">
          <span className="sa-kpi-value">{pct(analytics.resolvedComplaints, filteredComplaints.length)}%</span>
          <span className="sa-kpi-label">Resolution Rate</span>
        </div>
        <div className="sa-kpi">
          <span className="sa-kpi-value">{filteredEmergencies.length}</span>
          <span className="sa-kpi-label">Emergencies</span>
        </div>
      </div>

      <div className="sa-charts-row">
        <div className="sa-card">
          <h3 className="sa-card-title">Complaints by Domain</h3>
          <DonutChart slices={analytics.complaintsByDomain} size={180} />
        </div>
        <div className="sa-card">
          <h3 className="sa-card-title">Staff Distribution</h3>
          <DonutChart slices={analytics.staffByRole} size={180} />
        </div>
      </div>

      <div className="sa-charts-row">
        <div className="sa-card large">
          <h3 className="sa-card-title">Orders by Day</h3>
          <BarChart labels={analytics.ordersByDay.labels.slice(-14)} values={analytics.ordersByDay.values.slice(-14)} color="#38bdf8" height={220} />
        </div>
        <div className="sa-card large">
          <h3 className="sa-card-title">Revenue by Day</h3>
          <BarChart labels={analytics.revenueByDay.labels.slice(-14)} values={analytics.revenueByDay.values.slice(-14)} color="#22c55e" height={220} />
        </div>
      </div>
    </div>
  );

  const renderTrains = () => (
    <div className="sa-content-area">
      <h2 className="sa-section-title">Trains Overview</h2>
      
      {/* Trains Stats Grid */}
      <div className="sa-stats-grid">
        <div className="sa-stat-card blue">
          <div className="sa-stat-icon"><Icons.Train /></div>
          <div className="sa-stat-content">
            <span className="sa-stat-value">{trainsStats.length}</span>
            <span className="sa-stat-label">Total Trains</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="sa-card full-width">
        <h3 className="sa-card-title">Train-wise Statistics</h3>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Train</th>
                <th>Staff</th>
                <th>Total Complaints</th>
                <th>Pending</th>
                <th>Resolved</th>
                <th>Orders</th>
                <th>Emergencies</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {trainsStats.map((train, idx) => {
                // Calculate pending/resolved from complaints array if available
                const trainComplaints = complaints.filter(c => String(c.trainNumber) === String(train.trainNumber));
                const pendingCount = trainComplaints.filter(c => c.status === "Pending" || c.status === "InProcess").length;
                const resolvedCount = trainComplaints.filter(c => c.status === "Resolved" || c.status === "AwaitingConfirmation" || c.status === "Closed").length;
                const totalComplaints = train.complaints?.total || trainComplaints.length || 0;
                
                return (
                  <tr key={idx}>
                    <td><strong>{train.trainNumber}</strong></td>
                    <td>{train.staff || 0}</td>
                    <td>{totalComplaints}</td>
                    <td><span className="sa-badge warning">{train.complaints?.pending || pendingCount}</span></td>
                    <td><span className="sa-badge success">{train.complaints?.resolved || resolvedCount}</span></td>
                    <td>{train.orders?.total || 0}</td>
                    <td><span className="sa-badge danger">{train.emergencies?.total || 0}</span></td>
                    <td>{train.feedback || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="sa-card full-width">
        <h3 className="sa-card-title">Performance Metrics</h3>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Train</th>
                <th>Complaint Resolution %</th>
                <th>Order Delivery %</th>
                <th>Avg Order Value</th>
              </tr>
            </thead>
            <tbody>
              {performanceMetrics.map((metric, idx) => (
                <tr key={idx}>
                  <td><strong>{metric.trainNumber}</strong></td>
                  <td>
                    <div className="sa-progress-bar">
                      <div className="sa-progress-fill" style={{ width: `${metric.complaintResolutionRate}%`, background: metric.complaintResolutionRate > 70 ? "#22c55e" : "#f59e0b" }} />
                      <span>{metric.complaintResolutionRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="sa-progress-bar">
                      <div className="sa-progress-fill" style={{ width: `${metric.orderDeliveryRate}%`, background: metric.orderDeliveryRate > 80 ? "#22c55e" : "#f59e0b" }} />
                      <span>{metric.orderDeliveryRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>{fmtCur(metric.averageOrderValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = allUsers.filter(u => 
      !searchTerm || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
      <div className="sa-content-area">
        <h2 className="sa-section-title">Passenger Management</h2>
        
        <div className="sa-stats-grid small">
          <div className="sa-stat-card blue">
            <div className="sa-stat-content">
              <span className="sa-stat-value">{allUsers.length}</span>
              <span className="sa-stat-label">Total Passengers</span>
            </div>
          </div>
          <div className="sa-stat-card green">
            <div className="sa-stat-content">
              <span className="sa-stat-value">{complaints.filter(c => c.status === "Resolved").length}</span>
              <span className="sa-stat-label">Resolved Complaints</span>
            </div>
          </div>
          <div className="sa-stat-card orange">
            <div className="sa-stat-content">
              <span className="sa-stat-value">{orders.length}</span>
              <span className="sa-stat-label">Total Orders</span>
            </div>
          </div>
        </div>

        <div className="sa-users-layout">
          {/* Users Table */}
          <div className={`sa-card ${selectedUser ? 'sa-users-table-collapsed' : 'full-width'}`}>
            <div className="sa-card-header">
              <h3 className="sa-card-title">All Passengers</h3>
              <input 
                type="text" 
                className="sa-search" 
                placeholder="Search by username or email..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            <div className="sa-table-wrap">
              <table className="sa-table sa-table-clickable">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.slice(0, 50).map((user, idx) => (
                    <tr 
                      key={user._id || idx} 
                      className={selectedUser?._id === user._id ? 'sa-row-selected' : ''}
                      onClick={() => handleUserClick(user)}
                    >
                      <td><strong>{user.username}</strong></td>
                      <td>{user.email}</td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
                      <td>
                        <button 
                          className="sa-btn-small sa-btn-primary"
                          onClick={(e) => { e.stopPropagation(); handleUserClick(user); }}
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length > 50 && (
                <p className="sa-table-footer">Showing 50 of {filteredUsers.length} passengers</p>
              )}
              {filteredUsers.length === 0 && (
                <p className="sa-table-footer">No passengers found matching your search.</p>
              )}
            </div>
          </div>

          {/* User Detail Panel */}
          {selectedUser && (
            <div className="sa-user-detail-panel">
              <div className="sa-panel-header">
                <h3>Passenger Details</h3>
                <button className="sa-btn-icon" onClick={closeUserDetail}>
                  <Icons.Close />
                </button>
              </div>
              
              <div className="sa-panel-content">
                {/* User Info Card */}
                <div className="sa-user-info-card">
                  <div className="sa-user-avatar">
                    {selectedUser.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="sa-user-info">
                    <h4>{selectedUser.username}</h4>
                    <p>{selectedUser.email}</p>
                    <span className="sa-badge blue">
                      Joined {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {loadingUserHistory ? (
                  <div className="sa-loading-spinner">Loading history...</div>
                ) : userHistory ? (
                  <>
                    {/* Activity Summary */}
                    <div className="sa-activity-summary">
                      <div className="sa-activity-stat">
                        <span className="sa-activity-count">{userHistory.complaints?.length || 0}</span>
                        <span className="sa-activity-label">Complaints</span>
                      </div>
                      <div className="sa-activity-stat">
                        <span className="sa-activity-count">{userHistory.orders?.length || 0}</span>
                        <span className="sa-activity-label">Orders</span>
                      </div>
                      <div className="sa-activity-stat">
                        <span className="sa-activity-count">{userHistory.emergencies?.length || 0}</span>
                        <span className="sa-activity-label">Emergencies</span>
                      </div>
                      <div className="sa-activity-stat">
                        <span className="sa-activity-count">{userHistory.lostNFound?.length || 0}</span>
                        <span className="sa-activity-label">Lost & Found</span>
                      </div>
                    </div>

                    {/* Complaints Section */}
                    {userHistory.complaints?.length > 0 && (
                      <div className="sa-history-section">
                        <h5><Icons.Complaints /> Complaints History</h5>
                        <div className="sa-history-list">
                          {userHistory.complaints.map((c, i) => (
                            <div key={c._id || i} className="sa-history-item">
                              <div className="sa-history-item-header">
                                <span className={`sa-badge ${c.status === 'Resolved' ? 'success' : c.status === 'Pending' ? 'warning' : 'blue'}`}>
                                  {c.status}
                                </span>
                                <span className="sa-history-date">
                                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <p className="sa-history-desc">{c.description}</p>
                              <div className="sa-history-meta">
                                <span>PNR: {c.pnr || '-'}</span>
                                <span>Domain: {c.issueDomain || '-'}</span>
                                <span>Train: {c.trainNumber || '-'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Orders Section */}
                    {userHistory.orders?.length > 0 && (
                      <div className="sa-history-section">
                        <h5><Icons.Orders /> Order History</h5>
                        <div className="sa-history-list">
                          {userHistory.orders.map((o, i) => (
                            <div key={o._id || i} className="sa-history-item">
                              <div className="sa-history-item-header">
                                <span className={`sa-badge ${o.status === 'Delivered' ? 'success' : o.status === 'Cancelled' ? 'danger' : 'blue'}`}>
                                  {o.status}
                                </span>
                                <span className="sa-history-date">
                                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <p className="sa-history-amount">₹{o.totalPrice || o.totalAmount || 0}</p>
                              <div className="sa-history-meta">
                                <span>Items: {o.items?.length || 0}</span>
                                <span>Train: {o.trainNumber || '-'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Emergency Section */}
                    {userHistory.emergencies?.length > 0 && (
                      <div className="sa-history-section">
                        <h5><Icons.Emergency /> Emergency Requests</h5>
                        <div className="sa-history-list">
                          {userHistory.emergencies.map((e, i) => (
                            <div key={e._id || i} className="sa-history-item sa-history-item-emergency">
                              <div className="sa-history-item-header">
                                <span className={`sa-badge ${e.status === 'Resolved' ? 'success' : 'danger'}`}>
                                  {e.status}
                                </span>
                                <span className="sa-history-date">
                                  {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <div className="sa-history-meta">
                                <span>Train: {e.trainNumber || '-'}</span>
                                <span>Seat: {e.seatNumber || '-'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lost & Found Section */}
                    {userHistory.lostNFound?.length > 0 && (
                      <div className="sa-history-section">
                        <h5><Icons.LostFound /> Lost & Found Reports</h5>
                        <div className="sa-history-list">
                          {userHistory.lostNFound.map((l, i) => (
                            <div key={l._id || i} className="sa-history-item">
                              <div className="sa-history-item-header">
                                <span className={`sa-badge ${l.category === 'Found' ? 'success' : 'warning'}`}>
                                  {l.category}
                                </span>
                                <span className={`sa-badge ${l.status === 'Resolved' ? 'success' : 'blue'}`}>
                                  {l.status}
                                </span>
                              </div>
                              <p className="sa-history-title">{l.title}</p>
                              <p className="sa-history-desc">{l.description}</p>
                              <div className="sa-history-meta">
                                <span>Location: {l.location || '-'}</span>
                                <span>Train: {l.trainNumber || '-'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Activity Message */}
                    {(!userHistory.complaints?.length && !userHistory.orders?.length && 
                      !userHistory.emergencies?.length && !userHistory.lostNFound?.length) && (
                      <div className="sa-no-activity">
                        <p>No activity history found for this passenger.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="sa-no-activity">
                    <p>Unable to load user history.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStaff = () => {
    const filteredStaff = allStaff.filter(s => 
      !searchTerm || 
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
      <div className="sa-content-area">
        <h2 className="sa-section-title">Staff Management</h2>
        
        <div className="sa-stats-grid small">
          <div className="sa-stat-card purple">
            <div className="sa-stat-content">
              <span className="sa-stat-value">{allStaff.length}</span>
              <span className="sa-stat-label">Total Staff</span>
            </div>
          </div>
          <div className="sa-stat-card blue">
            <div className="sa-stat-content">
              <span className="sa-stat-value">{analytics.staffByRole.length}</span>
              <span className="sa-stat-label">Roles</span>
            </div>
          </div>
          <div className="sa-stat-card green">
            <div className="sa-stat-content">
              <span className="sa-stat-value">{trainSet.length}</span>
              <span className="sa-stat-label">Trains Covered</span>
            </div>
          </div>
        </div>

        <div className="sa-charts-row">
          <div className="sa-card">
            <h3 className="sa-card-title">Staff by Role</h3>
            <DonutChart slices={analytics.staffByRole} size={180} />
          </div>
          <div className="sa-card">
            <h3 className="sa-card-title">Role Distribution</h3>
            <BarChart labels={analytics.staffByRole.map(r => r.label)} values={analytics.staffByRole.map(r => r.value)} color="#a855f7" height={200} />
          </div>
        </div>

        <div className="sa-users-layout">
          {/* Staff Table */}
          <div className={`sa-card ${selectedStaff ? 'sa-users-table-collapsed' : 'full-width'}`}>
            <div className="sa-card-header">
              <h3 className="sa-card-title">All Staff Members</h3>
              <input 
                type="text" 
                className="sa-search" 
                placeholder="Search by name, email, role..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            <div className="sa-table-wrap">
              <table className="sa-table sa-table-clickable">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Train</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.slice(0, 50).map((staff, idx) => (
                    <tr 
                      key={staff._id || idx} 
                      className={selectedStaff?._id === staff._id ? 'sa-row-selected' : ''}
                      onClick={() => handleStaffClick(staff)}
                    >
                      <td><strong>{staff.name}</strong></td>
                      <td>{staff.email}</td>
                      <td><span className="sa-badge orange">{staff.role}</span></td>
                      <td><span className="sa-badge green">{staff.trainNumber}</span></td>
                      <td>
                        <button 
                          className="sa-btn-small sa-btn-primary"
                          onClick={(e) => { e.stopPropagation(); handleStaffClick(staff); }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStaff.length > 50 && (
                <p className="sa-table-footer">Showing 50 of {filteredStaff.length} staff members</p>
              )}
              {filteredStaff.length === 0 && (
                <p className="sa-table-footer">No staff found matching your search.</p>
              )}
            </div>
          </div>

          {/* Staff Detail Panel */}
          {selectedStaff && (
            <div className="sa-user-detail-panel">
              <div className="sa-panel-header">
                <h3>Staff Details</h3>
                <button className="sa-btn-icon" onClick={closeStaffDetail}>
                  <Icons.Close />
                </button>
              </div>
              
              <div className="sa-panel-content">
                {/* Staff Info Card */}
                <div className="sa-user-info-card">
                  <div className="sa-user-avatar" style={{ background: 'linear-gradient(135deg, #a855f7, #c084fc)' }}>
                    {selectedStaff.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="sa-user-info">
                    <h4>{selectedStaff.name}</h4>
                    <p>{selectedStaff.email}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="sa-badge orange">{selectedStaff.role}</span>
                      <span className="sa-badge green">Train: {selectedStaff.trainNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Staff Contact Info */}
                <div className="sa-history-section">
                  <h5><Icons.Users /> Contact Information</h5>
                  <div className="sa-history-list">
                    <div className="sa-history-item">
                      <div className="sa-history-meta">
                        <span>Phone: {selectedStaff.phone || 'N/A'}</span>
                        <span>Email: {selectedStaff.email}</span>
                      </div>
                      <div className="sa-history-meta" style={{ marginTop: '0.5rem' }}>
                        <span>Joined: {selectedStaff.createdAt ? new Date(selectedStaff.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {loadingStaffDetails ? (
                  <div className="sa-loading-spinner">Loading details...</div>
                ) : staffDetails ? (
                  <>
                    {/* Work Summary */}
                    <div className="sa-activity-summary">
                      <div className="sa-activity-stat">
                        <span className="sa-activity-count">{staffDetails.complaintsAssigned || 0}</span>
                        <span className="sa-activity-label">Complaints</span>
                      </div>
                      <div className="sa-activity-stat">
                        <span className="sa-activity-count">{staffDetails.ordersHandled?.total || 0}</span>
                        <span className="sa-activity-label">Orders</span>
                      </div>
                      <div className="sa-activity-stat">
                        <span className="sa-activity-count">{staffDetails.ordersHandled?.delivered || 0}</span>
                        <span className="sa-activity-label">Delivered</span>
                      </div>
                      <div className="sa-activity-stat">
                        <span className="sa-activity-count">{staffDetails.emergenciesReceived || 0}</span>
                        <span className="sa-activity-label">Emergencies</span>
                      </div>
                    </div>

                    {/* Orders Section */}
                    <div className="sa-history-section">
                      <h5><Icons.Orders /> Orders Statistics</h5>
                      <div className="sa-history-list">
                        <div className="sa-history-item">
                          <div className="sa-history-item-header">
                            <span className="sa-badge blue">Train {selectedStaff.trainNumber}</span>
                          </div>
                          <div className="sa-history-meta" style={{ marginTop: '0.5rem' }}>
                            <span>Total: {staffDetails.ordersHandled?.total || 0}</span>
                            <span>Pending: {staffDetails.ordersHandled?.pending || 0}</span>
                            <span>Delivered: {staffDetails.ordersHandled?.delivered || 0}</span>
                          </div>
                          <div className="sa-progress-bar" style={{ marginTop: '0.75rem' }}>
                            <div 
                              className="sa-progress-fill" 
                              style={{ 
                                width: `${staffDetails.ordersHandled?.total ? (staffDetails.ordersHandled.delivered / staffDetails.ordersHandled.total * 100) : 0}%`,
                                background: '#22c55e'
                              }} 
                            />
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                              {staffDetails.ordersHandled?.total ? ((staffDetails.ordersHandled.delivered / staffDetails.ordersHandled.total) * 100).toFixed(1) : 0}% Delivered
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Complaints Section */}
                    <div className="sa-history-section">
                      <h5><Icons.Complaints /> Assigned Complaints</h5>
                      <div className="sa-history-list">
                        <div className="sa-history-item">
                          <div className="sa-history-item-header">
                            <span className="sa-badge orange">{selectedStaff.role}</span>
                            <span className="sa-badge blue">Train {selectedStaff.trainNumber}</span>
                          </div>
                          <p className="sa-history-amount" style={{ color: '#a855f7' }}>
                            {staffDetails.complaintsAssigned || 0} complaints
                          </p>
                          <p className="sa-history-desc">
                            Complaints in {selectedStaff.role} domain for Train {selectedStaff.trainNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Section */}
                    {staffDetails.emergenciesReceived > 0 && (
                      <div className="sa-history-section">
                        <h5><Icons.Emergency /> Emergency Alerts</h5>
                        <div className="sa-history-list">
                          <div className="sa-history-item sa-history-item-emergency">
                            <div className="sa-history-item-header">
                              <span className="sa-badge danger">Active</span>
                            </div>
                            <p className="sa-history-amount" style={{ color: '#ef4444' }}>
                              {staffDetails.emergenciesReceived} emergencies
                            </p>
                            <p className="sa-history-desc">
                              Emergency alerts on Train {selectedStaff.trainNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="sa-no-activity">
                    <p>Unable to load staff details.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAdmins = () => {
    const filteredAdmins = allAdmins.filter(a => 
      !searchTerm || 
      a.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
      <div className="sa-content-area">
        <h2 className="sa-section-title">Admin Management</h2>
        
        <div className="sa-stats-grid small">
          <div className="sa-stat-card green">
            <div className="sa-stat-content">
              <span className="sa-stat-value">{allAdmins.length}</span>
              <span className="sa-stat-label">Total Admins</span>
            </div>
          </div>
          <div className="sa-stat-card blue">
            <div className="sa-stat-content">
              <span className="sa-stat-value">{allAdmins.filter(a => a.role === "superadmin").length}</span>
              <span className="sa-stat-label">Super Admins</span>
            </div>
          </div>
          <div className="sa-stat-card purple">
            <div className="sa-stat-content">
              <span className="sa-stat-value">{allAdmins.filter(a => a.role === "admin").length}</span>
              <span className="sa-stat-label">Train Admins</span>
            </div>
          </div>
        </div>

        <div className="sa-users-layout">
          {/* Admins Table */}
          <div className={`sa-card ${selectedAdmin ? 'sa-users-table-collapsed' : 'full-width'}`}>
            <div className="sa-card-header">
              <h3 className="sa-card-title">All Administrators</h3>
              <input 
                type="text" 
                className="sa-search" 
                placeholder="Search by username or email..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            <div className="sa-table-wrap">
              <table className="sa-table sa-table-clickable">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Train</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin, idx) => (
                    <tr 
                      key={admin._id || idx} 
                      className={selectedAdmin?._id === admin._id ? 'sa-row-selected' : ''}
                      onClick={() => handleAdminClick(admin)}
                    >
                      <td><strong>{admin.username}</strong></td>
                      <td>{admin.email}</td>
                      <td><span className={`sa-badge ${admin.role === "superadmin" ? "blue" : "purple"}`}>{admin.role}</span></td>
                      <td>{admin.trainNo ? <span className="sa-badge green">{admin.trainNo}</span> : "-"}</td>
                      <td>
                        <button 
                          className="sa-btn-small sa-btn-primary"
                          onClick={(e) => { e.stopPropagation(); handleAdminClick(admin); }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAdmins.length === 0 && (
                <p className="sa-table-footer">No admins found matching your search.</p>
              )}
            </div>
          </div>

          {/* Admin Detail Panel */}
          {selectedAdmin && (
            <div className="sa-user-detail-panel">
              <div className="sa-panel-header">
                <h3>Admin Details</h3>
                <button className="sa-btn-icon" onClick={closeAdminDetail}>
                  <Icons.Close />
                </button>
              </div>
              
              <div className="sa-panel-content">
                {/* Admin Info Card */}
                <div className="sa-user-info-card">
                  <div className="sa-user-avatar" style={{ background: selectedAdmin.role === 'superadmin' ? 'linear-gradient(135deg, #3b82f6, #60a5fa)' : 'linear-gradient(135deg, #22c55e, #4ade80)' }}>
                    {selectedAdmin.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="sa-user-info">
                    <h4>{selectedAdmin.username}</h4>
                    <p>{selectedAdmin.email}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={`sa-badge ${selectedAdmin.role === 'superadmin' ? 'blue' : 'purple'}`}>{selectedAdmin.role}</span>
                      {selectedAdmin.trainNo && <span className="sa-badge green">Train: {selectedAdmin.trainNo}</span>}
                    </div>
                  </div>
                </div>

                {/* Admin Info */}
                <div className="sa-history-section">
                  <h5><Icons.Admin /> Account Information</h5>
                  <div className="sa-history-list">
                    <div className="sa-history-item">
                      <div className="sa-history-meta">
                        <span>Role: {selectedAdmin.role === 'superadmin' ? 'Super Admin' : 'Train Admin'}</span>
                        {selectedAdmin.trainNo && <span>Assigned Train: {selectedAdmin.trainNo}</span>}
                      </div>
                      <div className="sa-history-meta" style={{ marginTop: '0.5rem' }}>
                        <span>Created: {selectedAdmin.createdAt ? new Date(selectedAdmin.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {loadingAdminDetails ? (
                  <div className="sa-loading-spinner">Loading details...</div>
                ) : adminDetails ? (
                  <>
                    {/* Management Summary */}
                    <div className="sa-activity-summary">
                      <div className="sa-activity-stat">
                        <span className="sa-activity-count">{adminDetails.complaintsManaged || 0}</span>
                        <span className="sa-activity-label">Complaints</span>
                      </div>
                      <div className="sa-activity-stat">
                        <span className="sa-activity-count">{adminDetails.ordersManaged || 0}</span>
                        <span className="sa-activity-label">Orders</span>
                      </div>
                      <div className="sa-activity-stat">
                        <span className="sa-activity-count">{adminDetails.staffSupervised || 0}</span>
                        <span className="sa-activity-label">Staff</span>
                      </div>
                      <div className="sa-activity-stat">
                        <span className="sa-activity-count">{adminDetails.emergenciesHandled || 0}</span>
                        <span className="sa-activity-label">Emergencies</span>
                      </div>
                    </div>

                    {/* Complaint Stats Section */}
                    <div className="sa-history-section">
                      <h5><Icons.Complaints /> Complaint Statistics</h5>
                      <div className="sa-history-list">
                        <div className="sa-history-item">
                          <div className="sa-history-item-header">
                            <span className="sa-badge blue">
                              {selectedAdmin.trainNo ? `Train ${selectedAdmin.trainNo}` : 'All Trains'}
                            </span>
                          </div>
                          <div className="sa-history-meta" style={{ marginTop: '0.5rem' }}>
                            <span>Total: {adminDetails.complaintStats?.total || 0}</span>
                            <span>Pending: {adminDetails.complaintStats?.pending || 0}</span>
                            <span>In Process: {adminDetails.complaintStats?.inProcess || 0}</span>
                            <span>Resolved: {adminDetails.complaintStats?.resolved || 0}</span>
                          </div>
                          {adminDetails.complaintStats?.total > 0 && (
                            <div className="sa-progress-bar" style={{ marginTop: '0.75rem' }}>
                              <div 
                                className="sa-progress-fill" 
                                style={{ 
                                  width: `${(adminDetails.complaintStats.resolved / adminDetails.complaintStats.total * 100)}%`,
                                  background: '#22c55e'
                                }} 
                              />
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>
                                {((adminDetails.complaintStats.resolved / adminDetails.complaintStats.total) * 100).toFixed(1)}% Resolved
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recent Complaints Section */}
                    {adminDetails.recentComplaints?.length > 0 && (
                      <div className="sa-history-section">
                        <h5><Icons.Complaints /> Recent Complaints</h5>
                        <div className="sa-history-list">
                          {adminDetails.recentComplaints.map((c, i) => (
                            <div key={c._id || i} className="sa-history-item">
                              <div className="sa-history-item-header">
                                <span className={`sa-badge ${c.status === 'Resolved' ? 'success' : c.status === 'Pending' ? 'warning' : 'blue'}`}>
                                  {c.status}
                                </span>
                                <span className="sa-history-date">
                                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                                </span>
                              </div>
                              <p className="sa-history-desc">{c.description?.slice(0, 80)}...</p>
                              <div className="sa-history-meta">
                                <span>Domain: {c.issueDomain || '-'}</span>
                                <span>Train: {c.trainNumber || '-'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Responsibilities Section */}
                    <div className="sa-history-section">
                      <h5><Icons.Dashboard /> Responsibilities</h5>
                      <div className="sa-history-list">
                        <div className="sa-history-item">
                          <p className="sa-history-desc">
                            {selectedAdmin.role === 'superadmin' 
                              ? 'Full system access - manages all trains, staff, and operations across the railway network.' 
                              : `Manages operations for Train ${selectedAdmin.trainNo || 'N/A'} including complaints, orders, and staff coordination.`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="sa-no-activity">
                    <p>Unable to load admin details.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderComplaints = () => (
    <div className="sa-content-area">
      <h2 className="sa-section-title">Complaints Management</h2>
      
      <div className="sa-stats-grid small">
        <div className="sa-stat-card blue">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{filteredComplaints.length}</span>
            <span className="sa-stat-label">Total Complaints</span>
          </div>
        </div>
        <div className="sa-stat-card warning">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{filteredComplaints.filter(c => c.status === "pending").length}</span>
            <span className="sa-stat-label">Pending</span>
          </div>
        </div>
        <div className="sa-stat-card success">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{analytics.resolvedComplaints}</span>
            <span className="sa-stat-label">Resolved</span>
          </div>
        </div>
        <div className="sa-stat-card purple">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{pct(analytics.resolvedComplaints, filteredComplaints.length)}%</span>
            <span className="sa-stat-label">Resolution Rate</span>
          </div>
        </div>
      </div>

      <div className="sa-charts-row">
        <div className="sa-card">
          <h3 className="sa-card-title">By Domain</h3>
          <DonutChart slices={analytics.complaintsByDomain} size={180} />
        </div>
        <div className="sa-card">
          <h3 className="sa-card-title">By Status</h3>
          <DonutChart slices={analytics.complaintsByStatus} size={180} />
        </div>
      </div>

      {/* Complaint Analysis by Train */}
      <div className="sa-card full-width">
        <h3 className="sa-card-title">Complaint Analysis by Train</h3>
        {complaintAnalysis.map((train, idx) => (
          <div key={idx} className="sa-train-analysis">
            <h4>{train.trainNumber}</h4>
            <div className="sa-domain-grid">
              {train.domains?.map((domain, dIdx) => (
                <div key={dIdx} className="sa-domain-card">
                  <span className="sa-domain-name">{domain.domain}</span>
                  <div className="sa-domain-stats">
                    <span>Total: {domain.total}</span>
                    <span className="success">Resolved: {domain.resolved}</span>
                    <span className="warning">Pending: {domain.pending}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEmergency = () => {
    // Calculate stats
    const activeEmergencies = filteredEmergencies.filter(e => e.status === "Active" || e.status === "active" || e.status === "pending");
    const inProcessEmergencies = filteredEmergencies.filter(e => e.status === "InProcess" || e.status === "inprocess");
    const resolvedEmergencies = filteredEmergencies.filter(e => e.status === "Resolved" || e.status === "resolved" || e.status === "responded");
    
    // Get time elapsed helper
    const getTimeElapsed = (createdAt) => {
      if (!createdAt) return "-";
      const diff = Date.now() - new Date(createdAt).getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      if (days > 0) return `${days}d ${hours % 24}h ago`;
      if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
      return `${minutes}m ago`;
    };

    // Get urgency level based on time and status
    const getUrgencyLevel = (emg) => {
      if (emg.status === "Resolved" || emg.status === "resolved") return "resolved";
      if (emg.status === "InProcess" || emg.status === "inprocess") return "processing";
      const diff = Date.now() - new Date(emg.createdAt).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes > 30) return "critical";
      if (minutes > 15) return "high";
      return "active";
    };

    return (
      <div className="sa-content-area">
        <h2 className="sa-section-title">Emergency Management</h2>
        
        {/* Stats Grid */}
        <div className="sa-stats-grid small">
          <div className="sa-stat-card danger">
            <div className="sa-stat-content">
              <span className="sa-stat-value">{filteredEmergencies.length}</span>
              <span className="sa-stat-label">Total Emergencies</span>
            </div>
          </div>
          <div className="sa-stat-card warning">
            <div className="sa-stat-content">
              <span className="sa-stat-value">{activeEmergencies.length}</span>
              <span className="sa-stat-label">Active</span>
            </div>
          </div>
          <div className="sa-stat-card purple">
            <div className="sa-stat-content">
              <span className="sa-stat-value">{inProcessEmergencies.length}</span>
              <span className="sa-stat-label">In Process</span>
            </div>
          </div>
          <div className="sa-stat-card success">
            <div className="sa-stat-content">
              <span className="sa-stat-value">{resolvedEmergencies.length}</span>
              <span className="sa-stat-label">Resolved</span>
            </div>
          </div>
        </div>

        <div className="sa-users-layout">
          {/* Emergency Table */}
          <div className={`sa-card ${selectedEmergency ? 'sa-users-table-collapsed' : 'full-width'}`}>
            <div className="sa-card-header">
              <h3 className="sa-card-title">Emergency Alerts</h3>
              <div className="sa-emergency-legend">
                <span className="sa-legend-item-inline"><span className="sa-urgency-dot critical"></span>Critical (&gt;30m)</span>
                <span className="sa-legend-item-inline"><span className="sa-urgency-dot high"></span>High (15-30m)</span>
                <span className="sa-legend-item-inline"><span className="sa-urgency-dot active"></span>Active (&lt;15m)</span>
              </div>
            </div>
            <div className="sa-table-wrap">
              <table className="sa-table sa-table-clickable">
                <thead>
                  <tr>
                    <th>Urgency</th>
                    <th>Train</th>
                    <th>Passenger</th>
                    <th>Seat</th>
                    <th>Status</th>
                    <th>Time Elapsed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmergencies.slice(0, 30).map((emg, idx) => {
                    const urgency = getUrgencyLevel(emg);
                    return (
                      <tr 
                        key={emg._id || idx} 
                        className={`${selectedEmergency?._id === emg._id ? 'sa-row-selected' : ''} sa-emergency-row-${urgency}`}
                        onClick={() => handleEmergencyClick(emg)}
                      >
                        <td>
                          <span className={`sa-urgency-indicator ${urgency}`}>
                            {urgency === "critical" && <Icons.Emergency />}
                            {urgency === "high" && <Icons.Emergency />}
                            {urgency === "active" && <Icons.Emergency />}
                            {urgency === "processing" && <Icons.RefreshCw />}
                            {urgency === "resolved" && "✓"}
                          </span>
                        </td>
                        <td><span className="sa-badge blue">{emg.trainNumber}</span></td>
                        <td><strong>{emg.username || "Unknown"}</strong></td>
                        <td>{emg.seatNumber || "-"}</td>
                        <td>
                          <span className={`sa-badge ${
                            emg.status === "Resolved" || emg.status === "resolved" ? "success" : 
                            emg.status === "InProcess" || emg.status === "inprocess" ? "purple" : 
                            "danger"
                          }`}>
                            {emg.status}
                          </span>
                        </td>
                        <td className={`sa-time-cell ${urgency}`}>{getTimeElapsed(emg.createdAt)}</td>
                        <td>
                          <button 
                            className="sa-btn-small sa-btn-primary"
                            onClick={(e) => { e.stopPropagation(); handleEmergencyClick(emg); }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredEmergencies.length > 30 && (
                <p className="sa-table-footer">Showing 30 of {filteredEmergencies.length} emergencies</p>
              )}
              {filteredEmergencies.length === 0 && (
                <p className="sa-table-footer">No emergency alerts.</p>
              )}
            </div>
          </div>

          {/* Emergency Detail Panel */}
          {selectedEmergency && (
            <div className="sa-user-detail-panel sa-emergency-panel">
              <div className="sa-panel-header">
                <h3>Emergency Details</h3>
                <button className="sa-btn-icon" onClick={closeEmergencyDetail}>
                  <Icons.Close />
                </button>
              </div>
              
              <div className="sa-panel-content">
                {/* Emergency Status Card */}
                <div className={`sa-emergency-status-card ${getUrgencyLevel(selectedEmergency)}`}>
                  <div className="sa-emergency-icon">
                    <Icons.Emergency />
                  </div>
                  <div className="sa-emergency-info">
                    <h4>Emergency Alert</h4>
                    <span className={`sa-badge large ${
                      selectedEmergency.status === "Resolved" || selectedEmergency.status === "resolved" ? "success" : 
                      selectedEmergency.status === "InProcess" || selectedEmergency.status === "inprocess" ? "purple" : 
                      "danger"
                    }`}>
                      {selectedEmergency.status}
                    </span>
                    <p className="sa-emergency-time">
                      Reported {getTimeElapsed(selectedEmergency.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Location Details */}
                <div className="sa-detail-section">
                  <h4 className="sa-detail-section-title">
                    <Icons.Train /> Location Details
                  </h4>
                  <div className="sa-detail-grid">
                    <div className="sa-detail-item">
                      <span className="sa-detail-label">Train Number</span>
                      <span className="sa-detail-value">{selectedEmergency.trainNumber}</span>
                    </div>
                    <div className="sa-detail-item">
                      <span className="sa-detail-label">Seat Number</span>
                      <span className="sa-detail-value">{selectedEmergency.seatNumber || "Not specified"}</span>
                    </div>
                  </div>
                </div>

                {/* Passenger Details */}
                <div className="sa-detail-section">
                  <h4 className="sa-detail-section-title">
                    <Icons.Users /> Passenger Information
                  </h4>
                  <div className="sa-detail-grid">
                    <div className="sa-detail-item">
                      <span className="sa-detail-label">Username</span>
                      <span className="sa-detail-value">{selectedEmergency.username || "Unknown"}</span>
                    </div>
                    <div className="sa-detail-item">
                      <span className="sa-detail-label">User ID</span>
                      <span className="sa-detail-value sa-code">{selectedEmergency.userId || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="sa-detail-section">
                  <h4 className="sa-detail-section-title">Timeline</h4>
                  <div className="sa-emergency-timeline">
                    <div className="sa-timeline-item active">
                      <span className="sa-timeline-dot"></span>
                      <div className="sa-timeline-content">
                        <span className="sa-timeline-title">Emergency Reported</span>
                        <span className="sa-timeline-time">
                          {selectedEmergency.createdAt ? new Date(selectedEmergency.createdAt).toLocaleString() : "-"}
                        </span>
                      </div>
                    </div>
                    {(selectedEmergency.status === "InProcess" || selectedEmergency.status === "inprocess" || 
                      selectedEmergency.status === "Resolved" || selectedEmergency.status === "resolved") && (
                      <div className="sa-timeline-item">
                        <span className="sa-timeline-dot processing"></span>
                        <div className="sa-timeline-content">
                          <span className="sa-timeline-title">Being Processed</span>
                          <span className="sa-timeline-time">Response initiated</span>
                        </div>
                      </div>
                    )}
                    {(selectedEmergency.status === "Resolved" || selectedEmergency.status === "resolved") && (
                      <div className="sa-timeline-item">
                        <span className="sa-timeline-dot resolved"></span>
                        <div className="sa-timeline-content">
                          <span className="sa-timeline-title">Resolved</span>
                          <span className="sa-timeline-time">Emergency handled</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="sa-emergency-actions">
                  {selectedEmergency.status === "Active" || selectedEmergency.status === "active" ? (
                    <button className="sa-btn sa-btn-warning">
                      Mark In Process
                    </button>
                  ) : null}
                  {(selectedEmergency.status === "InProcess" || selectedEmergency.status === "inprocess" || 
                    selectedEmergency.status === "Active" || selectedEmergency.status === "active") && (
                    <button className="sa-btn sa-btn-success">
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLostFound = () => (
    <div className="sa-content-area">
      <h2 className="sa-section-title">Lost & Found Management</h2>
      
      <div className="sa-stats-grid small">
        <div className="sa-stat-card blue">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{filteredLostFound.length}</span>
            <span className="sa-stat-label">Total Reports</span>
          </div>
        </div>
        <div className="sa-stat-card warning">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{filteredLostFound.filter(l => l.type === "lost" || l.category === "lost").length}</span>
            <span className="sa-stat-label">Lost Items</span>
          </div>
        </div>
        <div className="sa-stat-card success">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{filteredLostFound.filter(l => l.type === "found" || l.category === "found").length}</span>
            <span className="sa-stat-label">Found Items</span>
          </div>
        </div>
        <div className="sa-stat-card purple">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{filteredLostFound.filter(l => l.claimed).length}</span>
            <span className="sa-stat-label">Claimed</span>
          </div>
        </div>
      </div>

      <div className="sa-card full-width">
        <h3 className="sa-card-title">Recent Lost & Found Reports</h3>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Train</th>
                <th>Type</th>
                <th>Item</th>
                <th>Location</th>
                <th>Status</th>
                <th>Reported</th>
              </tr>
            </thead>
            <tbody>
              {filteredLostFound.slice(0, 20).map((item, idx) => (
                <tr key={idx}>
                  <td><span className="sa-badge blue">{item.trainNumber}</span></td>
                  <td><span className={`sa-badge ${item.type === "found" || item.category === "found" ? "success" : "warning"}`}>{item.type || item.category}</span></td>
                  <td>{item.itemName || item.description?.slice(0, 30) || "-"}</td>
                  <td>{item.location || "-"}</td>
                  <td><span className={`sa-badge ${item.claimed ? "success" : "purple"}`}>{item.claimed ? "Claimed" : item.status || "Open"}</span></td>
                  <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="sa-content-area">
      <h2 className="sa-section-title">Orders & Catering</h2>
      
      <div className="sa-stats-grid small">
        <div className="sa-stat-card blue">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{filteredOrders.length}</span>
            <span className="sa-stat-label">Total Orders</span>
          </div>
        </div>
        <div className="sa-stat-card success">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{analytics.deliveredOrders}</span>
            <span className="sa-stat-label">Delivered</span>
          </div>
        </div>
        <div className="sa-stat-card warning">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{filteredOrders.filter(o => o.status === "pending").length}</span>
            <span className="sa-stat-label">Pending</span>
          </div>
        </div>
        <div className="sa-stat-card green">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{fmtCur(analytics.totalRevenue)}</span>
            <span className="sa-stat-label">Total Revenue</span>
          </div>
        </div>
      </div>

      <div className="sa-charts-row">
        <div className="sa-card">
          <h3 className="sa-card-title">Order Status</h3>
          <DonutChart slices={analytics.ordersByStatus} size={180} />
        </div>
        <div className="sa-card large">
          <h3 className="sa-card-title">Orders Trend</h3>
          <LineChart labels={analytics.ordersByDay.labels.slice(-14)} datasets={[{ values: analytics.ordersByDay.values.slice(-14), color: "#38bdf8" }]} height={200} area />
        </div>
      </div>

      <div className="sa-card full-width">
        <h3 className="sa-card-title">Recent Orders</h3>
        <div className="sa-table-wrap">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Train</th>
                <th>Coach</th>
                <th>Seat</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 20).map((order, idx) => (
                <tr key={idx}>
                  <td><code>{order._id?.slice(-6) || idx + 1}</code></td>
                  <td><span className="sa-badge blue">{order.trainNumber}</span></td>
                  <td>{order.coachNumber || order.bogieNumber || "-"}</td>
                  <td>{order.seatNumber || "-"}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td><strong>{fmtCur(order.totalPrice || 0)}</strong></td>
                  <td><span className={`sa-badge ${order.status === "delivered" ? "success" : order.status === "cancelled" ? "danger" : "warning"}`}>{order.status}</span></td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="sa-content-area">
      <h2 className="sa-section-title">Customer Feedback</h2>
      
      <div className="sa-stats-grid small">
        <div className="sa-stat-card blue">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{feedbacks.length}</span>
            <span className="sa-stat-label">Total Feedback</span>
          </div>
        </div>
        <div className="sa-stat-card success">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{feedbacks.filter(f => f.rating >= 4).length}</span>
            <span className="sa-stat-label">Positive (4-5★)</span>
          </div>
        </div>
        <div className="sa-stat-card warning">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{feedbacks.filter(f => f.rating === 3).length}</span>
            <span className="sa-stat-label">Neutral (3★)</span>
          </div>
        </div>
        <div className="sa-stat-card danger">
          <div className="sa-stat-content">
            <span className="sa-stat-value">{feedbacks.filter(f => f.rating <= 2).length}</span>
            <span className="sa-stat-label">Negative (1-2★)</span>
          </div>
        </div>
      </div>

      <div className="sa-charts-row">
        <div className="sa-card">
          <h3 className="sa-card-title">Average Rating</h3>
          <MiniGauge value={analytics.avgRating} max={5} label="Out of 5" color="#f59e0b" />
        </div>
        <div className="sa-card">
          <h3 className="sa-card-title">Rating Distribution</h3>
          <BarChart labels={analytics.ratingDist.map(r => r.label)} values={analytics.ratingDist.map(r => r.value)} color="#f59e0b" height={180} />
        </div>
      </div>

      <div className="sa-card full-width">
        <h3 className="sa-card-title">Recent Feedback</h3>
        <div className="sa-feedback-list">
          {feedbacks.slice(0, 10).map((fb, idx) => (
            <div key={idx} className="sa-feedback-item">
              <div className="sa-feedback-header">
                <span className="sa-feedback-rating">{"★".repeat(fb.rating || 0)}{"☆".repeat(5 - (fb.rating || 0))}</span>
                <span className="sa-feedback-date">{fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : "-"}</span>
              </div>
              <p className="sa-feedback-text">{fb.message || fb.comment || fb.feedback || "No comment provided"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="sa-loading">
          <div className="sa-spinner" />
          <p>Loading dashboard data...</p>
        </div>
      );
    }

    switch (activeSection) {
      case "overview": return renderOverview();
      case "analytics": return renderAnalytics();
      case "trains": return renderTrains();
      case "users": return renderUsers();
      case "staff": return renderStaff();
      case "admins": return renderAdmins();
      case "complaints": return renderComplaints();
      case "emergency": return renderEmergency();
      case "lostnfound": return renderLostFound();
      case "orders": return renderOrders();
      case "feedback": return renderFeedback();
      default: return renderOverview();
    }
  };

  return (
    <div className={`sa-dashboard ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      {/* Sidebar */}
      <aside className={`sa-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sa-sidebar-header">
          <div className="sa-logo">
            <Icons.Train />
            <span>RailAdmin</span>
          </div>
          <button className="sa-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <Icons.Close /> : <Icons.Menu />}
          </button>
        </div>
        
        <nav className="sa-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sa-nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => { setActiveSection(item.id); setSearchTerm(""); }}
            >
              <item.icon />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sa-sidebar-footer">
          <button className="sa-nav-item" onClick={toggleTheme}>
            {theme === "light" ? <Icons.Moon /> : <Icons.Sun />}
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </button>
          <button className="sa-nav-item logout" onClick={logout}>
            <Icons.Logout />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="sa-main">
        {/* Top Bar */}
        <header className="sa-topbar">
          <button className="sa-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Icons.Menu />
          </button>
          <h1 className="sa-page-title">{NAV_ITEMS.find(n => n.id === activeSection)?.label || "Dashboard"}</h1>
          <div className="sa-topbar-actions">
            <button className="sa-btn-icon" onClick={loadAllData} title="Refresh Data">
              <Icons.RefreshCw />
            </button>
            <Link to="/" className="sa-btn-ghost">Home</Link>
          </div>
        </header>

        {/* Content Area */}
        {renderContent()}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
