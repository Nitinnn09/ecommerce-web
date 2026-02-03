"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import styles from "../../css/productList.module.css";
import Navbar from "@/app/component/navbar";
import CategorySidebar from "@/app/component/category";

type ProductType = {
  _id: string;
  title: string;
  price: number | string;
  oldPrice?: number | string;
  discount?: string;
  image?: string;
  desc?: string;
  bullets?: string[];
  category?: string;
  stock?: number;
  rating?: number;
  reviews?: number;
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [related, setRelated] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [relLoading, setRelLoading] = useState(false);
  const [error, setError] = useState("");

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

  const stars = useMemo(() => {
    const r = Number(product?.rating ?? 4.5);
    const full = Math.round(r);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  }, [product?.rating]);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/products/${id}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`Product fetch failed: ${res.status} ${t}`);
        }

        const data = (await res.json()) as ProductType;
        setProduct(data);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          setError(e?.message || "Something went wrong");
          setProduct(null);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!product?.category) return;

    const controller = new AbortController();

    const loadRelated = async () => {
      try {
        setRelLoading(true);

        const res = await fetch(
          `/api/products?category=${encodeURIComponent(product.category)}&limit=8`,
          { cache: "no-store", signal: controller.signal }
        );

        const data = await res.json();
        const items = normalize(data).filter((x) => x._id !== product._id);
        setRelated(items);
      } catch {
        setRelated([]);
      } finally {
        setRelLoading(false);
      }
    };

    loadRelated();
    return () => controller.abort();
  }, [product?._id, product?.category]);

  const addToCart = () => {
    if (!product) return;
    const key = "cart";
    const old = JSON.parse(localStorage.getItem(key) || "[]");
    const exists = old.find((x: any) => x._id === product._id);
    const next = exists
      ? old.map((x: any) => (x._id === product._id ? { ...x, qty: (x.qty || 1) + 1 } : x))
      : [...old, { ...product, qty: 1 }];

    localStorage.setItem(key, JSON.stringify(next));
    alert("Added to cart ✅");
  };

  const buyNow = () => {
    addToCart();
    router.push("/cart");
  };

  return (
    <>
      <Navbar />
      <CategorySidebar />

      <div className={styles.layout}>
        <main className={styles.content}>
          {loading ? (
            <div className={styles.stateBox}>Loading...</div>
          ) : error ? (
            <div className={styles.stateBox}>
              <p className={styles.err}>{error}</p>
              <button className={styles.backBtn} onClick={() => router.back()}>
                ← Go Back
              </button>
            </div>
          ) : !product ? (
            <div className={styles.stateBox}>Product not found</div>
          ) : (
            <>
              <section className={styles.detail}>
                <div className={styles.media}>
                  {product.discount ? <span className={styles.badge}>{product.discount}</span> : null}

                  <div className={styles.imgWrap}>
                    <Image
                      src={safeImg(product.image)}
                      alt={product.title}
                      fill
                      className={styles.img}
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>

                <div className={styles.info}>
                  <h1 className={styles.title}>{product.title}</h1>

                  <div className={styles.ratingRow}>
                    <span className={styles.stars}>{stars}</span>
                    <span className={styles.ratingText}>
                      {product.rating ?? 4.5} ({product.reviews ?? 0} reviews)
                    </span>
                  </div>

                  <div className={styles.priceRow}>
                    <span className={styles.price}>₹{product.price}</span>
                    {product.oldPrice ? <span className={styles.old}>₹{product.oldPrice}</span> : null}
                  </div>

                  {product.desc ? <p className={styles.desc}>{product.desc}</p> : null}

                  <div className={styles.actions}>
                    <button className={styles.cartBtn} onClick={addToCart}>
                      Add to Cart
                    </button>
                    <button className={styles.buyBtn} onClick={buyNow}>
                      Buy Now
                    </button>
                  </div>
                </div>
              </section>

              <section className={styles.related}>
                <div className={styles.relHead}>
                  <h2>Related Products</h2>
                  <p>{relLoading ? "Loading..." : `More from ${product.category || "this category"}`}</p>
                </div>

                <div className={styles.relGrid}>
                  {related.map((p) => (
                    <Link key={p._id} href={`/productDetails/${p._id}`} className={styles.relCard}>
                      <div className={styles.relImg}>
                        <Image src={safeImg(p.image)} alt={p.title} fill className={styles.relFit} />
                      </div>
                      <div className={styles.relInfo}>
                        <h3>{p.title}</h3>
                        <p className={styles.relPrice}>₹{p.price}</p>
                      </div>
                    </Link>
                  ))}

                  {!relLoading && related.length === 0 ? (
                    <div className={styles.emptyRel}>No related products found.</div>
                  ) : null}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </>
  );
}
