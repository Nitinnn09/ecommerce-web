"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../../css/adminaccount.module.css";

type AdminMe = {
  id: string;
  email: string;
  username: string;
  gstNo: string;
  businessProof: string;
  avatar: string;
  businessName: string;
  businessDescription: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string | null;
};

export default function AdminAccountPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [admin, setAdmin] = useState<AdminMe | null>(null);
  const [editing, setEditing] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    username: "",
    gstNo: "",
    businessName: "",
    businessDescription: "",
    phone: "",
    address: "",
  });

  const statusClass = useMemo(() => {
    const s = String(admin?.status || "");
    if (s === "active") return styles.pillActive;
    if (s === "rejected") return styles.pillRejected;
    return styles.pillPending;
  }, [admin?.status]);

  const avatarSrc = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile);
    return admin?.avatar || "/user.png";
  }, [admin?.avatar, avatarFile]);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/me", { cache: "no-store" });
      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        setAdmin(null);
        setError(data?.message || "Failed to load admin account");
        return;
      }

      const a = data?.admin as AdminMe;
      setAdmin(a);
      setForm({
        username: a?.username || "",
        gstNo: a?.gstNo || "",
        businessName: a?.businessName || "",
        businessDescription: a?.businessDescription || "",
        phone: a?.phone || "",
        address: a?.address || "",
      });
    } catch (e: any) {
      setError(e?.message || "Failed to load admin account");
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarFile) URL.revokeObjectURL(avatarSrc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarFile]);

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error(data?.error || data?.message || "Upload failed");
    if (!data?.url) throw new Error("Upload API did not return url");
    return String(data.url);
  };

  const save = async () => {
    if (!admin) return;

    try {
      setSaving(true);
      setError("");

      const payload: any = {
        username: form.username,
        gstNo: form.gstNo,
        businessName: form.businessName,
        businessDescription: form.businessDescription,
        phone: form.phone,
        address: form.address,
      };

      if (avatarFile) payload.avatar = await uploadFile(avatarFile);
      if (proofFile) payload.businessProof = await uploadFile(proofFile);

      const res = await fetch("/api/admin/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        setError(data?.message || "Failed to update profile");
        return;
      }

      setAdmin(data?.admin || admin);
      setAvatarFile(null);
      setProofFile(null);
      setEditing(false);
      window.dispatchEvent(new Event("admin-updated"));
      alert(data?.message || "Profile updated");
    } catch (e: any) {
      setError(String(e?.message || e || "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.page}>Loading...</div>;

  if (!admin) {
    return (
      <div className={styles.page}>
        <div className={styles.errorBox}>{error || "Not logged in"}</div>
        <div style={{ marginTop: 10 }}>
          <Link className={styles.link} href="/admin/register">
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Profile</h1>
          <p className={styles.subTitle}>Update your photo, business details and verification info</p>
        </div>

        <div className={styles.actions}>
          {!editing ? (
            <button className={`${styles.btn} ${styles.primary}`} type="button" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          ) : (
            <>
              <button className={`${styles.btn} ${styles.primary}`} type="button" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                className={`${styles.btn} ${styles.danger}`}
                type="button"
                onClick={() => {
                  setEditing(false);
                  setAvatarFile(null);
                  setProofFile(null);
                  setForm({
                    username: admin.username || "",
                    gstNo: admin.gstNo || "",
                    businessName: admin.businessName || "",
                    businessDescription: admin.businessDescription || "",
                    phone: admin.phone || "",
                    address: admin.address || "",
                  });
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {error ? <div className={styles.errorBox}>{error}</div> : null}

      <div className={styles.grid}>
        <section className={styles.card}>
          <div className={styles.profileTop}>
            <img key={avatarSrc} className={styles.avatar} src={avatarSrc} alt="Admin avatar" />
            <div>
              <h2 className={styles.name}>{admin.username || "Admin"}</h2>
              <p className={styles.email}>{admin.email}</p>
            </div>
          </div>

          <div className={styles.pillRow}>
            <span className={`${styles.pill} ${statusClass}`}>Status: {admin.status}</span>
            <span className={styles.pill}>GST: {admin.gstNo || "-"}</span>
          </div>

          <div style={{ marginTop: 12 }}>
            <p className={styles.hint}>
              Created:{" "}
              <b>{admin.createdAt ? new Date(admin.createdAt).toLocaleString() : "-"}</b>
            </p>
          </div>

          {editing ? (
            <div style={{ marginTop: 14 }}>
              <div className={styles.sectionTitle}>Profile Photo</div>
              <p className={styles.hint}>Upload a square image for best result.</p>
              <input
                className={styles.input}
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                disabled={saving}
              />
            </div>
          ) : null}
        </section>

        <section className={styles.card}>
          <h3 className={styles.sectionTitle}>Business Details</h3>

          <div className={styles.form}>
            <div className={styles.field}>
              <div className={styles.label}>Username</div>
              <input
                className={styles.input}
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                disabled={!editing || saving}
                placeholder="Your display name"
              />
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Business Name</div>
              <input
                className={styles.input}
                value={form.businessName}
                onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                disabled={!editing || saving}
                placeholder="Company name"
              />
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Business Description</div>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                value={form.businessDescription}
                onChange={(e) => setForm((p) => ({ ...p, businessDescription: e.target.value }))}
                disabled={!editing || saving}
                placeholder="About your company / business"
              />
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Phone</div>
              <input
                className={styles.input}
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                disabled={!editing || saving}
                placeholder="Mobile number"
              />
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Address</div>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                disabled={!editing || saving}
                placeholder="Business address"
              />
            </div>

            <div className={styles.field}>
              <div className={styles.label}>GST No</div>
              <input
                className={styles.input}
                value={form.gstNo}
                onChange={(e) => setForm((p) => ({ ...p, gstNo: e.target.value }))}
                disabled={!editing || saving}
                placeholder="15 characters"
              />
              <p className={styles.hint}>GST update karoge to 15 characters hona zaroori hai.</p>
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Business Proof</div>
              {admin.businessProof ? (
                <a className={styles.link} href={admin.businessProof} target="_blank" rel="noreferrer">
                  View current proof
                </a>
              ) : (
                <p className={styles.hint}>No proof uploaded</p>
              )}

              {editing ? (
                <>
                  <p className={styles.hint}>Replace proof (optional):</p>
                  <input
                    className={styles.input}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    disabled={saving}
                  />
                </>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
