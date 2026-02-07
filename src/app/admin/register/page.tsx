"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../../css/adregis.module.css";
import Navbar from "@/app/component/navbar";

export default function AdminAuth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = isLogin ? "/api/login" : "/api/register";

    const payload: any = {
      email: email.toLowerCase(),
      password,
    };

    if (!isLogin) {
      payload.username = username;
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("ADMIN AUTH RESPONSE:", data);

      // ❌ ERROR CASE
      if (!res.ok) {
        setError(data?.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      // ✅ LOGIN SUCCESS (200 OK) → ALWAYS REDIRECT
      if (isLogin) {
        // jo bhi backend bheje, save kar lo
        localStorage.setItem("admin", JSON.stringify(data));

        // ✅ IMPORTANT: replace > push (more reliable)
        router.replace("/admin/dashboard");
        return;
      }

      // ✅ REGISTER SUCCESS
      alert("Admin account created successfully ✅");
      setIsLogin(true);
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setError("Server error, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className={styles.wrapper}>
        {/* LEFT */}
        <div className={styles.left}>
          <h1>WELCOME TO ADMIN USER</h1>
          <p>Manage products, orders & users from one place</p>

          <Image
            src="/chetgpt.png"
            alt="Admin"
            width={620}
            height={620}
            priority
          />
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          <div className={styles.card}>
            <div className={styles.toggle}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${isLogin ? styles.active : ""}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${!isLogin ? styles.active : ""}`}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

            <h2>{isLogin ? "Admin Login" : "Create Admin"}</h2>
            <p className={styles.desc}>
              {isLogin
                ? "Login to access admin dashboard"
                : "Create a secure admin account"}
            </p>

            {error && <div className={styles.error}>{error}</div>}

            <form className={styles.form} onSubmit={handleSubmit}>
              {!isLogin && (
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Admin Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              )}

              <input
                className={styles.input}
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                className={styles.input}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                className={styles.submit}
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Login"
                  : "Create Admin"}
              </button>
            </form>

            <p className={styles.footer}>
              {isLogin ? (
                <>
                  New admin?{" "}
                  <span onClick={() => setIsLogin(false)}>Create account</span>
                </>
              ) : (
                <>
                  Already admin?{" "}
                  <span onClick={() => setIsLogin(true)}>Login</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
