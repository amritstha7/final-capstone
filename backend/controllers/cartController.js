const asyncHandler = require("express-async-handler")
const Cart = require("../models/cartModel")

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getUserCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })

  if (cart) {
    res.json(cart)
  } else {
    res.json({ items: [] })
  }
})

// @desc    Update user cart
// @route   POST /api/cart
// @access  Private
const updateUserCart = asyncHandler(async (req, res) => {
  const { items } = req.body

  let cart = await Cart.findOne({ user: req.user._id })

  if (cart) {
    cart.items = items
  } else {
    cart = new Cart({
      user: req.user._id,
      items,
    })
  }

  const updatedCart = await cart.save()
  res.status(200).json(updatedCart)
})

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
const clearUserCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })

  if (cart) {
    cart.items = []
    await cart.save()
    res.json({ message: "Cart cleared" })
  } else {
    res.json({ message: "Cart already empty" })
  }
})

module.exports = {
  getUserCart,
  updateUserCart,
  clearUserCart,
}
