const mongoose = require("mongoose")

const addressSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    addressType: {
      type: String,
      required: true,
      enum: ["home", "office", "other"],
    },
    shippingAddress: {
      firstName: { type: String },
      lastName: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      pinCode: { type: Number },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      phoneNo: { type: Number },
    },
    billingAddress: {
      firstName: { type: String },
      lastName: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      pinCode: { type: Number },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      phoneNo: { type: Number },
    },
  },
  {
    timestamps: true,
  }
)

const Address = mongoose.model("Address", addressSchema)

module.exports = Address
