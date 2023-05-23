const asyncHandler = require("express-async-handler")
const {
  createSuccessResponse,
  getCartDetails,
  checkUserAccess,
} = require("../utils/utils")
const generateToken = require("../utils/generateToken")
const User = require("../models/userModel")

// @desc    Auth user & get OTP
// @route   POST /api/user/admin/generate-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
  const { mobileNo } = req.body
  let existUser = null
  const otp = 987654
  existUser = await User.findOneAndUpdate({ mobileNo }, { otp }, { new: true })

  if (!existUser) {
    existUser = await User.create({
      mobileNo,
      otp,
    })
  }
  if (existUser && !existUser.isBlocked) {
    createSuccessResponse(res, otp, 200, "OTP sent")
  } else {
    res.status(400)
    throw new Error("User Blocked")
  }
})

// @desc    verify OTP
// @route   POST /api/user/admin/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { mobileNo, otp } = req.body
  const existUser = await User.findOne({ mobileNo }).select(["-password"])

  if (existUser && existUser.otp === otp) {
    existUser.otp = null
    await existUser.save()
    createSuccessResponse(
      res,
      {
        token: generateToken(existUser._id),
      },
      200,
      "OTP verified  "
    )
  } else {
    res.status(400)
    throw new Error("Invalid OTP")
  }
})

// @desc    auth user
// @route   GET /api/user/profile
// @access  Protected
const getUserDetails = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const user = await User.findById(_id).select("-otp")
  if (user) {
    createSuccessResponse(res, user)
  } else {
    res.status(400)
    throw new Error("User Not Found")
  }
})

// @desc    auth user
// @route   POST /api/user/profile
// @access  Protected
const updateUserProfile = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const existUser = await User.findOne({ _id })

  if (existUser) {
    const updatedUser = await User.findOneAndUpdate(
      {
        _id,
      },

      { ...req.body },
      { new: true }
    )

    createSuccessResponse(res, updatedUser, 200, "User Details Updated")
  } else {
    res.status(400)
    throw new Error("User Not Found")
  }
})

// @desc   get customers
// @route   GET /api/user/
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
  const { userType } = req.query
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {}
  if (userType) {
    const customers = await User.find({ ...keyword, userType })
      .select("-otp")
      .sort({
        createdAt: -1,
      })
    if (customers) {
      createSuccessResponse(res, customers, 200)
    } else {
      res.status(400)
      throw new Error("customers Not Found")
    }
  } else {
    res.status(400)
    throw new Error("Please Mention User Type")
  }
})

// @desc   get customers
// @route   GET /api/user/
// @access  Private
const getCustomerById = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const customer = await User.findOne({ _id }).select("-otp")
  if (customer) {
    createSuccessResponse(res, customer, 200)
  } else {
    res.status(400)
    throw new Error("customers Not Found")
  }
})

// @desc  update customer
// @route   UPDATE /api/customer/:_ic
// @access  public
const updateCustomerDetails = asyncHandler(async (req, res) => {
  const { userType } = req.user
  const { _id } = req.params
  const existUser = await User.findOne({ _id }).select("-otp")

  if (existUser) {
    checkUserAccess(res, userType, existUser.userType)
    const updatedUser = await User.findOneAndUpdate(
      {
        _id,
      },
      { ...req.body },
      { new: true }
    )
    createSuccessResponse(res, updatedUser, 200, "Customer Details Updated")
  } else {
    res.status(400)
    throw new Error("User Not Found")
  }
})

// @desc  update customer
// @route   PATCH /api/customer/:_ic
// @access  public
const blockUnBlockCustomer = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const { isBlocked } = req.body
  const { userType } = req.user
  const existUser = await User.findOne({ _id })

  if (existUser) {
    checkUserAccess(res, userType, existUser.userType)
    const updatedUser = await User.findOneAndUpdate(
      {
        _id,
      },
      { isBlocked },
      { new: true }
    )
    if (isBlocked)
      createSuccessResponse(res, updatedUser, 200, "Customer Blocked")
    else createSuccessResponse(res, updatedUser, 200, "Customer Unblocked")
  } else {
    res.status(400)
    throw new Error("Customer Not Found")
  }
})

// @desc  delete account
// @route   DELETE /api/user
// @access  private
const deleteUserAccount = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const { userType } = req.user
  const existUser = await User.findOne({ _id }).lean()

  if (existUser) {
    checkUserAccess(res, userType, existUser.userType)
    await User.findOneAndDelete({ _id })
    createSuccessResponse(res, null, 200, "Account Deleted")
  } else {
    res.status(400)
    throw new Error("User Not Found")
  }
})

// @desc  delete account
// @route   DELETE /api/user
// @access  private
const getUserCartDetails = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const cart = await getCartDetails(_id)
  createSuccessResponse(res, cart, 200, "Product Added To Cart")
})

// @desc add to cart
// @route   POST /api/user/cart/:id
// @access  privatex
const addProductToCart = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { id } = req.params
  const { qty } = req.body

  const alreadyInCart = await User.findOne({ _id, "cart.products.id": id })
  if (alreadyInCart) {
    await User.findOneAndUpdate(
      { _id, "cart.products.id": id },
      { $set: { "cart.products.$": { id, qty } } },
      { upsert: true, new: true }
    )
  } else {
    await User.findOneAndUpdate(
      { _id },
      { $push: { "cart.products": { id, qty } } }
    )
  }
  const cart = await getCartDetails(_id)
  createSuccessResponse(res, cart, 200, "Product Added To Cart")
})

// @desc add to cart
// @route   POST /api/user/cart/:id
// @access  privatex
const removeProductFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { id } = req.params

  await User.findOneAndUpdate(
    { _id, "cart.products.id": id },
    { $pull: { "cart.products": { id } } },
    { new: true }
  )
  const cart = await getCartDetails(_id)
  createSuccessResponse(res, cart, 200, "Product Removed From Cart")
})
module.exports = {
  updateUserProfile,
  getUserDetails,
  getCustomerById,
  sendOTP,
  verifyOTP,
  updateCustomerDetails,
  blockUnBlockCustomer,
  deleteUserAccount,
  addProductToCart,
  removeProductFromCart,
  getUserCartDetails,
  getCustomers,
}
