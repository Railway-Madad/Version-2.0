import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { clearPassengerToken } from "../store/slices/authSlice";

const ViewComplaints = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isPassengerAuthenticated);
  const [currentUser, setCurrentUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${apiBase}/user/profile`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setCurrentUser(data.user);
      } catch (err) {
        dispatch(clearPassengerToken());
        navigate("/login");
      }
    };
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [apiBase, dispatch, navigate, isAuthenticated]);

  useEffect(() => {
    let intervalId;
    if (currentUser?.username) {
      const loadComplaints = async () => {
        try {
          const response = await fetch(
            `${apiBase}/complaint/api/complaints/user/${currentUser.username}`,
            { credentials: 'include' }
          );
          if (!response.ok) throw new Error("Failed to fetch complaints");
          const data = await response.json();
          setComplaints(data || []);
        } catch (err) {
          setComplaints([]);
        } finally {
          setLoading(false);
        }
      };

      loadComplaints();
      intervalId = setInterval(loadComplaints, 60 * 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [apiBase, currentUser]);

  const handleDelete = async (id, status) => {
    if (status === "Resolved") return;
    const confirmed = window.confirm("Delete this complaint?");
    if (!confirmed) return;
    try {
      const res = await fetch(`${apiBase}/complaint/api/complaints/${id}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete complaint");
      }
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      alert("Deleted successfully");
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const tableRows = useMemo(() => {
    if (!complaints.length) return null;
    return complaints.map((c) => {
      const createdAt = c.createdAt ? new Date(c.createdAt) : null;
      const currentTime = Date.now();
      const complaintTime = createdAt ? createdAt.getTime() : currentTime;
      const timeDiff = currentTime - complaintTime;
      const oneHour = 60 * 60 * 1000;
      const progressPercent = Math.min((timeDiff / oneHour) * 100, 100);
      const displayStatus =
        c.status === "Pending" && timeDiff > oneHour ? "Important" : c.status;

      let buttonColor = "";
      let progressBarColor = "";
      let progressWidth = 0;

      if (displayStatus === "Resolved") {
        buttonColor = "#13b013ff";
        progressBarColor = "#13b013ff";
        progressWidth = 100;
      } else if (displayStatus === "Important") {
        buttonColor = "#f8f8a4ff";
        progressBarColor = "#f8f8a4ff";
        progressWidth = 100;
      } else {
        buttonColor = "#c81121ff";
        progressBarColor = "#df1515ff";
        progressWidth = progressPercent;
      }

      const progressCopy =
        displayStatus === "Resolved"
          ? "Complaint resolved - 100% complete"
          : displayStatus === "Important"
          ? "Marked as Important - Requires Immediate Attention"
          : `Progress to Important: ${progressPercent.toFixed(
              1
            )}% (${Math.max(
              0,
              Math.ceil((oneHour - timeDiff) / 60000)
            )} min remaining)`;

      return (
        <tbody key={c._id}>
          <tr id={`complaint-${c._id}`}>
            <td>{c._id}</td>
            <td>{c.pnr}</td>
            <td>{c.description}</td>
            <td>{c.issueDomain}</td>
            <td>{displayStatus}</td>
            <td>{createdAt ? createdAt.toLocaleString() : ""}</td>
            <td>
              <button
                className="delete-btn"
                data-id={c._id}
                disabled={displayStatus === "Resolved"}
                style={{
                  backgroundColor: buttonColor,
                  color:
                    displayStatus === "Resolved"
                      ? "#fff"
                      : displayStatus === "Important"
                      ? "#000"
                      : "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: displayStatus === "Resolved" ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  opacity: displayStatus === "Resolved" ? 0.6 : 1,
                }}
                onClick={() => handleDelete(c._id, displayStatus)}
              >
                Delete
              </button>
            </td>
          </tr>
          <tr>
            <td colSpan="7" style={{ padding: "0 8px 12px 8px" }}>
              <div
                style={{
                  background: "#e0e0e0",
                  height: "10px",
                  borderRadius: "5px",
                  overflow: "hidden",
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    width: `${progressWidth}%`,
                    height: "100%",
                    background: progressBarColor,
                    transition: "width 0.5s ease",
                    borderRadius: "5px",
                  }}
                  data-status={displayStatus}
                ></div>
              </div>
              <small
                style={{
                  fontSize: "12px",
                  color: "#555",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {progressCopy}
              </small>
            </td>
          </tr>
        </tbody>
      );
    });
  }, [complaints]);

  return (
    <main className="page-shell fade-in">
      <header className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <h1 style={{ margin: 0 }}>My Complaints</h1>
        </div>
        <Link to="/" className="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.5rem' }}>
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          Go to Home
        </Link>
      </header>
      <section className="surface-card card-highlight" style={{ marginBottom: "2.5rem" }}>
        <div className="stack">
          <h2 className="card-section-title" style={{ marginBottom: "0.5rem" }}>
            Welcome, <span id="current-user">{currentUser?.username || "Guest"}</span>
          </h2>
          <div className="divider"></div>
          <h3 style={{ marginBottom: "0.5rem" }}>Your Submitted Complaints</h3>
          <div className="table-wrapper">
            <table id="complaints-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>PNR</th>
                  <th>Description</th>
                  <th>Issue Domain</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              {loading ? (
                <tbody>
                  <tr>
                    <td colSpan="7">Loading complaints...</td>
                  </tr>
                </tbody>
              ) : complaints.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan="7">No complaints found.</td>
                  </tr>
                </tbody>
              ) : (
                tableRows
              )}
            </table>
          </div>
        </div>
      </section>
      <footer
        style={{ marginTop: "2.5rem", width: "100%", textAlign: "center" }}
        className="fade-in"
      >
        <p className="muted-text">
          Ac 2025 Rail Madad - Indian Railways. All Rights Reserved.
        </p>
      </footer>
    </main>
  );
};

export default ViewComplaints;
