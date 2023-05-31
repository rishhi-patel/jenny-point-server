const asyncHandler = require("express-async-handler")
const Brand = require("../models/brandModal")
const awsService = require("../utils/aws")
const { createSuccessResponse } = require("../utils/utils")

// @desc    Fetch all products
// @route   GET /api/brand
// @access  Private
const getBrand = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {}

  const data = await Brand.find({ ...keyword }).sort({
    createdAt: -1,
  })
  createSuccessResponse(res, data, 200)
})

// @desc    Fetch all products
// @route   POST /api/brand
// @access  Private

const createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body
  const result = await Brand.findOne({ name })
  if (result) {
    res.status(400)
    throw new Error(`Brand already exist`)
  } else {
    if (req.file) {
      const result = await awsService.uploadFile(req)
      const brand = new Brand({
        name,
        image: result,
      })
      const createdbrand = await brand.save()
      createSuccessResponse(res, createdbrand, 200, "Brand Created")
    } else {
      res.status(400)
      throw new Error(`Image is required`)
    }
    // const presigned = await awsService.getPreSignedURL(result.Key)
  }
})

// @desc    Fetch all products
// @route   PUT /api/brand/:id
// @access  Private
const updateBrand = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const { name } = req.body

  const result = await Brand.findById({ _id })
  if (result) {
    if (name) {
      if (req.file) {
        const img = await awsService.uploadFile(req)
        result.image = img
      }
      result.name = name
      await result.save()
      const updatedBrands = await Brand.find({}).sort({
        createdAt: -1,
      })
      createSuccessResponse(res, updatedBrands, 200, "Brand Updated")
    } else {
      res.status(400)
      throw new Error(`Name Is Required`)
    }
  } else {
    res.status(404)
    throw new Error(`No Brand found`)
  }
})

// @desc    Fetch all products
// @route   delete /api/brand/:id
// @access  Private
const deleteBrand = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const result = await Brand.findOne({ _id })
  if (result) {
    await result.remove()
    const updatedBrands = await Brand.find({}).sort({
      createdAt: -1,
    })
    createSuccessResponse(res, updatedBrands, 200, "Brand Updated")
  } else {
    res.status(404)
    throw new Error(`No Brand found`)
  }
})

module.exports = {
  getBrand,
  updateBrand,
  deleteBrand,
  createBrand,
}
