const asyncHandler = require("express-async-handler")
const { createSuccessResponse, getCartDetails } = require("../utils/utils")
const Order = require("../models/orderModal")
const mongoose = require("mongoose")
const User = require("../models/userModel")
const firebaseService = require("../utils/firebaseService")
const awsService = require("../utils/aws")
const { sendOtpToMobile, generateOTP } = require("../utils/smsService")
const ObjectId = mongoose.Types.ObjectId

// @desc    Fetch all orders
// @route   GET /api/order/admin
// @access  Private
const getAdminOrders = asyncHandler(async (req, res) => {
  const { status, endDate, startDate } = req.query
  let keyword = status ? { "currentOrderStatus.status": status } : {}

  const newStartDate = new Date(startDate)
  const newEndDate = new Date(endDate)
  newEndDate.setDate(newEndDate.getDate() + 1)

  if (endDate && startDate) {
    keyword = {
      ...keyword,
      createdAt: {
        $gte: newStartDate,
        $lte: newEndDate,
      },
    }
  }

  if (newStartDate.getTime() === newEndDate.getTime()) {
    keyword.createdAt.$lt = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() + 1
    )
  }

  const data = await Order.find({ ...keyword })
    .populate("distributor", ["name"])
    .populate("user", ["name"])
    .populate("wareHouseManager", ["name"])
    .populate("deliveryPerson", ["name"])
    .sort({
      createdAt: -1,
    })
  createSuccessResponse(res, data, 200)
})

// @desc    Fetch distributer orders
// @route   GET /api/order/distributor
// @access  Private
const getDistributorOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { status } = req.query
  const keyword = status
    ? { distributor: _id, "currentOrderStatus.status": status }
    : { distributor: _id }
  const data = await Order.find({ ...keyword }).sort({
    createdAt: -1,
  })
  createSuccessResponse(res, data, 200)
})

// @desc    Fetch distributer orders
// @route   GET /api/order/distributor
// @access  Private
const getDeliveryPersonOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { status } = req.query
  const keyword = status
    ? { deliveryPerson: _id, "currentOrderStatus.status": status }
    : { deliveryPerson: _id }
  const data = await Order.find({ ...keyword }).sort({
    createdAt: -1,
  })
  createSuccessResponse(res, data, 200)
})

// @desc    Fetch distributer orders
// @route   GET /api/order/distributor
// @access  Private
const getCustomerOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { status } = req.query

  const keyword = status
    ? { user: _id, "currentOrderStatus.status": status }
    : { user: _id }
  const data = await Order.find({ ...keyword }).sort({
    createdAt: -1,
  })
  createSuccessResponse(res, data, 200)
})

// @desc    Fetch distributer orders
// @route   GET /api/order/distributor
// @access  Private
const getWareHouseOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const { status } = req.query
  const keyword = status
    ? { wareHouseManager: _id, "currentOrderStatus.status": status }
    : { wareHouseManager: _id }
  const data = await Order.find({ ...keyword }).sort({
    createdAt: -1,
  })
  createSuccessResponse(res, data, 200)
})

// @desc    updateOrderbyID order By ID
// @route   PUT /api/order/:_id
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { _id, address } = req.user
  const {
    cart: { products },
  } = await getCartDetails(_id)
  if (address.trim()) {
    if (products.length) {
      await Promise.all(
        products.map(async (element) => {
          const order = new Order({
            orderItems: [element],
            totalPrice: element.qty * element.price,
            shippingAddress: address,
            orderTrack: [{ status: "Order Placed" }],
            currentOrderStatus: { status: "Order Placed" },
            totalQty: element.qty,
            user: _id,
          })
          return await order.save()
        })
      )
      // remove product from user cart
      await User.findOneAndUpdate(
        { _id },
        { "cart.products": [] },
        { new: true }
      )
      createSuccessResponse(res, null, 200, "Order Placed")
    } else {
      res.status(400)
      throw new Error("No Items In Cart")
    }
  } else {
    res.status(400)
    throw new Error("Please Add Valid Address")
  }
})

