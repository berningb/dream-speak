import { IoAdd } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import AddDreamModal from '../../components/AddDreamModal'
import DreamCard from '../../components/DreamCard'
import { useState, useEffect } from 'react'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { getMyDreams, createLike, deleteLike, createFavorite, getLikes } from '../../services/firebaseService'
import Comments from '../../components/Comments'

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
  const { isAuthenticated, loginWithGoogle, user } = useFirebaseAuth()
  const [dreams, setDreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [selectedDreamId, setSelectedDreamId] = useState(null)

  const fetchDreams = async () => {
    try {
      setLoading(true)
      const myDreams = await getMyDreams()
      setDreams(myDreams)
      setError(null)
    } catch (err) {
      setError('Failed to fetch dreams')
      console.error('Error fetching dreams:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchDreams()
    }
  }, [isAuthenticated])

  const handleLikeToggle = async (dreamId, likedByMe) => {
    try {
      if (likedByMe) {
        // Find the user's like record to get the correct ID
        const likes = await getLikes(dreamId);
        const userLike = likes.find(like => like.userId === user?.uid);
        if (userLike) {
          await deleteLike(userLike.id);
          console.log('✅ Dream unliked:', dreamId);
        }
      } else {
        await createLike({ dreamId });
        console.log('❤️ Dream liked:', dreamId);
      }
      // Refresh dreams to get updated like counts
      await fetchDreams();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  const handleFavoriteToggle = async (dreamId) => {
    try {
      // For now, just check if it's already favorited (we'd need to track this)
      // This is a simplified implementation
      await createFavorite({ dreamId });
      console.log('⭐ Dream favorited:', dreamId);
      await fetchDreams();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }

  const handleCommentClick = (dreamId) => {
    if (!isAuthenticated) {
      loginWithGoogle()
      return
    }
    setSelectedDreamId(dreamId)
    setCommentsOpen(true)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const handleAddDream = async () => {
    await fetchDreams() // Fetch dreams after adding a new one
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
              <IoAdd />
              Log New Dream
            </button>
          </div>

          {!isAuthenticated ? (
            <div className='text-center'>
              <p className='text-lg mb-4'>Please sign in to view your dreams</p>
              <button className='btn btn-primary' onClick={loginWithGoogle}>
                Sign In
              </button>
            </div>
          ) : dreams.length === 0 ? (
            <div className='text-center'>
              <p className='text-lg mb-4'>No dreams found. Start by logging your first dream!</p>
              <button
                className='btn btn-primary'
                onClick={() => document.getElementById('add_dream_modal').showModal()}
              >
                Log Your First Dream
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {dreams.map((dream) => (
                <DreamItem 
                  key={dream.id} 
                  dream={dream}
                  isFavorited={false} // TODO: Load actual favorite state
                  onFavoriteToggle={handleFavoriteToggle}
                  likedByMe={false} // TODO: Load actual like state
                  likeCount={0} // TODO: Load actual like count
                  onLikeToggle={handleLikeToggle}
                  onCommentClick={handleCommentClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comments Modal */}
      {commentsOpen && (
        <div className='modal modal-open'>
          <div className='modal-box'>
            <div className='modal-action'>
              <button 
                className='btn'
                onClick={() => setCommentsOpen(false)}
              >
                Close
              </button>
            </div>
            <Comments dreamId={selectedDreamId} />
          </div>
        </div>
      )}
    </Layout>
  )
} 