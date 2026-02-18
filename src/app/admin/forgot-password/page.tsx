"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/component/navbar";
import styles from "../../css/forgot.module.css";

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      alert(data?.message || (res.ok ? "Done" : "Failed"));
      if (res.ok) router.push("/admin/register");
    } catch (err: any) {
      alert(String(err?.message || err || "Something went wrong"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Admin forgot password</h1>
          <p className={styles.subtitle}>We will send a reset link to your email.</p>

          <form onSubmit={submit} className={styles.form}>
            <label className={styles.label}>
              Email
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </label>

            <button className={styles.button} type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send reset link"}
            </button>

            <Link className={styles.backLink} href="/admin/register">
              Back to admin login
            </Link>
          </form>
        </div>
      </div>
    </>
  );
}
