"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../component/navbar";
import styles from "../css/track.module.css";

type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

type Order = {
  id: string; // Mongo _id
  orderId: string; // display id
  createdAt: string | null;
  status: OrderStatus;
  shipping: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    district?: string;
    address?: string;
    pincode?: string;
  } | null;
  totalAmount?: number;
  items?: { title?: string; qty?: number; price?: number; image?: string }[];
};

type RecentOrder = {
  id: string;
  orderId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string | null;
};

type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;

const normalizeStatus = (v: unknown): OrderStatus => {
  const s = String(v || "").toLowerCase();
  if (s === "shipped") return "shipped";
  if (s === "delivered") return "delivered";
  if (s === "cancelled") return "cancelled";
  return "processing";
};

const normalizeOrder = (raw: unknown): Order | null => {
  if (!isRecord(raw)) return null;

  const orderId = String(raw.orderId || "").trim();
  if (!orderId) return null;

  const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
  const shippingRaw = raw.shipping;
  const shipping = isRecord(shippingRaw)
    ? {
        email: shippingRaw.email ? String(shippingRaw.email) : undefined,
        phone: shippingRaw.phone ? String(shippingRaw.phone) : undefined,
        firstName: shippingRaw.firstName ? String(shippingRaw.firstName) : undefined,
        lastName: shippingRaw.lastName ? String(shippingRaw.lastName) : undefined,
        city: shippingRaw.city ? String(shippingRaw.city) : undefined,
        district: shippingRaw.district ? String(shippingRaw.district) : undefined,
        address: shippingRaw.address ? String(shippingRaw.address) : undefined,
        pincode: shippingRaw.pincode ? String(shippingRaw.pincode) : undefined,
      }
    : null;

  return {
    id: String((raw.id as unknown) || (raw._id as unknown) || ""),
    orderId,
    createdAt: raw.createdAt ? String(raw.createdAt) : null,
    status: normalizeStatus(raw.status),
    shipping,
    totalAmount: typeof raw.totalAmount === "number" ? raw.totalAmount : Number(raw.totalAmount || 0),
    items: itemsRaw.map((it: unknown) => {
      if (!isRecord(it)) return { title: "", qty: 1, price: 0, image: "" };
      return {
        title: it.title ? String(it.title) : "",
        qty: Number(it.qty || 1),
        price: Number(it.price || 0),
        image: it.image ? String(it.image) : "",
      };
    }),
  };
};

const normalizeRecentOrder = (raw: unknown): RecentOrder | null => {
  if (!isRecord(raw)) return null;
  const orderId = String(raw.orderId || "").trim();
  if (!orderId) return null;
  const id = String(raw.id || raw._id || "").trim();
  if (!id) return null;
  return {
    id,
    orderId,
    status: normalizeStatus(raw.status),
    totalAmount: Number(raw.totalAmount || 0),
    createdAt: raw.createdAt ? String(raw.createdAt) : null,
  };
};

