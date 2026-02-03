"use client";
import Navbar from "../component/navbar";
import styles from "../css/message.module.css";

export default function Messages() {
  return (
    <>
      <Navbar />

      <div className={styles.container}>
        {/* LEFT SIDEBAR */}
        <div className={styles.sidebar}>
          <h3>Messages</h3>

          <div className={styles.user}>
            <span className={styles.avatar}>S</span>
            <div>
              <h4>Support Team</h4>
              <p>How can we help you?</p>
            </div>
          </div>

          <div className={styles.user}>
            <span className={styles.avatar}>O</span>
            <div>
              <h4>Order Help</h4>
              <p>Your order is shipped</p>
            </div>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className={styles.chat}>
          <div className={styles.chatHeader}>
            <h4>Support Team</h4>
            <span>Online</span>
          </div>

          <div className={styles.chatBody}>
            <div className={styles.msgLeft}>
              Hello 👋 How can I help you today?
            </div>

            <div className={styles.msgRight}>
              I need help with my order
            </div>

            <div className={styles.msgLeft}>
              Sure 🙂 Please share your order ID
            </div>
          </div>

          <div className={styles.chatInput}>
            <input type="text" placeholder="Type your message..." />
            <button>Send</button>
          </div>
        </div>
      </div>
    </>
  );
}
