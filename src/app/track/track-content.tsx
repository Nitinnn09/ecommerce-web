"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../component/navbar";
import styles from "../css/track.module.css";

type OrderStatus = "placed" | "processing" | "shipped" | "out_for_delivery" | "delivered";

type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  shipping: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  total?: number;
};

const steps: { key: OrderStatus; label: string }[] = [
  { key: "placed", label: "Order Placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const stepIndex = (s: OrderStatus) => steps.findIndex((x) => x.key === s);

export default function TrackContent() {
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId") || "";

  const [orderId, setOrderId] = useState(orderIdFromUrl);
  const [order, setOrder] = useState<Order | null>(null);
  const [msg, setMsg] = useState("");

  const activeIdx = useMemo(() => (order ? stepIndex(order.status) : -1), [order]);

  useEffect(() => {
    // auto-fill if coming from checkout
    const last = localStorage.getItem("last_order");
    if (last && !orderIdFromUrl) {
      const parsed: Order = JSON.parse(last);
      setOrderId(parsed.id);
      setOrder(parsed);
    }
  }, [orderIdFromUrl]);

  useEffect(() => {
    if (!orderIdFromUrl) return;
    const saved = localStorage.getItem(`order_${orderIdFromUrl}`);
    if (saved) setOrder(JSON.parse(saved));
  }, [orderIdFromUrl]);

  const handleTrack = () => {
    setMsg("");
    const id = orderId.trim();
    if (!id) return setMsg("Please enter Order ID.");

    const saved = localStorage.getItem(`order_${id}`);
    if (!saved) {
      setOrder(null);
      return setMsg("Order not found.");
    }
    setOrder(JSON.parse(saved));
  };

  return (
    <>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Track Your Order</h1>
          <p>Enter your Order ID to check delivery status</p>
        </div>

        <div className={styles.trackBox}>
          <input
            type="text"
            placeholder="Enter Order ID (eg. ORD12345)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button onClick={handleTrack}>Track Order</button>
        </div>

        {msg ? <p className={styles.msg}>{msg}</p> : null}

        <div className={styles.statusBox}>
          <h2>Order Status</h2>

          <div className={styles.timeline}>
            {steps.map((s, i) => {
              const done = i <= activeIdx && activeIdx !== -1;
              return (
                <div key={s.key} className={`${styles.step} ${done ? styles.active : ""}`}>
                  <span>{done ? "✔" : i + 1}</span>
                  <p>{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.details}>
          <h3>Order Details</h3>

          {!order ? (
            <p style={{ margin: 0, color: "#64748b" }}>Enter an Order ID to view details.</p>
          ) : (
            <>
              <p><b>Order ID:</b> {order.id}</p>
              <p>
                <b>Delivery Address:</b>{" "}
                {order.shipping.address}, {order.shipping.city} - {order.shipping.pincode}
              </p>
              <p><b>Phone:</b> {order.shipping.phone}</p>
              <p><b>Status:</b> {order.status}</p>
              {typeof order.total === "number" ? <p><b>Total:</b> ₹{order.total}</p> : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}