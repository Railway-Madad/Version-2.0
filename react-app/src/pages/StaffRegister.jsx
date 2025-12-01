import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useApi } from "../context/ApiContext";

const StaffRegister = () => {
  const { apiBase } = useApi();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const register = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!name || !role || !email || !password || !phone) {
      setMessage("Please fill in all fields.");
      setIsError(true);
      return;
    }

    try {
      const res = await axios.post(`${apiBase}/staff/register`, {
        name,
        role,
        email,
        password,
        phone,
      });
      const data = res.data;
      setMessage(data.message || "Registration successful! Redirecting to login...");
      setIsError(false);
      setTimeout(() => navigate("/staff_login"), 1500);
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
            <h2>Create Staff Account</h2>
            <p>
              Become part of the Rail Madad network and collaborate across departments
              seamlessly.
            </p>
          </div>
          <div
            className="message"
            id="msg"
            role="alert"
            style={{ color: isError ? "red" : "green" }}
          >
            {message}
          </div>
        </div>

        <form className="form-grid" onSubmit={register}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              placeholder="Staff name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="role">Primary Role</label>
            <select
              id="role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="Cleaning">Cleaning</option>
              <option value="Catering">Catering</option>
              <option value="Security">Security</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Medical">Medical</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="email">Official Email</label>
            <input
              type="email"
              id="email"
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
              placeholder="Create a secure password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="phone">Contact Number</label>
            <input
              type="tel"
              id="phone"
              placeholder="e.g. 9876543210"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button className="btn" type="submit">
            Register Staff Account
          </button>
        </form>

        <p className="form-meta">
          Already part of the team? <Link to="/staff_login">Sign in here</Link>
        </p>
      </section>
    </main>
  );
};

export default StaffRegister;
