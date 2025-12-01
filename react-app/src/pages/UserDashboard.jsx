import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchNews } from "../store/slices/newsSlice";
import { clearPassengerToken } from "../store/slices/authSlice";
import { useApi } from "../context/ApiContext";
import { useTheme } from "../context/ThemeContext";

const UserDashboard = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const token = useSelector((state) => state.auth.passengerToken);
  const { items: newsItems, status: newsStatus } = useSelector(
    (state) => state.news
  );
  const [welcomeText, setWelcomeText] = useState("Verifying your session...");

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) return;
      const res = await fetch(`${apiBase}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWelcomeText(`Hello, ${data.username}!`);
      } else {
        dispatch(clearPassengerToken());
        navigate("/login");
      }
    };
    loadDashboard();
  }, [apiBase, dispatch, navigate, token]);

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  const logout = () => {
    dispatch(clearPassengerToken());
    navigate("/login");
  };

  const renderNews = () => {
    if (newsStatus === "loading") {
      return <p className="muted-text">Loading the latest updates...</p>;
    }
    if (!newsItems || newsItems.length === 0) {
      return (
        <p className="muted-text">
          No announcements have been published yet.
        </p>
      );
    }
    return newsItems.map((n) => (
      <article className="news-card" key={n._id}>
        {n.imageUrl ? <img src={n.imageUrl} alt={n.title} /> : null}
        <div className="news-card__body">
          <h3>{n.title}</h3>
          <p>{n.description || ""}</p>
          <time>
            Posted on {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
          </time>
        </div>
      </article>
    ));
  };

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Passenger Dashboard</h1>
            <p id="welcome" className="muted-text">
              {welcomeText}
            </p>
          </div>
          <div
            className="dashboard-actions"
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
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
            <Link className="btn btn-ghost" to="/lostnfound">
              Lost and Found
            </Link>
            <button className="btn btn-tonal" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <div className="divider"></div>

        <h2 className="card-section-title">Quick Actions</h2>
        <p>Access the services you need in a single click.</p>

        <div className="link-grid">
          <Link className="link-tile" to="/complaint">
            <strong>File a Complaint</strong>
            <span>Raise an issue and monitor progress</span>
          </Link>
          <Link className="link-tile" to="/order">
            <strong>Order Onboard Meals</strong>
            <span>Browse the live menu and track your order</span>
          </Link>
          <Link className="link-tile" to="/emergency">
            <strong>Emergency Request</strong>
            <span>Notify the control room for urgent help</span>
          </Link>
          <Link className="link-tile" to="/feedback">
            <strong>Share Feedback</strong>
            <span>Help us improve your journey experience</span>
          </Link>
        </div>
      </section>

      <section className="surface-card">
        <div className="page-header">
          <div>
            <h2>Latest News &amp; Updates</h2>
            <p className="muted-text">
              Stay informed with important announcements from Indian Railways.
            </p>
          </div>
        </div>
        <div id="news-section">{renderNews()}</div>
      </section>
    </main>
  );
};

export default UserDashboard;
