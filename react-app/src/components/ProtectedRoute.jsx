import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, type = "user" }) => {
  const location = useLocation();
  const { passengerToken, staffToken, adminToken } = useSelector((state) => state.auth);

  if (type === "admin") {
    if (!adminToken) {
      return <Navigate to="/adminlogin" replace state={{ from: location }} />;
    }
    return children;
  }

  if (type === "staff") {
    if (!staffToken) {
      return <Navigate to="/staff_login" replace state={{ from: location }} />;
    }
    return children;
  }

  // default passenger/user
  if (!passengerToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
