import { createClient } from './supabase/client'

/**
 * Check for duplicate listings based on phone number and similar images
 */
export async function checkForDuplicates(
  contactPhone: string,
  images: string[]
): Promise<boolean> {
  const supabase = createClient()

  // Check for listings with the same phone number
  const { data: phoneMatches } = await supabase
    .from('properties')
    .select('id, images, title, created_at')
    .eq('contact_phone', contactPhone)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!phoneMatches || phoneMatches.length === 0) {
    return false
  }

  // Check if any of the images match (simple URL comparison)
  // In production, you might want to use image hashing for more robust detection
  for (const listing of phoneMatches) {
    if (listing.images && listing.images.length > 0) {
      const matchingImages = listing.images.filter((img: string) =>
        images.includes(img)
      )
      if (matchingImages.length > 0) {
        return true // Duplicate found
      }
    }
  }

  return false
}

/**
 * Mark suspicious listings for review
 */
export async function flagSuspiciousListing(propertyId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('properties')
    .update({ status: 'pending' })
    .eq('id', propertyId)

  return { error }
}
