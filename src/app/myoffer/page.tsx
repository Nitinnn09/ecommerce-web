"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../css/myoffer.module.css";
import Navbar from "../component/navbar";

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
  createdAt?: string;
};

type CartItem = {
  _id: string;
  title: string;
  price: number;
  image?: string;
  qty: number;
};

const CART_KEY = "cart"; // ✅ checkout me jo key use hoti ho, wahi rakho

const safeImg = (src?: string) => (src && src.startsWith("/") ? src : "/placeholder.png");

const calcDiscount = (price: unknown, oldPrice: unknown) => {
  const p = Number(price || 0);
  const o = Number(oldPrice || 0);
  if (!o || !p || o <= p) return "";
  const per = Math.round(((o - p) / o) * 100);
  return `-${per}%`;
};

export default function OfferPage() {
  const router = useRouter();

  const [items, setItems] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<"new" | "high">("new");

  const [catOpen, setCatOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCatOpen(false);
        setSortOpen(false);
      }
    };

    const onDocClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest?.(`.${styles.dropdown}`)) return;
      setCatOpen(false);
      setSortOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick, { passive: true });

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
    };
  }, []);

  const addToCartLocal = (p: ProductType, qty = 1) => {
    const raw = localStorage.getItem(CART_KEY);
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];

    const price = Number(p.price || 0);
    const idx = cart.findIndex((i) => i._id === p._id);

    if (idx >= 0) cart[idx].qty += qty;
    else
      cart.push({
        _id: p._id,
        title: p.title,
        price,
        image: p.image,
        qty,
      });

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  };

  // ✅ Add to cart + go to checkout/shipping
  const handleAddToCartGoCheckout = (p: ProductType) => {
    addToCartLocal(p, 1);
    router.push("/checkout");
  };

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("offer", "true");

      const res = await fetch(`/api/products?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data?.products) ? data.products : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((p) => p.category && set.add(p.category));
    return ["all", ...Array.from(set)];
  }, [items]);

  const viewList = useMemo(() => {
    const text = q.trim().toLowerCase();

    const selectedCat = cat.trim().toLowerCase();

    const list = items.filter((p) => {
      if (selectedCat && selectedCat !== "all") {
        const pCat = (p.category || "").trim().toLowerCase();
        if (pCat !== selectedCat) return false;
      }

      if (!text) return true;
      return (
        (p.title || "").toLowerCase().includes(text) ||
        (p.desc || "").toLowerCase().includes(text) ||
        (p.category || "").toLowerCase().includes(text)
      );
    });

    if (sort === "new") {
      list.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
    } else {
      list.sort((a, b) => {
        const ad = Number(a.oldPrice || 0) - Number(a.price || 0);
        const bd = Number(b.oldPrice || 0) - Number(b.price || 0);
        return bd - ad;
      });
    }

    return list;
  }, [items, q, sort, cat]);

  return (
    <>
      <Navbar />

      <div className={styles.page}>
        <div className={styles.hero}>
          <div>
            <h1 className={styles.h1}>Offer Products</h1>
            <p className={styles.p}>Discount wale products yahan milenge ✅</p>
          </div>

          <div className={styles.toolbar}>
            <input
              className={styles.search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search offer products..."
            />

            <div className={styles.dropdown}>
              <button
                type="button"
                className={styles.dropBtn}
                onClick={() => {
                  setCatOpen((v) => !v);
                  setSortOpen(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={catOpen}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>

              {catOpen ? (
                <div className={styles.menu} role="listbox" aria-label="Select category">
                  {categories.map((c) => (
                    <button
                      type="button"
                      key={c}
                      className={`${styles.item} ${cat === c ? styles.itemActive : ""}`}
                      onClick={() => {
                        setCat(c || "all");
                        setCatOpen(false);
                      }}
                      role="option"
                      aria-selected={cat === c}
                    >
                      {c === "all" ? "All Categories" : c}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className={styles.dropdown}>
              <button
                type="button"
                className={styles.dropBtn}
                onClick={() => {
                  setSortOpen((v) => !v);
                  setCatOpen(false);
                }}
                aria-haspopup="listbox"
                aria-expanded={sortOpen}
              >
                {sort === "high" ? "Sort: High Discount" : "Sort: New"}
              </button>

              {sortOpen ? (
                <div className={styles.menu} role="listbox" aria-label="Select sort">
                  <button
                    type="button"
                    className={`${styles.item} ${sort === "new" ? styles.itemActive : ""}`}
                    onClick={() => {
                      setSort("new");
                      setSortOpen(false);
                    }}
                    role="option"
                    aria-selected={sort === "new"}
                  >
                    Sort: New
                  </button>

                  <button
                    type="button"
                    className={`${styles.item} ${sort === "high" ? styles.itemActive : ""}`}
                    onClick={() => {
                      setSort("high");
                      setSortOpen(false);
                    }}
                    role="option"
                    aria-selected={sort === "high"}
                  >
                    Sort: High Discount
                  </button>
                </div>
              ) : null}
            </div>

            <button className={styles.btnGhost} onClick={() => fetchOffers()} style={{ minWidth: 110 }}>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.state}>Loading offers...</div>
        ) : viewList.length === 0 ? (
          <div className={styles.state}>Koi offer product nahi mila.</div>
        ) : (
          <div className={styles.grid}>
            {viewList.map((p) => {
              const disc = p.discount || calcDiscount(p.price, p.oldPrice);

              return (
                <div key={p._id} className={styles.card}>
                  <div className={styles.bannerWrap}>
                    <img className={styles.banner} src={safeImg(p.image)} alt={p.title} />
                    {disc ? <div className={styles.badge}>{disc}</div> : null}
                  </div>

                  <div className={styles.body}>
                    <div className={styles.titleRow}>
                      <h3 className={styles.title}>{p.title}</h3>
                      {p.category ? <span className={styles.chip}>{p.category}</span> : null}
                    </div>

                    {p.desc ? <p className={styles.desc}>{p.desc}</p> : null}

                    <div className={styles.priceRow}>
                      <div className={styles.price}>₹{p.price}</div>
                      {p.oldPrice ? <div className={styles.old}>₹{p.oldPrice}</div> : null}
                    </div>

                    {/* ✅ ONLY TWO OPTIONS: View + Add to Cart (go checkout) */}
                    <div className={styles.actions}>
                      <Link className={styles.btnGhost} href={`/allproduct/${p._id}`}>
                        View
                      </Link>

                      <button className={styles.btn} onClick={() => handleAddToCartGoCheckout(p)}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
