import React, { useState } from "react";
import { MapPin, Navigation, DollarSign } from "lucide-react";
import { createOrder } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/OrderPage.css";

export default function OrderPage() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState("Cash");
  const [price, setPrice] = useState(null);
  const [results, setResults] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();

  const calculatePrice = async () => {
    if (!pickup || !dropoff) {
      setResults("⚠️ Please enter both pickup and dropoff locations.");
      return;
    }

    setLoading(true);
    try {
      // Simple placeholder distance (simulate logic)
      const randomKm = Math.floor(Math.random() * 20) + 1;

      let calculatedPrice = 0;
      if (randomKm <= 5) calculatedPrice = 100;
      else if (randomKm <= 10) calculatedPrice = 200;
      else if (randomKm <= 17) calculatedPrice = 300;
      else calculatedPrice = 400;

      setPrice(calculatedPrice);
      setResults(
        `📍 Estimated Distance: ${randomKm} km\n💰 Estimated Price: ${calculatedPrice} birr`
      );
    } catch {
      setResults("❌ Error calculating price.");
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem("token");
    if (!token) return nav("/");

    if (!price) {
      alert("Please calculate price first.");
      return;
    }

    setLoading(true);
    try {
      const payload = { pickup, dropoff, item, quantity, payment, price };
      await createOrder(token, payload);
      alert("✅ Order placed successfully!");
      nav("/");
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-container">
      <div className="order-card">
        <h1>Place Your Order</h1>
        <h2>Fast, reliable delivery at your fingertips</h2>

        <form>
          <label>
            <MapPin className="icon" /> Pickup Location
          </label>
          <input
            type="text"
            placeholder="Enter pickup location..."
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />

          <label>
            <Navigation className="icon" /> Dropoff Location
          </label>
          <input
            type="text"
            placeholder="Enter dropoff location..."
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
          />

          <input
            type="text"
            placeholder="Item description"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />

          <input
            type="number"
            min="1"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          />

          <select value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Card">Card</option>
          </select>

          <button
            type="button"
            onClick={calculatePrice}
            disabled={loading}
            className="btn"
          >
            <DollarSign className="icon" />{" "}
            {loading ? "Calculating..." : "Calculate Price"}
          </button>

          {results && <pre className="result-box">{results}</pre>}

          {price && (
            <button
              type="button"
              className="btn confirm"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "..." : "Confirm Order"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
