"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../component/navbar";
import CategorySidebar from "../component/category";
import styles from "../css/categorypage.module.css";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const urlQ = (searchParams.get("q") || "").trim().toLowerCase();
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

        const fetchByCategory = async (category: string) => {
          const res = await fetch(`/api/products?category=${encodeURIComponent(category)}`, {
            cache: "no-store",
            signal: controller.signal,
          });
          const data = await res.json().catch(() => ({} as any));
          return { res, data };
        };

        // Primary: most likely DB category is "electronics"
        let { res, data } = await fetchByCategory("electronics");
        let list = normalize(data);

        // Fallback: older typo used in this page ("electrical")
        if (res.ok && list.length === 0) {
          const alt = await fetchByCategory("electrical");
          if (alt.res.ok) {
            res = alt.res;
            data = alt.data;
            list = normalize(data);
          }
        }

        if (!res.ok) {
          setItems([]);
          setApiError((data as any)?.message || "API error");
          return;
        }

        setItems(list);
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

  const filtered = useMemo(() => {
    if (!urlQ) return items;
    return items.filter((p) => {
      const t = (p.title || "").toLowerCase();
      const d = (p.desc || "").toLowerCase();
      return t.includes(urlQ) || d.includes(urlQ);
    });
  }, [items, urlQ]);

  return (
  <>
    <Navbar />
    <CategorySidebar />

    <div className={styles.layout}>
      <main className={styles.content}>
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.heading}>
              <h1 className={styles.title}>Electronics</h1>
              <p className={styles.subText}>{urlQ ? `Results for "${urlQ}"` : "Browse electronics products"}</p>
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : apiError ? (
            <p className={styles.empty}>{apiError}</p>
          ) : items.length === 0 ? (
            <p className={styles.empty}>No electronics products found.</p>
          ) : filtered.length === 0 ? (
            <p className={styles.empty}>No matching products found.</p>
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
