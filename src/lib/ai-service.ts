import { GoogleGenAI } from "@google/genai";

export interface PropertyDetails {
  propertyType: string
  bedrooms?: number
  bathrooms?: number
  county: string
  town: string
  estate?: string
  price: number
}

export async function generatePropertyDescription(details: PropertyDetails): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const model = "gemini-1.5-flash"

    const prompt = `You are a professional real estate copywriter for KenyaHomes, a leading real estate platform in Kenya. Write compelling, professional property descriptions that highlight key features and appeal to potential buyers/renters. Keep descriptions between 150-250 words. Use appropriate real estate terminology for the Kenyan market.

Write a professional property description for:
- Property Type: ${details.propertyType}
- Location: ${details.estate ? `${details.estate}, ` : ''}${details.town}, ${details.county}
- Price: KES ${details.price.toLocaleString()}
- Bedrooms: ${details.bedrooms || 'N/A'}
- Bathrooms: ${details.bathrooms || 'N/A'}

Focus on the location, property features, and value proposition. Make it sound professional and attractive to potential buyers.`

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    })

    return response.text?.trim() || ''
  } catch (error: any) {
    console.error('Error generating property description:', error)
    throw error
  }
}

export async function generatePropertyTitle(details: PropertyDetails): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const model = "gemini-1.5-flash"

    const prompt = `You are a professional real estate copywriter. Generate catchy, professional property titles for listings in Kenya. Keep titles under 60 characters.

Generate a property title for:
- Property Type: ${details.propertyType}
- Location: ${details.town}, ${details.county}
- Bedrooms: ${details.bedrooms || 'N/A'}
- Price: KES ${details.price.toLocaleString()}

Make it appealing and professional.`

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    })

    return response.text?.trim() || ''
  } catch (error: any) {
    console.error('Error generating property title:', error)
    throw error
  }
}
