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

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

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

// Mock fetch for GraphQL
global.fetch = vi.fn()

describe('Favorites System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
  })

  describe('useFavorites Hook', () => {
    it('should initialize with empty favorites', () => {
      const TestComponent = () => {
        const { isFavorited } = useFavorites()
        return <div data-testid="favorite-status">{isFavorited('dream-1').toString()}</div>
      }

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      expect(screen.getByTestId('favorite-status')).toHaveTextContent('false')
    })

    it('should load favorites from localStorage on mount', () => {
      const storedFavorites = ['dream-1', 'dream-2']
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedFavorites))

      const TestComponent = () => {
        const { isFavorited } = useFavorites()
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

      expect(screen.getByTestId('dream-1')).toHaveTextContent('true')
      expect(screen.getByTestId('dream-2')).toHaveTextContent('true')
      expect(screen.getByTestId('dream-3')).toHaveTextContent('false')
    })

    it('should toggle favorite status', async () => {
      const TestComponent = () => {
        const { isFavorited, toggleFavorite } = useFavorites()
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

      // Initially not favorited
      expect(screen.getByTestId('favorite-status')).toHaveTextContent('false')

      // Toggle to favorited
      fireEvent.click(screen.getByTestId('toggle-btn'))
      await waitFor(() => {
        expect(screen.getByTestId('favorite-status')).toHaveTextContent('true')
      })

      // Toggle back to not favorited
      fireEvent.click(screen.getByTestId('toggle-btn'))
      await waitFor(() => {
        expect(screen.getByTestId('favorite-status')).toHaveTextContent('false')
      })
    })

    it('should save favorites to localStorage', async () => {
      const TestComponent = () => {
        const { toggleFavorite } = useFavorites()
        return (
          <button onClick={() => toggleFavorite('dream-1')} data-testid="toggle-btn">
            Toggle
          </button>
        )
      }

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      fireEvent.click(screen.getByTestId('toggle-btn'))

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'favorites_test-user-id',
          JSON.stringify(['dream-1'])
        )
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

    it('should not show favorite button when showFavoriteButton is false', () => {
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

    it('should show filled star when favorited', () => {
      render(
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
      expect(screen.getByText('⭐')).toBeInTheDocument()
    })

    it('should show empty star when not favorited', () => {
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
      expect(screen.getByText('☆')).toBeInTheDocument()
    })

    it('should call onFavoriteToggle when clicked', () => {
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
  })

  describe('Explore Page Favorites', () => {
    beforeEach(() => {
      // Mock successful GraphQL response
      global.fetch.mockResolvedValue({
        json: () => Promise.resolve({
          data: {
            allDreams: [mockDream]
          }
        })
      })
    })

    it('should show favorite buttons on dream cards', async () => {
      render(
        <TestWrapper>
          <Explore />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTitle('Add to favorites')).toBeInTheDocument()
      })
    })

    it('should toggle favorites when star is clicked', async () => {
      render(
        <TestWrapper>
          <Explore />
        </TestWrapper>
      )

      await waitFor(() => {
        const favoriteBtn = screen.getByTitle('Add to favorites')
        fireEvent.click(favoriteBtn)
      })

      await waitFor(() => {
        expect(screen.getByTitle('Remove from favorites')).toBeInTheDocument()
      })
    })
  })

  describe('MyDreams Page Favorites', () => {
    beforeEach(() => {
      // Mock useDreams hook
      vi.mock('../hooks/useDreams', () => ({
        default: () => ({
          dreams: [mockDream],
          loading: false,
          error: null,
          fetchDreams: vi.fn()
        })
      }))
    })

    it('should show favorite buttons on user dreams', async () => {
      render(
        <TestWrapper>
          <MyDreams />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTitle('Add to favorites')).toBeInTheDocument()
      })
    })

    it('should allow favoriting own dreams', async () => {
      render(
        <TestWrapper>
          <MyDreams />
        </TestWrapper>
      )

      await waitFor(() => {
        const favoriteBtn = screen.getByTitle('Add to favorites')
        fireEvent.click(favoriteBtn)
      })

      await waitFor(() => {
        expect(screen.getByTitle('Remove from favorites')).toBeInTheDocument()
      })
    })
  })

  describe('Favorites Persistence', () => {
    it('should persist favorites across page refreshes', async () => {
      // Set up initial favorites in localStorage
      localStorageMock.getItem.mockReturnValue(JSON.stringify(['dream-1']))

      const TestComponent = () => {
        const { isFavorited } = useFavorites()
        return <div data-testid="status">{isFavorited('dream-1').toString()}</div>
      }

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('true')
      })
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const TestComponent = () => {
        const { isFavorited } = useFavorites()
        return <div data-testid="status">{isFavorited('dream-1').toString()}</div>
      }

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      // Should not crash and should default to false
      expect(screen.getByTestId('status')).toHaveTextContent('false')
    })
  })
}) 