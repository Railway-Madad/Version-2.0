const StockFilters = ({ filters, onChange, onReset }) => {
  return (
    <div className="filters">
      <div className="input-group">
        <label htmlFor="query">Search</label>
        <input
          id="query"
          type="search"
          placeholder="Search by name or ID"
          value={filters.query}
          onChange={(e) => onChange("query", e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => onChange("category", e.target.value)}
        >
          <option value="all">All</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Electronics">Electronics</option>
          <option value="Catering">Catering</option>
          <option value="Logistics">Logistics</option>
        </select>
      </div>
      <div className="input-group">
        <label htmlFor="filter-status">Status</label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) => onChange("status", e.target.value)}
        >
          <option value="all">All</option>
          <option value="in-stock">In Stock</option>
          <option value="low">Low</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>
      <button className="btn btn-tonal" onClick={onReset} type="button">
        Reset filters
      </button>
    </div>
  );
};

export default StockFilters;
