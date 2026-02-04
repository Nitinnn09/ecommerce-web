"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../component/navbar";
import CategorySidebar from "../component/category";
import styles from "../css/bodycloth.module.css";

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

export default function FurniturePage() {
  const [items, setItems] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "low" | "high">("new");

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
        const res = await fetch("/api/products?category=furniture", {
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

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();

    let list = items.filter((p) => {
      if (!text) return true;
      return (p.title || "").toLowerCase().includes(text) || (p.desc || "").toLowerCase().includes(text);
    });

    const num = (v: any) => Number(v || 0);

    if (sort === "low") list = [...list].sort((a, b) => num(a.price) - num(b.price));
    if (sort === "high") list = [...list].sort((a, b) => num(b.price) - num(a.price));

    return list;
  }, [items, q, sort]);

  return (
    <>
      <Navbar />
      <CategorySidebar />

      <div className={styles.layout}>
        <main className={styles.content}>
          <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
              <h1 className={styles.title}>Furniture</h1>
              <p className={styles.subText}>Premium furniture picks from MongoDB</p>

              {/* Tools row (search + sort) */}
              <div className={styles.tools}>
                <input
                  className={styles.search}
                  placeholder="Search furniture..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />

                {/* <select className={styles.select} value={sort} onChange={(e) => setSort(e.target.value as any)}>
                  <option value="new">Sort: Default</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select> */}
              </div>
            </div>

            {/* Body */}
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : filtered.length === 0 ? (
              <p className={styles.empty}>No furniture products found.</p>
            ) : (
              <div className={styles.grid}>
                {filtered.map((p) => (
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
