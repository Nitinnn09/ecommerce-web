"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../component/navbar";
import CategorySidebar from "../component/category";
import styles from "../css/electronics.module.css";

type ProductType = {
  _id: string;
  title: string;
  price: number | string;
  oldPrice?: number | string;
  discount?: string;
  image?: string;
  desc?: string;
  category?: string;
};

export default function ElectronicsPage() {
  const [items, setItems] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string>("");

  const safeImg = (src?: string) => {
    if (!src) return "/placeholder.png";
    if (src.startsWith("/")) return src;
    return "/placeholder.png";
  };

  const normalize = (d: any): ProductType[] => {
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.products)) return d.products;
    return [];
  };

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setApiError("");

        // IMPORTANT: make sure DB category is exactly "electrical" (or API will match case-insensitively)
        const res = await fetch("/api/products?category=electrical", {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await res.json();

        // Debug (console me check karlo)
        console.log("API STATUS:", res.status);
        console.log("API DATA:", data);

        if (!res.ok) {
          setItems([]);
          setApiError(data?.message || "API error");
          return;
        }

        setItems(normalize(data));
      } catch (e: any) {
        console.log(e);
        setItems([]);
        setApiError("Network/API failed");
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  return (
  <>
    <Navbar />

    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <CategorySidebar />
      </aside>

      <main className={styles.content}>
        <div className={styles.page}>
          <div className={styles.header}>
            <h1 className={styles.title}>Electronics</h1>
            <p className={styles.subText}>Latest electronics products </p>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : items.length === 0 ? (
            <p className={styles.empty}>No electronics products found.</p>
          ) : (
            <div className={styles.grid}>
              {items.map((p) => (
                <Link key={p._id} href={`/product/${p._id}`} className={styles.card}>
                  {p.discount ? <span className={styles.badge}>{p.discount}</span> : null}

                  <div className={styles.imgBox}>
                    <Image
                      src={safeImg(p.image)}
                      alt={p.title || "product"}
                      fill
                      className={styles.img}
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  </div>

                  <div className={styles.info}>
                    <h3 className={styles.name}>{p.title}</h3>
                    <p className={styles.price}>
                      ₹{p.price} {p.oldPrice ? <span>₹{p.oldPrice}</span> : null}
                    </p>
                    {p.desc ? <p className={styles.desc}>{p.desc}</p> : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  </>
);

}
