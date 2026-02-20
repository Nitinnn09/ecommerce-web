"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../css/adminnav.module.css";

type AdminMe = { username?: string; email?: string; avatar?: string };

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/addproduct", label: "Add Product" },
  { href: "/admin/product", label: "Product List / Edit" },
  { href: "/admin/account", label: "Admin Account" },
];

export default function AdminNavbar() {
  const [open, setOpen] = useState(false);
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const pathname = usePathname();

  const loadAdmin = async () => {
    try {
      const res = await fetch("/api/admin/me", { cache: "no-store" });
      const data = await res.json().catch(() => ({} as any));
      if (res.ok) setAdmin(data?.admin || null);
    } catch {
      setAdmin(null);
    }
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    loadAdmin();

    const onUpdated = () => loadAdmin();
    window.addEventListener("admin-updated", onUpdated);
    return () => window.removeEventListener("admin-updated", onUpdated);
  }, []);

  const displayName = useMemo(() => {
    const name = String(admin?.username || "").trim();
    if (name) return name;
    const email = String(admin?.email || "").trim();
    return email ? email.split("@")[0] : "Admin";
  }, [admin]);

  const avatarSrc = useMemo(() => {
    const a = String(admin?.avatar || "").trim();
    return a || "/user.png";
  }, [admin?.avatar]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/admin/dashboard" className={styles.brand}>
            InUpShoping
          </Link>

          <div className={styles.right}>
            <Link href="/admin/account" className={styles.avatarWrap} aria-label="Admin account">
              <Image
                key={avatarSrc}
                unoptimized
                className={styles.avatar}
                src={avatarSrc}
                alt={displayName}
                width={34}
                height={34}
              />
              <span className={styles.adminName}>{displayName}</span>
            </Link>

            <button
              className={styles.menuBtn}
              aria-label="Open admin menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              type="button"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`${styles.overlay} ${open ? styles.show : ""}`} onClick={() => setOpen(false)} />

      <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`} role="dialog" aria-modal="true">
        <div className={styles.drawerTop}>
          <div className={styles.drawerTitle}>Admin Menu</div>
          <button className={styles.closeBtn} aria-label="Close menu" onClick={() => setOpen(false)} type="button">
            ✕
          </button>
        </div>

        <div className={styles.drawerProfile}>
          <Image
            key={avatarSrc + "-drawer"}
            unoptimized
            className={styles.drawerAvatar}
            src={avatarSrc}
            alt={displayName}
            width={46}
            height={46}
          />
          <div className={styles.drawerName}>{displayName}</div>
          {admin?.email ? <div className={styles.drawerEmail}>{admin.email}</div> : null}
        </div>

        <nav className={styles.drawerNav}>
          {links.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`${styles.drawerLink} ${isActive ? styles.activeDrawer : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
