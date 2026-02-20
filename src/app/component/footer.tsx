import styles from "../css/footer.module.css";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* ABOUT */}
        <div className={styles.section}>
          <Link href="/homepage" className={styles.brandLink} aria-label="Go to homepage">
            <h3 className={styles.brand}>
              InUp<span>Shoping</span>
            </h3>
          </Link>
          <p>
            Your trusted e-commerce platform for quality products at the best prices.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className={styles.section}>
          <h4>Quick Links</h4>
          <ul className={styles.list}>
            <li>
              <Link className={styles.link} href="/homepage">
                Home
              </Link>
            </li>
            <li>
              <Link className={styles.link} href="/allproduct">
                Products
              </Link>
            </li>
            <li>
              <Link className={styles.link} href="/checkout">
                Cart
              </Link>
            </li>
            <li>
              <Link className={styles.link} href="/help">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* CUSTOMER SERVICE */}
        <div className={styles.section}>
          <h4>Customer Service</h4>
          <ul className={styles.list}>
            <li>
              <Link className={styles.link} href="/help/FAQs">
                FAQ
              </Link>
            </li>
            <li>
              <Link className={styles.link} href="/policy">
                Returns
              </Link>
            </li>
            <li>
              <Link className={styles.link} href="/policy">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link className={styles.link} href="/policy">
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className={styles.section}>
          <h4>Contact Us</h4>
          <p>
            Email:{" "}
            <a className={styles.link} href="mailto:kumarnitin84044@gmail.com">
              kumarnitin84044@gmail.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a className={styles.link} href="tel:+917217463734">
              +91 7217463734
            </a>
          </p>
        </div>

      </div>

      <div className={styles.bottom}>
        © {new Date().getFullYear()} InUpShoping. All rights reserved.
      </div>
    </footer>
  );
}
