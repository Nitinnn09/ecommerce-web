import mongoose, { Schema, models } from "mongoose";

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],

    // ✅ SHIPPING OBJECT (IMPORTANT)
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

    status: { type: String, default: "processing" },
  },
  { timestamps: true }
);

export default models.Order || mongoose.model("Order", OrderSchema);
