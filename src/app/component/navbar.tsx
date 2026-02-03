"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../css/nav.module.css";
import Sidebar from "../component/sidebar";

interface Product {
  _id: string;
  title?: string;
  category?: string;
  price?: number;
  image?: string;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);

  // ✅ Search from MongoDB (API)
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(q)}&limit=8`, {
          cache: "no-store",
        });
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
        setShowResults(true);
      } catch (e) {
        console.log(e);
      }
    }, 300); // ✅ debounce

    return () => clearTimeout(t);
  }, [searchQuery]);

  return (
    <nav className={styles.navbar}>
      {/* MOBILE MENU */}
      <button className={styles.mobileMenuBtn} onClick={() => setOpen(true)}>
        ☰
      </button>

      {/* LOGO */}
      <div className={styles.logo}>
        <Link href="/homepage">
          <h1>ShopNow</h1>
        </Link>
      </div>

      {/* SEARCH */}
      <div className={styles.searchContainer}>
        {/* <input
          type="text"
          className={styles.searchBox}
          placeholder="Search for products, brands and more"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
        /> */}

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className={styles.searchResults}>
            {searchResults.map((product) => (
              <Link
                href={`/product/${product._id}`}
                key={product._id}
                className={styles.resultItem}
                onClick={() => {
                  setShowResults(false);
                  setSearchQuery("");
                }}
              >
                {product.image ? (
                  <img src={product.image} alt={product.title || "product"} className={styles.resultImage} />
                ) : (
                  <img src="/placeholder.png" alt="product" className={styles.resultImage} />
                )}

                <div className={styles.resultDetails}>
                  <p className={styles.resultName}>{product.title}</p>

                  {product.category ? <span className={styles.resultCategory}>{product.category}</span> : null}

                  {product.price !== undefined ? <span className={styles.resultPrice}>₹{product.price}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        )}

        {showResults && searchQuery && searchResults.length === 0 && (
          <div className={styles.searchResults}>
            <p className={styles.noResults}>No products found</p>
          </div>
        )}
      </div>

      {/* SIDEBAR */}
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

      {/* MENU */}
      <ul className={styles.menu}>
        <li>
          <Link href="/login">
            {/* ✅ path fix */}
            <img src="/user.png" alt="user" className={styles.user} /> Login
          </Link>
        </li>

        <li>
          <Link className={styles.cart} href="/cart">
            🛒 0.99
          </Link>
        </li>
      </ul>
    </nav>
  );
}
