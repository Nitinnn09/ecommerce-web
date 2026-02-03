"use client";
import Navbar from "../component/navbar";
import styles from "../css/help.module.css";
import Link from "next/link";

export default function HelpCenter() {
  return (
    <>
      <Navbar />
      <div className={styles.container}>

        {/* HEADER */}
        <div className={styles.header}>
          <h1>Help Center</h1>
          <p>We’re here to help you with orders, payments & more</p>
        </div>

        {/* SEARCH */}
        <div className={styles.searchBox}>
          <input type="text" placeholder="Search for help..." />
        </div>

        {/* HELP CARDS */}
        <div className={styles.grid}>

          <Link href="/help/order" className={styles.card}>
            <h3>📦 Orders</h3>
            <p>Track, cancel or return your orders easily.</p>
          </Link>

          <Link href="/help/payment" className={styles.card}>
            <h3>💳 Payments</h3>
            <p>Payment methods, refunds & billing issues.</p>
          </Link>

          <Link href="/help/shiping" className={styles.card}>
            <h3>🚚 Shipping</h3>
            <p>Delivery charges, timelines & locations.</p>
          </Link>

          <Link href="/help/account" className={styles.card}>
            <h3>🔐 Account</h3>
            <p>Login issues, password reset & profile.</p>
          </Link>

          <Link href="/help/contact" className={styles.card}>
            <h3>📞 Contact Us</h3>
            <p>Need more help? Get in touch with support.</p>
          </Link>

          <Link href="/help/FAQs" className={styles.card}>
            <h3>❓ FAQs</h3>
            <p>Common questions answered quickly.</p>
          </Link>

        </div>

        {/* FOOTER */}
        <div className={styles.footer}>
          <h2>Still need help?</h2>
          <Link href="/help/contact">
            <button>Contact Support</button>
          </Link>
        </div>

      </div>
    </>
  );
}