const steps: { key: OrderStatus; label: string }[] = [
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const stepIndex = (s: OrderStatus) => steps.findIndex((x) => x.key === s);

export default function TrackOrder() {
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId") || "";

  const [orderId, setOrderId] = useState(orderIdFromUrl);
  const [order, setOrder] = useState<Order | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const activeIdx = useMemo(() => (order ? stepIndex(order.status) : -1), [order]);

  useEffect(() => {
    // show recent orders for the logged-in user
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/orders/my", { cache: "no-store" });
        const data: unknown = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (!cancelled) setRecentOrders([]);
          return;
        }

        const list = isRecord(data) && Array.isArray(data.orders) ? (data.orders as unknown[]) : [];
        const normalized = list.map(normalizeRecentOrder).filter(Boolean) as RecentOrder[];
        if (!cancelled) setRecentOrders(normalized.slice(0, 8));
      } catch {
        if (!cancelled) setRecentOrders([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadOrder = async (id: string) => {
    setMsg("");
    const oid = id.trim();
    if (!oid) return setMsg("Please enter Order ID.");

    try {
      setLoading(true);
      const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(oid)}`, { cache: "no-store" });
      const data: unknown = await res.json().catch(() => ({}));
      const message = isRecord(data) ? String(data.message || "") : "";

      if (!res.ok) {
        setOrder(null);
        if (res.status === 401) setMsg("Please login to track your orders.");
        else setMsg(message || "Order not found.");
        return;
      }

      const normalized = normalizeOrder(isRecord(data) ? data.order : null);
      setOrder(normalized);
    } catch (e: unknown) {
      setOrder(null);
      const errMsg = e instanceof Error ? e.message : "";
      setMsg(errMsg || "Failed to track order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderIdFromUrl) return;
    loadOrder(orderIdFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdFromUrl]);

  const canCancel = useMemo(() => {
    const st = String(order?.status || "").toLowerCase();
    return Boolean(order && order.id && st !== "cancelled" && st !== "shipped" && st !== "delivered");
  }, [order]);

  const cancelOrder = async () => {
    if (!order) return;
    if (!order.id) return alert("This order can't be cancelled from this device-only record. Please try again later.");
    const ok = confirm("Cancel this order?");
    if (!ok) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
      const data: unknown = await res.json().catch(() => ({}));
      const message = isRecord(data) ? String(data.message || "") : "";
      alert(message || (res.ok ? "Cancelled" : "Failed"));
      if (res.ok) await loadOrder(order.orderId);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "";
      alert(errMsg || "Failed");
    } finally {
      setLoading(false);
    }
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
          <button onClick={() => loadOrder(orderId)} disabled={loading}>
            {loading ? "Please wait..." : "Track Order"}
          </button>
        </div>

        {msg ? <p className={styles.msg}>{msg}</p> : null}

        {recentOrders.length ? (
          <div className={styles.recent}>
            <div className={styles.recentHead}>
              <h2 className={styles.recentTitle}>Recent Orders</h2>
              <p className={styles.recentSub}>Tap an order to view details</p>
            </div>

            <div className={styles.recentGrid}>
              {recentOrders.map((o) => {
                return (
                  <button
                    key={o.orderId}
                    type="button"
                    className={styles.recentCard}
                    onClick={() => {
                      setOrderId(o.orderId);
                      loadOrder(o.orderId);
                    }}
                    disabled={loading}
                    title={`Track ${o.orderId}`}
                  >
                    <div className={styles.recentRow}>
                      <div className={styles.recentId}>{o.orderId}</div>
                      <span className={styles.recentBadge}>{o.status}</span>
                    </div>
                    <div className={styles.recentMeta}>
                      <span>{o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</span>
                      {typeof o.totalAmount === "number" ? (
                        <span>â‚¹{Number(o.totalAmount || 0).toLocaleString("en-IN")}</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className={styles.statusBox}>
          <h2>Order Status</h2>

          <div className={styles.timeline}>
            {steps.map((s, i) => {
              const done = i <= activeIdx && activeIdx !== -1 && order?.status !== "cancelled";
              const cancelled = order?.status === "cancelled" && s.key === "cancelled";
              return (
                <div key={s.key} className={`${styles.step} ${done || cancelled ? styles.active : ""}`}>
                  <span>{done || cancelled ? "✔" : i + 1}</span>
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
              {Array.isArray(order.items) && order.items.length ? (
                <div style={{ marginTop: 0 }}>
                  <h3 style={{ margin: 0 }}>Products</h3>
                  <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                    {order.items.map((it, idx) => (
                      <div
                        key={`${it?.title || "item"}-${idx}`}
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                          padding: 10,
                          borderRadius: 12,
                          border: "1px solid #e2e8f0",
                          background: "#fff",
                        }}
                      >
                        <img
                          src={it?.image || "/placeholder.png"}
                          alt={it?.title || "Product"}
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: 12,
                            objectFit: "cover",
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 900, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {it?.title || "Product"}
                          </div>
                          <div style={{ color: "#64748b", fontWeight: 800, fontSize: 12 }}>
                            Qty: {Number(it?.qty || 1)} • ₹{Number(it?.price || 0)}
                          </div>
                        </div>
                        <div style={{ fontWeight: 1000, color: "#0f172a" }}>
                          ₹{Number((it?.qty || 1) * (it?.price || 0)).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <p>
                <b>Order ID:</b> {order.orderId}
              </p>
              <p>
                <b>Delivery Address:</b>{" "}
                {order.shipping?.address}, {order.shipping?.city} - {order.shipping?.pincode}
              </p>
              <p>
                <b>Phone:</b> {order.shipping?.phone}
              </p>
              <p>
                <b>Status:</b> {order.status}
              </p>
              {typeof order.totalAmount === "number" ? (
                <p>
                  <b>Total:</b> ₹{order.totalAmount}
                </p>
              ) : null}

              {canCancel ? (
                <button
                  onClick={cancelOrder}
                  style={{
                    marginTop: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #fecaca",
                    background: "#fee2e2",
                    cursor: "pointer",
                    fontWeight: 900,
                    color: "#991b1b",
                  }}
                  disabled={loading}
                >
                  Cancel Order
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}
