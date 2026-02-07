"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "../../css/fulldatails.module.css";
import Navbar from "@/app/component/navbar";

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
};

type CartItem = {
  _id: string;
  title: string;
  price: number;
  image?: string;
  qty: number;
};

const CART_KEY = "cart"; // ✅ checkout me jo key use ho rahi ho wahi rakho

const safeImg = (src?: string) => (src && src.startsWith("/") ? src : "/placeholder.png");

export default function ProductDetailsFull() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [p, setP] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);

  const addToCartAndGoCheckout = (prod: ProductType) => {
    const raw = localStorage.getItem(CART_KEY);
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];

    const price = Number(prod.price || 0);
    const idx = cart.findIndex((i) => i._id === prod._id);

    if (idx >= 0) cart[idx].qty += 1;
    else
      cart.push({
        _id: prod._id,
        title: prod.title,
        price,
        image: prod.image,
        qty: 1,
      });

    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    router.push("/checkout"); // ✅ shipping/checkout page
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
        const data = await res.json();
        setP(data?._id ? data : null);
      } catch {
        setP(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  return (
    <>
      <Navbar />

      <div className={styles.page}>
        {loading ? (
          <div className={styles.state}>Loading...</div>
        ) : !p ? (
          <div className={styles.state}>Product not found</div>
        ) : (
          <div className={styles.wrap}>
            <button className={styles.back} onClick={() => router.back()}>
              ← Back
            </button>

            <div className={styles.main}>
              <div className={styles.left}>
                <div className={styles.imgBox}>
                  <img className={styles.img} src={safeImg(p.image)} alt={p.title} />
                </div>
              </div>

              <div className={styles.right}>
                <h1 className={styles.h1}>{p.title}</h1>

                <div className={styles.priceRow}>
                  <div className={styles.price}>₹{p.price}</div>
                  {p.oldPrice ? <div className={styles.old}>₹{p.oldPrice}</div> : null}
                  {p.discount ? <div className={styles.badge}>{p.discount}</div> : null}
                </div>

                {p.category ? <div className={styles.cat}>Category: {p.category}</div> : null}

                {p.desc ? <p className={styles.desc}>{p.desc}</p> : null}

                {p.bullets?.length ? (
                  <ul className={styles.ul}>
                    {p.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}

                {/* ✅ Add to Cart button */}
                <div className={styles.actions}>
                  <button className={styles.btn} onClick={() => addToCartAndGoCheckout(p)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
