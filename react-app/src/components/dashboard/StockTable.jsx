const StockTable = ({ items, onEdit, onDelete }) => {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Item</th>
            <th>Category</th>
            <th>Qty</th>
            <th>Status</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="7" className="muted-text">
                No items match your filters yet.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>
                  <span className={`pill pill-${item.status}`}>{item.status}</span>
                </td>
                <td>
                  {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "—"}
                </td>
                <td className="table-actions">
                  <button className="btn btn-ghost" onClick={() => onEdit(item)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => onDelete(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;
