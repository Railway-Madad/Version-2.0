import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useApi } from "../context/ApiContext";

const AdminRegister = () => {
  const { apiBase } = useApi();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [trainNo, setTrainNo] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const register = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (!name || !username || !email || !password || !trainNo) {
      setMessage("All fields including train number are required.");
      setIsError(true);
      return;
    }

    try {
      const res = await axios.post(`${apiBase}/admin/register`, {
        name,
        username,
        email,
        password,
        trainNo,
      }, {
        withCredentials: true
      });
      const data = res.data;
      if (data.success) {
        setMessage(data.message || "Admin registered successfully!");
        setIsError(false);
        setTimeout(() => navigate("/adminlogin"), 500);
      } else {
        setMessage(data.message || "Registration failed.");
        setIsError(true);
      }
    } catch (error) {
      setIsError(true);
      if (error.response) {
        setMessage(error.response.data?.message || "Registration failed.");
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
            <h2>Register an Administrator</h2>
            <p>
              Grant secure access to oversee complaints, announcements, and onboard
              services.
            </p>
          </div>
        </div>

        <form className="form-grid" onSubmit={register}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Admin name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Choose a unique username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="name@example.com"
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
              placeholder="Create a strong password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="trainNo">Train Number</label>
            <input
              type="text"
              id="trainNo"
              name="trainNo"
              placeholder="e.g., 1234567890"
              required
              value={trainNo}
              onChange={(e) => setTrainNo(e.target.value)}
            />
          </div>
          <button className="btn" type="submit">
            Create Admin Account
          </button>
        </form>

        <p className="form-meta">
          Already have access? <Link to="/adminlogin">Return to login</Link>
        </p>
        {message ? (
          <p className="message" style={{ color: isError ? "red" : "green" }}>
            {message}
          </p>
        ) : null}
      </section>
    </main>
  );
};

export default AdminRegister;
