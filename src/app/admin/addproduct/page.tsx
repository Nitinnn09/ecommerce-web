"use client";

import { useState } from "react";
import Styles from "../../css/adproduct.module.css";
import { useRouter } from "next/navigation";
import Navbar from "@/app/component/navbar";

export default function AddProductPage() {
  const router = useRouter();

  // ✅ Text fields only (image will be handled separately)
  const [form, setForm] = useState({
    title: "",
    price: "",
    oldPrice: "",
    discount: "",
    desc: "",
    category: "general",
    bullets: "",
    stock: "1",
  });

  // ✅ file + preview url
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ file input handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    // preview
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }
  };

  // ✅ upload file to /api/upload and get /uploads/xxx url
  const uploadImage = async (): Promise<string> => {
    if (!imageFile) throw new Error("Please select an image");

    const fd = new FormData();
    fd.append("file", imageFile);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Image upload failed");
    }

    // expected: { url: "/uploads/....png" }
    if (!data?.url) throw new Error("Upload API did not return url");

    return data.url as string;
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ✅ 1) upload image
      const imageUrl = await uploadImage();

      // ✅ 2) prepare payload for DB
      const payload = {
        ...form,
        image: imageUrl, // ✅ save /uploads/... not fakepath
        bullets: form.bullets
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      alert(res.ok ? "✅ Product Added" : data.message || "Error");

      if (res.ok) router.push("/admin/product");
    } catch (err: any) {
      alert(err?.message || "Something went wrong");
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className={Styles.page}>
        <div className={Styles.card}>
          <h2 className={Styles.title}>Add Product</h2>

          <form onSubmit={addProduct} className={Styles.form}>
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

            {/* ✅ FILE INPUT */}
            <div className={Styles.field}>
              <label className={Styles.label}>Product Image</label>
              <input className={Styles.input} type="file" accept="image/*" onChange={handleFileChange} required />

              {/* ✅ Preview */}
              {previewUrl ? (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Preview:</p>
                  <img
                    src={previewUrl}
                    alt="preview"
                    style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 10, border: "1px solid #ddd" }}
                  />
                </div>
              ) : null}
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
                Add Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
