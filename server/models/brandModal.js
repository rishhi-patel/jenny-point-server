const mongoose = require("mongoose")

const brandSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { key: { type: String }, url: { type: String } },
  },
  {
    timestamps: true,
  }
)

const Brand = mongoose.model("Brand", brandSchema)

module.exports = Brand
