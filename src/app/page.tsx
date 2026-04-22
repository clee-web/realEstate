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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
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
      
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Find Your Perfect Property in Kenya
          </h1>
          <p className="text-center text-blue-100 mb-8 text-lg">
            Browse thousands of verified listings from trusted agents
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by location, property type..."
                  className="pl-10 text-gray-900"
                />
              </div>
              <div className="md:w-48">
                <Input placeholder="Min Price (KES)" type="number" className="text-gray-900" />
              </div>
              <div className="md:w-48">
                <Input placeholder="Max Price (KES)" type="number" className="text-gray-900" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Search
              </Button>
            </div>
          </div>
        </div>
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
            Join thousands of Kenyans who found their perfect home through KenyaHomes
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
          <p>&copy; 2024 KenyaHomes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
