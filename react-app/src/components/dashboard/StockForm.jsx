const StockForm = ({ stockForm, editingId, onChange, onSubmit, onCancel }) => {
  return (
    <form className="grid-two" onSubmit={onSubmit}>
      <div className="input-group">
        <label htmlFor="name">Item Name</label>
        <input
          id="name"
          type="text"
          required
          value={stockForm.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={stockForm.category}
          onChange={(e) => onChange("category", e.target.value)}
        >
          <option>Maintenance</option>
          <option>Electronics</option>
          <option>Catering</option>
          <option>Logistics</option>
        </select>
      </div>
      <div className="input-group">
        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          type="number"
          min="0"
          required
          value={stockForm.quantity}
          onChange={(e) => onChange("quantity", e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={stockForm.status}
          onChange={(e) => onChange("status", e.target.value)}
        >
          <option value="in-stock">In Stock</option>
          <option value="low">Low</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      <div className="form-actions">
        <button className="btn" type="submit">
          {editingId ? "Update Item" : "Add Item"}
        </button>
        {editingId ? (
          <button className="btn btn-ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default StockForm;
