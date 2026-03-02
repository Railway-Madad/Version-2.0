import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";

const AdminComplaints = () => {
  const { apiBase } = useApi();
  const adminTrainNo = useSelector((state) => state.auth.adminTrainNo);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDomain, setFilterDomain] = useState("");

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append("status", filterStatus);
      if (filterDomain) params.append("domain", filterDomain);
      const res = await fetch(`${apiBase}/admin/train-complaints?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setComplaints(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiBase, filterStatus, filterDomain]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const resolveComplaint = async (id) => {
    if (!window.confirm("Mark this complaint as resolved?")) return;
    try {
      const res = await fetch(`${apiBase}/complaint/api/complaints/resolve/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        alert("Complaint resolved");
        fetchComplaints();
      } else {
        alert("Failed to resolve");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const filtered = complaints.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.username?.toLowerCase().includes(term) ||
      c.pnr?.toLowerCase().includes(term) ||
      c.description?.toLowerCase().includes(term) ||
      c.issueDomain?.toLowerCase().includes(term)
    );
  });

  const statusColor = {
    Pending: "#ff9800",
    Important: "#f44336",
    AwaitingConfirmation: "#2196f3",
    Resolved: "#4caf50",
  };

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Train Complaints</h1>
            <p className="muted-text">Train: <strong>{adminTrainNo}</strong> &middot; {complaints.length} complaints</p>
          </div>
          <Link className="btn btn-ghost" to="/admindashboard">Back</Link>
        </div>
        <div className="divider"></div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search by name, PNR, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: "200px" }}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Important">Important</option>
            <option value="AwaitingConfirmation">Awaiting Confirmation</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)}>
            <option value="">All Domains</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Catering">Catering</option>
            <option value="Security">Security</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Medical">Medical</option>
          </select>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="muted-text">No complaints found.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>User</th>
                  <th>PNR</th>
                  <th>Bogie</th>
                  <th>Seat</th>
                  <th>Description</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id}>
                    <td>
                      {c.linkurl ? (
                        <img src={c.linkurl} alt="complaint" style={{ width: "80px", height: "auto", borderRadius: "4px" }} />
                      ) : (
                        <span className="muted-text">—</span>
                      )}
                    </td>
                    <td>{c.username}</td>
                    <td>{c.pnr}</td>
                    <td>{c.bogieNumber}</td>
                    <td>{c.seatNumber}</td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>{c.description}</td>
                    <td>{c.issueDomain}</td>
                    <td><span style={{ color: statusColor[c.status] || "#999", fontWeight: 600 }}>{c.status}</span></td>
                    <td>{new Date(c.createdAt).toLocaleString()}</td>
                    <td>
                      {c.status !== "Resolved" && (
                        <button className="btn btn-ghost" style={{ fontSize: "0.85rem" }} onClick={() => resolveComplaint(c._id)}>
                          Resolve
                        </button>
                      )}
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

export default AdminComplaints;
