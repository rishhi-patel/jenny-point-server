const {
  updateUserProfile,
  getUserDetails,
  getUsers,
  getUserById,
  sendOTP,
  verifyOTP,
  updateUserDetails,
  deleteUserAccount,
  blockUnBlockUser,
  addProductToCart,
  removeProductFromCart,
  getUserCartDetails,
  adminLogin,
  teamsLogin,
  createUser,
  deleteAccount,
} = require("../controllers/userController")

const { protect, admin } = require("../middleware/authMiddleware")

module.exports = (router) => {
  // public routes
  router.route("/user/login").post(sendOTP)
  router.route("/teams/login").post(teamsLogin)
  router.route("/admin/login").post(adminLogin)

  router.route("/user/verify-otp").post(verifyOTP)

  // Private routes
  // Profile routes routes
  router
    .route("/user/profile")
    .get(protect, getUserDetails)
    .post(protect, updateUserProfile)

  // cart routes
  router.route("/user/cart").get(protect, getUserCartDetails)
  router
    .route("/user/cart/:id")
    .post(protect, addProductToCart)
    .delete(protect, removeProductFromCart)

  // common routes
  router.route("/user").get(protect, getUsers).post(protect, createUser)
  router.route("/user/account").delete(protect, deleteAccount)
  router.route("/user/:_id/block").patch(protect, blockUnBlockUser)
  router
    .route("/user/:_id")
    .get(protect, getUserById)
    .delete(protect, deleteUserAccount)
    .put(protect, updateUserDetails)
}
