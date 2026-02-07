"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "../../css/helpform.module.css";
import Navbar from "../../component/navbar";

const ISSUES = ["Order not delivered", "Cancel order", "Return / Refund"];

export default function OrdersHelp() {
  const [orderId, setOrderId] = useState("");
  const [issue, setIssue] = useState("Select Issue");
  const [desc, setDesc] = useState("");

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // close dropdown on outside click
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
          <h1 className={styles.title}>📦 Orders Help</h1>
          <p className={styles.subtitle}>
            Facing issues with your order? Fill the details below.
          </p>

          <input
            className={styles.input}
            type="text"
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />

          {/* ✅ Custom Select (no overflow on mobile) */}
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
                {ISSUES.map((opt) => (
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

          <textarea
            className={styles.textarea}
            placeholder="Describe your issue"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <button className={styles.button} onClick={() => alert("Submitted ✅")}>
            Submit Request
          </button>
        </div>
      </div>
    </>
  );
}
