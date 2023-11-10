const { map, some } = require("lodash")
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
      $addFields: {
        tax: 0,
      },
    },
    {
      $addFields: {
        discount: 0,
      },
    },
    {
      $project: {
        _id: 0, // Exclude the _id field if you don't need it
        products: "$cart.products", // This now becomes the root level in the output
        totalPrice: 1,
        totalQty: 1,
        tax: 1,
        discount: 1,
      },
    },
  ])
  console.log({ cart })
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
    case "wareHouseManager":
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

const productLookup = [
  {
    $match: { _id: { $exists: true } },
  },
  // Brand Stage
  {
    $lookup: {
      from: "brands",
      let: { brand_id: "$brand" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$brand_id"] },
          },
        },
        {
          $project: {
            name: 1,
            _id: 0,
          },
        },
      ],
      as: "brand",
    },
  },
  {
    $unwind: {
      path: "$brand",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      brand: {
        $ifNull: ["$brand.name", ""],
      },
    },
  },
  // category stage
  {
    $lookup: {
      from: "categories",
      let: { category_id: "$category" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$category_id"] },
          },
        },
        {
          $project: {
            name: 1,
            _id: 0,
            subCategory: 1,
          },
        },
      ],
      as: "category",
    },
  },
  {
    $unwind: {
      path: "$category",
      preserveNullAndEmptyArrays: true,
    },
  },

  {
    $addFields: {
      subCategory: {
        $arrayElemAt: [
          {
            $filter: {
              input: "$category.subCategory",
              cond: { $eq: ["$$this._id", "$subCategory"] },
            },
          },
          0,
        ],
      },
    },
  },
  {
    $addFields: {
      category: {
        $ifNull: ["$category.name", ""],
      },
    },
  },
  {
    $addFields: {
      subCategory: {
        $ifNull: ["$subCategory.name", ""],
      },
    },
  },
]

const getRatingArray = (ratings) => {
  let result = []
  ratings.map((elem) => {
    if (Number(elem))
      result = [
        ...result,
        Number(elem),
        Number(`${elem}.1`),
        Number(`${elem}.2`),
        Number(`${elem}.3`),
        Number(`${elem}.4`),
        Number(`${elem}.5`),
        Number(`${elem}.6`),
        Number(`${elem}.7`),
        Number(`${elem}.8`),
        Number(`${elem}.9`),
      ]
  })
  return result
}
const checkWishListStatus = (products, user) => {
  let cartItems = []
  if (user) {
    const {
      cart: { products },
    } = user
    cartItems = products
  }
  return map(products, (elem) => {
    elem.inWishlist =
      elem.wishList && user
        ? some(elem.wishList, (wish) => wish.toString() === user._id.toString())
        : false
    elem.inCart = user
      ? some(cartItems, (item) => item.value.toString() === elem._id.toString())
      : false
    return elem
  })
}
module.exports = {
  createSuccessResponse,
  createErrorResponse,
  getCartDetails,
  checkUserAccess,
  productLookup,
  getRatingArray,
  checkWishListStatus,
}
