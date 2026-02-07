"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "../../css/dash.module.css";
import AdminNavbar from "@/app/component/adminnav";
import { color } from "framer-motion";

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
  qty?: number; // ✅ optional (if you have qty)
  quantity?: number; // ✅ optional
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

// ✅ date -> YYYY-MM-DD (local)
const toYMD = (d?: string) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// ✅ units sold (items qty -> fallback 1 per item)
const getOrderUnits = (o: OrderType) => {
  if (!Array.isArray(o.items) || o.items.length === 0) return 0;
  return o.items.reduce((sum, it) => {
    const q = Number(it?.qty ?? it?.quantity ?? 1);
    return sum + (Number.isFinite(q) && q > 0 ? q : 1);
  }, 0);
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>("Total Users");

  const [Users, setUsers] = useState<UserType[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // ✅ Date report state
  const [selectedDate, setSelectedDate] = useState<string>(toYMD(new Date().toISOString()));

  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  // ✅ handle APIs returning array OR {orders:[]} OR {data:[]}
  const pickArray = (data: any) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.orders)) return data.orders;
    if (data && Array.isArray(data.products)) return data.products;
    if (data && Array.isArray(data.users)) return data.users;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [uRes, oRes, pRes] = await Promise.allSettled([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/products", { cache: "no-store" }),
      ]);

      if (uRes.status === "fulfilled") {
        const uJson = await safeJson(uRes.value);
        setUsers(pickArray(uJson));
      } else setUsers([]);

      if (oRes.status === "fulfilled") {
        const oJson = await safeJson(oRes.value);
        setOrders(pickArray(oJson));
      } else setOrders([]);

      if (pRes.status === "fulfilled") {
        const pJson = await safeJson(pRes.value);
        setProducts(pickArray(pJson));
      } else setProducts([]);
    } catch (e: any) {
      setErrorMsg(e?.message || "Something went wrong");
      setUsers([]);
      setOrders([]);
      setProducts([]);
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

  // ✅ Date-wise aggregation
  const dailyData = useMemo(() => {
    const map = new Map<string, { date: string; ordersCount: number; unitsSold: number; revenue: number }>();

    for (const o of orders) {
      const date = toYMD(o.createdAt);
      if (!date) continue;

      const prev = map.get(date) || { date, ordersCount: 0, unitsSold: 0, revenue: 0 };
      prev.ordersCount += 1;
      prev.unitsSold += getOrderUnits(o);

      if (typeof o.totalAmount === "number") prev.revenue += o.totalAmount;
      else if (typeof o.totalAmount === "string" && o.totalAmount.trim() !== "") prev.revenue += Number(o.totalAmount || 0);
      else if (o.amount) prev.revenue += parseINR(o.amount);

      map.set(date, prev);
    }

    return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [orders]);

  const selectedDay = useMemo(() => {
    return (
      dailyData.find((d) => d.date === selectedDate) || {
        date: selectedDate,
        ordersCount: 0,
        unitsSold: 0,
        revenue: 0,
      }
    );
  }, [dailyData, selectedDate]);

  const stats = useMemo(
    () => [
      { title: "Total Users", value: Users.length, bgColor: "#4FC3F7", color: "#ffffff" },
      { title: "Total Orders", value: orders.length, bgColor: "#FFCA28", color: "#24782a" },
      { title: "Products", value: products.length, bgColor: "#7E57C2", color: "#ffffff" },
      { title: "Revenue", value: formatINR(totalRevenue), bgColor: "#FF7043", color: "#24782a" },
      { title: "Date Report", value: "View", bgColor: "#90A4AE", color: "#006064" },
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
      <AdminNavbar/>

      <div className={styles.container}>
        <h1 className={styles.heading}> ADMIN DASHBOARD PANEL</h1>

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
        {errorMsg ? <p style={{ padding: 10, color: "#b91c1c" }}>{errorMsg}</p> : null}

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

        {/* ✅ Orders List */}
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
                    <th>Units</th>
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
                      <td>{getOrderUnits(order)}</td>
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

        {/* ✅ Products List */}
        {activeTab === "Products" && (
          <div className={styles.section}>
            <h2 style={{ color: "#8f00b3", marginBottom: "15px" }}>Products List</h2>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title / Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((p) => (
                    <tr key={(p._id || p.id || p.title || p.name || Math.random()) as any}>
                      <td>{p._id || p.id || "-"}</td>
                      <td>{p.title || p.name || "-"}</td>
                      <td>{typeof p.price === "number" ? formatINR(p.price) : p.price || "-"}</td>
                      <td>{p.stock ?? "-"}</td>
                      <td>{p.category || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {products.length === 0 && <p style={{ padding: 12, color: "#6b7280" }}>No products found.</p>}
            </div>
          </div>
        )}

        {/* ✅ Revenue tab */}
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

        {/* ✅ Date Report tab */}
        {activeTab === "Date Report" && (
          <div className={styles.section}>
            <h2 style={{ color: "#006064", marginBottom: "15px" }}>Date Wise Orders Report</h2>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
              <label style={{ fontWeight: 600 }}>Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #006460",
                  background: "#ddd",
                  cursor: "pointer",
                }}
              />

              <button
                onClick={fetchAll}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#006064",
                  cursor: "pointer",
                  fontWeight: 600,
                  color: "#ffffff"
                }}
              >
                Refresh
              </button>
            </div>

            {/* Selected day summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <div className={styles.card} style={{ background: "#7E57C2" }}>
                <h3 className={styles.cardTitle}>Orders (Selected Day)</h3>
                <p className={styles.cardValue} style={{color: "#ffff"}}>{selectedDay.ordersCount}</p>
              </div>

              <div className={styles.card} style={{ background: "#FFCA28" }}>
                <h3 className={styles.cardTitle}>Products Sold (Units)</h3>
                <p className={styles.cardValue}>{selectedDay.unitsSold}</p>
              </div>

              <div className={styles.card} style={{ background: "#FFA726" }}>
                <h3 className={styles.cardTitle}>Revenue</h3>
                <p className={styles.cardValue}>{formatINR(selectedDay.revenue)}</p>
              </div>
            </div>

            {/* All dates table */}
            <div className={styles.tableContainer} style={{ marginTop: 14 }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total Orders</th>
                    <th>Products Sold (Units)</th>
                    <th>Revenue</th>
                  </tr>
                </thead>

               <tbody>
  {dailyData.map((d) => {
    const isActive = selectedDate === d.date;

    return (
      <tr
        key={d.date}
        onClick={() => setSelectedDate(d.date)}
        style={{
          cursor: "pointer",
          backgroundColor: isActive ? "#e8f5e9" : "transparent", // light green
          color: isActive ? "#1b5e20" : "#000",
          transition: "0.2s ease",
        }}
      >
        <td>{d.date}</td>
        <td>{d.ordersCount}</td>
        <td>{d.unitsSold}</td>
        <td>{formatINR(d.revenue)}</td>
      </tr>
    );
  })}
</tbody>

              </table>

              {dailyData.length === 0 && <p style={{ padding: 12, color: "#6b7280" }}>No orders found.</p>}
            </div>

            <p style={{ marginTop: 10, color: "#6b7280" }}>
              Tip: kisi bhi date row pe click karoge to upar selected date change ho jayegi.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
