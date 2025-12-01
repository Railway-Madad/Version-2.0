const ProfileForm = ({ profileForm, onChange, onSubmit }) => {
  return (
    <form className="grid-two" onSubmit={onSubmit}>
      <div className="input-group">
        <label htmlFor="profile-name">Name</label>
        <input
          id="profile-name"
          type="text"
          required
          value={profileForm.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="profile-email">Email</label>
        <input
          id="profile-email"
          type="email"
          required
          value={profileForm.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="profile-dept">Department</label>
        <select
          id="profile-dept"
          value={profileForm.department}
          onChange={(e) => onChange("department", e.target.value)}
        >
          <option>Operations</option>
          <option>Support</option>
          <option>Admin</option>
          <option>Maintenance</option>
        </select>
      </div>
      <div className="input-group">
        <label htmlFor="profile-role">Role (read-only)</label>
        <input id="profile-role" type="text" value="User" readOnly disabled />
      </div>
      <div className="form-actions">
        <button className="btn" type="submit">
          Save Profile
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
