/**
 * Per-user AI usage limits to prevent runaway API costs.
 * Tracks daily usage in Firestore and blocks calls when limits are exceeded.
 */

import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  increment,
  serverTimestamp
} from 'firebase/firestore'
import { db, auth } from '../firebase'

const AI_USAGE_COLLECTION = 'aiUsage'

// Configurable limits (can be overridden via env)
const DEFAULT_LIMITS = {
  chat: parseInt(import.meta.env.VITE_AI_LIMIT_CHAT, 10) || 30,
  extract: parseInt(import.meta.env.VITE_AI_LIMIT_EXTRACT, 10) || 10,
  interpret: parseInt(import.meta.env.VITE_AI_LIMIT_INTERPRET, 10) || 20,
  describe: parseInt(import.meta.env.VITE_AI_LIMIT_DESCRIBE, 10) || 10,
  image: parseInt(import.meta.env.VITE_AI_LIMIT_IMAGE, 10) || 5
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function getUsageDocRef(userId) {
  const dateKey = getTodayKey()
  return doc(db, AI_USAGE_COLLECTION, `${userId}_${dateKey}`)
}

/**
 * Check if user can make an AI request of given type. Throws if over limit or not authenticated.
 */
export async function checkAndConsumeLimit(actionType) {
  const user = auth.currentUser
  if (!user) throw new Error('Please log in to use AI features.')

  const limit = DEFAULT_LIMITS[actionType]
  if (!limit || limit < 0) throw new Error(`Invalid limit config for ${actionType}`)

  const docRef = getUsageDocRef(user.uid)

  const result = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(docRef)
    const current = snap.exists() ? snap.data()[actionType] || 0 : 0

    if (current >= limit) {
      return { allowed: false, current, limit }
    }

    const updates = {
      [actionType]: increment(1),
      updatedAt: serverTimestamp()
    }
    if (!snap.exists()) {
      transaction.set(docRef, {
        userId: user.uid,
        dateKey: getTodayKey(),
        chat: 0,
        extract: 0,
        interpret: 0,
        describe: 0,
        image: 0,
        ...updates,
        createdAt: serverTimestamp()
      })
    } else {
      transaction.update(docRef, updates)
    }
    return { allowed: true, current: current + 1, limit }
  })

  if (!result.allowed) {
    throw new Error(
      `Daily AI limit reached for ${actionType} (${result.current}/${result.limit}). Limits reset at midnight.`
    )
  }
}

/**
 * Get current usage for the authenticated user (for display in UI).
 */
export async function getUsage() {
  const user = auth.currentUser
  if (!user) return null

  const docRef = getUsageDocRef(user.uid)
  const snap = await getDoc(docRef)
  if (!snap.exists()) {
    return Object.fromEntries(Object.keys(DEFAULT_LIMITS).map(k => [k, 0]))
  }
  const data = snap.data()
  return {
    chat: data.chat || 0,
    extract: data.extract || 0,
    interpret: data.interpret || 0,
    describe: data.describe || 0,
    image: data.image || 0
  }
}

/**
 * Get limits (for display in UI).
 */
export function getLimits() {
  return { ...DEFAULT_LIMITS }
}
