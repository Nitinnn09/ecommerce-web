"use client";
import { useState } from "react";
import Navbar from "../../component/navbar";
import styles from "../../css/faq.module.css";

const faqs = [
  {
    q: "How can I track my order?",
    a: "You can track your order from the Orders section using your Order ID."
  },
  {
    q: "What payment methods are supported?",
    a: "We support UPI, Credit/Debit Cards, Net Banking and Wallets."
  },
  {
    q: "How long does delivery take?",
    a: "Delivery usually takes 3–7 business days depending on your location."
  },
  {
    q: "How do I return a product?",
    a: "Go to Orders → Select product → Request return within 7 days."
  },
  {
    q: "How can I contact customer support?",
    a: "You can reach us via the Contact Support page or email support@example.com."
  }
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Frequently Asked Questions</h1>
          <p>Quick answers to common questions</p>
        </div>

        <div className={styles.faqList}>
          {faqs.map((item, index) => (
            <div
              key={index}
              className={`${styles.faqItem} ${
                openIndex === index ? styles.active : ""
              }`}
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            >
              <div className={styles.question}>
                <span>{item.q}</span>
                <span className={styles.icon}>
                  {openIndex === index ? "−" : "+"}
                </span>
              </div>

              {openIndex === index && (
                <div className={styles.answer}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
