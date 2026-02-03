"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "../css/nextnav.module.css";
import Sidebar from "../component/sidebar";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
    const [open, setOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      {/* Logo */}
      <div className={styles.logo}>
        <button onClick={() => setOpen(true)}>☰</button>
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />
      </div>

      {/* Hamburger */}
      <div
        className={styles.hamburger}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Links */}
      {/* <ul className={`${styles.navLinks} ${menuOpen ? styles.active : ""}`}>
        <li><Link href="/birthday">Birthday</Link></li>
        <li><Link href="/mugs">MUGS</Link></li>
        <li><Link href="/tshirt">T-Shirt</Link></li>
        <li><Link href="/occasion">Occasion</Link></li>
        <li><Link href="/wekv">Categories</Link></li>
        <li><Link href="/corporate">Corporate</Link></li>
        <li><Link href="/relationship">Relation-Ship</Link></li>
      </ul> */}



      <ul className={`${styles.navLinks} ${menuOpen ? styles.active : ""}`}>

  <li className={styles.dropdown}>
    <Link href="/birthday">BIRTHDAY</Link>
    <div className={styles.dropdownMenu}>
      <div className={styles.dropdownGrid}>
        <Link href="#">Birthday Link 1</Link>
        <Link href="#">Birthday Link 2</Link>
        <Link href="#">Birthday Link 3</Link>
        <Link href="#">Birthday Link 4</Link>
        <Link href="#">Birthday Link 5</Link>
      </div>
    </div>
  </li>

  <li className={styles.dropdown}>
    <Link href="/mugs">MUGS</Link>
    <div className={styles.dropdownMenu}>
      <div className={styles.dropdownGrid}>
        <Link href="#">Mugs Link 1</Link>
        <Link href="#">Mugs Link 2</Link>
        <Link href="#">Mugs Link 3</Link>
        <Link href="#">Mugs Link 4</Link>
        <Link href="#">Mugs Link 5</Link>
      </div>
    </div>
  </li>

  <li className={styles.dropdown}>
    <Link href="/tshirt">T-SHIRT</Link>
    <div className={styles.dropdownMenu}>
      <div className={styles.dropdownGrid}>
        <Link href="#">Tshirt Link 1</Link>
        <Link href="#">Tshirt Link 2</Link>
        <Link href="#">Tshirt Link 3</Link>
        <Link href="#">Tshirt Link 4</Link>
        <Link href="#">Tshirt Link 5</Link>
      </div>
    </div>
  </li>

  <li className={styles.dropdown}>
    <Link href="/clothes">CLOTHES</Link>
    <div className={styles.dropdownMenu}>
      <div className={styles.dropdownGrid}>
        <Link href="#">Occasion Link 1</Link>
        <Link href="#">Occasion Link 2</Link>
        <Link href="#">Occasion Link 3</Link>
        <Link href="#">Occasion Link 4</Link>
        <Link href="#">Occasion Link 5</Link>
      </div>
    </div>
  </li>

</ul>

    </nav>
  );
}
