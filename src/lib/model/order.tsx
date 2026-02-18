import mongoose, { Schema, models } from "mongoose";

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    admin: { type: Schema.Types.ObjectId, ref: "Admin", default: null, index: true },
    title: { type: String, default: "" },
    image: { type: String, default: "" },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: [OrderItemSchema],

    // Optional summary fields (used in UI)
    name: { type: String, default: "" },
    address: { type: String, default: "" },
    image: { type: String, default: "" },
    productName: { type: String, default: "" },

    shipping: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
      address: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    paymentMethod: { type: String, required: true },
    shippingMethod: { type: String, required: true },

    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    status: { type: String, default: "processing", index: true },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    statusHistory: [
      {
        status: { type: String, required: true },
        at: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);

// In Next.js dev/HMR, mongoose model can be cached with an older schema.
const Existing = models.Order as any | undefined;
if (Existing) {
  const hasHistory = Boolean(Existing.schema?.path?.("statusHistory"));
  const itemSchema = Existing.schema?.path?.("items")?.schema;
  const hasTitle = Boolean(itemSchema?.path?.("title"));
  if (!hasHistory || !hasTitle) {
    delete (models as any).Order;
  }
}

export default models.Order || mongoose.model("Order", OrderSchema);

