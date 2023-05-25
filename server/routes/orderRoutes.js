const {
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
} = require("../controllers/orderController")
const { protect, admin } = require("../middleware/authMiddleware")

module.exports = (router) => {
  // Customer routes
  router
    .route("/order")
    .get(protect, getCustomerOrders)
    .post(protect, createOrder)
  router
    .route("/order/:_id")
    .get(protect, getOrderByID)
    .patch(protect, assignOrder)
  // Distributor routes
  router
    .route("/distributor/order")
    .get(protect, getDistributorOrders)
    .patch(protect, assignOrder)
  // warehouse
  router
    .route("/wareHouse/order")
    .get(protect, getWareHouseOrders)
    .patch(protect, assignOrder)
  // deliveryPerson
  router
    .route("/delivery/order")
    .get(protect, getWareHouseOrders)
    .patch(protect, assignOrder)
  // Admin routes
  router
    .route("/admin/order")
    .get(protect, getAdminOrders)
    .patch(protect, assignOrder)
  router.route("/admin/distributors").get(protect, getAdminDistributors)
}
