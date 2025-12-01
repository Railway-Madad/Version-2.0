import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE } from "../../utils/constants";

export const fetchMenu = createAsyncThunk("menu/fetchAll", async () => {
  const res = await fetch(`${API_BASE}/food`);
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Failed to load menu");
  }
  return data.data || [];
});

export const addFoodItem = createAsyncThunk(
  "menu/addFoodItem",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/food`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to add item");
      }
      return data.data || data.food || null;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteFoodItem = createAsyncThunk(
  "menu/deleteFoodItem",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/food/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Failed to delete item");
      }
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const menuSlice = createSlice({
  name: "menu",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenu.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload || [];
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addFoodItem.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.push(action.payload);
        }
      })
      .addCase(deleteFoodItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default menuSlice.reducer;
