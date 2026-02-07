"use client";

import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../component/navbar";
import styles from "../../css/helpform.module.css";

const OPTIONS = ["Forgot Password", "Account Locked", "Profile Update Issue", "Other"];

export default function AccountHelp() {
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
          <h1 className={styles.title}>Account Help</h1>
          <p className={styles.subtitle}>Login issues, profile updates or security concerns.</p>

          {/* ✅ Custom Select (same like OrdersHelp) */}
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

          <input className={styles.input} type="email" placeholder="Registered Email" />

          <textarea className={styles.textarea} placeholder="Describe your account issue" />

          <button className={styles.button}>Submit Request</button>
        </div>
      </div>
    </>
  );
}
