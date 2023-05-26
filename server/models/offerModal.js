const mongoose = require("mongoose")

const offerSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      mobileImage: { type: String, required: true },
    },
    validTill: { type: String, required: true },
    discountType: {},
    value: { type: String, required: true },
    description: { type: String, required: true },
    offerType: {
      type: String,
      enum: ["brand", "category", "products"],
    },
    discountValue: { type: String, required: true },
    key: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

const Offer = mongoose.model("Offer", offerSchema)
module.exports = Offer
