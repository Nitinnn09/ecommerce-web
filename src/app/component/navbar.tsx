"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../css/nav.module.css";
import Sidebar from "../component/sidebar";
import { useRouter } from "next/navigation";

type LoggedUser = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
};

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [q, setQ] = useState("");

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

  const routeForQuery = (query: string) => {
    const text = query.trim().toLowerCase();

    const hasAny = (words: string[]) => words.some((w) => text.includes(w));

    if (hasAny(["cloth", "tshirt", "shirt", "jean", "pant", "dress"])) return "/clothes";
    if (hasAny(["furniture", "sofa", "chair", "table", "bed", "lamp"])) return "/furniture";
    if (hasAny(["bodycare", "body care", "skin", "serum", "cream", "facewash"])) return "/bodycare";
    if (hasAny(["mobile", "phone", "iphone", "samsung"])) return "/mobile";
    if (hasAny(["electronic", "electronics", "watch", "tv", "laptop", "headphone"])) return "/electronics";
    if (hasAny(["shoe", "shoes", "sneaker"])) return "/shoes";
    if (hasAny(["slipper", "sleeper", "sandals"])) return "/sleeper";
    if (hasAny(["ladies", "women", "suit", "saree"])) return "/ladies";

    return "/allproduct";
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;

    const base = routeForQuery(query);
    router.push(`${base}?q=${encodeURIComponent(query)}`);
  };

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
            InUp<span>Shoping</span>
          </h1>
        </Link>
      </div>

      <div className={styles.searchContainer}>
        <form onSubmit={onSearchSubmit} style={{ width: "100%" }}>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, brands, and more..."
            className={styles.searchBox}
            aria-label="Search"
          />
        </form>
      </div>

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
