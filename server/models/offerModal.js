const mongoose = require("mongoose")

const offerSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    image: {},
    validTill: { type: String, required: true },
    value: { type: String, required: true },
    description: { type: String, required: true },
    offerType: {
      type: String,
      enum: ["brand", "category", "products"],
      required: true,
    },
    discountValue: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

const Offer = mongoose.model("Offer", offerSchema)
module.exports = Offer
