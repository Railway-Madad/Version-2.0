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
              <ul className="menu-list">
                {menuItems.map((food) => (
                  <li key={food._id} className="menu-item">
                    <div>
                      <img class="menu-card__image" src={food.imageUrl} alt={food.name}></img>
                      <h4>{food.name}</h4>
                      <p className="muted-text">{food.description}</p>
                      <p className="muted-text">₹{food.price}</p>
                    </div>
                    <button className="btn btn-tonal" onClick={() => handleAddToCart(food)}>
                      Add to Cart
                    </button>
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
              <ul className="cart-list">
                {cart.map((item, idx) => (
                  <li key={`${item.foodItem}-${idx}`} className="cart-item">
                    <div>
                      <h4>{item.name}</h4>
                      <div className="cart-item__meta">
                        <span>₹{item.price} each</span>
                        <span>Qty: {item.quantity}</span>
                        <strong>Total: ₹{item.price * item.quantity}</strong>
                      </div>
                    </div>
                    <div className="cart-item__actions">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => handleChangeQty(idx, 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => handleChangeQty(idx, -1)}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => handleRemoveItem(idx)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="summary">
              <strong>Total: ₹{total}</strong>
            </div>
            <form className="form-grid" onSubmit={placeOrder}>
              <div className="input-group">
                <label htmlFor="address">Delivery Address</label>
                <textarea
                  id="address"
                  required
                  rows="2"
                  value={address}
                  onChange={(e) => updateAddress(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  rows="2"
                  value={notes}
                  onChange={(e) => updateNotes(e.target.value)}
                />
              </div>
              <button className="btn" type="submit">
                Place Order
              </button>
            </form>
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
            <ul className="order-list">
              {orders.map((order) => (
                <li key={order._id} className="order-item">
                  <div>
                    <h4>Order #{order._id.slice(-6)}</h4>
                    <p className="muted-text">
                      {new Date(order.createdAt).toLocaleString()} • Status: {order.status}
                    </p>
                  </div>
                  <div className="order-item__meta">
                    <span>{order.items?.length || 0} items</span>
                    <strong>₹{order.totalAmount || 0}</strong>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
};

export default OrderPage;
