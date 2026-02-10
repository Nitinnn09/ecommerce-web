"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "../css/banner.module.css";

const banners = [
  {
    image: "/gemini2.png",
    title: "New Season Collection",
    desc: "Discover the latest trends with premium quality products.",
  },
  {
    image: "/banner1.png",
    title: "Big Sale is Live",
    desc: "Up to 50% off on selected items. Hurry up!",
  },
  {
    image: "/banner2.png",
    title: "Premium Life",
    desc: "Upgrade your style with our exclusive collection.",
  },
  {
    image: "/bannere.jpg",
    title: "Smart & Sales",
    desc: "Modern designs made for everyday comfort.",
  },
  {
    image: "/bannerh.jpg",
    title: "Unbeatable Sale",
    desc: "Top quality products at unbeatable prices.",
  },
];

export default function BannerSlider() {
  const [index, setIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const next = () => {
    setIndex((prev) => (prev + 1) % banners.length);
    resetAutoPlay();
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + banners.length) % banners.length);
    resetAutoPlay();
  };

  const goToSlide = (slideIndex: number) => {
    setIndex(slideIndex);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    setIsAutoPlay(true);
  };

  // ✅ Auto scroll
  useEffect(() => {
    if (!isAutoPlay) return;

    autoPlayRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlay]);

  // ✅ Swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAutoPlay(false);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;

    if (diff > 50) next(); // swipe left
    if (diff < -50) prev(); // swipe right
    touchStartX.current = null;
  };

  return (
    <div
      className={styles.slider}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {banners.map((item, i) => (
        <div
          key={i}
          className={`${styles.slide} ${i === index ? styles.active : ""}`}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="100vw"
            priority={i === 0}
            className={styles.image}
          />

          <div className={styles.overlay} />

          <div className={styles.content}>
            <h1>{item.title}</h1>
            <p>{item.desc}</p>
            <button onClick={() => console.log("Shop Now clicked")}>
              Shop Now
            </button>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        className={styles.prev}
        onClick={prev}
        aria-label="Previous slide"
        title="Previous"
      >
        ❮
      </button>

      <button
        className={styles.next}
        onClick={next}
        aria-label="Next slide"
        title="Next"
      >
        ❯
      </button>

      {/* Dots Indicator */}
      <div className={styles.dots}>
        {banners.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
            onClick={() => goToSlide(i)}
            role="button"
            tabIndex={0}
            aria-label={`Go to slide ${i + 1}`}
            title={`Slide ${i + 1}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                goToSlide(i);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}