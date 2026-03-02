import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { setStaffToken, setStaffTrainNo } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";

const StaffLogin = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
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
    if (!email || !password || !trainNo) {
      setMessage("Please fill in all fields including train number.");
      return;
    }
    try {
      const res = await axios.post(`${apiBase}/staff/login`, {
        email,
        password,
        trainNo,
      }, {
        withCredentials: true
      });
      const data = res.data;
      if (res.status === 200) {
        dispatch(setStaffToken("authenticated"));
        dispatch(setStaffTrainNo(trainNo));
        navigate("/staffDashboard");
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
            <h2>Rail Staff Login</h2>
            <p>
              Access your assignments, review passenger updates, and keep journeys running
              smoothly.
            </p>
          </div>
          <div className="message" id="msg" role="alert">
            {message}
          </div>
        </div>

        <form className="form-grid" onSubmit={login}>
          <div className="input-group">
            <label htmlFor="staffemail">Staff Email</label>
            <input
              type="email"
              id="staffemail"
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
            Login
          </button>
        </form>

        <p className="form-meta">
          Need access? <Link to="/staff_register">Create a staff account</Link>
        </p>
      </section>
    </main>
  );
};

export default StaffLogin;
