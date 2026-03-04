import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { setAdminToken, setAdminTrainNo } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";

const AdminLogin = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [trainNo, setTrainNo] = useState("");
  const [message, setMessage] = useState("");
  const [trains, setTrains] = useState([]);
  const [trainsLoading, setTrainsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch active trains on mount
  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const res = await axios.get(`${apiBase}/api/trains`);
        const list = res.data?.data || res.data || [];
        setTrains(Array.isArray(list) ? list : []);
      } catch {
        setTrains([]);
      } finally {
        setTrainsLoading(false);
      }
    };
    fetchTrains();
  }, [apiBase]);

  const login = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!username || !password || !trainNo) {
      setMessage("Please fill in all fields including train number.");
      return;
    }
    try {
      const res = await axios.post(`${apiBase}/admin/login`, {
        username,
        password,
        trainNo,
      }, {
        withCredentials: true
      });
      const data = res.data;
      if (res.status === 200) {
        dispatch(setAdminToken("authenticated"));
        dispatch(setAdminTrainNo(data.admin.trainNo || trainNo));
        navigate("/admindashboard");
      } else {
        setMessage(data.message || "Invalid username or password.");
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data?.message || "Login failed.");
      } else {
        setMessage("Unable to connect to server. Please try again later.");
      }
    }
  };

  const selectedTrain = trains.find(
    (t) => t.trainNumber === trainNo || t.id === trainNo
  );

  return (
    <main className="auth-layout fade-in">
      <section className="surface-card auth-card">
        <div className="stack">
          <div>
            <h2>Train Admin Login</h2>
            <p>
              Log in with your admin credentials and select your assigned train
              to manage operations.
            </p>
          </div>
        </div>

        <form className="form-grid" onSubmit={login}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Admin username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* ── Train selector dropdown ── */}
          <div className="input-group">
            <label>Select Your Train</label>
            {trainsLoading ? (
              <div style={{ padding: "0.75rem 1rem", color: "var(--text-secondary, #888)", fontSize: "0.95rem" }}>
                Loading active trains…
              </div>
            ) : trains.length === 0 ? (
              <div style={{ padding: "0.75rem 1rem", color: "#e74c3c", fontSize: "0.95rem" }}>
                No active trains found. Please contact the super admin.
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                {/* Selected value / trigger */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    background: "var(--surface-2, #1e293b)",
                    border: "1px solid var(--border, #334155)",
                    borderRadius: "0.5rem",
                    color: trainNo
                      ? "var(--text-primary, #f1f5f9)"
                      : "var(--text-secondary, #94a3b8)",
                    fontSize: "0.95rem",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "border-color 0.2s",
                  }}
                >
                  <span>
                    {selectedTrain
                      ? `🚆  Train ${selectedTrain.trainNumber}`
                      : "— Select a train —"}
                  </span>
                  <span
                    style={{
                      transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.25s ease",
                      fontSize: "0.7rem",
                    }}
                  >
                    ▼
                  </span>
                </button>

                {/* Slide-down list */}
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "var(--surface-2, #1e293b)",
                    border: dropdownOpen
                      ? "1px solid var(--border, #334155)"
                      : "1px solid transparent",
                    borderRadius: "0.5rem",
                    maxHeight: dropdownOpen ? "220px" : "0",
                    overflowY: "auto",
                    opacity: dropdownOpen ? 1 : 0,
                    transition:
                      "max-height 0.3s ease, opacity 0.25s ease, border-color 0.2s",
                    zIndex: 50,
                    boxShadow: dropdownOpen
                      ? "0 8px 24px rgba(0,0,0,0.35)"
                      : "none",
                  }}
                >
                  {trains.map((t) => {
                    const num = t.trainNumber || t.id;
                    const isSelected = trainNo === num;
                    return (
                      <li
                        key={t.id || t._id || num}
                        onClick={() => {
                          setTrainNo(num);
                          setDropdownOpen(false);
                        }}
                        style={{
                          padding: "0.7rem 1rem",
                          cursor: "pointer",
                          background: isSelected
                            ? "var(--primary, #3b82f6)"
                            : "transparent",
                          color: isSelected
                            ? "#fff"
                            : "var(--text-primary, #f1f5f9)",
                          fontWeight: isSelected ? 600 : 400,
                          transition: "background 0.15s, color 0.15s",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background =
                              "var(--surface-3, #334155)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        🚆 <span>Train {num}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <button
            className="btn"
            type="submit"
            disabled={trainsLoading || trains.length === 0 || !trainNo}
            style={{
              opacity:
                trainsLoading || trains.length === 0 || !trainNo ? 0.5 : 1,
              cursor:
                trainsLoading || trains.length === 0 || !trainNo
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Sign In as Train Admin
          </button>
        </form>
        <p className="form-meta" style={{ marginTop: "1rem" }}>
          <Link to="/admin-select">← Back to admin selection</Link>
        </p>
        {message ? <p className="message error">{message}</p> : null}
      </section>
    </main>
  );
};

export default AdminLogin;
