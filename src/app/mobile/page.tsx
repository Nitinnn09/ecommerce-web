"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../css/bodycloth.module.css";
import Navbar from "../component/navbar";
import CategorySidebar from "../component/category";

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

export default function MobilePage() {
  const [items, setItems] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ search + sort
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"default" | "low" | "high">("default");

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
        const res = await fetch("/api/products?category=mobile", {
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
      const t = (p.title || "").toLowerCase();
      const d = (p.desc || "").toLowerCase();
      return t.includes(text) || d.includes(text);
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
            <div className={styles.header}>
              <h1 className={styles.title}>Mobile</h1>
              <p className={styles.subText}>All mobile products from MongoDB</p>

              {/* ✅ tools row like furniture */}
              <div className={styles.tools}>
                <input
                  className={styles.search}
                  placeholder="Search mobile..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
{/* 
                <select className={styles.select} value={sort} onChange={(e) => setSort(e.target.value as any)}>
                  <option value="default">Sort: Default</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                </select> */}
              </div>
            </div>

            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : filtered.length === 0 ? (
              <p className={styles.empty}>No mobile products found.</p>
            ) : (
              <div className={styles.grid}>
                {filtered.map((p) => (
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
    </>
  );
}
