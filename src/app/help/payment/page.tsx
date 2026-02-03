"use client";
import Navbar from "../../component/navbar";
import styles from "../../css/helpform.module.css";

export default function PaymentsHelp() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.formBox}>
          <h1 className={styles.title}>Payment Help</h1>
          <p className={styles.subtitle}>
            Facing issues with payment or refund? Let us know.
          </p>

          <select className={styles.select}>
            <option>Payment Failed</option>
            <option>Refund Not Received</option>
            <option>Double Charged</option>
            <option>Other</option>
          </select>

          <input
            className={styles.input}
            type="text"
            placeholder="Order ID"
          />

          <textarea
            className={styles.textarea}
            placeholder="Describe your payment issue"
          />

          <button className={styles.button}>Submit Request</button>
        </div>
      </div>
    </>
  );
}
