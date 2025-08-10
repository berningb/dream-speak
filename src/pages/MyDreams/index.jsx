import { IoAdd } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import AddDreamModal from '../../components/AddDreamModal'
import DreamCard from '../../components/DreamCard'
import { useState, useEffect } from 'react'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { getMyDreams, createLike, deleteLike, createFavorite, deleteFavorite, getLikes, getFavorites, deleteDream } from '../../services/firebaseService'
import Comments from '../../components/Comments'

const DreamItem = ({ dream, isFavorited, onFavoriteToggle, likedByMe, likeCount, onLikeToggle, onCommentClick, onEditClick, onDeleteClick }) => {
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
      showCommentButton={false}
      onCommentClick={onCommentClick}
      showEditButton={true}
      onEditClick={onEditClick}
      showDeleteButton={true}
      onDeleteClick={onDeleteClick}
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
  const [dreamStats, setDreamStats] = useState({}) // { dreamId: { likeCount, isLiked, isFavorited } }
  const [loadingStats, setLoadingStats] = useState(false)
  

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

  const loadDreamStats = async (dreamsList) => {
    if (!user) {
      console.log('❌ No user, skipping loadDreamStats')
      return
    }
    
    console.log('🔄 Loading dream stats for', dreamsList.length, 'dreams, user:', user.uid)
    setLoadingStats(true)
    
    try {
      const stats = {}
      const userFavorites = await getFavorites()
      console.log('📋 User favorites count:', userFavorites.length)
      
      // Load likes for all dreams in parallel for faster loading
      const likePromises = dreamsList.map(dream => 
        getLikes(dream.id).then(likes => ({ dreamId: dream.id, likes }))
      )
      
      const allLikes = await Promise.all(likePromises)
      
      for (const { dreamId, likes } of allLikes) {
        const userLike = likes.find(like => like.userId === user.uid)
        const userFavorite = userFavorites.find(fav => fav.dreamId === dreamId)
        
        stats[dreamId] = {
          likeCount: likes.length,
          isLiked: !!userLike,
          isFavorited: !!userFavorite
        }
        
        console.log(`📊 Dream ${dreamId}: ${likes.length} likes, user liked: ${!!userLike}, favorited: ${!!userFavorite}`)
      }
      
      console.log('✅ Final dream stats:', stats)
      setDreamStats(stats)
    } catch (error) {
      console.error('❌ Error loading dream stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchDreams()
    }
  }, [isAuthenticated])

  // Load dream stats when authentication changes or dreams are loaded
  useEffect(() => {
    if (isAuthenticated && user && dreams.length > 0) {
      console.log('🔄 Auth changed - loading dream stats for authenticated user:', user.uid)
      loadDreamStats(dreams)
    }
  }, [isAuthenticated, user, dreams.length])

  const handleLikeToggle = async (dreamId, likedByMe) => {
    if (!isAuthenticated) {
      await loginWithGoogle()
      return
    }

    console.log('🔄 Like toggle clicked:', { dreamId, likedByMe, user: user?.uid })

    // Update UI immediately for better UX
    setDreamStats(prev => ({
      ...prev,
      [dreamId]: {
        ...prev[dreamId],
        isLiked: !likedByMe,
        likeCount: likedByMe ? (prev[dreamId]?.likeCount || 1) - 1 : (prev[dreamId]?.likeCount || 0) + 1
      }
    }))

    try {
      if (likedByMe) {
        // Find the user's like record to get the correct ID
        const likes = await getLikes(dreamId);
        const userLike = likes.find(like => like.userId === user?.uid);
        if (userLike) {
          await deleteLike(userLike.id);
          console.log('✅ Dream unliked:', dreamId);
        } else {
          console.log('⚠️ No user like found to delete')
          // Revert UI change if delete failed
          setDreamStats(prev => ({
            ...prev,
            [dreamId]: {
              ...prev[dreamId],
              isLiked: likedByMe,
              likeCount: (prev[dreamId]?.likeCount || 0) + 1
            }
          }))
        }
      } else {
        await createLike({ dreamId });
        console.log('❤️ Dream liked:', dreamId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert UI change on error
      setDreamStats(prev => ({
        ...prev,
        [dreamId]: {
          ...prev[dreamId],
          isLiked: likedByMe,
          likeCount: likedByMe ? (prev[dreamId]?.likeCount || 0) + 1 : (prev[dreamId]?.likeCount || 1) - 1
        }
      }))
    }
  }

  const handleFavoriteToggle = async (dreamId) => {
    if (!isAuthenticated) {
      await loginWithGoogle()
      return
    }

    const currentlyFavorited = dreamStats[dreamId]?.isFavorited || false

    // Update UI immediately
    setDreamStats(prev => ({
      ...prev,
      [dreamId]: {
        ...prev[dreamId],
        isFavorited: !currentlyFavorited
      }
    }))

    try {
      if (currentlyFavorited) {
        // Unfavorite: find and delete the user's favorite record
        const userFavorites = await getFavorites()
        const userFavorite = userFavorites.find(fav => fav.dreamId === dreamId)
        if (userFavorite) {
          await deleteFavorite(userFavorite.id)
          console.log('✅ Dream unfavorited:', dreamId);
        }
      } else {
        // Only create favorite if user doesn't already have one for this dream
        const userFavorites = await getFavorites()
        const existingFavorite = userFavorites.find(fav => fav.dreamId === dreamId)
        
        if (!existingFavorite) {
          await createFavorite({ dreamId });
          console.log('⭐ Dream favorited:', dreamId);
        } else {
          console.log('⚠️ Dream already favorited, skipping');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert UI change on error
      setDreamStats(prev => ({
        ...prev,
        [dreamId]: {
          ...prev[dreamId],
          isFavorited: currentlyFavorited
        }
      }))
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

  const handleEditDream = (dream) => {
    // Navigate to edit page or open edit modal
    // For now, let's navigate to the dream page where they can edit
    window.location.href = `/dream/${dream.id}`
  }

  const handleDeleteDream = async (dreamId) => {
    if (!window.confirm('Are you sure you want to delete this dream? This action cannot be undone.')) {
      return
    }

    try {
      await deleteDream(dreamId)
      console.log('✅ Dream deleted:', dreamId)
      // Refresh dreams list
      await fetchDreams()
    } catch (error) {
      console.error('Error deleting dream:', error)
      alert('Failed to delete dream. Please try again.')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  // No inline add modal on this page; redirect to New Dream page instead

  return (
    <Layout>
      
      <div className='flex flex-col items-center justify-start min-h-screen p-6'>
        <div className='w-full max-w-7xl'>
          <div className='flex flex-col items-center mb-8'>
            <h1 className='text-4xl font-bold text-center mb-6'>My Dreams</h1>
            <button
              className='btn btn-primary btn-lg flex items-center gap-2'
              onClick={() => (window.location.href = '/new-dream')}
            >
              New Dream
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
                onClick={() => (window.location.href = '/new-dream')}
              >
                Log Your First Dream
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {dreams.map((dream) => {
                const stats = dreamStats[dream.id] || { likeCount: 0, isLiked: false, isFavorited: false }
                const hasStats = dreamStats[dream.id] !== undefined
                
                return (
                  <DreamItem 
                    key={dream.id} 
                    dream={dream}
                    isFavorited={hasStats ? stats.isFavorited : false}
                    onFavoriteToggle={handleFavoriteToggle}
                    likedByMe={hasStats ? stats.isLiked : false}
                    likeCount={hasStats ? stats.likeCount : (loadingStats ? '...' : 0)}
                    onLikeToggle={handleLikeToggle}
                    onCommentClick={handleCommentClick}
                    onEditClick={handleEditDream}
                    onDeleteClick={handleDeleteDream}
                  />
                )
              })}
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