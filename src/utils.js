import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

/** Single dark brand theme (DaisyUI `night`). */
const APP_THEME = 'night'

export const initializeTheme = () => {
  document.documentElement.setAttribute('data-theme', APP_THEME)
  return APP_THEME
}

/** Parse Firestore Timestamp, ISO string, or other date inputs. */
export function parseToDayjs(input) {
  if (input == null) return null
  if (typeof input === 'object' && input.seconds != null) {
    return dayjs(input.seconds * 1000)
  }
  const d = dayjs(input)
  return d.isValid() ? d : null
}

/** Front-facing handle for a user: username if set, else firstName + lastName, else displayName, else email or 'Dreamer' */
export const getDisplayHandle = (user) => {
  if (!user) return 'Dreamer'
  if (user.username) return user.username
  if (user.firstName || user.lastName) return `${user.firstName || ''} ${user.lastName || ''}`.trim()
  if (user.displayName) return user.displayName
  if (user.email) return user.email
  return 'Dreamer'
}

export const formatDreamDate = (dateString) => {
  if (!dateString) return 'No date'

  const d = parseToDayjs(dateString) || dayjs(dateString)
  if (!d.isValid()) {
    return 'Invalid date'
  }

  if (d.isSame(dayjs(), 'day')) {
    return 'Today'
  }

  if (d.isSame(dayjs().subtract(1, 'day'), 'day')) {
    return 'Yesterday'
  }

  if (d.isAfter(dayjs().subtract(7, 'day'))) {
    return d.format('dddd')
  }

  return d.format('MMM D')
}

/** Weekday, day-of-month number, and full date line for dream card headers. */
export const getDreamCardDateParts = (dateString) => {
  if (!dateString) return null
  const m = parseToDayjs(dateString) || dayjs(dateString)
  if (!m.isValid()) return null
  return {
    weekdayShort: m.format('ddd'),
    weekdayLong: m.format('dddd'),
    dayOfMonth: m.format('D'),
    dateLine: m.format('MMMM D, YYYY')
  }
}

/** Local calendar day YYYY-MM-DD for a dream (prefers `date`, else `createdAt`). */
export const getDreamCalendarDayKey = (dream) => {
  const raw = dream.date || dream.createdAt
  if (!raw) return null
  const m = parseToDayjs(raw) || dayjs(raw)
  return m.isValid() ? m.format('YYYY-MM-DD') : null
}

export const formatFullDate = (dateString) => {
  if (!dateString) return 'No date'

  const d = parseToDayjs(dateString) || dayjs(dateString)
  if (!d.isValid()) {
    return 'Invalid date'
  }

  return d.format('MMMM D, YYYY')
}

// Function to get the dynamic API URL based on current protocol and hostname
export const getApiUrl = () => {
  // Use the same hostname as the current page, but port 4000 for the backend
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  return `${protocol}//${hostname}:4000/graphql`
}

/** Fallback when no profile image URL exists (file in `public/`). */
export const DEFAULT_AVATAR_PATH = '/default-avatar.svg'

/**
 * Resolve avatar URL: backend profile picture, then Firebase Auth photoURL.
 * Pass whichever of `user`, `backendUser`, `profileUser` apply.
 */
export const getAvatarSrc = ({ user, backendUser, profileUser } = {}) => {
  const raw =
    backendUser?.picture ||
    profileUser?.picture ||
    user?.photoURL ||
    ''
  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  return trimmed || DEFAULT_AVATAR_PATH
}

/** Google and many CDNs block hotlinked images without a relaxed referrer policy. */
export const avatarImgProps = (src) => {
  if (typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://'))) {
    return { referrerPolicy: 'no-referrer' }
  }
  return {}
}

/** Strict YYYY-MM-DD validation (for URL params and workflow seed dates). */
export const isValidCalendarDateKey = (value) =>
  typeof value === 'string' && dayjs(value, 'YYYY-MM-DD', true).isValid()
