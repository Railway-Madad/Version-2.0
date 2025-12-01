import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE } from "../../utils/constants";

export const fetchNews = createAsyncThunk("news/fetchAll", async () => {
  const res = await fetch(`${API_BASE}/news`);
  const data = await res.json();
  return data.data || [];
});

export const createNews = createAsyncThunk(
  "news/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/news`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create news");
      }
      return data.data || data.news || null;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteNews = createAsyncThunk(
  "news/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/news/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete news");
      }
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const newsSlice = createSlice({
  name: "news",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload || [];
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createNews.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createNews.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createNews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload);
      });
  },
});

export default newsSlice.reducer;
