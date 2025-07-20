import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Layout from '../../components/Layout'
import DreamCard from '../../components/DreamCard'
import Comments from '../../components/Comments'
import useDatabaseFavorites from '../../hooks/useDatabaseFavorites'
import { getApiUrl } from '../../utils'

export default function Explore() {
  const [dreams, setDreams] = useState([])
  const [filteredDreams, setFilteredDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [selectedDreamId, setSelectedDreamId] = useState(null)
  const { getIdTokenClaims, isAuthenticated, loginWithRedirect } = useAuth0()
  const { isFavorited, toggleFavorite } = useDatabaseFavorites()



  // Get unique moods and tags from dreams
  const moods = [...new Set(dreams.map(dream => dream.mood).filter(Boolean))]
  const allTags = [...new Set(dreams.flatMap(dream => dream.tags || []))]

  useEffect(() => {
    const fetchDreams = async () => {
      try {
        setLoading(true)
        
        // For non-authenticated users, we'll need to create a public endpoint or modify the backend
        // For now, let's try to fetch without authentication
        const headers = {
          'Content-Type': 'application/json'
        }
        
        // Add authorization header only if user is authenticated
        if (isAuthenticated) {
          const token = await getIdTokenClaims()
          if (token && token.__raw) {
            headers['Authorization'] = `Bearer ${token.__raw}`
          }
        }
        
        const apiUrl = getApiUrl()
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: `
              query {
                allDreams {
                  id
                  title
                  description
                  date
                  image
                  isPublic
                  tags
                  mood
                  emotions
                  colors
                  user {
                    id
                    email
                    firstName
                    lastName
                  }
                }
              }
            `
          })
        })

        const data = await response.json()
        
        if (data.errors) {
          throw new Error(data.errors[0].message)
        }

        if (!data.data || !data.data.allDreams) {
          throw new Error('No dreams data received from server')
        }

        // Filter to only show public dreams
        const publicDreams = data.data.allDreams.filter(dream => dream.isPublic)
        setDreams(publicDreams)
        setFilteredDreams(publicDreams)
      } catch (err) {
        console.error('Error fetching dreams:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDreams()
  }, []) // Only fetch once on component mount since we're getting public dreams

  // Filter dreams based on search criteria
  useEffect(() => {
    let filtered = dreams

    if (searchTerm) {
      filtered = filtered.filter(dream => 
        dream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dream.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dream.tags && dream.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    }

    if (selectedMood) {
      filtered = filtered.filter(dream => dream.mood === selectedMood)
    }

    if (selectedTag) {
      filtered = filtered.filter(dream => 
        dream.tags && dream.tags.includes(selectedTag)
      )
    }

    setFilteredDreams(filtered)
  }, [dreams, searchTerm, selectedMood, selectedTag])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedMood('')
    setSelectedTag('')
  }

  const handleFavoriteToggle = (dreamId) => {
    if (!isAuthenticated) {
      loginWithRedirect()
      return
    }
    toggleFavorite(dreamId)
  }

  const handleCommentClick = (dreamId) => {
    if (!isAuthenticated) {
      loginWithRedirect()
      return
    }
    setSelectedDreamId(dreamId)
    setCommentsOpen(true)
  }

  if (loading) {
    return (
      <Layout>
        <div className='flex flex-col items-center justify-start h-screen'>
          <h1 className='text-4xl font-bold text-center py-6'>Explore Dreams</h1>
          <div className='max-w-6xl mx-auto px-4 w-full'>
            <div className='flex justify-center items-center h-64'>
              <span className='loading loading-spinner loading-lg'></span>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className='flex flex-col items-center justify-start h-screen'>
          <h1 className='text-4xl font-bold text-center py-6'>Explore Dreams</h1>
          <div className='max-w-6xl mx-auto px-4 w-full'>
            <div className='alert alert-error'>
              <span>Error loading dreams: {error}</span>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className='flex flex-col items-center justify-start min-h-screen'>
        <h1 className='text-4xl font-bold text-center py-6'>Explore Dreams</h1>
        <div className='max-w-6xl mx-auto px-4 w-full'>
          
          {/* Sign-up prompt for non-authenticated users */}
          {!isAuthenticated && (
            <div className='bg-info text-info-content p-6 rounded-lg mb-6 text-center'>
              <div className='flex flex-col items-center'>
                <div className='mb-4'>
                  <span className='font-semibold text-lg'>👋 Welcome to DreamSpeak!</span>
                  <p className='text-base mt-2'>You can browse and read dreams. Sign up to favorite, comment, and share your own dreams!</p>
                </div>
                <button 
                  className='btn btn-primary btn-lg w-full max-w-xs'
                  onClick={() => loginWithRedirect()}
                >
                  Sign Up / Log In
                </button>
              </div>
            </div>
          )}
          
          {/* Search and Filter Section */}
          <div className='card bg-base-100 shadow-xl border border-base-300 mb-8'>
            <div className='card-body'>
              <div className='text-center mb-6'>
                <h2 className='card-title text-2xl justify-center mb-2'>🔍 Discover Dreams</h2>
                <p className='text-base-content/70'>Search and filter through the dream community</p>
              </div>
              
              <div className='space-y-6'>
                <div>
                  <label className='label'>
                    <span className='label-text font-semibold text-lg'>✨ Search Dreams</span>
                  </label>
                  <input 
                    type='text' 
                    className='input input-bordered w-full' 
                    placeholder='Search by title, content, or tags...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label className='label'>
                      <span className='label-text font-medium'>😊 Mood</span>
                    </label>
                    <select 
                      className='select select-bordered w-full'
                      value={selectedMood}
                      onChange={(e) => setSelectedMood(e.target.value)}
                    >
                      <option value=''>Any mood</option>
                      {moods.map(mood => (
                        <option key={mood} value={mood}>{mood}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className='label'>
                      <span className='label-text font-medium'>🏷️ Tags</span>
                    </label>
                    <select 
                      className='select select-bordered w-full'
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                    >
                      <option value=''>Any tags</option>
                      {allTags.slice(0, 20).map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className='label'>
                      <span className='label-text font-medium'>Actions</span>
                    </label>
                    <button 
                      className='btn btn-primary w-full'
                      onClick={clearFilters}
                    >
                      🗑️ Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results Section */}
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-2xl font-semibold text-slate-800'>Dream Results</h2>
              <span className='text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-sm font-medium'>
                {filteredDreams.length} dream{filteredDreams.length !== 1 ? 's' : ''} found
              </span>
            </div>

            
            {filteredDreams.length === 0 ? (
              <div className='text-center py-12 bg-slate-50 rounded-xl border border-slate-200'>
                <div className='text-6xl mb-4'>🌙</div>
                <p className='text-lg text-slate-700 mb-2'>No dreams match your search criteria.</p>
                <p className='text-slate-500'>Try adjusting your filters or search terms to discover more dreams.</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredDreams.map((dream) => (
                  <DreamCard 
                    key={dream.id} 
                    dream={dream} 
                    showAuthor={true}
                    showFavoriteButton={isAuthenticated}
                    isFavorited={isAuthenticated ? isFavorited(dream.id) : false}
                    onFavoriteToggle={handleFavoriteToggle}
                    showCommentButton={isAuthenticated}
                    onCommentClick={handleCommentClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Comments Modal - only show if authenticated */}
      {isAuthenticated && (
        <Comments 
          dreamId={selectedDreamId}
          isOpen={commentsOpen}
          onClose={() => {
            setCommentsOpen(false)
            setSelectedDreamId(null)
          }}
        />
      )}
    </Layout>
  )
} 