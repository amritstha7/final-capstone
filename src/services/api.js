import axios from "axios"

const API_URL = "http://localhost:3002/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Product API calls
export const getProducts = async (keyword = "", category = "", pageNumber = "") => {
  try {
    const { data } = await api.get(`/products?keyword=${keyword}&category=${category}&pageNumber=${pageNumber}`)
    return data.products
  } catch (error) {
    console.error("Error fetching products:", error)
    throw error.response?.data || { message: "Network error" }
  }
}

export const getProductDetails = async (id) => {
  try {
    const { data } = await api.get(`/products/${id}`)
    return data
  } catch (error) {
    console.error("Error fetching product details:", error)
    throw error.response?.data || { message: "Network error" }
  }
}

// User API calls
export const login = async (email, password) => {
  try {
    const { data } = await api.post("/auth/login", { email, password })

    // Validate token before storing
    if (data.token && typeof data.token === "string" && data.token.length > 0) {
      localStorage.setItem("token", data.token)
    } else {
      throw new Error("Invalid token received from server")
    }

    return data
  } catch (error) {
    console.error("Login error:", error)
    throw error.response?.data || { message: "Network error" }
  }
}

export const register = async (firstName, lastName, email, password) => {
  try {
    const { data } = await api.post("/auth/signup", {
      firstName,
      lastName,
      email,
      password,
    })
    return data
  } catch (error) {
    console.error("Registration error:", error)
    throw error.response?.data || { message: "Network error" }
  }
}

export const getUserProfile = async () => {
  try {
    const { data } = await api.get("/auth/profile")
    return data
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw error.response?.data || { message: "Network error" }
  }
}

export const updateUserProfile = async (user) => {
  try {
    const { data } = await api.put("/auth/profile", user)
    return data
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error.response?.data || { message: "Network error" }
  }
}

// Order API calls
export const createOrder = async (order) => {
  try {
    const { data } = await api.post("/orders", order)
    return data
  } catch (error) {
    console.error("Error creating order:", error)
    throw error.response?.data || { message: "Network error" }
  }
}

export const getOrderDetails = async (id) => {
  try {
    const { data } = await api.get(`/orders/${id}`)
    return data
  } catch (error) {
    console.error("Error fetching order details:", error)
    throw error.response?.data || { message: "Network error" }
  }
}

export const payOrder = async (orderId, paymentResult) => {
  try {
    const { data } = await api.put(`/orders/${orderId}/pay`, paymentResult)
    return data
  } catch (error) {
    console.error("Error paying order:", error)
    throw error.response?.data || { message: "Network error" }
  }
}

export const getMyOrders = async () => {
  try {
    const { data } = await api.get("/orders/myorders")
    return data
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error.response?.data || { message: "Network error" }
  }
}

export default {
  getProducts,
  getProductDetails,
  login,
  register,
  getUserProfile,
  updateUserProfile,
  createOrder,
  getOrderDetails,
  payOrder,
  getMyOrders,
}
