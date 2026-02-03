"use client";
import { useEffect, useState } from "react";
import Navbar from "../../component/navbar";
import Footer from "../../component/footer";
import styles from "../../css/checkout.module.css";
import NextNav from "../../component/nextnav";
import { useRouter } from "next/dist/client/components/navigation";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(data);
  }, []);

  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

  const placeOrder = () => {
    alert("Order placed successfully 🎉");
    localStorage.removeItem("cart");
    router.push("/card/payment");
  };

  return (
    <>
      <Navbar />
      <NextNav />


      <div className={styles.container}>
        <h1>Checkout</h1>

        <div className={styles.wrapper}>
          {/* LEFT SIDE */}
          <div className={styles.left}>
            {cart.map((item, index) => (
              <div className={styles.product} key={index}>
                <img src={item.image} alt={item.title} />
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <h3>₹ {item.price}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className={styles.right}>
            <h3>Shipping Details</h3>

            <input placeholder="Full Name" />
            <input placeholder="Address" />
            <input placeholder="City" />
            <input placeholder="Pincode" />
            <input placeholder="Phone Number" />

            <h2>Total: ₹ {total}</h2>

            <button onClick={placeOrder} >Place Order</button>

          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
