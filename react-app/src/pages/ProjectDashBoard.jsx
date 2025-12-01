import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import StockForm from "../components/dashboard/StockForm";
import StockFilters from "../components/dashboard/StockFilters";
import StockTable from "../components/dashboard/StockTable";
import ReportSummary from "../components/dashboard/ReportSummary";
import ProfileForm from "../components/dashboard/ProfileForm";
import SettingsPanel from "../components/dashboard/SettingsPanel";
import StatusBanner from "../components/dashboard/StatusBanner";
import { useStockManager } from "../hooks/useStockManager";
import { toggleSetting } from "../store/slices/settingsSlice";
import { useTheme } from "../context/ThemeContext";

const ProjectDashboard = () => {
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const settings = useSelector((state) => state.settings);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    department: "Operations",
  });
  const [statusMessage, setStatusMessage] = useState("");

  const {
    stockForm,
    setStockFormValue,
    editingId,
    startEdit,
    resetFormState,
    submitStockForm,
    removeItem,
    filters,
    updateFilter,
    clearFilters,
    filteredItems,
    reportStats,
  } = useStockManager({ onStatus: setStatusMessage });

  useEffect(() => {
    setProfileForm({
      name: "",
      email: "",
      department: "Operations",
    });
  }, []);

  useEffect(() => {
    if (!statusMessage) return undefined;
    const timeout = setTimeout(() => setStatusMessage(""), 3200);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  const handleStockSubmit = (e) => {
    e.preventDefault();
    submitStockForm();
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setStatusMessage("Profile updated in local state.");
  };

  const handleProfileChange = (key, value) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSettingToggle = (key) => dispatch(toggleSetting(key));

  const latestUpdatedAt = filteredItems[0]?.updatedAt || null;

  return (
    <main className="page-shell fade-in dashboard">
      <section className="surface-card hero">
        <div className="badge">React + Redux Toolkit</div>
        <h1>Operations Dashboard</h1>
        <p>
          A modern, persistent dashboard showcasing login-protected access,
          stock entry, real-time filtering, reporting, profile management, and
          theme-aware settings.
        </p>
        <div className="actions-inline">
          <Link className="btn btn-ghost" to="/userDashboard">
            Back to Passenger Dashboard
          </Link>
          <button className="btn" type="button" onClick={toggleTheme}>
            Toggle {theme === "light" ? "Dark" : "Light"} Theme
          </button>
        </div>
        <div className="note">
          State persistence is powered by redux-persist; context handles theme
          and the authentication flow stays intact.
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="surface-card">
          <div className="page-header">
            <div>
              <h2>Stock Entry Module</h2>
              <p className="muted-text">
                Add, update, or delete stock items using controlled React forms
                stored in Redux Toolkit.
              </p>
            </div>
            <span className="badge">Controlled Form</span>
          </div>

          <StockForm
            stockForm={stockForm}
            editingId={editingId}
            onSubmit={handleStockSubmit}
            onCancel={resetFormState}
            onChange={setStockFormValue}
          />

          <div className="divider"></div>

          <div className="stack">
            <StockFilters
              filters={filters}
              onChange={updateFilter}
              onReset={clearFilters}
            />
            <StockTable
              items={filteredItems}
              onEdit={startEdit}
              onDelete={removeItem}
            />
          </div>
        </article>

        <article className="surface-card">
          <div className="page-header">
            <div>
              <h2>Reports &amp; Insights</h2>
              <p className="muted-text">
                Live metrics sourced from the global Redux store.
              </p>
            </div>
            <span className="badge">Live</span>
          </div>

          <ReportSummary reportStats={reportStats} latestUpdatedAt={latestUpdatedAt} />
        </article>

        <article className="surface-card">
          <div className="page-header">
            <div>
              <h2>User Profile</h2>
              <p className="muted-text">
                Edit profile data kept in global state for consistent rendering.
              </p>
            </div>
            <span className="badge">Context + Redux</span>
          </div>

          <ProfileForm
            profileForm={profileForm}
            onChange={handleProfileChange}
            onSubmit={handleProfileSubmit}
          />
        </article>

        <article className="surface-card">
          <div className="page-header">
            <div>
              <h2>Settings</h2>
              <p className="muted-text">
                Theme switching, login persistence, and notification preferences.
              </p>
            </div>
            <span className="badge">Context API</span>
          </div>

          <SettingsPanel
            theme={theme}
            onToggleTheme={toggleTheme}
            settings={settings}
            onToggleSetting={handleSettingToggle}
          />
          <p className="muted-text">
            Settings persist automatically via redux-persist to keep your
            preferences intact across reloads.
          </p>
        </article>
      </section>

      <StatusBanner message={statusMessage} />
    </main>
  );
};

export default ProjectDashboard;
