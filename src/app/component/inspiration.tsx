"use client";
import Link from "next/link";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../css/inpiration.module.css";

export default function InspirationShowcase() {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect(); // ✅ once only (remove if you want repeat)
        }
      },
      { threshold: 0.18 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref as any}
      className={`${styles.section} ${inView ? styles.inView : ""}`}
    >
      {/* TOP */}
      <div className={styles.top}>
        <h2 className={`${styles.title} ${styles.reveal}`}>Inspiration Collection</h2>
        <p className={`${styles.sub} ${styles.reveal}`}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>

        <div className={styles.topGrid}>
          {/* Left rounded card */}
          <div className={`${styles.card} ${styles.leftCard} ${styles.reveal} ${styles.delay1}`}>
            <div className={styles.imgBox}>
              <Link href="/furniture">
              <Image
                src="/free.jpg"
                alt="Left"
                fill
                className={styles.img}
                sizes="(max-width: 900px) 92vw, 28vw"
                priority
              />
              </Link>
            </div>
          </div>

          {/* Center image slightly higher */}
          <div className={`${styles.centerWrap} ${styles.reveal} ${styles.delay2}`}>
            <div className={styles.centerImgBox}>
              <Link href="/furniture">
              <Image
                src="/luxery3.jpg"
                alt="Center"
                fill
                className={styles.img}
                sizes="(max-width: 900px) 92vw, 30vw"
                priority
              />
              </Link>
            </div>
          </div>

          {/* Right rounded card */}
          <div className={`${styles.card} ${styles.rightCard} ${styles.reveal} ${styles.delay3}`}>
            <div className={styles.imgBox}>
              <Link href="/furniture">
              <Image
                src="/mirotable.jpg"
                alt="Right"
                fill
                className={styles.img}
                sizes="(max-width: 900px) 92vw, 28vw"
              />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className={styles.bottom}>
        <div className={styles.bottomGrid}>
          {/* Left content */}
          <div className={`${styles.content} ${styles.reveal} ${styles.delay2}`}>
            <h3 className={styles.h3}>Beautify Your Space</h3>
            <p className={styles.p}>
              A dining table is more than just furniture—it’s where everyday moments turn into lasting memories. Crafted with a perfect balance of strength and elegance,
               this dining table adds warmth and style to your space while offering lasting comfort for family meals and special gatherings.
              Do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>

            <button className={styles.btn} type="button">
              LEARN MORE
            </button>
          </div>

          {/* Right image with rounded + green circle */}
          <div className={`${styles.visual} ${styles.reveal} ${styles.delay3}`}>
            <span className={styles.greenCircle} aria-hidden="true" />
            <div className={styles.portrait}>
              <Link href="/furniture">              <Image
                src="/decorate.jpg"
                alt="Beautify"
                fill
                className={styles.img}
                sizes="(max-width: 900px) 92vw, 360px"
                priority
              />
              </Link>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
