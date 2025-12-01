import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import {
  addFoodItem,
  deleteFoodItem,
  fetchMenu,
} from "../store/slices/menuSlice";

const FoodAdmin = () => {
  const { apiBase } = useApi();
  const dispatch = useDispatch();
  const { items: menuItems, status: menuStatus } = useSelector(
    (state) => state.menu
  );
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMenu());
  }, [dispatch]);

  const submitFood = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("category", category);
    if (image) formData.append("image", image);

    const res = await dispatch(addFoodItem(formData));
    if (res.meta.requestStatus === "fulfilled") {
      setMessage("Food item added successfully!");
      setMessageType("success");
      setName("");
      setPrice("");
      setDescription("");
      setCategory("");
      setImage(null);
      dispatch(fetchMenu());
    } else {
      setMessage(res.payload || "Warning: Failed to add food.");
      setMessageType("error");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;
    const res = await dispatch(deleteFoodItem(id));
    if (res.meta.requestStatus === "fulfilled") {
      alert("Success! Item deleted.");
      dispatch(fetchMenu());
    } else {
      alert(res.payload || "Warning: Failed to delete.");
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${apiBase}/catering/all-orders`);
      if (res.status === 401) {
        window.location.href = "/adminlogin";
        return;
      }
      const data = await res.json();
      if (!data.success) {
        setOrders([]);
        return;
      }
      setOrders(data.data || []);
    } catch (err) {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const preparing = orders.filter((o) => o.status === "preparing").length;
  const outForDelivery = orders.filter((o) => o.status === "out for delivery").length;

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <div className="page-header">
          <div>
            <h1>Food Operations Command</h1>
            <p className="muted-text">
              Manage the onboard menu, track order performance, and keep passengers well
              served.
            </p>
          </div>
          <Link className="btn btn-ghost" to="/admindashboard" style={{ marginLeft: "0.5rem" }}>
            Back to Admin
          </Link>
        </div>

        <form id="add-food-form" className="form-grid" onSubmit={submitFood} encType="multipart/form-data">
          <div className="input-group">
            <label htmlFor="name">Item Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g. Paneer Tikka Wrap"
              minLength={3}
              maxLength={50}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="price">Price (₹)</label>
            <input
              type="number"
              id="price"
              name="price"
              placeholder="Price"
              min="1"
              max="999999"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              placeholder="Short description"
              minLength={10}
              maxLength={200}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              placeholder="Vegetarian, Combo, Snacks..."
              minLength={3}
              maxLength={50}
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="image">Image (optional)</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>

          <button className="btn" type="submit">
            Add Food Item
          </button>
        </form>

        {message ? <p className={`message ${messageType}`} role="alert">{message}</p> : null}
      </section>

      <section className="surface-card">
        <div className="page-header">
          <div>
            <h2>Live Menu</h2>
            <p className="muted-text">
              Passengers see these items in real time within the ordering flow.
            </p>
          </div>
        </div>
        <div id="menu-container" className="menu-grid">
          {menuStatus === "loading" ? (
            <div className="empty-state">Loading menu...</div>
          ) : menuItems.length === 0 ? (
            <div className="empty-state">No items have been added yet.</div>
          ) : (
            menuItems.map((food) => {
              const priceValue = Number(food.price) || 0;
              return (
                <article className="menu-card" key={food._id}>
                  {food.imageUrl ? (
                    <img
                      className="menu-card__image"
                      src={food.imageUrl}
                      alt={food.name}
                    />
                  ) : null}
                  <div className="menu-card__body">
                    <div>
                      <h3>{food.name}</h3>
                      <p className="muted-text">{food.description || ""}</p>
                      <p className="muted-text">
                        {food.category ? `Category: ${food.category}` : ""}
                      </p>
                    </div>
                    <div
                      className="actions-inline"
                      style={{ justifyContent: "space-between" }}
                    >
                      <span className="menu-card__price">
                        &#8377;{priceValue.toFixed(2)}
                      </span>
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => handleDelete(food._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="surface-card">
        <div className="page-header">
          <div>
            <h2>Orders &amp; Performance</h2>
            <p className="muted-text">
              Understand the volume, revenue, and fulfilment status of onboard meals.
            </p>
          </div>
          <button className="btn btn-tonal" id="load-orders-btn" type="button" onClick={loadOrders}>
            Load Orders
          </button>
        </div>
        <div id="stats" className="content-grid two-column">
          {orders.length ? (
            <>
              <article className="link-tile">
                <span className="badge">Summary</span>
                <strong>Total Orders</strong>
                <p>{totalOrders}</p>
              </article>
              <article className="link-tile">
                <span className="badge">Revenue</span>
                <strong>Total Revenue</strong>
                <p>&#8377;{totalRevenue.toFixed(2)}</p>
              </article>
              <article className="link-tile">
                <span className="badge">Status</span>
                <strong>Delivered</strong>
                <p>{delivered}</p>
              </article>
              <article className="link-tile">
                <span className="badge">Status</span>
                <strong>Pending</strong>
                <p>{pending}</p>
              </article>
              <article className="link-tile">
                <span className="badge">Status</span>
                <strong>Preparing</strong>
                <p>{preparing}</p>
              </article>
              <article className="link-tile">
                <span className="badge">Status</span>
                <strong>Out for Delivery</strong>
                <p>{outForDelivery}</p>
              </article>
            </>
          ) : null}
        </div>
        <div id="orders-container" className="orders-list">
          {ordersLoading ? (
            <div className="empty-state">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">No orders have been placed yet.</div>
          ) : (
            orders.map((order) => {
              const statusClass =
                order.status === "delivered"
                  ? "status-pill success"
                  : order.status === "cancelled"
                  ? "status-pill danger"
                  : "status-pill warning";
              return (
                <article className="order-card" key={order._id}>
                  <div className="order-card__header">
                    <div>
                      <h4>Order ID: {order._id}</h4>
                      <p className="muted-text">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                      </p>
                      <p className="muted-text">
                        Customer: {order.user?.name || "N/A"} ({order.user?.email || ""})
                      </p>
                    </div>
                    <span className={statusClass}>{order.status}</span>
                  </div>
                  <p>
                    <strong>Total:</strong> &#8377;{order.totalPrice}
                  </p>
                  <p>
                    <strong>Address:</strong> {order.deliveryAddress}
                  </p>
                  <ul className="past-order-items">
                    {order.items
                      .map((i, idx) => (
                        <li key={`${order._id}-${idx}`}>
                          {i.foodItem?.name || "Item"} x {i.quantity}
                        </li>
                      ))}
                  </ul>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
};

export default FoodAdmin;
