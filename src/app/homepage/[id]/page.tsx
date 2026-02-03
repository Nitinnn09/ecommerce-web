"use client";

import Navbar from "@/app/component/navbar";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "../../css/home2.module.css";

type ProductType = {
  _id: string;
  title: string;
  price: number | string;
  oldPrice?: number | string;
  discount?: string;
  image?: string;         // main image
  images?: string[];      // optional gallery (if you add in DB later)
  desc?: string;
  category?: string;
  rating?: number;
  reviews?: number;
};

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [related, setRelated] = useState<ProductType[]>([]);
  const [activeImg, setActiveImg] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // same safety like your homepage
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

  const gallery = useMemo(() => {
    if (!product) return [];
    const list = [
      product.image,
      ...(Array.isArray(product.images) ? product.images : []),
    ].filter(Boolean) as string[];
    return Array.from(new Set(list)); // remove duplicates
  }, [product]);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        // ✅ 1) fetch single product by id
        const res = await fetch(`/api/products/${id}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(`Product fetch failed: ${res.status} ${t}`);
        }

        const p: ProductType = await res.json();
        setProduct(p);

        // default active image
        const first = safeImg(p.image || p.images?.[0]);
        setActiveImg(first);

        // ✅ 2) fetch related (same category)
        if (p.category) {
          const rRes = await fetch(
            `/api/products?category=${encodeURIComponent(p.category)}&limit=12`,
            { cache: "no-store", signal: controller.signal }
          );

          if (rRes.ok) {
            const rData = await rRes.json();
            const list = normalize(rData).filter((x) => x._id !== p._id);
            setRelated(list);
          } else {
            setRelated([]);
          }
        } else {
          setRelated([]);
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setErr(e?.message || "Something went wrong");
        }
        setProduct(null);
        setRelated([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Product added to cart");
  };

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (err) return <p style={{ padding: 40 }}>{err}</p>;
  if (!product) return <p style={{ padding: 40 }}>Product not found.</p>;

  return (
    <>
      <Navbar />

      <div className={styles.container}>
        {/* ✅ FULL WIDTH IMAGE */}
        <div className={styles.heroImage}>
          <Image
            src={safeImg(activeImg)}
            alt={product.title}
            fill
            priority
            className={styles.heroImgFit}
            sizes="100vw"
          />
          {product.discount ? (
            <span className={styles.heroBadge}>{product.discount}</span>
          ) : null}
        </div>

        {/* ✅ GALLERY (product related images) */}
        {gallery.length > 1 ? (
          <div className={styles.thumbRow}>
            {gallery.map((img) => (
              <button
                key={img}
                className={`${styles.thumbBtn} ${
                  safeImg(img) === safeImg(activeImg) ? styles.thumbActive : ""
                }`}
                onClick={() => setActiveImg(safeImg(img))}
                aria-label="Select image"
              >
                <Image src={safeImg(img)} alt="thumb" fill className={styles.thumbImg} sizes="120px" />
              </button>
            ))}
          </div>
        ) : null}

        {/* ✅ DETAILS */}
        <div className={styles.details}>
          <h1>{product.title}</h1>
          {product.category ? <span className={styles.category}>{product.category}</span> : null}

          <h2 className={styles.price}>
            ₹ {product.price}{" "}
            {product.oldPrice ? <span className={styles.oldPrice}>₹ {product.oldPrice}</span> : null}
          </h2>

          {product.desc ? <p className={styles.desc}>{product.desc}</p> : null}

          <div className={styles.buttons}>
            <button onClick={addToCart}>Add to Cart</button>
            <button onClick={() => router.push("/card/payment")}>Buy Now</button>
          </div>
        </div>

        {/* ✅ RELATED PRODUCTS (same category) */}
        <div className={styles.relatedWrap}>
          <h3>Related Products</h3>

          <div className={styles.relatedGrid}>
            {related.map((r) => (
              <Link key={r._id} href={`/product/${r._id}`} className={styles.relatedCard}>
                <div className={styles.relatedImgBox}>
                  <Image src={safeImg(r.image)} alt={r.title} fill className={styles.relatedImg} sizes="25vw" />
                </div>
                <p className={styles.relatedTitle}>{r.title}</p>
                <p className={styles.relatedPrice}>₹ {r.price}</p>
              </Link>
            ))}
            {related.length === 0 ? <p style={{ padding: 10 }}>No related products.</p> : null}
          </div>
        </div>

        {/* ✅ REVIEWS */}
        <div className={styles.reviews}>
          <h3>Customer Reviews</h3>
          <div className={styles.review}>
            ⭐⭐⭐⭐⭐ <p>Awesome quality 🔥</p>
          </div>
          <div className={styles.review}>
            ⭐⭐⭐⭐☆ <p>Value for money</p>
          </div>
        </div>
      </div>
    </>
  );
}
