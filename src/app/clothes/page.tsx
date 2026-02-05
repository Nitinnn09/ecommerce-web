"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../css/clothes.module.css";
import Navbar from "../component/navbar";
import CategorySidebar from "../component/category";
import Footer from "../component/footer";

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

export default function ClothesPage() {
  const [items, setItems] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ same as homepage
  const safeImg = (src?: string) => {
    if (!src) return "/placeholder.png";
    if (src.startsWith("/")) return src;
    return "/placeholder.png";
  };

  // ✅ same as homepage
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
        const res = await fetch("/api/products?category=clothes", {
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
   
    <Navbar/>
    
    <CategorySidebar/>
    <div className={styles.layout}>
  <main className={styles.content}>
    <div className={styles.page}>
      {/* <div className={styles.header}>
        <h1 className={styles.title}>Clothes</h1>
        <p className={styles.subText}>All clothes products from MongoDB</p>
      </div> */}

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : items.length === 0 ? (
        <p className={styles.empty}>No clothes products found.</p>
      ) : (
        <div className={styles.grid}>
          {items.map((p) => (
<Link key={p._id} href={`/product/${p._id}`} className={styles.relCard}>
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

    <footer/>
    </>
  );
}
