const multer = require("multer")
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController.js")
const { protect } = require("../middleware/authMiddleware.js")
const storage = multer.memoryStorage()

module.exports = (router) => {
  // public routes

  // private Routes
  router.route("/product").post(protect, createProduct).get(getProducts)
  router
    .route("/product/:_id")
    .put(protect, updateProduct)
    .delete(protect, deleteProduct)
}
