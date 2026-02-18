"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "../component/navbar";
import styles from "../css/userorders.module.css";

type Order = {
  id: string;
  orderId: string;
  status: string;
  totalAmount: number;
  createdAt: string | null;
  shipping: any;
};

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState<"all" | "delivered" | "cancelled">("all");

  const load = async () => {
    try {
      setLoading(true);
      setMsg("");
      const res = await fetch("/api/orders/my", { cache: "no-store" });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        setOrders([]);
        setMsg(data?.message || "Please login to view your orders.");
        return;
      }
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (e: any) {
      setOrders([]);
      setMsg(e?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const badgeClass = (st?: string) => {
    const s = String(st || "").toLowerCase();
    if (s === "delivered") return styles.badgeDelivered;
    if (s === "shipped") return styles.badgeShipped;
    if (s === "cancelled") return styles.badgeCancelled;
    return styles.badgeProcessing;
  };

  const canCancel = (st?: string) => {
    const s = String(st || "").toLowerCase();
    return s !== "cancelled" && s !== "shipped" && s !== "delivered";
  };

  const cancelOrder = async (id: string) => {
    const ok = confirm("Cancel this order?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
      const data = await res.json().catch(() => ({} as any));
      alert(data?.message || (res.ok ? "Cancelled" : "Failed"));
      if (res.ok) load();
    } catch (e: any) {
      alert(e?.message || "Failed");
    }
  };

  const totalOrders = useMemo(() => orders.length, [orders.length]);
  const deliveredCount = useMemo(
    () => orders.filter((o) => String(o.status || "").toLowerCase() === "delivered").length,
    [orders]
  );
  const cancelledCount = useMemo(
    () => orders.filter((o) => String(o.status || "").toLowerCase() === "cancelled").length,
    [orders]
  );

  const visibleOrders = useMemo(() => {
    if (filter === "delivered") return orders.filter((o) => String(o.status || "").toLowerCase() === "delivered");
    if (filter === "cancelled") return orders.filter((o) => String(o.status || "").toLowerCase() === "cancelled");
    return orders;
  }, [filter, orders]);

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>My Orders</h1>
              <p className={styles.sub}>Track, cancel and view delivery status</p>
            </div>
            <div className={styles.count}>
              Total: {totalOrders} • Delivered: {deliveredCount} • Cancelled: {cancelledCount}
            </div>
          </div>

          {loading ? <div className={styles.msg}>Loading...</div> : null}
          {!loading && msg ? <div className={styles.msg}>{msg}</div> : null}

          {!loading && !msg ? (
            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${filter === "all" ? styles.filterActive : ""}`}
                onClick={() => setFilter("all")}
                type="button"
              >
                All
              </button>
              <button
                className={`${styles.filterBtn} ${filter === "delivered" ? styles.filterActive : ""}`}
                onClick={() => setFilter("delivered")}
                type="button"
              >
                Delivered
              </button>
              <button
                className={`${styles.filterBtn} ${filter === "cancelled" ? styles.filterActive : ""}`}
                onClick={() => setFilter("cancelled")}
                type="button"
              >
                Cancelled
              </button>
            </div>
          ) : null}

          <div className={styles.list}>
            {visibleOrders.map((o) => {
              const ship = o.shipping || {};
              const addr = ship?.address ? `${ship.address}, ${ship.city || ""} - ${ship.pincode || ""}`.trim() : "-";

              return (
                <div key={o.id} className={styles.card}>
                  <div className={styles.rowTop}>
                    <div>
                      <div className={styles.orderId}>Order: {o.orderId}</div>
                      <div className={styles.date}>
                        {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                    <span className={`${styles.badge} ${badgeClass(o.status)}`}>{o.status}</span>
                  </div>

                  <div className={styles.meta}>
                    <div className={styles.metaItem}>
                      <div className={styles.metaLabel}>Delivery</div>
                      <div className={styles.metaValue}>{addr}</div>
                    </div>
                    <div className={styles.metaItem}>
                      <div className={styles.metaLabel}>Total</div>
                      <div className={styles.metaValue}>₹{Number(o.totalAmount || 0).toLocaleString("en-IN")}</div>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <Link className={styles.btn} href={`/track?orderId=${encodeURIComponent(o.orderId)}`}>
                      Track
                    </Link>
                    {canCancel(o.status) ? (
                      <button className={`${styles.btn} ${styles.danger}`} onClick={() => cancelOrder(o.id)}>
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {!loading && !msg && visibleOrders.length === 0 ? <div className={styles.msg}>No orders found.</div> : null}
          </div>
        </div>
      </div>
    </>
  );
}
