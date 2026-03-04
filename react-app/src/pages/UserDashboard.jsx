import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { clearPassengerToken } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";
import "./UserDashboard.css";

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
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Image: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════
   NAVIGATION ITEMS
   ═══════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Icons.Dashboard },
  { id: "complaints", label: "Complaints", icon: Icons.Complaints },
  { id: "orders", label: "Food Orders", icon: Icons.Orders },
  { id: "news", label: "News", icon: Icons.News },
  { id: "emergency", label: "Emergency", icon: Icons.Emergency },
  { id: "lostnfound", label: "Lost & Found", icon: Icons.LostFound },
  { id: "feedback", label: "Feedback", icon: Icons.Feedback },
];

/* ═══════════════════════════════════════════════════════════
   MAIN USER DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════ */
const UserDashboard = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isAuthenticated = useSelector((state) => state.auth.isPassengerAuthenticated);
  const passengerTrainNo = useSelector((state) => state.auth.passengerTrainNo);

  // UI State
  const [activeSection, setActiveSection] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  // Data states
  const [complaints, setComplaints] = useState([]);
  const [orders, setOrders] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [lostNFound, setLostNFound] = useState([]);
  const [allTrainLnF, setAllTrainLnF] = useState([]);
  const [cart, setCart] = useState([]);

  // Form states
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    pnr: "", bogieNumber: "", seatNumber: "", description: "", issueDomain: "Cleanliness", image: null
  });
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({ seatNumber: "" });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ name: "", email: "", rating: 5, comment: "" });
  const [showLnfForm, setShowLnfForm] = useState(false);
  const [lnfForm, setLnfForm] = useState({ title: "", description: "", category: "Lost", location: "", image: null });

  // Filter states
  const [foodCategory, setFoodCategory] = useState("all");
  const [foodSearch, setFoodSearch] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [lnfTab, setLnfTab] = useState("all"); // "all" or "my"

  /* ── FETCH FUNCTIONS ── */
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/user/profile`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUsername(data.user?.username || "User");
      } else {
        dispatch(clearPassengerToken());
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
    }
  }, [apiBase, dispatch, navigate]);

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/complaint/my-complaints-history`, { credentials: "include" });
      const data = await res.json();
      // Backend returns array directly from getMyAllComplaints
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/catering/my-orders-history`, { credentials: "include" });
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

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
      const res = await fetch(`${apiBase}/emergency/my-emergencies`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setEmergencies(data.data || []);
      } else {
        setEmergencies([]);
      }
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

  const fetchLostNFound = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/lostnfound/myitems`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setLostNFound(data.items || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

  const fetchAllTrainLnF = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/lostnfound`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setAllTrainLnF(data.items || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserProfile(),
        fetchComplaints(),
        fetchOrders(),
        fetchFood(),
        fetchNews(),
        fetchEmergencies(),
        fetchLostNFound(),
        fetchAllTrainLnF(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [isAuthenticated, navigate, fetchUserProfile, fetchComplaints, fetchOrders, fetchFood, fetchNews, fetchEmergencies, fetchLostNFound, fetchAllTrainLnF]);

  // Botpress chatbot
  useEffect(() => {
    const script1 = document.createElement("script");
    script1.src = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src = "https://files.bpcontent.cloud/2026/02/15/17/20260215171709-IBMUNH6D.js";
    script2.defer = true;
    document.body.appendChild(script2);

    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
      const botContainer = document.getElementById('bp-web-widget');
      if (botContainer) botContainer.remove();
    };
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${apiBase}/user/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    dispatch(clearPassengerToken());
    navigate("/login");
  };

  /* ── ACTION FUNCTIONS ── */
  const submitComplaint = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("pnr", complaintForm.pnr);
      formData.append("bogieNumber", complaintForm.bogieNumber);
      formData.append("seatNumber", complaintForm.seatNumber);
      formData.append("description", complaintForm.description);
      formData.append("issueDomain", complaintForm.issueDomain);
      if (complaintForm.image) formData.append("image", complaintForm.image);

      const res = await fetch(`${apiBase}/complaint/submit-complaint`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setShowComplaintForm(false);
        setComplaintForm({ pnr: "", bogieNumber: "", seatNumber: "", description: "", issueDomain: "Cleanliness", image: null });
        fetchComplaints();
      } else {
        alert(data.message || data.error || "Failed to submit complaint");
      }
    } catch (err) {
      alert("Error submitting complaint");
    }
  };

  const submitEmergency = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/emergency/postEmg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, seatNumber: emergencyForm.seatNumber }),
      });
      const data = await res.json();
      if (data.message) {
        setShowEmergencyForm(false);
        setEmergencyForm({ seatNumber: "" });
        fetchEmergencies();
        alert("Emergency request sent!");
      } else {
        alert(data.error || "Failed to submit emergency");
      }
    } catch (err) {
      alert("Error submitting emergency");
    }
  };

  const resolveEmergency = async (id) => {
    try {
      const res = await fetch(`${apiBase}/emergency/${id}/resolve`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) fetchEmergencies();
      else alert(data.message || "Failed to resolve");
    } catch (err) {
      alert("Error resolving emergency");
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiBase}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowFeedbackForm(false);
        setFeedbackForm({ name: "", email: "", rating: 5, comment: "" });
        alert("Thank you for your feedback!");
      } else {
        alert(data.message || "Failed to submit feedback");
      }
    } catch (err) {
      alert("Error submitting feedback");
    }
  };

  const submitLostFound = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", lnfForm.title);
      formData.append("description", lnfForm.description);
      formData.append("category", lnfForm.category);
      formData.append("location", lnfForm.location);
      if (lnfForm.image) formData.append("image", lnfForm.image);

      const res = await fetch(`${apiBase}/lostnfound`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setShowLnfForm(false);
        setLnfForm({ title: "", description: "", category: "Lost", location: "", image: null });
        fetchLostNFound();
        fetchAllTrainLnF();
      } else {
        alert(data.message || "Failed to submit");
      }
    } catch (err) {
      alert("Error submitting lost & found report");
    }
  };

  const markLnfResolved = async (id) => {
    try {
      const res = await fetch(`${apiBase}/lostnfound/${id}/resolve`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        fetchLostNFound();
        fetchAllTrainLnF();
      } else {
        alert(data.message || "Failed to resolve");
      }
    } catch (err) {
      alert("Error resolving item");
    }
  };

  const handleSatisfaction = async (id, satisfied) => {
    try {
      const res = await fetch(`${apiBase}/complaint/api/complaints/${id}/satisfaction`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ satisfied }),
      });
      const data = await res.json();
      if (data.success) {
        fetchComplaints();
        alert(satisfied ? "Thank you for confirming!" : "Complaint reopened for further review.");
      } else {
        alert(data.error || data.message || "Failed to update");
      }
    } catch (err) {
      console.error("Satisfaction error:", err);
      alert("Error updating satisfaction");
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c._id === item._id);
    if (existing) {
      setCart(cart.map(c => c._id === item._id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c._id !== id));
  };

  const updateCartQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(cart.map(c => c._id === id ? { ...c, qty } : c));
  };

  const placeOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    if (!deliveryAddress.trim()) return alert("Please enter delivery address (seat/coach number)");
    try {
      const res = await fetch(`${apiBase}/catering/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: cart.map(c => ({ foodItem: c._id, quantity: c.qty })),
          deliveryAddress: deliveryAddress.trim(),
          notes: orderNotes.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCart([]);
        setDeliveryAddress("");
        setOrderNotes("");
        fetchOrders();
        alert(`Order placed successfully! Your OTP: ${data.data?.otp || 'Check order details'}`);
      } else {
        alert(data.message || "Failed to place order");
      }
    } catch (err) {
      alert("Error placing order");
    }
  };

  /* ── COMPUTED DATA ── */
  const filteredFood = useMemo(() => {
    let items = foodItems.filter(f => f.isAvailable);
    if (foodCategory !== "all") {
      items = items.filter(f => f.category === foodCategory);
    }
    if (foodSearch.trim()) {
      const query = foodSearch.toLowerCase();
      items = items.filter(f => f.name.toLowerCase().includes(query));
    }
    return items;
  }, [foodItems, foodCategory, foodSearch]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, c) => sum + (c.price * c.qty), 0);
  }, [cart]);

  const complaintStats = useMemo(() => {
    const pending = complaints.filter(c => c.status === "Pending").length;
    const resolved = complaints.filter(c => c.status === "Resolved").length;
    const awaiting = complaints.filter(c => c.status === "AwaitingConfirmation").length;
    return { total: complaints.length, pending, resolved, awaiting };
  }, [complaints]);

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

  const getStatusColor = (status) => {
    const colors = {
      // Complaint statuses
      Pending: "#f59e0b",
      Resolved: "#22c55e",
      AwaitingConfirmation: "#3b82f6",
      // Emergency statuses
      Active: "#ef4444",
      InProcess: "#f59e0b",
      // Lost & Found
      Open: "#f59e0b",
      // Catering order statuses
      pending: "#f59e0b",
      preparing: "#3b82f6",
      "out for delivery": "#8b5cf6",
      delivered: "#22c55e",
      cancelled: "#ef4444",
    };
    return colors[status] || "#64748b";
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER FUNCTIONS
     ═══════════════════════════════════════════════════════════ */

  const renderHome = () => (
    <div className="ud-home">
      <div className="ud-welcome-card">
        <div className="ud-welcome-content">
          <h1>Welcome back, {username}!</h1>
          <p>Train #{passengerTrainNo || "N/A"}</p>
        </div>
        <div className="ud-welcome-icon">
          <Icons.Train />
        </div>
      </div>

      <div className="ud-quick-stats">
        <div className="ud-stat-card" onClick={() => setActiveSection("complaints")}>
          <div className="ud-stat-icon complaints">
            <Icons.Complaints />
          </div>
          <div className="ud-stat-info">
            <span className="ud-stat-value">{complaintStats.total}</span>
            <span className="ud-stat-label">My Complaints</span>
          </div>
        </div>
        <div className="ud-stat-card" onClick={() => setActiveSection("orders")}>
          <div className="ud-stat-icon orders">
            <Icons.Orders />
          </div>
          <div className="ud-stat-info">
            <span className="ud-stat-value">{orders.length}</span>
            <span className="ud-stat-label">Food Orders</span>
          </div>
        </div>
        <div className="ud-stat-card" onClick={() => setActiveSection("emergency")}>
          <div className="ud-stat-icon emergency">
            <Icons.Emergency />
          </div>
          <div className="ud-stat-info">
            <span className="ud-stat-value">{emergencies.filter(e => e.status === "Active" || e.status === "InProcess").length}</span>
            <span className="ud-stat-label">Active Alerts</span>
          </div>
        </div>
        <div className="ud-stat-card" onClick={() => setActiveSection("lostnfound")}>
          <div className="ud-stat-icon lostnfound">
            <Icons.LostFound />
          </div>
          <div className="ud-stat-info">
            <span className="ud-stat-value">{lostNFound.filter(l => l.status === "Open").length}</span>
            <span className="ud-stat-label">Open Reports</span>
          </div>
        </div>
      </div>

      <div className="ud-quick-actions">
        <h3>Quick Actions</h3>
        <div className="ud-actions-grid">
          <button className="ud-action-btn" onClick={() => { setActiveSection("complaints"); setShowComplaintForm(true); }}>
            <Icons.Complaints />
            <span>File Complaint</span>
          </button>
          <button className="ud-action-btn" onClick={() => setActiveSection("orders")}>
            <Icons.Food />
            <span>Order Food</span>
          </button>
          <button className="ud-action-btn emergency" onClick={() => { setActiveSection("emergency"); setShowEmergencyForm(true); }}>
            <Icons.Emergency />
            <span>Emergency</span>
          </button>
          <button className="ud-action-btn" onClick={() => { setActiveSection("feedback"); setShowFeedbackForm(true); }}>
            <Icons.Feedback />
            <span>Give Feedback</span>
          </button>
        </div>
      </div>

      {/* Latest News Preview */}
      <div className="ud-news-preview">
        <div className="ud-section-header">
          <h3>Latest News</h3>
          <button className="ud-link-btn" onClick={() => setActiveSection("news")}>View All</button>
        </div>
        <div className="ud-news-list">
          {newsItems.slice(0, 3).map(n => (
            <div key={n._id} className="ud-news-item">
              {n.imageUrl && <img src={n.imageUrl} alt={n.title} />}
              <div className="ud-news-item-content">
                <h4>{n.title}</h4>
                <p>{n.description?.substring(0, 100)}...</p>
                <span className="ud-news-time">{getRelativeTime(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderComplaints = () => (
    <div className="ud-complaints">
      <div className="ud-section-header">
        <div>
          <h2>My Complaints</h2>
          <p className="ud-subtitle">Track and manage your complaint submissions</p>
        </div>
        <button className="ud-btn ud-btn-primary" onClick={() => setShowComplaintForm(true)}>
          <Icons.Plus /> New Complaint
        </button>
      </div>

      {/* Stats Row */}
      <div className="ud-stats-row">
        <div className="ud-stat-box">
          <div className="icon total">
            <Icons.Complaints />
          </div>
          <div className="info">
            <span className="value">{complaintStats.total}</span>
            <span className="label">Total Complaints</span>
          </div>
        </div>
        <div className="ud-stat-box">
          <div className="icon pending">
            <Icons.Clock />
          </div>
          <div className="info">
            <span className="value">{complaintStats.pending}</span>
            <span className="label">Pending</span>
          </div>
        </div>
        <div className="ud-stat-box">
          <div className="icon awaiting">
            <Icons.Clock />
          </div>
          <div className="info">
            <span className="value">{complaintStats.awaiting}</span>
            <span className="label">Awaiting Confirmation</span>
          </div>
        </div>
        <div className="ud-stat-box">
          <div className="icon resolved">
            <Icons.Check />
          </div>
          <div className="info">
            <span className="value">{complaintStats.resolved}</span>
            <span className="label">Resolved</span>
          </div>
        </div>
      </div>

      {complaints.length === 0 ? (
        <div className="ud-empty">
          <Icons.Complaints />
          <h3>No complaints yet</h3>
          <p>You haven't filed any complaints. Click the button above to submit one.</p>
        </div>
      ) : (
        <div className="ud-complaints-container">
          <div className="ud-complaints-table-header">
            <h3>All Complaints <span className="count">({complaints.length} total)</span></h3>
          </div>
          <div className="ud-table-wrap">
            <table className="ud-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Domain</th>
                  <th>Description</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div className={`ud-cell-image ${!c.linkurl ? 'empty' : ''}`}>
                        {c.linkurl ? (
                          <img src={c.linkurl} alt="Complaint" />
                        ) : (
                          <Icons.Image />
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="ud-badge domain">{c.issueDomain}</span>
                    </td>
                    <td>
                      <div className="ud-cell-description" title={c.description}>{c.description}</div>
                    </td>
                    <td>
                      <div className="ud-cell-meta">
                        <span className="ud-cell-primary">PNR: {c.pnr}</span>
                        <span className="secondary">Seat: {c.seatNumber} | Train: #{c.trainNumber}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`ud-badge ${c.status.toLowerCase().replace("awaitingconfirmation", "awaiting")}`}>
                        {c.status === "AwaitingConfirmation" ? "Awaiting" : c.status}
                      </span>
                    </td>
                    <td>
                      <span className="ud-cell-time">{getRelativeTime(c.createdAt)}</span>
                    </td>
                    <td>
                      {c.status === "AwaitingConfirmation" ? (
                        <div className="ud-table-actions">
                          <button className="ud-btn-sm ud-btn-success" onClick={() => handleSatisfaction(c._id, true)}>
                            Satisfied
                          </button>
                          <button className="ud-btn-sm ud-btn-warning" onClick={() => handleSatisfaction(c._id, false)}>
                            Not Satisfied
                          </button>
                        </div>
                      ) : (
                        <span className="ud-cell-time">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ud-table-footer">
            Showing {complaints.length} complaint{complaints.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="ud-orders">
      <div className="ud-section-header">
        <div>
          <h2>Food Orders</h2>
          <p className="ud-subtitle">Browse menu and order delicious meals</p>
        </div>
      </div>

      <div className="ud-orders-layout">
        {/* Menu Section */}
        <div className="ud-menu-section">
          <div className="ud-menu-controls">
            <div className="ud-search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search food..."
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
              />
            </div>
            <select value={foodCategory} onChange={(e) => setFoodCategory(e.target.value)} className="ud-select">
              <option value="all">All Categories</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snacks">Snacks</option>
              <option value="Beverages">Beverages</option>
            </select>
          </div>

          <div className="ud-menu-grid">
            {filteredFood.map(item => (
              <div key={item._id} className="ud-food-card">
                <div className="ud-food-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="ud-food-no-image"><Icons.Food /></div>
                  )}
                  <span className="ud-food-category-badge">{item.category}</span>
                </div>
                <div className="ud-food-info">
                  <h4>{item.name}</h4>
                  {item.description && <p className="ud-food-desc">{item.description}</p>}
                  <div className="ud-food-footer">
                    <span className="ud-food-price">₹{item.price}</span>
                    <button className="ud-add-btn" onClick={() => addToCart(item)}>
                      <span>Add</span>
                      <Icons.Plus />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="ud-cart-section">
          <h3>Your Cart ({cart.length})</h3>
          {cart.length === 0 ? (
            <p className="ud-cart-empty">Cart is empty</p>
          ) : (
            <>
              <div className="ud-cart-items">
                {cart.map(item => (
                  <div key={item._id} className="ud-cart-item">
                    <div className="ud-cart-item-info">
                      <span className="ud-cart-item-name">{item.name}</span>
                      <span className="ud-cart-item-price">₹{item.price}</span>
                    </div>
                    <div className="ud-cart-qty">
                      <button onClick={() => updateCartQty(item._id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateCartQty(item._id, item.qty + 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ud-cart-delivery">
                <div className="ud-form-group">
                  <label>Delivery Address *</label>
                  <input
                    type="text"
                    placeholder="e.g., Coach B3, Seat 24"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="ud-form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Any special instructions..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="ud-cart-total">
                <span>Total:</span>
                <span>₹{cartTotal}</span>
              </div>
              <button className="ud-btn ud-btn-primary ud-btn-full" onClick={placeOrder}>
                Place Order
              </button>
            </>
          )}
        </div>
      </div>

      {/* Order History */}
      {orders.length > 0 && (
        <div className="ud-order-history">
          <h3>Order History</h3>
          <div className="ud-orders-list">
            {orders.map(o => (
              <div key={o._id} className="ud-order-card">
                <div className="ud-order-header">
                  <span className="ud-order-id">Order #{o._id.slice(-6)}</span>
                  <span className="ud-order-status" style={{ background: `${getStatusColor(o.status)}20`, color: getStatusColor(o.status) }}>
                    {o.status}
                  </span>
                </div>
                <div className="ud-order-items">
                  {o.items?.map((item, i) => (
                    <span key={i}>{item.foodItem?.name || "Item"} x{item.quantity}</span>
                  ))}
                </div>
                <div className="ud-order-address">
                  <Icons.MapPin />
                  <span>{o.deliveryAddress}</span>
                </div>
                {o.status === "out for delivery" && o.otp && (
                  <div className="ud-order-otp">
                    <span className="otp-label">Delivery OTP:</span>
                    <span className="otp-code">{o.otp}</span>
                  </div>
                )}
                <div className="ud-order-footer">
                  <span className="ud-order-total">₹{o.totalPrice}</span>
                  <span className="ud-order-time">{getRelativeTime(o.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderNews = () => (
    <div className="ud-news">
      <div className="ud-section-header">
        <div>
          <h2>News & Announcements</h2>
          <p className="ud-subtitle">Stay updated with the latest information</p>
        </div>
      </div>

      {newsItems.length === 0 ? (
        <div className="ud-empty">
          <Icons.News />
          <h3>No news yet</h3>
          <p>Check back later for updates and announcements.</p>
        </div>
      ) : (
        <div className="ud-news-grid">
          {newsItems.map(n => (
            <article key={n._id} className="ud-news-card">
              {n.imageUrl && (
                <div className="ud-news-card-image">
                  <img src={n.imageUrl} alt={n.title} />
                </div>
              )}
              <div className="ud-news-card-content">
                <h3>{n.title}</h3>
                <p>{n.description}</p>
                <span className="ud-news-card-time">{getRelativeTime(n.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  const renderEmergency = () => (
    <div className="ud-emergency">
      <div className="ud-section-header">
        <div>
          <h2>Emergency Requests</h2>
          <p className="ud-subtitle">Request immediate assistance onboard</p>
        </div>
        <button className="ud-btn ud-btn-danger" onClick={() => setShowEmergencyForm(true)}>
          <Icons.Emergency /> Request Help
        </button>
      </div>

      <div className="ud-emergency-info">
        <div className="ud-info-icon">
          <Icons.Emergency />
        </div>
        <div>
          <h4>How it works</h4>
          <ol>
            <li>Submit an emergency request with your seat number</li>
            <li>Train admin will mark it as "In Process" when responding</li>
            <li>Once resolved, confirm by clicking "Resolved" button</li>
          </ol>
        </div>
      </div>

      {emergencies.length === 0 ? (
        <div className="ud-empty">
          <Icons.Check />
          <h3>No emergency requests</h3>
          <p>You have no active emergency requests.</p>
        </div>
      ) : (
        <div className="ud-emergency-list">
          {emergencies.map(e => (
            <div key={e._id} className={`ud-emergency-card ${e.status.toLowerCase()}`}>
              <div className="ud-emergency-icon">
                <Icons.Emergency />
              </div>
              <div className="ud-emergency-content">
                <div className="ud-emergency-header">
                  <span className="ud-emergency-seat">Seat: {e.seatNumber}</span>
                  <span className="ud-emergency-status" style={{ background: `${getStatusColor(e.status)}20`, color: getStatusColor(e.status) }}>
                    {e.status === "InProcess" ? "In Process" : e.status}
                  </span>
                </div>
                <span className="ud-emergency-time">{getRelativeTime(e.createdAt)}</span>
                {e.status === "InProcess" && (
                  <button className="ud-btn ud-btn-success ud-btn-sm" onClick={() => resolveEmergency(e._id)}>
                    <Icons.Check /> Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLostNFound = () => {
    const displayItems = lnfTab === "all" ? allTrainLnF : lostNFound;
    const lostCount = allTrainLnF.filter(i => i.category === "Lost" && i.status === "Open").length;
    const foundCount = allTrainLnF.filter(i => i.category === "Found" && i.status === "Open").length;

    return (
      <div className="ud-lostnfound">
        <div className="ud-section-header">
          <div>
            <h2>Lost & Found</h2>
            <p className="ud-subtitle">Report lost items or view found belongings on this train</p>
          </div>
          <button className="ud-btn ud-btn-primary" onClick={() => setShowLnfForm(true)}>
            <Icons.Plus /> Report Item
          </button>
        </div>

        {/* Stats Row */}
        <div className="ud-stats-row">
          <div className="ud-stat-box">
            <div className="icon total">
              <Icons.LostFound />
            </div>
            <div className="info">
              <span className="value">{allTrainLnF.length}</span>
              <span className="label">Total Reports</span>
            </div>
          </div>
          <div className="ud-stat-box">
            <div className="icon pending">
              <Icons.LostFound />
            </div>
            <div className="info">
              <span className="value">{lostCount}</span>
              <span className="label">Items Lost</span>
            </div>
          </div>
          <div className="ud-stat-box">
            <div className="icon resolved">
              <Icons.Check />
            </div>
            <div className="info">
              <span className="value">{foundCount}</span>
              <span className="label">Items Found</span>
            </div>
          </div>
          <div className="ud-stat-box">
            <div className="icon awaiting">
              <Icons.Complaints />
            </div>
            <div className="info">
              <span className="value">{lostNFound.length}</span>
              <span className="label">My Reports</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="ud-lnf-tabs">
          <button
            className={`ud-lnf-tab ${lnfTab === "all" ? "active" : ""}`}
            onClick={() => setLnfTab("all")}
          >
            All Train Items ({allTrainLnF.length})
          </button>
          <button
            className={`ud-lnf-tab ${lnfTab === "my" ? "active" : ""}`}
            onClick={() => setLnfTab("my")}
          >
            My Reports ({lostNFound.length})
          </button>
        </div>

        {displayItems.length === 0 ? (
          <div className="ud-empty">
            <Icons.LostFound />
            <h3>{lnfTab === "all" ? "No items reported" : "No reports yet"}</h3>
            <p>{lnfTab === "all" 
              ? "No lost or found items have been reported on this train yet." 
              : "You haven't submitted any lost or found reports."}
            </p>
          </div>
        ) : (
          <div className="ud-lnf-grid">
            {displayItems.map(item => {
              const isOwner = item.userId === lostNFound.find(i => i._id === item._id)?.userId || lostNFound.some(i => i._id === item._id);
              return (
                <div key={item._id} className={`ud-lnf-card ${item.status === "Resolved" ? "resolved" : ""}`}>
                  <div className="ud-lnf-image">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} />
                    ) : (
                      <div className="ud-lnf-no-image"><Icons.Image /></div>
                    )}
                    <span className={`ud-lnf-badge ${item.category.toLowerCase()}`}>{item.category}</span>
                  </div>
                  <div className="ud-lnf-content">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    <div className="ud-lnf-meta">
                      <span><Icons.MapPin /> {item.location}</span>
                    </div>
                    {item.contactInfo && lnfTab === "all" && (
                      <div className="ud-lnf-contact">
                        <span className="contact-label">Contact:</span>
                        <span className="contact-value">{item.contactInfo}</span>
                      </div>
                    )}
                    <div className="ud-lnf-footer">
                      <span className="ud-lnf-status" style={{ background: `${getStatusColor(item.status)}20`, color: getStatusColor(item.status) }}>
                        {item.status}
                      </span>
                      <span className="ud-lnf-time">{getRelativeTime(item.createdAt)}</span>
                    </div>
                    {item.status === "Open" && lostNFound.some(i => i._id === item._id) && (
                      <button className="ud-btn ud-btn-success ud-btn-sm ud-btn-full" onClick={() => markLnfResolved(item._id)}>
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderFeedback = () => (
    <div className="ud-feedback">
      <div className="ud-section-header">
        <div>
          <h2>Share Feedback</h2>
          <p className="ud-subtitle">Help us improve your journey experience</p>
        </div>
      </div>

      <div className="ud-feedback-form-section">
        <div className="ud-feedback-info">
          <Icons.Feedback />
          <h3>We value your opinion!</h3>
          <p>Your feedback helps us enhance our services and provide you with a better travel experience.</p>
        </div>

        <form className="ud-feedback-form" onSubmit={submitFeedback}>
          <div className="ud-form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={feedbackForm.name}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="ud-form-group">
            <label>Email</label>
            <input
              type="email"
              value={feedbackForm.email}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="ud-form-group">
            <label>Rating</label>
            <div className="ud-rating-input">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`ud-star ${feedbackForm.rating >= star ? "active" : ""}`}
                  onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="ud-form-group">
            <label>Your Feedback</label>
            <textarea
              rows={4}
              value={feedbackForm.comment}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
              placeholder="Share your experience..."
              required
            />
          </div>
          <button type="submit" className="ud-btn ud-btn-primary">
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="ud-loading">
          <div className="ud-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      );
    }

    switch (activeSection) {
      case "home": return renderHome();
      case "complaints": return renderComplaints();
      case "orders": return renderOrders();
      case "news": return renderNews();
      case "emergency": return renderEmergency();
      case "lostnfound": return renderLostNFound();
      case "feedback": return renderFeedback();
      default: return renderHome();
    }
  };

  /* ═══════════════════════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className={`user-dashboard ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="ud-sidebar">
        <div className="ud-sidebar-header">
          <div className="ud-logo">
            <Icons.Train />
            {!sidebarCollapsed && (
              <div className="ud-logo-text">
                <span>Passenger Portal</span>
                <span className="ud-train-number">Train: {passengerTrainNo || "—"}</span>
              </div>
            )}
          </div>
          <button className="ud-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Icons.Menu />
          </button>
        </div>

        <nav className="ud-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`ud-nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => setActiveSection(item.id)}
              title={item.label}
            >
              <item.icon />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="ud-sidebar-footer">
          <button className="ud-nav-item" onClick={toggleTheme} title={theme === "light" ? "Dark Mode" : "Light Mode"}>
            {theme === "light" ? <Icons.Moon /> : <Icons.Sun />}
            {!sidebarCollapsed && <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>}
          </button>
          <button className="ud-nav-item logout" onClick={logout} title="Logout">
            <Icons.Logout />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ud-main">
        <div className="ud-content-area">
          {renderContent()}
        </div>
      </main>

      {/* Complaint Modal */}
      {showComplaintForm && (
        <div className="ud-modal-overlay" onClick={() => setShowComplaintForm(false)}>
          <div className="ud-modal" onClick={(e) => e.stopPropagation()}>
            <h3>File a Complaint</h3>
            <form onSubmit={submitComplaint}>
              <div className="ud-form-row">
                <div className="ud-form-group">
                  <label>PNR Number</label>
                  <input
                    value={complaintForm.pnr}
                    onChange={(e) => setComplaintForm({ ...complaintForm, pnr: e.target.value })}
                    required
                  />
                </div>
                <div className="ud-form-group">
                  <label>Issue Domain</label>
                  <select
                    value={complaintForm.issueDomain}
                    onChange={(e) => setComplaintForm({ ...complaintForm, issueDomain: e.target.value })}
                  >
                    <option>Cleanliness</option>
                    <option>Food Quality</option>
                    <option>Staff Behavior</option>
                    <option>Technical Issue</option>
                    <option>Safety</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="ud-form-row">
                <div className="ud-form-group">
                  <label>Bogie Number</label>
                  <input
                    value={complaintForm.bogieNumber}
                    onChange={(e) => setComplaintForm({ ...complaintForm, bogieNumber: e.target.value })}
                  />
                </div>
                <div className="ud-form-group">
                  <label>Seat Number</label>
                  <input
                    value={complaintForm.seatNumber}
                    onChange={(e) => setComplaintForm({ ...complaintForm, seatNumber: e.target.value })}
                  />
                </div>
              </div>
              <div className="ud-form-group">
                <label>Description</label>
                <textarea
                  rows={4}
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  required
                />
              </div>
              <div className="ud-form-group">
                <label>Attach Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setComplaintForm({ ...complaintForm, image: e.target.files[0] })}
                />
              </div>
              <div className="ud-modal-actions">
                <button type="submit" className="ud-btn ud-btn-primary">Submit</button>
                <button type="button" className="ud-btn" onClick={() => setShowComplaintForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Modal */}
      {showEmergencyForm && (
        <div className="ud-modal-overlay" onClick={() => setShowEmergencyForm(false)}>
          <div className="ud-modal ud-modal-sm" onClick={(e) => e.stopPropagation()}>
            <h3>Emergency Request</h3>
            <form onSubmit={submitEmergency}>
              <div className="ud-form-group">
                <label>Your Seat Number</label>
                <input
                  value={emergencyForm.seatNumber}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, seatNumber: e.target.value })}
                  placeholder="e.g., B3-24"
                  required
                />
              </div>
              <p className="ud-form-note">
                This will alert the train admin immediately. Please use only for genuine emergencies.
              </p>
              <div className="ud-modal-actions">
                <button type="submit" className="ud-btn ud-btn-danger">Send Alert</button>
                <button type="button" className="ud-btn" onClick={() => setShowEmergencyForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lost & Found Modal */}
      {showLnfForm && (
        <div className="ud-modal-overlay" onClick={() => setShowLnfForm(false)}>
          <div className="ud-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Report Lost/Found Item</h3>
            <form onSubmit={submitLostFound}>
              <div className="ud-form-row">
                <div className="ud-form-group">
                  <label>Item Title</label>
                  <input
                    value={lnfForm.title}
                    onChange={(e) => setLnfForm({ ...lnfForm, title: e.target.value })}
                    placeholder="e.g., Black wallet"
                    required
                  />
                </div>
                <div className="ud-form-group">
                  <label>Category</label>
                  <select
                    value={lnfForm.category}
                    onChange={(e) => setLnfForm({ ...lnfForm, category: e.target.value })}
                  >
                    <option value="Lost">Lost</option>
                    <option value="Found">Found</option>
                  </select>
                </div>
              </div>
              <div className="ud-form-group">
                <label>Location</label>
                <input
                  value={lnfForm.location}
                  onChange={(e) => setLnfForm({ ...lnfForm, location: e.target.value })}
                  placeholder="e.g., Coach B3, Seat 24"
                  required
                />
              </div>
              <div className="ud-form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={lnfForm.description}
                  onChange={(e) => setLnfForm({ ...lnfForm, description: e.target.value })}
                  placeholder="Describe the item..."
                  required
                />
              </div>
              <div className="ud-form-group">
                <label>Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLnfForm({ ...lnfForm, image: e.target.files[0] })}
                />
              </div>
              <div className="ud-modal-actions">
                <button type="submit" className="ud-btn ud-btn-primary">Submit Report</button>
                <button type="button" className="ud-btn" onClick={() => setShowLnfForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
