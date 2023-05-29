const {
  createOffer,
  getOffers,
  updateOffer,
  deleteOffer,
  getOfferById,
} = require("../controllers/offerController.js")
const { protect, admin } = require("../middleware/authMiddleware.js")

module.exports = (router) => {
  // public routes

  // private Routes
  router.route("/offer").get(getOffers).post(protect, admin, createOffer)
  router
    .route("/offer/:_id")
    .put(protect, admin, updateOffer)
    .delete(protect, admin, deleteOffer)
    .get(protect, getOfferById)
}
