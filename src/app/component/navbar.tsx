"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../css/nav.module.css";
import Sidebar from "../component/sidebar";

type LoggedUser = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };

    const loadCart = () => {
      try {
        const cart = localStorage.getItem("cart");
        const cartItems = cart ? JSON.parse(cart) : [];
        setCartCount(cartItems.length);
      } catch {
        setCartCount(0);
      }
    };

    // Handle scroll events
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    loadUser();
    loadCart();

    window.addEventListener("user-updated", loadUser);
    window.addEventListener("cart-updated", loadCart);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("user-updated", loadUser);
      window.removeEventListener("cart-updated", loadCart);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const avatarSrc = user?.image?.trim() ? user.image : "/user.png";

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      <button
        className={styles.mobileMenuBtn}
        onClick={() => setOpen(true)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <div className={styles.logo}>
        <Link href="/homepage" className={styles.logoLink}>
          <h1 className={styles.brand}>
            Bharat<span>Buy</span>
          </h1>
        </Link>
      </div>

      {/* <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search products, brands, and more..."
          className={styles.searchBox}
          aria-label="Search"
        />
      </div> */}

      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

      <ul className={styles.menu}>
        <li>
          <Link
            href={user ? "/account" : "/login"}
            className={styles.userLink}
            title={user ? `Welcome, ${user.name}` : "Login to your account"}
          >
            <img
              src={avatarSrc}
              alt={user?.name || "User profile"}
              className={styles.userAvatar}
            />
          </Link>
        </li>

        <li>
          <Link className={styles.cart} href="/checkout" title="View cart">
            🛒 {cartCount > 0 ? cartCount : "0"}
          </Link>
        </li>
      </ul>
    </nav>
  );
}