import { createSlice } from "@reduxjs/toolkit";

// Cookie-based auth - no need for localStorage
// Clear any old tokens that might exist
if (typeof localStorage !== "undefined") {
  localStorage.removeItem("passengerToken");
  localStorage.removeItem("staffToken");
  localStorage.removeItem("adminToken");
}

// Cookies are automatically sent with requests
const initialState = {
  isPassengerAuthenticated: false,
  isStaffAuthenticated: false,
  isAdminAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setPassengerToken(state, action) {
      state.isPassengerAuthenticated = !!action.payload;
    },
    clearPassengerToken(state) {
      state.isPassengerAuthenticated = false;
    },
    setStaffToken(state, action) {
      state.isStaffAuthenticated = !!action.payload;
    },
    clearStaffToken(state) {
      state.isStaffAuthenticated = false;
    },
    setAdminToken(state, action) {
      state.isAdminAuthenticated = !!action.payload;
    },
    clearAdminToken(state) {
      state.isAdminAuthenticated = false;
    },
  },
});

export const {
  setPassengerToken,
  clearPassengerToken,
  setStaffToken,
  clearStaffToken,
  setAdminToken,
  clearAdminToken,
} = authSlice.actions;

export default authSlice.reducer;
