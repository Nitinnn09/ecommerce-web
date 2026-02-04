"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import Navbar from "@/app/component/navbar";
import CategorySidebar from "@/app/component/category";
import styles from "../../css/productdetail.module.css";
import { addToCart } from "@/lib/cart";


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

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [product, setProduct] = useState<ProductType | null>(null);
  const [all, setAll] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const safeImg = (src?: string) => {
    if (!src) return "/placeholder.png";
    if (src.startsWith("/")) return src;
    return "/placeholder.png";
  };

  const addCartAndGoCheckout = () => {
  if (!product) return;
  addToCart(product);
  router.push("/checkout"); // ✅ direct payment/checkout page
};

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);

        // 1) current product
        const pRes = await fetch(`/api/products/${id}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const pData = await pRes.json();

        if (!pRes.ok) {
          setProduct(null);
          return;
        }

        setProduct(pData);

        // 2) all products for related list (same category)
        const res = await fetch("/api/products", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await res.json();
        const list: ProductType[] = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
        setAll(list);
      } catch (e) {
        console.log(e);
        setProduct(null);
        setAll([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [id]);

  const related = useMemo(() => {
    if (!product) return [];
    const cat = (product.category || "").toLowerCase();

    return all
      .filter((p) => p._id !== product._id)
      .filter((p) => (p.category || "").toLowerCase() === cat)
      .slice(0, 8);
  }, [all, product]);

  return (
    <>
      <Navbar />
      <CategorySidebar />

      <div className={styles.layout}>
        <main className={styles.content}>
          <div className={styles.page}>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : !product ? (
              <div className={styles.notFound}>
                <p>Product not found.</p>
                <button className={styles.backBtn} onClick={() => router.back()}>
                  Go Back
                </button>
              </div>
            ) : (
              <>
                {/* ✅ FULL WIDTH DETAILS */}
                <section className={styles.detailWrap}>
                  <div className={styles.hero}>
                    {product.discount ? <span className={styles.badge}>{product.discount}</span> : null}

                    <div className={styles.heroImg}>
                      <Image
                        src={safeImg(product.image)}
                        alt={product.title || "product"}
                        fill
                        className={styles.img}
                        sizes="(max-width: 900px) 100vw, 900px"
                      />
                    </div>

                    <div className={styles.heroInfo}>
                      <h1 className={styles.title}>{product.title}</h1>

                      <p className={styles.price}>
                        ₹{product.price} {product.oldPrice ? <span>₹{product.oldPrice}</span> : null}
                      </p>

                      {product.category ? <p className={styles.cat}>{product.category}</p> : null}

                      {product.desc ? <p className={styles.desc}>{product.desc}</p> : null}

                      <div className={styles.actions}>
                        <button className={styles.primary}  onClick={addCartAndGoCheckout}>Add to Cart</button>
                        <button className={styles.buyBtn} onClick={addCartAndGoCheckout}>
                        Buy Now
                        </button>
                        <button className={styles.secondary} onClick={() => router.back()}>
                          Back
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ✅ RELATED (Niche images / products) */}
                <section className={styles.relatedWrap}>
                  <h2 className={styles.relatedTitle}>Related Products</h2>

                  {related.length === 0 ? (
                    <p className={styles.relatedEmpty}>No related products found.</p>
                  ) : (
                    <div className={styles.relatedGrid}>
                      {related.map((p) => (
                        <Link key={p._id} href={`/product/${p._id}`} className={styles.rCard}>
                          <div className={styles.rImgBox}>
                            <Image
                              src={safeImg(p.image)}
                              alt={p.title || "related"}
                              fill
                              className={styles.img}
                              sizes="(max-width: 520px) 50vw, 200px"
                            />
                          </div>
                          <div className={styles.rInfo}>
                            <p className={styles.rName}>{p.title}</p>
                            <p className={styles.rPrice}>₹{p.price}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
