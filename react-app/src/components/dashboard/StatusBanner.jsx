const StatusBanner = ({ message }) => {
  if (!message) return null;
  return <div className="surface-card compact success-banner">{message}</div>;
};

export default StatusBanner;
