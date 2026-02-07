"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {useRouter} from "next/navigation";
import styles from "../css/home.module.css";
import Footer from "../component/footer";
import MobileBrands from "../component/mobile";
import { addToCart } from "@/lib/cart";

const Navbar = dynamic(() => import("../component/navbar"));
const Banner = dynamic(() => import("../component/banner"));
const NextNav = dynamic(() => import("../component/nextnav"));

const featuredItems = [
  {
    title: "Dining table Smart",
    price: "113.00",
    oldPrice: "180.00",
    discount: "-20%",
    image: "/dinigt.jpg",
    desc: "Premium walnut finish dining table with strong X-base support. Perfect for office & home.",
    bullets: ["Solid wood build", "Modern X-base design", "Easy to clean surface", "Fast delivery"],
  },
  {
    title: "Facewash for man",
    price: "190.00",
    oldPrice: "230.00",
    discount: "-15%",
    image: "/facewash.jpg",
    desc: "Ergonomic chair with premium comfort and strong support.",
    bullets: ["Ergonomic design", "Breathable fabric", "Strong build", "Smooth wheels"],
  },
  {
    title: "Modern Lamp",
    price: "86.00",
    oldPrice: "120.00",
    discount: "-10%",
    image: "/lamp1.jpg",
    desc: "Minimal lamp with warm lighting for home/office.",
    bullets: ["Warm light", "Modern look", "Energy efficient", "Durable build"],
  },
];


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
  tag?: string;
  rating?: number;
  reviews?: number;
};

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const [furniture, setFurniture] = useState<ProductType[]>([]);
  const [clothes, setClothes] = useState<ProductType[]>([]);
  const [bodycare, setBodycare] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);


