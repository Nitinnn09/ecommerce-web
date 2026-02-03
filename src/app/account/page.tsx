"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../css/account.module.css";
import Navbar from "../component/navbar";
import NextNav from "../component/nextnav";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const [edit, setEdit] = useState(false);

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    image: "/birthday1.jpg",
  });

  // 👉 Load user
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {
      name: "Nitin Kumar",
      email: "nitin@gmail.com",
      phone: "9876543210",
      image: "/birthday1.jpg",
    };
    setUser(storedUser);
  }, []);

  // 👉 Image upload handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUser({ ...user, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // 👉 Save profile
  const updateProfile = () => {
    localStorage.setItem("user", JSON.stringify(user));
    setEdit(false);
    alert("Profile updated successfully ✅");
  };

  const logout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <>
      <Navbar />
      <NextNav />

      <div className={styles.container}>
        {/* SIDEBAR */}
        <div className={styles.sidebar}>
          <div className={styles.imageBox}>
            <Image
              src={user.image}
              alt="User"
              width={120}
              height={120}
              className={styles.avatar}
            />

            {edit && (
              <label className={styles.uploadBtn}>
                Edit Profile
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <h3>{user.name}</h3>
          <p>{user.email}</p>

          <button className={styles.logout} onClick={logout}>
            Logout
          </button>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          <h2>My Account</h2>

          <div className={styles.card}>
            <h4>Personal Information</h4>

            <label>Name</label>
            <input
              value={user.name}
              disabled={!edit}
              onChange={(e) =>
                setUser({ ...user, name: e.target.value })
              }
            />

            <label>Email</label>
            <input
              value={user.email}
              disabled={!edit}
              onChange={(e) =>
                setUser({ ...user, email: e.target.value })
              }
            />

            <label>Phone</label>
            <input
              value={user.phone}
              disabled={!edit}
              onChange={(e) =>
                setUser({ ...user, phone: e.target.value })
              }
            />

            {!edit ? (
              <button
                className={styles.editBtn}
                onClick={() => setEdit(true)}
              >
                Edit Profile
              </button>
            ) : (
              <button
                className={styles.saveBtn}
                onClick={updateProfile}
              >
                Update Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
