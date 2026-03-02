import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";

const FoodStaff = () => {
  const { apiBase } = useApi();
  const isAuthenticated = useSelector((state) => state.auth.isStaffAuthenticated);
  const staffTrainNo = useSelector((state) => state.auth.staffTrainNo);
  const [role, setRole] = useState("chef");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/catering/all-orders`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (!data.success) {
        setError("Failed to load orders.");
        setOrders([]);
        return;
      }
      let filtered = data.data || [];
      console.log("All orders:", filtered);
      console.log("Staff Train No:", staffTrainNo);
      
      // Filter by staff's assigned train
      filtered = filtered.filter((o) => {
        console.log(`Comparing order train ${o.trainNumber} with staff train ${staffTrainNo}`);
        return String(o.trainNumber) === String(staffTrainNo);
      });
      
      console.log("Filtered by train:", filtered);
      
      if (role !== "all") {
        if (role === "chef") {
          filtered = filtered.filter((o) => o.status === "pending");
        } else if (role === "manager") {
          filtered = filtered.filter((o) => o.status === "preparing");
        } else if (role === "distributor") {
          filtered = filtered.filter((o) => o.status === "out for delivery");
        }
      }
      
      console.log("Final filtered orders:", filtered);
      setOrders(filtered);
    } catch (err) {
      setError("Failed to load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && staffTrainNo) {
      loadOrders();
    }
  }, [isAuthenticated, staffTrainNo, role]);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${apiBase}/catering/${orderId}/status`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Success! Order status updated to ${status}.`);
        loadOrders();
      } else {
        alert(`Warning: ${data.message}`);
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Food Service Crew Dashboard</h1>
            <p className="muted-text">
              Filter orders based on your role and keep passengers nourished right on
              time.
            </p>
            <p style={{
              display: "inline-block",
              backgroundColor: "#E3F2FD",
              color: "#1565C0",
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "500",
              marginTop: "8px"
            }}>
              🚆 Train: {staffTrainNo || "N/A"}
            </p>
          </div>
          <Link className="btn btn-ghost" to="/" style={{ marginLeft: "0.5rem" }}>
            Logout
          </Link>
        </div>

        <div className="actions-inline">
          <div className="input-group" style={{ flex: 1 }}>
            <label htmlFor="role">Select Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="chef">Chef</option>
              <option value="manager">Manager</option>
              <option value="distributor">Distributor</option>
              <option value="all">All Orders</option>
            </select>
          </div>
          <button className="btn" id="load-orders-btn" type="button" onClick={loadOrders}>
            Load Orders
          </button>
        </div>
      </section>

      <section className="surface-card">
        <div className="page-header">
          <div>
            <h2>Orders Overview</h2>
            <p className="muted-text">Actions appear based on your selection above.</p>
          </div>
        </div>
        <div id="orders-container" className="orders-list">
          {loading ? (
            <div className="empty-state">Loading orders...</div>
          ) : error ? (
            <div className="empty-state">{error}</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">No orders available right now.</div>
          ) : (
            orders.map((order) => {
              const statusClass =
                order.status === "delivered"
                  ? "status-pill success"
                  : order.status === "cancelled"
                  ? "status-pill danger"
                  : "status-pill warning";
              return (
                <article className="order-card" key={order._id}>
                  <div className="order-card__header">
                    <div>
                      <h4>Order ID: {order._id}</h4>
                      <p className="muted-text">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                      </p>
                      <p className="muted-text">
                        Customer email: ({order.user?.email || ""})
                      </p>
                      <span style={{
                        display: "inline-block",
                        backgroundColor: "#E8F5E9",
                        color: "#2E7D32",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        marginTop: "4px"
                      }}>
                        🚆 Train: {order.trainNumber || "N/A"}
                      </span>
                    </div>
                    <span className={statusClass}>{order.status}</span>
                  </div>
                  <p>
                    <strong>Delivery address:</strong> {order.deliveryAddress}
                  </p>
                  <p>
                    <strong>Total:</strong> &#8377;{order.totalPrice}
                  </p>
                  <p>
                    <strong>Items:</strong>
                  </p>
                  <ul className="past-order-items">
                    {order.items.map((i, idx) => (
                      <li key={`${order._id}-${idx}`}>
                        {i.foodItem?.name || "Item"} x {i.quantity} (&#8377;{i.priceAtOrder})
                      </li>
                    ))}
                  </ul>
                  <div className="actions-inline">
                    {role === "chef" && order.status === "pending" ? (
                      <button
                        className="btn"
                        onClick={() => updateStatus(order._id, "preparing")}
                      >
                        Accept Order (Preparing)
                      </button>
                    ) : null}
                    {role === "manager" && order.status === "preparing" ? (
                      <button
                        className="btn"
                        onClick={() => updateStatus(order._id, "out for delivery")}
                      >
                        Mark Out for Delivery
                      </button>
                    ) : null}
                    {role === "distributor" && order.status === "out for delivery" ? (
                      // <button
                      //   className="btn"
                      //   onClick={() => updateStatus(order._id, "delivered")}
                      // >
                      //   Mark Delivered
                      // </button>
                      <button
  className="btn"
  onClick={() => {
    const enteredOtp = prompt("Enter OTP from customer:");

    if (!enteredOtp) return;

    if (enteredOtp === order.otp) {
      updateStatus(order._id, "delivered");
    } else {
      alert("Invalid OTP!");
    }
  }}
>
  Mark Delivered
</button>

                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
};

export default FoodStaff;
 