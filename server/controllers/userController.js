const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const { createSuccessResponse } = require("../utils/utils")
const generateToken = require("../utils/generateToken")
const User = require("../models/userModel")

// @desc   auth user
// @route   POST /api/user/admin/register
// @access  Private
const registerAdmin = asyncHandler(async (req, res) => {
  const { mobileNo } = req.body

  const user = await User.findOne({ mobileNo })
  if (user) {
    res.status(400)
    throw new Error("mobileNo is already registered")
  } else {
    const newUser = await User.create({
      mobileNo,
      name: "Admin User",
      isAdmin: true,
    })

    if (newUser) {
      createSuccessResponse(
        res,
        {
          token: generateToken(newUser._id),
          user: newUser,
        },
        200,
        "Login Success"
      )
    } else {
      res.status(400)
      throw new Error("Something went Wrong")
    }
  }
})
// @desc    Auth user & get OTP
// @route   POST /api/user/admin/generate-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
  const { mobileNo } = req.body
  let existUser = null
  const otp = 987654
  existUser = await User.findOneAndUpdate({ mobileNo }, { otp }, { new: true })

  if (!existUser) {
    // create new user if not found
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
// @desc    verify Admin
// @route   POST /api/user/admin/verify-otp
// @access  Public
const verifyAdmin = asyncHandler(async (req, res) => {
  const { mobileNo, otp } = req.body
  const existUser = await User.findOne({ mobileNo }).select(["-password"])
  if (existUser && existUser.otp === otp) {
    if (existUser.isAdmin) {
      existUser.otp = null
      await existUser.save()
      createSuccessResponse(
        res,
        {
          token: generateToken(existUser._id),
        },
        200,
        "OTP verified"
      )
    } else {
      res.status(400)
      throw new Error("Not Authorized as admin")
    }
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
    console.log({ updatedUser })
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
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {}
  const customers = await User.find({ ...keyword, isAdmin: false })
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
  const { _id } = req.params
  const existUser = await User.findOne({ _id }).select("-otp")

  if (existUser) {
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
  const existUser = await User.findOne({ _id })

  if (existUser) {
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
  const { _id } = req.user
  const existUser = await User.findOne({ _id }).lean()

  if (existUser) {
    // move user to discarded
    await User.findOneAndDelete({ _id })
    createSuccessResponse(res, null, 200, "Account Deleted")
  } else {
    res.status(400)
    throw new Error("User Not Found")
  }
})

module.exports = {
  registerAdmin,
  updateUserProfile,
  getUserDetails,
  getCustomers,
  getCustomerById,
  sendOTP,
  verifyOTP,
  updateCustomerDetails,
  blockUnBlockCustomer,
  deleteUserAccount,
  verifyAdmin,
}