// @desc    get order By ID
// @route   GET /api/order/:_id
// @access  Private
const getOrderByID = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const data = await Order.aggregate([
    { $match: { _id: ObjectId(_id) } },
    {
      $lookup: {
        from: "users",
        let: { userId: "$user" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$userId"] },
            },
          },
          {
            $project: {
              // _id: 0,
              name: 1,
              email: 1,
              mobileNo: 1,
            },
          },
        ],
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        let: { distributorId: "$distributor" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$distributorId"] },
            },
          },
          {
            $project: {
              // _id: 0,
              name: 1,
            },
          },
        ],
        as: "distributor",
      },
    },
    {
      $unwind: {
        path: "$distributor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        distributor: {
          $ifNull: ["$distributor", {}],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { wareHouseManagerId: "$wareHouseManager" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$wareHouseManagerId"] },
            },
          },
          {
            $project: {
              // _id: 0,
              name: 1,
              mobileNo: 1,
              wareHouseName: 1,
            },
          },
        ],
        as: "wareHouseManager",
      },
    },
    {
      $unwind: {
        path: "$wareHouseManager",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        wareHouseManager: {
          $ifNull: ["$wareHouseManager", {}],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        let: { deliveryPersonId: "$deliveryPerson" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$deliveryPersonId"] },
            },
          },
          {
            $project: {
              // _id: 0
              name: 1,
              mobileNo: 1,
            },
          },
        ],
        as: "deliveryPerson",
      },
    },
    {
      $unwind: {
        path: "$deliveryPerson",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        deliveryPerson: {
          $ifNull: ["$deliveryPerson", {}],
        },
      },
    },
  ])

  createSuccessResponse(res, data[0], 200)
})

// @desc    get order By ID
// @route   GET /api/order/:_id
// @access  Private
const getAdminDistributors = asyncHandler(async (req, res) => {
  const data = await User.aggregate([
    { $match: { userType: "distributor" } },
    {
      $project: {
        _id: 0,
        label: {
          $concat: ["$name", "[", "$address", "]"],
        },
        value: { $toString: "$_id" },
      },
    },
  ])

  createSuccessResponse(res, data, 200)
})

// @desc    get order By ID
// @route   GET /api/order/:_id
// @access  Private
const getWarhouseAndDeliveryPerson = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const wareHouseManagerList = await User.aggregate([
    { $match: { user: _id, userType: "wareHouseManager", isBlocked: false } },
    {
      $project: {
        _id: 0,
        name: "$name",
        value: { $toString: "$_id" },
      },
    },
  ])
  const deliveryPersonList = await User.aggregate([
    { $match: { user: _id, userType: "deliveryPerson", isBlocked: false } },
    {
      $project: {
        _id: 0,
        name: "$name",
        value: { $toString: "$_id" },
      },
    },
  ])
  createSuccessResponse(res, { wareHouseManagerList, deliveryPersonList }, 200)
})

// @desc    updateOrderStatus
// @route   PATCH /api/order/:_id
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const { status } = req.body
  const existOrder = await Order.findOne({ _id })

  if (existOrder) {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id },
      {
        $push: {
          orderTrack: {
            status,
          },
        },
        currentOrderStatus: { status },
      },
      {
        new: true,
      }
    )

    const distributor = await User.findOne({ _id: existOrder.distributor })
    const delivery = await User.findOne({ _id: existOrder.deliveryPerson })
    const customer = await User.findOne({ _id: existOrder.user })
    switch (status) {
      case "Out for Delivery":
        {
          if (distributor && distributor.fcmToken) {
            const { fcmToken } = distributor
            firebaseService.sendNotification({
              fcmToken,
              message: `Order ${_id} is now out for delivery.`,
              title: "Out For Delivery",
            })
          }
          if (delivery && delivery.fcmToken) {
            const { fcmToken } = delivery
            firebaseService.sendNotification({
              fcmToken,
              message: `Order ${_id} is now out for delivery.`,
              title: "Out For Delivery",
            })
          }
          if (customer && customer.fcmToken) {
            const { fcmToken } = customer
            firebaseService.sendNotification({
              fcmToken,
              message: `Order ${_id} is now out for delivery.`,
              title: "Out For Delivery",
            })
          }
        }
        break
      default:
        break
    }
    createSuccessResponse(res, updatedOrder, 200)
  } else {
    res.status(400)
    throw new Error("Order Not Found")
  }
})
// @desc    assign  order
// @route   PUT /api/order/:_id
// @access  Private
const assignOrder = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const { key, value } = req.body
  const existOrder = await Order.findOne({ _id })
  const targetUser = await User.findOne({ _id: value })
  if (existOrder && targetUser) {
    const customer = await User.findOne({ _id: existOrder.user })

    const updatedOrder = await Order.findOneAndUpdate(
      { _id },
      {
        [key]: value,
      },
      {
        new: true,
      }
    )

    switch (key) {
      case "wareHouseManager":
        {
          await Order.findOneAndUpdate(
            { _id },
            {
              $push: {
                orderTrack: {
                  status: "In Packaging",
                },
              },
              currentOrderStatus: { status: "In Packaging" },
            },
            {
              new: true,
            }
          )
          if (targetUser && targetUser.fcmToken) {
            const { fcmToken } = targetUser
            firebaseService.sendNotification({
              fcmToken,
              message: `New Order ${_id} has been assigned to you.`,
              title: "Order Assigned",
            })
          }
          if (customer && customer.fcmToken) {
            const { fcmToken } = customer
            firebaseService.sendNotification({
              fcmToken,
              message: `Your Order ${_id} is now in packaging.`,
              title: "Order In Packaging",
            })
          }
        }
        break
      case "distributor":
        {
          await Order.findOneAndUpdate(
            { _id },
            {
              $push: {
                orderTrack: {
                  status: "In Process",
                },
              },
              currentOrderStatus: { status: "In Process" },
            },
            {
              new: true,
            }
          )

          if (targetUser && targetUser.fcmToken) {
            const { fcmToken } = targetUser
            firebaseService.sendNotification({
              fcmToken,
              message: `New Order ${_id} has been assigned to you.`,
              title: "Order Assigned",
            })
          }
        }
        break
      case "deliveryPerson":
        {
          if (targetUser && targetUser.fcmToken) {
            const { fcmToken } = targetUser
            firebaseService.sendNotification({
              fcmToken,
              message: `New Order ${_id} has been assigned to you.`,
              title: "Order Assigned",
            })
          }
        }
        break

      default:
        break
    }

    createSuccessResponse(res, updatedOrder, 200, `Order Assigned`)
  } else {
    res.status(400)
    throw new Error(`Order Or ${key} Not Found `)
  }
})

