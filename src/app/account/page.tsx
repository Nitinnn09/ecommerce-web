"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../component/navbar";

import styles from "../css/account.module.css";

type UserType = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  image: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const handleLogout = () => {
    // ✅ clear user
    localStorage.removeItem("user");

    // ✅ optional: admin bhi clear (agar same browser me admin login hota ho)
    localStorage.removeItem("admin");

    // ✅ navbar update
    window.dispatchEvent(new Event("user-updated"));

    // ✅ redirect
    router.replace("/login");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = { ...user, image: reader.result as string };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("user-updated"));
    };
    reader.readAsDataURL(file);
  };

  const updateProfile = async () => {
    if (!user) return;

    try {
      await fetch("/api/update-user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("user-updated"));
      setEdit(false);
      alert("Profile updated ✅");
    } catch (e) {
      console.log(e);
      alert("Update failed ❌");
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
    
        <div className={styles.empty}>
          <div className={styles.emptyCard}>
            <h3>Please login first</h3>
            <p>Login karoge tabhi profile dikh जाएगी.</p>
            <Link href="/login" className={styles.linkBtn}>
              Go to Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      

      <div className={styles.page}>
        <div className={styles.container}>
          {/* LEFT */}
          <aside className={styles.sidebar}>
            <div className={styles.avatarWrap}>
              <img src={user.image || "/user.png"} alt="User" className={styles.avatar} />

              {edit && (
                <label className={styles.uploadBtn}>
                  Change Photo
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </label>
              )}

              <h3 className={styles.userName}>{user.name}</h3>
              <p className={styles.userEmail}>{user.email}</p>
            </div>

            <div className={styles.sideInfo}>
              <div className={styles.sideRow}>
                <span className={styles.sideLabel}>Phone</span>
                <span className={styles.sideValue}>{user.phone || "-"}</span>
              </div>
            </div>

            {/* ✅ Logout button */}
            <button
              className={styles.btnDanger}
              onClick={handleLogout}
              type="button"
              style={{ marginTop: 12 }}
            >
              Logout
            </button>

            {/* ✅ Admin option */}
            <div className={styles.adminCard}>
              <h4 className={styles.adminTitle}>Admin Access</h4>
              <p className={styles.adminText}>Agar tum Admin account banana chahte ho to yahan se jao.</p>

              <div className={styles.adminActions}>
                <Link href="/admin/register" className={styles.btnPrimary}>
                  Create Admin Account
                </Link>

                <Link href="/admin/register" className={styles.btnGhost}>
                  Admin Login
                </Link>
              </div>
            </div>
          </aside>

          {/* RIGHT */}
          <main className={styles.content}>
            <div className={styles.topBar}>
              <div>
                <h2 className={styles.heading}>My Account</h2>
                <p className={styles.muted}>Manage your profile details</p>
              </div>

              {!edit ? (
                <button className={styles.btnGhost} onClick={() => setEdit(true)}>
                  Edit Profile
                </button>
              ) : (
                <div className={styles.rowBtns}>
                  <button className={styles.btnPrimary} onClick={updateProfile}>
                    Save Changes
                  </button>
                  <button className={styles.btnGhost} onClick={() => setEdit(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className={styles.card}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <span className={styles.label}>Name</span>
                  <input
                    className={styles.input}
                    disabled={!edit}
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                  />
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>Email</span>
                  <input className={styles.input} disabled value={user.email} />
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>Phone</span>
                  <input
                    className={styles.input}
                    disabled={!edit}
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.note}>Tip: Photo change karne ke liye “Edit Profile” ON karo ✅</div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
