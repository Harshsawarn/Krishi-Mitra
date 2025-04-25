import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import "../styles/Cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
  }, []);

  const updateQuantity = (cropId, newQuantity) => {
    const updatedCart = cartItems.map((item) =>
      item.cropId === cropId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (cropId) => {
    const updatedCart = cartItems.filter((item) => item.cropId !== cropId);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const buyNow = async () => {
    if (!auth.currentUser) {
      alert("Please log in to complete the purchase.");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    setLoading(true);
    try {
      const purchaseData = {
        userId: auth.currentUser.uid,
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        date: new Date().toISOString(),
      };
      console.log("Saving purchase to Firestore:", purchaseData);
      await addDoc(collection(db, "purchases"), purchaseData);
      alert("Purchase completed successfully!");
      localStorage.removeItem("cart");
      setCartItems([]);
    } catch (error) {
      console.error("Error completing purchase:", error);
      alert("Failed to complete purchase: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart">
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content glass-card fade-in">
          <h1>Your Cart</h1>
          <p>Review your selected crops and proceed to buy.</p>
        </div>
      </section>

      <section className="cart-content">
        {cartItems.length > 0 ? (
          <div className="cart-grid glass-card fade-in">
            <div className="cart-header">
              <span>Item</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Subtotal</span>
              <span>Action</span>
            </div>
            {cartItems.map((item) => (
              <div key={item.cropId} className="cart-item">
                <div className="item-details">
                  <img src={item.imageURL} alt={item.title} className="cart-image" />
                  <div>
                    <h4>{item.title}</h4>
                    <p>District: {item.district}</p>
                  </div>
                </div>
                <span>₹{item.price}/kg</span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.cropId, parseInt(e.target.value) || 1)}
                  className="input"
                  style={{ width: "60px" }}
                />
                <span>₹{item.price * item.quantity}</span>
                <button onClick={() => removeItem(item.cropId)} className="button remove-button">
                  Remove
                </button>
              </div>
            ))}
            <div className="cart-total">
              <h3>Total: ₹{total}</h3>
              <button onClick={buyNow} className="button buy-button" disabled={loading}>
                {loading ? "Processing..." : "Buy Now"}
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-cart glass-card fade-in">
            <h3>Your cart is empty</h3>
            <p>Add some crops to get started!</p>
            <Link to="/buyer" className="button">Browse Crops</Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default Cart;