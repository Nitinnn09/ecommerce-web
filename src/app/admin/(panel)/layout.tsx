import type { ReactNode } from "react";
import AdminNavbar from "@/app/component/adminnav";
import AdminSidebar from "@/app/component/adminsidebar";
import styles from "../../css/adminpanel.module.css";

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <AdminNavbar />
      <div className={styles.body}>
        <AdminSidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}

