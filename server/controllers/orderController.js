const asyncHandler = require("express-async-handler")
const { createSuccessResponse, getCartDetails } = require("../utils/utils")
const Order = require("../models/orderModal")
const mongoose = require("mongoose")
const User = require("../models/userModel")
const ObjectId = mongoose.Types.ObjectId

// @desc    Fetch all orders
// @route   GET /api/order/admin
// @access  Private
const getAdminOrders = asyncHandler(async (req, res) => {
  const { status } = req.query
  const keyword = status ? { "currentOrderStatus.status": status } : {}
  const data = await Order.find({ ...keyword }).sort({
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

  console.log({ keyword })
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
    totalPrice,
    totalQty,
  } = await getCartDetails(_id)
  if (address.trim()) {
    const order = new Order({
      orderItems: products,
      totalPrice,
      shippingAddress: address,
      orderTrack: [{ status: "Order Placed" }],
      currentOrderStatus: { status: "Order Placed" },
      totalQty,
      user: _id,
    })

    const newOrder = await order.save()
    createSuccessResponse(res, newOrder, 200)
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
            $addFields: {
              mobileNo: { $toString: "$mobileNo" },
            },
          },
          {
            $project: {
              _id: 0,
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
      $unwind: "$user",
    },
  ])
  // const data = await Order.findOne({ _id })
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

// @desc    updateOrderStatus
// @route   PATCH /api/order/:_id
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const { status } = req.params

  const updatedOrder = await Order.findOneAndUpdate(
    { _id },
    [
      {
        $push: {
          orderTrack: {
            status,
          },
        },
      },
      { currentOrderStatus: { status } },
    ],
    {
      new: true,
    }
  )
  createSuccessResponse(res, updatedOrder, 200)
})
// @desc    assign  order
// @route   PUT /api/order/:_id
// @access  Private
const assignOrder = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const { key, value } = req.body
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
    case "wareHouseManager": {
      await Order.findOneAndUpdate(
        { _id },
        [
          {
            $push: {
              orderTrack: {
                status: "In Packaging",
              },
            },
          },
          { currentOrderStatus: { status: "In Packaging" } },
        ],
        {
          new: true,
        }
      )
    }
    case "distributor": {
      await Order.findOneAndUpdate(
        { _id },
        [
          {
            $push: {
              orderTrack: {
                status: "In Process",
              },
            },
          },
          { currentOrderStatus: { status: "In Process" } },
        ],
        {
          new: true,
        }
      )
    }
    case "deliveryPerson":
      {
        await Order.findOneAndUpdate(
          { _id },
          [
            {
              $push: {
                orderTrack: {
                  status: "Out for Delivery",
                },
              },
            },
            { currentOrderStatus: { status: "Out for Delivery" } },
          ],
          {
            new: true,
          }
        )
      }

      break

    default:
      break
  }
  createSuccessResponse(res, updatedOrder, 200)
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
}
