"use client";

import Navbar from "../component/navbar";
import Footer from "../component/footer";
import styles from "../css/policy.module.css";

export default function PolicyPage() {
  return (
    <>
      <Navbar />

      <div className={styles.container}>
        <h1 className={styles.title}>Policies & Legal Information</h1>
        <p className={styles.updated}>Last updated: January 2026</p>

        {/* PRIVACY POLICY */}
        <section className={styles.card}>
          <h2>Privacy Policy</h2>
          <p>
            We respect your privacy and are committed to protecting your
            personal information. Any data collected is used only to process
            orders, improve services, and provide customer support.
          </p>
        </section>

        {/* RETURN POLICY */}
        <section className={styles.card}>
          <h2>Return & Refund Policy</h2>
          <p>
            Products can be returned within 7 days of delivery if they are
            unused and in original condition. Refunds will be processed within
            5–7 business days after approval.
          </p>
        </section>

        {/* SHIPPING POLICY */}
        <section className={styles.card}>
          <h2>Shipping Policy</h2>
          <p>
            Orders are shipped within 24–48 hours. Delivery usually takes
            3–7 working days depending on location.
          </p>
        </section>

        {/* PAYMENT POLICY */}
        <section className={styles.card}>
          <h2>Payment Policy</h2>
          <p>
            We support secure online payments via cards, UPI, net banking, and
            wallets. All transactions are encrypted and safe.
          </p>
        </section>

        {/* TERMS */}
        <section className={styles.card}>
          <h2>Terms & Conditions</h2>
          <p>
            By using our website, you agree to follow all terms, policies, and
            guidelines. Misuse of the platform may result in account suspension.
          </p>
        </section>

        {/* CONTACT */}
        <section className={styles.contact}>
          <h3>Need Help?</h3>
          <p>Email: support@yourstore.com</p>
          <p>Phone: +91 98765 43210</p>
        </section>
      </div>

      <Footer />
    </>
  );
}
