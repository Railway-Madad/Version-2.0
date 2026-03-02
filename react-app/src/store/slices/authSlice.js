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
  passengerTrainNo: null,
  staffTrainNo: null,
  adminTrainNo: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setPassengerToken(state, action) {
      state.isPassengerAuthenticated = !!action.payload;
    },
    setPassengerTrainNo(state, action) {
      state.passengerTrainNo = action.payload;
    },
    clearPassengerToken(state) {
      state.isPassengerAuthenticated = false;
      state.passengerTrainNo = null;
    },
    setStaffToken(state, action) {
      state.isStaffAuthenticated = !!action.payload;
    },
    setStaffTrainNo(state, action) {
      state.staffTrainNo = action.payload;
    },
    clearStaffToken(state) {
      state.isStaffAuthenticated = false;
      state.staffTrainNo = null;
    },
    setAdminToken(state, action) {
      state.isAdminAuthenticated = !!action.payload;
    },
    setAdminTrainNo(state, action) {
      state.adminTrainNo = action.payload;
    },
    clearAdminToken(state) {
      state.isAdminAuthenticated = false;
      state.adminTrainNo = null;
    },
  },
});

export const {
  setPassengerToken,
  setPassengerTrainNo,
  clearPassengerToken,
  setStaffToken,
  setStaffTrainNo,
  clearStaffToken,
  setAdminToken,
  setAdminTrainNo,
  clearAdminToken,
} = authSlice.actions;

export default authSlice.reducer;
