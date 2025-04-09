const express = require("express")
const router = express.Router()
const { getUserCart, updateUserCart, clearUserCart } = require("../controllers/cartController")
const { protect } = require("../middleware/authMiddleware")

router.route("/").get(protect, getUserCart).post(protect, updateUserCart).delete(protect, clearUserCart)

module.exports = router
