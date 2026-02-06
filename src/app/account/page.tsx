"use client";

import { useEffect, useState } from "react";
import Navbar from "../component/navbar";
import NextNav from "../component/nextnav";
import styles from "../css/account.module.css";

type UserType = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  image: string;
};

export default function AccountPage() {
  const [edit, setEdit] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  // ✅ Load user from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  // ✅ Image preview + navbar update
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

  // ✅ Update DB + localStorage
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
        <NextNav />
        <div className={styles.empty}>
          <div className={styles.emptyCard}>
            <h3>Please login first</h3>
            <p>Login karoge tabhi profile dikh जाएगी.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <NextNav />

      <div className={styles.container}>
        {/* LEFT */}
        <div className={styles.sidebar}>
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
        </div>

        {/* RIGHT */}
        <div className={styles.content}>
          <h2 className={styles.heading}>My Account</h2>

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

            <div className={styles.actions}>
              {!edit ? (
                <button className={styles.btnGhost} onClick={() => setEdit(true)}>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className={styles.btnPrimary} onClick={updateProfile}>
                    Save Changes
                  </button>
                  <button className={styles.btnGhost} onClick={() => setEdit(false)}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
