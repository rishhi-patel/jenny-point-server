const multer = require("multer")
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
  uploadInvoice,
} = require("../controllers/orderController")
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
})

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
  router
    .route("/order/:_id/invoice")
    .post(protect, upload.single("image"), uploadInvoice)
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
