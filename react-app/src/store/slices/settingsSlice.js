import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: true,
  compactMode: false,
  persistLogin: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleSetting(state, action) {
      const key = action.payload;
      if (key in state) {
        state[key] = !state[key];
      }
    },
    setSetting(state, action) {
      const { key, value } = action.payload || {};
      if (key in state) {
        state[key] = value;
      }
    },
  },
});

export const { toggleSetting, setSetting } = settingsSlice.actions;
export default settingsSlice.reducer;
