import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { clearPassengerToken } from "../store/slices/authSlice";

const Emergency = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isPassengerAuthenticated);
  const [username, setUsername] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated) {
        dispatch(clearPassengerToken());
        navigate("/login");
        return;
      }
      try {
        const res = await fetch(`${apiBase}/user/profile`, {
          credentials: 'include'
        });
        if (res.status === 401) {
          dispatch(clearPassengerToken());
          navigate("/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUsername(data.user?.username || "");
      } catch (err) {
        dispatch(clearPassengerToken());
        navigate("/login");
      }
    };
    if (isAuthenticated) {
      loadProfile();
    } else {
      dispatch(clearPassengerToken());
      navigate("/login");
    }
  }, [apiBase, dispatch, navigate, isAuthenticated]);

  const submitEmergency = async (e) => {
    e.preventDefault();
    setResult("");
    try {
      const res = await fetch(`${apiBase}/emergency/postEmg`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          trainNumber,
          seatNumber,
        }),
      });
      if (res.status === 401) {
        dispatch(clearPassengerToken());
        navigate("/login");
        return;
      }
      const data = await res.json();
      setResult(data.message || data.error || "");
      setTrainNumber("");
      setSeatNumber("");
    } catch (err) {
      setResult("Something went wrong!");
    }
  };

  return (
    <main className="auth-layout fade-in">
      <section className="surface-card auth-card">
        <div className="stack">
          <div>
            <h2>Emergency Assistance Request</h2>
            <p>
              Please confirm your details so our response team can reach you
              instantly.
            </p>
          </div>
          <p className="message" id="result" role="alert">
            {result}
          </p>
        </div>

        <form id="emergencyForm" className="form-grid" onSubmit={submitEmergency}>
          <div className="input-group">
            <label htmlFor="username">Passenger Username</label>
            <input
              type="text"
              id="username"
              placeholder="Registered username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="trainNumber">Train Number</label>
            <input
              type="text"
              id="trainNumber"
              placeholder="Enter 10-digit train number"
              required
              pattern="\d{10}"
              maxLength={10}
              minLength={10}
              title="Train number must be exactly 10 digits"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="seatNumber">Coach-Seat</label>
            <input
              type="text"
              id="seatNumber"
              placeholder="e.g. S1-45"
              required
              pattern="^[A-Z]{1,2}\d{1,2}-\d{1,3}$"
              title="Format: CoachSeat-SeatNumber (e.g., S1-45, B12-123)"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
            />
          </div>

          <button className="btn" type="submit">
            Submit Request
          </button>
        </form>
      </section>
    </main>
  );
};

export default Emergency;
