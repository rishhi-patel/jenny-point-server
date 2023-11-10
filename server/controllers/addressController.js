const asyncHandler = require("express-async-handler")
var zipcodes = require("india-pincode-lookup")
const Address = require("../models/addressModal")
const { createSuccessResponse } = require("../utils/utils")

// @desc    add Address
// @route   POST /api/address
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { shippingAddress, billingAddress, addressType } = req.body

  if (_id) {
    const newAddress = new Address({
      addressType,
      shippingAddress,
      billingAddress,
      user: _id,
    })
    const response = await newAddress.save()
    createSuccessResponse(res, response, 201)
  } else {
    res.status(400)
    throw new Error(`user not found`)
  }
})

// @desc    get Address
// @route   GET /api/address
// @access  Private
const getUserAddresses = asyncHandler(async (req, res) => {
  const { _id } = req.user

  if (req.user) {
    const response = await Address.find({ user: _id }).sort({ updatedAt: -1 })
    if (response && response.length) {
      createSuccessResponse(res, response, 200)
    } else {
      res.status(404)
      throw new Error("No address found")
    }
  } else {
    res.status(400)
    throw new Error(`user not found`)
  }
})

// @desc    get AddressById
// @route   GET /api/address/:id
// @access  Private

const getAddAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const address = await Address.findById(id)
  if (address) {
    createSuccessResponse(res, address, 200)
  } else {
    res.status(404)
    throw new Error("Address not found")
  }
})

// @desc    update updateAddress
// @route   PUT /api/address/:id
// @access  Private

const updateAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const newAddress = await Address.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  })
  if (newAddress) {
    createSuccessResponse(res, newAddress, 200)
  } else {
    res.status(404)
    throw new Error("Address not found")
  }
})

// @desc    Delete Address
// @route   Delete /api/address/:id
// @access  Private
const deleteAddressById = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { _id } = req.user

  await Address.findOneAndDelete({ _id: id })
  const newAddress = await Address.find({ user: _id }).sort({ updatedAt: -1 })
  if (newAddress) {
    res.status(200)
    createSuccessResponse(res, newAddress, 200, "address deleted successfully")
  } else {
    res.status(404)
    throw new Error("Address not found")
  }
})
const getAreaDetailsFromPinCode = asyncHandler(async (req, res) => {
  const { code } = req.params

  var area = zipcodes.lookup(code)

  if (area.length)
    res
      .status(200)
      .json({ success: true, data: { ...area[0], country: "India" } })
  else {
    res.status(400).json({
      success: false,
      data: {
        officeName: null,
        pincode: code,
        taluk: null,
        districtName: null,
        stateName: null,
        country: null,
      },
    })
  }
})

module.exports = {
  addAddress,
  getUserAddresses,
  getAddAddressById,
  updateAddressById,
  deleteAddressById,
  getAreaDetailsFromPinCode,
}