// @desc    markAsdelivered
// @route   PATCH /api/order/:_id
// @access  Private
const markAsdeliveredRequest = asyncHandler(async (req, res) => {
  const { _id } = req.params

  const existOrder = await Order.findOne({ _id })
  if (existOrder) {
    const otp = generateOTP(4)
    const existUser = await User.findOneAndUpdate(
      { _id: existOrder.user },
      { otp },
      { new: true }
    )
    await sendOtpToMobile(existUser.mobileNo, otp, "delivery")
    createSuccessResponse(res, null, 200, "OTP Sent")
  } else {
    res.status(400)
    throw new Error("Order Not Found")
  }
})
// @desc    markAsdelivered
// @route   PATCH /api/order/:_id
// @access  Private
const markAsdelivered = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const { otp } = req.body

  const existOrder = await Order.findOne({ _id })
  if (existOrder) {
    const existUser = await User.findOne({ _id: existOrder.user }).select([
      "-password",
    ])

    if (existUser && existUser.otp === otp) {
      existUser.otp = null
      await existUser.save()
      const updatedOrder = await Order.findOneAndUpdate(
        { _id },
        {
          $push: {
            orderTrack: {
              status: "Delivered",
            },
          },
          currentOrderStatus: { status: "Delivered" },
        },
        {
          new: true,
        }
      )
      const distributor = await User.findOne({ _id: existOrder.distributor })
      const wareHouseManager = await User.findOne({
        _id: existOrder.wareHouseManager,
      })
      const customer = await User.findOne({ _id: existOrder.user })
      if (distributor && distributor.fcmToken) {
        const { fcmToken } = distributor
        firebaseService.sendNotification({
          fcmToken,
          message: `Order ${_id} is delivered successfully.`,
          title: "Order Delivered",
        })
      }
      if (wareHouseManager && wareHouseManager.fcmToken) {
        const { fcmToken } = wareHouseManager
        firebaseService.sendNotification({
          fcmToken,
          message: `Order ${_id} is delivered successfully.`,
          title: "Order Delivered",
        })
      }
      if (customer && customer.fcmToken) {
        const { fcmToken } = customer
        firebaseService.sendNotification({
          fcmToken,
          message: `Order ${_id} is delivered successfully.`,
          title: "Order Delivered",
        })
      }
      createSuccessResponse(res, updatedOrder, 200, "Order Status Updated")
    } else {
      res.status(400)
      throw new Error("Invalid OTP")
    }
  } else {
    res.status(400)
    throw new Error("Order Not Found")
  }
})

// @desc    upload product image
// @route   POST /api/products/upload
// @access  Private/Admin
const uploadInvoice = asyncHandler(async (req, res) => {
  const { _id } = req.params
  if (req.file) {
    const invoice = await awsService.uploadFile(req)
    const updatedOrder = await Order.findOneAndUpdate(
      { _id },
      { invoice },
      { new: true }
    )
    createSuccessResponse(res, updatedOrder, 200, "Invoice Uploaded")
  } else {
    res.status(400)
    throw new Error("Invalid Image Type")
  }
})
module.exports = {
  getAdminOrders,
  getDistributorOrders,
  getDeliveryPersonOrders,
  getOrderByID,
  createOrder,
  getCustomerOrders,
  updateOrderStatus,
  assignOrder,
  getWareHouseOrders,
  getAdminDistributors,
  getWarhouseAndDeliveryPerson,
  markAsdeliveredRequest,
  markAsdelivered,
  uploadInvoice,
}
