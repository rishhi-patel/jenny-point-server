const {
  getUserAddresses,
  addAddress,
  getAddAddressById,
  updateAddressById,
  deleteAddressById,
  getAreaDetailsFromPinCode,
} = require("../controllers/addressController")
const { protect } = require("../middleware/authMiddleware")
const joiSchemas = require("../utils/joiSchemas")
const validateRequest = require("../utils/requestValidator")

module.exports = (router) => {
  // public routes
  router.route("/address/pincode/:code").get(getAreaDetailsFromPinCode)
  //   private routes
  router
    .route("/address")
    .get(protect, getUserAddresses)
    .post(protect, validateRequest(joiSchemas.address), addAddress)
  router
    .route("/address/:id")
    .get(protect, getAddAddressById)
    .put(protect, validateRequest(joiSchemas.address), updateAddressById)
    .delete(protect, deleteAddressById)
}
