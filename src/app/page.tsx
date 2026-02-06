"use client";

import { useState } from "react";
import styles from "../app/css/login.module.css";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/userlogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          type: isLogin ? "login" : "register",
        }),
      });

      const data = await res.json();
      alert(data.message);

      /* ===============================
         ✅ LOGIN SUCCESS → ONLY THEN REDIRECT
      =============================== */
      if (isLogin && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("user-updated"));

        router.push("/homepage"); // ✅ success pe hi
        return;
      }

      /* ===============================
         ✅ REGISTER SUCCESS → SWITCH TO LOGIN
      =============================== */
      if (!isLogin && data.user) {
        setIsLogin(true);
        setForm({ name: "", email: "", password: "" });
        alert("Registered successfully. Please login.");
        return;
      }

      // ❌ LOGIN FAIL / REGISTER FAIL → NO REDIRECT
    } catch (err) {
      console.error(err);
      alert("Something went wrong ❌");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* LEFT PANEL */}
        <div className={styles.left}>
          <h1>Hello, Welcome!</h1>
          <p>{isLogin ? "Don’t have an account?" : "Already have an account?"}</p>
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register" : "Login"}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <form className={styles.right} onSubmit={handleSubmit}>
          <h2>{isLogin ? "Login" : "Register"}</h2>

          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="username"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <span className={styles.forgot}>forgot password</span>

          <button type="submit" className={styles.loginBtn}>
            {isLogin ? "Login" : "Register"}
          </button>

          <p className={styles.other}>or login other platform</p>
        </form>
      </div>
    </div>
  );
}
