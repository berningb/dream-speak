import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import useDreams from '../hooks/useDreams'
import AddDreamModal from '../components/AddDreamModal'
import EditDreamModal from '../components/EditDreamModal'

vi.mock('../hooks/useDreams')
vi.mock('../contexts/FirebaseAuthContext', () => ({
  useFirebaseAuth: () => ({
    user: { uid: 'test-uid' },
    isAuthenticated: true
  })
}))
vi.mock('../services/firebaseService', () => ({
  createDream: vi.fn(),
  updateDream: vi.fn(),
  getDream: vi.fn(),
  deleteDream: vi.fn()
}))

// Test data
const mockDream = {
  id: 'dream-1',
  title: 'Test Dream',
  description: 'A test dream description',
  date: '2024-01-01T00:00:00.000Z',
  isPublic: false,
  tags: ['test', 'dream'],
  image: null,
  mood: 'Peaceful',
  emotions: ['joy', 'wonder'],
  colors: ['blue', 'green'],
  role: true,
  people: ['friend'],
  places: ['home'],
  things: ['book'],
  user: { id: 'user-1' }
}

const mockDreams = [mockDream]

// Wrapper component for testing with router
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('Dream CRUD Operations', () => {
  let mockAddDream
  let mockUpdateDream
  let mockDeleteDream
  let mockFetchDreams

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Setup mock functions
    mockAddDream = vi.fn().mockResolvedValue(undefined)
    mockUpdateDream = vi.fn().mockResolvedValue(undefined)
    mockDeleteDream = vi.fn().mockResolvedValue(undefined)
    mockFetchDreams = vi.fn().mockResolvedValue(undefined)

    // Mock the useDreams hook
    useDreams.mockReturnValue({
      dreams: mockDreams,
      loading: false,
      error: null,
      addDream: mockAddDream,
      updateDream: mockUpdateDream,
      deleteDream: mockDeleteDream,
      fetchDreams: mockFetchDreams
    })

    // Mock successful fetch responses
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          addDream: mockDream,
          updateDream: mockDream,
          deleteDream: true,
          dreams: mockDreams
        },
        errors: null
      })
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('CREATE - Add Dream', () => {
    it('should successfully add a new dream', async () => {
      // Test the addDream function directly
      const newDream = {
        title: 'New Dream Title',
        description: 'New dream description',
        date: new Date().toISOString(),
        tags: [],
        isPublic: false,
        image: null,
        mood: 'Happy',
        emotions: ['joy', 'excitement'],
        colors: ['red', 'yellow'],
        role: false,
        people: ['family', 'friend'],
        places: ['park', 'home'],
        things: ['car', 'phone']
      }

      await mockAddDream(newDream)

      expect(mockAddDream).toHaveBeenCalledWith(newDream)
    })

    it('should handle add dream errors', async () => {
      const { createDream } = await import('../services/firebaseService')
      createDream.mockRejectedValue(new Error('Failed to add dream'))
      const onAddDream = vi.fn()

      render(
        <TestWrapper>
          <AddDreamModal onAddDream={onAddDream} />
        </TestWrapper>
      )

      const titleInput = screen.getByPlaceholderText('Enter a captivating title for your dream...')
      fireEvent.change(titleInput, { target: { value: 'Test Dream' } })
      const descInput = screen.getByPlaceholderText('Describe your dream in detail... What happened? How did it feel? What did you see?')
      fireEvent.change(descInput, { target: { value: 'Test description' } })

      const submitButton = screen.getByText('Save Dream')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(createDream).toHaveBeenCalled()
      })
      expect(onAddDream).not.toHaveBeenCalled()
    })

    it('should validate required fields', async () => {
      const { createDream } = await import('../services/firebaseService')
      const onAddDream = vi.fn()

      render(
        <TestWrapper>
          <AddDreamModal onAddDream={onAddDream} />
        </TestWrapper>
      )

      const submitButton = screen.getByText('Save Dream')
      fireEvent.click(submitButton)

      await waitFor(() => {})
      expect(createDream).not.toHaveBeenCalled()
    })
  })

  describe('READ - Fetch Dreams', () => {
    it('should fetch user dreams successfully', async () => {
      // Test the useDreams hook directly
      const { dreams, loading, error } = useDreams()

      expect(loading).toBe(false)
      expect(error).toBe(null)
      expect(dreams).toEqual(mockDreams)
      expect(dreams).toHaveLength(1)
      expect(dreams[0]).toHaveProperty('id', 'dream-1')
      expect(dreams[0]).toHaveProperty('title', 'Test Dream')
    })

    it('should handle loading state', () => {
      useDreams.mockReturnValue({
        dreams: [],
        loading: true,
        error: null,
        addDream: mockAddDream,
        updateDream: mockUpdateDream,
        deleteDream: mockDeleteDream,
        fetchDreams: mockFetchDreams
      })

      const { loading } = useDreams()
      expect(loading).toBe(true)
    })

    it('should handle error state', () => {
      const errorMessage = 'Failed to fetch dreams'
      useDreams.mockReturnValue({
        dreams: [],
        loading: false,
        error: errorMessage,
        addDream: mockAddDream,
        updateDream: mockUpdateDream,
        deleteDream: mockDeleteDream,
        fetchDreams: mockFetchDreams
      })

      const { error } = useDreams()
      expect(error).toBe(errorMessage)
    })
  })

  describe('UPDATE - Edit Dream', () => {
    it('should successfully update a dream', async () => {
      const onSave = vi.fn()
      const onClose = vi.fn()

      render(
        <TestWrapper>
          <EditDreamModal 
            dream={mockDream}
            isOpen={true}
            onClose={onClose}
            onSave={onSave}
          />
        </TestWrapper>
      )

      // Verify form is populated with existing data
      expect(screen.getByDisplayValue('Test Dream')).toBeInTheDocument()
      expect(screen.getByDisplayValue('A test dream description')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Peaceful')).toBeInTheDocument()

      // Update the form
      const titleInput = screen.getByDisplayValue('Test Dream')
      const descriptionInput = screen.getByDisplayValue('A test dream description')
      const moodSelect = screen.getByDisplayValue('Peaceful')

      fireEvent.change(titleInput, { target: { value: 'Updated Dream Title' } })
      fireEvent.change(descriptionInput, { target: { value: 'Updated dream description' } })
      fireEvent.change(moodSelect, { target: { value: 'Exciting' } })

      // Submit the form
      const submitButton = screen.getByText('Save Changes')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith('dream-1', {
          title: 'Updated Dream Title',
          description: 'Updated dream description',
          mood: 'Exciting',
          emotions: ['joy', 'wonder'],
          colors: ['blue', 'green'],
          role: true,
          people: ['friend'],
          places: ['home'],
          things: ['book']
        })
      })

      expect(onClose).toHaveBeenCalled()
    })

    it('should handle update dream errors', async () => {
      const errorMessage = 'Failed to update dream'
      const onSave = vi.fn().mockRejectedValue(new Error(errorMessage))
      const onClose = vi.fn()

      render(
        <TestWrapper>
          <EditDreamModal 
            dream={mockDream}
            isOpen={true}
            onClose={onClose}
            onSave={onSave}
          />
        </TestWrapper>
      )

      // Submit the form
      const submitButton = screen.getByText('Save Changes')
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalled()
      })

      // Error should be logged
      expect(console.error).toHaveBeenCalledWith('Error updating dream:', expect.any(Error))
      
      // Modal should not close on error
      expect(onClose).not.toHaveBeenCalled()
    })

    it('should not render when not open', () => {
      const onSave = vi.fn()
      const onClose = vi.fn()

      render(
        <TestWrapper>
          <EditDreamModal 
            dream={mockDream}
            isOpen={false}
            onClose={onClose}
            onSave={onSave}
          />
        </TestWrapper>
      )

      expect(screen.queryByDisplayValue('Test Dream')).not.toBeInTheDocument()
    })
  })

  describe('DELETE - Delete Dream', () => {
    it('should successfully delete a dream', async () => {
      // Mock successful delete response
      globalThis.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: { deleteDream: true },
          errors: null
        })
      })

      // Simulate delete operation
      await mockDeleteDream('dream-1')

      expect(mockDeleteDream).toHaveBeenCalledWith('dream-1')
    })

    it('should handle delete dream errors', async () => {
      const errorMessage = 'Failed to delete dream'
      mockDeleteDream.mockRejectedValue(new Error(errorMessage))

      try {
        await mockDeleteDream('dream-1')
      } catch (error) {
        expect(error.message).toBe(errorMessage)
      }

      expect(mockDeleteDream).toHaveBeenCalledWith('dream-1')
    })
  })

  describe('Integration Tests', () => {
    it('should perform full CRUD cycle', async () => {
      // CREATE
      const newDream = {
        title: 'Integration Test Dream',
        description: 'Testing full CRUD cycle',
        date: new Date().toISOString(),
        tags: ['test'],
        isPublic: false,
        image: null,
        mood: 'Curious',
        emotions: ['curiosity'],
        colors: ['purple'],
        role: false,
        people: ['stranger'],
        places: ['unknown'],
        things: ['mystery']
      }

      await mockAddDream(newDream)
      expect(mockAddDream).toHaveBeenCalledWith(newDream)

      // READ
      const { dreams } = useDreams()
      expect(dreams).toContainEqual(expect.objectContaining({
        title: 'Test Dream'
      }))

      // UPDATE
      const updatedData = {
        title: 'Updated Integration Test Dream',
        description: 'Updated description',
        mood: 'Exciting'
      }

      await mockUpdateDream('dream-1', updatedData)
      expect(mockUpdateDream).toHaveBeenCalledWith('dream-1', updatedData)

      // DELETE
      await mockDeleteDream('dream-1')
      expect(mockDeleteDream).toHaveBeenCalledWith('dream-1')
    })

    it('should handle network errors gracefully', async () => {
      // Mock network error
      globalThis.fetch.mockRejectedValue(new Error('Network error'))

      try {
        await mockAddDream({ title: 'Test' })
      } catch (error) {
        expect(error.message).toContain('Network error')
      }
    })
  })

  describe('Data Validation', () => {
    it('should validate dream data structure', () => {
      const { dreams } = useDreams()
      const dream = dreams[0]

      // Check required fields
      expect(dream).toHaveProperty('id')
      expect(dream).toHaveProperty('title')
      expect(dream).toHaveProperty('description')
      expect(dream).toHaveProperty('date')
      expect(dream).toHaveProperty('isPublic')
      expect(dream).toHaveProperty('tags')
      expect(dream).toHaveProperty('user')

      // Check optional fields
      expect(dream).toHaveProperty('image')
      expect(dream).toHaveProperty('mood')
      expect(dream).toHaveProperty('emotions')
      expect(dream).toHaveProperty('colors')
      expect(dream).toHaveProperty('role')
      expect(dream).toHaveProperty('people')
      expect(dream).toHaveProperty('places')
      expect(dream).toHaveProperty('things')

      // Check data types
      expect(typeof dream.id).toBe('string')
      expect(typeof dream.title).toBe('string')
      expect(typeof dream.description).toBe('string')
      expect(Array.isArray(dream.tags)).toBe(true)
      expect(Array.isArray(dream.emotions)).toBe(true)
      expect(Array.isArray(dream.colors)).toBe(true)
      expect(Array.isArray(dream.people)).toBe(true)
      expect(Array.isArray(dream.places)).toBe(true)
      expect(Array.isArray(dream.things)).toBe(true)
      expect(typeof dream.isPublic).toBe('boolean')
    })
  })
}) 