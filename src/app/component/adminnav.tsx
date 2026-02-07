"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../css/adminnav.module.css";

type NavItem = { label: string; href: string };

const navItems: NavItem[] = [
     { label: "AdminDashboard", href: "/admin/dashboard" },
  { label: "AdProduct", href: "/admin/addproduct" },
  { label: "Product List", href: "/admin/product" },
  { label: "Edit Product", href: "/admin/product/id" },
];

export default function AdminNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // route change pe drawer band
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // drawer open pe body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
           <Link href="/admin">
                <h1 className={styles.brand}>
                 Bharat<span>Buy</span>
             </h1>
            </Link>
          

          {/* Desktop links */}
          <nav className={styles.navDesktop}>
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.link} ${isActive ? styles.active : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <button
            className={styles.hamburger}
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${open ? styles.show : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.drawerTop}>
          <div className={styles.drawerTitle}>Menu</div>
          <button className={styles.closeBtn} aria-label="Close menu" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>

        <nav className={styles.drawerNav}>
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
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
