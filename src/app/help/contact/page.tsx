"use client";
import Navbar from "../../component/navbar";
import styles from "../../css/helpform.module.css";

export default function ContactSupport() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.formBox}>
          <h1 className={styles.title}>Contact Support</h1>
          <p className={styles.subtitle}>
            Our team will get back to you within 24 hours.
          </p>

          <input
            className={styles.input}
            type="text"
            placeholder="Full Name"
          />

          <input
            className={styles.input}
            type="email"
            placeholder="Email Address"
          />

          <textarea
            className={styles.textarea}
            placeholder="How can we help you?"
          />

          <button className={styles.button}>Send Message</button>
        </div>
      </div>
    </>
  );
}
