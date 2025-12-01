const PageHeader = ({ title, subtitle, actions, children }) => {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p className="muted-text">{subtitle}</p> : null}
        {children}
      </div>
      {actions ? <div className="dashboard-actions">{actions}</div> : null}
    </header>
  );
};

export default PageHeader;
