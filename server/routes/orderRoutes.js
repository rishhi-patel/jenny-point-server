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
  getWarhouseAndDeliveryPerson,
  markAsdeliveredRequest,
  markAsdelivered,
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
    .put(protect, updateOrderStatus)
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
    .get(protect, getDeliveryPersonOrders)
    .patch(protect, assignOrder)
  // Admin routes
  router
    .route("/admin/order")
    .get(protect, getAdminOrders)
    .patch(protect, assignOrder)

  router.route("/admin/distributors").get(protect, getAdminDistributors)
  router
    .route("/distributors/options")
    .get(protect, getWarhouseAndDeliveryPerson)
  router
    .route("/order/delivery/:_id")
    .put(protect, markAsdeliveredRequest)
    .patch(protect, markAsdelivered)
}
