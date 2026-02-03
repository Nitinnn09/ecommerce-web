"use client";
import Navbar from "../../component/navbar";
import styles from "../../css/helpform.module.css";

export default function ShippingHelp() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.formBox}>
          <h1 className={styles.title}>Shipping Help</h1>
          <p className={styles.subtitle}>
            Questions about delivery, delays or address issues.
          </p>

          <select className={styles.select}>
            <option>Delivery Delayed</option>
            <option>Wrong Address</option>
            <option>Package Not Received</option>
            <option>Other</option>
          </select>

          <input
            className={styles.input}
            type="text"
            placeholder="Tracking ID"
          />

          <textarea
            className={styles.textarea}
            placeholder="Explain your shipping issue"
          />

          <button className={styles.button}>Submit Request</button>
        </div>
      </div>
    </>
  );
}
