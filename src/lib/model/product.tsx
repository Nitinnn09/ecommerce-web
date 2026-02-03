import mongoose, { Schema, models } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    discount: { type: String },
    image: { type: String, required: true }, // store image url or /uploads/...
    desc: { type: String },
    bullets: [{ type: String }],
    category: { type: String, default: "general" },
    stock: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default models.Product || mongoose.model("Product", ProductSchema);
