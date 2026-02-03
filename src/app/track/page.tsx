"use client";
import Navbar from "../component/navbar";
import styles from "../css/track.module.css";

export default function TrackOrder() {
  return (
    <>
      <Navbar />

      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <h1>Track Your Order</h1>
          <p>Enter your Order ID to check delivery status</p>
        </div>

        {/* TRACK BOX */}
        <div className={styles.trackBox}>
          <input type="text" placeholder="Enter Order ID (eg. ORD12345)" />
          <button>Track Order</button>
        </div>

        {/* ORDER STATUS */}
        <div className={styles.statusBox}>
          <h2>Order Status</h2>

          <div className={styles.timeline}>
            <div className={`${styles.step} ${styles.active}`}>
              <span>✔</span>
              <p>Order Placed</p>
            </div>

            <div className={`${styles.step} ${styles.active}`}>
              <span>✔</span>
              <p>Processing</p>
            </div>

            <div className={styles.step}>
              <span>3</span>
              <p>Shipped</p>
            </div>

            <div className={styles.step}>
              <span>4</span>
              <p>Out for Delivery</p>
            </div>

            <div className={styles.step}>
              <span>5</span>
              <p>Delivered</p>
            </div>
          </div>
        </div>

        {/* ORDER DETAILS */}
        <div className={styles.details}>
          <h3>Order Details</h3>
          <p><b>Order ID:</b> ORD12345</p>
          <p><b>Delivery Address:</b> New Delhi, India</p>
          <p><b>Expected Delivery:</b> 3–5 Business Days</p>
        </div>
      </div>
    </>
  );
}
