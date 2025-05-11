const asyncHandler = require("express-async-handler")
const Cart = require("../models/cartModel")
const User = require("../models/userModel")

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getUserCart = asyncHandler(async (req, res) => {
  // Populate the cart with user information
  const cart = await Cart.findOne({ user: req.user._id }).populate("user", "firstName lastName email")

  if (cart) {
    // Add user information directly to the response
    const userInfo = {
      userId: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      fullName: `${req.user.firstName} ${req.user.lastName}`,
    }

    res.json({
      ...cart.toObject(),
      userInfo,
    })
  } else {
    res.json({
      items: [],
      userInfo: {
        userId: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        fullName: `${req.user.firstName} ${req.user.lastName}`,
      },
    })
  }
})

// @desc    Update user cart
// @route   POST /api/cart
// @access  Private
const updateUserCart = asyncHandler(async (req, res) => {
  const { items } = req.body

  // Get user information
  const user = await User.findById(req.user._id)
  if (!user) {
    res.status(404)
    throw new Error("User not found")
  }

  let cart = await Cart.findOne({ user: req.user._id })

  if (cart) {
    cart.items = items
    // Update user info in case it changed
    cart.userInfo = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
    }
  } else {
    cart = new Cart({
      user: req.user._id,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
      },
      items,
    })
  }

  const updatedCart = await cart.save()

  // Add user information directly to the response
  const responseCart = updatedCart.toObject()
  responseCart.userInfo = {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    fullName: `${user.firstName} ${user.lastName}`,
  }

  res.status(200).json(responseCart)
})

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
const clearUserCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })

  if (cart) {
    cart.items = []
    await cart.save()
    res.json({
      message: "Cart cleared",
      userInfo: {
        userId: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        fullName: `${req.user.firstName} ${req.user.lastName}`,
      },
    })
  } else {
    res.json({
      message: "Cart already empty",
      userInfo: {
        userId: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        fullName: `${req.user.firstName} ${req.user.lastName}`,
      },
    })
  }
})

// @desc    Get all carts (admin)
// @route   GET /api/cart/all
// @access  Private/Admin
const getAllCarts = asyncHandler(async (req, res) => {
  // Populate with complete user information
  const carts = await Cart.find({}).populate("user", "firstName lastName email")

  // Format the response to include clear user information
  const formattedCarts = carts.map((cart) => {
    const cartObj = cart.toObject()
    if (cart.user) {
      cartObj.userDetails = {
        userId: cart.user._id,
        firstName: cart.user.firstName,
        lastName: cart.user.lastName,
        email: cart.user.email,
        fullName: `${cart.user.firstName} ${cart.user.lastName}`,
      }
    }
    return cartObj
  })

  res.json(formattedCarts)
})

module.exports = {
  getUserCart,
  updateUserCart,
  clearUserCart,
  getAllCarts,
}
