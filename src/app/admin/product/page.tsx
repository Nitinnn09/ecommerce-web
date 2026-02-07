"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../../css/productList.module.css";
import AdminNavbar from "@/app/component/adminnav";

type Product = {
  _id: string;
  title: string;
  price: number | string;
  category?: string;
  stock?: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const normalize = (d: any): Product[] => {
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.products)) return d.products;
    return [];
  };

  const load = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();

      setProducts(normalize(data));
    } catch (e) {
      console.error("Load products error:", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteProduct = async (id: string) => {
    const ok = confirm("Are you sure you want to delete this product?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      alert(res.ok ? "✅ Deleted" : data.message || "Error");
      if (res.ok) load();
    } catch (e) {
      console.error("Delete error:", e);
      alert("Error deleting product");
    }
  };

  return (
    <>
      <AdminNavbar />

      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>Admin Products List</h2>

            <Link href="/admin/addproduct" className={styles.addBtn}>
              + Add Product
            </Link>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : products.length === 0 ? (
            <div className={styles.loading}>No products found.</div>
          ) : (
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
                    {/* ✅ FIXED LINK */}
                    <Link href={`/admin/product/${p._id}`} className={styles.editBtn}>
                      Edit
                    </Link>

                    <button onClick={() => deleteProduct(p._id)} className={styles.deleteBtn}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
