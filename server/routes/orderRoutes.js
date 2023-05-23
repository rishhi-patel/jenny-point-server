const {
  getAdminOrders,
  getDistributorOrders,
  getDeliveryPersonOrders,
  getOrderByID,
  createOrder,
  getCustomerOrders,
  updateOrderStatus,
  assignOrder,
} = require("../controllers/orderController")
const { protect, admin } = require("../middleware/authMiddleware")

module.exports = (router) => {
  // Customer routes
  router
    .route("/order")
    .get(protect, getCustomerOrders)
    .post(protect, createOrder)
  router.route("/order/:_id").get(protect, getOrderByID)
  // Distributor routes
  router
    .route("/distributor/order")
    .get(protect, getDistributorOrders)
    .patch(protect, assignOrder)
  // Admin routes
  router
    .route("/admin/order")
    .get(protect, getAdminOrders)
    .patch(protect, assignOrder)
}
