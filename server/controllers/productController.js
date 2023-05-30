const asyncHandler = require("express-async-handler")
const Product = require("../models/productModal.js")
const ObjectId = require("mongoose").Types.ObjectId
const { createSuccessResponse } = require("../utils/utils.js")
const awsService = require("../utils/aws.js")
const Brand = require("../models/brandModal.js")

// @desc  Get Products
// @route   GET /api/products
// @access  Private/Admin
const getProducts = asyncHandler(async (req, res) => {
  const { brand, category, subCategory } = req.query
  let products = []

  let keyword = req.query.keyword
    ? [
        {
          $match: {
            name: {
              $regex: req.query.keyword,
              $options: "i",
            },
          },
        },
      ]
    : [
        { $match: { name: { $exists: true } } },
        {
          $addFields: {
            price: {
              $subtract: ["$price", "$discount"],
            },
          },
        },
      ]

  // filter based on brand
  if (brand) {
    if (Array.isArray(brand))
      keyword.push({ $match: { brand: { $in: brand } } })
    else keyword.push({ $match: { brand: { $in: brand.split(";") } } })
  }
  if (category) {
    if (Array.isArray(category))
      keyword.push({ $match: { category: { $in: category } } })
    else keyword.push({ $match: { category: { $in: category.split(";") } } })
  }
  if (subCategory) {
    if (Array.isArray(subCategory))
      keyword.push({ $match: { subCategory: { $in: subCategory } } })
    else
      keyword.push({ $match: { subCategory: { $in: subCategory.split(";") } } })
  }

  products = await Product.aggregate(keyword)

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
    createSuccessResponse(res, createdprodut, 200, "Product Created")
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
    const product = await Product.findOne({ _id }).lean()
    if (req.user) {
      product.cart = req.user.cart.products.find(
        (p) => p.id.toString() === _id.toString()
      )
        ? 1
        : 0
    } else product.cart = 0
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

// @desc    upload product image
// @route   POST /api/products/upload
// @access  Private/Admin
const getHomeScreenData = asyncHandler(async (req, res) => {
  const { brand } = req.query
  let keyword = req.query.keyword
    ? {
        $or: [
          {
            name: {
              $regex: req.query.keyword,
              $options: "i",
            },
          },
          {
            productCode: {
              $regex: req.query.keyword,
              $options: "i",
            },
          },
        ],
      }
    : {}
  if (brand) {
    if (Array.isArray(brand)) keyword = { ...keyword, brand: { $in: brand } }
    else keyword = { ...keyword, brand: { $in: brand.split(";") } }
  }
  const brands = await Brand.find({}).select("name")
  const products = await Product.find({ ...keyword })
  createSuccessResponse(res, { brands, products }, 200)
})

// @desc    upload product image
// @route   POST /api/products/upload
// @access  Private/Admin
const uploadImgToS3 = asyncHandler(async (req, res) => {
  if (req.file) {
    const result = await awsService.uploadFile(req)
    if (result) {
      createSuccessResponse(res, result, 201)
    } else {
      res.status(400)
      throw new Error("something went Wrong")
    }
  } else {
    res.status(400)
    throw new Error("Invalid Image Type")
  }
})

// @desc    Delete product image
// @route   PUT /api/products/upload
// @access  Private/Admin
const deleteImage = asyncHandler(async (req, res) => {
  const { key } = req.params
  if (key) {
    await awsService.deleteFile(key)
    createSuccessResponse(res, null, 200, "Image Removed")
  } else {
    res.status(400)
    throw new Error("Please Provide a key")
  }
})

module.exports = {
  createProduct,
  updateProduct,
  getProducts,
  deleteProduct,
  getProductById,
  uploadImgToS3,
  deleteImage,
  getHomeScreenData,
}
