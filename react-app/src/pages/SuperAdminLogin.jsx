import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { setAdminToken, setAdminTrainNo, setAdminRole } from "../store/slices/authSlice";
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
      const res = await axios.post(`${apiBase}/admin/login`, {
        username,
        password,
      }, {
        withCredentials: true
      });
      const data = res.data;
      if (res.status === 200 && data.admin.role === 'superadmin') {
        dispatch(setAdminToken("authenticated"));
        dispatch(setAdminRole(data.admin.role));
        navigate("/superadmin-dashboard");
      } else if (res.status === 200) {
        // setMessage("You are not authorized to access SuperAdmin dashboard.");
        dispatch(setAdminToken("authenticated"));
        dispatch(setAdminRole(data.admin.role));
        navigate("/superadmin-dashboard");
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

  return (
    <main className="auth-layout fade-in">
      <section className="surface-card auth-card">
        <div className="stack">
          <div>
            <h2>SuperAdmin Login</h2>
            <p>
              System-wide access to all trains, analytics, user management, and
              comprehensive reporting.
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
              placeholder="SuperAdmin username"
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
            Sign In
          </button>
        </form>
        {message ? <p className="message error">{message}</p> : null}
        
        <div className="divider"></div>
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link to="/adminlogin" style={{ color: "#2196F3", textDecoration: "none", fontWeight: "600" }}>
            Regular Admin Login →
          </Link>
        </p>
      </section>
    </main>
  );
};

export default SuperAdminLogin;