const handleAddAndCheckout = (p: any) => {
  addToCart({
    _id: p._id || p.title,          // featuredItems me _id nahi hai, isliye fallback
    title: p.title,
    price: Number(p.price),
    image: p.image,
  }, 1);

  router.push("/checkout");         // ✅ direct checkout
};


  // ✅ Strict image safe (blocks C:\fakepath...)
  const safeImg = (src?: string) => {
    if (!src) return "/placeholder.png";
    if (src.startsWith("/")) return src; // /uploads/... or /sofa.png
    return "/placeholder.png";
  };

  // ✅ Normalize response (array OR {products: []})
  const normalize = (d: any): ProductType[] => {
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.products)) return d.products;
    return [];
  };

  // ✅ Fetch from MongoDB via API
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [fRes, cRes, gRes] = await Promise.all([
          fetch("/api/products?category=furniture"),
          fetch("/api/products?category=clothes&limit=8"),
          fetch("/api/products?category=bodycare"),
        ]);

        // ✅ status debug
        console.log("API status:", fRes.status, cRes.status, gRes.status);

        if (!fRes.ok || !cRes.ok || !gRes.ok) {
          const t1 = await fRes.text().catch(() => "");
          const t2 = await cRes.text().catch(() => "");
          const t3 = await gRes.text().catch(() => "");
          throw new Error(`API failed: ${t1} | ${t2} | ${t3}`);
        }

        const [fData, cData, gData] = await Promise.all([fRes.json(), cRes.json(), gRes.json()]);

        // ✅ raw debug (very important)
        console.log("RAW furniture:", fData);
        console.log("RAW clothes:", cData);
        console.log("RAW bodycare:", gData);

        setFurniture(normalize(fData));
        setClothes(normalize(cData));
        setBodycare(normalize(gData));
      } catch (e) {
        console.error("Fetch error:", e);
        setFurniture([]);
        setClothes([]);
        setBodycare([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const [featureIndex, setFeatureIndex] = useState(0);

useEffect(() => {
  if (!featuredItems.length) return;

  const id = window.setInterval(() => {
    setFeatureIndex((prev) => (prev + 1) % featuredItems.length);
  }, 2000);

  return () => window.clearInterval(id);
}, []);


// ✅ rating helpers (always show)
const starText = (rating?: number) => {
  const r = Math.max(0, Math.min(5, Number(rating ?? 4.5)));
  const full = Math.round(r);
  return "★★★".slice(0, full) + "☆☆☆".slice(0, 5 - full);
};

const getRating = (item: ProductType) => Number(item.rating ?? 4.5);
const getReviews = (item: ProductType) => Number(item.reviews ?? 0);



  // ✅ Auto scroll furniture slider (continuous)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const speed = 0.6;

    const step = () => {
      track.scrollLeft += speed;
      if (track.scrollLeft >= track.scrollWidth / 2) track.scrollLeft = 0;
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    const stop = () => cancelAnimationFrame(raf);
    const start = () => (raf = requestAnimationFrame(step));

    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);

    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener("mouseenter", stop);
      track.removeEventListener("mouseleave", start);
    };
  }, [furniture.length]);

  const featured = featuredItems[featureIndex];

  // ✅ Glow auto scroll (every 2s)
  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    const getStep = () => {
      const firstCard = el.querySelector<HTMLElement>("[data-glow-card]");
      if (!firstCard) return 380;
      const gap = 24;
      return firstCard.getBoundingClientRect().width + gap;
    };

    const step = () => {
      const stepPx = getStep();
      const max = el.scrollWidth - el.clientWidth - 5;

      if (el.scrollLeft >= max) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: stepPx, behavior: "smooth" });
    };

    let intervalId = window.setInterval(step, 2000);

    const stop = () => window.clearInterval(intervalId);
    const resume = () => {
      window.clearInterval(intervalId);
      intervalId = window.setInterval(step, 2000);
    };

    el.addEventListener("mouseenter", stop);
    el.addEventListener("mouseleave", resume);

    return () => {
      window.clearInterval(intervalId);
      el.removeEventListener("mouseenter", stop);
      el.removeEventListener("mouseleave", resume);
    };
  }, [bodycare.length]);

  // ✅ Scroll reveal animation
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const items = root.querySelectorAll("[data-reveal]");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("inView"));
      },
      { threshold: 0.15 }
    );

    items.forEach((el) => io.observe(el));

    return () => {
      items.forEach((el) => io.unobserve(el));
      io.disconnect();
    };
  }, [furniture.length, clothes.length, bodycare.length]);

  const sliderItems = furniture.length ? [...furniture, ...furniture] : [];

  return (
    <div ref={pageRef}>
      <Navbar />
      <NextNav />
      <Banner />

      {/* ✅ FEATURED */}
     {/* ✅ FEATURED (Auto Change) */}
        {/* ✅ FEATURED CARDS (3 items) */}
<section className={styles.featureCardsWrap} data-reveal>
  <div className={styles.featureCardsHead}>
    <h2 className={styles.featureCardsTitle}>FEATURES PICKS</h2>
    <p className={styles.featureCardsSub}>Top deals handpicked for you</p>
  </div>

  {/* ✅ Desktop grid */}
  <div className={styles.featureCardsGrid}>
    {featuredItems.map((item, idx) => (
      <div key={idx} className={styles.featureCard}>
        <Image
          src={item.image}
          alt={item.title}
          fill
          className={styles.featureCardImg}
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={idx === 0}
        />
        <div className={styles.featureOverlay} />
        {item.discount ? <span className={styles.featureChip}>{item.discount}</span> : null}

        <div className={styles.featureCardContent}>
          <p className={styles.featureMini}>HOME • OFFICE</p>
          <h3 className={styles.featureCardName}>{item.title}</h3>

          <p className={styles.featureCardPrice}>
            ₹{item.price} <span>₹{item.oldPrice}</span>
          </p>

          <p className={styles.featureCardDesc}>{item.desc}</p>

          <div className={styles.featureCardBtns}>
            <button className={styles.featureBtnPrimary} onClick={() => handleAddAndCheckout(item)}>
              Add to Cart
            </button>
            <button className={styles.featureBtnGhost}>View Details</button>
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* ✅ Mobile slider (auto change) */}
  <div className={styles.featureMobileOnly}>
    <div className={styles.featureMobileTrack} style={{ transform: `translateX(-${featureIndex * 100}%)` }}>
      {featuredItems.map((item, idx) => (
        <div key={idx} className={styles.featureMobileSlide}>
          <div className={styles.featureCard}>
            <Image
              src={item.image}
              alt={item.title}
              fill
              className={styles.featureCardImg}
              sizes="100vw"
              priority={idx === 0}
            />
            <div className={styles.featureOverlay} />
            {item.discount ? <span className={styles.featureChip}>{item.discount}</span> : null}

            <div className={styles.featureCardContent}>
              <p className={styles.featureMini}>HOME • OFFICE</p>
              <h3 className={styles.featureCardName}>{item.title}</h3>

              <p className={styles.featureCardPrice}>
                ₹{item.price} <span>₹{item.oldPrice}</span>
              </p>

              <p className={styles.featureCardDesc}>{item.desc}</p>

              <div className={styles.featureCardBtns}>
                <button className={styles.featureBtnPrimary} onClick={() => handleAddAndCheckout(item)}>
                  Add to Cart
                </button>
                <button className={styles.featureBtnGhost}>View Details</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* dots */}
    <div className={styles.featureDots}>
      {featuredItems.map((_, i) => (
        <button
          key={i}
          className={`${styles.dot} ${i === featureIndex ? styles.dotActive : ""}`}
          onClick={() => setFeatureIndex(i)}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  </div>
</section>




      {/* ✅ FURNITURE SLIDER */}
      <section className={styles.sliderSection} data-reveal>
        <div className={styles.sliderHeader}>
          <h2>POPULAR FURNITURE</h2>
          <p>{loading ? "Loading..." : "Auto scroll cards (hover to pause)"}</p>
        </div>

        <div className={styles.sliderTrack} ref={trackRef}>
          <div className={styles.sliderRow}>
            {sliderItems.map((item, i) => (
              <Link
                href={`/furniture`}
                className={styles.sliderCard}
                key={`${item._id}-${i}`}
                data-reveal
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {item.discount && <span className={styles.cardBadge}>{item.discount}</span>}

                <div className={styles.cardImg}>
                  <Image src={safeImg(item.image)} alt={item.title || "product"} fill className={styles.imgFit} />
                </div>

                <h3>{item.title}</h3>
                <p className={styles.cardPrice}>
                  ₹{item.price} {item.oldPrice ? <span>₹{item.oldPrice}</span> : null}
                </p>
              </Link>
            ))}

            {!loading && furniture.length === 0 ? <p style={{ padding: 10 }}>No furniture products found.</p> : null}
          </div>
        </div>
      </section>

      {/* ✅ CLOTHES */}
     {/* ✅ CLOTHES */}
<section className={styles.clothsWrap} data-reveal>
  <p className={styles.collectionTag}>CLOTHES COLLECTION</p>
  <p className={styles.subText}>Best fashion picks for you — premium quality & modern style</p>

  <div className={styles.clothsHead}>
    <div className={styles.clothTitleLeft}></div>

    <Link href="/clothes" className={styles.clothsViewAll}>
      View All
    </Link>
  </div>

  <div className={styles.clothsGrid}>
    {clothes.slice(0,12).map((item) => (
      <Link
        href={`/clothes`}
        className={styles.clothCard}
        key={item._id}
        data-reveal
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className={styles.clothImgBox}>
          {item.discount ? <span className={styles.clothDiscount}>{item.discount}</span> : null}
          {item.tag ? <span className={styles.clothTag}>{item.tag}</span> : null}

          {/* ✅ ALWAYS SHOW rating/reviews */}
          <div className={styles.ratingBadge}>
            <span className={styles.stars}>{starText(getRating(item))}</span>
            <span className={styles.ratingText}>
              {getRating(item).toFixed(1)} ({getReviews(item)})
            </span>
          </div>

          <Image src={safeImg(item.image)} alt={item.title || "product"} fill className={styles.clothImg} />

          <span
            className={styles.imgCartBtn}
            role="button"
            aria-label="Add to cart"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(
                {
                  _id: item._id,
                  title: item.title,
                  price: Number(item.price),
                  image: item.image,
                },
                1
              );
              alert("Added to cart ✅");
            }}
          >
            Add to Cart
          </span>
        </div>

        <div className={styles.clothInfo}>
          <h3>{item.title}</h3>
          <p className={styles.clothPrice}>
            ₹{item.price} {item.oldPrice ? <span>₹{item.oldPrice}</span> : null}
          </p>
        </div>
      </Link>
    ))}

    {!loading && clothes.length === 0 ? <p style={{ padding: 10 }}>No clothes products found.</p> : null}
  </div>
</section>


      {/* ✅ BODYCARE */}
      <section className={styles.glowWrap} data-reveal>
        <div className={styles.glowHead}>
          <h2>GLOW & PROTECT</h2>
          <p>Body care products that nourish, protect, and enhance your skin—effortlessly.</p>

          <div className={styles.glowArrows}>
            <button className={styles.arrowBtn} onClick={() => glowRef.current?.scrollBy({ left: -420, behavior: "smooth" })}>
              ←
            </button>
            <button className={styles.arrowBtn} onClick={() => glowRef.current?.scrollBy({ left: 420, behavior: "smooth" })}>
              →
            </button>
          </div>
        </div>

        <div className={styles.glowTrack} ref={glowRef} id="glowTrack">
          {bodycare.map((item) => (
            <Link
              href={`/bodycare`}
              className={styles.glowCard}
              key={item._id}
              data-reveal
              data-glow-card
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className={styles.glowImg}>
                <Image src={safeImg(item.image)} alt={item.title || "product"} fill className={styles.glowFit} />
              </div>

              <div className={styles.glowInfo}>
                <div className={styles.glowTop}>
                  <h3>{item.title}</h3>
                  <span className={styles.glowPrice}>₹{item.price}</span>
                </div>
                <p className={styles.glowDesc}>{item.desc ?? ""}</p>
              </div>
            </Link>
          ))}

          {!loading && bodycare.length === 0 ? <p style={{ padding: 10 }}>No bodycare products found.</p> : null}
        </div>

        <div className={styles.glowFooter}>
          <Link href="/bodycare" className={styles.glowViewAll}>
            View all
          </Link>
        </div>
      </section>

      <MobileBrands />
      <Footer />
    </div>
  );
}
