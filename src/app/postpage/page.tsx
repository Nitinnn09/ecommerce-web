"use client";

import { useEffect, useState } from "react";

type ProductResponse = {
  images?: unknown;
};

const normalizeImages = (data: unknown): string[] => {
  if (!data || typeof data !== "object") return [];
  const { images } = data as ProductResponse;
  if (!Array.isArray(images)) return [];
  return images.filter((v): v is string => typeof v === "string");
};

export default function PostPage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchImages = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://dummyjson.com/products/1", {
          signal: controller.signal,
          cache: "no-store",
        });
        const data: unknown = await res.json();
        setImages(normalizeImages(data));
      } catch {
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
    return () => controller.abort();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Multiple Images</h1>

      {loading ? (
        <p>Loading...</p>
      ) : images.length === 0 ? (
        <p>No images found.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {images.map((src, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${src}-${index}`} src={src} alt="product" width={200} style={{ borderRadius: 8 }} />
          ))}
        </div>
      )}
    </main>
  );
}
