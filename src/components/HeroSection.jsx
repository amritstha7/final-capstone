import { Link } from "react-router-dom"
import { Button } from "./ui/button"

function HeroSection() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10" />
      <div className="relative h-[70vh] flex items-center justify-start">
        <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline>
          <source
            src="/vid.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        <div className="container px-4 mx-auto relative z-20">
          <div className="max-w-lg space-y-6 text-white">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">New Season Collection</h1>
            <p className="text-lg md:text-xl">
              Discover our latest styles crafted with premium materials for exceptional comfort and timeless elegance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90">
                <Link to="/products">Shop Now</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-white hover:bg-white/20"
              >
                <Link to="/new-arrivals">New Arrivals</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
