const AuthField = ({ id, label, type = "text", value, onChange, placeholder, required }) => (
  <div className="input-group">
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default AuthField;
