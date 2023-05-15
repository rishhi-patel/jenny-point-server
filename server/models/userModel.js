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
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    mobileNo: { type: Number, required: true },
    otp: {
      type: Number,
      default: null,
    },
    address: { type: String },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model("User", userSchema)

module.exports = User
