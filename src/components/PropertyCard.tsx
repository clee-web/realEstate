import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Bed, Bath, Shield, Star } from 'lucide-react'

interface PropertyCardProps {
  id: string
  title: string
  price: string
  location: string
  bedrooms: number
  bathrooms: number
  propertyType: string
  images: string[]
  isVerified?: boolean
  isFeatured?: boolean
}

export default function PropertyCard({
  id,
  title,
  price,
  location,
  bedrooms,
  bathrooms,
  propertyType,
  images,
  isVerified = false,
  isFeatured = false,
}: PropertyCardProps) {
  const formatPrice = (price: string) => {
    const num = parseInt(price)
    if (num >= 1000000) {
      return `KES ${(num / 1000000).toFixed(1)}M`
    }
    return `KES ${num.toLocaleString()}`
  }

  return (
    <Link href={`/property/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 bg-gray-200">
          {images[0] ? (
            <Image
              src={images[0]}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {isFeatured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {isVerified && (
            <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
          <Badge className="absolute bottom-2 left-2 bg-blue-600 hover:bg-blue-700 capitalize">
            {propertyType}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
            {title}
          </h3>
          <p className="text-2xl font-bold text-blue-600 mb-2">
            {formatPrice(price)}
          </p>
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{location}</span>
          </div>
          {bedrooms > 0 || bathrooms > 0 ? (
            <div className="flex gap-4 text-sm text-gray-600">
              {bedrooms > 0 && (
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{bedrooms} bed</span>
                </div>
              )}
              {bathrooms > 0 && (
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{bathrooms} bath</span>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
