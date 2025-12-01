import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  address: "",
  notes: "",
  message: "",
  messageType: "",
  orders: [],
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addToCart(state, action) {
      const item = action.payload;
      const existing = state.cart.find((i) => i.foodItem === item.foodItem);
      if (existing) {
        state.cart = state.cart.map((i) =>
          i.foodItem === item.foodItem ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        state.cart.push({ ...item, quantity: 1 });
      }
    },
    changeQuantity(state, action) {
      const { index, delta } = action.payload || {};
      const updated = [...state.cart];
      if (updated[index]) {
        updated[index] = { ...updated[index], quantity: updated[index].quantity + delta };
      }
      state.cart = updated.filter((i) => i.quantity > 0);
    },
    removeFromCart(state, action) {
      const index = action.payload;
      state.cart = state.cart.filter((_, i) => i !== index);
    },
    setAddress(state, action) {
      state.address = action.payload || "";
    },
    setNotes(state, action) {
      state.notes = action.payload || "";
    },
    setMessage(state, action) {
      const { message = "", type = "" } = action.payload || {};
      state.message = message;
      state.messageType = type;
    },
    setOrders(state, action) {
      state.orders = action.payload || [];
    },
    resetCart(state) {
      state.cart = [];
      state.address = "";
      state.notes = "";
    },
  },
});

export const {
  addToCart,
  changeQuantity,
  removeFromCart,
  setAddress,
  setNotes,
  setMessage,
  setOrders,
  resetCart,
} = orderSlice.actions;

export default orderSlice.reducer;
