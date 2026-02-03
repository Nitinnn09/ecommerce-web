"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "../css/birth.module.css";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  title: string;
  desc: string;
  price: number;
  discount: number;
  rating: number;
  img: string;
}

const products: Product[] = [
  {
    id: 1,
    title: "Birthday Card Pink",
    desc: "Beautiful birthday greeting card",
    price: 299,
    discount: 399,
    rating: 4.5,
    img: "/birthday1.jpg",
  },
  {
    id: 2,
    title: "Birthday Card Blue",
    desc: "Premium quality birthday card",
    price: 249,
    discount: 349,
    rating: 4.2,
    img: "/birthday2.jpg",
  },
  {
    id: 3,
    title: "Kids Birthday Card",
    desc: "Cute design for kids",
    price: 199,
    discount: 299,
    rating: 4.8,
    img: "/birthday3.jpg",
  },
  {
    id: 4,
    title: "Luxury Birthday Card",
    desc: "Elegant premium card",
    price: 499,
    discount: 699,
    rating: 4.6,
    img: "/birthday4.jpg",
  },
];

export default function BirthdayProductGrid() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const router = useRouter();

  // 👉 Add to Cart Logic
  const addToCart = (product: Product) => {
    const cartData = localStorage.getItem("cart");
    const cart: Product[] = cartData ? JSON.parse(cartData) : [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Product added to cart 🛒");
  };

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.heading}>Birthday Cards 🎂</h2>

        <div className={styles.grid}>
          {products.map((item) => (
            <div className={styles.card} key={item.id}>
              
              {/* IMAGE CLICK */}
              <div
                className={styles.imageBox}
                onClick={() => setSelectedProduct(item)}
              >
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className={styles.image}
                />
              </div>

              {/* DETAILS */}
              <div className={styles.details}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>

                <div className={styles.price}>
                  <span className={styles.discount}>₹{item.discount}</span>
                  <span className={styles.final}>₹{item.price}</span>
                </div>

                <div className={styles.review}>
                  ⭐ {item.rating} / 5
                </div>

                <button
                  className={styles.cartBtn}
                 onClick={() => {
                    addToCart(item);
                    router.push("/card");
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 IMAGE PREVIEW MODAL */}
      {selectedProduct && (
        <div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedProduct.img}
              alt={selectedProduct.title}
              width={400}
              height={400}
            />

            <h3>{selectedProduct.title}</h3>
            <p>{selectedProduct.desc}</p>

            <div className={styles.price}>
              <span className={styles.discount}>
                ₹{selectedProduct.discount}
              </span>
              <span className={styles.final}>
                ₹{selectedProduct.price}
              </span>
            </div>

            <div className={styles.modalBtns}>
              <button
                className={styles.cartBtn}
                onClick={() => {
                  addToCart(selectedProduct);
                  router.push("/card");
                }}
              >
                Add to Cart
              </button>

              <button className={styles.buyBtn}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
