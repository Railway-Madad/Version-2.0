import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";

const AdminStaff = () => {
  const { apiBase } = useApi();
  const { theme } = useTheme();
  const adminTrainNo = useSelector((state) => state.auth.adminTrainNo);

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [trains, setTrains] = useState([]);

  // Edit modal state
  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", role: "", phone: "", trainNumber: "" });

  // Command modal state
  const [commandTarget, setCommandTarget] = useState(null);
  const [commandForm, setCommandForm] = useState({ title: "", message: "", priority: "medium" });

  // Sent commands list
  const [commands, setCommands] = useState([]);
  const [showCommands, setShowCommands] = useState(false);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/admin/train-staff`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setStaff(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  const fetchCommands = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/admin/commands`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setCommands(data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchStaff();
    fetchTrains();
    fetchCommands();
  }, [fetchStaff, fetchTrains, fetchCommands]);

  /* ── Edit staff ── */
  const openEdit = (s) => {
    setEditingStaff(s);
    setEditForm({ name: s.name, role: s.role, phone: s.phone, trainNumber: s.trainNumber });
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`${apiBase}/admin/staff/${editingStaff._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        alert("Staff updated successfully");
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
      const res = await fetch(`${apiBase}/admin/staff/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        fetchStaff();
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      alert("Error deleting staff");
    }
  };

  /* ── Send command ── */
  const openCommand = (s) => {
    setCommandTarget(s);
    setCommandForm({ title: "", message: "", priority: "medium" });
  };

  const sendCommand = async () => {
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
        alert("Command sent!");
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

  const filtered = staff.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.role.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  });

  const priorityColor = { low: "#4caf50", medium: "#ff9800", high: "#f44336", urgent: "#9c27b0" };

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Staff Management</h1>
            <p className="muted-text">Train: <strong>{adminTrainNo}</strong> &middot; {staff.length} staff members</p>
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={() => setShowCommands(!showCommands)}>
              {showCommands ? "Hide Commands" : "Sent Commands"} ({commands.length})
            </button>
            <Link className="btn btn-ghost" to="/admindashboard">Back</Link>
          </div>
        </div>
        <div className="divider"></div>

        <div className="stack" style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search staff by name, role, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: "400px" }}
          />
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="muted-text">No staff found for this train.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Train No</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.role}</td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td>{s.trainNumber}</td>
                    <td style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button className="btn btn-ghost" onClick={() => openEdit(s)} style={{ fontSize: "0.85rem" }}>Edit</button>
                      <button className="btn btn-ghost" onClick={() => openCommand(s)} style={{ fontSize: "0.85rem" }}>Command</button>
                      <button className="btn btn-ghost" onClick={() => deleteStaff(s._id)} style={{ fontSize: "0.85rem", color: "#f44336" }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Sent Commands list */}
      {showCommands && (
        <section className="surface-card" style={{ marginTop: "1.5rem" }}>
          <h2>Sent Commands</h2>
          {commands.length === 0 ? (
            <p className="muted-text">No commands sent yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
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
                      <td>{cmd.message}</td>
                      <td><span style={{ color: priorityColor[cmd.priority] || "#999", fontWeight: 600 }}>{cmd.priority}</span></td>
                      <td>{cmd.isRead ? "Yes" : "No"}</td>
                      <td>{new Date(cmd.createdAt).toLocaleString()}</td>
                      <td><button className="btn btn-ghost" style={{ fontSize: "0.85rem", color: "#f44336" }} onClick={() => deleteCommand(cmd._id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Edit Modal */}
      {editingStaff && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="surface-card" style={{ width: "420px", maxWidth: "90vw", padding: "2rem" }}>
            <h2>Edit Staff: {editingStaff.name}</h2>
            <div className="stack" style={{ gap: "0.75rem", marginTop: "1rem" }}>
              <div className="input-group">
                <label>Name</label>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                  {["Cleaning", "Catering", "Security", "Maintenance", "Medical"].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Phone</label>
                <input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Train Number</label>
                <select value={editForm.trainNumber} onChange={(e) => setEditForm({ ...editForm, trainNumber: e.target.value })}>
                  <option value="">Select train</option>
                  {trains.map((t) => (
                    <option key={t.id} value={t.trainNumber}>{t.trainNumber}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="btn" onClick={saveEdit}>Save</button>
                <button className="btn btn-ghost" onClick={() => setEditingStaff(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Command Modal */}
      {commandTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="surface-card" style={{ width: "420px", maxWidth: "90vw", padding: "2rem" }}>
            <h2>Send Command to {commandTarget.name}</h2>
            <div className="stack" style={{ gap: "0.75rem", marginTop: "1rem" }}>
              <div className="input-group">
                <label>Title</label>
                <input placeholder="e.g. Urgent cleaning needed" value={commandForm.title} onChange={(e) => setCommandForm({ ...commandForm, title: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Message</label>
                <textarea rows={3} placeholder="Detailed instructions…" value={commandForm.message} onChange={(e) => setCommandForm({ ...commandForm, message: e.target.value })} />
              </div>
              <div className="input-group">
                <label>Priority</label>
                <select value={commandForm.priority} onChange={(e) => setCommandForm({ ...commandForm, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="btn" onClick={sendCommand}>Send</button>
                <button className="btn btn-ghost" onClick={() => setCommandTarget(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminStaff;
