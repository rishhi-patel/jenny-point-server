const mongoose = require("mongoose")

const statusSchema = mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "Order Placed",
        "In Process",
        "In Packaging",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Placed",
    },
  },
  {
    timestamps: true,
  }
)

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deliveryPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    wareHouseManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderItems: [
      {
        name: { type: String, required: true },
        images: [],
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      type: String,
      required: true,
    },
    orderTrack: [statusSchema],
    currentOrderStatus: statusSchema,
    totalPrice: { type: Number, required: true },
    totalQty: { type: Number, required: true },
    invoice: {
      url: { type: String, default: "" },
      key: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
)

const Order = mongoose.model("Order", orderSchema)

module.exports = Order
