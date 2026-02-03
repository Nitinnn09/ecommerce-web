"use client";
import Link from "next/link";
import styles from "../css/sidebar.module.css";
import Image from "next/image";

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay */}
      {isOpen && <div className={styles.overlay} onClick={onClose}></div>}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <button onClick={onClose}>✕</button>
        </div>

        <ul className={styles.menu}>
          <li><Link href="/homepage"><Image src="/vector.png" alt="Home" width={20} height={20} /> Home</Link></li>
          <li><Link href="/offers"><Image src="/discount-voucher.svg" alt="My Offers" width={20} height={20} /> My Offers</Link></li>
          <li><Link href="/card"><Image src="/file.svg" alt="My Orders" width={20} height={20} />My Orders</Link></li>
          <li><Link href="/message"><Image src="/massage-1.svg" alt="Messages" width={20} height={20} />Messages</Link></li>
          <li><Link href="/track"><Image src="/tracking.svg" alt="Track Order" width={20} height={20} /> Track Order</Link></li>
          <li><Link href="/help"><Image src="/headphone.svg" alt="Help Centre" width={20} height={20} />Help Centre</Link></li>
          <li><Link href="/help/FAQs"><Image src="/email.svg" alt="FAQs" width={20} height={20} /> FAQs</Link></li>
          <li><Link href="/admin/dashboard"><Image src="/menu-icon.svg" alt="FAQs" width={20} height={20} /> Admin</Link></li>
          <li><Link href="/account"><Image src="/user.png" alt="FAQs" width={20} height={20} /> account</Link></li>
          <li><Link href="/policy"><Image src="/policy.svg" alt="FAQs" width={20} height={20} /> Policy Link</Link></li>
          <li><Link href="/login"><Image src="/user.png" alt="FAQs" width={20} height={20} /> Login / Register</Link></li>
        </ul>

        {/* <div className={styles.footer}>
          <Link href="/login"></Link>
        </div> */}
      </aside>
    </>
  );
}
