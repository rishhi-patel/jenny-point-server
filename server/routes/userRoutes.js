const {
  updateUserProfile,
  getUserDetails,
  getCustomers,
  getCustomerById,
  sendOTP,
  verifyOTP,
  updateCustomerDetails,
  deleteUserAccount,
  blockUnBlockCustomer,
  verifyAdmin,
  addProductToCart,
  removeProductFromCart,
  getUserCartDetails,
} = require("../controllers/userController")

const { protect, admin } = require("../middleware/authMiddleware")

module.exports = (router) => {
  // public routes
  router.route("/user/login").post(sendOTP)
  router.route("/user/verify-otp").post(verifyOTP)

  // private Routes
  router
    .route("/user/profile")
    .get(protect, getUserDetails)
    .post(protect, updateUserProfile)
  router.route("/user").get(protect, getCustomers)

  // cart section
  router.route("/user/cart").get(protect, getUserCartDetails)
  router
    .route("/user/cart/:id")
    .post(protect, addProductToCart)
    .delete(protect, removeProductFromCart)

  // admin routes
  router.route("/admin/login").post(sendOTP)
  router.route("/customer/:_id").put(protect, admin, updateCustomerDetails)

  router
    .route("/user/:_id")
    .get(protect, getCustomerById)
    .delete(protect, deleteUserAccount)

  router
    .route("/customer/:_id/block")
    .patch(protect, admin, blockUnBlockCustomer)
}
