"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../css/card.module.css";
import Navbar from "../component/navbar";
import NextNav from "../component/nextnav"

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(data);
  }, []);

  const removeItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  return (
    <>
    <div>
    <Navbar />
    <NextNav />
    <div className={styles.container}>
      <h1 className={styles.title}>Your Cart</h1>

      {cart.length === 0 && (
        <p className={styles.empty}>Your cart is empty</p>
      )}

      {cart.map((item, index) => (
        <div className={styles.item} key={index}>
          <img src={item.image} alt={item.title} className={styles.image} />

          <div className={styles.details}>
            <h3>{item.title}</h3>
            <p className={styles.price}>₹ {item.price}</p>

            <button
              className={styles.removeBtn}
              onClick={() => removeItem(index)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      {cart.length > 0 && (
        <Link href="/card/checkout">
          <button className={styles.checkoutBtn}>
            Proceed to Checkout
          </button>
        </Link>
      )}
    </div>
    </div>
    </>
  );
}
