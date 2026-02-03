"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Styles from "../../../css/editproduct.module.css";
import Navbar from "../../../component/navbar";

export default function EditProductPage() {
  const params = useParams();
  const id = String(params.id);
  const router = useRouter();

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();

      setForm({
        title: data.title || "",
        price: data.price ?? "",
        oldPrice: data.oldPrice ?? "",
        discount: data.discount || "",
        image: data.image || "", // existing image url
        desc: data.desc || "",
        category: data.category || "general",
        bullets: (data.bullets || []).join(", "),
        stock: data.stock ?? 1,
      });

      setLoading(false);
    };
    load();
  }, [id]);

  const updateProduct = async (e: any) => {
    e.preventDefault();

    let imageUrl = form.image;

    // ✅ if new file selected → upload first
    if (imageFile) {
      const fd = new FormData();
      fd.append("file", imageFile);

      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await upRes.json();

      if (!upRes.ok) {
        alert(upData.message || "Image upload failed");
        return;
      }

      imageUrl = upData.url;
    }

    const payload = {
      ...form,
      image: imageUrl,
      bullets: String(form.bullets)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    };

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    alert(res.ok ? "✅ Updated" : data.message || "Error");

    if (res.ok) router.push("/admin/products");
  };

  if (loading || !form) return <div className={Styles.loading}>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className={Styles.page}>
        <div className={Styles.card}>
          <h2 className={Styles.title}>Edit Product</h2>

          <form onSubmit={updateProduct} className={Styles.form}>
            <div className={Styles.field}>
              <label className={Styles.label}>Title</label>
              <input className={Styles.input} name="title" value={form.title} onChange={handleChange} required />
            </div>

            <div className={Styles.row2}>
              <div className={Styles.field}>
                <label className={Styles.label}>Price</label>
                <input className={Styles.input} name="price" value={form.price} onChange={handleChange} required />
              </div>

              <div className={Styles.field}>
                <label className={Styles.label}>Old Price</label>
                <input className={Styles.input} name="oldPrice" value={form.oldPrice} onChange={handleChange} />
              </div>
            </div>

            <div className={Styles.row2}>
              <div className={Styles.field}>
                <label className={Styles.label}>Discount</label>
                <input className={Styles.input} name="discount" value={form.discount} onChange={handleChange} />
              </div>

              <div className={Styles.field}>
                <label className={Styles.label}>Stock</label>
                <input className={Styles.input} name="stock" value={form.stock} onChange={handleChange} />
              </div>
            </div>

            {/* ✅ File input (no value, separate handler) */}
            <div className={Styles.field}>
              <label className={Styles.label}>Product Image</label>
              <input className={Styles.input} type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className={Styles.field}>
              <label className={Styles.label}>Category</label>
              <input className={Styles.input} name="category" value={form.category} onChange={handleChange} />
            </div>

            <div className={Styles.field}>
              <label className={Styles.label}>Description</label>
              <textarea className={Styles.textarea} name="desc" value={form.desc} onChange={handleChange} />
            </div>

            <div className={Styles.field}>
              <label className={Styles.label}>Bullets (comma separated)</label>
              <input className={Styles.input} name="bullets" value={form.bullets} onChange={handleChange} />
            </div>

            <div className={Styles.actions}>
              <button type="button" className={Styles.secondaryBtn} onClick={() => router.back()}>
                Cancel
              </button>
              <button type="submit" className={Styles.primaryBtn}>
                Update Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
