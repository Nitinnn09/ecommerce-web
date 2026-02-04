"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "../css/banner.module.css";

const banners = [
  {
    image: "/bannerc.jpg",
    title: "New Season Collection",
    desc: "Discover the latest trends with premium quality products.",
  },
  {
    image: "/bannerb.jpg",
    title: "Big Sale is Live",
    desc: "Up to 50% off on selected items. Hurry up!",
  },
  {
    image: "/bannerd.jpeg",
    title: "Premium Life",
    desc: "Upgrade your style with our exclusive collection.",
  },
  {
    image: "/bannere.jpg",
    title: "Smart & sales",
    desc: "Modern designs made for everyday comfort.",
  },
  {
    image: "/bannerh.jpg",
    title: "sale",
    desc: "Top quality products at unbeatable prices.",
  },
];

export default function BannerSlider() {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const next = () => setIndex((prev) => (prev + 1) % banners.length);
  const prev = () => setIndex((prev) => (prev - 1 + banners.length) % banners.length);

  // ✅ auto scroll (pause when user changes slide manually feel)
  useEffect(() => {
    const interval = setInterval(next, 3500);
    return () => clearInterval(interval);
  }, []);

  // ✅ swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;

    if (diff > 50) next();      // swipe left
    if (diff < -50) prev();     // swipe right
    touchStartX.current = null;
  };

  return (
    <div className={styles.slider} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {banners.map((item, i) => (
        <div key={i} className={`${styles.slide} ${i === index ? styles.active : ""}`}>
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="100%"
            priority={i === 0}
            className={styles.image}
          />

          <div className={styles.overlay} />

          <div className={styles.content}>
            <h1>{item.title}</h1>
            <p>{item.desc}</p>
            <button>Shop Now</button>
          </div>
        </div>
      ))}

      <button className={styles.prev} onClick={prev} aria-label="Previous">
        ❮
      </button>

      <button className={styles.next} onClick={next} aria-label="Next">
        ❯
      </button>

      {/* ✅ dots */}
      <div className={styles.dots}>
        {banners.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
