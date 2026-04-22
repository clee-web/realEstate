'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import PropertyCard from '@/components/PropertyCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function CheapDealsPage() {
  const supabase = createClient()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCheapDeals()
  }, [])

  const fetchCheapDeals = async () => {
    setLoading(true)
    // Fetch properties under 500,000 KES
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .lte('price', 500000)
      .order('price', { ascending: true })

    if (error) {
      console.error('Error fetching cheap deals:', error)
    } else {
      setProperties(data || [])
    }
    setLoading(false)
  }

  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cheap Deals Under KES 500,000</h1>
          <p className="text-gray-600">Affordable properties for budget-conscious buyers</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p>Loading deals...</p>
          </div>
        ) : properties.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No cheap deals available at the moment</p>
              <Button onClick={() => window.location.href = '/properties'} variant="outline">
                Browse All Properties
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600">{properties.length} affordable properties found</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  title={property.title}
                  price={property.price.toString()}
                  location={`${property.county}, ${property.town}`}
                  bedrooms={property.bedrooms || 0}
                  bathrooms={property.bathrooms || 0}
                  propertyType={property.property_type}
                  images={property.images || []}
                  isVerified={property.is_verified}
                  isFeatured={property.is_featured}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
