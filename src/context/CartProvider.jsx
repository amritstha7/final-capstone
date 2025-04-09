"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const CartContext = createContext(undefined)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (token) {
        try {
          const response = await axios.get("http://localhost:3002/api/auth/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          setUser(response.data)
          setIsLoggedIn(true)

          // After successful login, fetch user's cart from backend
          try {
            const cartResponse = await axios.get("http://localhost:3002/api/cart", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            if (cartResponse.data && cartResponse.data.items) {
              setCartItems(cartResponse.data.items)
            } else {
              // If no cart exists on backend, check localStorage as fallback
              const userCartString = localStorage.getItem(`cart_${response.data._id}`)
              if (userCartString) {
                try {
                  setCartItems(JSON.parse(userCartString))
                } catch (error) {
                  console.error("Error parsing user cart:", error)
                  setCartItems([])
                }
              }
            }
          } catch (error) {
            console.error("Error fetching user cart:", error)
            // Fallback to localStorage if API fails
            const userCartString = localStorage.getItem(`cart_${response.data._id}`)
            if (userCartString) {
              try {
                setCartItems(JSON.parse(userCartString))
              } catch (error) {
                console.error("Error parsing user cart:", error)
                setCartItems([])
              }
            }
          }
        } catch (error) {
          console.error("Authentication failed:", error)
          localStorage.removeItem("token")
          setIsLoggedIn(false)
          setUser(null)

          // Load anonymous cart
          try {
            const anonymousCartString = localStorage.getItem("anonymous_cart")
            if (anonymousCartString) {
              setCartItems(JSON.parse(anonymousCartString))
            }
          } catch (error) {
            console.error("Error parsing anonymous cart:", error)
            setCartItems([])
          }
        }
      } else {
        // Load anonymous cart
        try {
          const anonymousCartString = localStorage.getItem("anonymous_cart")
          if (anonymousCartString) {
            setCartItems(JSON.parse(anonymousCartString))
          }
        } catch (error) {
          console.error("Error parsing anonymous cart:", error)
          setCartItems([])
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  // Save cart to backend and localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      if (isLoggedIn && user && user._id) {
        // Save to backend if user is logged in
        const saveCartToBackend = async () => {
          try {
            const token = localStorage.getItem("token")
            await axios.post(
              "http://localhost:3002/api/cart",
              { items: cartItems },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              },
            )
          } catch (error) {
            console.error("Error saving cart to backend:", error)
          }
        }

        saveCartToBackend()

        // Also save to localStorage as backup
        localStorage.setItem(`cart_${user._id}`, JSON.stringify(cartItems))
      } else {
        // Save to localStorage for anonymous users
        if (cartItems.length > 0) {
          localStorage.setItem("anonymous_cart", JSON.stringify(cartItems))
        } else {
          localStorage.removeItem("anonymous_cart")
        }
      }
    }
  }, [cartItems, user, isLoggedIn, loading])

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) =>
          item.id === product.id &&
          item.selectedSize === product.selectedSize &&
          item.selectedColor === product.selectedColor,
      )

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id &&
          item.selectedSize === product.selectedSize &&
          item.selectedColor === product.selectedColor
            ? { ...item, quantity: (item.quantity || 1) + (product.quantity || 1) }
            : item,
        )
      } else {
        return [...prevItems, { ...product, quantity: product.quantity || 1 }]
      }
    })
  }

  const removeFromCart = (productId, size = null, color = null) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.id === productId &&
            (size === null || item.selectedSize === size) &&
            (color === null || item.selectedColor === color)
          ),
      ),
    )
  }

  const updateQuantity = (productId, quantity, size = null, color = null) => {
    if (quantity < 1) return

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId &&
        (size === null || item.selectedSize === size) &&
        (color === null || item.selectedColor === color)
          ? { ...item, quantity }
          : item,
      ),
    )
  }

  const clearCart = () => {
    setCartItems([])

    if (isLoggedIn && user && user._id) {
      // Clear cart on backend
      const clearCartOnBackend = async () => {
        try {
          const token = localStorage.getItem("token")
          await axios.delete("http://localhost:3002/api/cart", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        } catch (error) {
          console.error("Error clearing cart on backend:", error)
        }
      }

      clearCartOnBackend()
      localStorage.removeItem(`cart_${user._id}`)
    } else {
      localStorage.removeItem("anonymous_cart")
    }
  }

  const login = async (userData) => {
    setUser(userData)
    setIsLoggedIn(true)

    // Fetch user's cart from backend after login
    try {
      const token = localStorage.getItem("token")
      const cartResponse = await axios.get("http://localhost:3002/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (cartResponse.data && cartResponse.data.items && cartResponse.data.items.length > 0) {
        // Use backend cart if it exists
        setCartItems(cartResponse.data.items)
      } else {
        // Check if there's a cart in localStorage for this user
        const userCartString = localStorage.getItem(`cart_${userData._id}`)
        if (userCartString) {
          const userCart = JSON.parse(userCartString)
          setCartItems(userCart)

          // Save this cart to backend
          await axios.post(
            "http://localhost:3002/api/cart",
            { items: userCart },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          )
        } else if (cartItems.length > 0) {
          // If there's an anonymous cart, transfer it to the user
          await axios.post(
            "http://localhost:3002/api/cart",
            { items: cartItems },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          )
          localStorage.setItem(`cart_${userData._id}`, JSON.stringify(cartItems))
        }
      }
    } catch (error) {
      console.error("Error loading user cart on login:", error)
      // Keep current cart if there's an error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    setUser(null)
    clearCart() // Clear cart on logout as requested
  }

  const totalItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)

  const subtotal = cartItems.reduce((total, item) => total + item.price * (item.quantity || 1), 0)

  // Calculate discount for members
  const discount = isLoggedIn ? subtotal * 0.1 : 0
  const discountedTotal = subtotal - discount

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        discountedTotal,
        isLoggedIn,
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
