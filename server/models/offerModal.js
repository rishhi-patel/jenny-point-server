const mongoose = require("mongoose")

const offerSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    image: {},
    validTill: { type: String, required: true },
    offerType: {
      type: String,
      enum: ["flat", "percentage"],
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
