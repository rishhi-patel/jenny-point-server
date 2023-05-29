const asyncHandler = require("express-async-handler")
const { createSuccessResponse } = require("../utils/utils")
const Offer = require("../models/offerModal")

// @desc    Create Offer
// @route   GET /api/offer
// @access  Private
const getOffers = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {}

  const data = await Offer.find({ ...keyword }).sort({
    createdAt: -1,
  })
  createSuccessResponse(res, data, 200)
})

// @desc    Create Offer
// @route   POST /api/offer
// @access  Private
const createOffer = asyncHandler(async (req, res) => {
  const data = await Offer.create({ ...req.body })
  if (data) createSuccessResponse(res, data, 200, "Offer Added")
  else {
    res.status(400)
    throw new Error("Something Went Wrong")
  }
})

// @desc    Update Offer
// @route   POST /api/offer/:_id
// @access  Private
const updateOffer = asyncHandler(async (req, res) => {
  const { _id } = req.params
  await Offer.findOneAndUpdate({ _id }, { ...req.body }, { new: true })
  const data = await Offer.find({}).sort({
    createdAt: -1,
  })
  createSuccessResponse(res, data, 200, "Offer Updated")
})

// @desc    Delete Offer
// @route   GET /api/offer/:_id
// @access  Private
const deleteOffer = asyncHandler(async (req, res) => {
  const { _id } = req.params
  await Offer.findOneAndDelete({ _id })
  const data = await Offer.find({}).sort({
    createdAt: -1,
  })
  createSuccessResponse(res, data, 200, "Offer Deleted")
})

// @desc    GET Offer bt ID
// @route   GET /api/offer/:_id
// @access  Private
const getOfferById = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const data = await Offer.findOne({ _id })
  if (data) {
    createSuccessResponse(res, data, 200, "Offer Deleted")
  } else {
    res.status(400)
    throw new Error("Offer Not Found")
  }
})

module.exports = {
  createOffer,
  getOffers,
  updateOffer,
  deleteOffer,
  getOfferById,
}
