const mongoose = require("mongoose")

const subCategory = mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

const categorySchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    subCategory: [subCategory],
    image: {
      url: { type: String, required: true },
      key: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
)

const Category = mongoose.model("Category", categorySchema)

module.exports = Category
