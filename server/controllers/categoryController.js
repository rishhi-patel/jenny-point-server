const asyncHandler = require("express-async-handler")
const Category = require("../models/categoryModal")
const awsService = require("../utils/aws")
const { createSuccessResponse } = require("../utils/utils")
const Product = require("../models/productModal")

// @desc    Fetch all Categories
// @route   GET /api/Category
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {}

  const data = await Category.find({ ...keyword }).sort({
    createdAt: -1,
  })
  createSuccessResponse(res, data)
})

// @desc    create Category
// @route   POST /api/Category
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body
  const result = await Category.findOne({ name })
  if (result) {
    res.status(400)
    throw new Error(`Category already exist`)
  } else {
    if (name) {
      if (req.file) {
        const result = await awsService.uploadFile(req)
        const newCategory = new Category({
          name,
          image: result,
        })
        const createdCategory = await newCategory.save()
        createSuccessResponse(res, createdCategory, 200, "Category Created")
      } else {
        res.status(400)
        throw new Error(`Image is required`)
      }
    } else {
      res.status(400)
      throw new Error(`Name is required`)
    }
    // const presigned = await awsService.getPreSignedURL(result.Key)
  }
})

// @desc  update Category
// @route   PUT /api/Category/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const { name } = req.body

  const result = await Category.findById({ _id })
  if (result) {
    if (name) {
      if (req.file) {
        const img = await awsService.uploadFile(req)
        result.image = img
      }
      const checkDuplicate = await Category.findOne({ name })
      if (
        checkDuplicate &&
        !Boolean(checkDuplicate._id.toString() === _id.toString())
      ) {
        res.status(400)
        throw new Error(`Category already exist`)
      }
      result.name = name
      await result.save()
      const data = await Category.find({}).sort({
        createdAt: -1,
      })
      createSuccessResponse(res, data, 200, "Category Updated")
    } else {
      res.status(404)
      throw new Error(`Name is Required`)
    }
  } else {
    res.status(404)
    throw new Error(`No Category found`)
  }
})

// @desc   delete Category
// @route   DELETE /api/Category/:id
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const result = await Category.findOne({ _id })
  if (result) {
    await result.remove()
    await Product.deleteMany({ category: _id })
    const updatedCatrgories = await Category.find({}).sort({
      createdAt: -1,
    })
    createSuccessResponse(res, updatedCatrgories, 200, "Category Deleted  ")
  } else {
    res.status(404)
    throw new Error(`No Category found`)
  }
})

// / @desc    create Sub Categry
// @route   POST /api/category/id
// @access  Private
const createSubCategory = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const { name } = req.body

  const parent = await Category.findOne({ _id })
  if (parent) {
    const createdSubCategory = await Category.findOneAndUpdate(
      { _id },
      {
        $push: {
          subCategory: {
            name,
          },
        },
      },
      {
        new: true,
      }
    )
    createSuccessResponse(res, createdSubCategory, 200, "Category Created")
  } else {
    res.status(400)
    throw new Error(`Main Category Not Exist`)
  }
})

// @desc    remove Sub Categry
// @route   DELETE /api/category/id
// @access  Private
const updateSubCategory = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const { subCategoryId } = req.query
  const { name } = req.body
  const parent = await Category.findOne({ _id })
  if (parent) {
    const updatedSubCategory = await Category.findOneAndUpdate(
      { "subCategory._id": subCategoryId },
      {
        $set: {
          "subCategory.$.name": name,
        },
      },
      {
        new: true,
      }
    )
    createSuccessResponse(res, updatedSubCategory, 200, "Category Updated")
  } else {
    res.status(400)
    throw new Error(`Main Category Not Exist`)
  }
})

// @desc    remove Sub Categry
// @route   DELETE /api/category/id
// @access  Private
const deleteSubCategory = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const { subCategoryId } = req.query
  const parent = await Category.findOne({ _id })
  if (parent) {
    const updatedSubCategory = await Category.findOneAndUpdate(
      { _id },
      {
        $pull: {
          subCategory: {
            _id: subCategoryId,
          },
        },
      },
      {
        new: true,
      }
    )
    await Product.deleteMany({ subCategory: subCategoryId })
    createSuccessResponse(res, updatedSubCategory, 200, "Category Deleted")
  } else {
    res.status(400)
    throw new Error(`Main Category Not Exist`)
  }
})

// @desc    get catego;ry details
// @route   GET /api/category/id
// @access  Private
const getCategoryById = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const parent = await Category.findOne({ _id })
  if (parent) {
    createSuccessResponse(res, parent, 200)
  } else {
    res.status(400)
    throw new Error(`Main Category Not Exist`)
  }
})

module.exports = {
  getCategories,
  updateCategory,
  deleteCategory,
  createCategory,
  createSubCategory,
  deleteSubCategory,
  updateSubCategory,
  getCategoryById,
}
