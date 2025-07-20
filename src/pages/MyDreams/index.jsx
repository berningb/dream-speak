import { IoAdd } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import useDreams from '../../hooks/useDreams'
import AddDreamModal from '../../components/AddDreamModal'
import DreamCard from '../../components/DreamCard'
import useFavorites from '../../hooks/useFavorites'
import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Comments from '../../components/Comments'

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

const DreamItem = ({ dream, isFavorited, onFavoriteToggle, likedByMe, likeCount, onLikeToggle, onCommentClick }) => {
  const navigate = useNavigate()
  return (
    <DreamCard 
      dream={dream} 
      showAuthor={false}
      showFavoriteButton={true}
      isFavorited={isFavorited}
      onFavoriteToggle={onFavoriteToggle}
      onClick={() => navigate(`/dream/${dream.id}`)}
      likedByMe={likedByMe}
      likeCount={likeCount}
      onLikeToggle={onLikeToggle}
      showCommentButton={true}
      onCommentClick={onCommentClick}
    />
  )
}

export default function MyDreams () {
  const { dreams, loading, error, fetchDreams } = useDreams()
  const { isFavorited, toggleFavorite } = useFavorites()
  const { getIdTokenClaims, isAuthenticated, loginWithRedirect } = useAuth0()
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [selectedDreamId, setSelectedDreamId] = useState(null)

  const handleLikeToggle = async (dreamId, likedByMe) => {
    if (!isAuthenticated) {
      loginWithRedirect()
      return
    }
    try {
      const token = await getIdTokenClaims()
      await fetch('https://localhost:4000/graphql', {
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
      await fetchDreams()
    } catch {
      // handle error
    }
  }

  const handleCommentClick = (dreamId) => {
    if (!isAuthenticated) {
      loginWithRedirect()
      return
    }
    setSelectedDreamId(dreamId)
    setCommentsOpen(true)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const handleAddDream = async () => {
    await fetchDreams() // Fetch dreams after adding a new one
    // Stay on the same page when adding from My Dreams
  }

  return (
    <Layout>
      <AddDreamModal onAddDream={handleAddDream} />
      <div className='flex flex-col items-center justify-start min-h-screen p-6'>
        <div className='w-full max-w-7xl'>
          <div className='flex flex-col items-center mb-8'>
            <h1 className='text-4xl font-bold text-center mb-6'>My Dreams</h1>
            <button
              className='btn btn-primary btn-lg flex items-center gap-2'
              onClick={() => document.getElementById('add_dream_modal').showModal()}
            >
              <IoAdd className='text-xl' />
              Add Dream
            </button>
          </div>
          {dreams.length === 0 ? (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4'>🌙</div>
              <h2 className='text-2xl font-semibold mb-2'>No dreams yet</h2>
              <p className='text-base-content/70 mb-6'>Start your dream journal by adding your first dream</p>
              <button
                className='btn btn-primary'
                onClick={() => document.getElementById('add_dream_modal').showModal()}
              >
                Log Your First Dream
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {dreams.map(dream => (
                <DreamItem 
                  key={dream.id} 
                  dream={dream} 
                  isFavorited={isFavorited(dream.id)}
                  onFavoriteToggle={toggleFavorite}
                  likedByMe={dream.likedByMe}
                  likeCount={dream.likeCount}
                  onLikeToggle={handleLikeToggle}
                  onCommentClick={handleCommentClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Comments Modal */}
      <Comments
        dreamId={selectedDreamId}
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </Layout>
  )
} 