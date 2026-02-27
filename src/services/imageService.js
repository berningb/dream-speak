/**
 * Dream image generation via Google Nano Banana (Gemini 2.5 Flash Image).
 * Uses generateContent with responseModalities, not generateImages.
 */

import { GoogleGenAI } from '@google/genai'
import { checkAndConsumeLimit } from './aiLimitService'

export async function generateDreamImage(prompt) {
  await checkAndConsumeLimit('image')
  const apiKey = import.meta.env.VITE_NANOBANANA_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('VITE_NANOBANANA_API_KEY (or VITE_GOOGLE_API_KEY) is not set. Add it to .env from aistudio.google.com.')
  }

  const ai = new GoogleGenAI({ apiKey })

  const imagePrompt = prompt.length > 500 ? prompt.slice(0, 500) : prompt
  const requestPrompt = `Create a single image. No text or caption. Dreamlike, surreal art style. Scene: ${imagePrompt}`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: requestPrompt,
    config: { responseModalities: ['IMAGE', 'TEXT'] }
  })

  const parts = response?.candidates?.[0]?.content?.parts || []
  const imagePart = parts.find(p => p.inlineData)
  const imageBytes = imagePart?.inlineData?.data
  if (!imageBytes) {
    const textPart = parts.find(p => p.text)
    const hint = textPart?.text ? ' (Model returned text instead of image. The scene may have triggered a content filter.)' : ''
    throw new Error(`No image in response${hint}`)
  }

  const mimeType = imagePart.inlineData.mimeType || 'image/png'
  return `data:${mimeType};base64,${imageBytes}`
}
