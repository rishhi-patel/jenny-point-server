const asyncHandler = require("express-async-handler");
const {
  createSuccessResponse,
  getCartDetails,
  checkUserAccess,
} = require("../utils/utils");
const generateToken = require("../utils/generateToken");
const User = require("../models/userModel");
const { sendOtpToMobile, generateOTP } = require("../utils/smsService");

// @desc    Auth user & get OTP
// @route   POST /api/user/admin/generate-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
  const { mobileNo } = req.body;
  let existUser = null;
  const otp = generateOTP();
  existUser = await User.findOneAndUpdate({ mobileNo }, { otp }, { new: true });

  if (!existUser) {
    existUser = await User.create({
      mobileNo,
      otp,
    });
  }
  if (existUser && !existUser.isBlocked) {
    await sendOtpToMobile(mobileNo, otp);
    createSuccessResponse(res, null, 200, "OTP sent");
  } else {
    res.status(400);
    throw new Error("User Blocked");
  }
});

// @desc    Auth user & get OTP
// @route   POST /api/admin/login
// @access  Public
const adminLogin = asyncHandler(async (req, res) => {
  const { mobileNo } = req.body;
  let existUser = null;
  const otp = generateOTP();
  existUser = await User.findOne({ mobileNo }).maxTimeMS(30000);
  if (existUser && existUser.userType === "admin") {
    await User.findOneAndUpdate({ mobileNo }, { otp }, { new: true });
    await sendOtpToMobile(mobileNo, otp);
    createSuccessResponse(res, null, 200, "OTP sent");
  } else {
    res.status(400);
    throw new Error("Not Authorized as Admin");
  }
});

// @desc    Auth user & get OTP
// @route   POST /api/teams/login
// @access  Public
const teamsLogin = asyncHandler(async (req, res) => {
  const { mobileNo } = req.body;
  let existUser = null;
  const otp = generateOTP();
  existUser = await User.findOne({ mobileNo });
  if (
    existUser &&
    ["distributor", "deliveryPerson", "wareHouseManager", "admin"].includes(
      existUser.userType
    )
  ) {
    if (!existUser.isBlocked) {
      await User.findOneAndUpdate({ mobileNo }, { otp }, { new: true });
      await sendOtpToMobile(mobileNo, otp);
      createSuccessResponse(res, null, 200, "OTP sent");
    } else {
      res.status(400);
      throw new Error("User Blocked");
    }
  } else {
    res.status(400);
    throw new Error("User Not Authorized");
  }
});

// @desc    verify OTP
// @route   POST /api/user/admin/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { mobileNo, otp, fcmToken } = req.body;
  const existUser = await User.findOne({ mobileNo }).select(["-password"]);

  if (existUser && existUser.otp === otp) {
    existUser.otp = null;
    if (fcmToken) existUser.fcmToken = fcmToken;
    await existUser.save();
    createSuccessResponse(
      res,
      {
        type: existUser.userType,
        token: generateToken(existUser._id),
      },
      200,
      "OTP verified  "
    );
  } else {
    res.status(400);
    throw new Error("Invalid OTP");
  }
});

// @desc    Auth user & get OTP
// @route   POST /api/admin/login
// @access  Public
const createUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { userType, mobileNo } = req.body;
  const existUser = await User.findOne({ mobileNo });
  if (!existUser) {
    checkUserAccess(res, req.user.userType, userType);
    const newUser = await User.create({
      ...req.body,
      user: _id,
    });
    createSuccessResponse(res, newUser, 200, `${userType} Added`);
  } else {
    res.status(400);
    throw new Error("Mobile Number Already In Use");
  }
});

// @desc    auth user
// @route   GET /api/user/profile
// @access  Protected
const getUserDetails = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id).select("-otp");
  if (user) {
    createSuccessResponse(res, user);
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

// @desc    auth user
// @route   POST /api/user/profile
// @access  Protected
const updateUserProfile = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const existUser = await User.findOne({ _id });

  if (existUser) {
    const updatedUser = await User.findOneAndUpdate(
      {
        _id,
      },

      { ...req.body },
      { new: true }
    );

    createSuccessResponse(res, updatedUser, 200, "Profile Updated");
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

// @desc   get users
// @route   GET /api/user/
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  const { userType } = req.query;
  const { _id } = req.user;
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
            address: {
              $regex: req.query.keyword,
              $options: "i",
            },
          },
          {
            gstNo: {
              $regex: req.query.keyword,
              $options: "i",
            },
          },
        ],
      }
    : {};

  keyword = ["wareHouseManager", "deliveryPerson"].includes(userType)
    ? { ...keyword, user: _id }
    : { ...keyword };

  if (userType) {
    const users = await User.find({ ...keyword, userType })
      .select("-otp")
      .sort({
        createdAt: -1,
      });
    if (users) {
      createSuccessResponse(res, users, 200);
    } else {
      res.status(400);
      throw new Error("users Not Found");
    }
  } else {
    res.status(400);
    throw new Error("Please Mention User Type");
  }
});

