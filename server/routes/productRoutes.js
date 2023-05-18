const multer = require("multer")
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  uploadImgToS3,
  deleteImage,
} = require("../controllers/productController.js")
const { protect } = require("../middleware/authMiddleware.js")

module.exports = (router) => {
  // public routes

  // private Routes
  router.route("/product").post(protect, createProduct).get(getProducts)
  router
    .route("/product/:_id")
    .get(getProductById)
    .put(protect, updateProduct)
    .delete(protect, deleteProduct)
  router
    .route("/product/image")
    .post(protect, upload.single("image"), uploadImgToS3)
  router.route("/product/image/:key").delete(protect, deleteImage)
}