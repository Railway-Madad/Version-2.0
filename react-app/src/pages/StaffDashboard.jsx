import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { clearStaffToken } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";

const StaffDashboard = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isAuthenticated = useSelector((state) => state.auth.isStaffAuthenticated);
  const [staff, setStaff] = useState(null);
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/staff/complaints`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Failed to fetch complaints");
      const data = await res.json();
      const complaints = data.complaints || [];

      const resolvedList = await Promise.all(
        complaints
          .filter((c) => c.status === "Resolved")
          .map(async (complaint) => {
            if (complaint.resolvedBy) {
              try {
                const staffRes = await fetch(
                  `${apiBase}/staff/getname/${complaint.resolvedBy}`,
                  { credentials: 'include' }
                );
                if (staffRes.ok) {
                  const staffData = await staffRes.json();
                  return {
                    ...complaint,
                    resolvedByName: staffData.staff?.name || "N/A",
                  };
                }
              } catch (err) {
                return { ...complaint, resolvedByName: "N/A" };
              }
            }
            return { ...complaint, resolvedByName: "N/A" };
          })
      );

      setPendingComplaints(
        complaints.filter((complaint) => complaint.status !== "Resolved")
      );
      setResolvedComplaints(resolvedList);
    } catch (err) {
      setPendingComplaints([]);
      setResolvedComplaints([]);
    }
  }, [apiBase, isAuthenticated]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${apiBase}/staff/profile`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error("Auth failed");
        const data = await res.json();
        setStaff(data.staff);
      } catch (err) {
        dispatch(clearStaffToken());
        navigate("/staff_login");
      }
    };

    if (isAuthenticated) {
      loadProfile();
      fetchComplaints();
    }
  }, [apiBase, dispatch, fetchComplaints, navigate, isAuthenticated]);

  const filteredPending = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return pendingComplaints.filter(
      (complaint) =>
        complaint.username.toLowerCase().includes(term) ||
        complaint.pnr.toLowerCase().includes(term) ||
        complaint.issueDomain.toLowerCase().includes(term) ||
        complaint.status.toLowerCase().includes(term)
    );
  }, [pendingComplaints, searchTerm]);

  const filteredResolved = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return resolvedComplaints.filter(
      (complaint) =>
        complaint.username.toLowerCase().includes(term) ||
        complaint.pnr.toLowerCase().includes(term) ||
        complaint.issueDomain.toLowerCase().includes(term) ||
        (complaint.status || "").toLowerCase().includes(term) ||
        (complaint.resolvedByName || "").toLowerCase().includes(term)
    );
  }, [resolvedComplaints, searchTerm]);

  const resolveComplaint = async (complaintId) => {
    const resolutionDetails = window.prompt("Enter resolution details:");
    if (!resolutionDetails) {
      alert("Resolution details are required.");
      return;
    }
    const res = await fetch(`${apiBase}/staff/complaints/${complaintId}/resolve`, {
      method: "PUT",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resolutionDetails }),
    });
    if (res.ok) {
      alert("Complaint resolved successfully");
      fetchComplaints();
    } else {
      alert("Failed to resolve complaint");
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${apiBase}/staff/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    dispatch(clearStaffToken());
    navigate("/staff_login");
  };

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>
              <span id="staff-role">{staff?.role}</span> Dashboard
            </h1>
            <p id="welcome" className="muted-text">
              {staff ? `Hello, ${staff.name}!` : "Authenticating your profile..."}
            </p>
          </div>
          <div
            className="dashboard-actions"
            style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}
          >
            <button className="btn btn-ghost" onClick={toggleTheme} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
              {theme === "light" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              )}
            </button>
            <Link className="btn btn-ghost" to="/">
              Home
            </Link>
            <button className="btn btn-tonal" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <div className="divider"></div>

        <div className="stack">
          <div className="input-group">
            <label htmlFor="search-bar">Search Complaints</label>
            <input
              type="text"
              id="search-bar"
              placeholder="Search by username, PNR, domain, or status"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <p className="muted-text">
              Results will update in both pending and resolved tables simultaneously.
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card">
        <div className="page-header">
          <div>
            <h2>Assigned Complaints</h2>
            <p className="muted-text">
              Review items requiring action and mark them resolved once handled.
            </p>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Complaint Image</th>
                <th>Username</th>
                <th>PNR</th>
                <th>Description</th>
                <th>Issue Domain</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="complaints-table-body">
              {filteredPending.length === 0 ? (
                <tr>
                  <td colSpan="8">No pending complaints</td>
                </tr>
              ) : (
                filteredPending.map((complaint) => (
                  <tr key={complaint._id}>
                    <td>
                      <img
                        src={complaint.linkurl}
                        alt="Complaint"
                        style={{ width: "100px", height: "auto" }}
                      />
                    </td>
                    <td>{complaint.username}</td>
                    <td>{complaint.pnr}</td>
                    <td>{complaint.description}</td>
                    <td>{complaint.issueDomain}</td>
                    <td>{complaint.status}</td>
                    <td>
                      {complaint.createdAt
                        ? new Date(complaint.createdAt).toLocaleString()
                        : ""}
                    </td>
                    <td>
                      <button onClick={() => resolveComplaint(complaint._id)}>
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface-card">
        <div className="page-header">
          <div>
            <h2>Resolved Complaints</h2>
            <p className="muted-text">
              Track outcomes and verify who completed each request.
            </p>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Complaint Image</th>
                <th>Username</th>
                <th>PNR</th>
                <th>Description</th>
                <th>Issue Domain</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody id="resolved-complaints-table-body">
              {filteredResolved.length === 0 ? (
                <tr>
                  <td colSpan="8">No resolved complaints</td>
                </tr>
              ) : (
                filteredResolved.map((complaint) => (
                  <tr key={complaint._id}>
                    <td>
                      <img
                        src={complaint.linkurl}
                        alt="Complaint"
                        style={{ width: "100px", height: "auto" }}
                      />
                    </td>
                    <td>{complaint.username}</td>
                    <td>{complaint.pnr}</td>
                    <td>{complaint.description}</td>
                    <td>{complaint.issueDomain}</td>
                    <td>{complaint.status}</td>
                    <td>
                      {complaint.createdAt
                        ? new Date(complaint.createdAt).toLocaleString()
                        : ""}
                    </td>
                    <td>
                      Resolved by: {complaint.resolvedByName ? complaint.resolvedByName : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default StaffDashboard;
