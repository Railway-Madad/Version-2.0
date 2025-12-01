const MessageBanner = ({ message, type = "info", className = "" }) => {
  if (!message) return null;
  const tone = type === "error" ? "var(--color-danger)" : "var(--color-success)";
  return (
    <div
      className={`message ${className}`.trim()}
      role="alert"
      style={{ display: "block", marginBottom: "1rem", color: tone }}
    >
      {message}
    </div>
  );
};

export default MessageBanner;
