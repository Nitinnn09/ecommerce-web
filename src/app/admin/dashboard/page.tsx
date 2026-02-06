"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "../../css/dash.module.css";
import Navbar from "../../component/navbar";
import NextNav from "../../component/nextnav";

type UserType = {
  _id?: string;
  id?: string | number;
  name?: string;
  email?: string;
  status?: string;
};

type OrderItemType = {
  product?: { title?: string; name?: string };
  title?: string;
  name?: string;
};

type OrderType = {
  _id?: string;
  id?: string;
  orderId?: string;
  customer?: string;
  user?: { name?: string; email?: string };
  products?: string;
  items?: OrderItemType[];
  totalAmount?: number | string;
  amount?: string;
  status?: string;
  createdAt?: string;
};

type ProductType = {
  _id?: string;
  id?: string | number;
  title?: string;
  name?: string;
  price?: number | string;
  stock?: number;
  category?: string;
};

const formatINR = (n: number) => "₹" + (Number(n || 0)).toLocaleString("en-IN");
const parseINR = (val?: string) => {
  if (!val) return 0;
  const onlyNum = String(val).replace(/[^\d.]/g, "");
  const n = Number(onlyNum);
  return Number.isFinite(n) ? n : 0;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>("Total Users");

  const [Users, setUsers] = useState<UserType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);

  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return [];
    }
  };

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [uRes, oRes, pRes] = await Promise.allSettled([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);

      const uData = uRes.status === "fulfilled" ? await safeJson(uRes.value) : [];
      const oData = oRes.status === "fulfilled" ? await safeJson(oRes.value) : [];
      const pData = pRes.status === "fulfilled" ? await safeJson(pRes.value) : [];

      setUsers(Array.isArray(uData) ? uData : []);
      setOrders(Array.isArray(oData) ? oData : []);
      setProducts(Array.isArray(pData) ? pData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();

    // ✅ other tabs refresh
    const onStorage = (e: StorageEvent) => {
      if (e.key === "orders_updated") fetchAll();
    };
    window.addEventListener("storage", onStorage);

    // ✅ same tab refresh
    let last = localStorage.getItem("orders_updated") || "";
    const interval = setInterval(() => {
      const now = localStorage.getItem("orders_updated") || "";
      if (now && now !== last) {
        last = now;
        fetchAll();
      }
    }, 1500);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  // ✅ Total Revenue
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => {
      if (typeof o.totalAmount === "number") return sum + o.totalAmount;
      if (typeof o.totalAmount === "string" && o.totalAmount.trim() !== "") return sum + Number(o.totalAmount || 0);
      if (o.amount) return sum + parseINR(o.amount);
      return sum;
    }, 0);
  }, [orders]);

  const stats = useMemo(
    () => [
      { title: "Total Users", value: Users.length, bgColor: "#fff", color: "#406af3" },
      { title: "Total Orders", value: orders.length, bgColor: "#fff", color: "#ff9900" },
      { title: "Products", value: products.length, bgColor: "#fff", color: "#8f00b3" },
      { title: "Revenue", value: formatINR(totalRevenue), bgColor: "#fff", color: "#24782a" },
    ],
    [Users.length, orders.length, products.length, totalRevenue]
  );

  const getOrderId = (o: OrderType) => String(o.orderId || o.id || o._id || "");
  const getCustomer = (o: OrderType) => o.customer || o.user?.name || o.user?.email || "Unknown";

  const getProductsText = (o: OrderType) => {
    if (o.products) return o.products;
    const titles =
      o.items?.map((it) => it?.product?.title || it?.product?.name || it?.title || it?.name).filter(Boolean) || [];
    return titles.length ? titles.join(", ") : "-";
  };

  const getOrderAmountText = (o: OrderType) => {
    if (typeof o.totalAmount === "number") return formatINR(o.totalAmount);
    if (typeof o.totalAmount === "string" && o.totalAmount.trim() !== "") return formatINR(Number(o.totalAmount || 0));
    if (o.amount) return o.amount;
    return formatINR(0);
  };

  const badgeStyle = (status?: string) => {
    const st = String(status || "").toLowerCase();
    const delivered = st === "delivered";
    const processing = st === "processing";
    return {
      padding: "5px 10px",
      borderRadius: "5px",
      backgroundColor: delivered ? "#d1fae5" : processing ? "#fed7aa" : "#fef3c7",
      color: delivered ? "#065f46" : processing ? "#9a3412" : "#854d0e",
    } as React.CSSProperties;
  };

  return (
    <>
      <Navbar />
      <NextNav />

      <div className={styles.container}>
        <h1 className={styles.heading}>Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className={styles.grid}>
          {stats.map((item, index) => (
            <div
              key={index}
              className={styles.card}
              style={{
                backgroundColor: item.bgColor,
                cursor: "pointer",
                border: activeTab === item.title ? `3px solid ${item.color}` : "1px solid #e5e7eb",
                transform: activeTab === item.title ? "scale(1.05)" : "scale(1)",
              }}
              onClick={() => setActiveTab(item.title)}
            >
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardValue} style={{ color: item.color }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {loading ? <p style={{ padding: 10, color: "#6b7280" }}>Loading...</p> : null}

        {/* ✅ Users List */}
        {activeTab === "Total Users" && (
          <div className={styles.section}>
            <h2 style={{ color: "#406af3", marginBottom: "15px" }}>Users List</h2>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {Users.map((user) => (
                    <tr key={(user._id || user.id || user.email || Math.random()) as any}>
                      <td>{user._id || user.id || "-"}</td>
                      <td>{user.name || "-"}</td>
                      <td>{user.email || "-"}</td>
                      <td>
                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: "5px",
                            backgroundColor: user.status === "Active" ? "#d1fae5" : "#fed7d7",
                            color: user.status === "Active" ? "#065f46" : "#991b1b",
                          }}
                        >
                          {user.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {Users.length === 0 && <p style={{ padding: 12, color: "#6b7280" }}>No users found.</p>}
            </div>
          </div>
        )}

        {/* ✅ Orders List (Same like Users) */}
        {activeTab === "Total Orders" && (
          <div className={styles.section}>
            <h2 style={{ color: "#ff9900", marginBottom: "15px" }}>Orders List</h2>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product Name</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={getOrderId(order) || (order._id as any) || Math.random()}>
                      <td>{getOrderId(order) || "-"}</td>
                      <td>{getCustomer(order)}</td>
                      <td>{getProductsText(order)}</td>
                      <td>{getOrderAmountText(order)}</td>
                      <td>
                        <span style={badgeStyle(order.status)}>{order.status || "pending"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length === 0 && <p style={{ padding: 12, color: "#6b7280" }}>No orders found.</p>}
            </div>
          </div>
        )}

        {/* ✅ Revenue tab (show Total Revenue properly) */}
        {activeTab === "Revenue" && (
          <div className={styles.section}>
            <h2 style={{ color: "#24782a", marginBottom: "15px" }}>Revenue Summary</h2>

            <div className={styles.revenueList}>
              <div className={styles.revenueItem}>
                <span>Total Users:</span>
                <strong style={{ color: "#24782a" }}>{Users.length}</strong>
              </div>

              <div className={styles.revenueItem}>
                <span>Total Orders:</span>
                <strong style={{ color: "#24782a" }}>{orders.length}</strong>
              </div>

              <div className={styles.revenueItem}>
                <span>Total Products:</span>
                <strong style={{ color: "#24782a" }}>{products.length}</strong>
              </div>

              <div className={styles.revenueItem}>
                <span>Total Revenue:</span>
                <strong style={{ color: "#24782a" }}>{formatINR(totalRevenue)}</strong>
              </div>

              <button
                onClick={fetchAll}
                style={{
                  marginTop: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
