/**
 * In-memory cache for dreams and dream lists to avoid redundant Firestore reads when navigating.
 * Images are cached by the browser (same URL = cached). This cache targets document fetches.
 */

const DREAM_TTL_MS = 5 * 60 * 1000       // 5 min for individual dreams
const LIST_TTL_MS = 2 * 60 * 1000       // 2 min for list queries

const dreamCache = new Map()            // dreamId -> { data, fetchedAt }
const listCache = new Map()             // queryKey -> { dreams, lastDoc, hasMore, fetchedAt }

function isStale(fetchedAt, ttlMs) {
  return Date.now() - fetchedAt > ttlMs
}

export function getCachedDream(dreamId) {
  const entry = dreamCache.get(dreamId)
  if (!entry || isStale(entry.fetchedAt, DREAM_TTL_MS)) return null
  return entry.data
}

export function setCachedDream(dreamId, data) {
  if (!dreamId) return
  dreamCache.set(dreamId, { data, fetchedAt: Date.now() })
}

export function invalidateDream(dreamId) {
  dreamCache.delete(dreamId)
}

export function invalidateAllDreams() {
  dreamCache.clear()
}

export function invalidateLists() {
  listCache.clear()
}

/**
 * @param {'myDreams'|'publicDreams'} type
 * @param {number} pageSize
 * @param {object|null} lastDoc - Firestore snapshot or null for first page
 * @param {string[]|null} tagFilter - for publicDreams only
 * @param {string} [userId] - for myDreams, to avoid serving wrong user's data
 */
export function getCachedList(type, pageSize, lastDoc, tagFilter = null, userId = '') {
  const cursorKey = lastDoc?.id ?? 'first'
  const tagKey = (tagFilter && tagFilter.length > 0) ? tagFilter.slice().sort().join(',') : ''
  const queryKey = type === 'myDreams'
    ? `myDreams:${userId}:${pageSize}:${cursorKey}`
    : `publicDreams:${pageSize}:${tagKey}:${cursorKey}`

  const entry = listCache.get(queryKey)
  if (!entry || isStale(entry.fetchedAt, LIST_TTL_MS)) return null
  return { dreams: entry.dreams, lastDoc: entry.lastDoc, hasMore: entry.hasMore }
}

export function setCachedList(type, pageSize, lastDoc, tagFilter, result, userId = '') {
  const cursorKey = lastDoc?.id ?? 'first'
  const tagKey = (tagFilter && tagFilter.length > 0) ? tagFilter.slice().sort().join(',') : ''
  const queryKey = type === 'myDreams'
    ? `myDreams:${userId}:${pageSize}:${cursorKey}`
    : `publicDreams:${pageSize}:${tagKey}:${cursorKey}`

  listCache.set(queryKey, {
    dreams: result.dreams,
    lastDoc: result.lastDoc,
    hasMore: result.hasMore,
    fetchedAt: Date.now()
  })
}

export function getCachedFullList(type, userId = '') {
  const key = type === 'myDreams' ? `myDreams:full:${userId}` : 'publicDreams:full'
  const entry = listCache.get(key)
  if (!entry || !entry.dreams || isStale(entry.fetchedAt, LIST_TTL_MS)) return null
  return entry.dreams
}

export function setCachedFullList(type, dreams, userId = '') {
  const key = type === 'myDreams' ? `myDreams:full:${userId}` : 'publicDreams:full'
  listCache.set(key, { dreams, fetchedAt: Date.now() })
  dreams.forEach(d => setCachedDream(d.id, d))
}
