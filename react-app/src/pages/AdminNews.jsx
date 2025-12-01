import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { createNews, deleteNews, fetchNews } from "../store/slices/newsSlice";

const AdminNews = () => {
  const { apiBase } = useApi(); // keeps base consistent with context, though slice uses constant
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.news);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (file) formData.append("image", file);
    const res = await dispatch(createNews(formData));
    if (res.meta.requestStatus === "fulfilled") {
      setMessage("Success! News added successfully.");
      setTitle("");
      setDescription("");
      setFile(null);
      dispatch(fetchNews());
    } else {
      setMessage(res.payload || "Warning: Failed to add news.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this announcement?");
    if (!confirmed) return;
    const res = await dispatch(deleteNews(id));
    if (res.meta.requestStatus === "fulfilled") {
      setMessage("Success! News deleted.");
    } else {
      setMessage(res.payload || "Warning: Failed to delete news.");
    }
  };

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Admin News Console</h1>
            <p className="muted-text">
              Create timely announcements and manage the latest railway updates.
            </p>
          </div>
          <Link className="btn btn-tonal" to="/admindashboard">
            Back to Dashboard
          </Link>
        </div>

        <form id="news-form" className="form-grid" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="title">Headline</label>
            <input
              type="text"
              id="title"
              placeholder="Enter a concise headline"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="description">Summary</label>
            <textarea
              id="description"
              placeholder="Provide a short description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="input-group">
            <label htmlFor="image">Featured Image (optional)</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <button className="btn" type="submit">
            Publish Update
          </button>
        </form>
        {message ? <p className="message">{message}</p> : null}
      </section>

      <section className="surface-card">
        <div className="page-header">
          <div>
            <h2>Published Updates</h2>
            <p className="muted-text">
              These announcements appear on passenger dashboards in real time.
            </p>
          </div>
        </div>
        <div id="news-container" className="content-grid two-column">
          {status === "loading" ? (
            <p className="muted-text">Loading announcements...</p>
          ) : items.length === 0 ? (
            <p className="muted-text">
              No announcements have been published yet.
            </p>
          ) : (
            items.map((news) => (
              <article className="news-card" key={news._id}>
                {news.imageUrl ? (
                  <img src={news.imageUrl} alt={news.title} />
                ) : null}
                <div className="news-card__body">
                  <h3>{news.title}</h3>
                  <p>{news.description}</p>
                  <time>
                    Created on{" "}
                    {news.createdAt ? new Date(news.createdAt).toLocaleString() : ""}
                  </time>
                  <div className="actions-inline">
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() => handleDelete(news._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
};

export default AdminNews;
