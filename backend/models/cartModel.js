const mongoose = require("mongoose")

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [
      {
        id: { type: Number, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        image: { type: String },
        selectedSize: { type: String },
        selectedColor: { type: String },
        category: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  },
)

const Cart = mongoose.model("Cart", cartSchema)

module.exports = Cart
