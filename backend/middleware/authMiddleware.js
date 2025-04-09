const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      // Check if token exists and is not empty
      if (!token || token === "undefined" || token === "null") {
        res.status(401)
        throw new Error("Not authorized, token is missing or invalid")
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user) {
        res.status(401)
        throw new Error("User not found")
      }

      next()
    } catch (error) {
      console.error("Token verification error:", error)
      res.status(401)
      if (error.name === "JsonWebTokenError") {
        throw new Error("Not authorized, token is invalid")
      } else {
        throw new Error("Not authorized, token failed")
      }
    }
  } else {
    res.status(401)
    throw new Error("Not authorized, no token")
  }
})

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(401)
    throw new Error("Not authorized as an admin")
  }
}

module.exports = { protect, admin }
