/**
 * DeepSeek chat API service.
 * Uses deepseek-chat (V3.2); context caching gives automatic cache hits for repeated prefixes.
 */

import { checkAndConsumeLimit } from './aiLimitService'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const MODEL = 'deepseek-chat'

export async function chatWithDeepSeek(messages, options = {}) {
  await checkAndConsumeLimit('chat')
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('VITE_DEEPSEEK_API_KEY is not set. Add it to .env to use the dream workflow.')
  }

  const res = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 2048
    })
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `DeepSeek API error: ${res.status}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('No response from DeepSeek')
  return content
}

/**
 * Extract structured dream data from conversation using DeepSeek.
 */
export async function extractDreamFromConversation(messages) {
  await checkAndConsumeLimit('extract')
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('VITE_DEEPSEEK_API_KEY is not set.')
  }

  const systemPrompt = `You are a dream journal assistant. Extract structured dream data from the conversation below.
Return ONLY valid JSON matching this schema. No markdown, no explanation.
{
  "title": "short evocative title",
  "content": "full dream description/narrative",
  "type": "sweet" | "lucid" | "nightmare",
  "mood": "Peaceful" | "Exciting" | "Scary" | "Confusing" | "Happy" | "Sad" | "Wonder" | "Curious",
  "emotions": ["array", "of", "emotions"],
  "colors": ["array", "of", "colors"],
  "people": ["people", "mentioned"],
  "places": ["places", "mentioned"],
  "things": ["objects", "mentioned"],
  "tags": ["relevant", "tags"],
  "sereneElements": [],
  "positiveSymbols": [],
  "realityChecks": [],
  "controlLevel": "Low" | "Medium" | "High",
  "techniques": [],
  "clarity": "1" | "2" | "3" | "4" | "5",
  "intensity": 5,
  "trigger": "",
  "resolution": "",
  "wokeUp": false
}
Only include type-specific fields when type matches. Use empty arrays/strings when unknown.`

  const extractMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
    { role: 'user', content: 'Extract the dream data as JSON.' }
  ]

  const response = await chatWithDeepSeek(extractMessages, { temperature: 0.3 })
  const cleaned = response.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
  return JSON.parse(cleaned)
}

/**
 * Generate a brief AI interpretation of a dream based on its content.
 */
export async function interpretDream(dreamContent) {
  await checkAndConsumeLimit('interpret')
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('VITE_DEEPSEEK_API_KEY is not set. Add it to .env to use dream interpretation.')
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a thoughtful dream interpreter. Provide a brief, encouraging interpretation (2-4 sentences) that highlights potential themes, symbols, or emotions. Avoid medical or diagnostic language. Be warm and reflective.'
    },
    {
      role: 'user',
      content: dreamContent
    }
  ]

  return chatWithDeepSeek(messages, { temperature: 0.6, max_tokens: 300 })
}

/**
 * Expand or describe a dream from brief notes into a richer narrative.
 */
export async function describeDream(input) {
  await checkAndConsumeLimit('describe')
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('VITE_DEEPSEEK_API_KEY is not set. Add it to .env to use AI dream description.')
  }

  const prompt = input?.trim() || 'A dream'
  const messages = [
    {
      role: 'system',
      content: 'You are a dream journal assistant. Expand the user\'s brief notes or fragments into a vivid, flowing dream narrative (2-4 paragraphs). Write in first person as if the dreamer is recounting the dream. Preserve any specific details they mention. Add sensory details and atmosphere where it feels natural. Do not add interpretation or analysis, only the dream description.'
    },
    {
      role: 'user',
      content: prompt
    }
  ]

  return chatWithDeepSeek(messages, { temperature: 0.7, max_tokens: 800 })
}
