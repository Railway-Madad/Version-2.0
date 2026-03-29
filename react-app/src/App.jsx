import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminLoginSelector from "./pages/AdminLoginSelector";
import AdminRegister from "./pages/AdminRegister";
import AdminDashboard from "./pages/AdminDashboard";
import FoodStaff from "./pages/FoodStaff";
import StaffLogin from "./pages/StaffLogin";
import StaffRegister from "./pages/StaffRegister";
import StaffDashboard from "./pages/StaffDashboard";
import CateringLogin from "./pages/CateringLogin";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/index.html" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/login.html" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register.html" element={<Register />} />

      <Route
        path="/userDashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/userDashboard.html"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      

      <Route path="/adminlogin" element={<AdminLogin />} />
      <Route path="/adminlogin.html" element={<AdminLogin />} />
      <Route path="/admin-select" element={<AdminLoginSelector />} />
      <Route path="/superadmin-login" element={<SuperAdminLogin />} />
      <Route path="/adminregister" element={<AdminRegister />} />
      <Route path="/adminregister.html" element={<AdminRegister />} />

      <Route
        path="/admindashboard"
        element={
          <ProtectedRoute type="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admindashboard.html"
        element={
          <ProtectedRoute type="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin-dashboard"
        element={
          <ProtectedRoute type="superadmin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/feedback" element={<Navigate to="/" replace />} />
      <Route path="/feedback.html" element={<Navigate to="/" replace />} />

      <Route path="/adminlogin" element={<AdminLogin />} />
      <Route path="/adminlogin.html" element={<AdminLogin />} />
      <Route path="/admin-select" element={<AdminLoginSelector />} />
      <Route path="/superadmin-login" element={<SuperAdminLogin />} />
      <Route path="/adminregister" element={<AdminRegister />} />
      <Route path="/adminregister.html" element={<AdminRegister />} />

      <Route
        path="/admindashboard"
        element={
          <ProtectedRoute type="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admindashboard.html"
        element={
          <ProtectedRoute type="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/superadmin-dashboard"
        element={
          <ProtectedRoute type="superadmin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/foodstaff"
        element={
          <ProtectedRoute type="staff">
            <FoodStaff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foodstaff.html"
        element={
          <ProtectedRoute type="staff">
            <FoodStaff />
          </ProtectedRoute>
        }
      />

      <Route path="/cateringlogin" element={<CateringLogin />} />
      <Route path="/cateringlogin.html" element={<CateringLogin />} />

      <Route path="/staff_login" element={<StaffLogin />} />
      <Route path="/staff_login.html" element={<StaffLogin />} />
      <Route path="/staff_register" element={<StaffRegister />} />
      <Route path="/staff_register.html" element={<StaffRegister />} />
      <Route
        path="/staffDashboard"
        element={
          <ProtectedRoute type="staff">
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staffDashboard.html"
        element={
          <ProtectedRoute type="staff">
            <StaffDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
