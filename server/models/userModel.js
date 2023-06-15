const mongoose = require("mongoose")

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: "Jennypoint User",
    },
    email: {
      type: String,
    },
    wareHouseName: {
      type: String,
    },
    userType: {
      type: String,
      enum: [
        "admin",
        "customer",
        "distributor",
        "deliveryPerson",
        "wareHouseManager",
      ],
      default: "customer",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    mobileNo: { type: Number, required: true },
    gstNo: { type: String },
    otp: {
      type: Number,
      default: null,
    },
    address: { type: String, default: "" },
    cart: {
      products: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          qty: {
            type: Number,
            default: null,
          },
        },
      ],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    fcmToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model("User", userSchema)

// Check if the user already exists
User.findOne({ mobileNo: 7621937212 }, (error, existingUser) => {
  if (error) {
    console.error(error)
  } else {
    if (!existingUser) {
      const user = new User({
        name: "Admin User",
        userType: "admin",
        mobileNo: 7621937212,
      })

      user.save((error, savedUser) => {
        if (error) {
          console.error(error)
        } else {
          console.log("User saved:", savedUser)
        }
      })
    }
  }
})
User.findOne({ mobileNo: 9712992415 }, (error, existingUser) => {
  if (error) {
    console.error(error)
  } else {
    if (!existingUser) {
      const user = new User({
        name: "Admin User",
        userType: "admin",
        mobileNo: 9712992415,
      })

      user.save((error, savedUser) => {
        if (error) {
          console.error(error)
        } else {
          console.log("User saved:", savedUser)
        }
      })
    }
  }
})
User.findOne({ mobileNo: 9723042479 }, (error, existingUser) => {
  if (error) {
    console.error(error)
  } else {
    if (!existingUser) {
      const user = new User({
        name: "Admin User",
        userType: "admin",
        mobileNo: 9723042479,
      })

      user.save((error, savedUser) => {
        if (error) {
          console.error(error)
        } else {
          console.log("User saved:", savedUser)
        }
      })
    }
  }
})
module.exports = User
