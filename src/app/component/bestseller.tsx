// component/BestSellers.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import styles from "../css/seller.module.css";

type BestItem = {
  id: string;
  title: string;
  price: string;
  image: string;
  tag?: string;
};

export default function BestSellers() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const items: BestItem[] = useMemo(
    () => [
      { id: "1", title: "radiant renewal serum", price: "$27.00", image: "/suite1.jpg", tag: "Best Seller" },
      { id: "2", title: "luminous eye cream", price: "$25.00", image: "/suite2.jpg", tag: "Best Seller" },
      { id: "3", title: "hydraglow moisturizer", price: "$32.00", image: "/suite4.jpg", tag: "Best Seller" },
      { id: "4", title: "radiance cleanser", price: "$35.00", image: "/suite5.jpg", tag: "Best Seller" },
    ],
    []
  );

  const safeImg = (src?: string) => {
    if (!src) return "/placeholder.png";
    if (src.startsWith("/")) return src;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    return `/${src.replace(/^\.?\//, "")}`;
  };

  // ✅ reveal animation
  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;

    const els = root.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add(styles.inView)),
      { threshold: 0.15 }
    );

    els.forEach((el) => io.observe(el));
    return () => {
      els.forEach((el) => io.unobserve(el));
      io.disconnect();
    };
  }, []);

  // ✅ mobile auto scroll (1 card per swipe)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const mq = window.matchMedia("(max-width: 768px)");
    if (!mq.matches) return;

    const getStep = () => {
      const first = el.querySelector<HTMLElement>(`.${styles.card}`);
      if (!first) return el.clientWidth;
      const gap = 12;
      return first.getBoundingClientRect().width + gap;
    };

    let id = window.setInterval(() => {
      const step = getStep();
      const max = el.scrollWidth - el.clientWidth - 2;

      if (el.scrollLeft >= max) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step, behavior: "smooth" });
    }, 2000);

    const stop = () => window.clearInterval(id);
    const resume = () => {
      window.clearInterval(id);
      id = window.setInterval(() => {
        const step = getStep();
        const max = el.scrollWidth - el.clientWidth - 2;
        if (el.scrollLeft >= max) el.scrollTo({ left: 0, behavior: "smooth" });
        else el.scrollBy({ left: step, behavior: "smooth" });
      }, 2000);
    };

    el.addEventListener("mouseenter", stop);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", stop, { passive: true });
    el.addEventListener("touchend", resume, { passive: true });

    return () => {
      window.clearInterval(id);
      el.removeEventListener("mouseenter", stop);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", stop);
      el.removeEventListener("touchend", resume);
    };
  }, []);

  return (
    <section className={styles.wrap} ref={wrapRef}>
      <div className={`${styles.head} ${styles.reveal}`} data-reveal>
        <h2 className={styles.title}>Best Sellers</h2>

        <Link href="/allproduct" className={styles.viewMoreBtn} aria-label="View more best sellers">
          View more
        </Link>
      </div>

      <div className={styles.track} ref={trackRef}>
        {items.map((it, idx) => (
          <Link
            href="/ladies"
            key={it.id}
            className={`${styles.card} ${styles.reveal}`}
            data-reveal
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className={styles.imgBox}>
              <Image
                src={safeImg(it.image)}
                alt={it.title}
                fill
                priority={idx === 0}
                sizes="(max-width: 768px) 100vw, 25vw"
                className={styles.img}
              />
              {it.tag ? <span className={styles.chip}>{it.tag}</span> : null}
            </div>

            <div className={styles.meta}>
              <p className={styles.name}>{it.title}</p>
              <p className={styles.price}>{it.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
