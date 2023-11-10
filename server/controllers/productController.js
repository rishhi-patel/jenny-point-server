const asyncHandler = require("express-async-handler")
const Product = require("../models/productModal.js")
const ObjectId = require("mongoose").Types.ObjectId
const {
  createSuccessResponse,
  productLookup,
  getRatingArray,
  checkWishListStatus,
} = require("../utils/utils.js")
const awsService = require("../utils/aws.js")
const Brand = require("../models/brandModel.js")
const Category = require("../models/categoryModal")
const Offer = require("../models/offerModal.js")
const { default: mongoose } = require("mongoose")

// @desc  Get Products
// @route   GET /api/products
// @access  Private/Admin
const getProducts = asyncHandler(async (req, res) => {
  const { brand, category, subCategory, sortBy, rating } = req.query
  let products = []

  let keyword = req.query.keyword
    ? [
        {
          $match: {
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
              // Add more conditions as needed
            ],
          },
        },
      ]
    : [{ $match: { name: { $exists: true } } }]

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

  // sort by rating and cost
  if (sortBy) {
    switch (sortBy) {
      case "ratingHighToLow":
        keyword.push({ $sort: { rating: -1 } })
        break
      case "ratingLowToHigh":
        keyword.push({ $sort: { rating: 1 } })
        break
      case "costHighToLow":
        keyword.push({ $sort: { price: -1 } })
        break
      case "costHighLowToHigh":
        keyword.push({ $sort: { price: 1 } })
        break
      default:
        break
    }
  }
  if (rating) {
    if (Array.isArray(rating))
      keyword.push({ $match: { rating: { $in: getRatingArray(rating) } } })
    else
      keyword.push({
        $match: { rating: { $in: getRatingArray(rating.split(";")) } },
      })
  }

  products = await Product.aggregate([...productLookup, ...keyword])

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
  const { lookup } = req.query
  const pipeline = Boolean(Number(lookup)) ? [] : productLookup
  let cart = []

  if (req.user) cart = req.user.cart.products.map((elem) => elem.id)
  if (ObjectId.isValid(_id)) {
    const product = await Product.aggregate([
      ...pipeline,
      {
        $match: { _id: ObjectId(_id) },
      }, // check product availabilty in cart
      {
        $addFields: {
          cart: {
            $cond: {
              if: { $in: [ObjectId(_id), cart] },
              then: 1,
              else: 0,
            },
          },
        },
      },
    ])

    if (product) {
      createSuccessResponse(res, product[0], 200)
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
// @desc    Get HomeScreen details
// @route   GET /api/products/
// @access  public
const getHomeScreenData = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {}
  const brands = await Brand.find({
    type: "brand",
  }).select(["image", "name", "type"])
  const category = await Category.find({
    ...keyword,
    type: "category",
  }).select(["image", "name", "type"])
  const newArrivals = await Product.find(keyword)
    .sort({ createdAt: -1 })
    .select([
      "name",
      "price",
      "mrp",
      "rating",
      "images",
      "description",
      "wishList",
      "nonVeg",
      "flavour",
    ])
    .lean()
  const trendingProducts = await Product.find({ ...keyword, isTrending: true })
    .select([
      "name",
      "price",
      "mrp",
      "rating",
      "images",
      "description",
      "wishList",
      "flavour",
      "nonVeg",
    ])
    .lean()

  createSuccessResponse(
    res,
    {
      brands,
      category,
      newArrivals: checkWishListStatus(newArrivals, req.user),
      trendingProducts: checkWishListStatus(trendingProducts, req.user),
    },
    200,
    "Product added to wishlist"
  )
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

// @desc   Add product to Wishlist
// @route  POST /api/product/wishlist/:productId
// @access Protected
const addProductToWishList = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const userId = req.user._id // Assuming this is a valid ObjectId string

  // Check for valid ObjectId for both user and product
  if (
    !mongoose.Types.ObjectId.isValid(productId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    res.status(400)
    throw new Error("Invalid product or user ID")
  }

  // Use Mongoose's `$addToSet` operator to ensure the user ID is not added more than once
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $addToSet: { wishList: userId } },
    { new: true, runValidators: true }
  )

  if (!updatedProduct) {
    res.status(404)
    throw new Error("Product not found")
  }

  // If you also keep track of user's wish lists in the User model, you may want to update that too

  // Transform the updatedProduct to add a field indicating the product is in the user's wishlist
  // This is only necessary if you plan to send back the whole product information including wishlist status
  const transformedProduct = {
    ...updatedProduct.toObject(),
    inWishlist: updatedProduct.wishList.includes(userId),
  }
  createSuccessResponse(
    res,
    transformedProduct,
    200,
    "Product added to wishlist"
  )
})

// @desc   Remove product from Wishlist
// @route  DELETE /api/product/wishlist/:productId
// @access Protected
const removeProductFromWishList = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const userId = req.user._id // Assuming this is a valid ObjectId string

  // Check for valid ObjectId for both user and product
  if (
    !mongoose.Types.ObjectId.isValid(productId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    res.status(400)
    throw new Error("Invalid product or user ID")
  }

  // Use Mongoose's `$pull` operator to remove the user ID from the product's wishlist
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $pull: { wishList: userId } },
    { new: true }
  )

  if (!updatedProduct) {
    res.status(404)
    throw new Error("Product not found")
  }

  // If you also keep track of user's wish lists in the User model, you may want to update that too
  createSuccessResponse(
    res,
    updatedProduct,
    200,
    "Product removed from wishlist"
  )
})

// @desc   Get user wishlist
// @route  GET /api/user/wishlist
// @access Protected
const getUserWishList = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const keyword = req.query.keyword

  // Construct match stage for aggregation pipeline
  let matchStage = {
    wishList: userId,
  }

  if (keyword) {
    matchStage.name = {
      $regex: keyword,
      $options: "i", // case-insensitive
    }
  }

  // Create the aggregation pipeline
  const pipeline = [
    { $match: matchStage },
    {
      $addFields: {
        inWishlist: {
          $in: [userId, "$wishList"], // Adding field to indicate the product is in wishlist
        },
      },
    },
    {
      $project: {
        wishList: 0, // Optionally remove the wishList field from the result
      },
    },
  ]

  // Execute the aggregation pipeline
  const userWishList = await Product.aggregate(pipeline)

  createSuccessResponse(res, userWishList, 200)
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
  addProductToWishList,
  removeProductFromWishList,
  removeProductFromWishList,
  getUserWishList,
}
