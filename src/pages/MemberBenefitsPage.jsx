import { Link } from "react-router-dom"
import { Check, Gift, Truck, Tag, CreditCard, Award } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { useCart } from "../context/CartProvider"

function MemberBenefitsPage() {
  const { isLoggedIn } = useCart()

  const benefits = [
    {
      icon: <Tag className="h-10 w-10 text-primary" />,
      title: "10% Off Every Purchase",
      description: "Members receive an automatic 10% discount on all items, all the time. No coupon codes needed.",
    },
    {
      icon: <Truck className="h-10 w-10 text-primary" />,
      title: "Free Shipping",
      description:
        "Enjoy free standard shipping on all orders over $50, with no minimum purchase required for members.",
    },
    {
      icon: <Gift className="h-10 w-10 text-primary" />,
      title: "Exclusive Offers",
      description: "Get access to member-only sales, early access to new collections, and special seasonal discounts.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-primary" />,
      title: "Rewards Program",
      description: "Earn points with every purchase that can be redeemed for discounts on future orders.",
    },
    {
      icon: <Award className="h-10 w-10 text-primary" />,
      title: "Birthday Gift",
      description: "Receive a special gift or discount during your birthday month as our way of celebrating with you.",
    },
  ]

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Member Benefits</h1>
        <p className="text-muted-foreground max-w-[700px]">
          Join our membership program today and unlock exclusive benefits that enhance your shopping experience.
        </p>
        {!isLoggedIn && (
          <div className="flex gap-4 mt-4">
            <Button asChild size="lg">
              <Link to="/signup">Join Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        )}
      </div>

      {isLoggedIn && (
        <div className="bg-primary/5 p-8 rounded-lg text-center mb-12">
          <h2 className="text-2xl font-bold">You're a Member!</h2>
          <p className="mt-2 text-muted-foreground">
            You're already enjoying all the benefits of our membership program. Thank you for being a valued member!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {benefits.map((benefit, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-primary/10">{benefit.icon}</div>
              <h3 className="text-xl font-bold">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="text-lg font-bold">Create an Account</h3>
            <p className="text-muted-foreground">
              Sign up for a free account to become a member and start enjoying benefits immediately.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="text-lg font-bold">Shop and Save</h3>
            <p className="text-muted-foreground">
              Your 10% discount is automatically applied at checkout. No codes to remember.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="text-lg font-bold">Earn Rewards</h3>
            <p className="text-muted-foreground">
              Accumulate points with every purchase that can be redeemed for future discounts.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 bg-primary/5 p-8 rounded-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-bold">Ready to Join?</h2>
            <p className="text-muted-foreground max-w-[500px]">
              Become a member today and start enjoying exclusive benefits with your very first purchase.
            </p>
            <ul className="space-y-2">
              {["10% off every purchase", "Free shipping on orders over $50", "Exclusive offers and early access"].map(
                (item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>{item}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
          {!isLoggedIn ? (
            <Button asChild size="lg" className="min-w-[150px]">
              <Link to="/signup">Join Now</Link>
            </Button>
          ) : (
            <div className="bg-white p-4 rounded-lg">
              <p className="font-medium text-green-600">You're already a member!</p>
              <Button asChild variant="outline" className="mt-2">
                <Link to="/products">Continue Shopping</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MemberBenefitsPage
