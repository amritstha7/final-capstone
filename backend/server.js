const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const connectDB = require("./config/db")
const { notFound, errorHandler } = require("./middleware/errorMiddleware")
const userRoutes = require("./routes/userRoutes")
const productRoutes = require("./routes/productRoutes")
const orderRoutes = require("./routes/orderRoutes")
const cartRoutes = require("./routes/cartRoutes") // Add this line

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Routes
app.use("/api/auth", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/cart", cartRoutes) // Add this line

// Base route
app.get("/", (req, res) => {
  res.send("API is running...")
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})
