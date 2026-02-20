"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../../css/adregis.module.css";

export default function AdminAuth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError("");
    setPassword("");
    setConfirmPassword("");
  }, [isLogin]);

  const uploadProof = async () => {
    if (!proofFile) throw new Error("Business proof is required");

    const fd = new FormData();
    fd.append("file", proofFile);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({} as any));

    if (!res.ok) throw new Error(data?.error || "Proof upload failed");
    if (!data?.url) throw new Error("Upload API did not return url");

    return data.url as string;
  };

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
      payload.gstNo = gstNo.trim();
    }

    try {
      if (!isLogin) {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        if (String(gstNo || "").trim().length !== 15) {
          setError("GST No must be 15 characters");
          setLoading(false);
          return;
        }

        const proofUrl = await uploadProof();
        payload.businessProof = proofUrl;
      }

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
      alert(data?.message || "Done ✅");
      setIsLogin(true);
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setGstNo("");
      setProofFile(null);
      setProofPreview("");
    } catch (err: any) {
      console.error(err);
      setError(String(err?.message || err || "Server error, please try again"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
                <>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Admin Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />

                  <input
                    className={styles.input}
                    type="text"
                    placeholder="GST No (15 characters)"
                    value={gstNo}
                    onChange={(e) => setGstNo(e.target.value)}
                    required
                  />

                  <input
                    className={styles.input}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setProofFile(file);
                      setProofPreview(file ? URL.createObjectURL(file) : "");
                    }}
                    required
                  />

                  {proofPreview ? (
                    <div style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Business proof preview:</p>
                      <img
                        src={proofPreview}
                        alt="Business proof preview"
                        style={{
                          width: 120,
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 12,
                          border: "1px solid #ddd",
                        }}
                      />
                    </div>
                  ) : null}
                </>
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
                placeholder={isLogin ? "Password" : "Create New Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {!isLogin ? (
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              ) : null}

              {isLogin ? (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -6, marginBottom: 10 }}>
                  <a
                    href="/admin/forgot-password"
                    style={{ fontSize: 12, fontWeight: 700, color: "#006064", textDecoration: "none" }}
                  >
                    Forgot password?
                  </a>
                </div>
              ) : null}

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
