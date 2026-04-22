'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Bed, Bath, Shield, Phone, MessageCircle, Share2, Heart, Flag, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function PropertyDetailsPage() {
  const params = useParams()
  const supabase = createClient()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showInquiryDialog, setShowInquiryDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)

  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const [reportForm, setReportForm] = useState({
    reason: '',
    description: '',
  })

  useEffect(() => {
    fetchProperty()
  }, [params.id])

  const fetchProperty = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*, profiles(full_name, phone)')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching property:', error)
    } else if (data) {
      setProperty(data)
      // Increment view count
      try {
        await supabase.rpc('increment_view_count', { property_id: params.id })
      } catch (err) {
        console.error('Error incrementing view count:', err)
      }
    }
    setLoading(false)
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('inquiries').insert({
      property_id: params.id,
      name: inquiryForm.name,
      email: inquiryForm.email,
      phone: inquiryForm.phone,
      message: inquiryForm.message,
    })

    if (!error) {
      setShowInquiryDialog(false)
      setInquiryForm({ name: '', email: '', phone: '', message: '' })
      alert('Inquiry sent successfully!')
    }
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('reports').insert({
      property_id: params.id,
      reporter_id: user?.id,
      reason: reportForm.reason,
      description: reportForm.description,
    })

    if (!error) {
      setShowReportDialog(false)
      setReportForm({ reason: '', description: '' })
      alert('Report submitted successfully!')
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `KES ${(price / 1000000).toFixed(1)}M`
    }
    return `KES ${price.toLocaleString()}`
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p>Property not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link href="/properties" className="inline-flex items-center text-blue-600 hover:underline mb-6">
          ← Back to Properties
        </Link>

        {/* Image Gallery */}
        <div className="relative bg-gray-200 rounded-lg overflow-hidden mb-6" style={{ height: '500px' }}>
          {property.images && property.images.length > 0 ? (
            <>
              <img
                src={property.images[currentImageIndex]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {property.images.map((_: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Images Available
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {property.is_featured && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600">Featured</Badge>
            )}
            {property.is_verified && (
              <Badge className="bg-green-500 hover:bg-green-600">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="outline" size="icon" className="bg-white">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="bg-white">
              <Share2 className="h-4 w-4" />
            </Button>
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white">
                  <Flag className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report This Listing</DialogTitle>
                  <DialogDescription>
                    Help us keep Kisumu Homes safe by reporting suspicious listings
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Input
                      placeholder="e.g., Fake listing, wrong price"
                      value={reportForm.reason}
                      onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Provide more details..."
                      value={reportForm.description}
                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">Submit Report</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{property.county}, {property.town}{property.estate && `, ${property.estate}`}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">{formatPrice(property.price)}</p>
                    <Badge className="capitalize">{property.property_type}</Badge>
                  </div>
                </div>

                {property.bedrooms > 0 || property.bathrooms > 0 ? (
                  <div className="flex gap-6 mb-6">
                    {property.bedrooms > 0 && (
                      <div className="flex items-center text-gray-600">
                        <Bed className="h-5 w-5 mr-2" />
                        <span>{property.bedrooms} Bedrooms</span>
                      </div>
                    )}
                    {property.bathrooms > 0 && (
                      <div className="flex items-center text-gray-600">
                        <Bath className="h-5 w-5 mr-2" />
                        <span>{property.bathrooms} Bathrooms</span>
                      </div>
                    )}
                  </div>
                ) : null}

                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Map Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Location</h3>
                {property.latitude && property.longitude ? (
                  <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                    <p className="text-gray-500">Map view would be displayed here</p>
                  </div>
                ) : (
                  <p className="text-gray-500">GPS coordinates not available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Contact Agent</h3>
                {property.profiles && (
                  <div className="mb-6">
                    <p className="font-semibold">{property.profiles.full_name}</p>
                    {property.is_verified && (
                      <Badge className="bg-green-500 hover:bg-green-600 mt-2">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified Agent
                      </Badge>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                    <a
                      href={`https://wa.me/${property.contact_whatsapp?.replace(/\+/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                    <a href={`tel:${property.contact_phone}`} className="flex items-center justify-center">
                      <Phone className="h-5 w-5 mr-2" />
                      Call Now
                    </a>
                  </Button>
                  <Dialog open={showInquiryDialog} onOpenChange={setShowInquiryDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Send Inquiry
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Inquiry</DialogTitle>
                        <DialogDescription>
                          Send a message to the property owner
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleInquirySubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            placeholder="Your name"
                            value={inquiryForm.name}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={inquiryForm.email}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone *</Label>
                          <Input
                            type="tel"
                            placeholder="Your phone number"
                            value={inquiryForm.phone}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Message</Label>
                          <Textarea
                            placeholder="I'm interested in this property..."
                            value={inquiryForm.message}
                            onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                          />
                        </div>
                        <Button type="submit" className="w-full">Send Inquiry</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Safety Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Meet in a safe public place</li>
                  <li>• Inspect the property before payment</li>
                  <li>• Verify ownership documents</li>
                  <li>• Don't pay full amount upfront</li>
                  <li>• Use trusted payment methods</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
