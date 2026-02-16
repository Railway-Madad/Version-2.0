import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: "",
  pnr: "",
  bogieNumber: "",
  seatNumber: "",
  description: "",
  issueDomain: "Cleaning",
  successMessage: "",
  errorMessage: "",
};

const complaintSlice = createSlice({
  name: "complaint",
  initialState,
  reducers: {
    setField(state, action) {
      const { key, value } = action.payload || {};
      if (key in state) {
        state[key] = value;
      }
    },
    setMessages(state, action) {
      const { successMessage = "", errorMessage = "" } = action.payload || {};
      state.successMessage = successMessage;
      state.errorMessage = errorMessage;
    },
    resetForm(state) {
      state.pnr = "";
      state.bogieNumber = "";
      state.seatNumber = "";
      state.description = "";
      state.issueDomain = "Cleaning";
    },
    setUsername(state, action) {
      state.username = action.payload || "";
    },
  },
});

export const { setField, setMessages, resetForm, setUsername } = complaintSlice.actions;
export default complaintSlice.reducer;
