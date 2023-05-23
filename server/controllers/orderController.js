const asyncHandler = require("express-async-handler")
const { createSuccessResponse, getCartDetails } = require("../utils/utils")
const Order = require("../models/orderModal")

// @desc    Fetch all orders
// @route   GET /api/order/admin
// @access  Private
const getAdminOrders = asyncHandler(async (req, res) => {
  const { _id } = req.query
  const keyword = _id ? { _id } : {}
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
  const data = await Order.find({ distributor: _id }).sort({
    createdAt: -1,
  })
  createSuccessResponse(res, data, 200)
})

// @desc    Fetch distributer orders
// @route   GET /api/order/distributor
// @access  Private
const getDeliveryPersonOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const data = await Order.find({ deliveryPerson: _id }).sort({
    createdAt: -1,
  })
  createSuccessResponse(res, data, 200)
})

// @desc    Fetch distributer orders
// @route   GET /api/order/distributor
// @access  Private
const getCustomerOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user
  const data = await Order.find({ user: _id }).sort({
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

  const order = new Order({
    orderItems: products,
    totalPrice,
    shippingAddress: address,
    orderTrack: [{ status: "Order Placed" }],
    totalQty,
    user: _id,
  })
  const newOrder = await order.save()
  createSuccessResponse(res, newOrder, 200)
})

// @desc    get order By ID
// @route   GET /api/order/:_id
// @access  Private
const getOrderByID = asyncHandler(async (req, res) => {
  const { _id } = req.params
  const data = await Order.find({ _id })
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
    {
      $push: {
        orderTrack: {
          status,
        },
      },
    },
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
        {
          $push: {
            orderTrack: {
              status: "In Packaging",
            },
          },
        },
        {
          new: true,
        }
      )
    }
    case "distributor": {
      await Order.findOneAndUpdate(
        { _id },
        {
          $push: {
            orderTrack: {
              status: "In Process",
            },
          },
        },
        {
          new: true,
        }
      )
    }
    case "deliveryPerson":
      {
        await Order.findOneAndUpdate(
          { _id },
          {
            $push: {
              orderTrack: {
                status: "Out for Delivery",
              },
            },
          },
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
}
