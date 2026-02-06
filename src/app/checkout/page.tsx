"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../css/checkout.module.css";
import { CartItem, cartTotal, getCart, updateQty } from "@/lib/cart";
import Navbar from "../component/navbar";

const safeImg = (src?: string) => (src && src.startsWith("/") ? src : "/placeholder.png");

type OrderStatus = "placed" | "processing" | "shipped" | "out_for_delivery" | "delivered";

// ✅ Mongo ObjectId (24 hex chars)
const isObjectId = (v: any) => typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v);

// ✅ Always get a valid product id from cart item
const getPid = (it: any) => String(it?.productId || it?._id || it?.id || "");

// ✅ Cart key (your lib/cart.ts uses cart_v1)
const CART_KEY = "cart_v1";

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<"cod" | "upi">("cod");
  const router = useRouter();

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
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);

  // ✅ userId from storage
  const getUserIdFromStorage = () => {
    try {
      const raw =
        localStorage.getItem("user") ||
        localStorage.getItem("currentUser") ||
        localStorage.getItem("admin");

      if (!raw) return null;
      const u = JSON.parse(raw);
      return u?._id || u?.id || u?.userId || u?.uid || null;
    } catch {
      return null;
    }
  };

  // ✅ Load cart + auto-clean broken items
  useEffect(() => {
    const c = getCart();

    // remove items without valid ObjectId
    const cleaned = (c as any[]).filter((it) => isObjectId(getPid(it)));

    if (cleaned.length !== c.length) {
      localStorage.setItem(CART_KEY, JSON.stringify(cleaned));
      console.warn("Removed broken cart items (missing/invalid productId).");
    }

    setCart(cleaned as any);
  }, []);

  const subtotal = useMemo(() => cartTotal(cart), [cart]);

  const shippingFee = useMemo(() => {
    if (!cart.length) return 0;
    if (shipMethod === "free") return 0;
    if (shipMethod === "regular") return 90;
    return 320;
  }, [cart.length, shipMethod]);

  const grandTotal = Math.max(0, subtotal + shippingFee - discount);

  const changeQty = (pid: string, qty: number) => {
    const safeQty = Math.max(1, qty);
    const next = updateQty(pid, safeQty);
    setCart(next);
  };

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;

    if (code === "SAVE50") setDiscount(50);
    else if (code === "SAVE100") setDiscount(100);
    else {
      setDiscount(0);
      alert("Invalid coupon");
      return;
    }

    alert("Coupon applied ✅");
  };

  const validateShipping = () => {
    if (
      !ship.email ||
      !ship.phone ||
      !ship.firstName ||
      !ship.lastName ||
      !ship.city ||
      !ship.district ||
      !ship.address ||
      !ship.pincode
    ) {
      alert("Please fill shipping details");
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!cart.length) return alert("Cart is empty");
    if (!validateShipping()) return;

    const userId = getUserIdFromStorage();
    if (!userId) {
      alert("Please login first");
      router.push("/login");
      return;
    }

    // ✅ Ensure all items have valid ObjectId
    const invalid = (cart as any[]).find((it) => !isObjectId(getPid(it)));
    if (invalid) {
      alert("Some cart items are broken. Cart was cleaned. Please add products again.");
      // auto clean now
      const cleaned = (cart as any[]).filter((it) => isObjectId(getPid(it)));
      localStorage.setItem(CART_KEY, JSON.stringify(cleaned));
      setCart(cleaned as any);
      return;
    }

    const orderId = `ORD${Date.now().toString().slice(-6)}`;

    const payload = {
      orderId,
      userId,
      status: "processing" as OrderStatus,
      paymentMethod: payment,
      shippingMethod: shipMethod,
      shipping: ship,
      items: (cart as any[]).map((it) => ({
        productId: getPid(it), // ✅ 24-char ObjectId guaranteed
        qty: Number(it.qty || 1),
        price: Number(it.price || 0),
        image: it.image || "/placeholder.png",
        title: it.title || "Product",
      })),
      subtotal: Number(subtotal || 0),
      shippingFee: Number(shippingFee || 0),
      discount: Number(discount || 0),
      totalAmount: Number(grandTotal || 0),
    };

    try {
      setPlacing(true);

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        console.error("Order API error:", res.status, data);
        setPlacing(false);
        alert(data?.message || `Order failed (${res.status})`);
        return;
      }

      // ✅ save tracking (optional)
      localStorage.setItem("last_order", JSON.stringify(data?.order || payload));
      localStorage.setItem(`order_${orderId}`, JSON.stringify(data?.order || payload));

      // ✅ clear cart ONLY after success
      localStorage.removeItem(CART_KEY);
      localStorage.setItem("orders_updated", String(Date.now()));

      setPlacing(false);
      router.push(`/track?orderId=${orderId}`);
    } catch (err: any) {
      console.error("placeOrder error:", err);
      setPlacing(false);
      alert(err?.message || "Server error, try again");
    }
  };

  return (
    <>
      <Navbar />

      <div className={styles.page}>
        <div className={styles.container}>
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
                      disabled={placing}
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
                      disabled={placing}
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
                      disabled={placing}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Last Name</label>
                    <input
                      className={styles.input}
                      placeholder="Enter last name"
                      value={ship.lastName}
                      onChange={(e) => setShip({ ...ship, lastName: e.target.value })}
                      disabled={placing}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>City</label>
                    <input
                      className={styles.input}
                      placeholder="Select City"
                      value={ship.city}
                      onChange={(e) => setShip({ ...ship, city: e.target.value })}
                      disabled={placing}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>District</label>
                    <input
                      className={styles.input}
                      placeholder="Select District"
                      value={ship.district}
                      onChange={(e) => setShip({ ...ship, district: e.target.value })}
                      disabled={placing}
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
                    disabled={placing}
                  />
                </div>

                <div className={styles.field} style={{ marginTop: 10 }}>
                  <label className={styles.label}>Pincode</label>
                  <input
                    className={styles.input}
                    placeholder="Enter pincode"
                    value={ship.pincode}
                    onChange={(e) => setShip({ ...ship, pincode: e.target.value })}
                    disabled={placing}
                  />
                </div>
              </div>

              <div className={styles.section}>
                <p className={styles.sectionTitle}>Shipping Method</p>

                <button
                  type="button"
                  className={`${styles.shipOption} ${shipMethod === "free" ? styles.shipActive : ""}`}
                  onClick={() => setShipMethod("free")}
                  disabled={placing}
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
                  disabled={placing}
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
                  disabled={placing}
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

            {/* RIGHT */}
            <aside className={styles.rightCard}>
              <h2 className={styles.h2}>Order Summary</h2>

              <div className={styles.summaryItems}>
                {cart.length === 0 ? (
                  <div className={styles.empty}>Cart is empty</div>
                ) : (
                  (cart as any[]).map((it) => {
                    const pid = getPid(it);
                    return (
                      <div key={pid} className={styles.sumRow}>
                        <div className={styles.sumThumb}>
                          <Image src={safeImg(it.image)} alt={it.title} fill className={styles.sumImg} />
                        </div>

                        <div className={styles.sumMeta}>
                          <div className={styles.sumName}>{it.title}</div>
                          <div className={styles.sumSub}>Qty: {it.qty}</div>
                          <div className={styles.sumPrice}>₹{it.price}</div>
                        </div>

                        <div className={styles.qty}>
                          <button
                            className={styles.qtyBtn}
                            onClick={() => changeQty(pid, (it.qty || 1) - 1)}
                            disabled={placing}
                          >
                            −
                          </button>
                          <span className={styles.qtyNum}>{it.qty}</span>
                          <button
                            className={styles.qtyBtn}
                            onClick={() => changeQty(pid, (it.qty || 1) + 1)}
                            disabled={placing}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })
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
                    disabled={placing}
                  />
                  <button className={styles.applyBtn} onClick={applyCoupon} type="button" disabled={placing}>
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

              <div className={styles.payBox}>
                <label className={styles.radio}>
                  <input type="radio" checked={payment === "cod"} onChange={() => setPayment("cod")} disabled={placing} />
                  <span>Cash on Delivery</span>
                </label>

                <label className={styles.radio}>
                  <input type="radio" checked={payment === "upi"} onChange={() => setPayment("upi")} disabled={placing} />
                  <span>UPI</span>
                </label>
              </div>

              <button className={styles.continueBtn} onClick={placeOrder} disabled={placing || cart.length === 0}>
                {placing ? "Placing Order..." : "Continue"}
              </button>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
