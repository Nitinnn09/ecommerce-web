"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../css/nav.module.css";
import Sidebar from "../component/sidebar";

type LoggedUser = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  image?: string;
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<LoggedUser | null>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem("user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("user-updated", loadUser);
    return () => window.removeEventListener("user-updated", loadUser);
  }, []);

  const avatarSrc = user?.image?.trim() ? user.image : "/user.png";

  return (
    <nav className={styles.navbar}>
      <button className={styles.mobileMenuBtn} onClick={() => setOpen(true)}>
        ☰
      </button>

     <div className={styles.logo}>
  <Link href="/homepage">
    <h1 className={styles.brand}>
      Bharat<span>Buy</span>
    </h1>
  </Link>
</div>


      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

      <ul className={styles.menu}>
        <li>
          <Link href={user ? "/account" : "/login"}>
            <img src={avatarSrc} alt="user" className={styles.userAvatar} />
          </Link>
        </li>

        <li>
          <Link className={styles.cart} href="/cart">
            🛒 0.99
          </Link>
        </li>
      </ul>
    </nav>
  );
}
