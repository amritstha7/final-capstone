"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, Search, ShoppingCart, User, X, LogOut, Package } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useCart } from "../context/CartProvider"

function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { cartItems, isLoggedIn, user, logout, loading } = useCart()
  const cartItemCount = cartItems.length
  const navigate = useNavigate()
  const profileRef = useRef(null)
  const mobileMenuRef = useRef(null)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [profileRef, mobileMenuRef])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <Link to="/" className="ml-4 md:ml-0 flex items-center gap-2">
          <span className="text-xl font-bold">Aquarius Aura</span>
        </Link>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="absolute top-16 left-0 w-full bg-background border-b shadow-lg md:hidden z-50"
          >
            <nav className="flex flex-col p-4 space-y-4">
              <Link
                to="/"
                className="font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Products
              </Link>
              <Link
                to="/products/men"
                className="font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Men
              </Link>
              <Link
                to="/products/women"
                className="font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Women
              </Link>
              <Link
                to="/products/accessories"
                className="font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accessories
              </Link>
              <Link
                to="/new-arrivals"
                className="font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                New Arrivals
              </Link>
              <Link
                to="/member-benefits"
                className="font-medium transition-colors hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Member Benefits
              </Link>
            </nav>
          </div>
        )}

        <nav className="mx-6 hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className="font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/products" className="font-medium transition-colors hover:text-primary">
            All Products
          </Link>
          <Link to="/products/men" className="font-medium transition-colors hover:text-primary">
            Men
          </Link>
          <Link to="/products/women" className="font-medium transition-colors hover:text-primary">
            Women
          </Link>
          <Link to="/products/accessories" className="font-medium transition-colors hover:text-primary">
            Accessories
          </Link>
          <Link to="/new-arrivals" className="font-medium transition-colors hover:text-primary">
            New Arrivals
          </Link>
          <Link to="/member-benefits" className="font-medium transition-colors hover:text-primary">
            Member Benefits
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-[200px] md:w-[300px]"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close search</span>
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {loading ? (
            <div className="h-10 w-10 flex items-center justify-center">
              <span className="animate-pulse">...</span>
            </div>
          ) : isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="relative"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Your Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Your Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsProfileOpen(false)
                        navigate("/")
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate("/login")}>
                <User className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/signup")}>
                Sign Up
              </Button>
            </div>
          )}

          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
