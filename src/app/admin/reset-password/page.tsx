"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/component/navbar";
import styles from "../../css/forgot.module.css";

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return alert("Reset token missing");
    if (password !== confirmPassword) return alert("Passwords do not match");

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
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
          <h1 className={styles.title}>Reset admin password</h1>
          <p className={styles.subtitle}>Enter your new password.</p>

          <form onSubmit={submit} className={styles.form}>
            <label className={styles.label}>
              New password
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
              />
            </label>

            <label className={styles.label}>
              Confirm password
              <input
                className={styles.input}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
              />
            </label>

            <button className={styles.button} type="submit" disabled={submitting}>
              {submitting ? "Resetting..." : "Reset password"}
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
