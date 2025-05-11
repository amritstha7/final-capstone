const asyncHandler = require("express-async-handler")
const Order = require("../models/orderModel")
const User = require("../models/userModel")
const mongoose = require("mongoose")

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice, userInfo } =
    req.body

  if (orderItems && orderItems.length === 0) {
    res.status(400)
    throw new Error("No order items")
  } else {
    // Get user information
    const user = await User.findById(req.user._id)
    if (!user) {
      res.status(404)
      throw new Error("User not found")
    }

    // Validate product IDs before creating order
    try {
      // Convert product IDs to valid ObjectIds
      const validatedOrderItems = orderItems.map((item) => {
        // Check if product is a valid ObjectId
        if (!mongoose.isValidObjectId(item.product)) {
          throw new Error(`Invalid product ID: ${item.product}`)
        }
        return {
          ...item,
          product: new mongoose.Types.ObjectId(item.product),
        }
      })

      // Create order with detailed user information
      const order = new Order({
        orderItems: validatedOrderItems,
        user: req.user._id,
        userInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: userInfo?.phone || "",
          fullName: `${user.firstName} ${user.lastName}`,
        },
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      })

      const createdOrder = await order.save()

      // Add additional user information to the response
      const orderResponse = createdOrder.toObject()
      orderResponse.userDetails = {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
      }

      res.status(201).json(orderResponse)
    } catch (error) {
      res.status(400)
      throw new Error(`Order validation failed: ${error.message}`)
    }
  }
})

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  // Populate with complete user information
  const order = await Order.findById(req.params.id).populate("user", "firstName lastName email")

  if (order) {
    // Add formatted user information to the response
    const orderResponse = order.toObject()
    if (order.user) {
      orderResponse.userDetails = {
        userId: order.user._id,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        email: order.user.email,
        fullName: `${order.user.firstName} ${order.user.lastName}`,
      }
    }

    res.json(orderResponse)
  } else {
    res.status(404)
    throw new Error("Order not found")
  }
})

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer?.email_address || order.userInfo.email,
    }

    const updatedOrder = await order.save()

    // Add user details to response
    const orderResponse = updatedOrder.toObject()
    const user = await User.findById(order.user)
    if (user) {
      orderResponse.userDetails = {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
      }
    }

    res.json(orderResponse)
  } else {
    res.status(404)
    throw new Error("Order not found")
  }
})

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    order.isDelivered = true
    order.deliveredAt = Date.now()

    const updatedOrder = await order.save()

    // Add user details to response
    const orderResponse = updatedOrder.toObject()
    const user = await User.findById(order.user)
    if (user) {
      orderResponse.userDetails = {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
      }
    }

    res.json(orderResponse)
  } else {
    res.status(404)
    throw new Error("Order not found")
  }
})

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })

  // Add user information to each order
  const ordersWithUserInfo = orders.map((order) => {
    const orderObj = order.toObject()
    orderObj.userDetails = {
      userId: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      fullName: `${req.user.firstName} ${req.user.lastName}`,
    }
    return orderObj
  })

  res.json(ordersWithUserInfo)
})

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  // Populate with complete user information
  const orders = await Order.find({}).populate("user", "id firstName lastName email")

  // Format the response to include clear user information
  const formattedOrders = orders.map((order) => {
    const orderObj = order.toObject()
    if (order.user) {
      orderObj.userDetails = {
        userId: order.user._id,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        email: order.user.email,
        fullName: `${order.user.firstName} ${order.user.lastName}`,
      }
    }
    return orderObj
  })

  res.json(formattedOrders)
})

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
}
