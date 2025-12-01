const SettingsPanel = ({ theme, onToggleTheme, settings, onToggleSetting }) => {
  return (
    <div className="settings-grid">
      <label className="toggle">
        <input type="checkbox" checked={theme === "light"} onChange={onToggleTheme} />
        <span>
          Theme: <strong>{theme === "light" ? "Light" : "Dark"}</strong>
        </span>
      </label>
      <label className="toggle">
        <input
          type="checkbox"
          checked={settings.persistLogin}
          onChange={() => onToggleSetting("persistLogin")}
        />
        <span>Persist login session</span>
      </label>
      <label className="toggle">
        <input
          type="checkbox"
          checked={settings.notifications}
          onChange={() => onToggleSetting("notifications")}
        />
        <span>Enable notifications</span>
      </label>
      <label className="toggle">
        <input
          type="checkbox"
          checked={settings.compactMode}
          onChange={() => onToggleSetting("compactMode")}
        />
        <span>Compact cards &amp; tables</span>
      </label>
    </div>
  );
};

export default SettingsPanel;
