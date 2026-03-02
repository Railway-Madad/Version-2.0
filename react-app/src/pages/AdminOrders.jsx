import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";

const AdminOrders = () => {
  const { apiBase } = useApi();
  const adminTrainNo = useSelector((state) => state.auth.adminTrainNo);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      const res = await fetch(`${apiBase}/admin/train-orders?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setOrders(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiBase, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${apiBase}/catering/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  const filtered = orders.filter((o) => {
    const term = search.toLowerCase();
    return (
      o.user?.name?.toLowerCase().includes(term) ||
      o.user?.email?.toLowerCase().includes(term) ||
      o.deliveryAddress?.toLowerCase().includes(term) ||
      o.status?.toLowerCase().includes(term)
    );
  });

  const statusColor = {
    pending: "#ff9800",
    preparing: "#2196f3",
    "out for delivery": "#9c27b0",
    delivered: "#4caf50",
    cancelled: "#f44336",
  };

  const statuses = ["pending", "preparing", "out for delivery", "delivered", "cancelled"];

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Catering Orders</h1>
            <p className="muted-text">Train: <strong>{adminTrainNo}</strong> &middot; {orders.length} orders</p>
          </div>
          <Link className="btn btn-ghost" to="/admindashboard">Back</Link>
        </div>
        <div className="divider"></div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search by name, email, address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: "200px" }}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="muted-text">No orders found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
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
                {filtered.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <div>{o.user?.name || "—"}</div>
                      <small className="muted-text">{o.user?.email || ""}</small>
                    </td>
                    <td>
                      {o.items?.map((item, i) => (
                        <div key={i} style={{ fontSize: "0.85rem" }}>
                          {item.foodItem?.name || "Item"} x{item.quantity} (&#8377;{item.priceAtOrder})
                        </div>
                      ))}
                    </td>
                    <td>&#8377;{o.totalPrice}</td>
                    <td>{o.deliveryAddress}</td>
                    <td>{o.notes || "—"}</td>
                    <td>
                      <span style={{ color: statusColor[o.status] || "#999", fontWeight: 600 }}>
                        {o.status}
                      </span>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        style={{ fontSize: "0.85rem" }}
                      >
                        {statuses.map((s) => (
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
      </section>
    </main>
  );
};

export default AdminOrders;
