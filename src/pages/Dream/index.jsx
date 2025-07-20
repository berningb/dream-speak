import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IoArrowBack, IoPencil, IoTrash } from 'react-icons/io5'
import Layout from '../../components/Layout'
import useDreams from '../../hooks/useDreams'
import EditDreamModal from '../../components/EditDreamModal'
import { formatFullDate } from '../../utils'
import Comments from '../../components/Comments'
import { useAuth0 } from '@auth0/auth0-react'

const DREAM_QUERY = `
  query Dream($id: ID!) {
    dream: allDreams {
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
      people
      places
      things
      user {
        id
        email
        firstName
        lastName
      }
      likeCount
      likedByMe
    }
  }
`

const LIKE_DREAM_MUTATION = `
  mutation LikeDream($dreamId: ID!) {
    likeDream(dreamId: $dreamId)
  }
`

const UNLIKE_DREAM_MUTATION = `
  mutation UnlikeDream($dreamId: ID!) {
    unlikeDream(dreamId: $dreamId)
  }
`

export default function Dream() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loading, error, updateDream, deleteDream } = useDreams()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { getIdTokenClaims, isAuthenticated, loginWithRedirect } = useAuth0()
  const [dreamData, setDreamData] = useState(null)
  const [likeLoading, setLikeLoading] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)

  useEffect(() => {
    const fetchDream = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' }
        if (isAuthenticated) {
          const token = await getIdTokenClaims()
          if (token && token.__raw) {
            headers['Authorization'] = `Bearer ${token.__raw}`
          }
        }
        const response = await fetch('https://localhost:4000/graphql', {
          method: 'POST',
          headers,
          body: JSON.stringify({ query: DREAM_QUERY })
        })
        const data = await response.json()
        if (data.errors) throw new Error(data.errors[0].message)
        // Find the dream by id
        const found = data.data.dream.find(d => d.id === id)
        setDreamData(found)
      } catch {
        setDreamData(null)
      }
    }
    fetchDream()
  }, [id, isAuthenticated, getIdTokenClaims])

  const handleEditDream = async (dreamId, updatedData) => {
    try {
      await updateDream(dreamId, updatedData)
    } catch (error) {
      console.error('Error updating dream:', error)
      throw error
    }
  }

  const handleDeleteDream = async () => {
    try {
      await deleteDream(dreamData.id)
      navigate('/my-dreams')
    } catch (error) {
      console.error('Error deleting dream:', error)
    }
  }

  const handleLikeToggle = async (dreamId, likedByMe) => {
    if (!isAuthenticated) {
      loginWithRedirect()
      return
    }
    setLikeLoading(true)
    try {
      const token = await getIdTokenClaims()
      const response = await fetch('https://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.__raw}`
        },
        body: JSON.stringify({
          query: likedByMe ? UNLIKE_DREAM_MUTATION : LIKE_DREAM_MUTATION,
          variables: { dreamId }
        })
      })
      const { errors } = await response.json()
      if (errors) throw new Error(errors[0].message)
      // Refresh dream data
      const fetchDream = async () => {
        try {
          const headers = { 'Content-Type': 'application/json' }
          if (isAuthenticated) {
            const token = await getIdTokenClaims()
            if (token && token.__raw) {
              headers['Authorization'] = `Bearer ${token.__raw}`
            }
          }
          const response = await fetch('https://localhost:4000/graphql', {
            method: 'POST',
            headers,
            body: JSON.stringify({ query: DREAM_QUERY })
          })
          const data = await response.json()
          if (data.errors) throw new Error(data.errors[0].message)
          const found = data.data.dream.find(d => d.id === id)
          setDreamData(found)
        } catch {/* ignore */}
      }
      fetchDream()
    } finally {
      setLikeLoading(false)
    }
  }
  
  if (loading) return (
    <Layout>
      <div className='flex items-center justify-center min-h-screen'>
        <div className='loading loading-spinner loading-lg'></div>
      </div>
    </Layout>
  )
  
  if (error) return (
    <Layout>
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>❌</div>
          <h2 className='text-2xl font-semibold mb-2'>Error Loading Dream</h2>
          <p className='text-base-content/70'>{error}</p>
        </div>
      </div>
    </Layout>
  )
  
  if (!dreamData) return (
    <Layout>
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>🔍</div>
          <h2 className='text-2xl font-semibold mb-2'>Dream Not Found</h2>
          <p className='text-base-content/70 mb-6'>The dream you&apos;re looking for doesn&apos;t exist</p>
          <button className='btn btn-primary' onClick={() => navigate('/my-dreams')}>
            Back to My Dreams
          </button>
        </div>
      </div>
    </Layout>
  )

  // Use dreamData instead of dream for rendering
  const dream = dreamData

  return (
    <Layout>
      <div className='min-h-screen p-6'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <button 
              className='btn btn-ghost btn-sm flex items-center gap-2'
              onClick={() => navigate('/my-dreams')}
            >
              <IoArrowBack />
              Back to Dreams
            </button>
            
            <div className='flex gap-2'>
              <button 
                className='btn btn-outline btn-sm flex items-center gap-2'
                onClick={() => setIsEditModalOpen(true)}
              >
                <IoPencil />
                Edit
              </button>
              <button 
                className='btn btn-error btn-sm flex items-center gap-2'
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <IoTrash />
                Delete
              </button>
            </div>
          </div>

          {/* Dream Content */}
          <div className='bg-base-200 rounded-lg p-8 shadow-lg'>
            <div className='mb-8'>
              <h1 className='text-4xl font-bold mb-4 text-primary'>{dream.title}</h1>
              
              <div className='flex flex-wrap gap-4 mb-6 items-center'>
                {/* Like button and count */}
                <button
                  type="button"
                  className={`btn btn-sm btn-circle transition-all ${
                    dream.likedByMe
                      ? 'btn-error bg-red-500 hover:bg-red-600 text-white shadow-lg scale-110'
                      : 'btn-ghost bg-white/80 hover:bg-red-100 hover:scale-105'
                  }`}
                  onClick={() => handleLikeToggle(dream.id, dream.likedByMe)}
                  disabled={likeLoading}
                  title={dream.likedByMe ? 'Unlike' : 'Like'}
                >
                  {dream.likedByMe ? '❤️' : '🤍'}
                </button>
                <span className='ml-1 text-base text-base-content/60 select-none'>{dream.likeCount}</span>
                {/* Existing mood/role badges */}
                {dream.mood && (
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-base-content/70'>Mood:</span>
                    <span className='badge badge-primary badge-lg'>{dream.mood}</span>
                  </div>
                )}
                
                {dream.role !== undefined && (
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-base-content/70'>Role:</span>
                    <span className={`badge badge-lg ${dream.role ? 'badge-secondary' : 'badge-outline'}`}>
                      {dream.role ? 'Main character' : 'Supporting character'}
                    </span>
                  </div>
                )}
                {/* Comments button */}
                <button
                  type="button"
                  className='btn btn-sm btn-circle btn-ghost bg-white/80 hover:bg-blue-100 transition-all ml-2'
                  onClick={() => setCommentsOpen(true)}
                  title='View comments'
                >
                  💬
                </button>
              </div>
            </div>

            {/* Dream Details */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {/* Left Column */}
              <div className='space-y-6'>
                {dream.emotions && dream.emotions.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                      <span className='text-2xl'>😊</span>
                      Emotions
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {dream.emotions.map((emotion, index) => (
                        <span key={index} className='badge badge-accent badge-lg'>{emotion}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {dream.colors && dream.colors.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                      <span className='text-2xl'>🎨</span>
                      Colors
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {dream.colors.map((color, index) => (
                        <span key={index} className='badge badge-outline badge-lg'>{color}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className='space-y-6'>
                {dream.people && dream.people.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                      <span className='text-2xl'>👥</span>
                      People
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {dream.people.map((person, index) => (
                        <span key={index} className='badge badge-info badge-lg'>{person}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {dream.places && dream.places.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                      <span className='text-2xl'>🏛️</span>
                      Places
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {dream.places.map((place, index) => (
                        <span key={index} className='badge badge-success badge-lg'>{place}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {dream.things && dream.things.length > 0 && (
                  <div>
                    <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                      <span className='text-2xl'>🔮</span>
                      Things
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {dream.things.map((thing, index) => (
                        <span key={index} className='badge badge-warning badge-lg'>{thing}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dream Description */}
            {dream.description && (
              <div className='mt-8 pt-8 border-t border-base-300'>
                <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                  <span className='text-2xl'>📝</span>
                  Dream Description
                </h3>
                <div className='bg-base-100 rounded-lg p-6'>
                  <p className='text-base leading-relaxed'>{dream.description}</p>
                </div>
              </div>
            )}

            {/* Dream Date */}
            {dream.createdAt && (
              <div className='mt-6 text-center'>
                <span className='text-sm text-base-content/50'>
                  Dream recorded on {formatFullDate(dream.createdAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <EditDreamModal
        dream={dream}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditDream}
      />

      {/* Delete Confirmation Modal */}
      <dialog id="delete_dream_modal" className={`modal ${isDeleteModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Delete Dream</h3>
          <p className="mb-6">Are you sure you want to delete &quot;{dream?.title}&quot;? This action cannot be undone.</p>
          <div className="modal-action">
            <button 
              className="btn btn-outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-error" 
              onClick={handleDeleteDream}
            >
              Delete Dream
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsDeleteModalOpen(false)}>close</button>
        </form>
      </dialog>
      {/* Comments Modal */}
      <Comments
        dreamId={dream.id}
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </Layout>
  )
} 