import { useEffect, useState } from "react";
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
  const [loadingTrains, setLoadingTrains] = useState(false);

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    try {
      setLoadingTrains(true);
      const res = await axios.get(`${apiBase}/api/trains`);
      if (res.data.success) {
        setTrains(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching trains:", error);
    } finally {
      setLoadingTrains(false);
    }
  };

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
        dispatch(setAdminTrainNo(trainNo));
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

  return (
    <main className="auth-layout fade-in">
      <section className="surface-card auth-card">
        <div className="stack">
          <div>
            <h2>Administrator Login</h2>
            <p>
              Authenticate to access the operations dashboard, manage updates, and
              monitor feedback.
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
          <div className="input-group">
            <label htmlFor="trainNo">Train Number</label>
            <select
              id="trainNo"
              value={trainNo}
              onChange={(e) => setTrainNo(e.target.value)}
              required
              disabled={loadingTrains}
            >
              <option value="">
                {loadingTrains ? "Loading trains..." : "Select a train"}
              </option>
              {trains.map((train) => (
                <option key={train.id} value={train.trainNumber}>
                  {train.trainNumber}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" type="submit">
            Sign In
          </button>
        </form>

        <p className="form-meta">
          Need an account?{" "}
          <Link to="/adminregister">Register a new administrator</Link>
        </p>
        {message ? <p className="message error">{message}</p> : null}
      </section>
    </main>
  );
};

export default AdminLogin;
