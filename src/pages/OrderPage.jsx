import React, { useState, useEffect } from "react";
import { MapPin, Navigation, DollarSign } from "lucide-react";
import { createOrder } from "../api";
import "../styles/OrderPage.css";

const API_BASE = "https://miniback-production.up.railway.app/api";

export default function OrderPage() {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState("Cash");
  const [price, setPrice] = useState(null);
  const [results, setResults] = useState("");
  const [loading, setLoading] = useState(false);
  const [tg, setTg] = useState(null);

  // Load Telegram WebApp and Chapa SDK
  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      setTg(window.Telegram.WebApp);
      window.Telegram.WebApp.ready();
    }

    const script = document.createElement("script");
    script.src = "https://checkout.chapa.co/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // Mock price calculation
  const calculatePrice = () => {
    if (!pickup || !dropoff) return setResults("⚠️ Enter pickup & dropoff.");
    setLoading(true);
    setTimeout(() => {
      const distanceKm = Math.floor(Math.random() * 20) + 1;
      const calculatedPrice =
        distanceKm <= 5
          ? 100
          : distanceKm <= 10
          ? 200
          : distanceKm <= 17
          ? 300
          : 400;
      setPrice(calculatedPrice);
      setResults(`📍 Distance: ${distanceKm} km\n💰 Price: ${calculatedPrice} birr`);
      setLoading(false);
    }, 500);
  };

  // Handle order creation & Chapa checkout
  const handleConfirm = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Log in first");
    if (!price) return alert("Calculate price first");

    setLoading(true);
    try {
      // 1️⃣ Create order (backend handles Chapa)
      const orderRes = await createOrder({ pickup, dropoff, item, quantity, payment, price });
      const orderId = orderRes.data.order_id;
      const chapaData = orderRes.data.chapa;

      if (payment === "Cash") {
        alert("Order placed! Please pay the courier in cash.");
        return;
      }

      if (!chapaData || !chapaData.checkout_url || !chapaData.public_key)
        throw new Error("Failed to initialize payment");

      // 2️⃣ Open Chapa modal
      if (window.Chapa) {
        window.Chapa.checkout({
          key: chapaData.public_key,
          tx_ref: chapaData.tx_ref || orderId,
          amount: price,
          currency: "ETB",
          payment_options: "mobile,card",
          customer: {
            email: `user${localStorage.getItem("phone")}@example.com`,
            phone: localStorage.getItem("phone"),
            name: `User ${localStorage.getItem("phone")}`,
          },
          customizations: {
            title: "Tolo Delivery Payment",
            description: `Payment for order ${orderId}`,
            logo: "https://yourfrontend.com/logo.png",
          },
          onclose: () => alert("Payment modal closed"),
          callback: (response) => {
            alert(`Payment status: ${response.status}`);
            if (tg) tg.close();
          },
        });
      } else {
        // fallback for non-Chapa modal
        window.open(chapaData.checkout_url, "_blank");
      }
    } catch (err) {
      alert(err?.message || "Failed to process order");
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
          <input type="text" value={pickup} onChange={(e) => setPickup(e.target.value)} />

          <label>
            <Navigation className="icon" /> Dropoff Location
          </label>
          <input type="text" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />

          <input
            type="text"
            placeholder="Item description"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
          <input
            type="number"
            min="1"
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
            className="btn btn-blue"
            onClick={calculatePrice}
            disabled={loading}
          >
            <DollarSign className="icon" /> {loading ? "Calculating..." : "Calculate Price"}
          </button>

          {results && <pre className="result-box">{results}</pre>}

          {price && (
            <button
              type="button"
              className="btn btn-green"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm & Pay"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
