"use client";
import { useState } from "react";
import styles from "../css/order.module.css";

export default function CheckoutPage() {
  const [form, setForm] = useState({
    userName: "",
    userPhone: "",
    address: ""
  });

  const handleOrder = async () => {
    const orderData = {
      ...form,
      products: [
        {
          productId: "65ab123",
          title: "iPhone 15",
          price: 79999,
          quantity: 1
        }
      ],
      totalAmount: 79999
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    if (res.ok) {
      alert("✅ Order Confirmed");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Checkout</h2>

        <input
          placeholder="Full Name"
          onChange={(e) =>
            setForm({ ...form, userName: e.target.value })
          }
        />

        <input
          placeholder="Phone Number"
          onChange={(e) =>
            setForm({ ...form, userPhone: e.target.value })
          }
        />

        <textarea
          placeholder="Delivery Address"
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
        />

        <div className={styles.total}>
          <span>Total Amount</span>
          <b>₹79,999</b>
        </div>

        <button onClick={handleOrder}>Place Order</button>
      </div>
    </div>
  );
}
