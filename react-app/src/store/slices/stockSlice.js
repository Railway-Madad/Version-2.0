import { createSlice } from "@reduxjs/toolkit";

const now = () => new Date().toISOString();

const initialState = {
  items: [
    {
      id: "STK-1001",
      name: "Brake Pads",
      category: "Maintenance",
      quantity: 120,
      status: "in-stock",
      updatedAt: now(),
    },
    {
      id: "STK-1002",
      name: "Signal Relays",
      category: "Electronics",
      quantity: 32,
      status: "low",
      updatedAt: now(),
    },
    {
      id: "STK-1003",
      name: "Water Bottles",
      category: "Catering",
      quantity: 280,
      status: "in-stock",
      updatedAt: now(),
    },
  ],
  filters: {
    query: "",
    category: "all",
    status: "all",
  },
};

const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    addStockItem: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(payload) {
        const id = `STK-${Math.floor(Math.random() * 9000) + 1000}`;
        return {
          payload: {
            id,
            updatedAt: now(),
            ...payload,
          },
        };
      },
    },
    updateStockItem(state, action) {
      const { id, changes } = action.payload || {};
      const index = state.items.findIndex((item) => item.id === id);
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...changes,
          updatedAt: now(),
        };
      }
    },
    deleteStockItem(state, action) {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
    },
    setFilters(state, action) {
      state.filters = {
        ...state.filters,
        ...(action.payload || {}),
      };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
  },
});

export const {
  addStockItem,
  updateStockItem,
  deleteStockItem,
  setFilters,
  resetFilters,
} = stockSlice.actions;

export default stockSlice.reducer;
