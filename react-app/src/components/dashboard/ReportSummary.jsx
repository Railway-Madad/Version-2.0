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

        </ul>
      </div>
    </>
  );
};

export default ReportSummary;
