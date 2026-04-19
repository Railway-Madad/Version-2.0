import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "./Home.css";

// Icons
const Icons = {
  Train: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><path d="M8 15h.01"/><path d="M16 15h.01"/>
    </svg>
  ),
  Sun: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
    </svg>
  ),
  Moon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  ),
  MessageCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
    </svg>
  ),
  Utensils: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  Bell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
    </svg>
  ),
  MessageSquare: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  ChefHat: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  ),
  Login: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/>
    </svg>
  ),
  UserPlus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
    </svg>
  ),
};

const FEATURES = [
  { icon: "MessageCircle", color: "blue", title: "Complaint Management", desc: "Submit, track, and resolve complaints quickly with real-time status updates and notifications." },
  { icon: "Utensils", color: "cyan", title: "Food Services", desc: "Order meals onboard, browse menus, and track your delivery with live order updates." },
  { icon: "AlertTriangle", color: "red", title: "Emergency Assistance", desc: "One-tap emergency alerts for medical, security, or safety issues with immediate response." },
  { icon: "Search", color: "purple", title: "Lost & Found", desc: "Report lost items or search found belongings across the railway network efficiently." },
  { icon: "Bell", color: "orange", title: "Live Announcements", desc: "Stay informed with real-time platform updates, delays, and service announcements." },
  { icon: "MessageSquare", color: "green", title: "Feedback System", desc: "Share your travel experience and help improve railway services with your valuable feedback." },
];

const ROLES = [
  {
    icon: <Icons.User />,
    title: "For Passengers",
    desc: "Access booking support, raise complaints, order food onboard, and request emergency assistance in real-time.",
    links: [
      { to: "/login", icon: <Icons.Login />, title: "Passenger Login", subtitle: "Access your dashboard" },
      { to: "/register", icon: <Icons.UserPlus />, title: "Create Account", subtitle: "Sign up as a passenger" },
    ],
  },
  {
    icon: <Icons.Shield />,
    title: "For Administrators",
    desc: "Monitor system performance, manage announcements, review analytics, and maintain service quality standards.",
    links: [
      { to: "/admin-select", icon: <Icons.Login />, title: "Admin Login", subtitle: "Train Admin or Super Admin" },
    ],
  },
  {
    icon: <Icons.Users />,
    title: "For Rail Staff",
    desc: "Stay updated with assigned tasks, track complaints, collaborate across teams, and manage day-to-day operations.",
    links: [
      { to: "/staff_login", icon: <Icons.Login />, title: "Staff Login", subtitle: "Access your workspace" },
    ],
  },
  {
    icon: <Icons.ChefHat />,
    title: "Catering Operations",
    desc: "Coordinate onboard meals, fulfil food orders, manage inventory, and keep passengers informed in real-time.",
    links: [
      { to: "/cateringlogin", icon: <Icons.Login />, title: "Catering Login", subtitle: "Access catering dashboard" },
    ],
  },
];

const Home = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`home-page ${isDark ? "dark" : ""}`}>
      {/* Navigation */}
      <nav className="home-nav">
        <div className="home-logo">
          <div className="home-logo-icon">
            <Icons.Train />
          </div>
          <span className="home-logo-text">Rail Madad</span>
        </div>
        <div className="home-nav-actions">
          <button 
            className="home-theme-btn"
            onClick={toggleTheme}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? <Icons.Sun /> : <Icons.Moon />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-bg" />
        <div className="home-hero-pattern" />
        <div className="home-hero-content">
          
          
          <h1 className="home-hero-title">
            Experience a Faster Way to{" "}
            <span className="home-hero-title-highlight">Handle Railway Support</span>
          </h1>
          <p className="home-hero-subtitle">
            Log in based on your role and keep complaints, food services, emergencies, 
            and feedback flowing smoothly with our unified platform.
          </p>
          <div className="home-hero-cta">
            <Link to="/login" className="home-btn home-btn-primary">
              <Icons.Login />
              Passenger Login
            </Link>
            <Link to="/register" className="home-btn home-btn-secondary">
              <Icons.UserPlus />
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="home-features">
        <div className="home-section-header">
          <h2 className="home-section-title">Everything You Need</h2>
          <p className="home-section-subtitle">
            A comprehensive platform designed to handle all aspects of railway passenger support.
          </p>
        </div>
        <div className="home-features-grid">
          {FEATURES.map((feature, idx) => (
            <article key={idx} className="home-feature-card">
              <div className={`home-feature-icon ${feature.color}`}>
                {Icons[feature.icon] && Icons[feature.icon]()}
              </div>
              <h3 className="home-feature-title">{feature.title}</h3>
              <p className="home-feature-desc">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="home-roles">
        <div className="home-section-header">
          <h2 className="home-section-title">Choose Your Portal</h2>
          <p className="home-section-subtitle">
            Access the right dashboard based on your role in the railway ecosystem.
          </p>
        </div>
        <div className="home-roles-grid">
          {ROLES.map((role, idx) => (
            <article key={idx} className="home-role-card">
              <div className="home-role-header">
                <div className="home-role-icon">{role.icon}</div>
                <h3 className="home-role-title">{role.title}</h3>
              </div>
              <p className="home-role-desc">{role.desc}</p>
              <div className="home-role-links">
                {role.links.map((link, linkIdx) => (
                  <Link key={linkIdx} to={link.to} className="home-role-link">
                    {link.icon}
                    <div className="home-role-link-content">
                      <div className="home-role-link-title">{link.title}</div>
                      <div className="home-role-link-subtitle">{link.subtitle}</div>
                    </div>
                    <span className="home-role-link-arrow">
                      <Icons.ArrowRight />
                    </span>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Stats Section
      <section className="home-stats">
        <div className="home-stats-grid">
          <div className="home-stat">
            <div className="home-stat-value">50K+</div>
            <div className="home-stat-label">Complaints Resolved</div>
          </div>
          <div className="home-stat">
            <div className="home-stat-value">100K+</div>
            <div className="home-stat-label">Meals Delivered</div>
          </div>
          <div className="home-stat">
            <div className="home-stat-value">500+</div>
            <div className="home-stat-label">Trains Covered</div>
          </div>
          <div className="home-stat">
            <div className="home-stat-value">99.5%</div>
            <div className="home-stat-label">Satisfaction Rate</div>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-content">
          <div className="home-footer-logo">
            <div className="home-logo-icon" style={{ width: 32, height: 32 }}>
              <Icons.Train />
            </div>
            <span className="home-logo-text">Rail Madad</span>
          </div>
          <p className="home-footer-text">
            Streamlining railway passenger support with modern technology and seamless experiences.
          </p>
          <div className="home-footer-links">
            <Link to="/login" className="home-footer-link">Passenger Portal</Link>
            <Link to="/admin-select" className="home-footer-link">Admin Portal</Link>
            <Link to="/staff_login" className="home-footer-link">Staff Portal</Link>
            <Link to="/cateringlogin" className="home-footer-link">Catering Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
