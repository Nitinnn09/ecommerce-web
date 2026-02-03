"use client";
import Image from "next/image";
import styles from "../css/electric.module.css";

const electronics = [
  {
    title: "Smartphone X1",
    desc: "Latest smartphone with high speed",
    price: 49999,
    discount: 59999,
    rating: 4.6,
    img: "/electronics1.jpg",
  },
  {
    title: "Wireless Headphones",
    desc: "Noise cancelling premium headphones",
    price: 8999,
    discount: 10999,
    rating: 4.4,
    img: "/electronics2.jpg",
  },
  {
    title: "Smart Watch",
    desc: "Fitness tracking & notifications",
    price: 6999,
    discount: 8999,
    rating: 4.2,
    img: "/electronics3.jpg",
  },
  {
    title: "Laptop Pro 15",
    desc: "Powerful laptop for gaming & work",
    price: 89999,
    discount: 99999,
    rating: 4.8,
    img: "/electronics4.jpg",
  },
  {
    title: "Bluetooth Speaker",
    desc: "Portable & powerful sound",
    price: 3499,
    discount: 4999,
    rating: 4.3,
    img: "/electronics5.jpg",
  },
];

export default function ElectronicsGrid() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Electronics Products 🔌</h2>

      <div className={styles.grid}>
        {electronics.map((item, index) => (
          <div className={styles.card} key={index}>
            
            {/* IMAGE */}
            <div className={styles.imageBox}>
              <Image
                src={item.img}
                alt={item.title}
                fill
                className={styles.image}
              />
            </div>

            {/* DETAILS */}
            <div className={styles.details}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>

              <div className={styles.price}>
                <span className={styles.discount}>₹{item.discount}</span>
                <span className={styles.final}>₹{item.price}</span>
              </div>

              <div className={styles.review}>⭐ {item.rating} / 5</div>

              <button className={styles.cartBtn}>Add to Cart</button>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}
