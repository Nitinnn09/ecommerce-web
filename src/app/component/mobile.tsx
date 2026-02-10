"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "../css/mobile.module.css";
import Link from "next/link";

const brands = [
  { name: "Apple", logo: "/apple.jpg" },
  { name: "Samsung", logo: "/samsung.jpg" },
  { name: "Sony", logo: "/sony.jpg" },
  { name: "HP", logo: "/hp.jpg" },
  { name: "Dell", logo: "/dell.jpg" },
  { name: "Lenovo", logo: "/lenovo.jpg" },
  { name: "Asus", logo: "/asus.jpg" },
  { name: "Acer", logo: "/acer.jpg" },
  { name: "puma", logo: "/puma.jpg" },
];

export default function MobileBrands() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // ✅ scroll reveal animation
  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;

    const items = root.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("inView");
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ✅ auto horizontal scroll (desktop + mobile)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let paused = false;
    const speed = 0.6;

    const step = () => {
      if (!paused) {
        track.scrollLeft += speed;
        if (track.scrollLeft >= track.scrollWidth / 2) {
          track.scrollLeft = 0;
        }
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    const stop = () => (paused = true);
    const start = () => (paused = false);

    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);
    track.addEventListener("touchstart", stop, { passive: true });
    track.addEventListener("touchend", start);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("mouseenter", stop);
      track.removeEventListener("mouseleave", start);
      track.removeEventListener("touchstart", stop);
      track.removeEventListener("touchend", start);
    };
  }, []);

  const loopBrands = [...brands, ...brands];

  return (
    <section className={styles.wrap} ref={wrapRef} data-reveal>
      <div className={styles.head} data-reveal>
        <div>
          <h2 className={styles.title}>Top Brands</h2>
          <p className={styles.sub}>Trusted brands you love</p>
        </div>
      </div>

      {/* ✅ ONE ROW SCROLL (mobile + desktop) */}
      <div className={styles.track} ref={trackRef} data-reveal>
        <div className={styles.row}>
          {loopBrands.map((b, i) => (
            <div key={b.name + i} className={styles.card} data-reveal>
              <Link href= "/mobile">
              <div className={styles.logoBox}>
                
                <Image
                  src={b.logo}
                  alt={b.name}
                  fill
                  className={styles.logo}
                  quality={100}
                />
              
              </div>
                </Link>
              <p className={styles.name}>{b.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
