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
  getHomeScreenData,
  addProductToWishList,
  removeProductFromWishList,
  getUserWishList,
} = require("../controllers/productController.js")
const { protect, productMiddlewre } = require("../middleware/authMiddleware.js")

module.exports = (router) => {
  // public routes
  router.route("/product/home").get(getHomeScreenData)

  // private Routes
  router.route("/product").post(protect, createProduct).get(getProducts)
  router.route("/product/wishlist").get(protect, getUserWishList)
  router
    .route("/product/wishlist/:productId")
    .post(protect, addProductToWishList)
    .put(protect, removeProductFromWishList)
  router
    .route("/product/:_id")
    .get(productMiddlewre, getProductById)
    .put(protect, updateProduct)
    .delete(protect, deleteProduct)

  router
    .route("/product/image")
    .post(protect, upload.single("image"), uploadImgToS3)
  router.route("/product/image/:key").delete(protect, deleteImage)
}
