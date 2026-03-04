import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";

const TrainAdminUsers = () => {
  const { apiBase } = useApi();
  const { theme, toggleTheme } = useTheme();
  const trainNo = useSelector((s) => s.auth.adminTrainNo);

  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [lostFound, setLostFound] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("orders");

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      setLoading(true);
      try {
        const opts = { credentials: "include" };
        const [ordersRes, complaintsRes, emergRes, lostRes] = await Promise.all([
          fetch(`${apiBase}/catering/all-orders`, opts).then(r => r.json()),
          fetch(`${apiBase}/complaint/`, opts).then(r => r.json()),
          fetch(`${apiBase}/emergency/getEmg`, opts).then(r => r.json()),
          fetch(`${apiBase}/lostnfound`, opts).then(r => r.json()),
        ]);
        if (cancel) return;
        setOrders(Array.isArray(ordersRes.data || ordersRes) ? ordersRes.data || ordersRes : []);
        setComplaints(Array.isArray(complaintsRes) ? complaintsRes : []);
        setEmergencies(Array.isArray(emergRes) ? emergRes : []);
        const lostItems = lostRes.items || lostRes.data || lostRes;
        setLostFound(Array.isArray(lostItems) ? lostItems : []);
      } catch (err) {
        console.error("Error loading users data:", err);
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    return () => { cancel = true; };
  }, [apiBase]);

  // Build unique user profiles from all data sources
  const users = useMemo(() => {
    const userMap = new Map();

    const getOrCreate = (id, name, email) => {
      if (!id) return null;
      if (!userMap.has(id)) {
        userMap.set(id, {
          id, name: name || "Unknown", email: email || "",
          orders: 0, totalSpent: 0, complaints: 0, resolvedComplaints: 0,
          emergencies: 0, lostFound: 0, lastActivity: null,
        });
      }
      return userMap.get(id);
    };

    orders.forEach(o => {
      const uid = o.user?._id || o.user;
      const u = getOrCreate(uid, o.user?.name || o.user?.username, o.user?.email);
      if (u) {
        u.orders++;
        u.totalSpent += o.totalPrice || 0;
        const d = new Date(o.createdAt);
        if (!u.lastActivity || d > u.lastActivity) u.lastActivity = d;
      }
    });

    complaints.forEach(c => {
      const uid = c.userId?._id || c.userId;
      const u = getOrCreate(uid, c.username);
      if (u) {
        if (c.username && u.name === "Unknown") u.name = c.username;
        u.complaints++;
        if (c.status === "Resolved") u.resolvedComplaints++;
        const d = new Date(c.createdAt);
        if (!u.lastActivity || d > u.lastActivity) u.lastActivity = d;
      }
    });

    emergencies.forEach(e => {
      const uid = e.userId?._id || e.userId;
      const u = getOrCreate(uid, e.username);
      if (u) {
        if (e.username && u.name === "Unknown") u.name = e.username;
        u.emergencies++;
        const d = new Date(e.createdAt);
        if (!u.lastActivity || d > u.lastActivity) u.lastActivity = d;
      }
    });

    lostFound.forEach(lf => {
      const uid = lf.userId?._id || lf.userId;
      const u = getOrCreate(uid);
      if (u) {
        u.lostFound++;
        const d = new Date(lf.createdAt);
        if (!u.lastActivity || d > u.lastActivity) u.lastActivity = d;
      }
    });

    let list = [...userMap.values()];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
    }

    switch (sortBy) {
      case "orders": list.sort((a, b) => b.orders - a.orders); break;
      case "spent": list.sort((a, b) => b.totalSpent - a.totalSpent); break;
      case "complaints": list.sort((a, b) => b.complaints - a.complaints); break;
      case "recent": list.sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0)); break;
      default: break;
    }

    return list;
  }, [orders, complaints, emergencies, lostFound, searchTerm, sortBy]);

  const fmtCur = (n) => `₹${n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toFixed(0)}`;

  if (loading) {
    return (
      <main className="page-shell fade-in">
        <section className="surface-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div className="an-spinner" />
          <p className="muted-text" style={{ marginTop: "1rem" }}>Loading users…</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell fade-in an-page">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Train Users</h1>
            <p className="muted-text">Train #{trainNo} — {users.length} users found across all interactions</p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn btn-ghost" onClick={toggleTheme}>{theme === "light" ? "🌙" : "☀️"}</button>
            <Link className="btn btn-ghost" to="/admindashboard">← Dashboard</Link>
          </div>
        </div>
      </section>

      <section className="surface-card an-section">
        <div className="an-filter-bar" style={{ marginBottom: "1rem" }}>
          <div className="an-filter-group" style={{ flex: 1, minWidth: "200px" }}>
            <label>Search Users</label>
            <input type="text" placeholder="Search by name, email or ID…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="an-filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="orders">Most Orders</option>
              <option value="spent">Highest Spend</option>
              <option value="complaints">Most Complaints</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Complaints</th>
                <th>Emergencies</th>
                <th>Lost & Found</th>
                <th>Last Active</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div>
                      <strong>{u.name}</strong>
                      {u.email && <div style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>{u.email}</div>}
                    </div>
                  </td>
                  <td>{u.orders}</td>
                  <td>{fmtCur(u.totalSpent)}</td>
                  <td>
                    {u.complaints}
                    {u.complaints > 0 && <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginLeft: "4px" }}>({u.resolvedComplaints} resolved)</span>}
                  </td>
                  <td>{u.emergencies}</td>
                  <td>{u.lostFound}</td>
                  <td style={{ fontSize: "0.85rem" }}>{u.lastActivity ? new Date(u.lastActivity).toLocaleDateString() : "—"}</td>
                  <td>
                    <Link className="btn btn-ghost" style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }} to={`/admin-user/${u.id}`}>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default TrainAdminUsers;
