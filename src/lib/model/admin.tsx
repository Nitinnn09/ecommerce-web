import mongoose from "mongoose";
import type { Types } from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    gstNo: {
      type: String,
      required: true,
      trim: true,
    },
    businessProof: {
      type: String, // url (ex: /uploads/...)
      required: true,
      trim: true,
    },
    avatar: {
      type: String, // url (ex: /uploads/...)
      default: "",
      trim: true,
    },
    businessName: {
      type: String,
      default: "",
      trim: true,
    },
    businessDescription: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "active",
      index: true,
    },
    approvalTokenHash: {
      type: String,
      default: "",
      index: true,
    },
    approvalTokenExpiresAt: {
      type: Date,
      default: null,
    },
    resetTokenHash: {
      type: String,
      default: "",
      index: true,
    },
    resetTokenExpiresAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

// In Next.js dev/HMR, mongoose model can be cached with an older schema.
// If schema changes (e.g. new fields like avatar), recreate the model.
const Existing = mongoose.models.Admin as any | undefined;
if (Existing) {
  const hasAvatar = Boolean(Existing.schema?.path?.("avatar"));
  const hasBusinessName = Boolean(Existing.schema?.path?.("businessName"));
  const hasBusinessDescription = Boolean(Existing.schema?.path?.("businessDescription"));
  if (!hasAvatar || !hasBusinessName || !hasBusinessDescription) {
    delete (mongoose.models as any).Admin;
  }
}

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
