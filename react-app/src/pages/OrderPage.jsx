import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import MessageBanner from "../components/common/MessageBanner";
import useOrderFlow from "../hooks/useOrderFlow";

const OrderPage = () => {
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

  return (
    <main className="page-shell fade-in">
      <section className="surface-card card-highlight">
        <PageHeader
          title="Onboard Food Ordering"
          subtitle="Order meals and track your recent orders."
          actions={<Link className="btn btn-ghost" to="/userDashboard">Back to Dashboard</Link>}
        />
        <div className="divider"></div>
        <div className="content-grid two-column">
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

          <article className="surface-card compact">
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
        </div>

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
  );
};

export default OrderPage;
