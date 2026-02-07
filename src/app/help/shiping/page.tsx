"use client";

import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../component/navbar";
import styles from "../../css/helpform.module.css";

const OPTIONS = ["Delivery Delayed", "Wrong Address", "Package Not Received", "Other"];

export default function ShippingHelp() {
  const [issue, setIssue] = useState("Select Issue");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.formBox}>
          <h1 className={styles.title}>Shipping Help</h1>
          <p className={styles.subtitle}>Questions about delivery, delays or address issues.</p>

          {/* ✅ Custom Select */}
          <div className={styles.selectWrap} ref={wrapRef}>
            <button
              type="button"
              className={styles.selectBtn}
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open}
            >
              <span className={styles.selectText}>{issue}</span>
              <span className={styles.chev}>▾</span>
            </button>

            {open && (
              <div className={styles.dropdown}>
                {OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={styles.option}
                    onClick={() => {
                      setIssue(opt);
                      setOpen(false);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input className={styles.input} type="text" placeholder="Tracking ID" />

          <textarea className={styles.textarea} placeholder="Explain your shipping issue" />

          <button className={styles.button}>Submit Request</button>
        </div>
      </div>
    </>
  );
}
