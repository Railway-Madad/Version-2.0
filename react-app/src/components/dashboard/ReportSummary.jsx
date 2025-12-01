const ReportSummary = ({ reportStats, latestUpdatedAt }) => {
  return (
    <>
      <div className="stat-grid">
        <div className="stat-card">
          <p className="muted-text">Total Items</p>
          <strong>{reportStats.totalItems}</strong>
        </div>
        <div className="stat-card">
          <p className="muted-text">Total Quantity</p>
          <strong>{reportStats.totalQuantity}</strong>
        </div>
        <div className="stat-card">
          <p className="muted-text">Low Stock</p>
          <strong>{reportStats.lowStock}</strong>
        </div>
        <div className="stat-card">
          <p className="muted-text">Categories</p>
          <strong>{reportStats.categories}</strong>
        </div>
      </div>

      <div className="report-card">
        <h3>Real-time Report</h3>
        <p>
          Filters, table data, and stats derive from the same Redux slice to keep the
          UI synchronized. Persistence ensures the report survives reloads.
        </p>
        <ul className="report-list">
          <li>
            Most recent update:
            <strong>
              {" "}
              {latestUpdatedAt
                ? new Date(latestUpdatedAt).toLocaleString()
                : "No records yet"}
            </strong>
          </li>
          <li>Search &amp; filter driven by controlled inputs + memoized selectors.</li>
          <li>Data persisted via redux-persist for offline resilience.</li>
        </ul>
      </div>
    </>
  );
};

export default ReportSummary;
