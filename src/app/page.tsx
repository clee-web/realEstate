'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import PropertyCard from '@/components/PropertyCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Home, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const supabase = createClient()
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([])
  const [latestProperties, setLatestProperties] = useState<any[]>([])
  const [heroProperties, setHeroProperties] = useState<any[]>([])
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (heroProperties.length > 0) {
        setCurrentHeroIndex((prev) => (prev + 1) % heroProperties.length)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [heroProperties])

  const fetchProperties = async () => {
    const { data: heroData } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .not('images', 'is', null)
      .limit(5)
      .order('created_at', { ascending: false })

    if (heroData) setHeroProperties(heroData)

    const { data: featuredData } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .eq('is_featured', true)
      .limit(6)
      .order('created_at', { ascending: false })

    if (featuredData) setFeaturedProperties(featuredData)

    const { data: latestData } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .limit(8)
      .order('created_at', { ascending: false })

    if (latestData) setLatestProperties(latestData)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Property Slideshow */}
      <section className="relative h-[600px] overflow-hidden">
        {/* Background Image Slideshow */}
        <div className="absolute inset-0">
          {heroProperties.length > 0 ? (
            heroProperties.map((property, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {property.images && property.images.length > 0 && (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              </div>
            ))
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800" />
          )}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Find Your Dream Property in Kisumu
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Discover premium properties in Kenya's fastest-growing real estate market
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-2xl p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search by location, property type..."
                    className="pl-10 text-gray-900 h-12"
                  />
                </div>
                <div className="md:w-48">
                  <Input placeholder="Min Price (KES)" type="number" className="text-gray-900 h-12" />
                </div>
                <div className="md:w-48">
                  <Input placeholder="Max Price (KES)" type="number" className="text-gray-900 h-12" />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-lg">
                  Search
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-8 text-white">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-gray-300">Properties</div>
              </div>
              <div>
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-gray-300">Happy Clients</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50+</div>
                <div className="text-gray-300">Trusted Agents</div>
              </div>
            </div>
          </div>
        </div>

        {/* Slideshow Indicators */}
        {heroProperties.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {heroProperties.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHeroIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentHeroIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Categories */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/properties?type=apartment" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center">
            <Home className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Apartments</h3>
          </Link>
          <Link href="/properties?type=house" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center">
            <Home className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold text-gray-900">Houses</h3>
          </Link>
          <Link href="/properties?type=land" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Land</h3>
          </Link>
          <Link href="/deals" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Cheap Deals</h3>
          </Link>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
          <Link href="/properties?featured=true" className="text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading featured properties...</p>
        ) : featuredProperties.length === 0 ? (
          <p className="text-gray-500">No featured properties available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.slice(0, 3).map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                price={property.price.toString()}
                location={`${property.county}, ${property.town}`}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                propertyType={property.property_type}
                images={property.images || ['/placeholder.jpg']}
                isVerified={property.is_verified}
                isFeatured={property.is_featured}
              />
            ))}
          </div>
        )}
      </section>

      {/* Latest Properties */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Properties</h2>
          <Link href="/properties" className="text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading latest properties...</p>
        ) : latestProperties.length === 0 ? (
          <p className="text-gray-500">No properties available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProperties.slice(0, 4).map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                price={property.price.toString()}
                location={`${property.county}, ${property.town}`}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                propertyType={property.property_type}
                images={property.images || ['/placeholder.jpg']}
                isVerified={property.is_verified}
                isFeatured={property.is_featured}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Property?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of Kenyans who found their perfect home through Kisumu Homes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Browse Properties
              </Button>
            </Link>
            <Link href="/property/new">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8">
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 px-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Kisumu Homes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
