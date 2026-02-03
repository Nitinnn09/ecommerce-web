"use client";
import Navbar from "../../component/navbar";
import styles from "../../css/helpform.module.css";

export default function AccountHelp() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.formBox}>
          <h1 className={styles.title}>Account Help</h1>
          <p className={styles.subtitle}>
            Login issues, profile updates or security concerns.
          </p>

          <select className={styles.select}>
            <option>Forgot Password</option>
            <option>Account Locked</option>
            <option>Profile Update Issue</option>
            <option>Other</option>
          </select>

          <input
            className={styles.input}
            type="email"
            placeholder="Registered Email"
          />

          <textarea
            className={styles.textarea}
            placeholder="Describe your account issue"
          />

          <button className={styles.button}>Submit Request</button>
        </div>
      </div>
    </>
  );
}
