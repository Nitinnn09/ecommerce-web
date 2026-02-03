"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "../css/categori.module.css";

type CategoryItem = {
  title: string;
  href: string;
  img: string;
};

const CATEGORIES: CategoryItem[] = [
  { title: "All", href: "/allproduct", img: "/allin.jpg" },
  { title: "Clothes", href: "/clothes", img: "/tshirt.jpg" },
  { title: "Furniture", href: "/furniture", img: "/lamp1.jpg" },
  { title: "Bodycare", href: "/bodycare", img: "/glow1.jpg" },
  { title: "Mobile", href: "/mobile", img: "/img5.jpg" },
  { title: "Electronics", href: "/electronics", img: "/electronics1.jpg" },
  { title: "Shoes", href: "/shoes", img: "/shoes.jpg" },
];

export default function CategorySidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return CATEGORIES;
    return CATEGORIES.filter((c) => c.title.toLowerCase().includes(query));
  }, [q]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* ✅ MOBILE: Flipkart-style category strip */}
      <div className={styles.mobileStrip}>
        <div className={styles.stripRow}>
          {CATEGORIES.map((c) => {
            const active = isActive(c.href);

            return (
              <Link
                key={c.title}
                href={c.href}
                className={`${styles.stripItem} ${active ? styles.stripActive : ""}`}
              >
                <div className={styles.stripImgWrap}>
                  <Image src={c.img} alt={c.title} fill className={styles.stripImg} sizes="64px" />
                </div>
                <div className={styles.stripText}>{c.title}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ✅ MOBILE: optional "More" button (opens sidebar) */}
      <button className={styles.fab} onClick={() => setOpen(true)} aria-label="Open categories">
        ☰
      </button>

      {open ? <div className={styles.backdrop} onClick={() => setOpen(false)} /> : null}

      {/* ✅ DESKTOP: Sidebar (same as before) */}
      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <div className={styles.head}>
          <div>
            <h3 className={styles.headTitle}>Categories</h3>
            <p className={styles.headSub}>Browse by category</p>
          </div>
          <button className={styles.close} onClick={() => setOpen(false)} aria-label="Close categories">
            ✕
          </button>
        </div>

        <div className={styles.searchWrap}>
          <input
            className={styles.search}
            placeholder="Search category..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q ? (
            <button className={styles.clearBtn} onClick={() => setQ("")} aria-label="Clear search">
              ✕
            </button>
          ) : null}
        </div>

        <div className={styles.list}>
          {filtered.map((c) => {
            const active = isActive(c.href);

            return (
              <Link
                key={c.title}
                href={c.href}
                className={`${styles.card} ${active ? styles.active : ""}`}
                onClick={() => setOpen(false)}
              >
                <div className={styles.imgBox}>
                  <Image src={c.img} alt={c.title} fill className={styles.img} sizes="240px" />
                </div>

                <div className={styles.titleRow}>
                  <div className={styles.title}>{c.title}</div>
                  {active ? <span className={styles.pill}>Active</span> : null}
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 ? <p className={styles.empty}>No categories found.</p> : null}
        </div>
      </aside>
    </>
  );
}