// @desc   get users
// @route   GET /api/user/
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const user = await User.findOne({ _id }).select("-otp");
  if (user) {
    createSuccessResponse(res, user, 200);
  } else {
    res.status(400);
    throw new Error("users Not Found");
  }
});

// @desc  update user
// @route   UPDATE /api/user/:_ic
// @access  public
const updateUserDetails = asyncHandler(async (req, res) => {
  const { userType } = req.user;
  const { _id } = req.params;
  const existUser = await User.findOne({ _id }).select("-otp");

  if (existUser) {
    checkUserAccess(res, userType, existUser.userType);
    const updatedUser = await User.findOneAndUpdate(
      {
        _id,
      },
      { ...req.body },
      { new: true }
    );
    createSuccessResponse(res, updatedUser, 200, "User Details Updated");
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

// @desc  update user
// @route   PATCH /api/user/:_ic
// @access  public
const blockUnBlockUser = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const { isBlocked } = req.body;
  const { userType } = req.user;
  const existUser = await User.findOne({ _id });

  if (existUser) {
    checkUserAccess(res, userType, existUser.userType);
    const updatedUser = await User.findOneAndUpdate(
      {
        _id,
      },
      { isBlocked },
      { new: true }
    );
    if (isBlocked) createSuccessResponse(res, updatedUser, 200, "User Blocked");
    else createSuccessResponse(res, updatedUser, 200, "User Unblocked");
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

// @desc  delete account
// @route   DELETE /api/user
// @access  private
const deleteUserAccount = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const { userType } = req.user;
  const existUser = await User.findOne({ _id }).lean();
  const targetUser = existUser.userType;

  if (existUser) {
    checkUserAccess(res, userType, targetUser);
    await User.findOneAndDelete({ _id });
    const updated = await User.find({ userType: targetUser });
    createSuccessResponse(res, updated, 200, "Account Deleted");
  } else {
    res.status(400);
    throw new Error("User Not Found");
  }
});

// @desc  delete account
// @route   DELETE /api/user
// @access  private
const deleteAccount = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  await User.findOneAndDelete({ _id });
  createSuccessResponse(res, null, 200, "Account Deleted");
});

// @desc  delete account
// @route   DELETE /api/user
// @access  private
const getUserCartDetails = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const cart = await getCartDetails(_id);
  createSuccessResponse(res, cart, 200, "Product Added To Cart");
});

// @desc add to cart
// @route   POST /api/user/cart/:id
// @access  privatex
const addProductToCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  const { qty } = req.body;

  const alreadyInCart = await User.findOne({ _id, "cart.products.id": id });
  if (alreadyInCart) {
    await User.findOneAndUpdate(
      { _id, "cart.products.id": id },
      { $set: { "cart.products.$": { id, qty } } },
      { upsert: true, new: true }
    );
  } else {
    await User.findOneAndUpdate(
      { _id },
      { $push: { "cart.products": { id, qty } } }
    );
  }
  const cart = await getCartDetails(_id);
  createSuccessResponse(res, cart, 200, "Product Added To Cart");
});

// @desc add to cart
// @route   POST /api/user/cart/:id
// @access  privatex
const removeProductFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;

  await User.findOneAndUpdate(
    { _id, "cart.products.id": id },
    { $pull: { "cart.products": { id } } },
    { new: true }
  );
  const cart = await getCartDetails(_id);
  createSuccessResponse(res, cart, 200, "Product Removed From Cart");
});
module.exports = {
  updateUserProfile,
  getUserDetails,
  getUserById,
  sendOTP,
  verifyOTP,
  updateUserDetails,
  blockUnBlockUser,
  deleteUserAccount,
  addProductToCart,
  removeProductFromCart,
  getUserCartDetails,
  getUsers,
  adminLogin,
  teamsLogin,
  createUser,
  deleteAccount,
};
