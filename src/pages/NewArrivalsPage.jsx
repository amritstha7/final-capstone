"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import ProductGrid from "../components/ProductGrid"
import { Button } from "../components/ui/button"
import { products } from "../data/products"

function NewArrivalsPage() {
  const [newProducts, setNewProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Filter products marked as new
    const newArrivals = products.filter((product) => product.isNew)
    setNewProducts(newArrivals)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="container px-4 py-12 mx-auto text-center">
        <p>Loading new arrivals...</p>
      </div>
    )
  }

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">New Arrivals</span>
      </div>

      <div className="flex flex-col items-center text-center space-y-2 mb-12">
        <h1 className="text-3xl font-bold tracking-tight">New Arrivals</h1>
        <p className="text-muted-foreground max-w-[600px]">
          Discover our latest additions to the collection, featuring the season's most coveted styles
        </p>
      </div>

      <div className="mb-12">
        {newProducts.length > 0 ? (
          <ProductGrid products={newProducts} />
        ) : (
          <div className="text-center py-12">
            <p className="text-lg font-medium">No new arrivals found</p>
            <p className="text-muted-foreground mt-2">Check back soon for our latest products</p>
            <Button asChild className="mt-6">
              <Link to="/products">Browse All Products</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewArrivalsPage
