const multer = require("multer")

const { protect } = require("../middleware/authMiddleware.js")
const {
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} = require("../controllers/brandController.js")

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

module.exports = (router) => {
  // public routes

  // private Routes
  router
    .route("/brand")
    .get(getBrand)
    .post(protect, upload.single("image"), createBrand)
  router
    .route("/brand/:_id")
    .put(protect, upload.single("image"), updateBrand)
    .delete(protect, deleteBrand)
}
