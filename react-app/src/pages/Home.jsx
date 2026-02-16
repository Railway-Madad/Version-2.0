import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Home = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <main className="page-shell fade-in">
      <section className="surface-card hero">
        <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
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
        </div>
        <h1>Rail Madad Platform</h1>
        <h2 className="pl-8">Experience a faster, calmer way to handle railway support.</h2>
        <p>
          Log in based on your role and keep complaints, food services,
          emergencies, and feedback flowing smoothly.
        </p>
        <div className="actions-inline">
          <Link className="btn" to="/login">
            Passenger Login
          </Link>
          <Link className="btn btn-ghost" to="/register">
            Create Passenger Account
          </Link>
        </div>
      </section>

      <section className="content-grid two-column">
        <article className="surface-card card-highlight">
          <h2 className="card-section-title">For Passengers</h2>
          <p>
            Access booking support, raise complaints, order food onboard, and
            request emergency assistance.
          </p>
          <div className="link-grid">
            <Link className="link-tile" to="/login">
              <strong>User Login</strong>
              <span>Access your personalised dashboard</span>
            </Link>
            <Link className="link-tile" to="/register">
              <strong>User Register</strong>
              <span>Sign up for a new passenger account</span>
            </Link>
          </div>
        </article>

        <article className="surface-card">
          <h2 className="card-section-title">For Administrators</h2>
          <p>
            Monitor system performance, manage announcements, and keep service
            quality aligned.
          </p>
          <div className="link-grid">
            <Link className="link-tile" to="/adminlogin">
              <strong>Admin Login</strong>
              <span>Manage operations and insights</span>
            </Link>
            <Link className="link-tile" to="/adminregister">
              <strong>Admin Register</strong>
              <span>Onboard a new administrator</span>
            </Link>
          </div>
        </article>

        <article className="surface-card">
          <h2 className="card-section-title">For Rail Staff</h2>
          <p>
            Stay updated with assigned tasks, track complaints, and collaborate
            across teams.
          </p>
          <div className="link-grid">
            <Link className="link-tile" to="/staff_login">
              <strong>Staff Login</strong>
              <span>Continue where you left off</span>
            </Link>
            <Link className="link-tile" to="/staff_register">
              <strong>Staff Register</strong>
              <span>Request a new staff account</span>
            </Link>
          </div>
        </article>

        <article className="surface-card">
          <h2 className="card-section-title">Catering Operations</h2>
          <p>
            Coordinate onboard meals, fulfil orders, and keep passengers
            informed in real-time.
          </p>
          <div className="link-grid">
            <Link className="link-tile" to="/cateringlogin">
              <strong>Catering Staff Login</strong>
              <span>Access catering dashboards &amp; orders</span>
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
};

export default Home;
