"use client";
import React, { useState,useEffect } from "react";
import styles from "../../css/dash.module.css";
import Navbar from "../../component/navbar"; 
import NextNav from "../../component/nextnav";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>("Total Users");

  
  const [Users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const stats = [
    { title: "Total Users", value: 120, bgColor: "#fff" ,color: "#406af3"}, // Blue
    { title: "Total Orders", value: 45, bgColor: "#fff" ,color: "#ff9900"}, // Green
    { title: "Products", value: 80, bgColor: "#fff" ,color: "#8f00b3"}, // Orange
    { title: "Revenue", value: "₹25,000", bgColor: "#fff" ,color: "#24782a"}, // Purple
  ];

  // const users = [
  //   { id: 1, name: "Rahul Sharma", email: "rahul@example.com", status: "Active" },
  //   { id: 2, name: "Priya Singh", email: "priya@example.com", status: "Active" },
  //   { id: 3, name: "Amit Kumar", email: "amit@example.com", status: "Inactive" },
  //   { id: 4, name: "Sneha Gupta", email: "sneha@example.com", status: "Active" },
  // ];

  const orders = [
    { id: "#ORD-001", customer: "Rahul Sharma", amount: "₹2,500", status: "Delivered" },
    { id: "#ORD-002", customer: "Priya Singh", amount: "₹1,800", status: "Pending" },
    { id: "#ORD-003", customer: "Amit Kumar", amount: "₹3,200", status: "Processing" },
    { id: "#ORD-004", customer: "Sneha Gupta", amount: "₹4,100", status: "Delivered" },
  ];

  const products = [
    { id: 1, name: "Laptop", price: "₹45,000", stock: 25, category: "Electronics" },
    { id: 2, name: "Mobile Phone", price: "₹15,000", stock: 50, category: "Electronics" },
    { id: 3, name: "Headphones", price: "₹2,500", stock: 100, category: "Accessories" },
    { id: 4, name: "Smart Watch", price: "₹8,000", stock: 30, category: "Electronics" },
  ];

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
              transform: activeTab === item.title ? "scale(1.05)" : "scale(1)"
            }}
            onClick={() => setActiveTab(item.title)}
          >
            <h3 className={styles.cardTitle}>{item.title}</h3>
            <p className={styles.cardValue} style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Users List */}
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
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span 
                        style={{
                          padding: "5px 10px",
                          borderRadius: "5px",
                          backgroundColor: user.status === "Active" ? "#d1fae5" : "#fed7d7",
                          color: user.status === "Active" ? "#065f46" : "#991b1b"
                        }}
                      >
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders List */}
      {activeTab === "Total Orders" && (
        <div className={styles.section}>
          <h2 style={{ color: "#ff9900", marginBottom: "15px" }}>Orders List</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.amount}</td>
                    <td>
                      <span 
                        style={{
                          padding: "5px 10px",
                          borderRadius: "5px",
                          backgroundColor: 
                            order.status === "Delivered" ? "#d1fae5" : 
                            order.status === "Processing" ? "#fed7aa" : "#fef3c7",
                          color: 
                            order.status === "Delivered" ? "#065f46" : 
                            order.status === "Processing" ? "#9a3412" : "#854d0e"
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products List */}
      {activeTab === "Products" && (
        <div className={styles.section}>
          <h2 style={{ color: "#8f00b3", marginBottom: "15px" }}>Products List</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.price}</td>
                    <td>
                      <span 
                        style={{
                          padding: "5px 10px",
                          borderRadius: "5px",
                          backgroundColor: product.stock > 30 ? "#d1fae5" : "#fed7aa",
                          color: product.stock > 30 ? "#065f46" : "#9a3412"
                        }}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td>{product.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue Summary */}
      {activeTab === "Revenue" && (
        <div className={styles.section}>
          <h2 style={{ color: "#24782a", marginBottom: "15px" }}>Revenue Summary</h2>
          <div className={styles.revenueList}>
            <div className={styles.revenueItem}>
              <span>Today's Revenue:</span>
              <strong style={{ color: "#24782a" }}>₹5,000</strong>
            </div>
            <div className={styles.revenueItem}>
              <span>This Week:</span>
              <strong style={{ color: "#24782a" }}>₹35,000</strong>
            </div>
            <div className={styles.revenueItem}>
              <span>This Month:</span>
              <strong style={{ color: "#24782a" }}>₹1,50,000</strong>
            </div>
            <div className={styles.revenueItem}>
              <span>Total Revenue:</span>
              <strong style={{ color: "#24782a" }}>₹25,00,000</strong>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
