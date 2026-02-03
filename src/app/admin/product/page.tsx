"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../../css/productList.module.css";
import Navbar from "../../component/navbar";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const deleteProduct = async (id: string) => {
    const ok = confirm("Are you sure you want to delete this product?");
    if (!ok) return;

    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    const data = await res.json();

    alert(res.ok ? "✅ Deleted" : data.message || "Error");
    if (res.ok) load();
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <>
    <Navbar/>
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Admin Products List</h2>
          <Link href="/admin/addproduct" className={styles.addBtn}>
            + Add Product
          </Link>
        </div>

        <div className={styles.list}>
          {products.map((p) => (
            <div key={p._id} className={styles.card}>
              <div className={styles.left}>
                <div className={styles.name}>{p.title}</div>

                <div className={styles.meta}>
                  <span className={styles.pill}>💰 ₹{p.price}</span>
                  {p.category ? <span className={styles.pill}>🏷️ {p.category}</span> : null}
                  {p.stock !== undefined ? <span className={styles.pill}>📦 Stock: {p.stock}</span> : null}
                </div>
              </div>

              <div className={styles.actions}>
                <Link href={`/admin/product/[id]${p._id}`} className={styles.editBtn}>
                  Edit
                </Link>

                <button onClick={() => deleteProduct(p._id)} className={styles.deleteBtn}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
