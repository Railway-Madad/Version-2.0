import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import Complaint from "./pages/Complaint";
import ViewComplaints from "./pages/ViewComplaints";
import OrderPage from "./pages/OrderPage";
import Emergency from "./pages/Emergency";
import Feedback from "./pages/Feedback";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNews from "./pages/AdminNews";
import AdminFeedback from "./pages/AdminFeedback";
import EmergencyAdmin from "./pages/EmergencyAdmin";
import FoodAdmin from "./pages/FoodAdmin";
import FoodStaff from "./pages/FoodStaff";
import StaffLogin from "./pages/StaffLogin";
import StaffRegister from "./pages/StaffRegister";
import StaffDashboard from "./pages/StaffDashboard";
import CateringLogin from "./pages/CateringLogin";
import LostFound from "./pages/LostFound";
import LostFoundView from "./pages/LostFoundView";
import ProjectDashboard from "./pages/ProjectDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminStaff from "./pages/AdminStaff";
import AdminComplaints from "./pages/AdminComplaints";
import AdminOrders from "./pages/AdminOrders";
import AdminTrains from "./pages/AdminTrains";
import AdminLoginSelector from "./pages/AdminLoginSelector";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminAnalytics from "./pages/SuperAdminAnalytics";
import TrainAdminAnalytics from "./pages/TrainAdminAnalytics";
import TrainAdminUsers from "./pages/TrainAdminUsers";
import TrainAdminUserDetail from "./pages/TrainAdminUserDetail";

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

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute type="admin">
            <ProjectDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard.html"
        element={
          <ProtectedRoute type="admin">
            <ProjectDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/complaint"
        element={
          <ProtectedRoute>
            <Complaint />
          </ProtectedRoute>
        }
      />
      <Route
        path="/complaint.html"
        element={
          <ProtectedRoute>
            <Complaint />
          </ProtectedRoute>
        }
      />

      <Route
        path="/view-complaints"
        element={
          <ProtectedRoute>
            <ViewComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/view-complaints.html"
        element={
          <ProtectedRoute>
            <ViewComplaints />
          </ProtectedRoute>
        }
      />

      <Route
        path="/order"
        element={
          <ProtectedRoute>
            <OrderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order.html"
        element={
          <ProtectedRoute>
            <OrderPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/emergency"
        element={
          <ProtectedRoute>
            <Emergency />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergency.html"
        element={
          <ProtectedRoute>
            <Emergency />
          </ProtectedRoute>
        }
      />

      <Route path="/feedback" element={<Feedback />} />
      <Route path="/feedback.html" element={<Feedback />} />

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
        path="/admin-analytics"
        element={
          <ProtectedRoute type="admin">
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-analytics.html"
        element={
          <ProtectedRoute type="admin">
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-staff"
        element={
          <ProtectedRoute type="admin">
            <AdminStaff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-complaints"
        element={
          <ProtectedRoute type="admin">
            <AdminComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-orders"
        element={
          <ProtectedRoute type="admin">
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-trains"
        element={
          <ProtectedRoute type="admin">
            <AdminTrains />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-news"
        element={
          <ProtectedRoute type="admin">
            <AdminNews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-news.html"
        element={
          <ProtectedRoute type="admin">
            <AdminNews />
          </ProtectedRoute>
        }
      />

      <Route
        path="/adminfeedback"
        element={
          <ProtectedRoute type="admin">
            <AdminFeedback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/adminfeedback.html"
        element={
          <ProtectedRoute type="admin">
            <AdminFeedback />
          </ProtectedRoute>
        }
      />

      <Route
        path="/emergency-admin"
        element={
          <ProtectedRoute type="admin">
            <EmergencyAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergency-admin.html"
        element={
          <ProtectedRoute type="admin">
            <EmergencyAdmin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/foodadmin"
        element={
          <ProtectedRoute type="admin">
            <FoodAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foodadmin.html"
        element={
          <ProtectedRoute type="admin">
            <FoodAdmin />
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

      <Route
        path="/lostnfound"
        element={
          <ProtectedRoute>
            <LostFound />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lostnfound.html"
        element={
          <ProtectedRoute>
            <LostFound />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lostnfoundView"
        element={
          <ProtectedRoute>
            <LostFoundView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lostnfoundView.html"
        element={
          <ProtectedRoute>
            <LostFoundView />
          </ProtectedRoute>
        }
      />

      {/* Super Admin Routes */}
      <Route
        path="/superadmin-dashboard"
        element={
          <ProtectedRoute type="superadmin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin-analytics"
        element={
          <ProtectedRoute type="superadmin">
            <SuperAdminAnalytics />
          </ProtectedRoute>
        }
      />

      {/* Train Admin Analytics & Users */}
      <Route
        path="/train-admin-analytics"
        element={
          <ProtectedRoute type="admin">
            <TrainAdminAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-users"
        element={
          <ProtectedRoute type="admin">
            <TrainAdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-user/:userId"
        element={
          <ProtectedRoute type="admin">
            <TrainAdminUserDetail />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
