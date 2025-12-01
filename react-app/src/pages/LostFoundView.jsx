import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useApi } from "../context/ApiContext";

const LostFoundView = () => {
  const { apiBase } = useApi();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [filter, setFilter] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/lostnfound`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      let dataItems = res.ok && result.items ? result.items : [];
      if (filter) {
        dataItems = dataItems.filter((item) => item.category === filter);
      }
      setItems(dataItems);
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [filter]);

  return (
    <main className="page-shell fade-in">
      <header className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className="badge">Rail Madad</span>
          <h1 style={{ margin: 0 }}>Lost and Found Items</h1>
        </div>
        <div className="actions-inline">
          <Link className="btn btn-ghost" to="/">
            Home
          </Link>
          <Link className="btn btn-tonal" to="/userDashboard">
            Dashboard
          </Link>
          <Link className="btn btn-ghost" to="/lostnfound">
            Submit Lost/Found
          </Link>
        </div>
      </header>
      <section className="surface-card card-highlight">
        <div className="input-group">
          <label htmlFor="filter">Filter by Category</label>
          <select
            id="filter"
            className="form-select"
            style={{ marginTop: "0.35rem" }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
          </select>
        </div>
      </section>
      <section className="surface-card">
        <h2 className="card-section-title" style={{ marginBottom: "0.6rem" }}>
          Results
        </h2>
        <div id="user-submissions" className="list-card">
          {loading ? (
            <div className="empty-state">Loading items...</div>
          ) : items.length ? (
            items.map((item) => (
              <article className="list-card-item" key={item._id}>
                <h3 style={{ marginBottom: "0.4rem" }}>
                  {item.title}{" "}
                  <span className="badge-neutral" style={{ fontSize: "13px" }}>
                    {item.category}
                  </span>
                </h3>
                <p className="muted-text">{item.description}</p>
                <p>
                  <span className="badge">Date</span>{" "}
                  {item.date ? new Date(item.date).toLocaleDateString() : ""} |{" "}
                  <span className="badge">Location</span> {item.location}
                </p>
                <p className="muted-text">
                  <b>Contact Info:</b> {item.contactInfo ? item.contactInfo : "N/A"}
                </p>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    style={{ maxWidth: "110px", borderRadius: "8px", marginTop: "8px" }}
                  />
                ) : null}
                <span
                  className={`status-pill ${
                    item.status === "resolved" ? "success" : "warning"
                  }`}
                >
                  {item.status}
                </span>
              </article>
            ))
          ) : (
            <div className="empty-state">No items found for this category.</div>
          )}
        </div>
      </section>
      <footer style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <p className="muted-text">
          Ac 2025 Rail Madad - Indian Railways. All Rights Reserved.
        </p>
      </footer>
    </main>
  );
};

export default LostFoundView;
