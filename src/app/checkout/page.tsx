"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import styles from "../css/checkout.module.css";
import { CartItem, cartTotal, getCart, updateQty } from "@/lib/cart";
import Navbar from "../component/navbar";

const safeImg = (src?: string) => (src && src.startsWith("/") ? src : "/placeholder.png");

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<"cod" | "upi">("cod");

  // ✅ screenshot style: shipping method
  const [shipMethod, setShipMethod] = useState<"free" | "regular" | "express">("regular");

  const [ship, setShip] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    city: "",
    district: "",
    address: "",
    pincode: "",
  });

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0); // ₹ amount

  useEffect(() => {
    setCart(getCart());
  }, []);

  const subtotal = useMemo(() => cartTotal(cart), [cart]);

  // ✅ shipping fee like screenshot (free/regular/express)
  const shippingFee = useMemo(() => {
    if (!cart.length) return 0;
    if (shipMethod === "free") return 0;
    if (shipMethod === "regular") return 90;
    return 320;
  }, [cart.length, shipMethod]);

  const grandTotal = Math.max(0, subtotal + shippingFee - discount);

  const changeQty = (_id: string, qty: number) => {
    const next = updateQty(_id, qty);
    setCart(next);
  };

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;

    // demo coupon
    if (code === "SAVE50") setDiscount(50);
    else if (code === "SAVE100") setDiscount(100);
    else {
      setDiscount(0);
      alert("Invalid coupon");
      return;
    }

    alert("Coupon applied ✅");
  };

  const placeOrder = () => {
    if (!cart.length) return alert("Cart is empty");

    if (!ship.email || !ship.phone || !ship.firstName || !ship.lastName || !ship.city || !ship.district || !ship.address) {
      return alert("Please fill shipping details");
    }

    const order = {
      items: cart,
      shipping: ship,
      shippingMethod: shipMethod,
      paymentMethod: payment,
      subtotal,
      shippingFee,
      discount,
      total: grandTotal,
      createdAt: new Date().toISOString(),
    };

    console.log("ORDER:", order);
    alert("Continue to payment (demo) ✅");
  };

  return (
    <>
    <Navbar/>
    <div className={styles.page}>
      <div className={styles.container}>
        {/* TOP */}
        <div className={styles.topBar}>
          <h1 className={styles.h1}>Checkout</h1>

          <div className={styles.steps}>
            <span className={`${styles.step} ${styles.active}`}>Shipping</span>
            <span className={styles.arrow}>→</span>
            <span className={styles.step}>Payment</span>
            <span className={styles.arrow}>→</span>
            <span className={styles.step}>Finish</span>
          </div>
        </div>

        <div className={styles.grid}>
          {/* LEFT: SHIPPING */}
          <section className={styles.leftCard}>
            <h2 className={styles.h2}>Shipping</h2>

            <div className={styles.section}>
              <p className={styles.sectionTitle}>Contact Information</p>

              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    className={styles.input}
                    placeholder="example@gmail.com"
                    value={ship.email}
                    onChange={(e) => setShip({ ...ship, email: e.target.value })}
                  />
                  <span className={styles.hint}>We will send order details to this email.</span>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Phone Number</label>
                  <input
                    className={styles.input}
                    placeholder="Enter your phone number"
                    value={ship.phone}
                    onChange={(e) => setShip({ ...ship, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionTitle}>Shipping Address</p>

              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label className={styles.label}>First Name</label>
                  <input
                    className={styles.input}
                    placeholder="Enter first name"
                    value={ship.firstName}
                    onChange={(e) => setShip({ ...ship, firstName: e.target.value })}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Last Name</label>
                  <input
                    className={styles.input}
                    placeholder="Enter last name"
                    value={ship.lastName}
                    onChange={(e) => setShip({ ...ship, lastName: e.target.value })}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>City</label>
                  <input
                    className={styles.input}
                    placeholder="Select City"
                    value={ship.city}
                    onChange={(e) => setShip({ ...ship, city: e.target.value })}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>District</label>
                  <input
                    className={styles.input}
                    placeholder="Select District"
                    value={ship.district}
                    onChange={(e) => setShip({ ...ship, district: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.field} style={{ marginTop: 10 }}>
                <label className={styles.label}>Street Address</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Enter your street address"
                  value={ship.address}
                  onChange={(e) => setShip({ ...ship, address: e.target.value })}
                />
              </div>

              <div className={styles.field} style={{ marginTop: 10 }}>
                <label className={styles.label}>Pincode</label>
                <input
                  className={styles.input}
                  placeholder="Enter pincode"
                  value={ship.pincode}
                  onChange={(e) => setShip({ ...ship, pincode: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionTitle}>Shipping Method</p>

              <button
                type="button"
                className={`${styles.shipOption} ${shipMethod === "free" ? styles.shipActive : ""}`}
                onClick={() => setShipMethod("free")}
              >
                <div className={styles.shipLeft}>
                  <span className={styles.radioDot}>{shipMethod === "free" ? "●" : "○"}</span>
                  <div>
                    <div className={styles.shipName}>Free shipping</div>
                    <div className={styles.shipSub}>7-15 business days</div>
                  </div>
                </div>
                <div className={styles.shipPrice}>₹0</div>
              </button>

              <button
                type="button"
                className={`${styles.shipOption} ${shipMethod === "regular" ? styles.shipActive : ""}`}
                onClick={() => setShipMethod("regular")}
              >
                <div className={styles.shipLeft}>
                  <span className={styles.radioDot}>{shipMethod === "regular" ? "●" : "○"}</span>
                  <div>
                    <div className={styles.shipName}>Regular shipping</div>
                    <div className={styles.shipSub}>5-10 business days</div>
                  </div>
                </div>
                <div className={styles.shipPrice}>₹90</div>
              </button>

              <button
                type="button"
                className={`${styles.shipOption} ${shipMethod === "express" ? styles.shipActive : ""}`}
                onClick={() => setShipMethod("express")}
              >
                <div className={styles.shipLeft}>
                  <span className={styles.radioDot}>{shipMethod === "express" ? "●" : "○"}</span>
                  <div>
                    <div className={styles.shipName}>Express shipping</div>
                    <div className={styles.shipSub}>1-3 business days</div>
                  </div>
                </div>
                <div className={styles.shipPrice}>₹320</div>
              </button>
            </div>
          </section>

          {/* RIGHT: ORDER SUMMARY */}
          <aside className={styles.rightCard}>
            <h2 className={styles.h2}>Order Summary</h2>

            <div className={styles.summaryItems}>
              {cart.length === 0 ? (
                <div className={styles.empty}>Cart is empty</div>
              ) : (
                cart.map((it) => (
                  <div key={it._id} className={styles.sumRow}>
                    <div className={styles.sumThumb}>
                      <Image src={safeImg(it.image)} alt={it.title} fill className={styles.sumImg} />
                    </div>

                    <div className={styles.sumMeta}>
                      <div className={styles.sumName}>{it.title}</div>
                      <div className={styles.sumSub}>Qty: {it.qty}</div>
                      <div className={styles.sumPrice}>₹{it.price}</div>
                    </div>

                    <div className={styles.qty}>
                      <button className={styles.qtyBtn} onClick={() => changeQty(it._id, (it.qty || 1) - 1)}>
                        −
                      </button>
                      <span className={styles.qtyNum}>{it.qty}</span>
                      <button className={styles.qtyBtn} onClick={() => changeQty(it._id, (it.qty || 1) + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.couponBox}>
              <p className={styles.sectionTitle} style={{ marginBottom: 8 }}>
                Discount Code
              </p>

              <div className={styles.couponRow}>
                <input
                  className={styles.input}
                  placeholder="Enter your promo code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button className={styles.applyBtn} onClick={applyCoupon} type="button">
                  Apply
                </button>
              </div>
            </div>

            <div className={styles.totals}>
              <div className={styles.line}>
                <span>Subtotal</span>
                <b>₹{subtotal}</b>
              </div>

              <div className={styles.line}>
                <span>Delivery Charges</span>
                <b>₹{shippingFee}</b>
              </div>

              {discount > 0 ? (
                <div className={styles.line}>
                  <span>Discount</span>
                  <b>-₹{discount}</b>
                </div>
              ) : null}

              <div className={styles.hr} />

              <div className={styles.totalLine}>
                <span>Total</span>
                <b className={styles.totalMoney}>₹{grandTotal}</b>
              </div>
            </div>

            {/* payment method (keep) */}
            <div className={styles.payBox}>
              <label className={styles.radio}>
                <input type="radio" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                <span>Cash on Delivery</span>
              </label>

              <label className={styles.radio}>
                <input type="radio" checked={payment === "upi"} onChange={() => setPayment("upi")} />
                <span>UPI</span>
              </label>
            </div>

            <button className={styles.continueBtn} onClick={placeOrder}>
              Continue
            </button>
          </aside>
        </div>
      </div>
    </div>
    </>
  );
}
