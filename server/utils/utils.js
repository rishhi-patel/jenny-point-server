const User = require("../models/userModel")

const createSuccessResponse = (res, data, status = 200, message) => {
  return res.status(status).send({
    status: "success",
    data,
    message,
  })
}
const createErrorResponse = (res, message, status = 400) => {
  return res.status(status).send({
    status: "fail",
    ...message,
  })
}

const getCartDetails = async (_id) => {
  const cart = await User.aggregate([
    { $match: { _id } },
    {
      $lookup: {
        from: "products",
        let: { productIds: "$cart.products.id" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$productIds"] },
            },
          },
          {
            $project: {
              name: 1,
              images: 1,
              price: 1,
            },
          },
        ],
        as: "cart.lookup",
      },
    },
    {
      $addFields: {
        "cart.products": {
          $map: {
            input: "$cart.products",
            as: "product",
            in: {
              $mergeObjects: [
                {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$cart.lookup",
                        cond: {
                          $eq: ["$$this._id", { $toObjectId: "$$product.id" }],
                        },
                      },
                    },
                    0,
                  ],
                },
                {
                  qty: "$$product.qty",
                },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        totalPrice: {
          $reduce: {
            input: "$cart.products",
            initialValue: 0,
            in: {
              $add: ["$$value", { $multiply: ["$$this.price", "$$this.qty"] }],
            },
          },
        },
        totalQty: {
          $sum: "$cart.products.qty",
        },
      },
    },
    {
      $project: {
        "cart.lookup": 0,
      },
    },
    {
      $project: {
        _id: 0,
        cart: 1,
        totalPrice: 1,
        totalQty: 1,
      },
    },
  ])
  return cart[0]
}
const checkUserAccess = (res, userType, targetUserType) => {
  switch (targetUserType) {
    case "customer":
      if (!["admin"].includes(userType)) {
        res.status(401)
        throw new Error("Not Authorized as Admin")
      }
      break
    case "distributor":
      if (!["admin"].includes(userType)) {
        res.status(401)
        throw new Error("Not Authorized as Admin")
      }
      break
    case "wareHousemanager":
      if (!["admin", "distributor"].includes(userType)) {
        res.status(401)
        throw new Error("Not Authorized as distributor")
      }
      break
    case "deliveryPerson":
      if (!["admin", "distributor"].includes(userType)) {
        res.status(401)
        throw new Error("Not Authorized distributor")
      }
      break
    default:
      break
  }
}
module.exports = {
  createSuccessResponse,
  createErrorResponse,
  getCartDetails,
  checkUserAccess,
}
