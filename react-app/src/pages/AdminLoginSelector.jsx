import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const AdminLoginSelector = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="auth-layout fade-in">
      <section className="surface-card auth-card" style={{ maxWidth: "520px" }}>
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

        <div className="stack">
          <div>
            <h2>Administrator Access</h2>
            <p>Select your administrator role to continue to the appropriate login.</p>
          </div>
        </div>

        <div className="link-grid" style={{ marginTop: "1.5rem" }}>
          <Link className="link-tile" to="/adminlogin" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "0.5rem", opacity: 0.8 }}>
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M12 2v4m-4 0h8"/>
              <circle cx="12" cy="12" r="2"/>
              <path d="M7 18v2m10-2v2"/>
            </svg>
            <strong>Train Admin</strong>
            <span>Manage a specific train — food, complaints, staff, news &amp; analytics for your assigned train</span>
          </Link>

          <Link className="link-tile" to="/superadmin-login" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "0.5rem", opacity: 0.8 }}>
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <strong>Super Admin</strong>
            <span>View system-wide analytics across all trains — orders, revenue, complaints &amp; performance</span>
          </Link>
        </div>

        <p className="form-meta" style={{ marginTop: "1.5rem" }}>
          <Link to="/">← Back to Home</Link>
        </p>
      </section>
    </main>
  );
};

export default AdminLoginSelector;
