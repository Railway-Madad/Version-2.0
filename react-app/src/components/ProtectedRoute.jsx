import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, type = "user" }) => {
  const location = useLocation();
  const { isPassengerAuthenticated, isStaffAuthenticated, isAdminAuthenticated, isSuperAdminAuthenticated } = useSelector((state) => state.auth);

  if (type === "superadmin") {
    if (!isSuperAdminAuthenticated) {
      return <Navigate to="/superadmin-login" replace state={{ from: location }} />;
    }
    return children;
  }

  if (type === "admin") {
    if (!isAdminAuthenticated) {
      return <Navigate to="/adminlogin" replace state={{ from: location }} />;
    }
    return children;
  }

  if (type === "staff") {
    if (!isStaffAuthenticated) {
      return <Navigate to="/staff_login" replace state={{ from: location }} />;
    }
    return children;
  }

  // default passenger/user
  if (!isPassengerAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
