import { createSlice } from "@reduxjs/toolkit";

const storedToken = typeof localStorage !== "undefined" ? localStorage.getItem("token") : "";
const storedAdminToken =
  typeof localStorage !== "undefined" ? localStorage.getItem("adminToken") : "";
const storedRole =
  typeof localStorage !== "undefined" ? localStorage.getItem("role") : "";

const initialState = {
  token: storedToken || "",
  adminToken: storedAdminToken || "",
  role: storedRole || (storedAdminToken ? "admin" : storedToken ? "user" : ""),
  userProfile: null,
  staffProfile: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action) {
      const { token, role } = action.payload || {};
      state.token = token || "";
      if (role) {
        state.role = role;
        localStorage.setItem("role", role);
      }
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    },
    clearToken(state) {
      state.token = "";
      state.role = "";
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
    setAdminToken(state, action) {
      const token = action.payload || "";
      state.adminToken = token;
      if (token) {
        localStorage.setItem("adminToken", token);
        state.role = "admin";
        localStorage.setItem("role", "admin");
      } else {
        localStorage.removeItem("adminToken");
      }
    },
    clearAdminToken(state) {
      state.adminToken = "";
      if (state.role === "admin") {
        state.role = "";
      }
      localStorage.removeItem("adminToken");
    },
    setUserProfile(state, action) {
      state.userProfile = action.payload || null;
    },
    setStaffProfile(state, action) {
      state.staffProfile = action.payload || null;
    },
  },
});

export const {
  setToken,
  clearToken,
  setAdminToken,
  clearAdminToken,
  setUserProfile,
  setStaffProfile,
} = authSlice.actions;

export default authSlice.reducer;
