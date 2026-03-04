import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { clearAdminToken } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";
import "./AdminDashboard.css";

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
  Analytics: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
    </svg>
  ),
  Staff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Complaints: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Orders: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  Food: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
  News: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
      <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
    </svg>
  ),
  Commands: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17l6-6-6-6"/><path d="M12 19h8"/>
    </svg>
  ),
  Emergency: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  LostFound: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  Feedback: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
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
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Delete: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
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
};

/* ═══════════════════════════════════════════════════════════
   PURE-SVG CHART COMPONENTS
   ═══════════════════════════════════════════════════════════ */
const LineChart = ({ labels = [], datasets = [], height = 220, area = false }) => {
  if (!labels.length) return <div className="ad-empty">No data available</div>;
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
    <svg viewBox={`0 0 ${W} ${H}`} className="ad-chart-svg">
      {[...Array(gridLines + 1)].map((_, i) => {
        const yy = pad.t + (plotH / gridLines) * i;
        const val = maxV - (range / gridLines) * i;
        return (
          <g key={i}>
            <line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="rgba(148,163,184,0.15)" />
            <text x={pad.l - 8} y={yy + 4} textAnchor="end" className="ad-chart-label">
              {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}
            </text>
          </g>
        );
      })}
      {labels.map((l, i) => {
        if (labels.length > 14 && i % Math.ceil(labels.length / 10) !== 0) return null;
        return (
          <text key={i} x={x(i)} y={H - 5} textAnchor="middle" className="ad-chart-label">{l}</text>
        );
      })}
      {datasets.map((ds, di) => {
        const pts = ds.values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
        return (
          <g key={di}>
            {area && (
              <polygon
                points={`${x(0)},${y(minV)} ${pts} ${x(ds.values.length - 1)},${y(minV)}`}
                fill={ds.color || "var(--ad-primary)"} opacity="0.12"
              />
            )}
            <polyline fill="none" stroke={ds.color || "var(--ad-primary)"} strokeWidth="2.5" points={pts} />
            {ds.values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={ds.color || "var(--ad-primary)"}>
                <title>{`${labels[i]}: ${v}`}</title>
              </circle>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

const BarChart = ({ labels = [], values = [], color = "var(--ad-primary)", height = 220 }) => {
  if (!labels.length || !values.length) return <div className="ad-empty">No data available</div>;
  const W = 600, H = height, pad = { t: 20, r: 20, b: 50, l: 55 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const maxV = Math.max(...values, 1);
  const barW = Math.min(plotW / labels.length * 0.6, 40);
  const gap = plotW / labels.length;
  const gridLines = 5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ad-chart-svg">
      {[...Array(gridLines + 1)].map((_, i) => {
        const yy = pad.t + (plotH / gridLines) * i;
        const val = maxV - (maxV / gridLines) * i;
        return (
          <g key={i}>
            <line x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} stroke="rgba(148,163,184,0.15)" />
            <text x={pad.l - 8} y={yy + 4} textAnchor="end" className="ad-chart-label">
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
            <text x={bx + barW / 2} y={H - 8} textAnchor="middle" className="ad-chart-label"
              transform={labels.length > 10 ? `rotate(-35, ${bx + barW / 2}, ${H - 8})` : ""}>
              {labels[i]?.length > 8 ? labels[i].slice(0, 8) + "…" : labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const DonutChart = ({ slices = [], size = 200 }) => {
  if (!slices.length) return <div className="ad-empty">No data available</div>;
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
    const ir = r * 0.55;
    const ix1 = cx + ir * Math.cos(endRad), iy1 = cy + ir * Math.sin(endRad);
    const ix2 = cx + ir * Math.cos(startRad), iy2 = cy + ir * Math.sin(startRad);
    const path = `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${ix1},${iy1} A${ir},${ir} 0 ${large} 0 ${ix2},${iy2} Z`;
    cumAngle += angle;
    return (
      <path key={i} d={path} fill={s.color || colors[i % colors.length]} opacity="0.88">
        <title>{`${s.label}: ${s.value} (${((s.value / total) * 100).toFixed(1)}%)`}</title>
      </path>
    );
  });

  return (
    <div className="ad-donut-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>{arcs}</svg>
      <div className="ad-donut-legend">
        {slices.map((s, i) => (
          <div key={i} className="ad-legend-item">
            <span className="ad-legend-dot" style={{ background: s.color || colors[i % colors.length] }} />
            <span>{s.label}: {s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MiniGauge = ({ value = 0, max = 100, label = "", color = "#38bdf8" }) => {
  const pct = Math.min(value / max, 1);
  const r = 40, stroke = 8;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct * 0.75);

  return (
    <div className="ad-mini-gauge">
      <svg viewBox="0 0 100 100" width="100" height="100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={stroke}
          strokeDasharray={circ * 0.75} strokeDashoffset="0" transform="rotate(135 50 50)" strokeLinecap="round" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ * 0.75} strokeDashoffset={offset} transform="rotate(135 50 50)" strokeLinecap="round" />
        <text x="50" y="58" textAnchor="middle" className="ad-gauge-value">{value}</text>
      </svg>
      <span className="ad-gauge-label">{label}</span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   NAVIGATION ITEMS
   ═══════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Icons.Dashboard },
  { id: "analytics", label: "Analytics", icon: Icons.Analytics },
  { id: "staff", label: "Staff", icon: Icons.Staff },
  { id: "commands", label: "Commands", icon: Icons.Commands },
  { id: "complaints", label: "Complaints", icon: Icons.Complaints },
  { id: "orders", label: "Orders", icon: Icons.Orders },
  { id: "food", label: "Food Menu", icon: Icons.Food },
  { id: "news", label: "News", icon: Icons.News },
  { id: "emergency", label: "Emergency", icon: Icons.Emergency },
  { id: "lostnfound", label: "Lost & Found", icon: Icons.LostFound },
  { id: "feedback", label: "Feedback", icon: Icons.Feedback },
];

/* ═══════════════════════════════════════════════════════════
   MAIN ADMIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const adminTrainNo = useSelector((state) => state.auth.adminTrainNo);

  // UI State
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Data states
  const [staffList, setStaffList] = useState([]);
  const [commands, setCommands] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [orders, setOrders] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [lostNFound, setLostNFound] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [trains, setTrains] = useState([]);

  // Search/Filter states
  const [staffSearch, setStaffSearch] = useState("");
  const [complaintSearch, setComplaintSearch] = useState("");
  const [complaintStatus, setComplaintStatus] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  
  // Modal states
  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", role: "", phone: "", trainNumber: "" });
  const [commandTarget, setCommandTarget] = useState(null);
  const [commandForm, setCommandForm] = useState({ title: "", message: "", priority: "medium" });
  const [showAddFood, setShowAddFood] = useState(false);
  const [foodForm, setFoodForm] = useState({ name: "", price: "", category: "", isAvailable: true, image: null });
  const [showAddNews, setShowAddNews] = useState(false);
  const [newsForm, setNewsForm] = useState({ title: "", description: "", image: null });

  // Analytics time range state
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState("7d");

  /* ── FETCH FUNCTIONS ── */
  const fetchStats = useCallback(async () => {
    try {
      const url = adminTrainNo
        ? `${apiBase}/admin/train-statistics?trainNo=${adminTrainNo}`
        : `${apiBase}/admin/train-statistics`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  }, [apiBase, adminTrainNo]);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/admin/train-staff`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setStaffList(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

  const fetchCommands = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/admin/commands`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setCommands(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

  const fetchComplaints = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (complaintStatus) params.append("status", complaintStatus);
      const res = await fetch(`${apiBase}/admin/train-complaints?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setComplaints(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase, complaintStatus]);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (orderStatus) params.append("status", orderStatus);
      const res = await fetch(`${apiBase}/admin/train-orders?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setOrders(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase, orderStatus]);

  const fetchFood = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/food`);
      const data = await res.json();
      if (data.success) setFoodItems(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/news`);
      const data = await res.json();
      if (data.success) setNewsItems(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

  const fetchEmergencies = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/emergency/admin/getEmg`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setEmergencies(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

  const fetchLostNFound = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/admin/all-lostnfound`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setLostNFound(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/feedback`);
      const data = await res.json();
      setFeedbacks(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

  const fetchTrains = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/trains`);
      const data = await res.json();
      if (data.success) setTrains(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchStaff(),
        fetchCommands(),
        fetchComplaints(),
        fetchOrders(),
        fetchFood(),
        fetchNews(),
        fetchEmergencies(),
        fetchLostNFound(),
        fetchFeedbacks(),
        fetchTrains(),
      ]);
      setLoading(false);
    };
    loadAllData();
  }, [fetchStats, fetchStaff, fetchCommands, fetchComplaints, fetchOrders, fetchFood, fetchNews, fetchEmergencies, fetchLostNFound, fetchFeedbacks, fetchTrains]);

  /* ── ACTION HANDLERS ── */
  const logout = async () => {
    try {
      await axios.post(`${apiBase}/admin/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
    dispatch(clearAdminToken());
    navigate("/adminlogin");
  };

  // Staff actions
  const openEditStaff = (s) => {
    setEditingStaff(s);
    setEditForm({ name: s.name, role: s.role, phone: s.phone, trainNumber: s.trainNumber });
  };

  const saveStaffEdit = async () => {
    try {
      const res = await fetch(`${apiBase}/admin/staff/${editingStaff._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setEditingStaff(null);
        fetchStaff();
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      alert("Error updating staff");
    }
  };

  const deleteStaff = async (id) => {
    if (!window.confirm("Delete this staff member?")) return;
    try {
      const res = await fetch(`${apiBase}/admin/staff/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) fetchStaff();
      else alert(data.message || "Delete failed");
    } catch (err) {
      alert("Error deleting staff");
    }
  };

  // Command actions
  const openCommandModal = (s) => {
    setCommandTarget(s);
    setCommandForm({ title: "", message: "", priority: "medium" });
  };

  const sendCommand = async () => {
    if (!commandTarget._id) {
      alert("Please select a staff member");
      return;
    }
    if (!commandForm.title || !commandForm.message) {
      alert("Title and message are required");
      return;
    }
    try {
      const res = await fetch(`${apiBase}/admin/commands`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: commandTarget._id, ...commandForm }),
      });
      const data = await res.json();
      if (data.success) {
        setCommandTarget(null);
        fetchCommands();
      } else {
        alert(data.message || "Failed to send command");
      }
    } catch (err) {
      alert("Error sending command");
    }
  };

  const deleteCommand = async (id) => {
    if (!window.confirm("Delete this command?")) return;
    try {
      await fetch(`${apiBase}/admin/commands/${id}`, { method: "DELETE", credentials: "include" });
      fetchCommands();
    } catch (err) {
      console.error(err);
    }
  };

  // Complaint actions
  const resolveComplaint = async (id) => {
    if (!window.confirm("Mark this complaint as resolved?")) return;
    try {
      const res = await fetch(`${apiBase}/complaint/api/complaints/resolve/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) fetchComplaints();
      else alert("Failed to resolve");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Order actions
  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`${apiBase}/catering/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) fetchOrders();
      else alert(data.message || "Update failed");
    } catch (err) {
      alert("Error updating status");
    }
  };

  // Food actions
  const addFood = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", foodForm.name);
    formData.append("price", foodForm.price);
    formData.append("category", foodForm.category);
    formData.append("isAvailable", foodForm.isAvailable);
    if (foodForm.image) formData.append("image", foodForm.image);
    
    try {
      const res = await fetch(`${apiBase}/food`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setShowAddFood(false);
        setFoodForm({ name: "", price: "", category: "", isAvailable: true, image: null });
        fetchFood();
      } else {
        alert(data.message || "Failed to add food");
      }
    } catch (err) {
      alert("Error adding food");
    }
  };

  const deleteFood = async (id) => {
    if (!window.confirm("Delete this food item?")) return;
    try {
      const res = await fetch(`${apiBase}/food/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) fetchFood();
      else alert(data.message || "Delete failed");
    } catch (err) {
      alert("Error deleting food");
    }
  };

  const toggleFoodAvailability = async (id, currentStatus) => {
    try {
      const res = await fetch(`${apiBase}/food/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) fetchFood();
      else alert(data.message || "Update failed");
    } catch (err) {
      alert("Error updating food availability");
    }
  };

  // News actions
  const addNews = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newsForm.title);
    formData.append("description", newsForm.description);
    if (newsForm.image) formData.append("image", newsForm.image);
    
    try {
      const res = await fetch(`${apiBase}/news`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setShowAddNews(false);
        setNewsForm({ title: "", description: "", image: null });
        fetchNews();
      } else {
        alert(data.message || "Failed to add news");
      }
    } catch (err) {
      alert("Error adding news");
    }
  };

  const deleteNews = async (id) => {
    if (!window.confirm("Delete this news item?")) return;
    try {
      const res = await fetch(`${apiBase}/news/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      if (data.success) fetchNews();
      else alert(data.message || "Delete failed");
    } catch (err) {
      alert("Error deleting news");
    }
  };

  // Lost & Found status update
  const updateLostFoundStatus = async (id, status) => {
    try {
      const res = await fetch(`${apiBase}/admin/lostnfound/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) fetchLostNFound();
      else alert(data.message || "Update failed");
    } catch (err) {
      alert("Error updating status");
    }
  };

  // Emergency actions
  const markEmergencyInProcess = async (id) => {
    try {
      const res = await fetch(`${apiBase}/emergency/${id}/inprocess`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) fetchEmergencies();
      else alert(data.message || "Failed to mark as in process");
    } catch (err) {
      alert("Error updating emergency");
    }
  };

  /* ── FILTERED DATA ── */
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const term = staffSearch.toLowerCase();
      return s.name.toLowerCase().includes(term) || s.role.toLowerCase().includes(term) || s.email.toLowerCase().includes(term);
    });
  }, [staffList, staffSearch]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const term = complaintSearch.toLowerCase();
      return c.username?.toLowerCase().includes(term) || c.pnr?.toLowerCase().includes(term) || c.description?.toLowerCase().includes(term);
    });
  }, [complaints, complaintSearch]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const term = orderSearch.toLowerCase();
      return o.user?.name?.toLowerCase().includes(term) || o.user?.email?.toLowerCase().includes(term) || o.deliveryAddress?.toLowerCase().includes(term);
    });
  }, [orders, orderSearch]);

  /* ── ANALYTICS DATA ── */
  const analyticsData = useMemo(() => {
    // Get date range based on selected time range
    const getDateRange = () => {
      const now = new Date();
      const ranges = {
        "7d": { days: 7, label: "Last 7 Days", groupBy: "day" },
        "30d": { days: 30, label: "Last 30 Days", groupBy: "day" },
        "6m": { days: 180, label: "Last 6 Months", groupBy: "month" },
        "1y": { days: 365, label: "Last Year", groupBy: "month" },
      };
      return ranges[analyticsTimeRange] || ranges["7d"];
    };

    const { days, groupBy } = getDateRange();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Filter data by time range
    const filteredOrders = orders.filter(o => new Date(o.createdAt) >= startDate);
    const filteredComplaints = complaints.filter(c => new Date(c.createdAt) >= startDate);
    const filteredEmergencies = emergencies.filter(e => new Date(e.createdAt) >= startDate);
    const filteredFeedbacks = feedbacks.filter(f => new Date(f.createdAt) >= startDate);

    // Orders by status (filtered)
    const ordersByStatus = [
      { label: "Pending", value: filteredOrders.filter(o => o.status === "pending").length, color: "#ff9800" },
      { label: "Preparing", value: filteredOrders.filter(o => o.status === "preparing").length, color: "#2196f3" },
      { label: "Out for Delivery", value: filteredOrders.filter(o => o.status === "out for delivery").length, color: "#9c27b0" },
      { label: "Delivered", value: filteredOrders.filter(o => o.status === "delivered").length, color: "#4caf50" },
      { label: "Cancelled", value: filteredOrders.filter(o => o.status === "cancelled").length, color: "#f44336" },
    ].filter(s => s.value > 0);

    // Complaints by status (filtered)
    const complaintsByStatus = [
      { label: "Pending", value: filteredComplaints.filter(c => c.status === "Pending").length, color: "#ff9800" },
      { label: "Important", value: filteredComplaints.filter(c => c.status === "Important").length, color: "#f44336" },
      { label: "Awaiting", value: filteredComplaints.filter(c => c.status === "AwaitingConfirmation").length, color: "#2196f3" },
      { label: "Resolved", value: filteredComplaints.filter(c => c.status === "Resolved").length, color: "#4caf50" },
    ].filter(s => s.value > 0);

    // Complaints by domain
    const domains = ["Cleaning", "Catering", "Security", "Maintenance", "Medical"];
    const complaintsByDomain = domains.map(d => ({
      label: d,
      value: filteredComplaints.filter(c => c.issueDomain === d).length,
    })).filter(s => s.value > 0);

    // Staff by role (not time-filtered)
    const roles = ["Cleaning", "Catering", "Security", "Maintenance", "Medical"];
    const staffByRole = roles.map(r => ({
      label: r,
      value: staffList.filter(s => s.role === r).length,
    })).filter(s => s.value > 0);

    // Emergency by status (filtered)
    const emergenciesByStatus = [
      { label: "Pending", value: filteredEmergencies.filter(e => e.status === "pending").length, color: "#ff9800" },
      { label: "Responded", value: filteredEmergencies.filter(e => e.status === "responded").length, color: "#4caf50" },
    ].filter(s => s.value > 0);

    // Generate trend labels and data based on time range
    let trendLabels = [];
    let ordersTrend = [];
    let complaintsTrend = [];

    if (groupBy === "day") {
      // For 7d and 30d - group by day
      const numDays = days <= 7 ? 7 : 30;
      trendLabels = [...Array(numDays)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (numDays - 1 - i));
        return d.toLocaleDateString("en-US", { weekday: days <= 7 ? "short" : undefined, month: days > 7 ? "short" : undefined, day: days > 7 ? "numeric" : undefined });
      });
      ordersTrend = [...Array(numDays)].map((_, idx) => {
        const d = new Date();
        d.setDate(d.getDate() - (numDays - 1 - idx));
        const dateStr = d.toISOString().split("T")[0];
        return filteredOrders.filter(o => o.createdAt?.startsWith(dateStr)).length;
      });
      complaintsTrend = [...Array(numDays)].map((_, idx) => {
        const d = new Date();
        d.setDate(d.getDate() - (numDays - 1 - idx));
        const dateStr = d.toISOString().split("T")[0];
        return filteredComplaints.filter(c => c.createdAt?.startsWith(dateStr)).length;
      });
    } else {
      // For 6m and 1y - group by month
      const numMonths = days <= 180 ? 6 : 12;
      trendLabels = [...Array(numMonths)].map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (numMonths - 1 - i));
        return d.toLocaleDateString("en-US", { month: "short" });
      });
      ordersTrend = [...Array(numMonths)].map((_, idx) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (numMonths - 1 - idx));
        const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return filteredOrders.filter(o => o.createdAt?.startsWith(monthYear)).length;
      });
      complaintsTrend = [...Array(numMonths)].map((_, idx) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (numMonths - 1 - idx));
        const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return filteredComplaints.filter(c => c.createdAt?.startsWith(monthYear)).length;
      });
    }

    // Calculate totals for the filtered range
    const totalOrders = filteredOrders.length;
    const totalComplaints = filteredComplaints.length;
    const totalEmergencies = filteredEmergencies.length;
    const resolvedComplaints = filteredComplaints.filter(c => c.status === "Resolved").length;
    const deliveredOrders = filteredOrders.filter(o => o.status === "delivered").length;
    const totalRevenue = filteredOrders.reduce((acc, o) => acc + (o.totalAmount || o.totalPrice || 0), 0);
    const avgRating = filteredFeedbacks.length > 0 
      ? (filteredFeedbacks.reduce((acc, f) => acc + (f.rating || 0), 0) / filteredFeedbacks.length).toFixed(1)
      : "—";

    return {
      ordersByStatus,
      complaintsByStatus,
      complaintsByDomain,
      staffByRole,
      emergenciesByStatus,
      trendLabels,
      ordersTrend,
      complaintsTrend,
      // Filtered totals
      totalOrders,
      totalComplaints,
      totalEmergencies,
      resolvedComplaints,
      deliveredOrders,
      totalRevenue,
      avgRating,
      feedbackCount: filteredFeedbacks.length,
      resolutionRate: totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : 0,
      deliveryRate: totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0,
    };
  }, [orders, complaints, staffList, emergencies, feedbacks, analyticsTimeRange]);

  const statusColor = {
    Pending: "#ff9800",
    Important: "#f44336",
    AwaitingConfirmation: "#2196f3",
    Resolved: "#4caf50",
    pending: "#ff9800",
    preparing: "#2196f3",
    "out for delivery": "#9c27b0",
    delivered: "#4caf50",
    cancelled: "#f44336",
    responded: "#4caf50",
  };

  const priorityColor = { low: "#4caf50", medium: "#ff9800", high: "#f44336", urgent: "#9c27b0" };
  const orderStatuses = ["pending", "preparing", "out for delivery", "delivered", "cancelled"];

  // Compute urgent items for dashboard alerts
  const urgentItems = useMemo(() => {
    const items = [];
    const pendingComplaints = complaints.filter(c => c.status === "Pending" || c.status === "Important");
    const pendingEmergencies = emergencies.filter(e => e.status === "pending");
    const pendingOrders = orders.filter(o => o.status === "pending");
    
    if (pendingEmergencies.length > 0) {
      items.push({ type: "emergency", count: pendingEmergencies.length, severity: "critical", label: "Emergencies need response" });
    }
    if (pendingComplaints.length > 0) {
      items.push({ type: "complaint", count: pendingComplaints.length, severity: "warning", label: "Complaints pending" });
    }
    if (pendingOrders.length > 0) {
      items.push({ type: "order", count: pendingOrders.length, severity: "info", label: "Orders to process" });
    }
    return items;
  }, [complaints, emergencies, orders]);

  // Recent activity for dashboard
  const recentActivity = useMemo(() => {
    const activities = [];
    
    // Get last 3 complaints
    complaints.slice(0, 3).forEach(c => {
      activities.push({
        type: "complaint",
        icon: Icons.Complaints,
        title: `Complaint from ${c.username || "User"}`,
        description: c.description?.slice(0, 50) + (c.description?.length > 50 ? "…" : ""),
        status: c.status,
        time: c.createdAt,
      });
    });
    
    // Get last 3 orders
    orders.slice(0, 3).forEach(o => {
      activities.push({
        type: "order",
        icon: Icons.Orders,
        title: `Order #${o._id?.slice(-6) || "—"}`,
        description: `${o.items?.length || 0} items - ₹${o.totalAmount || 0}`,
        status: o.status,
        time: o.createdAt,
      });
    });
    
    // Sort by time and take latest 5
    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
  }, [complaints, orders]);

  /* ═══════════════════════════════════════════════════════════
     RENDER SECTIONS
     ═══════════════════════════════════════════════════════════ */
  const renderOverview = () => {
    const pendingComplaints = stats?.complaints?.pending || 0;
    const pendingEmergencies = stats?.emergencies?.pending || 0;
    const pendingOrders = stats?.orders?.pending || 0;
    const totalStaff = stats?.staff || staffList.length || 0;
    const avgRating = feedbacks.length > 0 
      ? (feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
      : "—";

    return (
      <div className="ad-overview">
        {/* Welcome Header */}
        <div className="ad-welcome-card">
          <div className="ad-welcome-content">
            <h2 className="ad-welcome-title">Welcome back, Admin</h2>
            <p className="ad-welcome-subtitle">
              Managing Train <strong>{adminTrainNo || "—"}</strong> • {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="ad-welcome-badge">
            <Icons.Train />
            <span>{adminTrainNo || "N/A"}</span>
          </div>
        </div>

        {loading ? (
          <div className="ad-loading">
            <div className="ad-spinner" />
            <p>Loading dashboard data…</p>
          </div>
        ) : (
          <>
            {/* Urgent Alerts */}
            {urgentItems.length > 0 && (
              <div className="ad-alerts-section">
                <h3 className="ad-alerts-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Requires Attention
                </h3>
                <div className="ad-alerts-grid">
                  {urgentItems.map((item, idx) => (
                    <div key={idx} className={`ad-alert-card ad-alert-${item.severity}`} onClick={() => setActiveSection(item.type === "emergency" ? "emergency" : item.type === "complaint" ? "complaints" : "orders")}>
                      <div className="ad-alert-count">{item.count}</div>
                      <div className="ad-alert-label">{item.label}</div>
                      <div className="ad-alert-action">View →</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Metrics Grid */}
            <div className="ad-metrics-grid">
              <div className="ad-metric-card ad-metric-blue">
                <div className="ad-metric-icon">
                  <Icons.Staff />
                </div>
                <div className="ad-metric-data">
                  <div className="ad-metric-value">{totalStaff}</div>
                  <div className="ad-metric-label">Active Staff</div>
                </div>
                <div className="ad-metric-trend ad-trend-neutral">On duty</div>
              </div>

              <div className="ad-metric-card ad-metric-orange" onClick={() => setActiveSection("complaints")}>
                <div className="ad-metric-icon">
                  <Icons.Complaints />
                </div>
                <div className="ad-metric-data">
                  <div className="ad-metric-value">{pendingComplaints}</div>
                  <div className="ad-metric-label">Pending Complaints</div>
                </div>
                <div className={`ad-metric-trend ${pendingComplaints > 5 ? "ad-trend-up" : "ad-trend-down"}`}>
                  {pendingComplaints > 5 ? "High" : "Normal"}
                </div>
              </div>

              <div className="ad-metric-card ad-metric-red" onClick={() => setActiveSection("emergency")}>
                <div className="ad-metric-icon">
                  <Icons.Emergency />
                </div>
                <div className="ad-metric-data">
                  <div className="ad-metric-value">{pendingEmergencies}</div>
                  <div className="ad-metric-label">Active Emergencies</div>
                </div>
                <div className={`ad-metric-trend ${pendingEmergencies > 0 ? "ad-trend-up" : "ad-trend-down"}`}>
                  {pendingEmergencies > 0 ? "Urgent" : "Clear"}
                </div>
              </div>

              <div className="ad-metric-card ad-metric-green" onClick={() => setActiveSection("orders")}>
                <div className="ad-metric-icon">
                  <Icons.Orders />
                </div>
                <div className="ad-metric-data">
                  <div className="ad-metric-value">{pendingOrders}</div>
                  <div className="ad-metric-label">Orders in Queue</div>
                </div>
                <div className="ad-metric-trend ad-trend-neutral">Processing</div>
              </div>

              <div className="ad-metric-card ad-metric-purple" onClick={() => setActiveSection("feedback")}>
                <div className="ad-metric-icon">
                  <Icons.Feedback />
                </div>
                <div className="ad-metric-data">
                  <div className="ad-metric-value">{avgRating}</div>
                  <div className="ad-metric-label">Avg Rating</div>
                </div>
                <div className="ad-metric-trend ad-trend-neutral">{feedbacks.length} reviews</div>
              </div>

              <div className="ad-metric-card ad-metric-cyan" onClick={() => setActiveSection("lostnfound")}>
                <div className="ad-metric-icon">
                  <Icons.LostFound />
                </div>
                <div className="ad-metric-data">
                  <div className="ad-metric-value">{stats?.lostNFound?.total || lostNFound.length || 0}</div>
                  <div className="ad-metric-label">Lost & Found</div>
                </div>
                <div className="ad-metric-trend ad-trend-neutral">{stats?.lostNFound?.found || 0} found</div>
              </div>
            </div>

            {/* Two Column Layout: Quick Actions + Recent Activity */}
            <div className="ad-overview-grid">
              {/* Quick Actions */}
              <div className="ad-quick-actions-card">
                <h3 className="ad-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Quick Actions
                </h3>
                <div className="ad-actions-grid">
                  <button className="ad-action-tile" onClick={() => {
                    setCommandTarget({ _id: "", name: "Select Staff" });
                    setCommandForm({ title: "", message: "", priority: "medium" });
                  }}>
                    <div className="ad-action-icon ad-action-blue"><Icons.Send /></div>
                    <span>Send Command</span>
                  </button>
                  
                  <button className="ad-action-tile" onClick={() => navigate("/staff_register")}>
                    <div className="ad-action-icon ad-action-green"><Icons.Plus /></div>
                    <span>Add Staff</span>
                  </button>
                  
                  <button className="ad-action-tile" onClick={() => setShowAddNews(true)}>
                    <div className="ad-action-icon ad-action-purple"><Icons.News /></div>
                    <span>Publish News</span>
                  </button>
                  
                  <button className="ad-action-tile" onClick={() => setShowAddFood(true)}>
                    <div className="ad-action-icon ad-action-orange"><Icons.Food /></div>
                    <span>Add Menu Item</span>
                  </button>
                  
                  <button className="ad-action-tile" onClick={() => setActiveSection("complaints")}>
                    <div className="ad-action-icon ad-action-red"><Icons.Complaints /></div>
                    <span>View Complaints</span>
                  </button>
                  
                  <button className="ad-action-tile" onClick={() => setActiveSection("staff")}>
                    <div className="ad-action-icon ad-action-cyan"><Icons.Staff /></div>
                    <span>Manage Staff</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="ad-activity-card">
                <h3 className="ad-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Recent Activity
                </h3>
                {recentActivity.length === 0 ? (
                  <p className="ad-muted ad-activity-empty">No recent activity</p>
                ) : (
                  <div className="ad-activity-list">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="ad-activity-item">
                        <div className={`ad-activity-icon ad-activity-${activity.type}`}>
                          <activity.icon />
                        </div>
                        <div className="ad-activity-content">
                          <div className="ad-activity-title">{activity.title}</div>
                          <div className="ad-activity-desc">{activity.description}</div>
                        </div>
                        <div className="ad-activity-meta">
                          <span className={`ad-activity-status ad-status-${activity.status?.toLowerCase().replace(/\s+/g, "-")}`}>
                            {activity.status}
                          </span>
                          <span className="ad-activity-time">
                            {activity.time ? new Date(activity.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Summary Stats Row */}
            <div className="ad-summary-row">
              <div className="ad-summary-card">
                <div className="ad-summary-header">
                  <h4>Orders Summary</h4>
                  <button className="ad-link-btn" onClick={() => setActiveSection("orders")}>View all</button>
                </div>
                <div className="ad-summary-stats">
                  <div className="ad-summary-stat">
                    <span className="ad-summary-value" style={{ color: "#ff9800" }}>{stats?.orders?.pending || 0}</span>
                    <span className="ad-summary-label">Pending</span>
                  </div>
                  <div className="ad-summary-stat">
                    <span className="ad-summary-value" style={{ color: "#2196f3" }}>{stats?.orders?.preparing || orders.filter(o => o.status === "preparing").length || 0}</span>
                    <span className="ad-summary-label">Preparing</span>
                  </div>
                  <div className="ad-summary-stat">
                    <span className="ad-summary-value" style={{ color: "#4caf50" }}>{stats?.orders?.delivered || 0}</span>
                    <span className="ad-summary-label">Delivered</span>
                  </div>
                  <div className="ad-summary-stat">
                    <span className="ad-summary-value" style={{ color: "#f44336" }}>{stats?.orders?.cancelled || 0}</span>
                    <span className="ad-summary-label">Cancelled</span>
                  </div>
                </div>
              </div>

              <div className="ad-summary-card">
                <div className="ad-summary-header">
                  <h4>Complaints Summary</h4>
                  <button className="ad-link-btn" onClick={() => setActiveSection("complaints")}>View all</button>
                </div>
                <div className="ad-summary-stats">
                  <div className="ad-summary-stat">
                    <span className="ad-summary-value" style={{ color: "#ff9800" }}>{complaints.filter(c => c.status === "Pending").length}</span>
                    <span className="ad-summary-label">Pending</span>
                  </div>
                  <div className="ad-summary-stat">
                    <span className="ad-summary-value" style={{ color: "#f44336" }}>{complaints.filter(c => c.status === "Important").length}</span>
                    <span className="ad-summary-label">Important</span>
                  </div>
                  <div className="ad-summary-stat">
                    <span className="ad-summary-value" style={{ color: "#2196f3" }}>{complaints.filter(c => c.status === "AwaitingConfirmation").length}</span>
                    <span className="ad-summary-label">Awaiting</span>
                  </div>
                  <div className="ad-summary-stat">
                    <span className="ad-summary-value" style={{ color: "#4caf50" }}>{complaints.filter(c => c.status === "Resolved").length}</span>
                    <span className="ad-summary-label">Resolved</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    // Use values from analyticsData (already filtered by time range)
    const { 
      totalOrders, totalComplaints, totalEmergencies, 
      resolvedComplaints, deliveredOrders, totalRevenue, 
      avgRating, feedbackCount, resolutionRate, deliveryRate,
      trendLabels, ordersTrend, complaintsTrend
    } = analyticsData;
    
    const avgResponseTime = "~12 min"; // Placeholder - would need actual data

    // Time range options
    const timeRangeOptions = [
      { value: "7d", label: "Last 7 Days" },
      { value: "30d", label: "Last 30 Days" },
      { value: "6m", label: "Last 6 Months" },
      { value: "1y", label: "Last Year" },
    ];

    // Feedback distribution
    const feedbackDistribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: feedbacks.filter(f => f.rating === rating).length,
      percentage: feedbacks.length > 0 
        ? ((feedbacks.filter(f => f.rating === rating).length / feedbacks.length) * 100).toFixed(0)
        : 0,
    }));

    // Top complaint domains
    const topDomains = ["Cleaning", "Catering", "Security", "Maintenance", "Medical"]
      .map(domain => ({
        domain,
        count: complaints.filter(c => c.issueDomain === domain).length,
        resolved: complaints.filter(c => c.issueDomain === domain && c.status === "Resolved").length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return (
      <div className="ad-analytics">
        {/* Header with Date Filter */}
        <div className="ad-analytics-header">
          <div>
            <h2 className="ad-analytics-title">Analytics Dashboard</h2>
            <p className="ad-analytics-subtitle">Performance insights for Train: <strong>{adminTrainNo}</strong></p>
          </div>
          <div className="ad-time-range-selector">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <select 
              value={analyticsTimeRange} 
              onChange={(e) => setAnalyticsTimeRange(e.target.value)}
              className="ad-time-range-select"
            >
              {timeRangeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Cards Row */}
        <div className="ad-kpi-row">
          <div className="ad-kpi-card">
            <div className="ad-kpi-icon ad-kpi-blue">
              <Icons.Orders />
            </div>
            <div className="ad-kpi-content">
              <div className="ad-kpi-value">{totalOrders}</div>
              <div className="ad-kpi-label">Total Orders</div>
            </div>
            <div className="ad-kpi-stat ad-stat-positive">
              <span>{deliveryRate}%</span> delivered
            </div>
          </div>

          <div className="ad-kpi-card">
            <div className="ad-kpi-icon ad-kpi-orange">
              <Icons.Complaints />
            </div>
            <div className="ad-kpi-content">
              <div className="ad-kpi-value">{totalComplaints}</div>
              <div className="ad-kpi-label">Total Complaints</div>
            </div>
            <div className="ad-kpi-stat ad-stat-positive">
              <span>{resolutionRate}%</span> resolved
            </div>
          </div>

          <div className="ad-kpi-card">
            <div className="ad-kpi-icon ad-kpi-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="ad-kpi-content">
              <div className="ad-kpi-value">₹{totalRevenue.toLocaleString("en-IN")}</div>
              <div className="ad-kpi-label">Total Revenue</div>
            </div>
            <div className="ad-kpi-stat ad-stat-neutral">
              From orders
            </div>
          </div>

          <div className="ad-kpi-card">
            <div className="ad-kpi-icon ad-kpi-purple">
              <Icons.Feedback />
            </div>
            <div className="ad-kpi-content">
              <div className="ad-kpi-value">{avgRating}</div>
              <div className="ad-kpi-label">Avg Rating</div>
            </div>
            <div className="ad-kpi-stat ad-stat-neutral">
              {feedbackCount} reviews
            </div>
          </div>
        </div>

        {/* Charts Row 1: Trends */}
        <div className="ad-charts-section">
          <h3 className="ad-charts-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
            Trends Overview
          </h3>
          <div className="ad-charts-grid-2">
            <div className="ad-chart-panel">
              <div className="ad-chart-header">
                <h4>Orders Trend</h4>
                <span className="ad-chart-badge ad-badge-blue">{totalOrders} total</span>
              </div>
              <LineChart 
                labels={trendLabels} 
                datasets={[{ values: ordersTrend, color: "#3b82f6" }]} 
                area={true} 
                height={200}
              />
            </div>

            <div className="ad-chart-panel">
              <div className="ad-chart-header">
                <h4>Complaints Trend</h4>
                <span className="ad-chart-badge ad-badge-orange">{totalComplaints} total</span>
              </div>
              <LineChart 
                labels={trendLabels} 
                datasets={[{ values: complaintsTrend, color: "#f59e0b" }]} 
                area={true}
                height={200}
              />
            </div>
          </div>
        </div>

        {/* Charts Row 2: Distribution */}
        <div className="ad-charts-section">
          <h3 className="ad-charts-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
            </svg>
            Status Distribution
          </h3>
          <div className="ad-charts-grid-3">
            <div className="ad-chart-panel">
              <div className="ad-chart-header">
                <h4>Orders by Status</h4>
              </div>
              <DonutChart slices={analyticsData.ordersByStatus} size={180} />
            </div>

            <div className="ad-chart-panel">
              <div className="ad-chart-header">
                <h4>Complaints by Status</h4>
              </div>
              <DonutChart slices={analyticsData.complaintsByStatus} size={180} />
            </div>

            <div className="ad-chart-panel">
              <div className="ad-chart-header">
                <h4>Emergency Status</h4>
              </div>
              <DonutChart slices={analyticsData.emergenciesByStatus} size={180} />
            </div>
          </div>
        </div>

        {/* Performance Metrics Row */}
        <div className="ad-performance-row">
          {/* Performance Gauges */}
          <div className="ad-performance-card">
            <h4 className="ad-performance-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Performance Metrics
            </h4>
            <div className="ad-gauges-grid">
              <MiniGauge 
                value={parseFloat(resolutionRate) || 0} 
                max={100} 
                label="Resolution Rate" 
                color="#22c55e" 
              />
              <MiniGauge 
                value={parseFloat(deliveryRate) || 0} 
                max={100} 
                label="Delivery Rate" 
                color="#3b82f6" 
              />
              <MiniGauge 
                value={totalEmergencies > 0 ? ((emergencies.filter(e => e.status === "responded").length / totalEmergencies) * 100) : 100} 
                max={100} 
                label="Response Rate" 
                color="#a855f7" 
              />
            </div>
          </div>

          {/* Feedback Distribution */}
          <div className="ad-performance-card">
            <h4 className="ad-performance-title">
              <Icons.Feedback />
              Rating Distribution
            </h4>
            <div className="ad-rating-bars">
              {feedbackDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="ad-rating-row">
                  <span className="ad-rating-label">{rating} ★</span>
                  <div className="ad-rating-bar">
                    <div 
                      className="ad-rating-fill" 
                      style={{ 
                        width: `${percentage}%`,
                        background: rating >= 4 ? "#22c55e" : rating === 3 ? "#f59e0b" : "#ef4444"
                      }} 
                    />
                  </div>
                  <span className="ad-rating-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Staff & Domains */}
        <div className="ad-analytics-bottom">
          {/* Staff by Role */}
          <div className="ad-chart-panel">
            <div className="ad-chart-header">
              <h4>Staff by Role</h4>
              <span className="ad-chart-badge ad-badge-cyan">{staffList.length} total</span>
            </div>
            <BarChart 
              labels={analyticsData.staffByRole.map(d => d.label)} 
              values={analyticsData.staffByRole.map(d => d.value)} 
              color="#06b6d4"
              height={180}
            />
          </div>

          {/* Complaints by Domain Table */}
          <div className="ad-domain-card">
            <div className="ad-chart-header">
              <h4>Complaints by Domain</h4>
            </div>
            <div className="ad-domain-list">
              {topDomains.map(({ domain, count, resolved }) => (
                <div key={domain} className="ad-domain-row">
                  <div className="ad-domain-info">
                    <span className="ad-domain-name">{domain}</span>
                    <span className="ad-domain-badge">{count} complaints</span>
                  </div>
                  <div className="ad-domain-progress">
                    <div className="ad-domain-bar">
                      <div 
                        className="ad-domain-fill" 
                        style={{ width: count > 0 ? `${(resolved / count) * 100}%` : "0%" }} 
                      />
                    </div>
                    <span className="ad-domain-stat">{count > 0 ? Math.round((resolved / count) * 100) : 0}% resolved</span>
                  </div>
                </div>
              ))}
              {topDomains.length === 0 && (
                <p className="ad-muted" style={{ textAlign: "center", padding: "1rem" }}>No complaint data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="ad-analytics-footer">
          <div className="ad-quick-stat">
            <span className="ad-quick-stat-value">{staffList.length}</span>
            <span className="ad-quick-stat-label">Active Staff</span>
          </div>
          <div className="ad-quick-divider" />
          <div className="ad-quick-stat">
            <span className="ad-quick-stat-value">{lostNFound.length}</span>
            <span className="ad-quick-stat-label">Lost & Found Cases</span>
          </div>
          <div className="ad-quick-divider" />
          <div className="ad-quick-stat">
            <span className="ad-quick-stat-value">{newsItems.length}</span>
            <span className="ad-quick-stat-label">News Published</span>
          </div>
          <div className="ad-quick-divider" />
          <div className="ad-quick-stat">
            <span className="ad-quick-stat-value">{foodItems.filter(f => f.isAvailable).length}</span>
            <span className="ad-quick-stat-label">Menu Items Available</span>
          </div>
        </div>
      </div>
    );
  };

  const [staffRoleFilter, setStaffRoleFilter] = useState("all");
  const [staffViewMode, setStaffViewMode] = useState("cards");

  const staffByRoleStats = useMemo(() => {
    const roles = ["Cleaning", "Catering", "Security", "Maintenance", "Medical"];
    return roles.map(role => ({
      role,
      count: staffList.filter(s => s.role === role).length,
      color: {
        Cleaning: "#22c55e",
        Catering: "#f59e0b", 
        Security: "#3b82f6",
        Maintenance: "#a855f7",
        Medical: "#ef4444"
      }[role]
    }));
  }, [staffList]);

  const filteredStaffByRole = useMemo(() => {
    let filtered = staffList;
    if (staffRoleFilter !== "all") {
      filtered = filtered.filter(s => s.role === staffRoleFilter);
    }
    if (staffSearch) {
      const search = staffSearch.toLowerCase();
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(search) ||
        s.email?.toLowerCase().includes(search) ||
        s.role?.toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [staffList, staffRoleFilter, staffSearch]);

  const renderStaff = () => (
    <div className="ad-staff">
      {/* Header */}
      <div className="ad-staff-header">
        <div className="ad-staff-title-section">
          <h2 className="ad-staff-title">Staff Management</h2>
          <p className="ad-staff-subtitle">
            Manage your team on Train {adminTrainNo}
          </p>
        </div>
        <button className="ad-btn ad-btn-primary ad-btn-lg" onClick={() => navigate("/staff_register")}>
          <Icons.Plus /> Add New Staff
        </button>
      </div>

      {/* Role Stats Cards */}
      <div className="ad-staff-stats">
        <div className="ad-staff-stat-card ad-staff-stat-total">
          <div className="ad-staff-stat-icon" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
            <Icons.Staff />
          </div>
          <div className="ad-staff-stat-content">
            <span className="ad-staff-stat-value">{staffList.length}</span>
            <span className="ad-staff-stat-label">Total Staff</span>
          </div>
        </div>
        {staffByRoleStats.map(({ role, count, color }) => (
          <div 
            key={role} 
            className={`ad-staff-stat-card ${staffRoleFilter === role ? "ad-staff-stat-active" : ""}`}
            onClick={() => setStaffRoleFilter(staffRoleFilter === role ? "all" : role)}
          >
            <div className="ad-staff-stat-icon" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
              {role === "Cleaning" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>}
              {role === "Catering" && <Icons.Food />}
              {role === "Security" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
              {role === "Maintenance" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>}
              {role === "Medical" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
            </div>
            <div className="ad-staff-stat-content">
              <span className="ad-staff-stat-value">{count}</span>
              <span className="ad-staff-stat-label">{role}</span>
            </div>
            {staffRoleFilter === role && <span className="ad-staff-stat-check">✓</span>}
          </div>
        ))}
      </div>

      {/* Search & Controls Bar */}
      <div className="ad-staff-controls">
        <div className="ad-staff-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ad-staff-search-icon">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Search staff by name, email..."
            value={staffSearch}
            onChange={(e) => setStaffSearch(e.target.value)}
            className="ad-staff-search-input"
          />
          {staffSearch && (
            <button className="ad-staff-search-clear" onClick={() => setStaffSearch("")}>×</button>
          )}
        </div>
        <div className="ad-staff-controls-right">
          <select
            value={staffRoleFilter}
            onChange={(e) => setStaffRoleFilter(e.target.value)}
            className="ad-staff-filter-select"
          >
            <option value="all">All Roles</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Catering">Catering</option>
            <option value="Security">Security</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Medical">Medical</option>
          </select>
          <div className="ad-staff-view-toggle">
            <button 
              className={`ad-staff-view-btn ${staffViewMode === "cards" ? "active" : ""}`}
              onClick={() => setStaffViewMode("cards")}
              title="Card View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button 
              className={`ad-staff-view-btn ${staffViewMode === "table" ? "active" : ""}`}
              onClick={() => setStaffViewMode("table")}
              title="Table View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="ad-staff-results-info">
        <span>Showing <strong>{filteredStaffByRole.length}</strong> of <strong>{staffList.length}</strong> staff members</span>
        {staffRoleFilter !== "all" && (
          <button className="ad-staff-clear-filter" onClick={() => setStaffRoleFilter("all")}>
            Clear filter ×
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="ad-staff-loading">
          <div className="ad-staff-spinner"></div>
          <p>Loading staff...</p>
        </div>
      ) : filteredStaffByRole.length === 0 ? (
        <div className="ad-staff-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="ad-staff-empty-icon">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <line x1="17" y1="11" x2="23" y2="11"/>
          </svg>
          <h3>No Staff Found</h3>
          <p>
            {staffSearch || staffRoleFilter !== "all" 
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first team member"}
          </p>
          <button className="ad-btn ad-btn-primary" onClick={() => navigate("/staff_register")}>
            <Icons.Plus /> Add Staff Member
          </button>
        </div>
      ) : staffViewMode === "cards" ? (
        <div className="ad-staff-grid">
          {filteredStaffByRole.map((s) => {
            const roleColor = {
              Cleaning: "#22c55e",
              Catering: "#f59e0b", 
              Security: "#3b82f6",
              Maintenance: "#a855f7",
              Medical: "#ef4444"
            }[s.role] || "#6b7280";
            
            return (
              <div key={s._id} className="ad-staff-card">
                <div className="ad-staff-card-header" style={{ background: `linear-gradient(135deg, ${roleColor}20, ${roleColor}10)` }}>
                  <div className="ad-staff-avatar" style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)` }}>
                    {s.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <span className="ad-staff-role-badge" style={{ background: roleColor }}>{s.role}</span>
                </div>
                <div className="ad-staff-card-body">
                  <h3 className="ad-staff-name">{s.name}</h3>
                  <div className="ad-staff-details">
                    <div className="ad-staff-detail">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <span className="ad-staff-detail-text">{s.email}</span>
                    </div>
                    <div className="ad-staff-detail">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span className="ad-staff-detail-text">{s.phone || "—"}</span>
                    </div>
                    <div className="ad-staff-detail">
                      <Icons.Train />
                      <span className="ad-staff-detail-text">Train {s.trainNumber}</span>
                    </div>
                  </div>
                </div>
                <div className="ad-staff-card-actions">
                  <button className="ad-staff-action-btn ad-staff-action-edit" onClick={() => openEditStaff(s)} title="Edit">
                    <Icons.Edit />
                  </button>
                  <button className="ad-staff-action-btn ad-staff-action-command" onClick={() => openCommandModal(s)} title="Send Command">
                    <Icons.Send />
                  </button>
                  <button className="ad-staff-action-btn ad-staff-action-delete" onClick={() => deleteStaff(s._id)} title="Delete">
                    <Icons.Delete />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ad-staff-table-container">
          <table className="ad-staff-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Train</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaffByRole.map((s) => {
                const roleColor = {
                  Cleaning: "#22c55e",
                  Catering: "#f59e0b", 
                  Security: "#3b82f6",
                  Maintenance: "#a855f7",
                  Medical: "#ef4444"
                }[s.role] || "#6b7280";
                
                return (
                  <tr key={s._id}>
                    <td>
                      <div className="ad-staff-table-user">
                        <div className="ad-staff-table-avatar" style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)` }}>
                          {s.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="ad-staff-table-role" style={{ background: `${roleColor}20`, color: roleColor }}>
                        {s.role}
                      </span>
                    </td>
                    <td>
                      <div className="ad-staff-table-contact">
                        <span>{s.email}</span>
                        <small>{s.phone || "—"}</small>
                      </div>
                    </td>
                    <td>
                      <span className="ad-staff-table-train">{s.trainNumber}</span>
                    </td>
                    <td>
                      <div className="ad-staff-table-actions">
                        <button className="ad-staff-table-action" onClick={() => openEditStaff(s)} title="Edit">
                          <Icons.Edit />
                        </button>
                        <button className="ad-staff-table-action" onClick={() => openCommandModal(s)} title="Send Command">
                          <Icons.Send />
                        </button>
                        <button className="ad-staff-table-action ad-staff-table-action-danger" onClick={() => deleteStaff(s._id)} title="Delete">
                          <Icons.Delete />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Distribution Chart */}
      {staffList.length > 0 && (
        <div className="ad-staff-distribution">
          <h3 className="ad-staff-distribution-title">
            <Icons.Analytics /> Staff Distribution by Role
          </h3>
          <div className="ad-staff-distribution-content">
            <div className="ad-staff-distribution-chart">
              <DonutChart 
                slices={staffByRoleStats.filter(r => r.count > 0).map(r => ({
                  label: r.role,
                  value: r.count,
                  color: r.color
                }))}
                size={180}
              />
            </div>
            <div className="ad-staff-distribution-bars">
              {staffByRoleStats.map(({ role, count, color }) => (
                <div key={role} className="ad-staff-dist-row">
                  <span className="ad-staff-dist-label">{role}</span>
                  <div className="ad-staff-dist-bar">
                    <div 
                      className="ad-staff-dist-fill"
                      style={{ 
                        width: `${staffList.length > 0 ? (count / staffList.length) * 100 : 0}%`,
                        background: color 
                      }}
                    />
                  </div>
                  <span className="ad-staff-dist-count">{count}</span>
                  <span className="ad-staff-dist-pct">
                    {staffList.length > 0 ? Math.round((count / staffList.length) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCommands = () => (
    <div className="ad-section">
      <div className="ad-section-header">
        <div>
          <h2 className="ad-section-title">Commands</h2>
          <p className="ad-subtitle">{commands.length} commands sent</p>
        </div>
        <button 
          className="ad-btn ad-btn-primary" 
          onClick={() => {
            setCommandTarget({ _id: "", name: "Select Staff" });
            setCommandForm({ title: "", message: "", priority: "medium" });
          }}
        >
          <Icons.Plus /> New Command
        </button>
      </div>

      {commands.length === 0 ? (
        <p className="ad-muted">No commands sent yet. Click "New Command" to send one.</p>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>To</th>
                <th>Title</th>
                <th>Message</th>
                <th>Priority</th>
                <th>Read</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {commands.map((cmd) => (
                <tr key={cmd._id}>
                  <td>{cmd.staffId?.name || "—"}</td>
                  <td>{cmd.title}</td>
                  <td className="ad-truncate">{cmd.message}</td>
                  <td><span style={{ color: priorityColor[cmd.priority] || "#999", fontWeight: 600 }}>{cmd.priority}</span></td>
                  <td>{cmd.isRead ? <span className="ad-badge ad-badge-success">Yes</span> : <span className="ad-badge ad-badge-warning">No</span>}</td>
                  <td>{new Date(cmd.createdAt).toLocaleString()}</td>
                  <td>
                    <button className="ad-btn-icon ad-btn-danger" onClick={() => deleteCommand(cmd._id)}><Icons.Delete /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderComplaints = () => (
    <div className="ad-section">
      <div className="ad-section-header">
        <div>
          <h2 className="ad-section-title">Train Complaints</h2>
          <p className="ad-subtitle">{complaints.length} complaints for Train: {adminTrainNo}</p>
        </div>
      </div>

      <div className="ad-filters">
        <input
          type="text"
          placeholder="Search by name, PNR, description…"
          value={complaintSearch}
          onChange={(e) => setComplaintSearch(e.target.value)}
          className="ad-input"
        />
        <select value={complaintStatus} onChange={(e) => { setComplaintStatus(e.target.value); }} className="ad-select">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Important">Important</option>
          <option value="AwaitingConfirmation">Awaiting Confirmation</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <p className="ad-muted">Loading…</p>
      ) : filteredComplaints.length === 0 ? (
        <p className="ad-muted">No complaints found.</p>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>User</th>
                <th>PNR</th>
                <th>Bogie/Seat</th>
                <th>Description</th>
                <th>Domain</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((c) => (
                <tr key={c._id}>
                  <td>
                    {c.linkurl ? (
                      <img src={c.linkurl} alt="complaint" className="ad-thumb" />
                    ) : (
                      <span className="ad-muted">—</span>
                    )}
                  </td>
                  <td>{c.username}</td>
                  <td>{c.pnr}</td>
                  <td>{c.bogieNumber}/{c.seatNumber}</td>
                  <td className="ad-truncate">{c.description}</td>
                  <td><span className="ad-badge">{c.issueDomain}</span></td>
                  <td><span style={{ color: statusColor[c.status] || "#999", fontWeight: 600 }}>{c.status}</span></td>
                  <td>{new Date(c.createdAt).toLocaleString()}</td>
                  <td>
                    {c.status !== "Resolved" && (
                      <button className="ad-btn ad-btn-sm" onClick={() => resolveComplaint(c._id)}>
                        <Icons.Check /> Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="ad-section">
      <div className="ad-section-header">
        <div>
          <h2 className="ad-section-title">Catering Orders</h2>
          <p className="ad-subtitle">{orders.length} orders for Train: {adminTrainNo}</p>
        </div>
      </div>

      <div className="ad-filters">
        <input
          type="text"
          placeholder="Search by name, email, address…"
          value={orderSearch}
          onChange={(e) => setOrderSearch(e.target.value)}
          className="ad-input"
        />
        <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="ad-select">
          <option value="">All Status</option>
          {orderStatuses.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="ad-muted">Loading…</p>
      ) : filteredOrders.length === 0 ? (
        <p className="ad-muted">No orders found.</p>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Address</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Date</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <div>{o.user?.name || "—"}</div>
                    <small className="ad-muted">{o.user?.email || ""}</small>
                  </td>
                  <td>
                    {o.items?.map((item, i) => (
                      <div key={i} className="ad-order-item">
                        {item.foodItem?.name || "Item"} x{item.quantity} (₹{item.priceAtOrder})
                      </div>
                    ))}
                  </td>
                  <td>₹{o.totalPrice}</td>
                  <td>{o.deliveryAddress}</td>
                  <td>{o.notes || "—"}</td>
                  <td><span style={{ color: statusColor[o.status] || "#999", fontWeight: 600 }}>{o.status}</span></td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                      className="ad-select ad-select-sm"
                    >
                      {orderStatuses.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const [foodSearch, setFoodSearch] = useState("");
  const [foodCategoryFilter, setFoodCategoryFilter] = useState("all");
  const [foodAvailabilityFilter, setFoodAvailabilityFilter] = useState("all");
  const [foodViewMode, setFoodViewMode] = useState("cards");

  const foodCategories = ["Breakfast", "Lunch", "Dinner", "Snacks", "Beverages"];

  // News section state
  const [newsSearch, setNewsSearch] = useState("");
  const [newsViewMode, setNewsViewMode] = useState("cards");
  const [newsTimeFilter, setNewsTimeFilter] = useState("all");

  // Lost & Found section state
  const [lnfSearch, setLnfSearch] = useState("");
  const [lnfViewMode, setLnfViewMode] = useState("cards");
  const [lnfCategoryFilter, setLnfCategoryFilter] = useState("all");
  const [lnfStatusFilter, setLnfStatusFilter] = useState("all");

  // Emergency section state
  const [emgSearch, setEmgSearch] = useState("");
  const [emgViewMode, setEmgViewMode] = useState("cards");
  const [emgStatusFilter, setEmgStatusFilter] = useState("all");
  
  const foodByCategoryStats = useMemo(() => {
    return foodCategories.map(category => ({
      category,
      count: foodItems.filter(f => f.category === category).length,
      color: {
        Breakfast: "#f59e0b",
        Lunch: "#22c55e",
        Dinner: "#6366f1",
        Snacks: "#ec4899",
        Beverages: "#06b6d4"
      }[category]
    }));
  }, [foodItems]);

  const filteredFoodItems = useMemo(() => {
    let filtered = foodItems;
    if (foodCategoryFilter !== "all") {
      filtered = filtered.filter(f => f.category === foodCategoryFilter);
    }
    if (foodAvailabilityFilter !== "all") {
      filtered = filtered.filter(f => 
        foodAvailabilityFilter === "available" ? f.isAvailable : !f.isAvailable
      );
    }
    if (foodSearch) {
      const search = foodSearch.toLowerCase();
      filtered = filtered.filter(f => 
        f.name?.toLowerCase().includes(search) ||
        f.category?.toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [foodItems, foodCategoryFilter, foodAvailabilityFilter, foodSearch]);

  const foodStats = useMemo(() => {
    const available = foodItems.filter(f => f.isAvailable).length;
    const unavailable = foodItems.length - available;
    const avgPrice = foodItems.length > 0 
      ? Math.round(foodItems.reduce((acc, f) => acc + (parseFloat(f.price) || 0), 0) / foodItems.length)
      : 0;
    return { available, unavailable, avgPrice, total: foodItems.length };
  }, [foodItems]);

  const renderFood = () => (
    <div className="ad-food">
      {/* Header */}
      <div className="ad-food-header">
        <div className="ad-food-title-section">
          <h2 className="ad-food-title">Food Menu Management</h2>
          <p className="ad-food-subtitle">
            Manage your catering menu for Train {adminTrainNo}
          </p>
        </div>
        <button className="ad-btn ad-btn-primary ad-btn-lg" onClick={() => setShowAddFood(true)}>
          <Icons.Plus /> Add Food Item
        </button>
      </div>

      {/* Stats Overview */}
      <div className="ad-food-stats-row">
        <div className="ad-food-stat-card ad-food-stat-total">
          <div className="ad-food-stat-icon" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
            <Icons.Food />
          </div>
          <div className="ad-food-stat-content">
            <span className="ad-food-stat-value">{foodStats.total}</span>
            <span className="ad-food-stat-label">Total Items</span>
          </div>
        </div>
        <div className="ad-food-stat-card">
          <div className="ad-food-stat-icon" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
            <Icons.Check />
          </div>
          <div className="ad-food-stat-content">
            <span className="ad-food-stat-value">{foodStats.available}</span>
            <span className="ad-food-stat-label">Available</span>
          </div>
        </div>
        <div className="ad-food-stat-card">
          <div className="ad-food-stat-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <div className="ad-food-stat-content">
            <span className="ad-food-stat-value">{foodStats.unavailable}</span>
            <span className="ad-food-stat-label">Unavailable</span>
          </div>
        </div>
        <div className="ad-food-stat-card">
          <div className="ad-food-stat-icon" style={{ background: "linear-gradient(135deg, #a855f7, #9333ea)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="ad-food-stat-content">
            <span className="ad-food-stat-value">₹{foodStats.avgPrice}</span>
            <span className="ad-food-stat-label">Avg Price</span>
          </div>
        </div>
      </div>

      {/* Category Filter Cards */}
      <div className="ad-food-categories">
        <h3 className="ad-food-categories-title">Filter by Category</h3>
        <div className="ad-food-category-cards">
          {foodByCategoryStats.map(({ category, count, color }) => (
            <div 
              key={category}
              className={`ad-food-category-card ${foodCategoryFilter === category ? "active" : ""}`}
              onClick={() => setFoodCategoryFilter(foodCategoryFilter === category ? "all" : category)}
              style={{ borderColor: foodCategoryFilter === category ? color : undefined }}
            >
              <div className="ad-food-category-icon" style={{ background: `${color}20`, color }}>
                {category === "Breakfast" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>}
                {category === "Lunch" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>}
                {category === "Dinner" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>}
                {category === "Snacks" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>}
                {category === "Beverages" && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>}
              </div>
              <div className="ad-food-category-info">
                <span className="ad-food-category-name">{category}</span>
                <span className="ad-food-category-count">{count} items</span>
              </div>
              {foodCategoryFilter === category && <span className="ad-food-category-check">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Search & Controls */}
      <div className="ad-food-controls">
        <div className="ad-food-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ad-food-search-icon">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Search menu items..."
            value={foodSearch}
            onChange={(e) => setFoodSearch(e.target.value)}
            className="ad-food-search-input"
          />
          {foodSearch && (
            <button className="ad-food-search-clear" onClick={() => setFoodSearch("")}>×</button>
          )}
        </div>
        <div className="ad-food-controls-right">
          <select
            value={foodAvailabilityFilter}
            onChange={(e) => setFoodAvailabilityFilter(e.target.value)}
            className="ad-food-filter-select"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <div className="ad-food-view-toggle">
            <button 
              className={`ad-food-view-btn ${foodViewMode === "cards" ? "active" : ""}`}
              onClick={() => setFoodViewMode("cards")}
              title="Card View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button 
              className={`ad-food-view-btn ${foodViewMode === "table" ? "active" : ""}`}
              onClick={() => setFoodViewMode("table")}
              title="Table View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="ad-food-results-info">
        <span>Showing <strong>{filteredFoodItems.length}</strong> of <strong>{foodItems.length}</strong> items</span>
        {(foodCategoryFilter !== "all" || foodAvailabilityFilter !== "all") && (
          <button className="ad-food-clear-filter" onClick={() => { setFoodCategoryFilter("all"); setFoodAvailabilityFilter("all"); }}>
            Clear filters ×
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="ad-food-loading">
          <div className="ad-food-spinner"></div>
          <p>Loading menu...</p>
        </div>
      ) : filteredFoodItems.length === 0 ? (
        <div className="ad-food-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="ad-food-empty-icon">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
          <h3>No Menu Items Found</h3>
          <p>
            {foodSearch || foodCategoryFilter !== "all" || foodAvailabilityFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first menu item"}
          </p>
          <button className="ad-btn ad-btn-primary" onClick={() => setShowAddFood(true)}>
            <Icons.Plus /> Add Food Item
          </button>
        </div>
      ) : foodViewMode === "cards" ? (
        <div className="ad-food-grid">
          {filteredFoodItems.map((f) => {
            const categoryColor = {
              Breakfast: "#f59e0b",
              Lunch: "#22c55e",
              Dinner: "#6366f1",
              Snacks: "#ec4899",
              Beverages: "#06b6d4"
            }[f.category] || "#6b7280";
            
            return (
              <div key={f._id} className="ad-food-card">
                <div className="ad-food-card-image">
                  {f.imageUrl ? (
                    <img src={f.imageUrl} alt={f.name} />
                  ) : (
                    <div className="ad-food-card-placeholder">
                      <Icons.Food />
                    </div>
                  )}
                  <span 
                    className={`ad-food-availability-badge ${f.isAvailable ? "available" : "unavailable"}`}
                  >
                    {f.isAvailable ? "Available" : "Sold Out"}
                  </span>
                  <span className="ad-food-category-badge" style={{ background: categoryColor }}>
                    {f.category}
                  </span>
                </div>
                <div className="ad-food-card-body">
                  <h3 className="ad-food-item-name">{f.name}</h3>
                  <div className="ad-food-item-price">₹{f.price}</div>
                </div>
                <div className="ad-food-card-actions">
                  <button 
                    className="ad-food-action-btn ad-food-action-toggle"
                    onClick={() => toggleFoodAvailability(f._id, f.isAvailable)}
                    title={f.isAvailable ? "Mark as Unavailable" : "Mark as Available"}
                  >
                    {f.isAvailable ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>
                    ) : (
                      <Icons.Check />
                    )}
                  </button>
                  <button className="ad-food-action-btn ad-food-action-delete" onClick={() => deleteFood(f._id)} title="Delete">
                    <Icons.Delete />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ad-food-table-container">
          <table className="ad-food-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFoodItems.map((f) => {
                const categoryColor = {
                  Breakfast: "#f59e0b",
                  Lunch: "#22c55e",
                  Dinner: "#6366f1",
                  Snacks: "#ec4899",
                  Beverages: "#06b6d4"
                }[f.category] || "#6b7280";
                
                return (
                  <tr key={f._id}>
                    <td>
                      <div className="ad-food-table-item">
                        {f.imageUrl ? (
                          <img src={f.imageUrl} alt={f.name} className="ad-food-table-img" />
                        ) : (
                          <div className="ad-food-table-img-placeholder">
                            <Icons.Food />
                          </div>
                        )}
                        <span>{f.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="ad-food-table-category" style={{ background: `${categoryColor}20`, color: categoryColor }}>
                        {f.category}
                      </span>
                    </td>
                    <td>
                      <span className="ad-food-table-price">₹{f.price}</span>
                    </td>
                    <td>
                      <span className={`ad-food-table-status ${f.isAvailable ? "available" : "unavailable"}`}>
                        {f.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td>
                      <div className="ad-food-table-actions">
                        <button 
                          className="ad-food-table-action ad-food-table-action-toggle" 
                          onClick={() => toggleFoodAvailability(f._id, f.isAvailable)} 
                          title={f.isAvailable ? "Mark as Unavailable" : "Mark as Available"}
                        >
                          {f.isAvailable ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                            </svg>
                          ) : (
                            <Icons.Check />
                          )}
                        </button>
                        <button className="ad-food-table-action ad-food-table-action-delete" onClick={() => deleteFood(f._id)} title="Delete">
                          <Icons.Delete />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Distribution */}
      {foodItems.length > 0 && (
        <div className="ad-food-distribution">
          <h3 className="ad-food-distribution-title">
            <Icons.Analytics /> Menu Distribution by Category
          </h3>
          <div className="ad-food-distribution-content">
            <div className="ad-food-distribution-chart">
              <DonutChart 
                slices={foodByCategoryStats.filter(c => c.count > 0).map(c => ({
                  label: c.category,
                  value: c.count,
                  color: c.color
                }))}
                size={180}
              />
            </div>
            <div className="ad-food-distribution-bars">
              {foodByCategoryStats.map(({ category, count, color }) => (
                <div key={category} className="ad-food-dist-row">
                  <span className="ad-food-dist-label">{category}</span>
                  <div className="ad-food-dist-bar">
                    <div 
                      className="ad-food-dist-fill"
                      style={{ 
                        width: `${foodItems.length > 0 ? (count / foodItems.length) * 100 : 0}%`,
                        background: color 
                      }}
                    />
                  </div>
                  <span className="ad-food-dist-count">{count}</span>
                  <span className="ad-food-dist-pct">
                    {foodItems.length > 0 ? Math.round((count / foodItems.length) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // News computed data
  const newsStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: newsItems.length,
      today: newsItems.filter(n => new Date(n.createdAt) >= today).length,
      thisWeek: newsItems.filter(n => new Date(n.createdAt) >= thisWeek).length,
      thisMonth: newsItems.filter(n => new Date(n.createdAt) >= thisMonth).length,
    };
  }, [newsItems]);

  const filteredNewsItems = useMemo(() => {
    let filtered = [...newsItems];

    // Apply time filter
    if (newsTimeFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      if (newsTimeFilter === "today") {
        filtered = filtered.filter(n => new Date(n.createdAt) >= today);
      } else if (newsTimeFilter === "week") {
        filtered = filtered.filter(n => new Date(n.createdAt) >= thisWeek);
      } else if (newsTimeFilter === "month") {
        filtered = filtered.filter(n => new Date(n.createdAt) >= thisMonth);
      }
    }

    // Apply search filter
    if (newsSearch.trim()) {
      const query = newsSearch.toLowerCase();
      filtered = filtered.filter(
        n => n.title?.toLowerCase().includes(query) || n.description?.toLowerCase().includes(query)
      );
    }

    // Sort by most recent first
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [newsItems, newsTimeFilter, newsSearch]);

  // Lost & Found statistics
  const lnfStats = useMemo(() => {
    const lost = lostNFound.filter(item => item.category === "Lost");
    const found = lostNFound.filter(item => item.category === "Found");
    const open = lostNFound.filter(item => item.status === "Open");
    const resolved = lostNFound.filter(item => item.status === "Resolved");

    return {
      total: lostNFound.length,
      lost: lost.length,
      found: found.length,
      open: open.length,
      resolved: resolved.length,
      resolutionRate: lostNFound.length > 0 ? Math.round((resolved.length / lostNFound.length) * 100) : 0,
    };
  }, [lostNFound]);

  // Lost & Found category distribution for chart
  const lnfCategoryData = useMemo(() => {
    return [
      { label: "Lost Items", value: lnfStats.lost, color: "#ef4444" },
      { label: "Found Items", value: lnfStats.found, color: "#22c55e" },
    ];
  }, [lnfStats]);

  // Lost & Found status distribution for chart
  const lnfStatusData = useMemo(() => {
    return [
      { label: "Open", value: lnfStats.open, color: "#f59e0b" },
      { label: "Resolved", value: lnfStats.resolved, color: "#22c55e" },
    ];
  }, [lnfStats]);

  // Filtered Lost & Found items
  const filteredLnfItems = useMemo(() => {
    let filtered = [...lostNFound];

    // Apply category filter
    if (lnfCategoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === lnfCategoryFilter);
    }

    // Apply status filter
    if (lnfStatusFilter !== "all") {
      filtered = filtered.filter(item => item.status === lnfStatusFilter);
    }

    // Apply search filter
    if (lnfSearch.trim()) {
      const query = lnfSearch.toLowerCase();
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query) ||
        item.trainNumber?.toString().includes(query)
      );
    }

    // Sort by most recent first
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [lostNFound, lnfCategoryFilter, lnfStatusFilter, lnfSearch]);

  // Emergency statistics
  const emgStats = useMemo(() => {
    const active = emergencies.filter(e => e.status === "Active");
    const inProcess = emergencies.filter(e => e.status === "InProcess");
    const resolved = emergencies.filter(e => e.status === "Resolved");

    return {
      total: emergencies.length,
      active: active.length,
      inProcess: inProcess.length,
      resolved: resolved.length,
      resolutionRate: emergencies.length > 0 ? Math.round((resolved.length / emergencies.length) * 100) : 0,
    };
  }, [emergencies]);

  // Emergency status distribution for chart
  const emgStatusData = useMemo(() => {
    return [
      { label: "Active", value: emgStats.active, color: "#ef4444" },
      { label: "In Process", value: emgStats.inProcess, color: "#f59e0b" },
      { label: "Resolved", value: emgStats.resolved, color: "#22c55e" },
    ];
  }, [emgStats]);

  // Filtered Emergency items
  const filteredEmergencies = useMemo(() => {
    let filtered = [...emergencies];

    // Apply status filter
    if (emgStatusFilter !== "all") {
      filtered = filtered.filter(e => e.status === emgStatusFilter);
    }

    // Apply search filter
    if (emgSearch.trim()) {
      const query = emgSearch.toLowerCase();
      filtered = filtered.filter(e =>
        e.username?.toLowerCase().includes(query) ||
        e.seatNumber?.toLowerCase().includes(query) ||
        e.trainNumber?.toString().includes(query)
      );
    }

    // Sort by most recent first
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [emergencies, emgStatusFilter, emgSearch]);

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

  const renderNews = () => (
    <div className="ad-news">
      {/* Header */}
      <div className="ad-news-header">
        <div className="ad-news-title-section">
          <h2 className="ad-news-title">News & Announcements</h2>
          <p className="ad-news-subtitle">
            Keep passengers informed on Train {adminTrainNo}
          </p>
        </div>
        <button className="ad-btn ad-btn-primary ad-btn-lg" onClick={() => setShowAddNews(true)}>
          <Icons.Plus /> Publish News
        </button>
      </div>

      {/* Stats Row */}
      <div className="ad-news-stats-row">
        <div 
          className={`ad-news-stat-card ${newsTimeFilter === "all" ? "ad-news-stat-active" : ""}`}
          onClick={() => setNewsTimeFilter("all")}
        >
          <div className="ad-news-stat-icon" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
            <Icons.News />
          </div>
          <div className="ad-news-stat-content">
            <span className="ad-news-stat-value">{newsStats.total}</span>
            <span className="ad-news-stat-label">Total Posts</span>
          </div>
          {newsTimeFilter === "all" && <span className="ad-news-stat-check">✓</span>}
        </div>
        <div 
          className={`ad-news-stat-card ${newsTimeFilter === "today" ? "ad-news-stat-active" : ""}`}
          onClick={() => setNewsTimeFilter(newsTimeFilter === "today" ? "all" : "today")}
        >
          <div className="ad-news-stat-icon" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="ad-news-stat-content">
            <span className="ad-news-stat-value">{newsStats.today}</span>
            <span className="ad-news-stat-label">Today</span>
          </div>
          {newsTimeFilter === "today" && <span className="ad-news-stat-check">✓</span>}
        </div>
        <div 
          className={`ad-news-stat-card ${newsTimeFilter === "week" ? "ad-news-stat-active" : ""}`}
          onClick={() => setNewsTimeFilter(newsTimeFilter === "week" ? "all" : "week")}
        >
          <div className="ad-news-stat-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="ad-news-stat-content">
            <span className="ad-news-stat-value">{newsStats.thisWeek}</span>
            <span className="ad-news-stat-label">This Week</span>
          </div>
          {newsTimeFilter === "week" && <span className="ad-news-stat-check">✓</span>}
        </div>
        <div 
          className={`ad-news-stat-card ${newsTimeFilter === "month" ? "ad-news-stat-active" : ""}`}
          onClick={() => setNewsTimeFilter(newsTimeFilter === "month" ? "all" : "month")}
        >
          <div className="ad-news-stat-icon" style={{ background: "linear-gradient(135deg, #a855f7, #9333ea)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
              <path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>
              <path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>
            </svg>
          </div>
          <div className="ad-news-stat-content">
            <span className="ad-news-stat-value">{newsStats.thisMonth}</span>
            <span className="ad-news-stat-label">This Month</span>
          </div>
          {newsTimeFilter === "month" && <span className="ad-news-stat-check">✓</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="ad-news-controls">
        <div className="ad-news-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ad-news-search-icon">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Search news by title, description..."
            value={newsSearch}
            onChange={(e) => setNewsSearch(e.target.value)}
            className="ad-news-search-input"
          />
          {newsSearch && (
            <button className="ad-news-search-clear" onClick={() => setNewsSearch("")}>×</button>
          )}
        </div>
        <div className="ad-news-controls-right">
          <select
            value={newsTimeFilter}
            onChange={(e) => setNewsTimeFilter(e.target.value)}
            className="ad-news-filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <div className="ad-news-view-toggle">
            <button 
              className={`ad-news-view-btn ${newsViewMode === "cards" ? "active" : ""}`}
              onClick={() => setNewsViewMode("cards")}
              title="Card View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button 
              className={`ad-news-view-btn ${newsViewMode === "table" ? "active" : ""}`}
              onClick={() => setNewsViewMode("table")}
              title="Table View"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="ad-news-results-info">
        <span>Showing <strong>{filteredNewsItems.length}</strong> of <strong>{newsItems.length}</strong> posts</span>
        {newsTimeFilter !== "all" && (
          <button className="ad-news-clear-filter" onClick={() => setNewsTimeFilter("all")}>
            Clear filter ×
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="ad-news-loading">
          <div className="ad-news-spinner"></div>
          <p>Loading news...</p>
        </div>
      ) : filteredNewsItems.length === 0 ? (
        <div className="ad-news-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="ad-news-empty-icon">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
            <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
          </svg>
          <h3>No News Found</h3>
          <p>
            {newsSearch || newsTimeFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Get started by publishing your first announcement"}
          </p>
          <button className="ad-btn ad-btn-primary" onClick={() => setShowAddNews(true)}>
            <Icons.Plus /> Publish News
          </button>
        </div>
      ) : newsViewMode === "cards" ? (
        <div className="ad-news-cards-grid">
          {filteredNewsItems.map((n) => (
            <div key={n._id} className="ad-news-card-item">
              <div className="ad-news-card-image">
                {n.imageUrl ? (
                  <img src={n.imageUrl} alt={n.title} />
                ) : (
                  <div className="ad-news-card-placeholder">
                    <Icons.News />
                  </div>
                )}
                <div className="ad-news-card-time">{getRelativeTime(n.createdAt)}</div>
              </div>
              <div className="ad-news-card-content">
                <h4 className="ad-news-card-title">{n.title}</h4>
                <p className="ad-news-card-desc">{n.description}</p>
                <div className="ad-news-card-footer">
                  <time className="ad-news-card-date">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {new Date(n.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </time>
                  <button 
                    className="ad-news-card-delete" 
                    onClick={() => deleteNews(n._id)}
                    title="Delete news"
                  >
                    <Icons.Delete />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ad-news-table-container">
          <table className="ad-news-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNewsItems.map((n) => (
                <tr key={n._id}>
                  <td>
                    <div className="ad-news-table-image">
                      {n.imageUrl ? (
                        <img src={n.imageUrl} alt={n.title} />
                      ) : (
                        <div className="ad-news-table-placeholder">
                          <Icons.News />
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="ad-news-table-title">{n.title}</span>
                  </td>
                  <td>
                    <span className="ad-news-table-desc">{n.description}</span>
                  </td>
                  <td>
                    <div className="ad-news-table-date">
                      <span className="ad-news-table-relative">{getRelativeTime(n.createdAt)}</span>
                      <span className="ad-news-table-full">
                        {new Date(n.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="ad-news-table-actions">
                      <button 
                        className="ad-news-table-action ad-news-table-action-delete"
                        onClick={() => deleteNews(n._id)}
                        title="Delete news"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Timeline */}
      {newsItems.length > 0 && (
        <div className="ad-news-timeline">
          <h3 className="ad-news-timeline-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Recent Activity Timeline
          </h3>
          <div className="ad-news-timeline-content">
            {newsItems.slice(0, 5).map((n, idx) => (
              <div key={n._id} className="ad-news-timeline-item">
                <div className="ad-news-timeline-dot" style={{ 
                  background: idx === 0 ? '#22c55e' : idx === 1 ? '#38bdf8' : '#94a3b8' 
                }} />
                <div className="ad-news-timeline-connector" />
                <div className="ad-news-timeline-card">
                  <div className="ad-news-timeline-header">
                    <span className="ad-news-timeline-time">{getRelativeTime(n.createdAt)}</span>
                    {idx === 0 && <span className="ad-news-timeline-badge">Latest</span>}
                  </div>
                  <h4>{n.title}</h4>
                  <p>{n.description.length > 100 ? n.description.substring(0, 100) + '...' : n.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderEmergency = () => (
    <div className="ad-emg">
      {/* Header */}
      <div className="ad-emg-header">
        <div className="ad-emg-title-section">
          <h2 className="ad-emg-title">Emergency Management</h2>
          <p className="ad-emg-subtitle">Monitor and respond to emergency alerts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="ad-emg-stats">
        <div className="ad-emg-stat-card">
          <div className="ad-emg-stat-icon ad-emg-stat-total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="ad-emg-stat-info">
            <span className="ad-emg-stat-value">{emgStats.total}</span>
            <span className="ad-emg-stat-label">Total Alerts</span>
          </div>
        </div>

        <div className="ad-emg-stat-card ad-emg-stat-card-active">
          <div className="ad-emg-stat-icon ad-emg-stat-active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="ad-emg-stat-info">
            <span className="ad-emg-stat-value">{emgStats.active}</span>
            <span className="ad-emg-stat-label">Active</span>
          </div>
        </div>

        <div className="ad-emg-stat-card">
          <div className="ad-emg-stat-icon ad-emg-stat-inprocess">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="ad-emg-stat-info">
            <span className="ad-emg-stat-value">{emgStats.inProcess}</span>
            <span className="ad-emg-stat-label">In Process</span>
          </div>
        </div>

        <div className="ad-emg-stat-card">
          <div className="ad-emg-stat-icon ad-emg-stat-resolved">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="ad-emg-stat-info">
            <span className="ad-emg-stat-value">{emgStats.resolved}</span>
            <span className="ad-emg-stat-label">Resolved</span>
          </div>
        </div>

        <div className="ad-emg-stat-card">
          <div className="ad-emg-stat-icon ad-emg-stat-rate">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20V10"/>
              <path d="M18 20V4"/>
              <path d="M6 20v-4"/>
            </svg>
          </div>
          <div className="ad-emg-stat-info">
            <span className="ad-emg-stat-value">{emgStats.resolutionRate}%</span>
            <span className="ad-emg-stat-label">Resolution Rate</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="ad-emg-controls">
        <div className="ad-emg-search-box">
          <svg className="ad-emg-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="ad-emg-search-input"
            placeholder="Search by user, seat, train..."
            value={emgSearch}
            onChange={(e) => setEmgSearch(e.target.value)}
          />
          {emgSearch && (
            <button className="ad-emg-search-clear" onClick={() => setEmgSearch("")}>×</button>
          )}
        </div>

        <div className="ad-emg-filters">
          <select
            className="ad-emg-filter-select"
            value={emgStatusFilter}
            onChange={(e) => setEmgStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="InProcess">In Process</option>
            <option value="Resolved">Resolved</option>
          </select>

          <div className="ad-emg-view-toggle">
            <button
              className={`ad-emg-view-btn ${emgViewMode === "cards" ? "active" : ""}`}
              onClick={() => setEmgViewMode("cards")}
              title="Card view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              className={`ad-emg-view-btn ${emgViewMode === "table" ? "active" : ""}`}
              onClick={() => setEmgViewMode("table")}
              title="Table view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="ad-emg-results-info">
        {emgSearch || emgStatusFilter !== "all"
          ? `Showing ${filteredEmergencies.length} of ${emergencies.length} alerts`
          : `${emergencies.length} total alerts`}
      </div>

      {/* Content */}
      {filteredEmergencies.length === 0 ? (
        <div className="ad-emg-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <h3>No emergency alerts</h3>
          <p>{emgSearch || emgStatusFilter !== "all" ? "Try adjusting your filters" : "No emergencies reported for this train"}</p>
        </div>
      ) : emgViewMode === "cards" ? (
        /* Cards View */
        <div className="ad-emg-grid">
          {filteredEmergencies.map((e) => (
            <div key={e._id} className={`ad-emg-card ${e.status === "Resolved" ? "resolved" : ""} ${e.status === "Active" ? "urgent" : ""}`}>
              <div className="ad-emg-card-header">
                <div className="ad-emg-card-alert-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <span className={`ad-emg-card-status ${e.status === "Active" ? "active" : e.status === "InProcess" ? "inprocess" : "resolved"}`}>
                  {e.status === "InProcess" ? "In Process" : e.status}
                </span>
              </div>
              <div className="ad-emg-card-content">
                <h4 className="ad-emg-card-user">{e.username}</h4>
                <div className="ad-emg-card-details">
                  <div className="ad-emg-card-detail">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                    </svg>
                    <span>Train #{e.trainNumber}</span>
                  </div>
                  <div className="ad-emg-card-detail">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
                      <rect x="9" y="9" width="6" height="6"/>
                      <line x1="9" y1="1" x2="9" y2="4"/>
                      <line x1="15" y1="1" x2="15" y2="4"/>
                      <line x1="9" y1="20" x2="9" y2="23"/>
                      <line x1="15" y1="20" x2="15" y2="23"/>
                      <line x1="20" y1="9" x2="23" y2="9"/>
                      <line x1="20" y1="14" x2="23" y2="14"/>
                      <line x1="1" y1="9" x2="4" y2="9"/>
                      <line x1="1" y1="14" x2="4" y2="14"/>
                    </svg>
                    <span>Seat {e.seatNumber}</span>
                  </div>
                </div>
                <div className="ad-emg-card-footer">
                  <span className="ad-emg-time">{getRelativeTime(e.createdAt)}</span>
                </div>
                {e.status === "Active" && (
                  <button
                    className="ad-emg-action-btn"
                    onClick={() => markEmergencyInProcess(e._id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Mark In Process
                  </button>
                )}
                {e.status === "InProcess" && (
                  <div className="ad-emg-waiting-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Waiting for user confirmation
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="ad-emg-table-wrapper">
          <table className="ad-emg-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Train</th>
                <th>Seat</th>
                <th>Status</th>
                <th>Reported</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmergencies.map((e) => (
                <tr key={e._id} className={e.status === "Resolved" ? "resolved" : e.status === "Active" ? "urgent" : ""}>
                  <td>
                    <div className="ad-emg-table-user">
                      <strong>{e.username}</strong>
                    </div>
                  </td>
                  <td>#{e.trainNumber}</td>
                  <td>{e.seatNumber}</td>
                  <td>
                    <span className={`ad-emg-table-status ${e.status === "Active" ? "active" : e.status === "InProcess" ? "inprocess" : "resolved"}`}>
                      {e.status === "InProcess" ? "In Process" : e.status}
                    </span>
                  </td>
                  <td>{getRelativeTime(e.createdAt)}</td>
                  <td>
                    {e.status === "Active" ? (
                      <button
                        className="ad-emg-table-action process"
                        onClick={() => markEmergencyInProcess(e._id)}
                        title="Mark as In Process"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                      </button>
                    ) : e.status === "InProcess" ? (
                      <span className="ad-emg-table-waiting">Awaiting user</span>
                    ) : (
                      <span className="ad-emg-table-done">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Distribution Chart */}
      {emergencies.length > 0 && (
        <div className="ad-emg-charts">
          <div className="ad-emg-chart-card">
            <h4 className="ad-emg-chart-title">Status Distribution</h4>
            <div className="ad-emg-chart-content">
              <DonutChart data={emgStatusData} size={140} />
              <div className="ad-emg-chart-legend">
                {emgStatusData.map((item, i) => (
                  <div key={i} className="ad-emg-legend-item">
                    <span className="ad-emg-legend-color" style={{ background: item.color }} />
                    <span className="ad-emg-legend-label">{item.label}</span>
                    <span className="ad-emg-legend-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ad-emg-chart-card ad-emg-rate-card">
            <h4 className="ad-emg-chart-title">Resolution Rate</h4>
            <div className="ad-emg-rate-content">
              <MiniGauge value={emgStats.resolutionRate} color={emgStats.resolutionRate >= 70 ? "#22c55e" : emgStats.resolutionRate >= 40 ? "#f59e0b" : "#ef4444"} />
              <p className="ad-emg-rate-desc">
                {emgStats.resolutionRate >= 70 ? "Great response!" : emgStats.resolutionRate >= 40 ? "Keep improving" : "Needs attention"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderLostNFound = () => (
    <div className="ad-lnf">
      {/* Header */}
      <div className="ad-lnf-header">
        <div className="ad-lnf-title-section">
          <h2 className="ad-lnf-title">Lost & Found</h2>
          <p className="ad-lnf-subtitle">Manage lost and found item reports</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="ad-lnf-stats">
        <div className="ad-lnf-stat-card">
          <div className="ad-lnf-stat-icon ad-lnf-stat-total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div className="ad-lnf-stat-info">
            <span className="ad-lnf-stat-value">{lnfStats.total}</span>
            <span className="ad-lnf-stat-label">Total Items</span>
          </div>
        </div>

        <div className="ad-lnf-stat-card">
          <div className="ad-lnf-stat-icon ad-lnf-stat-lost">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <path d="M11 8v6"/>
              <path d="M8 11h6"/>
            </svg>
          </div>
          <div className="ad-lnf-stat-info">
            <span className="ad-lnf-stat-value">{lnfStats.lost}</span>
            <span className="ad-lnf-stat-label">Lost Items</span>
          </div>
        </div>

        <div className="ad-lnf-stat-card">
          <div className="ad-lnf-stat-icon ad-lnf-stat-found">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <path d="m8 11 2 2 4-4"/>
            </svg>
          </div>
          <div className="ad-lnf-stat-info">
            <span className="ad-lnf-stat-value">{lnfStats.found}</span>
            <span className="ad-lnf-stat-label">Found Items</span>
          </div>
        </div>

        <div className="ad-lnf-stat-card">
          <div className="ad-lnf-stat-icon ad-lnf-stat-open">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="ad-lnf-stat-info">
            <span className="ad-lnf-stat-value">{lnfStats.open}</span>
            <span className="ad-lnf-stat-label">Open Cases</span>
          </div>
        </div>

        <div className="ad-lnf-stat-card">
          <div className="ad-lnf-stat-icon ad-lnf-stat-resolved">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="ad-lnf-stat-info">
            <span className="ad-lnf-stat-value">{lnfStats.resolved}</span>
            <span className="ad-lnf-stat-label">Resolved</span>
          </div>
        </div>

        <div className="ad-lnf-stat-card">
          <div className="ad-lnf-stat-icon ad-lnf-stat-rate">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20V10"/>
              <path d="M18 20V4"/>
              <path d="M6 20v-4"/>
            </svg>
          </div>
          <div className="ad-lnf-stat-info">
            <span className="ad-lnf-stat-value">{lnfStats.resolutionRate}%</span>
            <span className="ad-lnf-stat-label">Resolution Rate</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="ad-lnf-controls">
        <div className="ad-lnf-search-box">
          <svg className="ad-lnf-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="ad-lnf-search-input"
            placeholder="Search items..."
            value={lnfSearch}
            onChange={(e) => setLnfSearch(e.target.value)}
          />
          {lnfSearch && (
            <button className="ad-lnf-search-clear" onClick={() => setLnfSearch("")}>×</button>
          )}
        </div>

        <div className="ad-lnf-filters">
          <select
            className="ad-lnf-filter-select"
            value={lnfCategoryFilter}
            onChange={(e) => setLnfCategoryFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>

          <select
            className="ad-lnf-filter-select"
            value={lnfStatusFilter}
            onChange={(e) => setLnfStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="Resolved">Resolved</option>
          </select>

          <div className="ad-lnf-view-toggle">
            <button
              className={`ad-lnf-view-btn ${lnfViewMode === "cards" ? "active" : ""}`}
              onClick={() => setLnfViewMode("cards")}
              title="Card view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              className={`ad-lnf-view-btn ${lnfViewMode === "table" ? "active" : ""}`}
              onClick={() => setLnfViewMode("table")}
              title="Table view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="ad-lnf-results-info">
        {lnfSearch || lnfCategoryFilter !== "all" || lnfStatusFilter !== "all"
          ? `Showing ${filteredLnfItems.length} of ${lostNFound.length} items`
          : `${lostNFound.length} total items`}
      </div>

      {/* Content */}
      {filteredLnfItems.length === 0 ? (
        <div className="ad-lnf-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <h3>No items found</h3>
          <p>{lnfSearch || lnfCategoryFilter !== "all" || lnfStatusFilter !== "all" ? "Try adjusting your filters" : "No lost & found reports yet"}</p>
        </div>
      ) : lnfViewMode === "cards" ? (
        /* Cards View */
        <div className="ad-lnf-grid">
          {filteredLnfItems.map((item) => (
            <div key={item._id} className={`ad-lnf-card ${item.status === "Resolved" ? "resolved" : ""}`}>
              <div className="ad-lnf-card-image">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} />
                ) : (
                  <div className="ad-lnf-card-no-image">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                )}
                <span className={`ad-lnf-card-badge ${item.category === "Lost" ? "lost" : "found"}`}>
                  {item.category}
                </span>
              </div>
              <div className="ad-lnf-card-content">
                <h4 className="ad-lnf-card-title">{item.title}</h4>
                <p className="ad-lnf-card-desc">{item.description}</p>
                <div className="ad-lnf-card-details">
                  <div className="ad-lnf-card-detail">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{item.location || "Not specified"}</span>
                  </div>
                  <div className="ad-lnf-card-detail">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                    </svg>
                    <span>Train #{item.trainNumber || "N/A"}</span>
                  </div>
                  <div className="ad-lnf-card-detail">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                    <span>{item.contactInfo || "No contact"}</span>
                  </div>
                </div>
                <div className="ad-lnf-card-footer">
                  <span className={`ad-lnf-status ${item.status === "Resolved" ? "resolved" : "open"}`}>
                    {item.status}
                  </span>
                  <span className="ad-lnf-time">{getRelativeTime(item.createdAt)}</span>
                </div>
                {item.status === "Open" && (
                  <button
                    className="ad-lnf-resolve-btn"
                    onClick={() => updateLostFoundStatus(item._id, "Resolved")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="ad-lnf-table-wrapper">
          <table className="ad-lnf-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Item</th>
                <th>Type</th>
                <th>Location</th>
                <th>Train</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLnfItems.map((item) => (
                <tr key={item._id} className={item.status === "Resolved" ? "resolved" : ""}>
                  <td>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="ad-lnf-table-img" />
                    ) : (
                      <div className="ad-lnf-table-no-img">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="ad-lnf-table-item">
                      <strong>{item.title}</strong>
                      <span className="ad-lnf-table-desc">{item.description}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`ad-lnf-table-badge ${item.category === "Lost" ? "lost" : "found"}`}>
                      {item.category}
                    </span>
                  </td>
                  <td>{item.location || "—"}</td>
                  <td>#{item.trainNumber || "N/A"}</td>
                  <td>{item.contactInfo || "—"}</td>
                  <td>
                    <span className={`ad-lnf-table-status ${item.status === "Resolved" ? "resolved" : "open"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{getRelativeTime(item.createdAt)}</td>
                  <td>
                    {item.status === "Open" ? (
                      <button
                        className="ad-lnf-table-action resolve"
                        onClick={() => updateLostFoundStatus(item._id, "Resolved")}
                        title="Mark as Resolved"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </button>
                    ) : (
                      <button
                        className="ad-lnf-table-action reopen"
                        onClick={() => updateLostFoundStatus(item._id, "Open")}
                        title="Reopen Case"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 4v6h-6"/>
                          <path d="M1 20v-6h6"/>
                          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Distribution Charts */}
      {lostNFound.length > 0 && (
        <div className="ad-lnf-charts">
          <div className="ad-lnf-chart-card">
            <h4 className="ad-lnf-chart-title">Category Distribution</h4>
            <div className="ad-lnf-chart-content">
              <DonutChart data={lnfCategoryData} size={140} />
              <div className="ad-lnf-chart-legend">
                {lnfCategoryData.map((item, i) => (
                  <div key={i} className="ad-lnf-legend-item">
                    <span className="ad-lnf-legend-color" style={{ background: item.color }} />
                    <span className="ad-lnf-legend-label">{item.label}</span>
                    <span className="ad-lnf-legend-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ad-lnf-chart-card">
            <h4 className="ad-lnf-chart-title">Status Distribution</h4>
            <div className="ad-lnf-chart-content">
              <DonutChart data={lnfStatusData} size={140} />
              <div className="ad-lnf-chart-legend">
                {lnfStatusData.map((item, i) => (
                  <div key={i} className="ad-lnf-legend-item">
                    <span className="ad-lnf-legend-color" style={{ background: item.color }} />
                    <span className="ad-lnf-legend-label">{item.label}</span>
                    <span className="ad-lnf-legend-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ad-lnf-chart-card ad-lnf-rate-card">
            <h4 className="ad-lnf-chart-title">Resolution Rate</h4>
            <div className="ad-lnf-rate-content">
              <MiniGauge value={lnfStats.resolutionRate} color={lnfStats.resolutionRate >= 70 ? "#22c55e" : lnfStats.resolutionRate >= 40 ? "#f59e0b" : "#ef4444"} />
              <p className="ad-lnf-rate-desc">
                {lnfStats.resolutionRate >= 70 ? "Great progress!" : lnfStats.resolutionRate >= 40 ? "Room for improvement" : "Needs attention"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderFeedback = () => (
    <div className="ad-section">
      <div className="ad-section-header">
        <div>
          <h2 className="ad-section-title">Passenger Feedback</h2>
          <p className="ad-subtitle">{feedbacks.length} feedback submissions</p>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <p className="ad-muted">No feedback received yet.</p>
      ) : (
        <div className="ad-feedback-list">
          {feedbacks.map((fb) => (
            <div key={fb._id} className="ad-feedback-card">
              <div className="ad-feedback-header">
                <div>
                  <strong>{fb.name}</strong>
                  <span className="ad-muted"> ({fb.email})</span>
                </div>
                <span className="ad-rating">
                  {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
                  <span className="ad-rating-num">{fb.rating}/5</span>
                </span>
              </div>
              <p className="ad-feedback-comment">{fb.comment}</p>
              <time className="ad-muted">{fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ""}</time>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview": return renderOverview();
      case "analytics": return renderAnalytics();
      case "staff": return renderStaff();
      case "commands": return renderCommands();
      case "complaints": return renderComplaints();
      case "orders": return renderOrders();
      case "food": return renderFood();
      case "news": return renderNews();
      case "emergency": return renderEmergency();
      case "lostnfound": return renderLostNFound();
      case "feedback": return renderFeedback();
      default: return renderOverview();
    }
  };

  /* ═══════════════════════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className={`admin-dashboard ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-header">
          <div className="ad-logo">
            <Icons.Train />
            {!sidebarCollapsed && (
              <div className="ad-logo-text">
                <span>Admin Panel</span>
                <span className="ad-train-number">Train: {adminTrainNo || "—"}</span>
              </div>
            )}
          </div>
          <button className="ad-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Icons.Menu />
          </button>
        </div>

        <nav className="ad-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`ad-nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => setActiveSection(item.id)}
              title={item.label}
            >
              <item.icon />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <button className="ad-nav-item" onClick={toggleTheme} title={theme === "light" ? "Dark Mode" : "Light Mode"}>
            {theme === "light" ? <Icons.Moon /> : <Icons.Sun />}
            {!sidebarCollapsed && <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>}
          </button>
          <button className="ad-nav-item logout" onClick={logout} title="Logout">
            <Icons.Logout />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ad-main">
        <div className="ad-content-area">
          {renderContent()}
        </div>
      </main>

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="ad-modal-overlay" onClick={() => setEditingStaff(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Staff: {editingStaff.name}</h3>
            <div className="ad-form-group">
              <label>Name</label>
              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="ad-input" />
            </div>
            <div className="ad-form-group">
              <label>Role</label>
              <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="ad-select">
                {["Cleaning", "Catering", "Security", "Maintenance", "Medical"].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="ad-form-group">
              <label>Phone</label>
              <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="ad-input" />
            </div>
            <div className="ad-form-group">
              <label>Train Number</label>
              <select value={editForm.trainNumber} onChange={(e) => setEditForm({ ...editForm, trainNumber: e.target.value })} className="ad-select">
                <option value="">Select train</option>
                {trains.map((t) => (
                  <option key={t._id || t.id} value={t.trainNumber}>{t.trainNumber}</option>
                ))}
              </select>
            </div>
            <div className="ad-modal-actions">
              <button className="ad-btn ad-btn-primary" onClick={saveStaffEdit}>Save</button>
              <button className="ad-btn" onClick={() => setEditingStaff(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Command Modal */}
      {commandTarget && (
        <div className="ad-modal-overlay" onClick={() => setCommandTarget(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{commandTarget._id ? `Send Command to ${commandTarget.name}` : "New Command"}</h3>
            {!commandTarget._id && (
              <div className="ad-form-group">
                <label>Select Staff Member</label>
                <select 
                  value={commandTarget._id} 
                  onChange={(e) => {
                    const staff = staffList.find(s => s._id === e.target.value);
                    if (staff) setCommandTarget(staff);
                  }} 
                  className="ad-select"
                >
                  <option value="">-- Select Staff --</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
            )}
            <div className="ad-form-group">
              <label>Title</label>
              <input placeholder="e.g. Urgent cleaning needed" value={commandForm.title} onChange={(e) => setCommandForm({ ...commandForm, title: e.target.value })} className="ad-input" />
            </div>
            <div className="ad-form-group">
              <label>Message</label>
              <textarea rows={3} placeholder="Detailed instructions…" value={commandForm.message} onChange={(e) => setCommandForm({ ...commandForm, message: e.target.value })} className="ad-textarea" />
            </div>
            <div className="ad-form-group">
              <label>Priority</label>
              <select value={commandForm.priority} onChange={(e) => setCommandForm({ ...commandForm, priority: e.target.value })} className="ad-select">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="ad-modal-actions">
              <button className="ad-btn ad-btn-primary" onClick={sendCommand}>Send</button>
              <button className="ad-btn" onClick={() => setCommandTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Food Modal */}
      {showAddFood && (
        <div className="ad-modal-overlay" onClick={() => setShowAddFood(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Food Item</h3>
            <form onSubmit={addFood}>
              <div className="ad-form-group">
                <label>Name</label>
                <input required value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} className="ad-input" />
              </div>
              <div className="ad-form-group">
                <label>Price (₹)</label>
                <input type="number" required value={foodForm.price} onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })} className="ad-input" />
              </div>
              <div className="ad-form-group">
                <label>Category</label>
                <select value={foodForm.category} onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })} className="ad-select">
                  <option value="">Select category</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>
              <div className="ad-form-group">
                <label>
                  <input type="checkbox" checked={foodForm.isAvailable} onChange={(e) => setFoodForm({ ...foodForm, isAvailable: e.target.checked })} />
                  {" "}Available
                </label>
              </div>
              <div className="ad-form-group">
                <label>Image</label>
                <input type="file" accept="image/*" onChange={(e) => setFoodForm({ ...foodForm, image: e.target.files?.[0] || null })} className="ad-input" />
              </div>
              <div className="ad-modal-actions">
                <button type="submit" className="ad-btn ad-btn-primary">Add Food</button>
                <button type="button" className="ad-btn" onClick={() => setShowAddFood(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add News Modal */}
      {showAddNews && (
        <div className="ad-modal-overlay" onClick={() => setShowAddNews(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Publish News</h3>
            <form onSubmit={addNews}>
              <div className="ad-form-group">
                <label>Headline</label>
                <input required value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} className="ad-input" />
              </div>
              <div className="ad-form-group">
                <label>Description</label>
                <textarea rows={4} required value={newsForm.description} onChange={(e) => setNewsForm({ ...newsForm, description: e.target.value })} className="ad-textarea" />
              </div>
              <div className="ad-form-group">
                <label>Image (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setNewsForm({ ...newsForm, image: e.target.files?.[0] || null })} className="ad-input" />
              </div>
              <div className="ad-modal-actions">
                <button type="submit" className="ad-btn ad-btn-primary">Publish</button>
                <button type="button" className="ad-btn" onClick={() => setShowAddNews(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
