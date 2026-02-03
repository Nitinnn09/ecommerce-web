"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../../css/adregis.module.css";
import Navbar from "@/app/component/navbar";

export default function AdminAuth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    const url = isLogin ? "/api/login" : "/api/register";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.toLowerCase(), password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Something went wrong");
    } else {
      if (isLogin) {
        router.push("/admin/dashboard");
      } else {
        alert("Admin created successfully");
        setIsLogin(true);
      }
    }
  };

  return (
    <>
    <Navbar/>
    <div className={styles.wrapper}>
      {/* LEFT SIDE */}
      <div className={styles.left}>
        <h1>Set Your Admin Panel</h1>
        <p>Manage products, orders & users from one place</p>

        <Image
          src="/chetgpt.png" // apni image
          alt="Admin"
          width={620}
          height={620}
          priority
        />
      </div>

      {/* RIGHT SIDE */}
      <div className={styles.right}>
        <div className={styles.card}>
          <div className={styles.toggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${
                isLogin ? styles.active : ""
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${
                !isLogin ? styles.active : ""
              }`}
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

            <button className={styles.submit} type="submit">
              {isLogin ? "Login" : "Create Admin"}
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
