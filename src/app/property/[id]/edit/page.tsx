'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Sparkles } from 'lucide-react'
import { generatePropertyDescription, generatePropertyTitle } from '@/lib/ai-service'

export default function EditPropertyPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [generatingTitle, setGeneratingTitle] = useState(false)
  const [generatingDescription, setGeneratingDescription] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    county: '',
    town: '',
    estate: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    contactPhone: '',
    contactWhatsapp: '',
  })

  useEffect(() => {
    fetchProperty()
  }, [params.id])

  const fetchProperty = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      setError('Failed to load property')
      setLoading(false)
      return
    }

    if (data) {
      setFormData({
        title: data.title,
        description: data.description,
        price: data.price.toString(),
        county: data.county,
        town: data.town,
        estate: data.estate || '',
        propertyType: data.property_type,
        bedrooms: data.bedrooms?.toString() || '',
        bathrooms: data.bathrooms?.toString() || '',
        contactPhone: data.contact_phone,
        contactWhatsapp: data.contact_whatsapp || '',
      })
      setExistingImages(data.images || [])
    }
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + existingImages.length > 10) {
      setError('Maximum 10 images allowed')
      return
    }

    setImages([...images, ...files])
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index))
  }

  const handleGenerateTitle = async () => {
    if (!formData.propertyType || !formData.county || !formData.town || !formData.price) {
      setError('Please fill in property type, location, and price first')
      return
    }

    setGeneratingTitle(true)
    try {
      const title = await generatePropertyTitle({
        propertyType: formData.propertyType,
        county: formData.county,
        town: formData.town,
        estate: formData.estate,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
      })
      setFormData({ ...formData, title })
    } catch (err: any) {
      setError(err.message || 'Failed to generate title. Please check your Gemini API key.')
    } finally {
      setGeneratingTitle(false)
    }
  }

  const handleGenerateDescription = async () => {
    if (!formData.propertyType || !formData.county || !formData.town || !formData.price) {
      setError('Please fill in property type, location, and price first')
      return
    }

    setGeneratingDescription(true)
    try {
      const description = await generatePropertyDescription({
        propertyType: formData.propertyType,
        county: formData.county,
        town: formData.town,
        estate: formData.estate,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
      })
      setFormData({ ...formData, description })
    } catch (err: any) {
      setError(err.message || 'Failed to generate description. Please check your Gemini API key.')
    } finally {
      setGeneratingDescription(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // Upload new images to Supabase storage (optional)
      const uploadedUrls: string[] = []
      if (images.length > 0) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `properties/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('property_images')
            .upload(filePath, image)

          if (uploadError) {
            throw uploadError
          }

          const { data: { publicUrl } } = supabase.storage
            .from('property_images')
            .getPublicUrl(filePath)

          uploadedUrls.push(publicUrl)
        }
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedUrls]

      // Update property in database
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          county: formData.county,
          town: formData.town,
          estate: formData.estate,
          property_type: formData.propertyType,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          contact_phone: formData.contactPhone,
          contact_whatsapp: formData.contactWhatsapp || formData.contactPhone,
          images: allImages,
        })
        .eq('id', params.id)

      if (updateError) {
        throw updateError
      }

      router.push('/admin')
    } catch (err: any) {
      setError(err.message || 'Failed to update property')
    } finally {
      setSaving(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Property</CardTitle>
            <CardDescription>
              Update the property details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Details</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="title">Property Title *</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleGenerateTitle}
                      disabled={generatingTitle}
                      className="text-xs"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {generatingTitle ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </div>
                  <Input
                    id="title"
                    placeholder="e.g., Modern 3-Bedroom Apartment in Kilimani"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="description">Description *</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleGenerateDescription}
                      disabled={generatingDescription}
                      className="text-xs"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {generatingDescription ? 'Generating...' : 'AI Generate'}
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    placeholder="Describe your property in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (KES) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 4500000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bedsitter">Bedsitter</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      placeholder="e.g., 3"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      placeholder="e.g., 2"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="county">County *</Label>
                    <Input
                      id="county"
                      placeholder="e.g., Nairobi"
                      value={formData.county}
                      onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="town">Town/Area *</Label>
                    <Input
                      id="town"
                      placeholder="e.g., Kilimani"
                      value={formData.town}
                      onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estate">Estate/Street (Optional)</Label>
                  <Input
                    id="estate"
                    placeholder="e.g., Ring Road Parklands"
                    value={formData.estate}
                    onChange={(e) => setFormData({ ...formData, estate: e.target.value })}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Images</h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="images"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-600">Click to upload more images</p>
                    <p className="text-sm text-gray-400">Maximum 10 images total</p>
                  </label>
                </div>

                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Existing images:</p>
                    <div className="grid grid-cols-4 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {images.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">New images to upload:</p>
                    <div className="grid grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone Number *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="e.g., +254712345678"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactWhatsapp">WhatsApp Number (Optional)</Label>
                  <Input
                    id="contactWhatsapp"
                    type="tel"
                    placeholder="e.g., +254712345678"
                    value={formData.contactWhatsapp}
                    onChange={(e) => setFormData({ ...formData, contactWhatsapp: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
