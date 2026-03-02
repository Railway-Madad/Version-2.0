import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useApi } from "../context/ApiContext";

const LostFound = () => {
  const { apiBase } = useApi();
  const isAuthenticated = useSelector((state) => state.auth.isPassengerAuthenticated);
  const passengerTrainNo = useSelector((state) => state.auth.passengerTrainNo);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Lost");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [items, setItems] = useState([]);

  const loadUserSubmissions = async () => {
    try {
      const res = await fetch(`${apiBase}/lostnfound/myitems`, {
        credentials: 'include'
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const result = await res.json();
      if (res.ok && result.items) {
        setItems(result.items);
      } else {
        setItems([]);
      }
    } catch (err) {
      setItems([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUserSubmissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const submitItem = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("date", date);
    formData.append("location", location);
    if (image) formData.append("image", image);

    const res = await fetch(`${apiBase}/lostnfound`, {
      method: "POST",
      credentials: 'include',
      body: formData,
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const result = await res.json();
    if (res.ok) {
      alert("Item submitted successfully!");
      setTitle("");
      setDescription("");
      setCategory("Lost");
      setDate("");
      setLocation("");
      setImage(null);
      loadUserSubmissions();
    } else {
      alert("Error: " + result.message);
    }
  };

  const markAsResolved = async (id) => {
    const res = await fetch(`${apiBase}/lostnfound/${id}/resolve`, {
      method: "PUT",
      credentials: 'include',
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    if (res.ok) {
      alert("Item marked as resolved.");
      loadUserSubmissions();
    } else {
      alert("Error marking as resolved");
    }
  };

  const deleteItem = async (id) => {
    const res = await fetch(`${apiBase}/lostnfound/${id}`, {
      method: "DELETE",
      credentials: 'include',
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    if (res.ok) {
      alert("Item deleted.");
      loadUserSubmissions();
    } else {
      const data = await res.json();
      alert("Error: " + (data.message || "Failed to delete"));
    }
  };

  return (
    <main className="page-shell fade-in">
      <header className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className="badge">Rail Madad</span>
          <h1 style={{ margin: 0 }}>Lost and Found</h1>
        </div>
        <div className="actions-inline">
          <Link className="btn btn-ghost" to="/">
            Home
          </Link>
          <Link className="btn btn-tonal" to="/userDashboard">
            Dashboard
          </Link>
          <Link className="btn btn-ghost" to="/lostnfoundView">
            View Items
          </Link>
        </div>
      </header>
      <section className="surface-card card-highlight">
        <h2 className="card-section-title" style={{ marginBottom: "1.2rem" }}>
          Report a Lost or Found Item
        </h2>
        <form
          id="lost-found-form"
          className="form-grid"
          onSubmit={submitItem}
          encType="multipart/form-data"
        >
          <div style={{
            backgroundColor: "#E8F5E9",
            border: "2px solid #4CAF50",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{ fontSize: "20px" }}>🚆</div>
            <div>
              <strong style={{ color: "#2E7D32", fontSize: "15px" }}>Current Train: {passengerTrainNo || "N/A"}</strong>
              <p style={{ margin: "4px 0 0 0", color: "#555", fontSize: "13px" }}>Reporting item for this train</p>
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="title">Item Name</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="input-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="date">Date Lost/Found</label>
            <input
              type="date"
              id="date"
              name="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="image">Image (optional)</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>
          <button type="submit" className="btn">
            Submit
          </button>
        </form>
      </section>
      <section className="surface-card">
        <h2 className="card-section-title">Your Submissions</h2>
        <div id="user-submissions" className="list-card">
          {items.length ? (
            items.map((item) => (
              <article className="list-card-item" key={item._id}>
                <h3 style={{ marginBottom: "0.25rem" }}>
                  {item.title}{" "}
                  <span className="badge-neutral" style={{ fontSize: "13px" }}>
                    {item.category}
                  </span>
                  <span style={{
                    display: "inline-block",
                    backgroundColor: item.trainNumber === passengerTrainNo ? "#E8F5E9" : "#F3E5F5",
                    color: item.trainNumber === passengerTrainNo ? "#2E7D32" : "#6A1B9A",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    marginLeft: "8px"
                  }}>
                    🚆 {item.trainNumber || "N/A"}
                  </span>
                </h3>
                <p className="muted-text">{item.description}</p>
                <p>
                  <span className="badge">Date</span>{" "}
                  {item.date ? new Date(item.date).toLocaleDateString() : ""} |{" "}
                  <span className="badge">Location</span> {item.location}
                </p>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    style={{ maxWidth: "90px", borderRadius: "10px", marginTop: "7px" }}
                  />
                ) : null}
                <div className="actions-inline" style={{ marginTop: "8px" }}>
                  <button
                    className="btn btn-tonal"
                    type="button"
                    onClick={() => markAsResolved(item._id)}
                  >
                    Mark as Resolved
                  </button>
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => deleteItem(item._id)}
                  >
                    Delete
                  </button>
                  <span
                    className={`status-pill ${
                      item.status === "resolved" ? "success" : "warning"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">No submissions found.</div>
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

export default LostFound;
