import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import PageHeader from "../components/common/PageHeader";
import MessageBanner from "../components/common/MessageBanner";
import { clearToken } from "../store/slices/authSlice";
import useComplaintForm from "../hooks/useComplaintForm";

const Complaint = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { complaint, setFieldValue, submitComplaint, imageFile, setImageFile, fileInputRef } =
    useComplaintForm();

  const logout = () => {
    dispatch(clearToken());
    navigate("/login");
  };

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <PageHeader
          title="Railway Complaint Dashboard"
          subtitle={
            <>
              Welcome, <span id="current-user">{complaint.username || "Guest"}</span>
            </>
          }
          actions={
            <>
              <Link className="btn btn-ghost" to="/">
                Home
              </Link>
              <button className="btn btn-tonal" onClick={logout}>
                Logout
              </button>
            </>
          }
        />
        <div className="divider"></div>
        <section>
          <h2 className="card-section-title">Submit New Complaint</h2>
          <MessageBanner message={complaint.successMessage} type="success" className="success" />
          <MessageBanner message={complaint.errorMessage} type="error" className="error" />
          <form
            id="complaint-form"
            className="form-grid"
            onSubmit={submitComplaint}
            encType="multipart/form-data"
          >
            <div className="input-group">
              <label htmlFor="username">Username:</label>
              <input type="text" id="username" value={complaint.username} readOnly required />
            </div>
            <div className="input-group">
              <label htmlFor="pnr">PNR Number:</label>
              <input
                type="text"
                id="pnr"
                name="pnr"
                pattern="[0-9]{10}"
                title="PNR should be 10 digits"
                required
                value={complaint.pnr}
                onChange={(e) => setFieldValue("pnr", e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="bogieNumber">Bogie Number</label>
              <input
                type="text"
                id="bogieNumber"
                name="bogieNumber"
                pattern="^[A-Za-z]{1,2}[0-9]{1,2}$"
                title="Bogie number should start with 1-2 letters followed by 1-2 digits (e.g., S1, A2, B10)"
                required
                value={complaint.bogieNumber}
                onChange={(e) => setFieldValue("bogieNumber", e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="seatNumber">Seat Number:</label>
              <input
                type="text"
                id="seatNumber"
                name="seatNumber"
                pattern="^[0-9]{1,3}$"
                title="Seat number should be 1 to 3 digits (e.g., 1, 25, 120)"
                required
                value={complaint.seatNumber}
                onChange={(e) => setFieldValue("seatNumber", e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="description">Complaint Description:</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                required
                value={complaint.description}
                onChange={(e) => setFieldValue("description", e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="issueDomain">Issue Domain:</label>
              <select
                id="issueDomain"
                name="issueDomain"
                required
                value={complaint.issueDomain}
                onChange={(e) => setFieldValue("issueDomain", e.target.value)}
              >
                <option value="Cleaning">Cleaning</option>
                <option value="Catering">Catering</option>
                <option value="Security">Security</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Medical">Medical</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="image">Upload Image (Optional):</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="actions-inline">
              <button type="submit" className="btn">
                Submit Complaint
              </button>
              <button
                type="button"
                id="view-complaints-btn"
                className="btn btn-ghost"
                onClick={() => navigate("/view-complaints")}
              >
                View My Complaints
              </button>
            </div>
          </form>
        </section>

        <footer style={{ marginTop: "2rem", textAlign: "center" }}>
          <p className="muted-text">
            Ac 2025 Rail Madad - Indian Railways. All Rights Reserved.
          </p>
        </footer>
      </section>
    </main>
  );
};

export default Complaint;
