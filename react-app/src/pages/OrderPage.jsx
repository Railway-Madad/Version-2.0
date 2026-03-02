import { Link } from "react-router-dom";
import { useRef } from "react";
import { useSelector } from "react-redux";
import PageHeader from "../components/common/PageHeader";
import MessageBanner from "../components/common/MessageBanner";
import useOrderFlow from "../hooks/useOrderFlow";

const OrderPage = () => {
  const cartRef = useRef(null);
  const passengerTrainNo = useSelector((state) => state.auth.passengerTrainNo);
  const {
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
  } = useOrderFlow();

  const scrollToCart = () => {
    cartRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <PageHeader
          title="Onboard Food Ordering"
          subtitle="Order meals and track your recent orders."
          actions={<Link className="btn btn-ghost" to="/userDashboard">Back to Dashboard</Link>}
        />
        <div className="divider"></div>
        
        {/* Train Information Banner for Order Placement */}
        <div style={{
          backgroundColor: "#E3F2FD",
          border: "2px solid #2196F3",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#2196F3" style={{ flexShrink: 0 }}>
            <path d="M18 8h-1V4c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v4H6c-2.76 0-5 2.24-5 5v9c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-9c0-2.76-2.24-5-5-5zm-11 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-8h4v4h-4V7zm6 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
          </svg>
          <div>
            <strong style={{ color: "#1565C0", fontSize: "16px" }}>Ordering for Train: {passengerTrainNo || "N/A"}</strong>
            <p style={{ margin: "4px 0 0 0", color: "#555", fontSize: "14px" }}>Your food order will be delivered to this train</p>
          </div>
        </div>
        <article className="surface-card compact">
          <h3>Menu</h3>
          {menuLoading ? (
            <p className="muted-text">Loading menu...</p>
          ) : menuItems.length === 0 ? (
            <p className="muted-text">No menu items available right now.</p>
          ) : (
            <ul className="menu-grid" style={{ listStyle: 'none', padding: 0 }}>
              {menuItems.map((food) => (
                <li key={food._id} className="menu-card">
                  <img className="menu-card__image" src={food.imageUrl} alt={food.name} />
                  <div className="menu-card__body">
                    <div className="stack" style={{ gap: '0.5rem' }}>
                      <h4>{food.name}</h4>
                      <p className="muted-text text-sm">{food.description}</p>
                    </div>
                    <div className="actions-inline" style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span className="menu-card__price">₹{food.price}</span>
                      <button className="btn btn-sm" onClick={() => handleAddToCart(food)}>
                        Add
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <div className="divider"></div>

        {/* Cart Section */}
        <article className="surface-card compact" ref={cartRef}>
          <h3>Cart</h3>
          <MessageBanner message={message} type={messageType || "info"} />
          {cart.length === 0 ? (
            <p className="muted-text">No items yet. Add from the menu.</p>
          ) : (
            <ul className="cart-list" style={{ listStyle: 'none', padding: 0 }}>
              {cart.map((item, idx) => (
                <li key={`${item.foodItem}-${idx}`} className="cart-item">
                  <div className="cart-item__header">
                    <h4>{item.name}</h4>
                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                  <div className="cart-item__meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="muted-text text-sm">₹{item.price} x {item.quantity}</span>
                    <div className="cart-item__actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.2rem 0.6rem' }}
                        onClick={() => handleChangeQty(idx, -1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.2rem 0.6rem' }}
                        onClick={() => handleChangeQty(idx, 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-danger"
                        style={{ marginLeft: '0.5rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                        onClick={() => handleRemoveItem(idx)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {cart.length > 0 && (
            <>
              <div className="divider"></div>
              <div className="summary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="muted-text">Total Amount</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>₹{total}</strong>
              </div>
              <form className="form-grid" onSubmit={placeOrder}>
                <div className="input-group">
                  <label htmlFor="address">Delivery Address</label>
                  <textarea
                    id="address"
                    required
                    rows="2"
                    placeholder="Enter your full address..."
                    value={address}
                    onChange={(e) => updateAddress(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="notes">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    rows="1"
                    placeholder="Any special instructions?"
                    value={notes}
                    onChange={(e) => updateNotes(e.target.value)}
                  />
                </div>
                <div>
                  <span className="muted-text">We only accept cash on delivery</span>
                </div>
                <button className="btn" type="submit" style={{ width: '100%' }}>
                  Place Order
                </button>
              </form>
            </>
          )}
        </article>

        <div className="divider"></div>
        <section className="surface-card compact">
          <h3>Recent Orders</h3>
          {ordersLoading ? (
            <p className="muted-text">Loading your orders...</p>
          ) : orders.length === 0 ? (
            <p className="muted-text">No orders yet.</p>
          ) : (
            <ul className="orders-list" style={{ listStyle: 'none', padding: 0 }}>
              {orders.map((order) => {
                const statusClass = order.status === 'delivered' ? 'status-pill success' : 
                                   order.status === 'cancelled' ? 'status-pill danger' : 'status-pill warning';
                return (
                  <li key={order._id} className="order-card">
                    <div className="order-card__header">
                      <div>
                        <h4>Order #{order._id}</h4>
                        <p className="muted-text">{new Date(order.createdAt).toLocaleString()}</p>
                        <span style={{
                          display: "inline-block",
                          backgroundColor: order.trainNumber === passengerTrainNo ? "#E8F5E9" : "#F3E5F5",
                          color: order.trainNumber === passengerTrainNo ? "#2E7D32" : "#6A1B9A",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          marginTop: "4px"
                        }}>
                          🚆 Train: {order.trainNumber || "N/A"}
                        </span>
                        {order.status === "out for delivery" && (
  <p style={{ color: "green", fontWeight: "bold" }}>
    Delivery OTP: {order.otp}
  </p>
)}

                      </div>
                      <span className={statusClass}>{order.status}</span>
                    </div>
                    <p><strong>Total:</strong> ₹{order.totalPrice}</p>
                    <ul className="past-order-items">
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                          {item.foodItem?.name || 'Item'} × {item.quantity} (₹{Number(item.priceAtOrder || 0).toFixed(2)})
                        </li>
                      ))}
                    </ul>
                    <p><strong>Address:</strong> {order.deliveryAddress}</p>
                    {(order.status === "pending" || order.status === "preparing") && (
                      <button className="btn btn-tonal" type="button" onClick={() => cancelOrder(order._id)}>
                        Cancel Order
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </section>
    </main>

    {/* Floating Cart Button - Outside main for proper fixed positioning */}
    {cart.length > 0 && (
      <button
        onClick={scrollToCart}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          borderRadius: '50px',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '1rem',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
        Cart ({cart.length}) - ₹{total}
      </button>
    )}
    </>
  );
};

export default OrderPage;
