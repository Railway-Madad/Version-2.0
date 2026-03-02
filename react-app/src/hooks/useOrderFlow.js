import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  changeQuantity,
  removeFromCart,
  resetCart,
  setAddress,
  setMessage,
  setNotes,
  setOrders,
} from "../store/slices/orderSlice";
import { useApi } from "../context/ApiContext";

export const useOrderFlow = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isPassengerAuthenticated);
  const { cart, address, notes, message, messageType, orders } = useSelector(
    (state) => state.orders
  );

  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Clear messages on component mount
  useEffect(() => {
    dispatch(setMessage({ message: "", type: "" }));
  }, [dispatch]);

  useEffect(() => {
    const loadMenu = async () => {
      setMenuLoading(true);
      try {
        const res = await fetch(`${apiBase}/food`);
        const data = await res.json();
        if (!data.success) {
          throw new Error("Failed to load menu");
        }
        setMenuItems(data.data || []);
      } catch (err) {
        setMenuItems([]);
      } finally {
        setMenuLoading(false);
      }
    };
    loadMenu();
  }, [apiBase]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        const res = await fetch(`${apiBase}/catering/my-orders-history`, {
          credentials: 'include',
        });
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          throw new Error("Failed to load orders");
        }
        dispatch(setOrders(data.data || []));
      } catch (err) {
        dispatch(setOrders([]));
      } finally {
        setOrdersLoading(false);
      }
    };
    loadOrders();
  }, [apiBase, dispatch, isAuthenticated]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const handleAddToCart = (food) => {
    dispatch(setMessage({ message: "", type: "" }));
    dispatch(
      addToCart({
        foodItem: food._id,
        name: food.name,
        price: Number(food.price) || 0,
      })
    );
  };

  const handleChangeQty = (index, delta) => {
    dispatch(changeQuantity({ index, delta }));
  };

  const handleRemoveItem = (index) => dispatch(removeFromCart(index));

  const updateAddress = (value) => dispatch(setAddress(value));
  const updateNotes = (value) => dispatch(setNotes(value));

  const placeOrder = async (e) => {
    e.preventDefault();
    dispatch(setMessage({ message: "", type: "" }));

    if (cart.length === 0) {
      dispatch(setMessage({ message: "Add at least one item to cart.", type: "error" }));
      return;
    }
    try {
      const res = await fetch(`${apiBase}/catering/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          items: cart,
          deliveryAddress: address,
          notes,
        }),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to place order");
      }
      dispatch(setMessage({ message: "Order placed successfully!", type: "success" }));
      dispatch(resetCart());
      // refresh orders
      const ordersRes = await fetch(`${apiBase}/catering/my-orders`, {
        credentials: 'include',
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        dispatch(setOrders(ordersData.data || []));
      }
    } catch (err) {
      dispatch(setMessage({ message: "Order failed. Please try again.", type: "error" }));
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const res = await fetch(`${apiBase}/catering/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to cancel order");
      }
      dispatch(setMessage({ message: "Order cancelled successfully!", type: "success" }));
      // refresh orders
      const ordersRes = await fetch(`${apiBase}/catering/my-orders`, {
        credentials: 'include',
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        dispatch(setOrders(ordersData.data || []));
      }
    } catch (err) {
      dispatch(setMessage({ message: "Failed to cancel order. Please try again.", type: "error" }));
    }
  };

  return {
    state: { cart, address, notes, message, messageType, orders, menuItems },
    status: { menuLoading, ordersLoading, total },
    handlers: {
      handleAddToCart,
      handleChangeQty,
      handleRemoveItem,
      updateAddress,
      updateNotes,
      placeOrder,
      cancelOrder,
    },
  };
};

export default useOrderFlow;
