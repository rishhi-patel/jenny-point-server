const multer = require("multer")
const {
  getCategories,
  updateCategory,
  deleteCategory,
  createCategory,
  createSubCategory,
  deleteSubCategory,
  updateSubCategory,
  getCategoryById,
} = require("../controllers/categoryController")
const { protect } = require("../middleware/authMiddleware.js")

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

module.exports = (router) => {
  // public routes

  // private Routes
  router
    .route("/category")
    .get(getCategories)
    .post(protect, upload.single("image"), createCategory)

  router
    .route("/category/:_id")
    .get(getCategoryById)
    .put(protect, upload.single("image"), updateCategory)
    .delete(protect, deleteCategory)
  router
    .route("/category/:_id/sub")
    .post(protect, createSubCategory)
    .delete(protect, deleteSubCategory)
    .put(protect, updateSubCategory)
}
