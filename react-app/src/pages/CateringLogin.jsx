import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setToken } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";

const CateringLogin = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(`${apiBase}/staff/login`, {
        email,
        password,
      });
      const data = res.data;
      if (res.status === 200 && data.token) {
        dispatch(setToken({ token: data.token, role: "staff" }));
        navigate("/foodstaff");
      } else {
        setMessage(data.message || "Invalid email or password.");
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
            <h2>Catering Staff Login</h2>
            <p>
              Coordinate meal orders, update delivery statuses, and serve passengers
              efficiently.
            </p>
          </div>
        </div>

        <form className="form-grid" onSubmit={login}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="name@railway.gov.in"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
      </section>
    </main>
  );
};

export default CateringLogin;
