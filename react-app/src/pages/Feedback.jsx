import { useState } from "react";
import { useApi } from "../context/ApiContext";

const Feedback = () => {
  const { apiBase } = useApi();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const submitFeedback = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    try {
      const res = await fetch(`${apiBase}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Thank you for your feedback!");
        setMessageType("success");
        setName("");
        setEmail("");
        setRating("");
        setComment("");
      } else {
        setMessage("Failed to submit feedback. Please try again.");
        setMessageType("error");
      }
    } catch (err) {
      setMessage("Failed to submit feedback. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <main className="auth-layout fade-in">
      <section className="surface-card auth-card">
        <div className="stack">
          <div>
            <h2>We value your feedback</h2>
            <p>
              Tell us how we can make your journey better. Your comments are reviewed by
              our service teams.
            </p>
          </div>
          <p className={`message ${messageType}`} id="msg" role="alert">
            {message}
          </p>
        </div>

        <form id="feedback-form" className="form-grid" onSubmit={submitFeedback}>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Your full name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="rating">Rating (1-5)</label>
            <input
              type="number"
              id="rating"
              min="1"
              max="5"
              placeholder="Rate your experience"
              required
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="comment">Comment</label>
            <textarea
              id="comment"
              placeholder="Share your thoughts"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>
          <button className="btn" type="submit">
            Submit Feedback
          </button>
        </form>
      </section>
    </main>
  );
};

export default Feedback;
