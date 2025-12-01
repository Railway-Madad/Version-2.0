import { createSlice } from "@reduxjs/toolkit";

const storedPassengerToken = typeof localStorage !== "undefined" ? localStorage.getItem("passengerToken") : "";
const storedStaffToken = typeof localStorage !== "undefined" ? localStorage.getItem("staffToken") : "";
const storedAdminToken = typeof localStorage !== "undefined" ? localStorage.getItem("adminToken") : "";

const initialState = {
  passengerToken: storedPassengerToken || "",
  staffToken: storedStaffToken || "",
  adminToken: storedAdminToken || "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setPassengerToken(state, action) {
      state.passengerToken = action.payload || "";
      localStorage.setItem("passengerToken", action.payload || "");
    },
    clearPassengerToken(state) {
      state.passengerToken = "";
      localStorage.removeItem("passengerToken");
    },
    setStaffToken(state, action) {
      state.staffToken = action.payload || "";
      localStorage.setItem("staffToken", action.payload || "");
    },
    clearStaffToken(state) {
      state.staffToken = "";
      localStorage.removeItem("staffToken");
    },
    setAdminToken(state, action) {
      state.adminToken = action.payload || "";
      localStorage.setItem("adminToken", action.payload || "");
    },
    clearAdminToken(state) {
      state.adminToken = "";
      localStorage.removeItem("adminToken");
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
