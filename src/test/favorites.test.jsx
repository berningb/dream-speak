import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import { vi } from 'vitest'
import useFavorites from '../hooks/useFavorites'
import DreamCard from '../components/DreamCard'
import Explore from '../pages/Explore'
import MyDreams from '../pages/MyDreams'

// Mock Auth0
const mockUser = {
  sub: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://example.com/avatar.jpg'
}

const mockDream = {
  id: 'dream-1',
  title: 'Test Dream',
  description: 'A test dream description',
  date: new Date().toISOString(),
  mood: 'Happy',
  tags: ['test', 'dream'],
  isPublic: true,
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  }
}

// Mock fetch for GraphQL
globalThis.fetch = vi.fn()

// Test wrapper component
const TestWrapper = ({ children }) => (
  <Auth0Provider
    domain="test-domain"
    clientId="test-client-id"
    authorizationParams={{ redirect_uri: window.location.origin }}
  >
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Auth0Provider>
)

// Mock useAuth0 hook
vi.mock('@auth0/auth0-react', async () => {
  const actual = await vi.importActual('@auth0/auth0-react')
  return {
    ...actual,
    useAuth0: () => ({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      getIdTokenClaims: vi.fn().mockResolvedValue({ __raw: 'mock-token' })
    })
  }
})

describe('Favorites System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful GraphQL responses
    globalThis.fetch.mockResolvedValue({
      json: () => Promise.resolve({
        data: {
          userFavorites: []
        }
      })
    })
  })

  describe('useFavorites Hook', () => {
    it('should initialize with empty favorites', async () => {
      const TestComponent = () => {
        const { isFavorited, loading } = useFavorites()
        if (loading) return <div data-testid="loading">Loading...</div>
        return <div data-testid="favorite-status">{isFavorited('dream-1').toString()}</div>
      }

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('favorite-status')).toHaveTextContent('false')
      })
    })

    it('should load favorites from API on mount', async () => {
      const mockFavorites = [
        { id: 'fav-1', dreamId: 'dream-1', dream: mockDream },
        { id: 'fav-2', dreamId: 'dream-2', dream: { ...mockDream, id: 'dream-2' } }
      ]

      global.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: {
            userFavorites: mockFavorites
          }
        })
      })

      const TestComponent = () => {
        const { isFavorited, loading } = useFavorites()
        if (loading) return <div data-testid="loading">Loading...</div>
        return (
          <div>
            <div data-testid="dream-1">{isFavorited('dream-1').toString()}</div>
            <div data-testid="dream-2">{isFavorited('dream-2').toString()}</div>
            <div data-testid="dream-3">{isFavorited('dream-3').toString()}</div>
          </div>
        )
      }

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('dream-1')).toHaveTextContent('true')
        expect(screen.getByTestId('dream-2')).toHaveTextContent('true')
        expect(screen.getByTestId('dream-3')).toHaveTextContent('false')
      })
    })

    it('should toggle favorite status via API', async () => {
      // Mock initial empty favorites
      global.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: {
            userFavorites: []
          }
        })
      })

      // Mock toggle response
      global.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: {
            toggleFavorite: true
          }
        })
      })

      // Mock refreshed favorites after toggle
      global.fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: {
            userFavorites: [{ id: 'fav-1', dreamId: 'dream-1', dream: mockDream }]
          }
        })
      })

      const TestComponent = () => {
        const { isFavorited, toggleFavorite, loading } = useFavorites()
        if (loading) return <div data-testid="loading">Loading...</div>
        return (
          <div>
            <div data-testid="favorite-status">{isFavorited('dream-1').toString()}</div>
            <button onClick={() => toggleFavorite('dream-1')} data-testid="toggle-btn">
              Toggle
            </button>
          </div>
        )
      }

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('favorite-status')).toHaveTextContent('false')
      })

      // Toggle to favorited
      fireEvent.click(screen.getByTestId('toggle-btn'))
      
      await waitFor(() => {
        expect(screen.getByTestId('favorite-status')).toHaveTextContent('true')
      })
    })

    it('should handle API errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API Error'))

      const TestComponent = () => {
        const { error, loading } = useFavorites()
        if (loading) return <div data-testid="loading">Loading...</div>
        return <div data-testid="error">{error || 'No error'}</div>
      }

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('API Error')
      })
    })
  })

  describe('DreamCard Favorite Button', () => {
    it('should show favorite button when showFavoriteButton is true', () => {
      render(
        <TestWrapper>
          <DreamCard 
            dream={mockDream}
            showFavoriteButton={true}
            isFavorited={false}
            onFavoriteToggle={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByTitle('Add to favorites')).toBeInTheDocument()
    })

    it('should hide favorite button when showFavoriteButton is false', () => {
      render(
        <TestWrapper>
          <DreamCard 
            dream={mockDream}
            showFavoriteButton={false}
            isFavorited={false}
            onFavoriteToggle={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.queryByTitle('Add to favorites')).not.toBeInTheDocument()
    })

    it('should call onFavoriteToggle when favorite button is clicked', () => {
      const mockToggle = vi.fn()

      render(
        <TestWrapper>
          <DreamCard 
            dream={mockDream}
            showFavoriteButton={true}
            isFavorited={false}
            onFavoriteToggle={mockToggle}
          />
        </TestWrapper>
      )

      fireEvent.click(screen.getByTitle('Add to favorites'))
      expect(mockToggle).toHaveBeenCalledWith('dream-1')
    })

    it('should show correct icon based on favorite status', () => {
      const { rerender } = render(
        <TestWrapper>
          <DreamCard 
            dream={mockDream}
            showFavoriteButton={true}
            isFavorited={false}
            onFavoriteToggle={vi.fn()}
          />
        </TestWrapper>
      )

      // Not favorited - should show outline heart
      expect(screen.getByTitle('Add to favorites')).toBeInTheDocument()

      // Favorited - should show filled heart
      rerender(
        <TestWrapper>
          <DreamCard 
            dream={mockDream}
            showFavoriteButton={true}
            isFavorited={true}
            onFavoriteToggle={vi.fn()}
          />
        </TestWrapper>
      )

      expect(screen.getByTitle('Remove from favorites')).toBeInTheDocument()
    })
  })

  describe('Explore Page Favorites', () => {
    it('should handle favorite toggling for authenticated users', async () => {
      // Mock successful API responses
      global.fetch.mockResolvedValue({
        json: () => Promise.resolve({
          data: {
            allDreams: [mockDream],
            userFavorites: []
          }
        })
      })

      render(
        <TestWrapper>
          <Explore />
        </TestWrapper>
      )

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Explore Dreams')).toBeInTheDocument()
      })
    })
  })

  describe('MyDreams Page Favorites', () => {
    it('should handle favorite toggling for user dreams', async () => {
      // Mock successful API responses
      global.fetch.mockResolvedValue({
        json: () => Promise.resolve({
          data: {
            dreams: [mockDream],
            userFavorites: []
          }
        })
      })

      render(
        <TestWrapper>
          <MyDreams />
        </TestWrapper>
      )

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('My Dreams')).toBeInTheDocument()
      })
    })
  })
}) 