"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ChevronLeft, CreditCard, ShieldCheck } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Separator } from "../components/ui/separator"
import { useCart } from "../context/CartProvider"
import axios from "axios"

// Map of product IDs to valid MongoDB ObjectIds
// These are sample valid ObjectIds - they don't need to match actual products in your DB
// MongoDB will just check if they're valid ObjectIds
const PRODUCT_ID_MAP = {
  1: "507f1f77bcf86cd799439011",
  2: "507f1f77bcf86cd799439012",
  3: "507f1f77bcf86cd799439013",
  4: "507f1f77bcf86cd799439014",
  5: "507f1f77bcf86cd799439015",
  6: "507f1f77bcf86cd799439016",
  7: "507f1f77bcf86cd799439017",
  8: "507f1f77bcf86cd799439018",
  9: "507f1f77bcf86cd799439019",
  10: "507f1f77bcf86cd799439020",
  11: "507f1f77bcf86cd799439021",
  12: "507f1f77bcf86cd799439022",
}

function CheckoutPage() {
  const { cartItems, subtotal, clearCart, isLoggedIn, user, discount, discountedTotal } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [orderId, setOrderId] = useState("12345")
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
    paymentMethod: "card",
    shippingMethod: "standard",
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to login if not logged in
    if (!isLoggedIn && !isComplete) {
      navigate("/login", {
        state: {
          message: "Please log in to complete your purchase",
          returnUrl: "/checkout",
        },
      })
    }
  }, [isLoggedIn, navigate, isComplete])

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
      }))
    }
  }, [user])

  if (cartItems.length === 0 && !isComplete) {
    return (
      <div className="container px-4 py-12 mx-auto text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-4">You need to add items to your cart before checking out.</p>
        <Button asChild className="mt-6">
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="container px-4 py-12 mx-auto max-w-md">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <ShieldCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Thank you for your purchase. Your order has been confirmed and will be shipped soon.</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium">Order #{orderId}</p>
              <p className="text-sm text-muted-foreground">A confirmation email has been sent to {formData.email}.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "state", "zip"]

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required"
      }
    })

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }

    // Zip code validation
    if (formData.zip && !/^\d{5}(-\d{4})?$/.test(formData.zip)) {
      newErrors.zip = "Please enter a valid zip code"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector(".text-red-500")
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate prices
      const itemsPrice = isLoggedIn ? discountedTotal : subtotal
      const taxPrice = itemsPrice * 0.07
      const shippingPrice = formData.shippingMethod === "express" ? 9.99 : 0
      const totalPrice = itemsPrice + taxPrice + shippingPrice

      // Create order object
      const orderData = {
        orderItems: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity || 1,
          image: item.image || "/placeholder.svg",
          price: item.price,
          selectedSize: item.selectedSize || "",
          selectedColor: item.selectedColor || "",
          // Use the mapped MongoDB ObjectId for this product
          product: PRODUCT_ID_MAP[item.id] || PRODUCT_ID_MAP[1],
        })),
        shippingAddress: {
          address: formData.address + (formData.apartment ? `, ${formData.apartment}` : ""),
          city: formData.city,
          postalCode: formData.zip,
          country: "United States", // Default to US or add country field to form
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: itemsPrice,
        taxPrice: taxPrice,
        shippingPrice: shippingPrice,
        totalPrice: totalPrice,
      }

      console.log("Sending order data:", orderData)

      // Send order to backend
      const token = localStorage.getItem("token")
      const response = await axios.post("http://localhost:3002/api/orders", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Set order ID from response
      setOrderId(response.data._id)

      // Clear cart after successful order
      clearCart()

      // Show order confirmation
      setIsComplete(true)
    } catch (error) {
      console.error("Error creating order:", error)
      alert(
        "There was a problem processing your order. Please try again: " +
          (error.response?.data?.message || error.message),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container px-4 py-12 mx-auto max-w-6xl">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/cart">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Cart
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(123) 456-7890"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={errors.address ? "border-red-500" : ""}
                    />
                    {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                    <Input id="apartment" name="apartment" value={formData.apartment} onChange={handleChange} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={errors.state ? "border-red-500" : ""}
                      />
                      {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        className={errors.zip ? "border-red-500" : ""}
                      />
                      {errors.zip && <p className="text-xs text-red-500">{errors.zip}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    defaultValue="card"
                    className="space-y-3"
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                  >
                    <div className="flex items-center space-x-3 space-y-0 border rounded-md p-4">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-2" />
                          <span>Credit/Debit Card</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0 border rounded-md p-4">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex-1">
                        <div className="flex items-center">
                          <span>PayPal</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.paymentMethod === "card" && (
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input id="cardName" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipping Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    defaultValue="standard"
                    className="space-y-3"
                    value={formData.shippingMethod}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, shippingMethod: value }))}
                  >
                    <div className="flex items-center space-x-3 space-y-0 border rounded-md p-4">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1">
                        <div className="flex justify-between">
                          <span>Standard Shipping</span>
                          <span>Free</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Delivery in 5-7 business days</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 space-y-0 border rounded-md p-4">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-1">
                        <div className="flex justify-between">
                          <span>Express Shipping</span>
                          <span>$9.99</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Delivery in 2-3 business days</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <div className="lg:hidden">
                <OrderSummary
                  cartItems={cartItems}
                  subtotal={subtotal}
                  discount={discount}
                  discountedTotal={discountedTotal}
                  isLoggedIn={isLoggedIn}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="hidden lg:block">
          <OrderSummary
            cartItems={cartItems}
            subtotal={subtotal}
            discount={discount}
            discountedTotal={discountedTotal}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>
    </div>
  )
}

function OrderSummary({ cartItems, subtotal, discount, discountedTotal, isLoggedIn }) {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-sm font-medium">${(item.price * (item.quantity || 1)).toFixed(2)}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.selectedSize && `Size: ${item.selectedSize}`}
                  {item.selectedColor && `, Color: ${item.selectedColor}`}
                </p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity || 1}</p>
              </div>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {isLoggedIn && discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Member Discount (10%)</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (7%)</span>
          <span>${(subtotal * 0.07).toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>${(isLoggedIn ? discountedTotal : subtotal + subtotal * 0.07).toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default CheckoutPage
