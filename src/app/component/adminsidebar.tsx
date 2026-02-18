"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../css/adminsidebar.module.css";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/admin/addproduct", label: "Add Product", icon: "➕" },
  { href: "/admin/product", label: "Product List / Edit", icon: "📦" },
  { href: "/admin/account", label: "Admin Account", icon: "👤" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className={styles.desktopOnly}>
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
              <Link key={l.href} href={l.href} className={`${styles.item} ${active ? styles.active : ""}`}>
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
    </div>
  );
}

