const asyncHandler = require("express-async-handler")
const Product = require("../models/productModal.js")
const ObjectId = require("mongoose").Types.ObjectId
const { createSuccessResponse } = require("../utils/utils.js")

// @desc  Get Products
// @route   GET /api/products
// @access  Private/Admin
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 })

  if (products) {
    createSuccessResponse(res, products, 200)
  } else {
    res.status(400)
    throw new Error("something went wrong")
  }
})
// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { _id } = req.user

  // changes below are temporary needs to fix  later
  const newProduct = new Product({ ...req.body, createdBy: _id })
  const createdprodut = await newProduct.save()
  if (createdprodut) {
    createSuccessResponse(res, createdprodut, 201, "Product Created")
  } else {
    res.status(400)
    throw new Error("something went wrong")
  }
})

// @desc    Update a product
// @route   POST /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { _id } = req.params

  if (ObjectId.isValid(_id)) {
    await Product.findOneAndUpdate({ _id }, { ...req.body })
    const products = await Product.find({}).sort({ createdAt: -1 })

    if (products) {
      createSuccessResponse(res, products, 200, "Product Updated")
    } else {
      res.status(400)
      throw new Error("something went wrong")
    }
  } else {
    res.status(400)
    throw new Error("Invalid Product ID")
  }
})

// @desc    Delete a product
// @route   Delete /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const { _id } = req.params

  if (ObjectId.isValid(_id)) {
    await Product.findOneAndDelete({ _id })
    const products = await Product.find({}).sort({ createdAt: -1 })
    if (products) {
      createSuccessResponse(res, products, 200, "Product Deleted")
    } else {
      res.status(400)
      throw new Error("something went wrong")
    }
  } else {
    res.status(400)
    throw new Error("Invalid Product ID")
  }
})
// @desc    GET a product
// @route   GET /api/products/:id
// @access  Private/Admin
const getProductById = asyncHandler(async (req, res) => {
  const { _id } = req.params

  if (ObjectId.isValid(_id)) {
    const product = await Product.findOne({ _id })
    if (product) {
      createSuccessResponse(res, product, 200)
    } else {
      res.status(400)
      throw new Error("Product Not Found")
    }
  } else {
    res.status(400)
    throw new Error("Invalid Product ID")
  }
})

module.exports = {
  createProduct,
  updateProduct,
  getProducts,
  deleteProduct,
  getProductById,
}
