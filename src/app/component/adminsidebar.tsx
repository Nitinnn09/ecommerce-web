"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../css/adminsidebar.module.css";

const links = [
  { href: "/admin/addproduct", label: "Add Product", icon: "➕" },
  { href: "/admin/products", label: "Total Products", icon: "📦" },
  { href: "/admin/account", label: "Admin Account", icon: "👤" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // ✅ ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const SidebarContent = (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>⚙️</div>
        <div>
          <h2 className={styles.title}>Admin Panel</h2>
          <p className={styles.sub}>Manage products & account</p>
        </div>
      </div>

      <nav className={styles.nav}>
        {links.map((l) => {
          const active = pathname === l.href || pathname?.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`${styles.item} ${active ? styles.active : ""}`}
              onClick={() => setOpen(false)} // ✅ drawer close on click
            >
              <span className={styles.icon}>{l.icon}</span>
              <span className={styles.text}>{l.label}</span>
              <span className={styles.chev}>›</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.tip}>
          <span className={styles.dot} />
          Tip: Keep product images square.
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* ✅ Desktop sidebar */}
      <div className={styles.desktopOnly}>{SidebarContent}</div>

      {/* ✅ Mobile button */}
      <button className={styles.fab} onClick={() => setOpen(true)} aria-label="Open admin menu">
        ☰
      </button>

      {/* ✅ Mobile Drawer */}
      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.drawer}>
            <div className={styles.drawerTop}>
              <p className={styles.drawerTitle}>Admin Menu</p>
              <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            {SidebarContent}
          </div>
        </>
      )}
    </>
  );
}
