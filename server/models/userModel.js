const mongoose = require("mongoose")

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: "Jennypoint User",
    },
    email: {
      type: String,
    },
    wareHouseName: {
      type: String,
    },
    userType: {
      type: String,
      enum: [
        "admin",
        "customer",
        "distributor",
        "deliveryPerson",
        "wareHouseManager",
      ],
      default: "customer",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    mobileNo: { type: Number, required: true },
    gstNo: { type: String },
    otp: {
      type: Number,
      default: null,
    },
    address: { type: String, default: "" },
    cart: {
      products: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          qty: {
            type: Number,
            default: null,
          },
        },
      ],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fcmToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model("User", userSchema)

module.exports = User
