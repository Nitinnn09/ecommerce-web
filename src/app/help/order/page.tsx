"use client";
import styles from "../../css/helpform.module.css";
import Navbar from "../../component/navbar";

export default function OrdersHelp() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.formBox}>
          <h1 className={styles.title}>📦 Orders Help</h1>
          <p className={styles.subtitle}>
            Facing issues with your order? Fill the details below.
          </p>

          <input
            className={styles.input}
            type="text"
            placeholder="Order ID"
          />

          <select className={styles.select}>
            <option>Select Issue</option>
            <option>Order not delivered</option>
            <option>Cancel order</option>
            <option>Return / Refund</option>
          </select>

          <textarea
            className={styles.textarea}
            placeholder="Describe your issue"
          ></textarea>

          <button className={styles.button}>
            Submit Request
          </button>
        </div>
      </div>
    </>
  );
}
