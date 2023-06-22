const mongoose = require("mongoose")

const productSchema = mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    images: [],
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: { type: mongoose.Schema.Types.ObjectId, required: true },
    description: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    productCode: { type: String, default: null },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    minQuantity: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
)

const Product = mongoose.model("Product", productSchema)

module.exports = Product
