import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import useFavorites from '../hooks/useFavorites'
import DreamCard from '../components/DreamCard'

const mockUser = { uid: 'test-user-id', email: 'test@example.com' }

vi.mock('../contexts/FirebaseAuthContext', () => ({
  useFirebaseAuth: () => ({
    user: mockUser,
    isAuthenticated: true
  })
}))

const mockGetFavorites = vi.fn()
const mockCreateFavorite = vi.fn()
const mockDeleteFavorite = vi.fn()

vi.mock('../services/firebaseService', () => ({
  getFavorites: (...args) => mockGetFavorites(...args),
  createFavorite: (...args) => mockCreateFavorite(...args),
  deleteFavorite: (...args) => mockDeleteFavorite(...args),
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn()
}))

function FavoritesProbe() {
  const { favorites, loading, error, toggleFavorite } = useFavorites()
  if (loading) return <div data-testid="loading">Loading...</div>
  if (error) return <div data-testid="error">{error}</div>
  return (
    <div>
      <div data-testid="count">{favorites.length}</div>
      <button type="button" data-testid="toggle" onClick={() => toggleFavorite('dream-1')}>
        toggle
      </button>
    </div>
  )
}

const wrapper = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>)

describe('Favorites (Firebase)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetFavorites.mockResolvedValue([])
  })

  it('loads favorites for authenticated user', async () => {
    mockGetFavorites.mockResolvedValueOnce([{ id: 'f1', dreamId: 'dream-1' }])
    wrapper(<FavoritesProbe />)
    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('1')
    })
  })

  it('toggleFavorite adds a favorite when none exists', async () => {
    mockGetFavorites.mockResolvedValue([])
    mockCreateFavorite.mockResolvedValue({ id: 'new-f', dreamId: 'dream-1' })
    wrapper(<FavoritesProbe />)
    await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument())
    fireEvent.click(screen.getByTestId('toggle'))
    await waitFor(() => {
      expect(mockCreateFavorite).toHaveBeenCalledWith({ dreamId: 'dream-1' })
    })
  })

  it('toggleFavorite removes when favorite exists', async () => {
    mockGetFavorites.mockResolvedValue([{ id: 'f1', dreamId: 'dream-1' }])
    mockDeleteFavorite.mockResolvedValue(undefined)
    wrapper(<FavoritesProbe />)
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'))
    fireEvent.click(screen.getByTestId('toggle'))
    await waitFor(() => {
      expect(mockDeleteFavorite).toHaveBeenCalledWith('f1')
    })
  })
})

describe('DreamCard favorite control', () => {
  const dream = {
    id: 'dream-1',
    title: 'Test',
    description: 'x',
    date: new Date().toISOString(),
    isPublic: true,
    userId: 'other',
    user: { id: 'other', displayName: 'Other' }
  }

  it('shows favorite button when enabled', () => {
    render(
      <BrowserRouter>
        <DreamCard
          dream={dream}
          showFavoriteButton
          isFavorited={false}
          onFavoriteToggle={vi.fn()}
        />
      </BrowserRouter>
    )
    expect(screen.getByRole('button', { name: 'Add to favorites' })).toBeInTheDocument()
  })
})
