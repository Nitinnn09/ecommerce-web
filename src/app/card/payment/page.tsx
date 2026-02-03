"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../../css/payment.module.css";
import Navbar from "@/app/component/navbar";

interface CartItem {
  title?: string;
  name?: string;
  price?: string;
  discountedPrice?: string;
  image?: string;
  quantity?: number;
}

export default function PaymentPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
  });
  const router = useRouter();

  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      const items = JSON.parse(cartData);
      setCartItems(items);
    }
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(
        item.discountedPrice || item.price || "0"
      );
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  };

  const total = calculateTotal();
  const shipping = total > 500 ? 0 : 50;
  const tax = total * 0.05;
  const finalTotal = total + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      alert("Please fill all required fields");
      return;
    }

    if (paymentMethod === "card") {
      if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
        alert("Please fill all card details");
        return;
      }
    } else if (paymentMethod === "upi") {
      if (!formData.upiId) {
        alert("Please enter UPI ID");
        return;
      }
    }

    // Simulate payment processing
    alert("Payment Successful! Order placed.");
    localStorage.removeItem("cart");
    router.push("/homepage");
  };

  return (
    <>
    <Navbar/>
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Left Section - Payment Form */}
        <div className={styles.leftSection}>
          <h1 className={styles.heading}>Payment Details</h1>

          {/* Shipping Information */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Shipping Information</h2>
            <form className={styles.form}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit number"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House no, Street name"
                  rows={3}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="6-digit pincode"
                    required
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Payment Method Selection */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Payment Method</h2>
            <div className={styles.paymentMethods}>
              <button
                className={`${styles.methodBtn} ${paymentMethod === "card" ? styles.activeMethod : ""}`}
                onClick={() => setPaymentMethod("card")}
              >
                💳 Credit/Debit Card
              </button>
              <button
                className={`${styles.methodBtn} ${paymentMethod === "upi" ? styles.activeMethod : ""}`}
                onClick={() => setPaymentMethod("upi")}
              >
                📱 UPI
              </button>
              <button
                className={`${styles.methodBtn} ${paymentMethod === "cod" ? styles.activeMethod : ""}`}
                onClick={() => setPaymentMethod("cod")}
              >
                💵 Cash on Delivery
              </button>
            </div>

            {/* Card Payment Form */}
            {paymentMethod === "card" && (
              <div className={styles.paymentForm}>
                <div className={styles.formGroup}>
                  <label>Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Card Holder Name *</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="Name on card"
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Expiry Date *</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI Payment Form */}
            {paymentMethod === "upi" && (
              <div className={styles.paymentForm}>
                <div className={styles.formGroup}>
                  <label>UPI ID *</label>
                  <input
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    placeholder="yourname@upi"
                  />
                </div>
                <p className={styles.upiNote}>
                  📱 You will receive a payment request on your UPI app
                </p>
              </div>
            )}

            {/* COD Info */}
            {paymentMethod === "cod" && (
              <div className={styles.codInfo}>
                <p>💵 Pay cash when your order is delivered</p>
                <p className={styles.codNote}>
                  Note: COD charges may apply on some orders
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Order Summary */}
        <div className={styles.rightSection}>
          <div className={styles.orderSummary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            {/* Cart Items */}
            <div className={styles.cartItems}>
              {cartItems.length === 0 ? (
                <p className={styles.emptyCart}>No items in cart</p>
              ) : (
                cartItems.map((item, index) => (
                  <div key={index} className={styles.cartItem}>
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.title || item.name}
                      className={styles.itemImage}
                    />
                    <div className={styles.itemDetails}>
                      <p className={styles.itemName}>
                        {item.title || item.name}
                      </p>
                      <p className={styles.itemPrice}>
                        ₹{item.discountedPrice || item.price} × {item.quantity || 1}
                      </p>
                    </div>
                    <p className={styles.itemTotal}>
                      ₹
                      {
                        parseFloat(item.discountedPrice || item.price || "0") *
                        (item.quantity || 1)
                      }
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Price Breakdown */}
            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Shipping</span>
                <span className={shipping === 0 ? styles.free : ""}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
              <div className={styles.priceRow}>
                <span>Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Button */}
            <button className={styles.payBtn} onClick={handlePayment}>
              {paymentMethod === "cod" ? "Place Order" : "Pay Now"} - ₹
              {finalTotal.toFixed(2)}
            </button>

            <p className={styles.secureNote}>🔒 Secure Payment</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
