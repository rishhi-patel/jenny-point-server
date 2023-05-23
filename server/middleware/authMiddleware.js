const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")
const User = require("../models/userModel.js")
const { createErrorResponse } = require("../utils/utils.js")

const protect = asyncHandler(async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select(["-password", "-otp"])
      if (!req.user) {
        res.status(401)
        throw new Error("Invalid Token")
      }
      if (req.user && req.user.isBlocked) {
        res.status(401)
        createErrorResponse(
          res,
          {
            message: "User Blocked",
          },
          400
        )
      } else {
        next()
      }
    } catch (error) {
      res.status(401)
      throw new Error("Not authorized, token failed")
    }
  }

  if (!token) {
    res.status(401)
    throw new Error("Not authorized, no token")
  }
})

const productMiddlewre = asyncHandler(async (req, res, next) => {
  // purpose of this middlware check userData in token for some pulic routes
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.id).select(["-password", "-otp"])
      next()
    } catch (error) {
      console.error(error)
      next()
    }
  } else {
    next()
  }
})

const admin = (req, res, next) => {
  if (req.user && req.user.userType === "admin") {
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as an admin")
  }
}

const distribiutor = (req, res, next) => {
  if (req.user && ["distributor", "admin"].includes(req.user.userType)) {
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as distributor")
  }
}

const deliveryPerson = (req, res, next) => {
  if (
    req.user &&
    ["deliveryPerson", "distributor", "admin"].includes(req.user.userType)
  ) {
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as Delivery Person")
  }
}
module.exports = {
  protect,
  admin,
  distribiutor,
  deliveryPerson,
  productMiddlewre,
}
