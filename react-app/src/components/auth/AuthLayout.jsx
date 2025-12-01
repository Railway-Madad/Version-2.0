const AuthLayout = ({ title, description, message, isError, children, footer }) => {
  return (
    <main className="auth-layout fade-in">
      <section className="surface-card auth-card">
        <div className="stack">
          <div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          {message ? (
            <div
              className="message"
              role="alert"
              style={{ color: isError ? "var(--color-danger)" : "var(--color-success)" }}
            >
              {message}
            </div>
          ) : null}
        </div>
        {children}
        {footer}
      </section>
    </main>
  );
};

export default AuthLayout;
