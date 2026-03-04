import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { setSuperAdminToken } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";

const SuperAdminLogin = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!username || !password) {
      setMessage("Please fill in all fields.");
      return;
    }
    try {
      // Super admin logs in with trainNo "ALL" to signify system-wide access
      const res = await axios.post(
        `${apiBase}/admin/login`,
        { username, password, trainNo: "ALL" },
        { withCredentials: true }
      );
      if (res.status === 200) {
        dispatch(setSuperAdminToken("authenticated"));
        navigate("/superadmin-dashboard");
      } else {
        setMessage(res.data?.message || "Invalid username or password.");
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data?.message || "Login failed.");
      } else {
        setMessage("Unable to connect to server. Please try again later.");
      }
    }
  };

  return (
    <main className="auth-layout fade-in">
      <section className="surface-card auth-card">
        <div className="stack">
          <div>
            <h2>Super Admin Login</h2>
            <p>
              Authenticate to access system-wide analytics across all trains,
              orders, complaints, and performance metrics.
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
              placeholder="Super admin username"
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
          <button className="btn" type="submit">
            Sign In as Super Admin
          </button>
        </form>

        <p className="form-meta">
          <Link to="/admin-select">← Back to admin selection</Link>
        </p>
        {message ? <p className="message error">{message}</p> : null}
      </section>
    </main>
  );
};

export default SuperAdminLogin;
