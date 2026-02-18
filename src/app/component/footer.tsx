import styles from "../css/footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* ABOUT */}
        <div className={styles.section}>
          <h3>InUpShoping</h3>
          <p>
            Your trusted e-commerce platform for quality products at the best prices.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className={styles.section}>
          <h4>Quick Links</h4>
          <ul>
            <li>Home</li>
            <li>Products</li>
            <li>Cart</li>
            <li>Contact</li>
          </ul>
        </div>

        {/* CUSTOMER SERVICE */}
        <div className={styles.section}>
          <h4>Customer Service</h4>
          <ul>
            <li>FAQ</li>
            <li>Returns</li>
            <li>Privacy Policy</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className={styles.section}>
          <h4>Contact Us</h4>
          <p>Email: kumarnitin84044@gmail.com</p>
          <p>Phone: +91 7217463734</p>
        </div>

      </div>

      <div className={styles.bottom}>
        © {new Date().getFullYear()} ShopNow. All rights reserved.
      </div>
    </footer>
  );
}
