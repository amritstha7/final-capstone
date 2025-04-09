const mongoose = require("mongoose")
const dotenv = require("dotenv")
const colors = require("colors")
const users = require("./data/users")
const products = require("./data/products")
const User = require("./models/userModel")
const Product = require("./models/productModel")
const Order = require("./models/orderModel")
const Cart = require("./models/cartModel")
const connectDB = require("./config/db")

dotenv.config()

connectDB()

const importData = async () => {
  try {
    await Order.deleteMany()
    await Product.deleteMany()
    await User.deleteMany()
    await Cart.deleteMany()

    console.log("Deleted previous data".yellow)

    const createdUsers = await User.insertMany(users)
    console.log(`${createdUsers.length} users created`.green)

    const adminUser = createdUsers[0]._id

    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser }
    })

    const createdProducts = await Product.insertMany(sampleProducts)
    console.log(`${createdProducts.length} products created`.green)

    console.log("Data Imported Successfully!".green.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    await Order.deleteMany()
    await Product.deleteMany()
    await User.deleteMany()
    await Cart.deleteMany()

    console.log("Data Destroyed!".red.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

if (process.argv[2] === "-d") {
  destroyData()
} else {
  importData()
}
