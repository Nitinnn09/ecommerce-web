"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../component/navbar";
import CategorySidebar from "../component/category";
import styles from "../css/shoessliper.module.css"; // ✅ same styling use

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

const safeImg = (src?: string) => (src && src.startsWith("/") ? src : "/placeholder.png");

const normalize = (d: any): ProductType[] => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.products)) return d.products;
  return [];
};

export default function ShoesPage() {
  const [items, setItems] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);

        // ✅ category name DB me "shoes" save karo
        const res = await fetch("/api/products?category=shoes", {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await res.json();
        setItems(normalize(data));
      } catch (e) {
        console.log(e);
        setItems([]);
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
      <CategorySidebar />

      <div className={styles.layout}>
        <main className={styles.content}>
          <div className={styles.page}>
            <div className={styles.header}>
              <h1 className={styles.title}>Shoes</h1>
              <p className={styles.subText}>Latest shoes products</p>
            </div>

            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : items.length === 0 ? (
              <p className={styles.empty}>No shoes products found.</p>
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
                        sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
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
