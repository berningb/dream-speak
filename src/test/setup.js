import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    user: {
      sub: 'auth0|test-user-dreams',
      email: 'testuser@dreamspeak.com',
      name: 'Dream Explorer'
    },
    getIdTokenClaims: vi.fn().mockResolvedValue({
      __raw: 'dev-test-token'
    }),
    loginWithRedirect: vi.fn(),
    logout: vi.fn()
  }),
  Auth0Provider: ({ children }) => children
}))

// Mock fetch globally
globalThis.fetch = vi.fn()

// Mock console methods to reduce noise in tests
globalThis.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
} 