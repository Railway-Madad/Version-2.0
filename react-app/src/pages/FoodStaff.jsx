import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { clearStaffToken } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";
import "./FoodStaff.css";

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
  Orders: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  Food: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
  Chef: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
      <line x1="6" y1="17" x2="18" y2="17"/>
    </svg>
  ),
  Truck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
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
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════
   NAVIGATION ITEMS
   ═══════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: "home", label: "Dashboard", icon: Icons.Dashboard },
  { id: "orders", label: "Orders", icon: Icons.Orders },
];

const ROLES = [
  { id: "all", label: "All Orders", icon: Icons.Orders },
  { id: "chef", label: "Chef", icon: Icons.Chef, status: "pending" },
  { id: "manager", label: "Manager", icon: Icons.Food, status: "preparing" },
  { id: "distributor", label: "Distributor", icon: Icons.Truck, status: "out for delivery" },
];

/* ═══════════════════════════════════════════════════════════
   MAIN FOOD STAFF DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════ */
const FoodStaff = () => {
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
  const [role, setRole] = useState("all");

  // Data states
  const [orders, setOrders] = useState([]);
  
  // Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otpInput, setOtpInput] = useState("");

  const fetchAllBatches = useCallback(async (url, options = {}, extractor) => {
    const getItems = extractor || ((payload) => {
      if (Array.isArray(payload)) return payload;
      return payload?.data || payload?.items || payload?.orders || [];
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

  /* ── FETCH FUNCTIONS ── */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const allOrders = await fetchAllBatches(
        `${apiBase}/catering/all-orders`,
        { credentials: "include" },
        (payload) => {
          if (Array.isArray(payload)) return payload;
          if (Array.isArray(payload?.data)) return payload.data;
          return [];
        }
      );
      const filtered = allOrders.filter((o) => String(o.trainNumber) === String(staffTrainNo));
      setOrders(filtered);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, staffTrainNo, fetchAllBatches]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/staff_login");
      return;
    }
    if (staffTrainNo) {
      fetchOrders();
    }
  }, [isAuthenticated, navigate, staffTrainNo, fetchOrders]);

  const logout = async () => {
    try {
      await axios.post(`${apiBase}/staff/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
    dispatch(clearStaffToken());
    navigate("/staff_login");
  };

  /* ── ACTIONS ── */
  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${apiBase}/catering/${orderId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  const openOtpModal = (order) => {
    setSelectedOrder(order);
    setOtpInput("");
    setShowOtpModal(true);
  };

  const verifyOtpAndDeliver = () => {
    if (!selectedOrder) return;
    if (otpInput === selectedOrder.otp) {
      updateStatus(selectedOrder._id, "delivered");
      setShowOtpModal(false);
      setSelectedOrder(null);
      setOtpInput("");
    } else {
      alert("Invalid OTP! Please try again.");
    }
  };

  /* ── COMPUTED DATA ── */
  const filteredOrders = useMemo(() => {
    if (role === "all") return orders;
    const roleConfig = ROLES.find((r) => r.id === role);
    if (!roleConfig?.status) return orders;
    return orders.filter((o) => o.status === roleConfig.status);
  }, [orders, role]);

  const orderStats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    delivering: orders.filter((o) => o.status === "out for delivery").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }), [orders]);

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

  const getStatusClass = (status) => {
    const classes = {
      pending: "pending",
      preparing: "preparing",
      "out for delivery": "out-for-delivery",
      delivered: "delivered",
      cancelled: "cancelled",
    };
    return classes[status] || "";
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER FUNCTIONS
     ═══════════════════════════════════════════════════════════ */

  const renderHome = () => (
    <div className="fs-home">
      <div className="fs-welcome-card">
        <div className="fs-welcome-content">
          <h1>Food Service Dashboard</h1>
          <p>Train #{staffTrainNo || "N/A"} • Manage catering orders efficiently</p>
        </div>
        <div className="fs-welcome-icon">
          <Icons.Food />
        </div>
      </div>

      <div className="fs-stats-row">
        <div className="fs-stat-box" onClick={() => { setActiveSection("orders"); setRole("all"); }}>
          <div className="icon total">
            <Icons.Orders />
          </div>
          <div className="info">
            <span className="value">{orderStats.total}</span>
            <span className="label">Total Orders</span>
          </div>
        </div>
        <div className="fs-stat-box" onClick={() => { setActiveSection("orders"); setRole("chef"); }}>
          <div className="icon pending">
            <Icons.Clock />
          </div>
          <div className="info">
            <span className="value">{orderStats.pending}</span>
            <span className="label">Pending</span>
          </div>
        </div>
        <div className="fs-stat-box" onClick={() => { setActiveSection("orders"); setRole("manager"); }}>
          <div className="icon preparing">
            <Icons.Chef />
          </div>
          <div className="info">
            <span className="value">{orderStats.preparing}</span>
            <span className="label">Preparing</span>
          </div>
        </div>
        <div className="fs-stat-box" onClick={() => { setActiveSection("orders"); setRole("distributor"); }}>
          <div className="icon delivering">
            <Icons.Truck />
          </div>
          <div className="info">
            <span className="value">{orderStats.delivering}</span>
            <span className="label">Out for Delivery</span>
          </div>
        </div>
        <div className="fs-stat-box">
          <div className="icon delivered">
            <Icons.Check />
          </div>
          <div className="info">
            <span className="value">{orderStats.delivered}</span>
            <span className="label">Delivered</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="fs-section-header" style={{ marginTop: "24px" }}>
        <div>
          <h2>Recent Orders</h2>
          <p className="fs-subtitle">Latest orders requiring attention</p>
        </div>
        <button className="fs-btn fs-btn-primary" onClick={() => setActiveSection("orders")}>
          View All Orders
        </button>
      </div>

      {orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length === 0 ? (
        <div className="fs-empty">
          <Icons.Check />
          <h3>All caught up!</h3>
          <p>No pending orders at the moment.</p>
        </div>
      ) : (
        <div className="fs-orders-grid">
          {orders
            .filter((o) => o.status !== "delivered" && o.status !== "cancelled")
            .slice(0, 4)
            .map((order) => renderOrderCard(order))}
        </div>
      )}
    </div>
  );

  const renderOrderCard = (order) => (
    <div key={order._id} className="fs-order-card">
      <div className="fs-order-header">
        <div>
          <div className="fs-order-id">Order #{order._id.slice(-6).toUpperCase()}</div>
          <div className="fs-order-time">{getRelativeTime(order.createdAt)}</div>
        </div>
        <span className={`fs-order-status ${getStatusClass(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="fs-order-customer">
        <Icons.User />
        <span>{order.user?.email || "Customer"}</span>
      </div>

      <div className="fs-order-address">
        <Icons.MapPin />
        <span>{order.deliveryAddress}</span>
      </div>

      <div className="fs-order-items">
        <h5>Items</h5>
        <ul>
          {order.items?.map((item, idx) => (
            <li key={idx}>
              <span className="item-name">{item.foodItem?.name || "Item"}</span>
              <span className="item-qty">x{item.quantity} • ₹{item.priceAtOrder}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="fs-order-footer">
        <span className="fs-order-total">₹{order.totalPrice}</span>
        <span className="fs-order-train">🚆 Train #{order.trainNumber}</span>
      </div>

      <div className="fs-order-actions">
        {order.status === "pending" && (
          <button className="fs-btn fs-btn-primary" onClick={() => updateStatus(order._id, "preparing")}>
            <Icons.Chef /> Accept & Prepare
          </button>
        )}
        {order.status === "preparing" && (
          <button className="fs-btn fs-btn-warning" onClick={() => updateStatus(order._id, "out for delivery")}>
            <Icons.Truck /> Out for Delivery
          </button>
        )}
        {order.status === "out for delivery" && (
          <button className="fs-btn fs-btn-success" onClick={() => openOtpModal(order)}>
            <Icons.Check /> Verify & Deliver
          </button>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="fs-orders">
      <div className="fs-section-header">
        <div>
          <h2>All Orders</h2>
          <p className="fs-subtitle">Manage catering orders based on your role</p>
        </div>
        <button className="fs-btn" onClick={fetchOrders}>
          <Icons.Refresh /> Refresh
        </button>
      </div>

      <div className="fs-role-tabs">
        {ROLES.map((r) => (
          <button
            key={r.id}
            className={`fs-role-tab ${role === r.id ? "active" : ""}`}
            onClick={() => setRole(r.id)}
          >
            <r.icon />
            {r.label}
            <span className="count">
              {r.id === "all"
                ? orders.length
                : orders.filter((o) => o.status === r.status).length}
            </span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="fs-empty">
          <Icons.Orders />
          <h3>No orders found</h3>
          <p>
            {role === "all"
              ? "No orders available for this train."
              : `No ${role === "chef" ? "pending" : role === "manager" ? "preparing" : "delivery"} orders.`}
          </p>
        </div>
      ) : (
        <div className="fs-orders-grid">
          {filteredOrders.map((order) => renderOrderCard(order))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="fs-loading">
          <div className="fs-spinner"></div>
          <p>Loading orders...</p>
        </div>
      );
    }

    switch (activeSection) {
      case "home":
        return renderHome();
      case "orders":
        return renderOrders();
      default:
        return renderHome();
    }
  };

  /* ═══════════════════════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className={`food-staff-dashboard ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="fs-sidebar">
        <div className="fs-sidebar-header">
          <div className="fs-logo">
            <Icons.Food />
            {!sidebarCollapsed && (
              <div className="fs-logo-text">
                <span>Food Service</span>
                <span className="fs-train-number">Train: {staffTrainNo || "—"}</span>
              </div>
            )}
          </div>
          <button className="fs-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Icons.Menu />
          </button>
        </div>

        <nav className="fs-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`fs-nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => setActiveSection(item.id)}
              title={item.label}
            >
              <item.icon />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="fs-sidebar-footer">
          <button className="fs-nav-item" onClick={toggleTheme} title={theme === "light" ? "Dark Mode" : "Light Mode"}>
            {theme === "light" ? <Icons.Moon /> : <Icons.Sun />}
            {!sidebarCollapsed && <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>}
          </button>
          <button className="fs-nav-item logout" onClick={logout} title="Logout">
            <Icons.Logout />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="fs-main">
        <div className="fs-content-area">
          {renderContent()}
        </div>
      </main>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fs-modal-overlay" onClick={() => setShowOtpModal(false)}>
          <div className="fs-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Verify Delivery OTP</h3>
            <p style={{ marginBottom: "20px", color: "var(--fs-text-muted)" }}>
              Enter the 6-digit OTP provided by the customer to confirm delivery.
            </p>
            <div className="fs-form-group">
              <label>OTP Code</label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="------"
                autoFocus
              />
            </div>
            <div className="fs-modal-actions">
              <button className="fs-btn" onClick={() => setShowOtpModal(false)}>Cancel</button>
              <button className="fs-btn fs-btn-success" onClick={verifyOtpAndDeliver}>
                Verify & Deliver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodStaff;
 